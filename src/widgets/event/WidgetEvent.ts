import {
  MenuWidgetService
} from '../menu/WidgetMenuService';
import {
  IWidgetConfigService
} from '../../dialogs/widget_config/ConfigDialogService'; 
{
  class EventWidgetController extends MenuWidgetService {
    private _oldOpacity: number;

    public opacity: number = 0.57;

    constructor(
      $scope: ng.IScope,
      private $element: JQuery,
      private $timeout: angular.ITimeoutService,
      private pipWidgetConfigDialogService: IWidgetConfigService
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
      this.color = this.options.color || 'gray';
      this.opacity = this.options.opacity || this.opacity;

      this.drawImage();

      // TODO it doesn't work
      $scope.$watch(() => {
        return $element.is(':visible');
      }, (newVal) => {
        this.drawImage();
      });
    }

    private drawImage() {
      if (this.options.image) {
        this.$timeout(() => {
          this.onImageLoad(this.$element.find('img'));
        }, 500);
      }
    }

    private onConfigClick() {
      this._oldOpacity = _.clone(this.opacity);
      this.pipWidgetConfigDialogService.show({
        dialogClass: 'pip-calendar-config',
        locals: {
          color: this.color,
          size: this.options.size || {
            colSpan: 1,
            rowSpan: 1
          },
          date: this.options.date,
          title: this.options.title,
          text: this.options.text,
          opacity: this.opacity,
          onOpacitytest: (opacity) => {
            this.opacity = opacity;
          }
        },
        extensionUrl: 'widgets/event/ConfigDialogExtension.html'
      }, (result: any) => {
        this.changeSize(result.size);

        this.color = result.color;
        this.options.color = result.color;
        this.options.date = result.date;
        this.options.title = result.title;
        this.options.text = result.text;
        this.options.opacity = result.opacity;
      }, () => {
        this.opacity = this._oldOpacity;
      });
    }

    private onImageLoad(image) {
      this.setImageMarginCSS(this.$element.parent(), image);
    }

    public changeSize(params) {
      this.options.size.colSpan = params.sizeX;
      this.options.size.rowSpan = params.sizeY;

      if (this.options.image) {
        this.$timeout(() => {
          this.setImageMarginCSS(this.$element.parent(), this.$element.find('img'));
        }, 500);
      }
    }

    // Later replace by pipImageUtils sevice's function
    private setImageMarginCSS($element, image) {
      let
        containerWidth = $element.width ? $element.width() : $element.clientWidth, // || 80,
        containerHeight = $element.height ? $element.height() : $element.clientHeight, // || 80,
        imageWidth = image[0].naturalWidth || image.width,
        imageHeight = image[0].naturalHeight || image.height,
        margin = 0,
        cssParams = {};

      if ((imageWidth / containerWidth) > (imageHeight / containerHeight)) {
        margin = -((imageWidth / imageHeight * containerHeight - containerWidth) / 2);
        cssParams['margin-left'] = '' + margin + 'px';
        cssParams['height'] = '' + containerHeight + 'px'; //'100%';
        cssParams['width'] = '' + imageWidth * containerHeight / imageHeight + 'px'; //'100%';
        cssParams['margin-top'] = '';
      } else {
        margin = -((imageHeight / imageWidth * containerWidth - containerHeight) / 2);
        cssParams['margin-top'] = '' + margin + 'px';
        cssParams['height'] = '' + imageHeight * containerWidth / imageWidth + 'px'; //'100%';
        cssParams['width'] = '' + containerWidth + 'px'; //'100%';
        cssParams['margin-left'] = '';
      }

      image.css(cssParams);
    }
  }


  const EventWidget: ng.IComponentOptions = {
    bindings: {
      options: '=pipOptions'
    },
    controller: EventWidgetController,
    templateUrl: 'widgets/event/WidgetEvent.html'
  }

  angular
    .module('pipWidget')
    .component('pipEventWidget', EventWidget);

}