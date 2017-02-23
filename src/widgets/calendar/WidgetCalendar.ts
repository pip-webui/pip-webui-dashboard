import { MenuWidgetService } from '../menu/WidgetMenuService';
import { IWidgetConfigService } from '../../dialogs/widget_config/ConfigDialogService';

class CalendarWidgetController extends MenuWidgetService {
  private _$scope: angular.IScope;
  private _configDialog: IWidgetConfigService;

  public color: string = 'blue';

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
        this.menu.push({ title: 'Configurate', click: () => {
          this.onConfigClick();
        }});
        this['options'].date = this['options'].date || new Date();
        this.color = this['options'].color || this.color;
      }
  }

  private onConfigClick() {
    this._configDialog.show({
      dialogClass: 'pip-calendar-config',
      color: this.color,
      size: this['options'].size,
      date: this['options'].date,
      extensionUrl: 'widgets/calendar/ConfigDialogExtension.html'
    }, (result: any) => {
      this.color = result.color;
      this['options'].color = result.color;
      this.changeSize(result.size);
      this['options'].date = result.date;
    });
  }

}

(() => {

  let pipCalendarWidget = {
      bindings        : {
        options: '=pipOptions',
      },
      controller      : CalendarWidgetController,
      controllerAs    : 'widgetCtrl',
      templateUrl     : 'widgets/calendar/WidgetCalendar.html'
  }

  angular
    .module('pipWidget')
    .component('pipCalendarWidget', pipCalendarWidget);

})();
