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
  public animationType: string = 'fading';
  public animationInterval: number = 5000;

  constructor(
    private $scope: angular.IScope,
    private $element: any,
    private $timeout: angular.ITimeoutService,
    private pipWidgetConfigDialogService: IWidgetConfigService,
    private pipWidgetTemplate: IWidgetTemplateService
  ) {
    super();

    if (this.options) {
      this.animationType = this.options.animationType || this.animationType;
      this.animationInterval = this.options.animationInterval || this.animationInterval;
    }
  }

  public onImageLoad($event) {
    this.$timeout(() => {
      this.pipWidgetTemplate.setImageMarginCSS(this.$element.parent(), $event.target);
    });
  }

  public changeSize(params) {
    this.options.size.colSpan = params.sizeX;
    this.options.size.rowSpan = params.sizeY;

    this.$timeout(() => {
      _.each(this.$element.find('img'), (image) => {
        this.pipWidgetTemplate.setImageMarginCSS(this.$element.parent(), image);
      });
    }, 500);
  }
}

const PictureSliderWidget: ng.IComponentOptions = {
  bindings: {
    options: '=pipOptions'
  },
  controller: PictureSliderController,
  templateUrl: 'widgets/picture_slider/WidgetPictureSlider.html'
}

angular
  .module('pipWidget')
  .component('pipPictureSliderWidget', PictureSliderWidget);