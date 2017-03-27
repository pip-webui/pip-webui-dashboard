export interface ITileTemplateService {
    getTemplate(source, tpl ? , tileScope ? , strictCompile ? ): any;
    setImageMarginCSS($element, image): void;
} 

{
    class tileTemplateService implements ITileTemplateService {
        private _$interpolate: angular.IInterpolateService;
        private _$compile: angular.ICompileService;
        private _$templateRequest: angular.ITemplateRequestService;

        constructor(
            $interpolate: angular.IInterpolateService,
            $compile: angular.ICompileService,
            $templateRequest: angular.ITemplateRequestService
        ) {
            this._$interpolate = $interpolate;
            this._$compile = $compile;
            this._$templateRequest = $templateRequest;
        }

        public getTemplate(source, tpl ? , tileScope ? , strictCompile ? ): any {
            const {
                template,
                templateUrl,
                type
            } = source;
            let result;

            if (type) {
                const interpolated = tpl ? this._$interpolate(tpl)(source) : this._$interpolate(template)(source);
                return strictCompile == true ?
                    (tileScope ? this._$compile(interpolated)(tileScope) : this._$compile(interpolated)) :
                    interpolated;
            }

            if (template) {
                return tileScope ? this._$compile(template)(tileScope) : this._$compile(template);
            }

            if (templateUrl) {
                this._$templateRequest(templateUrl, false).then((html) => {
                    result = tileScope ? this._$compile(html)(tileScope) : this._$compile(html);
                });
            }

            return result;
        }

        public setImageMarginCSS($element, image) {
            let
                containerWidth = $element.width ? $element.width() : $element.clientWidth,
                containerHeight = $element.height ? $element.height() : $element.clientHeight,
                imageWidth = (image[0] ? image[0].naturalWidth : image.naturalWidth) || image.width,
                imageHeight = (image[0] ? image[0].naturalHeight : image.naturalWidth) || image.height,
                margin = 0,
                cssParams = {};

            if ((imageWidth / containerWidth) > (imageHeight / containerHeight)) {
                margin = -((imageWidth / imageHeight * containerHeight - containerWidth) / 2);
                cssParams['margin-left'] = '' + margin + 'px';
                cssParams['height'] = '' + containerHeight + 'px'; //'100%';
                cssParams['width'] = '' + imageWidth * containerHeight / imageHeight + 'px'; //'100%';
                cssParams['margin-top'] = '';
            } else {
                margin = -((imageHeight / imageWidth * containerWidth - containerHeight) / 2);
                cssParams['margin-top'] = '' + margin + 'px';
                cssParams['height'] = '' + imageHeight * containerWidth / imageWidth + 'px'; //'100%';
                cssParams['width'] = '' + containerWidth + 'px'; //'100%';
                cssParams['margin-left'] = '';
            }

            $(image).css(cssParams);
        }
    }

    // image load directive TODO: remove to pipImageUtils
    const ImageLoad = function ImageLoad($parse: ng.IParseService): ng.IDirective {
        return {
            restrict: 'A',
            link: function (scope: ng.IScope, element: JQuery, attrs: any) {
                const callback = $parse(attrs.pipImageLoad);

                element.bind('load', (event) => {
                    callback(scope, {
                        $event: event
                    });
                });
            }
        }
    }

    angular
        .module('pipDashboard')
        .service('pipTileTemplate', tileTemplateService)
        .directive('pipImageLoad', ImageLoad);
}