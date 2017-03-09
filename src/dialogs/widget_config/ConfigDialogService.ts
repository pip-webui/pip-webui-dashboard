import { WidgetConfigDialogController } from './ConfigDialogController';

export interface IWidgetConfigService {
    show(params: any, successCallback ? : (key) => void, cancelCallback ? : () => void): any;
}

(function () {
    'use strict';

    function setTranslations($injector: ng.auto.IInjectorService) {
        const pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
        if (pipTranslate) {
            ( < any > pipTranslate).setTranslations('en', {
                DASHBOARD_WIDGET_CONFIG_DIALOG_TITLE: 'Edit tile',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_SMALL: 'Small',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_WIDE: 'Wide',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_LARGE: 'Large'
            });
            ( < any > pipTranslate).setTranslations('ru', {
                DASHBOARD_WIDGET_CONFIG_DIALOG_TITLE: 'Изменить виджет',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_SMALL: 'Мален.',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_WIDE: 'Широкий',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_LARGE: 'Большой'
            });
        }
    }

    class WidgetConfigDialogService {
        public constructor(
            public $mdDialog: angular.material.IDialogService
        ) {}

        public show(params, successCallback ? : (key) => void, cancelCallback ? : () => void) {
            this.$mdDialog.show({
                    targetEvent: params.event,
                    templateUrl: params.templateUrl || 'dialogs/widget_config/ConfigDialog.html',
                    controller: WidgetConfigDialogController,
                    controllerAs: 'vm',
                    locals: {
                        params: params
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
        .module('pipWidgetConfigDialog')
        .config(setTranslations)
        .service('pipWidgetConfigDialogService', WidgetConfigDialogService);

})();