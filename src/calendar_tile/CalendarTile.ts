import {
  MenuTileService
} from '../menu_tile/MenuTileService';
import {
  ITileConfigService
} from '../config_tile_dialog/ConfigDialogService';

{
  class CalendarTileController extends MenuTileService {
    constructor(
      private pipTileConfigDialogService: ITileConfigService
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
      this.pipTileConfigDialogService.show({
        dialogClass: 'pip-calendar-config',
        locals: {
          color: this.color,
          size: this.options.size,
          date: this.options.date,
        },
        extensionUrl: 'calendar_tile/ConfigDialogExtension.html'
      }, (result: any) => {
        this.changeSize(result.size);

        this.color = result.color;
        this.options.color = result.color;
        this.options.date = result.date;
      });
    }

  }

  const CalendarTile: ng.IComponentOptions = {
    bindings: {
      options: '=pipOptions',
    },
    controller: CalendarTileController,
    templateUrl: 'calendar_tile/CalendarTile.html'
  }

  angular
    .module('pipDashboard')
    .component('pipCalendarTile', CalendarTile);

}