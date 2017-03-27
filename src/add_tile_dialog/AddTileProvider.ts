import {
  AddTileDialog,
  AddTileDialogController
} from './AddTileDialogController';

export interface IAddTileDialogService {
  show(groups, activeGroupIndex): angular.IPromise < any > ;
}

export interface IAddTileDialogprovider {
  configWidgetList(list: [AddTileDialog[]]): void;
}

{
  const setTranslations = function($injector: ng.auto.IInjectorService) {
    const pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
    if (pipTranslate) {
      (<any>pipTranslate).setTranslations('en', {
        DASHBOARD_ADD_TILE_DIALOG_TITLE: 'Add component',
        DASHBOARD_ADD_TILE_DIALOG_USE_HOT_KEYS: 'Use "Enter" or "+" buttons on keyboard to encrease and "Delete" or "-" to decrease tiles amount',
        DASHBOARD_ADD_TILE_DIALOG_CREATE_NEW_GROUP: 'Create new group'
      });
      (<any>pipTranslate).setTranslations('ru', {
        DASHBOARD_ADD_TILE_DIALOG_TITLE: 'Добавить компонент',
        DASHBOARD_ADD_TILE_DIALOG_USE_HOT_KEYS: 'Используйте "Enter" или "+" клавиши на клавиатуре чтобы увеличить и "Delete" or "-" чтобы уменшить количество тайлов',
        DASHBOARD_ADD_TILE_DIALOG_CREATE_NEW_GROUP: 'Создать новую группу'
      });
    }
  }

  class AddTileDialogService implements IAddTileDialogService {
    public constructor(
      private widgetList: [AddTileDialog[]],
      private $mdDialog: angular.material.IDialogService
    ) {}

    public show(groups, activeGroupIndex) {
      return this.$mdDialog
        .show({
          templateUrl: 'add_tile_dialog/AddTile.html',
          bindToController: true,
          controller: AddTileDialogController,
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

  class AddTileDialogProvider implements IAddTileDialogprovider {
    private _service: AddTileDialogService;
    private _widgetList: [AddTileDialog[]] = null;

    constructor() {}

    public configWidgetList = function (list: [AddTileDialog[]]) {
      this._widgetList = list;
    };

    public $get($mdDialog: angular.material.IDialogService) {
      "ngInject";

      if (this._service == null)
        this._service = new AddTileDialogService(this._widgetList, $mdDialog);

      return this._service;
    }
  }

  angular
    .module('pipAddDashboardTileDialog')
    .config(setTranslations)
    .provider('pipAddTileDialog', AddTileDialogProvider);
}