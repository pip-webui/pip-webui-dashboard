'use strict';

import {
  MenuTileService
} from '../menu_tile/MenuTileService';
import {
  ITileConfigService
} from '../config_tile_dialog/ConfigDialogService';
import {
  ITileTemplateService
} from '../utility/TileTemplateUtility';

{
  class PictureSliderController extends MenuTileService {
    public animationType: string = 'fading';
    public animationInterval: number = 5000;

    constructor(
      private $scope: angular.IScope,
      private $element: any,
      private $timeout: angular.ITimeoutService,
      private pipTileTemplate: ITileTemplateService
    ) {
      super();

      if (this.options) {
        this.animationType = this.options.animationType || this.animationType;
        this.animationInterval = this.options.animationInterval || this.animationInterval;
      }
    }

    public onImageLoad($event) {
      this.$timeout(() => {
        this.pipTileTemplate.setImageMarginCSS(this.$element.parent(), $event.target);
      });
    }

    public changeSize(params) {
      this.options.size.colSpan = params.sizeX;
      this.options.size.rowSpan = params.sizeY;

      this.$timeout(() => {
        _.each(this.$element.find('img'), (image) => {
          this.pipTileTemplate.setImageMarginCSS(this.$element.parent(), image);
        });
      }, 500);
    }
  }

  const PictureSliderTile: ng.IComponentOptions = {
    bindings: {
      options: '=pipOptions'
    },
    controller: PictureSliderController,
    templateUrl: 'picture_slider_tile/PictureSliderTile.html'
  }

  angular
    .module('pipDashboard')
    .component('pipPictureSliderTile', PictureSliderTile);
}