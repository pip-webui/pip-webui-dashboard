
(() => {
    'use strict';
    
    function pipWidgetConfigComponent(
        $templateRequest: angular.ITemplateRequestService,
        $compile: angular.ICompileService
    ) {
        return {
            restrict: 'E',
            templateUrl: 'dialogs/widget_config/ConfigDialogExtendComponent.html',
            scope: false,
            link: ($scope: angular.IScope, $element: any, $attrs: any) => {
                $templateRequest($attrs.pipExtensionUrl, false).then((html) => {
                    $element.find('pip-extension-point').replaceWith($compile(html)($scope));
                });
            }
        }
    }

    angular
        .module('pipWidgetConfigDialog')
        .directive('pipWidgetConfigExtendComponent', pipWidgetConfigComponent);

})();