'use strict';

import { IWidgetTemplateService } from './utility/WidgetTemplateUtility';

function setTranslations($injector) {
  var pipTranslate = $injector.has('pipTranslate') ? $injector.get('pipTranslate') : null;
  if (pipTranslate) {
    pipTranslate.setTranslations('en', {
      DROP_TO_CREATE_NEW_GROUP: 'Drop here to create new group',
    });
    pipTranslate.setTranslations('ru', {
      DROP_TO_CREATE_NEW_GROUP: 'Перетащите сюда для создания новой группы'
    });
  }
}

function configureAvailableWidgets(pipAddComponentDialogProvider) {
  pipAddComponentDialogProvider.configWidgetList([
    [{
        title: 'Event',
        icon: 'document',
        name: 'event',
        amount: 0
      },
      {
        title: 'Position',
        icon: 'location',
        name: 'position',
        amount: 0
      }
    ],
    [{
        title: 'Calendar',
        icon: 'date',
        name: 'calendar',
        amount: 0
      },
      {
        title: 'Sticky Notes',
        icon: 'note-take',
        name: 'notes',
        amount: 0
      },
      {
        title: 'Statistics',
        icon: 'tr-statistics',
        name: 'statistics',
        amount: 0
      }
    ]
  ]);
}

import { IAddComponentDialogService } from './dialogs/add_component/AddComponentProvider'

class draggableOptions {
  tileWidth: number;
  tileHeight: number;
  gutter: number;
  inline: boolean;
}

let DEFAULT_GRID_OPTIONS: draggableOptions = {
  tileWidth: 150, // 'px'
  tileHeight: 150, // 'px'
  gutter: 10, // 'px'
  inline: false
};

class DashboardController {
  private defaultGroupMenuActions: any = [{
      title: 'Add Component',
      callback: (groupIndex) => {
        this.addComponent(groupIndex);
      }
    },
    {
      title: 'Remove',
      callback: (groupIndex) => {
        this.removeGroup(groupIndex);
      }
    },
    {
      title: 'Configurate',
      callback: (groupIndex) => {
        console.log('configurate group with index:', groupIndex);
      }
    }
  ];
  private _$scope: angular.IScope;
  private _$rootScope: angular.IRootScopeService;
  private _$attrs: any;
  private _$element: any;
  private _$timeout: angular.ITimeoutService;
  private _$interpolate: angular.IInterpolateService;
  private _pipAddComponentDialog: IAddComponentDialogService;
  private _pipWidgetTemplate: IWidgetTemplateService;
  private _includeTpl: string = '<pip-{{ type }}-widget group="groupIndex" index="index"' +
    'pip-options="$parent.dashboardCtrl.groupedWidgets[groupIndex][\'source\'][index].opts">' +
    '</pip-{{ type }}-widget>';

  public groupedWidgets: any;
  public draggableGridOptions: draggableOptions;
  public widgetsTemplates: any;
  public groupMenuActions: any = this.defaultGroupMenuActions;
  public widgetsContext: any;

  constructor(
    $scope: angular.IScope,
    $rootScope: angular.IRootScopeService,
    $attrs: any,
    $element: any,
    $timeout: angular.ITimeoutService,
    $interpolate: angular.IInterpolateService,
    pipAddComponentDialog: IAddComponentDialogService,
    pipWidgetTemplate: IWidgetTemplateService
  ) {
    this._$scope = $scope;
    this._$rootScope = $rootScope;
    this._$attrs = $attrs;
    this._$element = $element;
    this._$timeout = $timeout;
    this._$interpolate = $interpolate;
    this._pipAddComponentDialog = pipAddComponentDialog;
    this._pipWidgetTemplate = pipWidgetTemplate;

    // Add class to style scroll bar
    $element.addClass('pip-scroll');

    // Set tiles grid options
    this.draggableGridOptions = $scope['gridOptions'] || DEFAULT_GRID_OPTIONS;

    // Switch inline displaying
    if (this.draggableGridOptions.inline === true) {
      $element.addClass('inline-grid');
    }
    // Extend group's menu actions
    if ($scope['groupAdditionalActions']) angular.extend(this.groupMenuActions, $scope['groupAdditionalActions']);

    // Compile widgets
    this.widgetsContext = $scope;
    this.compileWidgets();

    this._$timeout(() => {
      this._$element.addClass('visible');
    }, 700);
  }

  private compileWidgets() {
    _.each(this.groupedWidgets, (group, groupIndex) => {
        group.removedWidgets = group.removedWidgets || [],
        group.source = group.source.map((widget, index) => {
          // Establish default props
          widget.size = widget.size || {
            colSpan: 1,
            rowSpan: 1
          };
          widget.index = index;
          widget.groupIndex = groupIndex;
          widget.menu = widget.menu || {};
          angular.extend(widget.menu, [{
            title: 'Remove',
            click: (item, params, object) => {
              this.removeWidget(item, params, object);
            }
          }]);

          return {
            opts: widget,
            template: this._pipWidgetTemplate.getTemplate(widget, this._includeTpl)
          };
        })
    });
  }

  public addComponent(groupIndex) {
    this._pipAddComponentDialog
      .show(this.groupedWidgets, groupIndex)
      .then((data) => {
        var activeGroup;

        if (!data) {
          return;
        }

        if (data.groupIndex !== -1) {
          activeGroup = this.groupedWidgets[data.groupIndex];
        } else {
          activeGroup = {
            title: 'New group',
            source: []
          };
        }

        this.addWidgets(activeGroup.source, data.widgets);

        if (data.groupIndex === -1) {
          this.groupedWidgets.push(activeGroup);
        }

        this.compileWidgets();
      });
  };

  public removeGroup = (groupIndex) => {
    console.log('removeGroup', groupIndex);
    this.groupedWidgets.splice(groupIndex, 1);
  }

  private addWidgets(group, widgets) {
    widgets.forEach((widgetGroup) => {
      widgetGroup.forEach((widget) => {
        if (widget.amount) {
          Array.apply(null, Array(widget.amount)).forEach(() => {
            group.push({
              type: widget.name
            });
          });
        }
      });
    });
  }

  private removeWidget(item, params, object) {
    this.groupedWidgets[params.options.groupIndex].removedWidgets = [];
    this.groupedWidgets[params.options.groupIndex].removedWidgets.push(params.options.index);
    this.groupedWidgets[params.options.groupIndex].source.splice(params.options.index, 1);
    this._$timeout(() => {
      this.groupedWidgets[params.options.groupIndex].removedWidgets = [];
    });
  }

}

angular
  .module('pipDashboard')
  .config(configureAvailableWidgets)
  .run(setTranslations)
  .controller('pipDashboardCtrl', DashboardController);