'use strict';

import {
  MenuWidgetService
} from '../menu/WidgetMenuService';
import {
  IWidgetConfigService
} from '../../dialogs/widget_config/ConfigDialogService';
import {
  IWidgetTemplateService
} from '../../utility/WidgetTemplateUtility';

class PictureSliderController extends MenuWidgetService {
  private _$scope: angular.IScope;
  private _configDialog: IWidgetConfigService;
  private _widgetUtility: IWidgetTemplateService;
  private _$element: any;
  private _$timeout: angular.ITimeoutService;

  public animationType: string = 'fading';
  public animationInterval: number = 5000;

  constructor(
    pipWidgetMenu: any,
    $scope: angular.IScope,
    $element: any,
    $timeout: angular.ITimeoutService,
    pipWidgetConfigDialogService: IWidgetConfigService,
    pipWidgetTemplate: IWidgetTemplateService
  ) {
    super();
    this._$scope = $scope;
    this._configDialog = pipWidgetConfigDialogService;
    this._widgetUtility = pipWidgetTemplate;
    this._$element = $element;
    this._$timeout = $timeout;
    if (this['options']) {
      this.animationType = this['options'].animationType || this.animationType;
      this.animationInterval = this['options'].animationInterval || this.animationInterval;
    }
  }

  public onImageLoad($event) {
    this._$timeout(() => {
      this._widgetUtility.setImageMarginCSS(this._$element.parent(), $event.target);
    });
  }

  public changeSize(params) {
    this['options'].size.colSpan = params.sizeX;
    this['options'].size.rowSpan = params.sizeY;

    this._$timeout(() => {
      _.each(this._$element.find('img'), (image) => {
        this._widgetUtility.setImageMarginCSS(this._$element.parent(), image);
      });
    }, 500);
  }
}

let pipPictureSliderWidget = {
  bindings: {
    options: '=pipOptions',
    index: '=',
    group: '='
  },
  controller: PictureSliderController,
  templateUrl: 'widgets/picture_slider/WidgetPictureSlider.html',
  controllerAs: 'widgetCtrl'
}

angular
  .module('pipWidget')
  .component('pipPictureSliderWidget', pipPictureSliderWidget);