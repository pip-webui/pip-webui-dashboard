import {
  ITileTemplateService
} from '../utility/TileTemplateUtility';
import {
  IAddTileDialogService,
  IAddTileDialogprovider
} from '../add_tile_dialog/AddTileProvider'

{
  const setTranslations = function ($injector: ng.auto.IInjectorService) {
    const pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
    if (pipTranslate) {
      ( < any > pipTranslate).setTranslations('en', {
        DROP_TO_CREATE_NEW_GROUP: 'Drop here to create new group',
      });
      ( < any > pipTranslate).setTranslations('ru', {
        DROP_TO_CREATE_NEW_GROUP: 'Перетащите сюда для создания новой группы'
      });
    }
  }

  const configureAvailableWidgets = function (pipAddTileDialogProvider: IAddTileDialogprovider) {
    pipAddTileDialogProvider.configWidgetList([
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

  class draggableOptions {
    tileWidth: number;
    tileHeight: number;
    gutter: number;
    inline: boolean;
  }

  const DEFAULT_GRID_OPTIONS: draggableOptions = {
    tileWidth: 150, // 'px'
    tileHeight: 150, // 'px'
    gutter: 10, // 'px'
    inline: false
  };

  interface DashboardBindings {
      gridOptions: any;
      groupAdditionalActions: any;
      groupedWidgets: any;
  }

  class DashboardController implements ng.IController, DashboardBindings {
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
    private _includeTpl: string = '<pip-{{ type }}-widget group="groupIndex" index="index"' +
      'pip-options="$parent.$ctrl.groupedWidgets[groupIndex][\'source\'][index].opts">' +
      '</pip-{{ type }}-widget>';

    public groupedWidgets: any;
    public draggableGridOptions: draggableOptions;
    public widgetsTemplates: any;
    public groupMenuActions: any = this.defaultGroupMenuActions;
    public widgetsContext: any;
    public gridOptions: any;
    public groupAdditionalActions: any;

    constructor(
      $scope: angular.IScope,
      private $rootScope: angular.IRootScopeService,
      private $attrs: any,
      private $element: any,
      private $timeout: angular.ITimeoutService,
      private $interpolate: angular.IInterpolateService,
      private pipAddTileDialog: IAddTileDialogService,
      private pipTileTemplate: ITileTemplateService
    ) {
      // Add class to style scroll bar
      $element.addClass('pip-scroll');

      // Set tiles grid options
      this.draggableGridOptions = this.gridOptions || DEFAULT_GRID_OPTIONS;

      // Switch inline displaying
      if (this.draggableGridOptions.inline === true) {
        $element.addClass('inline-grid');
      }
      // Extend group's menu actions
      if (this.groupAdditionalActions) angular.extend(this.groupMenuActions, this.groupAdditionalActions);

      // Compile widgets
      this.widgetsContext = $scope;
      this.compileWidgets();

      this.$timeout(() => {
        this.$element.addClass('visible');
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
              template: this.pipTileTemplate.getTemplate(widget, this._includeTpl)
            };
          })
      });
    }

    public addComponent(groupIndex) {
      this.pipAddTileDialog
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
      this.$timeout(() => {
        this.groupedWidgets[params.options.groupIndex].removedWidgets = [];
      });
    }

  }

  const Dashboard: ng.IComponentOptions = {
    bindings: {
      gridOptions: '=pipGridOptions',
      groupAdditionalActions: '=pipGroupActions',
      groupedWidgets: '=pipGroups'
    },
    controller: DashboardController,
    templateUrl: 'dashboard/Dashboard.html'
  }

  angular
    .module('pipDashboard')
    .config(configureAvailableWidgets)
    .config(setTranslations)
    .component('pipDashboard', Dashboard);

}