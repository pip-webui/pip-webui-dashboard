'use strict';

export interface IAddComponentDialogService {
  show(groups, activeGroupIndex): any;
}

class AddComponentDialogService implements IAddComponentDialogService {
    public _mdDialog: angular.material.IDialogService;
    private _widgetList: any;

    public constructor(widgetList: any, $mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
        this._widgetList = widgetList;
    }

    public show(groups, activeGroupIndex) {
        return this._mdDialog
          .show({
            templateUrl     : 'dialogs/add_component/AddComponent.html',
            bindToController: true,
            controller      : 'pipAddDashboardComponentDialogController',
            controllerAs    : 'dialogCtrl',
            resolve: {
              groups: () => {
                return groups;
              },
              activeGroupIndex: () => {
                return activeGroupIndex;
              },
              widgetList: () => {
                return this._widgetList;
              }
           }
          });
      };
}

class AddComponentDialogProvider {
  private _service: AddComponentDialogService;
  private _widgetList: any = null;

  constructor() {
  }

  public configWidgetList = function (list) {
      this._widgetList = list;
  };

  public $get($mdDialog: angular.material.IDialogService) {
        "ngInject";

        if (this._service == null)
            this._service = new AddComponentDialogService(this._widgetList, $mdDialog);
        
        return this._service;
  }
}

angular
    .module('pipDashboard')
    .provider('pipAddComponentDialog', AddComponentDialogProvider);
