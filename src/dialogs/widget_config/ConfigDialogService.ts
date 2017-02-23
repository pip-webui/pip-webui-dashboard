export interface IWidgetConfigService {
    show(params: any, successCallback?: (key) => void, cancelCallback?: () => void): any;
}

class WidgetConfigDialogService {
  public _mdDialog: angular.material.IDialogService;
    public constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }
    public show(params, successCallback?: (key) => void, cancelCallback?: () => void) {
         this._mdDialog.show({
            targetEvent: params.event,
            templateUrl: params.templateUrl || 'dialogs/widget_config/ConfigDialog.html',
            controller: 'pipWidgetConfigDialogController',
            controllerAs: 'vm',
            locals: {params: params},
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


(() => {
  'use strict';

  angular
    .module('pipWidgetConfigDialog')
    .service('pipWidgetConfigDialogService', WidgetConfigDialogService);
  
})();
