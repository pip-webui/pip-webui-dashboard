import {
  MenuWidgetService
} from '../menu/WidgetMenuService';
import {
  IWidgetConfigService
} from '../../dialogs/widget_config/ConfigDialogService';

class PositionWidgetController extends MenuWidgetService {
  private _$scope: angular.IScope;
  private _$timeout: angular.ITimeoutService;
  private _configDialog: IWidgetConfigService;
  private _locationDialog: any;

  public showPosition: boolean = true;

  constructor(
    pipWidgetMenu: any,
    $scope: angular.IScope,
    $timeout: angular.ITimeoutService,
    $element: any,
    pipWidgetConfigDialogService: IWidgetConfigService,
    pipLocationEditDialog: any,
  ) {
    super();
    this._$scope = $scope;
    this._$timeout = $timeout;
    this._configDialog = pipWidgetConfigDialogService;
    this._locationDialog = pipLocationEditDialog;

    if (this['options']) {
      if (this['options']['menu']) this.menu = _.union(this.menu, this['options']['menu']);
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

    this['options'].location = this['options'].location || this['options'].position;

    $scope.$watch('widgetCtrl.options.location', () => {
      this.reDrawPosition();
    });

    // TODO it doesn't work
    $scope.$watch(() => { return $element.is(':visible'); }, (newVal) => {
      if (newVal == true) this.reDrawPosition();
    });
  }

  private onConfigClick() {
    this._configDialog.show({
      dialogClass: 'pip-position-config',
      size: this['options'].size,
      locationName: this['options'].locationName,
      hideColors: true,
      extensionUrl: 'widgets/position/ConfigDialogExtension.html'
    }, (result: any) => {
      this.changeSize(result.size);
      this['options'].locationName = result.locationName;
    });
  }

  public changeSize(params) {
    this['options'].size.colSpan = params.sizeX;
    this['options'].size.rowSpan = params.sizeY;

    this.reDrawPosition();
  }

  public openLocationEditDialog() {
    this._locationDialog.show({
      locationName: this['options'].locationName,
      locationPos: this['options'].location
    }, (newPosition) => {
      if (newPosition) {
        this['options'].location = newPosition.location;
        this['options'].locationName = newPosition.locatioName;
      }
    });
  }

  private reDrawPosition() {
    this.showPosition = false;
    this._$timeout(() => {
      this.showPosition = true;
    }, 50);
  }
}


let pipPositionWidget = {
  bindings: {
    options: '=pipOptions',
    index: '=',
    group: '='
  },
  controller: PositionWidgetController,
  controllerAs: 'widgetCtrl',
  templateUrl: 'widgets/position/WidgetPosition.html'
}

angular
  .module('pipWidget')
  .component('pipPositionWidget', pipPositionWidget);