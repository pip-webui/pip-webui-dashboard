import { MenuWidgetService} from '../menu/WidgetMenuService';
import { IWidgetConfigService } from '../../dialogs/widget_config/ConfigDialogService';

class EventWidgetController extends MenuWidgetService {
  private _$scope: angular.IScope;
  private _$element: any;
  private _$timeout: angular.ITimeoutService;
  private _configDialog: IWidgetConfigService;
  private _oldOpacity: number;

  public color: string = 'gray';
  public opacity: number = 0.57;

  constructor(
    pipWidgetMenu: any,
    $scope: angular.IScope,
    $element: any,
    $timeout: angular.ITimeoutService,
    pipWidgetConfigDialogService: IWidgetConfigService
  ) {
    super();
    this._$scope = $scope;
    this._$element = $element;
    this._$timeout = $timeout;
    this._configDialog = pipWidgetConfigDialogService;

    if (this['options']) {
      if (this['options']['menu']) this.menu = _.union(this.menu, this['options']['menu']);
    }

    this.menu.push({ title: 'Configurate', click: () => {
          this.onConfigClick();
    }});
    this.color = this['options'].color || this.color;
    this.opacity = this['options'].opacity || this.opacity;

    this.drawImage();

    // TODO it doesn't work
    $scope.$watch(() => { return $element.is(':visible'); }, (newVal) => {
      this.drawImage();
    });
  }

  private drawImage() {
    if (this['options'].image) {
      this._$timeout(() => {
        this.onImageLoad(this._$element.find('img'));
      }, 500);
    }
  }

  private onConfigClick() {
    this._oldOpacity = _.clone(this.opacity);
    this._configDialog.show({
      dialogClass: 'pip-calendar-config',
      color: this.color,
      size: this['options'].size || {colSpan: 1, rowSpan: 1},
      date: this['options'].date,
      title: this['options'].title,
      text: this['options'].text,
      opacity: this.opacity,
      onOpacitytest: (opacity) => {
        this.opacity = opacity;
      },
      extensionUrl: 'widgets/event/ConfigDialogExtension.html'
    }, (result: any) => {
      this.color = result.color;
      this['options'].color = result.color;
      this.changeSize(result.size);
      this['options'].date = result.date;
      this['options'].title = result.title;
      this['options'].text = result.text;
      this['options'].opacity = result.opacity;
    }, () => {
      this.opacity = this._oldOpacity;
    });
  }

  private onImageLoad(image) {
    this.setImageMarginCSS(this._$element.parent(), image);
  }

  public changeSize(params) {
    this['options'].size.colSpan = params.sizeX;
    this['options'].size.rowSpan = params.sizeY;

    if (this['options'].image) {
      this._$timeout(() => {
        this.setImageMarginCSS(this._$element.parent(), this._$element.find('img'));
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


(() => {
  let pipEventWidget =  {
      bindings: {
        options: '=pipOptions'
      },
      controller: EventWidgetController,
      controllerAs: 'widgetCtrl',
      templateUrl: 'widgets/event/WidgetEvent.html'
  }

  angular
    .module('pipWidget')
    .component('pipEventWidget', pipEventWidget);
})();