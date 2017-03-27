import {
  MenuTileService
} from '../menu_tile/MenuTileService';
import {
  ITileConfigService
} from '../config_tile_dialog/ConfigDialogService';

{
  class NoteTileController extends MenuTileService {

    constructor(
      private pipTileConfigDialogService: ITileConfigService
    ) {
      super();

      if (this.options) {
        this.menu = this.options.menu ? _.union(this.menu, this.options.menu) : this.menu;
      }

      this.menu.push({
        title: 'Configurate',
        click: () => {
          this.onConfigClick();
        }
      });
      this.color = this.options.color || 'orange';
    }

    private onConfigClick() {
      this.pipTileConfigDialogService.show({
        locals: {
          color: this.color,
          size: this.options.size,
          title: this.options.title,
          text: this.options.text,
        },
        extensionUrl: 'note_tile/ConfigDialogExtension.html'
      }, (result: any) => {
        this.color = result.color;
        this.options.color = result.color;
        this.changeSize(result.size);
        this.options.text = result.text;
        this.options.title = result.title;
      });
    }
  }

  const NoteTile: ng.IComponentOptions = {
    bindings: {
      options: '=pipOptions'
    },
    controller: NoteTileController,
    templateUrl: 'note_tile/NoteTile.html'
  }

  angular
    .module('pipDashboard')
    .component('pipNoteTile', NoteTile);
}