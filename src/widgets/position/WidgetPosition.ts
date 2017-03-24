import {
  MenuWidgetService
} from '../menu/WidgetMenuService';
import {
  IWidgetConfigService
} from '../../dialogs/tile_config/ConfigDialogService';

{
  class PositionWidgetController extends MenuWidgetService {
    public showPosition: boolean = true;

    constructor(
      $scope: angular.IScope,
      private $timeout: angular.ITimeoutService,
      private $element: any,
      private pipWidgetConfigDialogService: IWidgetConfigService,
      private pipLocationEditDialog: any,
    ) {
      super();

      if (this.options) {
        if (this.options.menu) this.menu = _.union(this.menu, this.options.menu);
      }

      this.menu.push({
        title: 'Configurate',
        click: () => {
          this.onConfigClick();
        }
      });
      this.menu.push({
        title: 'Change location',
        click: () => {
          this.openLocationEditDialog();
        }
      });

      this.options.location = this.options.location || this.options.position;

      $scope.$watch('widgetCtrl.options.location', () => {
        this.reDrawPosition();
      });

      // TODO it doesn't work
      $scope.$watch(() => {
        return $element.is(':visible');
      }, (newVal) => {
        if (newVal == true) this.reDrawPosition();
      });
    }

    private onConfigClick() {
      this.pipWidgetConfigDialogService.show({
        dialogClass: 'pip-position-config',
        locals: {
          size: this.options.size,
          locationName: this.options.locationName,
          hideColors: true,
        },
        extensionUrl: 'widgets/position/ConfigDialogExtension.html'
      }, (result: any) => {
        this.changeSize(result.size);
        this.options.locationName = result.locationName;
      });
    }

    public changeSize(params) {
      this.options.size.colSpan = params.sizeX;
      this.options.size.rowSpan = params.sizeY;

      this.reDrawPosition();
    }

    public openLocationEditDialog() {
      this.pipLocationEditDialog.show({
        locationName: this.options.locationName,
        locationPos: this.options.location
      }, (newPosition) => {
        if (newPosition) {
          this.options.location = newPosition.location;
          this.options.locationName = newPosition.locatioName;
        }
      });
    }

    private reDrawPosition() {
      this.showPosition = false;
      this.$timeout(() => {
        this.showPosition = true;
      }, 50);
    }
  }


  const PositionWidget: ng.IComponentOptions = {
    bindings: {
      options: '=pipOptions',
      index: '=',
      group: '='
    },
    controller: PositionWidgetController,
    templateUrl: 'widgets/position/WidgetPosition.html'
  }

  angular
    .module('pipWidget')
    .component('pipPositionWidget', PositionWidget);
}