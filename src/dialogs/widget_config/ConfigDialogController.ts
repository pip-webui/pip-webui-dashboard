'use strict';

class TileColors {
    static all: string[] = ['purple', 'green', 'gray', 'orange', 'blue'];
}

class TileSizes {
    static all: any = [
        {name: 'SMALL', id: '11'},
        {name: 'WIDE', id: '21'},
        {name: 'LARGE', id: '22'}
    ];
}

export class WidgetConfigDialogController {
    public dialogTitle: string = "Edit tile";
    public $mdDialog: angular.material.IDialogService;
    public transclude: any;
    public params: any;
    public colors: string[] = TileColors.all;
    public sizes: any = TileSizes.all;
    public sizeId: string = TileSizes.all[0].id;

    private _$element: any;
    private _$timeout: angular.ITimeoutService;

    constructor(
        params,
        $mdDialog: angular.material.IDialogService,
        $compile: angular.ICompileService,
        $timeout: angular.ITimeoutService,
        $injector,
        $scope: angular.IScope,
        $rootScope) {
        "ngInject";

        this.$mdDialog = $mdDialog;
        this._$timeout = $timeout;

        this.params = params;
        angular.extend(this, this.params);
        this.sizeId = '' + this.params.size.colSpan + this.params.size.rowSpan;
    }

    public onApply(): void {
        this['size'].sizeX = Number(this.sizeId.substr(0, 1));
        this['size'].sizeY = Number(this.sizeId.substr(1, 1));
        this.$mdDialog.hide(this);
    }

    public onCancel(): void {
        this.$mdDialog.cancel();
    }
}

angular
    .module('pipWidgetConfigDialog', ['ngMaterial'])
    .controller('pipWidgetConfigDialogController', WidgetConfigDialogController);

import './ConfigDialogService';
import './ConfigDialogExtendComponent';