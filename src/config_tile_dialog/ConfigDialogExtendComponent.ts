{    
    interface ITileConfigExtendComponentBindings {
        [key: string]: any;

        pipExtensionUrl: any;
        pipDialogScope: any;
        pipApply: any;
    }

    const TileConfigExtendComponentBindings: ITileConfigExtendComponentBindings = {
        pipExtensionUrl: '<',
        pipDialogScope: '<',
        pipApply: '&'
    }

    class TileConfigExtendComponentChanges implements ng.IOnChangesObject, ITileConfigExtendComponentBindings {
        [key: string]: ng.IChangesObject<any>;

        pipExtensionUrl: ng.IChangesObject<string>;
        pipDialogScope: ng.IChangesObject<ng.IScope>;

        pipApply: ng.IChangesObject<({updatedData: any}) => ng.IPromise<void>>;
    }

    interface ITileConfigExtendComponentAttributes extends ng.IAttributes {
        pipExtensionUrl: string
    }

    class TileConfigExtendComponentController implements ITileConfigExtendComponentBindings {
        public pipExtensionUrl: string;
        public pipDialogScope: ng.IScope;
        public pipApply: (param: {updatedData: any}) => ng.IPromise<void>;

        constructor(
            private $templateRequest: angular.ITemplateRequestService,
            private $compile: angular.ICompileService,
            private $scope: angular.IScope, 
            private $element: JQuery, 
            private $attrs: ITileConfigExtendComponentAttributes
        ) { }

        public $onChanges(changes: TileConfigExtendComponentChanges) {
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

    const pipTileConfigComponent: ng.IComponentOptions = {
        templateUrl: 'config_tile_dialog/ConfigDialogExtendComponent.html',
        controller: TileConfigExtendComponentController,
        bindings: TileConfigExtendComponentBindings
    }

    angular
        .module('pipConfigDashboardTileDialog')
        .component('pipTileConfigExtendComponent', pipTileConfigComponent);
}