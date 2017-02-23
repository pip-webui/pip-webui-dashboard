import { MenuWidgetService } from '../menu/WidgetMenuService';

let SMALL_CHART: number = 70;
let BIG_CHART: number = 250;

class StatisticsWidgetController extends MenuWidgetService {
  private _$scope: angular.IScope;
  private _$timeout: angular.ITimeoutService;

  public reset: boolean = false;
  public chartSize: number = SMALL_CHART;

  constructor(
    pipWidgetMenu: any,
    $scope: angular.IScope,
    $timeout: angular.ITimeoutService
  ) {
      super();
      this._$scope = $scope;
      this._$timeout = $timeout;

      if (this['options']) {
        this.menu = this['options']['menu'] ? _.union(this.menu, this['options']['menu']) : this.menu;
      }

      this.setChartSize();
  }

  public changeSize(params) {
    this['options'].size.colSpan = params.sizeX;
    this['options'].size.rowSpan = params.sizeY;

    this.reset = true;
    this.setChartSize();
    this._$timeout(() => {
      this.reset = false;
    }, 500);
  }

  private setChartSize() {
    this.chartSize = this['options'].size.colSpan == 2 && this['options'].size.rowSpan == 2 ? BIG_CHART : SMALL_CHART;
  }
}

(() => {
  'use strict';

  let pipStatisticsWidget = {
      bindings           : {
        options: '=pipOptions'
      },
      bindToController: true,
      controller      : StatisticsWidgetController,
      controllerAs    : 'widgetCtrl',
      templateUrl     : 'widgets/statistics/WidgetStatistics.html'
  }

  angular
    .module('pipWidget')
    .component('pipStatisticsWidget', pipStatisticsWidget);
})();
