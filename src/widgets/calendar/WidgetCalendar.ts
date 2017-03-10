import {
  MenuWidgetService
} from '../menu/WidgetMenuService';
import {
  IWidgetConfigService
} from '../../dialogs/widget_config/ConfigDialogService';

{
  class CalendarWidgetController extends MenuWidgetService {
    constructor(
      private pipWidgetConfigDialogService: IWidgetConfigService
    ) {
      super();

      if (this.options) {
        this.menu = this.options.menu ? _.union(this.menu, this.options.menu) : this.menu;
        this.menu.push({
          title: 'Configurate',
          click: () => {
            this.onConfigClick();
          }
        });
        this.options.date = this.options.date || new Date();
        this.color = this.options.color || 'blue';
      }
    }

    private onConfigClick() {
      this.pipWidgetConfigDialogService.show({
        dialogClass: 'pip-calendar-config',
        locals: {
          color: this.color,
          size: this.options.size,
          date: this.options.date,
        },
        extensionUrl: 'widgets/calendar/ConfigDialogExtension.html'
      }, (result: any) => {
        this.changeSize(result.size);

        this.color = result.color;
        this.options.color = result.color;
        this.options.date = result.date;
      });
    }

  }

  const CalendarWidget: ng.IComponentOptions = {
    bindings: {
      options: '=pipOptions',
    },
    controller: CalendarWidgetController,
    templateUrl: 'widgets/calendar/WidgetCalendar.html'
  }

  angular
    .module('pipWidget')
    .component('pipCalendarWidget', CalendarWidget);

}