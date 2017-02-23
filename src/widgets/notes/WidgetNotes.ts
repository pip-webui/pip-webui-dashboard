'use strict';

import { MenuWidgetService } from '../menu/WidgetMenuService';
import { IWidgetConfigService } from '../../dialogs/widget_config/ConfigDialogService';

class NotesWidgetController extends MenuWidgetService {
  private _$scope: angular.IScope;
  private _configDialog: IWidgetConfigService;

  public color: string = 'orange';

  constructor(
    pipWidgetMenu: any,
    $scope: angular.IScope,
    pipWidgetConfigDialogService: IWidgetConfigService
  ) {
      super();
      this._$scope = $scope;
      this._configDialog = pipWidgetConfigDialogService;

      if (this['options']) {
        this.menu = this['options']['menu'] ? _.union(this.menu, this['options']['menu']) : this.menu;
      }

      this.menu.push({ title: 'Configurate', click: () => {
          this.onConfigClick();
      }});
      this.color = this['options'].color || this.color;
  }

  private onConfigClick() {
    this._configDialog.show({
      dialogClass: 'pip-calendar-config',
      color: this.color,
      size: this['options'].size,
      title: this['options'].title,
      text: this['options'].text,
      extensionUrl: 'widgets/notes/ConfigDialogExtension.html'
    }, (result: any) => {
      this.color = result.color;
      this['options'].color = result.color;
      this.changeSize(result.size);
      this['options'].text = result.text;
      this['options'].title = result.title;
    });
  }
}

  let pipNotesWidget = {
      bindings           : {
        options: '=pipOptions'
      },
      controller      : NotesWidgetController,
      controllerAs    : 'widgetCtrl',
      templateUrl     : 'widgets/notes/WidgetNotes.html'
  }

  angular
    .module('pipWidget')
    .component('pipNotesWidget', pipNotesWidget);

