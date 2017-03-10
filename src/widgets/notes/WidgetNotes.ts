import {
  MenuWidgetService
} from '../menu/WidgetMenuService';
import {
  IWidgetConfigService
} from '../../dialogs/widget_config/ConfigDialogService';

{
  class NotesWidgetController extends MenuWidgetService {

    constructor(
      private pipWidgetConfigDialogService: IWidgetConfigService
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
      this.pipWidgetConfigDialogService.show({
        dialogClass: 'pip-calendar-config',
        locals: {
          color: this.color,
          size: this.options.size,
          title: this.options.title,
          text: this.options.text,
        },
        extensionUrl: 'widgets/notes/ConfigDialogExtension.html'
      }, (result: any) => {
        this.color = result.color;
        this.options.color = result.color;
        this.changeSize(result.size);
        this.options.text = result.text;
        this.options.title = result.title;
      });
    }
  }

  const NotesWidget: ng.IComponentOptions = {
    bindings: {
      options: '=pipOptions'
    },
    controller: NotesWidgetController,
    templateUrl: 'widgets/notes/WidgetNotes.html'
  }

  angular
    .module('pipWidget')
    .component('pipNotesWidget', NotesWidget);
}