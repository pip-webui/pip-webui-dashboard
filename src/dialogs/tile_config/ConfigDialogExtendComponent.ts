{    
    interface IWidgetConfigExtendComponentBindings {
        [key: string]: any;

        pipExtensionUrl: any;
        pipDialogScope: any;
        pipApply: any;
    }

    const WidgetConfigExtendComponentBindings: IWidgetConfigExtendComponentBindings = {
        pipExtensionUrl: '<',
        pipDialogScope: '<',
        pipApply: '&'
    }

    class WidgetConfigExtendComponentChanges implements ng.IOnChangesObject, IWidgetConfigExtendComponentBindings {
        [key: string]: ng.IChangesObject<any>;

        pipExtensionUrl: ng.IChangesObject<string>;
        pipDialogScope: ng.IChangesObject<ng.IScope>;

        pipApply: ng.IChangesObject<({updatedData: any}) => ng.IPromise<void>>;
    }

    interface IWidgetConfigExtendComponentAttributes extends ng.IAttributes {
        pipExtensionUrl: string
    }

    class WidgetConfigExtendComponentController implements IWidgetConfigExtendComponentBindings {
        public pipExtensionUrl: string;
        public pipDialogScope: ng.IScope;
        public pipApply: (param: {updatedData: any}) => ng.IPromise<void>;

        constructor(
            private $templateRequest: angular.ITemplateRequestService,
            private $compile: angular.ICompileService,
            private $scope: angular.IScope, 
            private $element: JQuery, 
            private $attrs: IWidgetConfigExtendComponentAttributes
        ) { }

        public $onChanges(changes: WidgetConfigExtendComponentChanges) {
            if (changes.pipDialogScope) {
                delete changes.pipDialogScope.currentValue['$scope'];
                angular.extend(this, changes.pipDialogScope.currentValue);
            }
            if (changes.pipExtensionUrl && changes.pipExtensionUrl.currentValue) {
                this.$templateRequest(changes.pipExtensionUrl.currentValue, false).then((html) => {
                    this.$element.find('pip-extension-point').replaceWith(this.$compile(html)(this.$scope));
                });
            }
        }

        public onApply() {
            this.pipApply({updatedData: this});
        }
    }

    const pipWidgetConfigComponent: ng.IComponentOptions = {
        templateUrl: 'dialogs/tile_config/ConfigDialogExtendComponent.html',
        controller: WidgetConfigExtendComponentController,
        bindings: WidgetConfigExtendComponentBindings
    }

    angular
        .module('pipWidgetConfigDialog')
        .component('pipWidgetConfigExtendComponent', pipWidgetConfigComponent);
}