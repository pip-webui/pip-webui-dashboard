import { TileConfigDialogController } from './ConfigDialogController';

export interface ITileConfigService {
    show(params: ITileConfigDialogOptions, successCallback ? : (key) => void, cancelCallback ? : () => void): any;
}

export interface ITileConfigDialogOptions extends angular.material.IDialogOptions {
    dialogClass?: string;
    extensionUrl?: string;
    event?: any;
}

{
    const setTranslations = function($injector: ng.auto.IInjectorService) {
        const pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
        if (pipTranslate) {
            ( < any > pipTranslate).setTranslations('en', {
                DASHBOARD_TILE_CONFIG_DIALOG_TITLE: 'Edit tile',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_SMALL: 'Small',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_WIDE: 'Wide',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_LARGE: 'Large'
            });
            ( < any > pipTranslate).setTranslations('ru', {
                DASHBOARD_TILE_CONFIG_DIALOG_TITLE: 'Изменить виджет',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_SMALL: 'Мален.',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_WIDE: 'Широкий',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_LARGE: 'Большой'
            });
        }
    }

    class TileConfigDialogService {
        public constructor(
            public $mdDialog: angular.material.IDialogService
        ) {}

        public show(params: ITileConfigDialogOptions, successCallback ? : (key) => void, cancelCallback ? : () => void) {
            this.$mdDialog.show({
                    targetEvent: params.event,
                    templateUrl: params.templateUrl || 'dialogs/tile_config/ConfigDialog.html',
                    controller: TileConfigDialogController,
                    bindToController: true,
                    controllerAs: 'vm',
                    locals: {
                        extensionUrl: params.extensionUrl,
                        params: params.locals
                    },
                    clickOutsideToClose: true
                })
                .then((key) => {
                    if (successCallback) {
                        successCallback(key);
                    }
                }, () => {
                    if (cancelCallback) {
                        cancelCallback();
                    }
                });
        }
    }

    angular
        .module('pipConfigDashboardTileDialog')
        .config(setTranslations)
        .service('pipTileConfigDialogService', TileConfigDialogService);
}