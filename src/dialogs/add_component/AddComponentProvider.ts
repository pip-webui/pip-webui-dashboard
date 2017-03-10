import {
  AddComponentDialogWidget,
  AddComponentDialogController
} from './AddComponentDialogController';

export interface IAddComponentDialogService {
  show(groups, activeGroupIndex): angular.IPromise < any > ;
}

export interface IAddComponentDialogprovider {
  configWidgetList(list: [AddComponentDialogWidget[]]): void;
}

(function () {
  'use strict';

  function setTranslations($injector: ng.auto.IInjectorService) {
    const pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
    if (pipTranslate) {
      (<any>pipTranslate).setTranslations('en', {
        DASHBOARD_ADD_COMPONENT_DIALOG_TITLE: 'Add component',
        DASHBOARD_ADD_COMPONENT_DIALOG_USE_HOT_KEYS: 'Use "Enter" or "+" buttons on keyboard to encrease and "Delete" or "-" to decrease tiles amount',
        DASHBOARD_ADD_COMPONENT_DIALOG_CREATE_NEW_GROUP: 'Create new group'
      });
      (<any>pipTranslate).setTranslations('ru', {
        DASHBOARD_ADD_COMPONENT_DIALOG_TITLE: 'Добавить компонент',
        DASHBOARD_ADD_COMPONENT_DIALOG_USE_HOT_KEYS: 'Используйте "Enter" или "+" клавиши на клавиатуре чтобы увеличить и "Delete" or "-" чтобы уменшить количество тайлов',
        DASHBOARD_ADD_COMPONENT_DIALOG_CREATE_NEW_GROUP: 'Создать новую группу'
      });
    }
  }

  class AddComponentDialogService implements IAddComponentDialogService {

    public constructor(
      private widgetList: [AddComponentDialogWidget[]],
      private $mdDialog: angular.material.IDialogService
    ) {}

    public show(groups, activeGroupIndex) {
      return this.$mdDialog
        .show({
          templateUrl: 'dialogs/add_component/AddComponent.html',
          bindToController: true,
          controller: AddComponentDialogController,
          controllerAs: 'dialogCtrl',
          clickOutsideToClose: true,
          resolve: {
            groups: () => {
              return groups;
            },
            activeGroupIndex: () => {
              return activeGroupIndex;
            },
            widgetList: () => {
              return (<any>this.widgetList);
            }
          }
        });
    };
  }

  class AddComponentDialogProvider implements IAddComponentDialogprovider {
    private _service: AddComponentDialogService;
    private _widgetList: [AddComponentDialogWidget[]] = null;

    constructor() {}

    public configWidgetList = function (list: [AddComponentDialogWidget[]]) {
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
    .config(setTranslations)
    .provider('pipAddComponentDialog', AddComponentDialogProvider);
})();