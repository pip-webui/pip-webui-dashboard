
export class MenuWidgetService {
  public menu: any = [
    {
      title: 'Change Size',
      action: angular.noop,
      submenu: [{
          title: '1 x 1',
          action: 'changeSize',
          params: {
            sizeX: 1,
            sizeY: 1
          }
        },
        {
          title: '2 x 1',
          action: 'changeSize',
          params: {
            sizeX: 2,
            sizeY: 1
          }
        },
        {
          title: '2 x 2',
          action: 'changeSize',
          params: {
            sizeX: 2,
            sizeY: 2
          }
        }
      ]
    }
  ];

  constructor() {
    "ngInject";
  }

  public callAction(actionName, params, item) {
    if (this[actionName]) {
      this[actionName].call(this, params);
    }

    if (item['click']) {
      item['click'].call(item, params, this);
    }
  };

  public changeSize(params) {
    this['options'].size.colSpan = params.sizeX;
    this['options'].size.rowSpan = params.sizeY;
  };
}

class MenuWidgetProvider {
    private _service: MenuWidgetService;

    constructor() {
    }

   public $get() {
        "ngInject";

        if (this._service == null)
            this._service = new MenuWidgetService();
        
        return this._service;
    }
}

(function () {
  'use strict';

  angular
    .module('pipWidget')
    .provider('pipWidgetMenu', MenuWidgetProvider);
})();