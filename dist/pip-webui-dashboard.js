(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).dashboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
require("./widgets/Widgets");
require("./draggable/Draggable");
(function () {
    'use strict';
    angular.module('pipDashboard', [
        'pipWidget',
        'pipDragged',
        'pipWidgetConfigDialog',
        'pipAddDashboardComponentDialog',
        'pipDashboard.Templates',
        'pipLayout',
        'pipLocations',
        'pipDateTime',
        'pipCharts',
        'pipTranslate',
        'pipControls'
    ]);
})();
require("./utility/WidgetTemplateUtility");
require("./dialogs/widget_config/ConfigDialogController");
require("./dialogs/add_component/AddComponentDialogController");
require("./DashboardController");
require("./DashboardComponent");
},{"./DashboardComponent":2,"./DashboardController":3,"./dialogs/add_component/AddComponentDialogController":4,"./dialogs/widget_config/ConfigDialogController":6,"./draggable/Draggable":9,"./utility/WidgetTemplateUtility":14,"./widgets/Widgets":15}],2:[function(require,module,exports){
(function () {
    'use strict';
    var pipDashboard = {
        bindings: {
            gridOptions: '=pipGridOptions',
            groupAdditionalActions: '=pipGroupActions',
            groupedWidgets: '=pipGroups'
        },
        controller: 'pipDashboardCtrl',
        controllerAs: 'dashboardCtrl',
        templateUrl: 'Dashboard.html'
    };
    angular
        .module('pipDashboard')
        .component('pipDashboard', pipDashboard);
})();
},{}],3:[function(require,module,exports){
'use strict';
configureAvailableWidgets.$inject = ['pipAddComponentDialogProvider'];
setTranslations.$inject = ['$injector'];
function setTranslations($injector) {
    var pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
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
var draggableOptions = (function () {
    function draggableOptions() {
    }
    return draggableOptions;
}());
var DEFAULT_GRID_OPTIONS = {
    tileWidth: 150,
    tileHeight: 150,
    gutter: 10,
    inline: false
};
var DashboardController = (function () {
    DashboardController.$inject = ['$scope', '$rootScope', '$attrs', '$element', '$timeout', '$interpolate', 'pipAddComponentDialog', 'pipWidgetTemplate'];
    function DashboardController($scope, $rootScope, $attrs, $element, $timeout, $interpolate, pipAddComponentDialog, pipWidgetTemplate) {
        var _this = this;
        this.defaultGroupMenuActions = [{
                title: 'Add Component',
                callback: function (groupIndex) {
                    _this.addComponent(groupIndex);
                }
            },
            {
                title: 'Remove',
                callback: function (groupIndex) {
                    _this.removeGroup(groupIndex);
                }
            },
            {
                title: 'Configurate',
                callback: function (groupIndex) {
                    console.log('configurate group with index:', groupIndex);
                }
            }
        ];
        this._includeTpl = '<pip-{{ type }}-widget group="groupIndex" index="index"' +
            'pip-options="$parent.dashboardCtrl.groupedWidgets[groupIndex][\'source\'][index].opts">' +
            '</pip-{{ type }}-widget>';
        this.groupMenuActions = this.defaultGroupMenuActions;
        this.removeGroup = function (groupIndex) {
            console.log('removeGroup', groupIndex);
            _this.groupedWidgets.splice(groupIndex, 1);
        };
        this._$scope = $scope;
        this._$rootScope = $rootScope;
        this._$attrs = $attrs;
        this._$element = $element;
        this._$timeout = $timeout;
        this._$interpolate = $interpolate;
        this._pipAddComponentDialog = pipAddComponentDialog;
        this._pipWidgetTemplate = pipWidgetTemplate;
        $element.addClass('pip-scroll');
        this.draggableGridOptions = $scope['gridOptions'] || DEFAULT_GRID_OPTIONS;
        if (this.draggableGridOptions.inline === true) {
            $element.addClass('inline-grid');
        }
        if ($scope['groupAdditionalActions'])
            angular.extend(this.groupMenuActions, $scope['groupAdditionalActions']);
        this.widgetsContext = $scope;
        this.compileWidgets();
        this._$timeout(function () {
            _this._$element.addClass('visible');
        }, 700);
    }
    DashboardController.prototype.compileWidgets = function () {
        var _this = this;
        _.each(this.groupedWidgets, function (group, groupIndex) {
            group.removedWidgets = group.removedWidgets || [],
                group.source = group.source.map(function (widget, index) {
                    widget.size = widget.size || {
                        colSpan: 1,
                        rowSpan: 1
                    };
                    widget.index = index;
                    widget.groupIndex = groupIndex;
                    widget.menu = widget.menu || {};
                    angular.extend(widget.menu, [{
                            title: 'Remove',
                            click: function (item, params, object) {
                                _this.removeWidget(item, params, object);
                            }
                        }]);
                    return {
                        opts: widget,
                        template: _this._pipWidgetTemplate.getTemplate(widget, _this._includeTpl)
                    };
                });
        });
    };
    DashboardController.prototype.addComponent = function (groupIndex) {
        var _this = this;
        this._pipAddComponentDialog
            .show(this.groupedWidgets, groupIndex)
            .then(function (data) {
            var activeGroup;
            if (!data) {
                return;
            }
            if (data.groupIndex !== -1) {
                activeGroup = _this.groupedWidgets[data.groupIndex];
            }
            else {
                activeGroup = {
                    title: 'New group',
                    source: []
                };
            }
            _this.addWidgets(activeGroup.source, data.widgets);
            if (data.groupIndex === -1) {
                _this.groupedWidgets.push(activeGroup);
            }
            _this.compileWidgets();
        });
    };
    ;
    DashboardController.prototype.addWidgets = function (group, widgets) {
        widgets.forEach(function (widgetGroup) {
            widgetGroup.forEach(function (widget) {
                if (widget.amount) {
                    Array.apply(null, Array(widget.amount)).forEach(function () {
                        group.push({
                            type: widget.name
                        });
                    });
                }
            });
        });
    };
    DashboardController.prototype.removeWidget = function (item, params, object) {
        var _this = this;
        this.groupedWidgets[params.options.groupIndex].removedWidgets = [];
        this.groupedWidgets[params.options.groupIndex].removedWidgets.push(params.options.index);
        this.groupedWidgets[params.options.groupIndex].source.splice(params.options.index, 1);
        this._$timeout(function () {
            _this.groupedWidgets[params.options.groupIndex].removedWidgets = [];
        });
    };
    return DashboardController;
}());
angular
    .module('pipDashboard')
    .config(configureAvailableWidgets)
    .config(setTranslations)
    .controller('pipDashboardCtrl', DashboardController);
},{}],4:[function(require,module,exports){
"use strict";
var widget = (function () {
    function widget() {
    }
    return widget;
}());
exports.widget = widget;
var AddComponentDialogController = (function () {
    function AddComponentDialogController(groups, activeGroupIndex, widgetList, $mdDialog) {
        this.activeGroupIndex = activeGroupIndex;
        this.$mdDialog = $mdDialog;
        this.totalWidgets = 0;
        this.activeGroupIndex = _.isNumber(activeGroupIndex) ? activeGroupIndex : -1;
        this.defaultWidgets = _.cloneDeep(widgetList);
        this.groups = _.map(groups, function (group) {
            return group['title'];
        });
    }
    AddComponentDialogController.prototype.add = function () {
        this.$mdDialog.hide({
            groupIndex: this.activeGroupIndex,
            widgets: this.defaultWidgets
        });
    };
    ;
    AddComponentDialogController.prototype.cancel = function () {
        this.$mdDialog.cancel();
    };
    ;
    AddComponentDialogController.prototype.encrease = function (groupIndex, widgetIndex) {
        var widget = this.defaultWidgets[groupIndex][widgetIndex];
        widget.amount++;
        this.totalWidgets++;
    };
    ;
    AddComponentDialogController.prototype.decrease = function (groupIndex, widgetIndex) {
        var widget = this.defaultWidgets[groupIndex][widgetIndex];
        widget.amount = widget.amount ? widget.amount - 1 : 0;
        this.totalWidgets = this.totalWidgets ? this.totalWidgets - 1 : 0;
    };
    ;
    return AddComponentDialogController;
}());
exports.AddComponentDialogController = AddComponentDialogController;
angular
    .module('pipAddDashboardComponentDialog', ['ngMaterial']);
require("./AddComponentProvider");
},{"./AddComponentProvider":5}],5:[function(require,module,exports){
"use strict";
var AddComponentDialogController_1 = require("./AddComponentDialogController");
(function () {
    'use strict';
    setTranslations.$inject = ['$injector'];
    function setTranslations($injector) {
        var pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
        if (pipTranslate) {
            pipTranslate.setTranslations('en', {
                DASHBOARD_ADD_COMPONENT_DIALOG_TITLE: 'Add component',
                DASHBOARD_ADD_COMPONENT_DIALOG_USE_HOT_KEYS: 'Use "Enter" or "+" buttons on keyboard to encrease and "Delete" or "-" to decrease tiles amount',
                DASHBOARD_ADD_COMPONENT_DIALOG_CREATE_NEW_GROUP: 'Create new group'
            });
            pipTranslate.setTranslations('ru', {
                DASHBOARD_ADD_COMPONENT_DIALOG_TITLE: 'Добавить компонент',
                DASHBOARD_ADD_COMPONENT_DIALOG_USE_HOT_KEYS: 'Используйте "Enter" или "+" клавиши на клавиатуре чтобы увеличить и "Delete" or "-" чтобы уменшить количество тайлов',
                DASHBOARD_ADD_COMPONENT_DIALOG_CREATE_NEW_GROUP: 'Создать новую группу'
            });
        }
    }
    var AddComponentDialogService = (function () {
        function AddComponentDialogService(widgetList, $mdDialog) {
            this.widgetList = widgetList;
            this.$mdDialog = $mdDialog;
        }
        AddComponentDialogService.prototype.show = function (groups, activeGroupIndex) {
            var _this = this;
            return this.$mdDialog
                .show({
                templateUrl: 'dialogs/add_component/AddComponent.html',
                bindToController: true,
                controller: AddComponentDialogController_1.AddComponentDialogController,
                controllerAs: 'dialogCtrl',
                clickOutsideToClose: true,
                resolve: {
                    groups: function () {
                        return groups;
                    },
                    activeGroupIndex: function () {
                        return activeGroupIndex;
                    },
                    widgetList: function () {
                        return _this.widgetList;
                    }
                }
            });
        };
        ;
        return AddComponentDialogService;
    }());
    var AddComponentDialogProvider = (function () {
        function AddComponentDialogProvider() {
            this._widgetList = null;
            this.configWidgetList = function (list) {
                this._widgetList = list;
            };
        }
        AddComponentDialogProvider.prototype.$get = ['$mdDialog', function ($mdDialog) {
            "ngInject";
            if (this._service == null)
                this._service = new AddComponentDialogService(this._widgetList, $mdDialog);
            return this._service;
        }];
        return AddComponentDialogProvider;
    }());
    angular
        .module('pipDashboard')
        .config(setTranslations)
        .provider('pipAddComponentDialog', AddComponentDialogProvider);
})();
},{"./AddComponentDialogController":4}],6:[function(require,module,exports){
"use strict";
var TileColors = (function () {
    function TileColors() {
    }
    return TileColors;
}());
TileColors.all = ['purple', 'green', 'gray', 'orange', 'blue'];
var TileSizes = (function () {
    function TileSizes() {
    }
    return TileSizes;
}());
TileSizes.all = [{
        name: 'DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_SMALL',
        id: '11'
    },
    {
        name: 'DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_WIDE',
        id: '21'
    },
    {
        name: 'DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_LARGE',
        id: '22'
    }
];
var WidgetConfigDialogController = (function () {
    WidgetConfigDialogController.$inject = ['params', '$mdDialog'];
    function WidgetConfigDialogController(params, $mdDialog) {
        "ngInject";
        var _this = this;
        this.params = params;
        this.$mdDialog = $mdDialog;
        this.colors = TileColors.all;
        this.sizes = TileSizes.all;
        this.sizeId = TileSizes.all[0].id;
        angular.extend(this, this.params);
        this.sizeId = '' + this.params.size.colSpan + this.params.size.rowSpan;
        this.onCancel = function () {
            _this.$mdDialog.cancel();
        };
    }
    WidgetConfigDialogController.prototype.onApply = function (updatedData) {
        this['size'].sizeX = Number(this.sizeId.substr(0, 1));
        this['size'].sizeY = Number(this.sizeId.substr(1, 1));
        this.$mdDialog.hide(updatedData);
    };
    return WidgetConfigDialogController;
}());
exports.WidgetConfigDialogController = WidgetConfigDialogController;
angular
    .module('pipWidgetConfigDialog', ['ngMaterial']);
require("./ConfigDialogService");
require("./ConfigDialogExtendComponent");
},{"./ConfigDialogExtendComponent":7,"./ConfigDialogService":8}],7:[function(require,module,exports){
(function () {
    'use strict';
    var WidgetConfigExtendComponentBindings = {
        pipExtensionUrl: '<',
        pipDialogScope: '<',
        pipApply: '&'
    };
    var WidgetConfigExtendComponentChanges = (function () {
        function WidgetConfigExtendComponentChanges() {
        }
        return WidgetConfigExtendComponentChanges;
    }());
    var WidgetConfigExtendComponentController = (function () {
        function WidgetConfigExtendComponentController($templateRequest, $compile, $scope, $element, $attrs) {
            this.$templateRequest = $templateRequest;
            this.$compile = $compile;
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
        }
        WidgetConfigExtendComponentController.prototype.$onChanges = function (changes) {
            var _this = this;
            if (changes.pipDialogScope) {
                angular.extend(this, changes.pipDialogScope.currentValue);
            }
            if (changes.pipExtensionUrl) {
                this.$templateRequest(changes.pipExtensionUrl.currentValue, false).then(function (html) {
                    _this.$element.find('pip-extension-point').replaceWith(_this.$compile(html)(_this.$scope));
                });
            }
        };
        WidgetConfigExtendComponentController.prototype.onApply = function () {
            this.pipApply({ updatedData: this });
        };
        return WidgetConfigExtendComponentController;
    }());
    var pipWidgetConfigComponent = {
        templateUrl: 'dialogs/widget_config/ConfigDialogExtendComponent.html',
        controller: WidgetConfigExtendComponentController,
        bindings: WidgetConfigExtendComponentBindings
    };
    angular
        .module('pipWidgetConfigDialog')
        .component('pipWidgetConfigExtendComponent', pipWidgetConfigComponent);
})();
},{}],8:[function(require,module,exports){
"use strict";
var ConfigDialogController_1 = require("./ConfigDialogController");
(function () {
    'use strict';
    setTranslations.$inject = ['$injector'];
    function setTranslations($injector) {
        var pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
        if (pipTranslate) {
            pipTranslate.setTranslations('en', {
                DASHBOARD_WIDGET_CONFIG_DIALOG_TITLE: 'Edit tile',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_SMALL: 'Small',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_WIDE: 'Wide',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_LARGE: 'Large'
            });
            pipTranslate.setTranslations('ru', {
                DASHBOARD_WIDGET_CONFIG_DIALOG_TITLE: 'Изменить виджет',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_SMALL: 'Мален.',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_WIDE: 'Широкий',
                DASHBOARD_WIDGET_CONFIG_DIALOG_SIZE_LARGE: 'Большой'
            });
        }
    }
    var WidgetConfigDialogService = (function () {
        WidgetConfigDialogService.$inject = ['$mdDialog'];
        function WidgetConfigDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        WidgetConfigDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: params.templateUrl || 'dialogs/widget_config/ConfigDialog.html',
                controller: ConfigDialogController_1.WidgetConfigDialogController,
                controllerAs: 'vm',
                locals: {
                    params: params
                },
                clickOutsideToClose: true
            })
                .then(function (key) {
                if (successCallback) {
                    successCallback(key);
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return WidgetConfigDialogService;
    }());
    angular
        .module('pipWidgetConfigDialog')
        .config(setTranslations)
        .service('pipWidgetConfigDialogService', WidgetConfigDialogService);
})();
},{"./ConfigDialogController":6}],9:[function(require,module,exports){
"use strict";
angular.module('pipDragged', []);
require("./DraggableTileService");
require("./DraggableComponent");
require("./draggable_group/DraggableTilesGroupService");
require("./draggable_group/DraggableTilesGroupDirective");
},{"./DraggableComponent":10,"./DraggableTileService":11,"./draggable_group/DraggableTilesGroupDirective":12,"./draggable_group/DraggableTilesGroupService":13}],10:[function(require,module,exports){
"use strict";
var DraggableTileService_1 = require("./DraggableTileService");
var DraggableTilesGroupService_1 = require("./draggable_group/DraggableTilesGroupService");
exports.DEFAULT_TILE_WIDTH = 150;
exports.DEFAULT_TILE_HEIGHT = 150;
exports.UPDATE_GROUPS_EVENT = "pipUpdateDashboardGroupsConfig";
var SIMPLE_LAYOUT_COLUMNS_COUNT = 2;
var DEFAULT_OPTIONS = {
    tileWidth: exports.DEFAULT_TILE_WIDTH,
    tileHeight: exports.DEFAULT_TILE_HEIGHT,
    gutter: 20,
    container: 'pip-draggable-grid:first-of-type',
    activeDropzoneClass: 'dropzone-active',
    groupContaninerSelector: '.pip-draggable-group:not(.fict-group)',
};
{
    var DraggableController = (function () {
        function DraggableController($scope, $rootScope, $compile, $timeout, $element, pipDragTile, pipTilesGrid, pipMedia) {
            var _this = this;
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$compile = $compile;
            this.$timeout = $timeout;
            this.$element = $element;
            this.sourceDropZoneElem = null;
            this.isSameDropzone = true;
            this.tileGroups = null;
            this.opts = _.merge({
                mobileBreakpoint: pipMedia.breakpoints.xs
            }, DEFAULT_OPTIONS, $scope['draggableCtrl'].options);
            this.groups = $scope['draggableCtrl'].tilesTemplates.map(function (group, groupIndex) {
                return {
                    title: group.title,
                    editingName: false,
                    index: groupIndex,
                    source: group.source.map(function (tile) {
                        var tileScope = _this.createTileScope(tile);
                        return DraggableTileService_1.IDragTileConstructor(DraggableTileService_1.DragTileService, {
                            tpl: $compile(tile.template)(tileScope),
                            options: tile.opts,
                            size: tile.opts.size
                        });
                    })
                };
            });
            $scope.$watch('draggableCtrl.tilesTemplates', function (newVal) {
                _this.watch(newVal);
            }, true);
            this.initialize();
            $(window).on('resize', _.debounce(function () {
                _this.availableWidth = _this.getContainerWidth();
                _this.availableColumns = _this.getAvailableColumns(_this.availableWidth);
                _this.tileGroups.forEach(function (group) {
                    group
                        .setAvailableColumns(_this.availableColumns)
                        .generateGrid(_this.getSingleTileWidthForMobile(_this.availableWidth))
                        .setTilesDimensions()
                        .calcContainerHeight();
                });
            }, 50));
        }
        DraggableController.prototype.$postLink = function () {
            this.$scope.$container = this.$element;
        };
        DraggableController.prototype.watch = function (newVal) {
            var _this = this;
            var prevVal = this.groups;
            var changedGroupIndex = null;
            if (newVal.length > prevVal.length) {
                this.addGroup(newVal[newVal.length - 1]);
                return;
            }
            if (newVal.length < prevVal.length) {
                this.removeGroups(newVal);
                return;
            }
            for (var i = 0; i < newVal.length; i++) {
                var groupWidgetDiff = prevVal[i].source.length - newVal[i].source.length;
                if (groupWidgetDiff || (newVal[i].removedWidgets && newVal[i].removedWidgets.length > 0)) {
                    changedGroupIndex = i;
                    if (groupWidgetDiff < 0) {
                        var newTiles = newVal[changedGroupIndex].source.slice(groupWidgetDiff);
                        _.each(newTiles, function (tile) {
                            console.log('tile', tile);
                        });
                        this.addTilesIntoGroup(newTiles, this.tileGroups[changedGroupIndex], this.groupsContainers[changedGroupIndex]);
                        this.$timeout(function () {
                            _this.updateTilesGroups();
                        });
                    }
                    else {
                        this.removeTiles(this.tileGroups[changedGroupIndex], newVal[changedGroupIndex].removedWidgets, this.groupsContainers[changedGroupIndex]);
                        this.updateTilesOptions(newVal);
                        this.$timeout(function () {
                            _this.updateTilesGroups();
                        });
                    }
                    return;
                }
            }
            if (newVal && this.tileGroups) {
                this.updateTilesOptions(newVal);
                this.$timeout(function () {
                    _this.updateTilesGroups();
                });
            }
        };
        DraggableController.prototype.onTitleClick = function (group, event) {
            if (!group.editingName) {
                group.oldTitle = _.clone(group.title);
                group.editingName = true;
                this.$timeout(function () {
                    $(event.currentTarget.children[0]).focus();
                });
            }
        };
        DraggableController.prototype.cancelEditing = function (group) {
            group.title = group.oldTitle;
        };
        DraggableController.prototype.onBlurTitleInput = function (group) {
            var _this = this;
            this.$timeout(function () {
                group.editingName = false;
                _this.$rootScope.$broadcast(exports.UPDATE_GROUPS_EVENT, _this.groups);
                _this.$scope.draggableCtrl.tilesTemplates[group.index].title = group.title;
            }, 100);
        };
        DraggableController.prototype.onKyepressTitleInput = function (group, event) {
            if (event.keyCode === 13) {
                this.onBlurTitleInput(group);
            }
        };
        DraggableController.prototype.updateTilesTemplates = function (updateType, source) {
            switch (updateType) {
                case 'addGroup':
                    if (this.groups.length !== this.$scope.draggableCtrl.tilesTemplates.length) {
                        this.$scope.draggableCtrl.tilesTemplates.push(source);
                    }
                    break;
                case 'moveTile':
                    var _a = {
                        fromIndex: source.from.elem.attributes['data-group-id'].value,
                        toIndex: source.to.elem.attributes['data-group-id'].value,
                        tileOptions: source.tile.opts.options,
                        fromTileIndex: source.tile.opts.options.index
                    }, fromIndex = _a.fromIndex, toIndex = _a.toIndex, tileOptions = _a.tileOptions, fromTileIndex = _a.fromTileIndex;
                    this.$scope.draggableCtrl.tilesTemplates[fromIndex].source.splice(fromTileIndex, 1);
                    this.$scope.draggableCtrl.tilesTemplates[toIndex].source.push({
                        opts: tileOptions
                    });
                    this.reIndexTiles(source.from.elem);
                    this.reIndexTiles(source.to.elem);
                    break;
            }
        };
        DraggableController.prototype.createTileScope = function (tile) {
            var tileScope = this.$rootScope.$new(false, this.$scope.draggableCtrl.tilesContext);
            tileScope.index = tile.opts.index == undefined ? tile.opts.options.index : tile.opts.index;
            tileScope.groupIndex = tile.opts.groupIndex == undefined ? tile.opts.options.groupIndex : tile.opts.groupIndex;
            return tileScope;
        };
        DraggableController.prototype.removeTiles = function (group, indexes, container) {
            var tiles = $(container).find('.pip-draggable-tile');
            _.each(indexes, function (index) {
                group.tiles.splice(index, 1);
                tiles[index].remove();
            });
            this.reIndexTiles(container);
        };
        DraggableController.prototype.reIndexTiles = function (container, gIndex) {
            var tiles = $(container).find('.pip-draggable-tile'), groupIndex = gIndex === undefined ? container.attributes['data-group-id'].value : gIndex;
            _.each(tiles, function (tile, index) {
                var child = $(tile).children()[0];
                angular.element(child).scope()['index'] = index;
                angular.element(child).scope()['groupIndex'] = groupIndex;
            });
        };
        DraggableController.prototype.removeGroups = function (newGroups) {
            var _this = this;
            var removeIndexes = [], remain = [], containers = [];
            _.each(this.groups, function (group, index) {
                if (_.findIndex(newGroups, function (g) {
                    return g['title'] === group.title;
                }) < 0) {
                    removeIndexes.push(index);
                }
                else {
                    remain.push(index);
                }
            });
            _.each(removeIndexes.reverse(), function (index) {
                _this.groups.splice(index, 1);
                _this.tileGroups.splice(index, 1);
            });
            _.each(remain, function (index) {
                containers.push(_this.groupsContainers[index]);
            });
            this.groupsContainers = containers;
            _.each(this.groupsContainers, function (container, index) {
                _this.reIndexTiles(container, index);
            });
        };
        DraggableController.prototype.addGroup = function (sourceGroup) {
            var _this = this;
            var group = {
                title: sourceGroup.title,
                source: sourceGroup.source.map(function (tile) {
                    var tileScope = _this.createTileScope(tile);
                    return DraggableTileService_1.IDragTileConstructor(DraggableTileService_1.DragTileService, {
                        tpl: _this.$compile(tile.template)(tileScope),
                        options: tile.opts,
                        size: tile.opts.size
                    });
                })
            };
            this.groups.push(group);
            if (!this.$scope.$$phase)
                this.$scope.$apply();
            this.$timeout(function () {
                _this.groupsContainers = document.querySelectorAll(_this.opts.groupContaninerSelector);
                _this.tileGroups.push(DraggableTilesGroupService_1.ITilesGridConstructor(DraggableTilesGroupService_1.TilesGridService, group.source, _this.opts, _this.availableColumns, _this.groupsContainers[_this.groupsContainers.length - 1])
                    .generateGrid(_this.getSingleTileWidthForMobile(_this.availableWidth))
                    .setTilesDimensions()
                    .calcContainerHeight());
            });
            this.updateTilesTemplates('addGroup', sourceGroup);
        };
        DraggableController.prototype.addTilesIntoGroup = function (newTiles, group, groupContainer) {
            var _this = this;
            newTiles.forEach(function (tile) {
                var tileScope = _this.createTileScope(tile);
                var newTile = DraggableTileService_1.IDragTileConstructor(DraggableTileService_1.DragTileService, {
                    tpl: _this.$compile(tile.template)(tileScope),
                    options: tile.opts,
                    size: tile.opts.size
                });
                group.addTile(newTile);
                $('<div>')
                    .addClass('pip-draggable-tile')
                    .append(newTile.getCompiledTemplate())
                    .appendTo(groupContainer);
            });
        };
        DraggableController.prototype.updateTilesOptions = function (optionsGroup) {
            var _this = this;
            optionsGroup.forEach(function (optionGroup) {
                optionGroup.source.forEach(function (tileOptions) {
                    _this.tileGroups.forEach(function (group) {
                        group.updateTileOptions(tileOptions.opts);
                    });
                });
            });
        };
        DraggableController.prototype.initTilesGroups = function (tileGroups, opts, groupsContainers) {
            var _this = this;
            return tileGroups.map(function (group, index) {
                return DraggableTilesGroupService_1.ITilesGridConstructor(DraggableTilesGroupService_1.TilesGridService, group.source, opts, _this.availableColumns, groupsContainers[index])
                    .generateGrid(_this.getSingleTileWidthForMobile(_this.availableWidth))
                    .setTilesDimensions()
                    .calcContainerHeight();
            });
        };
        DraggableController.prototype.updateTilesGroups = function (onlyPosition, draggedTile) {
            var _this = this;
            this.tileGroups.forEach(function (group) {
                if (!onlyPosition) {
                    group.generateGrid(_this.getSingleTileWidthForMobile(_this.availableWidth));
                }
                group
                    .setTilesDimensions(onlyPosition, draggedTile)
                    .calcContainerHeight();
            });
        };
        DraggableController.prototype.getContainerWidth = function () {
            var container = this.$scope.$container || $('body');
            return container.width();
        };
        DraggableController.prototype.getAvailableColumns = function (availableWidth) {
            return this.opts.mobileBreakpoint > availableWidth ? SIMPLE_LAYOUT_COLUMNS_COUNT :
                Math.floor(availableWidth / (this.opts.tileWidth + this.opts.gutter));
        };
        DraggableController.prototype.getActiveGroupAndTile = function (elem) {
            var active = {};
            this.tileGroups.forEach(function (group) {
                var foundTile = group.getTileByNode(elem);
                if (foundTile) {
                    active['group'] = group;
                    active['tile'] = foundTile;
                    return;
                }
            });
            return active;
        };
        DraggableController.prototype.getSingleTileWidthForMobile = function (availableWidth) {
            return this.opts.mobileBreakpoint > availableWidth ? availableWidth / 2 - this.opts.gutter : null;
        };
        DraggableController.prototype.onDragStartListener = function (event) {
            var activeEntities = this.getActiveGroupAndTile(event.target);
            this.container = $(event.target).parent('.pip-draggable-group').get(0);
            this.draggedTile = activeEntities['tile'];
            this.activeDraggedGroup = activeEntities['group'];
            this.$element.addClass('drag-transfer');
            this.draggedTile.startDrag();
        };
        DraggableController.prototype.onDragMoveListener = function (event) {
            var _this = this;
            var target = event.target;
            var x = (parseFloat(target.style.left) || 0) + event.dx;
            var y = (parseFloat(target.style.top) || 0) + event.dy;
            this.containerOffset = this.getContainerOffset();
            target.style.left = x + 'px';
            target.style.top = y + 'px';
            var belowElement = this.activeDraggedGroup.getTileByCoordinates({
                left: event.pageX - this.containerOffset.left,
                top: event.pageY - this.containerOffset.top
            }, this.draggedTile);
            if (belowElement) {
                var draggedTileIndex = this.activeDraggedGroup.getTileIndex(this.draggedTile);
                var belowElemIndex = this.activeDraggedGroup.getTileIndex(belowElement);
                if ((draggedTileIndex + 1) === belowElemIndex) {
                    return;
                }
                this.activeDraggedGroup
                    .swapTiles(this.draggedTile, belowElement)
                    .setTilesDimensions(true, this.draggedTile);
                this.$timeout(function () {
                    _this.setGroupContainersHeight();
                }, 0);
            }
        };
        DraggableController.prototype.onDragEndListener = function () {
            this.draggedTile.stopDrag(this.isSameDropzone);
            this.$element.removeClass('drag-transfer');
            this.activeDraggedGroup = null;
            this.draggedTile = null;
        };
        DraggableController.prototype.getContainerOffset = function () {
            var containerRect = this.container.getBoundingClientRect();
            return {
                left: containerRect.left,
                top: containerRect.top
            };
        };
        DraggableController.prototype.setGroupContainersHeight = function () {
            this.tileGroups.forEach(function (tileGroup) {
                tileGroup.calcContainerHeight();
            });
        };
        DraggableController.prototype.moveTile = function (from, to, tile) {
            var elem;
            var movedTile = from.removeTile(tile);
            var tileScope = this.createTileScope(tile);
            $(this.groupsContainers[_.findIndex(this.tileGroups, from)])
                .find(movedTile.getElem())
                .remove();
            if (to !== null) {
                to.addTile(movedTile);
                elem = this.$compile(movedTile.getElem())(tileScope);
                $(this.groupsContainers[_.findIndex(this.tileGroups, to)])
                    .append(elem);
                this.$timeout(to.setTilesDimensions.bind(to, true));
            }
            this.updateTilesTemplates('moveTile', {
                from: from,
                to: to,
                tile: movedTile
            });
        };
        DraggableController.prototype.onDropListener = function (event) {
            var droppedGroupIndex = event.target.attributes['data-group-id'].value;
            var droppedGroup = this.tileGroups[droppedGroupIndex];
            if (this.activeDraggedGroup !== droppedGroup) {
                this.moveTile(this.activeDraggedGroup, droppedGroup, this.draggedTile);
            }
            this.updateTilesGroups(true);
            this.sourceDropZoneElem = null;
        };
        DraggableController.prototype.onDropToFictGroupListener = function (event) {
            var _this = this;
            var from = this.activeDraggedGroup;
            var tile = this.draggedTile;
            this.addGroup({
                title: 'New group',
                source: []
            });
            this.$timeout(function () {
                _this.moveTile(from, _this.tileGroups[_this.tileGroups.length - 1], tile);
                _this.updateTilesGroups(true);
            });
            this.sourceDropZoneElem = null;
        };
        DraggableController.prototype.onDropEnterListener = function (event) {
            if (!this.sourceDropZoneElem) {
                this.sourceDropZoneElem = event.dragEvent.dragEnter;
            }
            if (this.sourceDropZoneElem !== event.dragEvent.dragEnter) {
                event.dragEvent.dragEnter.classList.add('dropzone-active');
                $('body').css('cursor', 'copy');
                this.isSameDropzone = false;
            }
            else {
                $('body').css('cursor', '');
                this.isSameDropzone = true;
            }
        };
        DraggableController.prototype.onDropDeactivateListener = function (event) {
            if (this.sourceDropZoneElem !== event.target) {
                event.target.classList.remove(this.opts.activeDropzoneClass);
                $('body').css('cursor', '');
            }
        };
        DraggableController.prototype.onDropLeaveListener = function (event) {
            event.target.classList.remove(this.opts.activeDropzoneClass);
        };
        DraggableController.prototype.initialize = function () {
            var _this = this;
            this.$timeout(function () {
                _this.availableWidth = _this.getContainerWidth();
                _this.availableColumns = _this.getAvailableColumns(_this.availableWidth);
                _this.groupsContainers = document.querySelectorAll(_this.opts.groupContaninerSelector);
                _this.tileGroups = _this.initTilesGroups(_this.groups, _this.opts, _this.groupsContainers);
                interact('.pip-draggable-tile')
                    .draggable({
                    autoScroll: true,
                    onstart: function (event) {
                        _this.onDragStartListener(event);
                    },
                    onmove: function (event) {
                        _this.onDragMoveListener(event);
                    },
                    onend: function (event) {
                        _this.onDragEndListener();
                    }
                });
                interact('.pip-draggable-group.fict-group')
                    .dropzone({
                    ondrop: function (event) {
                        _this.onDropToFictGroupListener(event);
                    },
                    ondragenter: function (event) {
                        _this.onDropEnterListener(event);
                    },
                    ondropdeactivate: function (event) {
                        _this.onDropDeactivateListener(event);
                    },
                    ondragleave: function (event) {
                        _this.onDropLeaveListener(event);
                    }
                });
                interact('.pip-draggable-group')
                    .dropzone({
                    ondrop: function (event) {
                        _this.onDropListener(event);
                    },
                    ondragenter: function (event) {
                        _this.onDropEnterListener(event);
                    },
                    ondropdeactivate: function (event) {
                        _this.onDropDeactivateListener(event);
                    },
                    ondragleave: function (event) {
                        _this.onDropLeaveListener(event);
                    }
                });
                _this.$scope['$container']
                    .on('mousedown touchstart', 'md-menu .md-icon-button', function () {
                    interact('.pip-draggable-tile').draggable(false);
                    $(_this).trigger('click');
                })
                    .on('mouseup touchend', function () {
                    interact('.pip-draggable-tile').draggable(true);
                });
            }, 0);
        };
        return DraggableController;
    }());
    var DragComponent = {
        bindings: {
            tilesTemplates: '=pipTilesTemplates',
            tilesContext: '=pipTilesContext',
            options: '=pipDraggableGrid',
            groupMenuActions: '=pipGroupMenuActions'
        },
        templateUrl: 'draggable/Draggable.html',
        controllerAs: 'draggableCtrl',
        controller: DraggableController
    };
    angular.module('pipDragged')
        .component('pipDraggableGrid', DragComponent);
}
},{"./DraggableTileService":11,"./draggable_group/DraggableTilesGroupService":13}],11:[function(require,module,exports){
'use strict';
function IDragTileConstructor(constructor, options) {
    return new constructor(options);
}
exports.IDragTileConstructor = IDragTileConstructor;
var DEFAULT_TILE_SIZE = {
    colSpan: 1,
    rowSpan: 1
};
var DragTileService = (function () {
    function DragTileService(options) {
        this.tpl = options.tpl.get(0);
        this.opts = options;
        this.size = _.merge({}, DEFAULT_TILE_SIZE, options.size);
        this.elem = null;
    }
    DragTileService.prototype.getSize = function () {
        return this.size;
    };
    DragTileService.prototype.setSize = function (width, height) {
        this.size.width = width;
        this.size.height = height;
        if (this.elem) {
            this.elem.css({
                width: width,
                height: height
            });
        }
        return this;
    };
    DragTileService.prototype.setPosition = function (left, top) {
        this.size.left = left;
        this.size.top = top;
        if (this.elem) {
            this.elem.css({
                left: left,
                top: top
            });
        }
        return this;
    };
    DragTileService.prototype.getCompiledTemplate = function () {
        return this.tpl;
    };
    ;
    DragTileService.prototype.updateElem = function (parent) {
        this.elem = $(this.tpl).parent(parent);
        return this;
    };
    ;
    DragTileService.prototype.getElem = function () {
        return this.elem.get(0);
    };
    ;
    DragTileService.prototype.startDrag = function () {
        this.preview = $('<div>')
            .addClass('pip-dragged-preview')
            .css({
            position: 'absolute',
            left: this.elem.css('left'),
            top: this.elem.css('top'),
            width: this.elem.css('width'),
            height: this.elem.css('height')
        });
        this.elem
            .addClass('no-animation')
            .css({
            zIndex: '9999'
        })
            .after(this.preview);
        return this;
    };
    ;
    DragTileService.prototype.stopDrag = function (isAnimate) {
        var self = this;
        if (isAnimate) {
            this.elem
                .removeClass('no-animation')
                .css({
                left: this.preview.css('left'),
                top: this.preview.css('top')
            })
                .on('transitionend', onTransitionEnd);
        }
        else {
            self.elem
                .css({
                left: self.preview.css('left'),
                top: self.preview.css('top'),
                zIndex: ''
            })
                .removeClass('no-animation');
            self.preview.remove();
            self.preview = null;
        }
        return this;
        function onTransitionEnd() {
            if (self.preview) {
                self.preview.remove();
                self.preview = null;
            }
            self.elem
                .css('zIndex', '')
                .off('transitionend', onTransitionEnd);
        }
    };
    ;
    DragTileService.prototype.setPreviewPosition = function (coords) {
        this.preview.css(coords);
    };
    ;
    DragTileService.prototype.getOptions = function () {
        return this.opts.options;
    };
    ;
    DragTileService.prototype.setOptions = function (options) {
        _.merge(this.opts.options, options);
        _.merge(this.size, options.size);
        return this;
    };
    ;
    return DragTileService;
}());
exports.DragTileService = DragTileService;
angular
    .module('pipDragged')
    .service('pipDragTile', function () {
    return function (options) {
        var newTile = new DragTileService(options);
        return newTile;
    };
});
},{}],12:[function(require,module,exports){
{
    function DraggableTileLink($scope, $elem, $attr) {
        var docFrag = document.createDocumentFragment(), group = $scope.$eval($attr.pipDraggableTiles);
        group.forEach(function (tile) {
            var tpl = wrapComponent(tile.getCompiledTemplate());
            docFrag.appendChild(tpl);
        });
        $elem.append(docFrag);
        function wrapComponent(elem) {
            return $('<div>')
                .addClass('pip-draggable-tile')
                .append(elem)
                .get(0);
        }
    }
    function DraggableTile() {
        return {
            restrict: 'A',
            link: DraggableTileLink
        };
    }
    angular
        .module('pipDragged')
        .directive('pipDraggableTiles', DraggableTile);
}
},{}],13:[function(require,module,exports){
"use strict";
function ITilesGridConstructor(constructor, tiles, options, columns, elem) {
    return new constructor(tiles, options, columns, elem);
}
exports.ITilesGridConstructor = ITilesGridConstructor;
var MOBILE_LAYOUT_COLUMNS = 2;
var TilesGridService = (function () {
    function TilesGridService(tiles, options, columns, elem) {
        this.gridCells = [];
        this.inline = false;
        this.tiles = tiles;
        this.opts = options;
        this.columns = columns || 0;
        this.elem = elem;
        this.gridCells = [];
        this.inline = options.inline || false;
        this.isMobileLayout = columns === MOBILE_LAYOUT_COLUMNS;
    }
    TilesGridService.prototype.addTile = function (tile) {
        this.tiles.push(tile);
        if (this.tiles.length === 1) {
            this.generateGrid();
        }
        return this;
    };
    ;
    TilesGridService.prototype.getCellByPosition = function (row, col) {
        return this.gridCells[row][col];
    };
    ;
    TilesGridService.prototype.getCells = function (prevCell, rowSpan, colSpan) {
        if (this.isMobileLayout) {
            return this.getAvailableCellsMobile(prevCell, rowSpan, colSpan);
        }
        else {
            return this.getAvailableCellsDesktop(prevCell, rowSpan, colSpan);
        }
    };
    ;
    TilesGridService.prototype.getAvailableCellsDesktop = function (prevCell, rowSpan, colSpan) {
        var leftCornerCell;
        var rightCornerCell;
        var basicCol = prevCell && prevCell.col || 0;
        var basicRow = this.getBasicRow(prevCell);
        if (colSpan === 1 && rowSpan === 1) {
            var gridCopy = this.gridCells.slice();
            if (!prevCell) {
                leftCornerCell = gridCopy[0][0];
            }
            else {
                leftCornerCell = this.getCell(gridCopy, basicRow, basicCol, this.columns);
                if (!leftCornerCell) {
                    var rowShift = this.isMobileLayout ? 1 : 2;
                    leftCornerCell = this.getCell(gridCopy, basicRow + rowShift, 0, this.columns);
                }
            }
        }
        if (colSpan === 2 && rowSpan === 1) {
            var prevTileSize = prevCell && prevCell.elem.size || null;
            if (!prevTileSize) {
                leftCornerCell = this.getCellByPosition(basicRow, basicCol);
                rightCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
            }
            else if (prevTileSize.colSpan === 2 && prevTileSize.rowSpan === 2) {
                if (this.columns - basicCol - 2 > 0) {
                    leftCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
                    rightCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
                }
                else {
                    leftCornerCell = this.getCellByPosition(basicRow + 2, 0);
                    rightCornerCell = this.getCellByPosition(basicRow + 2, 1);
                }
            }
            else if (prevTileSize.colSpan === 2 && prevTileSize.rowSpan === 1) {
                if (prevCell.row % 2 === 0) {
                    leftCornerCell = this.getCellByPosition(basicRow + 1, basicCol - 1);
                    rightCornerCell = this.getCellByPosition(basicRow + 1, basicCol);
                }
                else {
                    if (this.columns - basicCol - 3 >= 0) {
                        leftCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
                        rightCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
                    }
                    else {
                        leftCornerCell = this.getCellByPosition(basicRow + 2, 0);
                        rightCornerCell = this.getCellByPosition(basicRow + 2, 1);
                    }
                }
            }
            else if (prevTileSize.colSpan === 1 && prevTileSize.rowSpan === 1) {
                if (this.columns - basicCol - 3 >= 0) {
                    if (this.isCellFree(basicRow, basicCol + 1)) {
                        leftCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
                        rightCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
                    }
                    else {
                        leftCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
                        rightCornerCell = this.getCellByPosition(basicRow, basicCol + 3);
                    }
                }
                else {
                    leftCornerCell = this.getCellByPosition(basicRow + 2, 0);
                    rightCornerCell = this.getCellByPosition(basicRow + 2, 1);
                }
            }
        }
        if (!prevCell && rowSpan === 2 && colSpan === 2) {
            leftCornerCell = this.getCellByPosition(basicRow, basicCol);
            rightCornerCell = this.getCellByPosition(basicRow + 1, basicCol + 1);
        }
        else if (rowSpan === 2 && colSpan === 2) {
            if (this.columns - basicCol - 2 > 0) {
                if (this.isCellFree(basicRow, basicCol + 1)) {
                    leftCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
                    rightCornerCell = this.getCellByPosition(basicRow + 1, basicCol + 2);
                }
                else {
                    leftCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
                    rightCornerCell = this.getCellByPosition(basicRow + 1, basicCol + 3);
                }
            }
            else {
                leftCornerCell = this.getCellByPosition(basicRow + 2, 0);
                rightCornerCell = this.getCellByPosition(basicRow + 3, 1);
            }
        }
        return {
            start: leftCornerCell,
            end: rightCornerCell
        };
    };
    ;
    TilesGridService.prototype.getCell = function (src, basicRow, basicCol, columns) {
        var cell, col, row;
        if (this.isMobileLayout) {
            for (col = basicCol; col < columns; col++) {
                if (!src[basicRow][col].elem) {
                    cell = src[basicRow][col];
                    break;
                }
            }
            return cell;
        }
        for (col = basicCol; col < columns; col++) {
            for (row = 0; row < 2; row++) {
                if (!src[row + basicRow][col].elem) {
                    cell = src[row + basicRow][col];
                    break;
                }
            }
            if (cell) {
                return cell;
            }
        }
    };
    ;
    TilesGridService.prototype.getAvailableCellsMobile = function (prevCell, rowSpan, colSpan) {
        var leftCornerCell;
        var rightCornerCell;
        var basicRow = this.getBasicRow(prevCell);
        var basicCol = prevCell && prevCell.col || 0;
        if (colSpan === 1 && rowSpan === 1) {
            var gridCopy = this.gridCells.slice();
            if (!prevCell) {
                leftCornerCell = gridCopy[0][0];
            }
            else {
                leftCornerCell = this.getCell(gridCopy, basicRow, basicCol, this.columns);
                if (!leftCornerCell) {
                    var rowShift = this.isMobileLayout ? 1 : 2;
                    leftCornerCell = this.getCell(gridCopy, basicRow + rowShift, 0, this.columns);
                }
            }
        }
        if (!prevCell) {
            leftCornerCell = this.getCellByPosition(basicRow, 0);
            rightCornerCell = this.getCellByPosition(basicRow + rowSpan - 1, 1);
        }
        else if (colSpan === 2) {
            leftCornerCell = this.getCellByPosition(basicRow + 1, 0);
            rightCornerCell = this.getCellByPosition(basicRow + rowSpan, 1);
        }
        return {
            start: leftCornerCell,
            end: rightCornerCell
        };
    };
    ;
    TilesGridService.prototype.getBasicRow = function (prevCell) {
        var basicRow;
        if (this.isMobileLayout) {
            if (prevCell) {
                basicRow = prevCell && prevCell.row || 0;
            }
            else {
                basicRow = 0;
            }
        }
        else {
            if (prevCell) {
                basicRow = prevCell.row % 2 === 0 ? prevCell.row : prevCell.row - 1;
            }
            else {
                basicRow = 0;
            }
        }
        return basicRow;
    };
    ;
    TilesGridService.prototype.isCellFree = function (row, col) {
        return !this.gridCells[row][col].elem;
    };
    ;
    TilesGridService.prototype.getCellIndex = function (srcCell) {
        var self = this;
        var index;
        this.gridCells.forEach(function (row, rowIndex) {
            index = _.findIndex(self.gridCells[rowIndex], function (cell) {
                return cell === srcCell;
            });
            if (index !== -1) {
                return;
            }
        });
        return index !== -1 ? index : 0;
    };
    ;
    TilesGridService.prototype.reserveCells = function (start, end, elem) {
        this.gridCells.forEach(function (row) {
            row.forEach(function (cell) {
                if (cell.row >= start.row && cell.row <= end.row &&
                    cell.col >= start.col && cell.col <= end.col) {
                    cell.elem = elem;
                }
            });
        });
    };
    ;
    TilesGridService.prototype.clearElements = function () {
        this.gridCells.forEach(function (row) {
            row.forEach(function (tile) {
                tile.elem = null;
            });
        });
    };
    ;
    TilesGridService.prototype.setAvailableColumns = function (columns) {
        this.isMobileLayout = columns === MOBILE_LAYOUT_COLUMNS;
        this.columns = columns;
        return this;
    };
    ;
    TilesGridService.prototype.generateGrid = function (singleTileWidth) {
        var self = this, tileWidth = singleTileWidth || this.opts.tileWidth, offset = document.querySelector('.pip-draggable-group-title').getBoundingClientRect();
        var colsInRow = 0, rows = 0, gridInRow = [];
        this.gridCells = [];
        this.tiles.forEach(function (tile, index, srcTiles) {
            var tileSize = tile.getSize();
            generateCells(tileSize.colSpan);
            if (srcTiles.length === index + 1) {
                if (colsInRow < self.columns) {
                    generateCells(self.columns - colsInRow);
                }
                if (self.tiles.length * 2 > self.gridCells.length) {
                    Array.apply(null, Array(self.tiles.length * 2 - self.gridCells.length)).forEach(function () {
                        generateCells(self.columns);
                    });
                }
            }
        });
        function generateCells(newCellCount) {
            Array.apply(null, Array(newCellCount)).forEach(function () {
                if (self.columns < colsInRow + 1) {
                    rows++;
                    colsInRow = 0;
                    self.gridCells.push(gridInRow);
                    gridInRow = [];
                }
                var top = rows * self.opts.tileHeight + (rows ? rows * self.opts.gutter : 0) + offset.height;
                var left = colsInRow * tileWidth + (colsInRow ? colsInRow * self.opts.gutter : 0);
                gridInRow.push({
                    top: top,
                    left: left,
                    bottom: top + self.opts.tileHeight,
                    right: left + tileWidth,
                    row: rows,
                    col: colsInRow
                });
                colsInRow++;
            });
        }
        return this;
    };
    ;
    TilesGridService.prototype.setTilesDimensions = function (onlyPosition, draggedTile) {
        var self = this;
        var currIndex = 0;
        var prevCell;
        if (onlyPosition) {
            self.clearElements();
        }
        this.tiles.forEach(function (tile) {
            var tileSize = tile.getSize();
            var startCell;
            var width;
            var height;
            var cells;
            tile.updateElem('.pip-draggable-tile');
            if (tileSize.colSpan === 1) {
                if (prevCell && prevCell.elem.size.colSpan === 2 && prevCell.elem.size.rowSpan === 1) {
                    startCell = self.getCells(self.getCellByPosition(prevCell.row, prevCell.col - 1), 1, 1).start;
                }
                else {
                    startCell = self.getCells(prevCell, 1, 1).start;
                }
                if (!onlyPosition) {
                    width = startCell.right - startCell.left;
                    height = startCell.bottom - startCell.top;
                }
                prevCell = startCell;
                self.reserveCells(startCell, startCell, tile);
                currIndex++;
            }
            else if (tileSize.colSpan === 2) {
                cells = self.getCells(prevCell, tileSize.rowSpan, tileSize.colSpan);
                startCell = cells.start;
                if (!onlyPosition) {
                    width = cells.end.right - cells.start.left;
                    height = cells.end.bottom - cells.start.top;
                }
                prevCell = cells.end;
                self.reserveCells(cells.start, cells.end, tile);
                currIndex += 2;
            }
            if (draggedTile === tile) {
                tile.setPreviewPosition({
                    left: startCell.left,
                    top: startCell.top
                });
                return;
            }
            if (!onlyPosition) {
                tile.setSize(width, height);
            }
            tile.setPosition(startCell.left, startCell.top);
        });
        return this;
    };
    ;
    TilesGridService.prototype.calcContainerHeight = function () {
        var maxHeightSize, maxWidthSize;
        if (!this.tiles.length) {
            return this;
        }
        maxHeightSize = _.maxBy(this.tiles, function (tile) {
            var tileSize = tile['getSize']();
            return tileSize.top + tileSize.height;
        })['getSize']();
        this.elem.style.height = maxHeightSize.top + maxHeightSize.height + 'px';
        if (this.inline) {
            maxWidthSize = _.maxBy(this.tiles, function (tile) {
                var tileSize = tile['getSize']();
                return tileSize.left + tileSize.width;
            })['getSize']();
            this.elem.style.width = maxWidthSize.left + maxWidthSize.width + 'px';
        }
        return this;
    };
    ;
    TilesGridService.prototype.getTileByNode = function (node) {
        var foundTile = this.tiles.filter(function (tile) {
            return node === tile.getElem();
        });
        return foundTile.length ? foundTile[0] : null;
    };
    ;
    TilesGridService.prototype.getTileByCoordinates = function (coords, draggedTile) {
        return this.tiles
            .filter(function (tile) {
            var tileSize = tile.getSize();
            return tile !== draggedTile &&
                tileSize.left <= coords.left && coords.left <= (tileSize.left + tileSize.width) &&
                tileSize.top <= coords.top && coords.top <= (tileSize.top + tileSize.height);
        })[0] || null;
    };
    ;
    TilesGridService.prototype.getTileIndex = function (tile) {
        return _.findIndex(this.tiles, tile);
    };
    ;
    TilesGridService.prototype.swapTiles = function (movedTile, beforeTile) {
        var movedTileIndex = _.findIndex(this.tiles, movedTile);
        var beforeTileIndex = _.findIndex(this.tiles, beforeTile);
        this.tiles.splice(movedTileIndex, 1);
        this.tiles.splice(beforeTileIndex, 0, movedTile);
        return this;
    };
    ;
    TilesGridService.prototype.removeTile = function (removeTile) {
        var droppedTile;
        this.tiles.forEach(function (tile, index, tiles) {
            if (tile === removeTile) {
                droppedTile = tiles.splice(index, 1)[0];
                return false;
            }
        });
        return droppedTile;
    };
    ;
    TilesGridService.prototype.updateTileOptions = function (opts) {
        var index = _.findIndex(this.tiles, function (tile) {
            return tile['getOptions']() === opts;
        });
        if (index !== -1) {
            this.tiles[index].setOptions(opts);
            return true;
        }
        return false;
    };
    ;
    return TilesGridService;
}());
exports.TilesGridService = TilesGridService;
angular
    .module('pipDragged')
    .service('pipTilesGrid', function () {
    return function (tiles, options, columns, elem) {
        var newGrid = new TilesGridService(tiles, options, columns, elem);
        return newGrid;
    };
});
},{}],14:[function(require,module,exports){
"use strict";
{
    var widgetTemplateService = (function () {
        widgetTemplateService.$inject = ['$interpolate', '$compile', '$templateRequest'];
        function widgetTemplateService($interpolate, $compile, $templateRequest) {
            this._$interpolate = $interpolate;
            this._$compile = $compile;
            this._$templateRequest = $templateRequest;
        }
        widgetTemplateService.prototype.getTemplate = function (source, tpl, tileScope, strictCompile) {
            var _this = this;
            var template = source.template, templateUrl = source.templateUrl, type = source.type;
            var result;
            if (type) {
                var interpolated = tpl ? this._$interpolate(tpl)(source) : this._$interpolate(template)(source);
                return strictCompile == true ?
                    (tileScope ? this._$compile(interpolated)(tileScope) : this._$compile(interpolated)) :
                    interpolated;
            }
            if (template) {
                return tileScope ? this._$compile(template)(tileScope) : this._$compile(template);
            }
            if (templateUrl) {
                this._$templateRequest(templateUrl, false).then(function (html) {
                    result = tileScope ? _this._$compile(html)(tileScope) : _this._$compile(html);
                });
            }
            return result;
        };
        widgetTemplateService.prototype.setImageMarginCSS = function ($element, image) {
            var containerWidth = $element.width ? $element.width() : $element.clientWidth, containerHeight = $element.height ? $element.height() : $element.clientHeight, imageWidth = (image[0] ? image[0].naturalWidth : image.naturalWidth) || image.width, imageHeight = (image[0] ? image[0].naturalHeight : image.naturalWidth) || image.height, margin = 0, cssParams = {};
            if ((imageWidth / containerWidth) > (imageHeight / containerHeight)) {
                margin = -((imageWidth / imageHeight * containerHeight - containerWidth) / 2);
                cssParams['margin-left'] = '' + margin + 'px';
                cssParams['height'] = '' + containerHeight + 'px';
                cssParams['width'] = '' + imageWidth * containerHeight / imageHeight + 'px';
                cssParams['margin-top'] = '';
            }
            else {
                margin = -((imageHeight / imageWidth * containerWidth - containerHeight) / 2);
                cssParams['margin-top'] = '' + margin + 'px';
                cssParams['height'] = '' + imageHeight * containerWidth / imageWidth + 'px';
                cssParams['width'] = '' + containerWidth + 'px';
                cssParams['margin-left'] = '';
            }
            $(image).css(cssParams);
        };
        return widgetTemplateService;
    }());
    var ImageLoad = function ImageLoad($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var callback = $parse(attrs.pipImageLoad);
                element.bind('load', function (event) {
                    callback(scope, {
                        $event: event
                    });
                });
            }
        };
    };
    ImageLoad.$inject = ['$parse'];
    angular
        .module('pipDashboard')
        .service('pipWidgetTemplate', widgetTemplateService)
        .directive('pipImageLoad', ImageLoad);
}
},{}],15:[function(require,module,exports){
"use strict";
(function () {
    'use strict';
    angular.module('pipWidget', []);
})();
require("./calendar/WidgetCalendar");
require("./event/WidgetEvent");
require("./menu/WidgetMenuService");
require("./menu/WidgetMenuDirective");
require("./notes/WidgetNotes");
require("./position/WidgetPosition");
require("./statistics/WidgetStatistics");
require("./picture_slider/WidgetPictureSlider");
},{"./calendar/WidgetCalendar":16,"./event/WidgetEvent":17,"./menu/WidgetMenuDirective":18,"./menu/WidgetMenuService":19,"./notes/WidgetNotes":20,"./picture_slider/WidgetPictureSlider":21,"./position/WidgetPosition":22,"./statistics/WidgetStatistics":23}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
{
    var CalendarWidgetController = (function (_super) {
        __extends(CalendarWidgetController, _super);
        function CalendarWidgetController(pipWidgetMenu, $scope, pipWidgetConfigDialogService) {
            var _this = _super.call(this) || this;
            _this.color = 'blue';
            _this._$scope = $scope;
            _this._configDialog = pipWidgetConfigDialogService;
            if (_this['options']) {
                _this.menu = _this['options']['menu'] ? _.union(_this.menu, _this['options']['menu']) : _this.menu;
                _this.menu.push({
                    title: 'Configurate',
                    click: function () {
                        _this.onConfigClick();
                    }
                });
                _this['options'].date = _this['options'].date || new Date();
                _this.color = _this['options'].color || _this.color;
            }
            return _this;
        }
        CalendarWidgetController.prototype.onConfigClick = function () {
            var _this = this;
            this._configDialog.show({
                dialogClass: 'pip-calendar-config',
                color: this.color,
                size: this['options'].size,
                date: this['options'].date,
                extensionUrl: 'widgets/calendar/ConfigDialogExtension.html'
            }, function (result) {
                _this.color = result.color;
                _this['options'].color = result.color;
                _this.changeSize(result.size);
                _this['options'].date = result.date;
            });
        };
        return CalendarWidgetController;
    }(WidgetMenuService_1.MenuWidgetService));
    var pipCalendarWidget = {
        bindings: {
            options: '=pipOptions',
        },
        controller: CalendarWidgetController,
        controllerAs: 'widgetCtrl',
        templateUrl: 'widgets/calendar/WidgetCalendar.html'
    };
    angular
        .module('pipWidget')
        .component('pipCalendarWidget', pipCalendarWidget);
}
},{"../menu/WidgetMenuService":19}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
var EventWidgetController = (function (_super) {
    __extends(EventWidgetController, _super);
    function EventWidgetController(pipWidgetMenu, $scope, $element, $timeout, pipWidgetConfigDialogService) {
        var _this = _super.call(this) || this;
        _this.color = 'gray';
        _this.opacity = 0.57;
        _this._$scope = $scope;
        _this._$element = $element;
        _this._$timeout = $timeout;
        _this._configDialog = pipWidgetConfigDialogService;
        if (_this['options']) {
            if (_this['options']['menu'])
                _this.menu = _.union(_this.menu, _this['options']['menu']);
        }
        _this.menu.push({ title: 'Configurate', click: function () {
                _this.onConfigClick();
            } });
        _this.color = _this['options'].color || _this.color;
        _this.opacity = _this['options'].opacity || _this.opacity;
        _this.drawImage();
        $scope.$watch(function () { return $element.is(':visible'); }, function (newVal) {
            _this.drawImage();
        });
        return _this;
    }
    EventWidgetController.prototype.drawImage = function () {
        var _this = this;
        if (this['options'].image) {
            this._$timeout(function () {
                _this.onImageLoad(_this._$element.find('img'));
            }, 500);
        }
    };
    EventWidgetController.prototype.onConfigClick = function () {
        var _this = this;
        this._oldOpacity = _.clone(this.opacity);
        this._configDialog.show({
            dialogClass: 'pip-calendar-config',
            color: this.color,
            size: this['options'].size || { colSpan: 1, rowSpan: 1 },
            date: this['options'].date,
            title: this['options'].title,
            text: this['options'].text,
            opacity: this.opacity,
            onOpacitytest: function (opacity) {
                _this.opacity = opacity;
            },
            extensionUrl: 'widgets/event/ConfigDialogExtension.html'
        }, function (result) {
            _this.color = result.color;
            _this['options'].color = result.color;
            _this.changeSize(result.size);
            _this['options'].date = result.date;
            _this['options'].title = result.title;
            _this['options'].text = result.text;
            _this['options'].opacity = result.opacity;
        }, function () {
            _this.opacity = _this._oldOpacity;
        });
    };
    EventWidgetController.prototype.onImageLoad = function (image) {
        this.setImageMarginCSS(this._$element.parent(), image);
    };
    EventWidgetController.prototype.changeSize = function (params) {
        var _this = this;
        this['options'].size.colSpan = params.sizeX;
        this['options'].size.rowSpan = params.sizeY;
        if (this['options'].image) {
            this._$timeout(function () {
                _this.setImageMarginCSS(_this._$element.parent(), _this._$element.find('img'));
            }, 500);
        }
    };
    EventWidgetController.prototype.setImageMarginCSS = function ($element, image) {
        var containerWidth = $element.width ? $element.width() : $element.clientWidth, containerHeight = $element.height ? $element.height() : $element.clientHeight, imageWidth = image[0].naturalWidth || image.width, imageHeight = image[0].naturalHeight || image.height, margin = 0, cssParams = {};
        if ((imageWidth / containerWidth) > (imageHeight / containerHeight)) {
            margin = -((imageWidth / imageHeight * containerHeight - containerWidth) / 2);
            cssParams['margin-left'] = '' + margin + 'px';
            cssParams['height'] = '' + containerHeight + 'px';
            cssParams['width'] = '' + imageWidth * containerHeight / imageHeight + 'px';
            cssParams['margin-top'] = '';
        }
        else {
            margin = -((imageHeight / imageWidth * containerWidth - containerHeight) / 2);
            cssParams['margin-top'] = '' + margin + 'px';
            cssParams['height'] = '' + imageHeight * containerWidth / imageWidth + 'px';
            cssParams['width'] = '' + containerWidth + 'px';
            cssParams['margin-left'] = '';
        }
        image.css(cssParams);
    };
    return EventWidgetController;
}(WidgetMenuService_1.MenuWidgetService));
(function () {
    var pipEventWidget = {
        bindings: {
            options: '=pipOptions'
        },
        controller: EventWidgetController,
        controllerAs: 'widgetCtrl',
        templateUrl: 'widgets/event/WidgetEvent.html'
    };
    angular
        .module('pipWidget')
        .component('pipEventWidget', pipEventWidget);
})();
},{"../menu/WidgetMenuService":19}],18:[function(require,module,exports){
(function () {
    'use strict';
    angular
        .module('pipWidget')
        .directive('pipMenuWidget', pipMenuWidget);
    function pipMenuWidget() {
        return {
            restrict: 'EA',
            templateUrl: 'widgets/menu/WidgetMenu.html'
        };
    }
})();
},{}],19:[function(require,module,exports){
"use strict";
var MenuWidgetService = (function () {
    function MenuWidgetService() {
        "ngInject";
        this.menu = [
            {
                title: 'Change Size',
                action: angular.noop,
                submenu: [{
                        title: '1 x 1',
                        action: 'changeSize',
                        params: {
                            sizeX: 1,
                            sizeY: 1
                        }
                    },
                    {
                        title: '2 x 1',
                        action: 'changeSize',
                        params: {
                            sizeX: 2,
                            sizeY: 1
                        }
                    },
                    {
                        title: '2 x 2',
                        action: 'changeSize',
                        params: {
                            sizeX: 2,
                            sizeY: 2
                        }
                    }
                ]
            }
        ];
    }
    MenuWidgetService.prototype.callAction = function (actionName, params, item) {
        if (this[actionName]) {
            this[actionName].call(this, params);
        }
        if (item['click']) {
            item['click'].call(item, params, this);
        }
    };
    ;
    MenuWidgetService.prototype.changeSize = function (params) {
        this['options'].size.colSpan = params.sizeX;
        this['options'].size.rowSpan = params.sizeY;
    };
    ;
    return MenuWidgetService;
}());
exports.MenuWidgetService = MenuWidgetService;
var MenuWidgetProvider = (function () {
    function MenuWidgetProvider() {
    }
    MenuWidgetProvider.prototype.$get = function () {
        "ngInject";
        if (this._service == null)
            this._service = new MenuWidgetService();
        return this._service;
    };
    return MenuWidgetProvider;
}());
(function () {
    'use strict';
    angular
        .module('pipWidget')
        .provider('pipWidgetMenu', MenuWidgetProvider);
})();
},{}],20:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
var NotesWidgetController = (function (_super) {
    __extends(NotesWidgetController, _super);
    function NotesWidgetController(pipWidgetMenu, $scope, pipWidgetConfigDialogService) {
        var _this = _super.call(this) || this;
        _this.color = 'orange';
        _this._$scope = $scope;
        _this._configDialog = pipWidgetConfigDialogService;
        if (_this['options']) {
            _this.menu = _this['options']['menu'] ? _.union(_this.menu, _this['options']['menu']) : _this.menu;
        }
        _this.menu.push({ title: 'Configurate', click: function () {
                _this.onConfigClick();
            } });
        _this.color = _this['options'].color || _this.color;
        return _this;
    }
    NotesWidgetController.prototype.onConfigClick = function () {
        var _this = this;
        this._configDialog.show({
            dialogClass: 'pip-calendar-config',
            color: this.color,
            size: this['options'].size,
            title: this['options'].title,
            text: this['options'].text,
            extensionUrl: 'widgets/notes/ConfigDialogExtension.html'
        }, function (result) {
            _this.color = result.color;
            _this['options'].color = result.color;
            _this.changeSize(result.size);
            _this['options'].text = result.text;
            _this['options'].title = result.title;
        });
    };
    return NotesWidgetController;
}(WidgetMenuService_1.MenuWidgetService));
var pipNotesWidget = {
    bindings: {
        options: '=pipOptions'
    },
    controller: NotesWidgetController,
    controllerAs: 'widgetCtrl',
    templateUrl: 'widgets/notes/WidgetNotes.html'
};
angular
    .module('pipWidget')
    .component('pipNotesWidget', pipNotesWidget);
},{"../menu/WidgetMenuService":19}],21:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
var PictureSliderController = (function (_super) {
    __extends(PictureSliderController, _super);
    function PictureSliderController(pipWidgetMenu, $scope, $element, $timeout, pipWidgetConfigDialogService, pipWidgetTemplate) {
        var _this = _super.call(this) || this;
        _this.animationType = 'fading';
        _this.animationInterval = 5000;
        _this._$scope = $scope;
        _this._configDialog = pipWidgetConfigDialogService;
        _this._widgetUtility = pipWidgetTemplate;
        _this._$element = $element;
        _this._$timeout = $timeout;
        if (_this['options']) {
            _this.animationType = _this['options'].animationType || _this.animationType;
            _this.animationInterval = _this['options'].animationInterval || _this.animationInterval;
        }
        return _this;
    }
    PictureSliderController.prototype.onImageLoad = function ($event) {
        var _this = this;
        this._$timeout(function () {
            _this._widgetUtility.setImageMarginCSS(_this._$element.parent(), $event.target);
        });
    };
    PictureSliderController.prototype.changeSize = function (params) {
        var _this = this;
        this['options'].size.colSpan = params.sizeX;
        this['options'].size.rowSpan = params.sizeY;
        this._$timeout(function () {
            _.each(_this._$element.find('img'), function (image) {
                _this._widgetUtility.setImageMarginCSS(_this._$element.parent(), image);
            });
        }, 500);
    };
    return PictureSliderController;
}(WidgetMenuService_1.MenuWidgetService));
var pipPictureSliderWidget = {
    bindings: {
        options: '=pipOptions',
        index: '=',
        group: '='
    },
    controller: PictureSliderController,
    templateUrl: 'widgets/picture_slider/WidgetPictureSlider.html',
    controllerAs: 'widgetCtrl'
};
angular
    .module('pipWidget')
    .component('pipPictureSliderWidget', pipPictureSliderWidget);
},{"../menu/WidgetMenuService":19}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
var PositionWidgetController = (function (_super) {
    __extends(PositionWidgetController, _super);
    function PositionWidgetController(pipWidgetMenu, $scope, $timeout, $element, pipWidgetConfigDialogService, pipLocationEditDialog) {
        var _this = _super.call(this) || this;
        _this.showPosition = true;
        _this._$scope = $scope;
        _this._$timeout = $timeout;
        _this._configDialog = pipWidgetConfigDialogService;
        _this._locationDialog = pipLocationEditDialog;
        if (_this['options']) {
            if (_this['options']['menu'])
                _this.menu = _.union(_this.menu, _this['options']['menu']);
        }
        _this.menu.push({
            title: 'Configurate',
            click: function () {
                _this.onConfigClick();
            }
        });
        _this.menu.push({
            title: 'Change location',
            click: function () {
                _this.openLocationEditDialog();
            }
        });
        _this['options'].location = _this['options'].location || _this['options'].position;
        $scope.$watch('widgetCtrl.options.location', function () {
            _this.reDrawPosition();
        });
        $scope.$watch(function () { return $element.is(':visible'); }, function (newVal) {
            if (newVal == true)
                _this.reDrawPosition();
        });
        return _this;
    }
    PositionWidgetController.prototype.onConfigClick = function () {
        var _this = this;
        this._configDialog.show({
            dialogClass: 'pip-position-config',
            size: this['options'].size,
            locationName: this['options'].locationName,
            hideColors: true,
            extensionUrl: 'widgets/position/ConfigDialogExtension.html'
        }, function (result) {
            _this.changeSize(result.size);
            _this['options'].locationName = result.locationName;
        });
    };
    PositionWidgetController.prototype.changeSize = function (params) {
        this['options'].size.colSpan = params.sizeX;
        this['options'].size.rowSpan = params.sizeY;
        this.reDrawPosition();
    };
    PositionWidgetController.prototype.openLocationEditDialog = function () {
        var _this = this;
        this._locationDialog.show({
            locationName: this['options'].locationName,
            locationPos: this['options'].location
        }, function (newPosition) {
            if (newPosition) {
                _this['options'].location = newPosition.location;
                _this['options'].locationName = newPosition.locatioName;
            }
        });
    };
    PositionWidgetController.prototype.reDrawPosition = function () {
        var _this = this;
        this.showPosition = false;
        this._$timeout(function () {
            _this.showPosition = true;
        }, 50);
    };
    return PositionWidgetController;
}(WidgetMenuService_1.MenuWidgetService));
var pipPositionWidget = {
    bindings: {
        options: '=pipOptions',
        index: '=',
        group: '='
    },
    controller: PositionWidgetController,
    controllerAs: 'widgetCtrl',
    templateUrl: 'widgets/position/WidgetPosition.html'
};
angular
    .module('pipWidget')
    .component('pipPositionWidget', pipPositionWidget);
},{"../menu/WidgetMenuService":19}],23:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
var SMALL_CHART = 70;
var BIG_CHART = 250;
var StatisticsWidgetController = (function (_super) {
    __extends(StatisticsWidgetController, _super);
    function StatisticsWidgetController(pipWidgetMenu, $scope, $timeout) {
        var _this = _super.call(this) || this;
        _this.reset = false;
        _this.chartSize = SMALL_CHART;
        _this._$scope = $scope;
        _this._$timeout = $timeout;
        if (_this['options']) {
            _this.menu = _this['options']['menu'] ? _.union(_this.menu, _this['options']['menu']) : _this.menu;
        }
        _this.setChartSize();
        return _this;
    }
    StatisticsWidgetController.prototype.changeSize = function (params) {
        var _this = this;
        this['options'].size.colSpan = params.sizeX;
        this['options'].size.rowSpan = params.sizeY;
        this.reset = true;
        this.setChartSize();
        this._$timeout(function () {
            _this.reset = false;
        }, 500);
    };
    StatisticsWidgetController.prototype.setChartSize = function () {
        this.chartSize = this['options'].size.colSpan == 2 && this['options'].size.rowSpan == 2 ? BIG_CHART : SMALL_CHART;
    };
    return StatisticsWidgetController;
}(WidgetMenuService_1.MenuWidgetService));
(function () {
    'use strict';
    var pipStatisticsWidget = {
        bindings: {
            options: '=pipOptions'
        },
        bindToController: true,
        controller: StatisticsWidgetController,
        controllerAs: 'widgetCtrl',
        templateUrl: 'widgets/statistics/WidgetStatistics.html'
    };
    angular
        .module('pipWidget')
        .component('pipStatisticsWidget', pipStatisticsWidget);
})();
},{"../menu/WidgetMenuService":19}],24:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('Dashboard.html',
    '<md-button class="md-accent md-raised md-fab layout-column layout-align-center-center" aria-label="Add component" ng-click="dashboardCtrl.addComponent()"><md-icon md-svg-icon="icons:plus" class="md-headline centered-add-icon"></md-icon></md-button><div class="pip-draggable-grid-holder"><pip-draggable-grid pip-tiles-templates="dashboardCtrl.groupedWidgets" pip-tiles-context="dashboardCtrl.widgetsContext" pip-draggable-grid="dashboardCtrl.draggableGridOptions" pip-group-menu-actions="dashboardCtrl.groupMenuActions"></pip-draggable-grid><md-progress-circular md-mode="indeterminate" class="progress-ring"></md-progress-circular></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('draggable/Draggable.html',
    '<div class="pip-draggable-holder"><div class="pip-draggable-group" ng-repeat="group in draggableCtrl.groups" data-group-id="{{ $index }}" pip-draggable-tiles="group.source"><div class="pip-draggable-group-title layout-row layout-align-start-center"><div class="title-input-container" ng-click="draggableCtrl.onTitleClick(group, $event)"><input ng-if="group.editingName" ng-blur="draggableCtrl.onBlurTitleInput(group)" ng-keypress="draggableCtrl.onKyepressTitleInput(group, $event)" ng-model="group.title"><div class="text-overflow flex-none" ng-if="!group.editingName">{{ group.title }}</div></div><md-button class="md-icon-button flex-none layout-align-center-center" ng-show="group.editingName" ng-click="draggableCtrl.cancelEditing(group)" aria-label="Cancel"><md-icon md-svg-icon="icons:cross"></md-icon></md-button><md-menu class="flex-none layout-column" md-position-mode="target-right target" ng-show="!group.editingName"><md-button class="md-icon-button flex-none layout-align-center-center" ng-click="$mdOpenMenu(); groupId = $index" aria-label="Menu"><md-icon md-svg-icon="icons:dots"></md-icon></md-button><md-menu-content width="4"><md-menu-item ng-repeat="action in draggableCtrl.groupMenuActions"><md-button ng-click="action.callback(groupId)">{{ action.title }}</md-button></md-menu-item></md-menu-content></md-menu></div></div><div class="pip-draggable-group fict-group layout-align-center-center layout-column tm16"><div class="fict-group-text-container"><md-icon md-svg-icon="icons:plus"></md-icon>{{ \'DROP_TO_CREATE_NEW_GROUP\' | translate }}</div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('dialogs/add_component/AddComponent.html',
    '<md-dialog class="pip-dialog pip-add-component-dialog"><md-dialog-content class="layout-column"><div class="theme-divider p16 flex-auto"><h3 class="hide-xs m0 bm16 theme-text-primary" hide-xs="">{{ \'DASHBOARD_ADD_COMPONENT_DIALOG_TITLE\' | translate }}<md-input-container class="layout-row flex-auto m0 tm16"><md-select class="flex-auto m0 theme-text-primary" ng-model="dialogCtrl.activeGroupIndex" placeholder="{{ \'DASHBOARD_ADD_COMPONENT_DIALOG_CREATE_NEW_GROUP\' | translate }}" aria-label="Group"><md-option ng-value="$index" ng-repeat="group in dialogCtrl.groups">{{ group }}</md-option></md-select></md-input-container></h3></div><div class="pip-body pip-scroll p0 flex-auto"><p class="md-body-1 theme-text-secondary m0 lp16 rp16">{{ \'DASHBOARD_ADD_COMPONENT_DIALOG_USE_HOT_KEYS\' | translate }}</p><md-list ng-init="groupIndex = $index" ng-repeat="group in dialogCtrl.defaultWidgets"><md-list-item class="layout-row pip-list-item lp16 rp16" ng-repeat="item in group"><div class="icon-holder flex-none"><md-icon md-svg-icon="icons:{{:: item.icon }}"></md-icon><div class="pip-badge theme-badge md-warn" ng-if="item.amount"><span>{{ item.amount }}</span></div></div><span class="flex-auto lm24 theme-text-primary">{{:: item.title }}</span><md-button class="md-icon-button flex-none" ng-click="dialogCtrl.encrease(groupIndex, $index)" aria-label="Encrease"><md-icon md-svg-icon="icons:plus-circle"></md-icon></md-button><md-button class="md-icon-button flex-none" ng-click="dialogCtrl.decrease(groupIndex, $index)" aria-label="Decrease"><md-icon md-svg-icon="icons:minus-circle"></md-icon></md-button></md-list-item><md-divider class="lm72 tm8 bm8" ng-if="groupIndex !== (dialogCtrl.defaultWidgets.length - 1)"></md-divider></md-list></div></md-dialog-content><md-dialog-actions class="flex-none layout-align-end-center theme-divider divider-top theme-text-primary"><md-button ng-click="dialogCtrl.cancel()" aria-label="Cancel">{{ \'CANCEL\' | translate }}</md-button><md-button ng-click="dialogCtrl.add()" ng-disabled="dialogCtrl.totalWidgets === 0" arial-label="Add">{{ \'ADD\' | translate }}</md-button></md-dialog-actions></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('dialogs/widget_config/ConfigDialog.html',
    '<md-dialog class="pip-dialog pip-widget-config-dialog {{ vm.params.dialogClass }}" width="400" md-theme="{{vm.theme}}"><pip-widget-config-extend-component class="layout-column" pip-dialog-scope="vm" pip-extension-url="vm.params.extensionUrl" pip-apply="vm.onApply(updatedData)"></pip-widget-config-extend-component></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('dialogs/widget_config/ConfigDialogExtendComponent.html',
    '<h3 class="tm0 flex-none">{{ \'DASHBOARD_WIDGET_CONFIG_DIALOG_TITLE\' | translate }}</h3><div class="pip-body pip-scroll p16 bp0 flex-auto"><pip-extension-point></pip-extension-point><pip-toggle-buttons class="bm16" ng-if="!$ctrl.hideSizes" pip-buttons="$ctrl.sizes" ng-model="$ctrl.sizeId"></pip-toggle-buttons><pip-color-picker ng-if="!$ctrl.hideColors" pip-colors="$ctrl.colors" ng-model="$ctrl.color"></pip-color-picker></div><div class="pip-footer flex-none"><div><md-button class="md-accent" ng-click="$ctrl.onCancel()">{{ \'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-click="$ctrl.onApply()">{{ \'APPLY\' | translate }}</md-button></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/calendar/ConfigDialogExtension.html',
    '<div class="w-stretch bm16">Date:<md-datepicker ng-model="$ctrl.date" class="w-stretch"></md-datepicker></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/calendar/WidgetCalendar.html',
    '<div class="widget-box pip-calendar-widget {{ widgetCtrl.color }} layout-column layout-fill tp0" ng-class="{ small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1, medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1, big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }"><div class="widget-heading layout-row layout-align-end-center flex-none"><pip-menu-widget></pip-menu-widget></div><div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1"><span class="date lm24 rm12">{{ widgetCtrl.options.date.getDate() }}</span><div class="flex-auto layout-column"><span class="weekday md-headline">{{ widgetCtrl.options.date | formatLongDayOfWeek }}</span> <span class="month-year md-headline">{{ widgetCtrl.options.date | formatLongMonth }} {{ widgetCtrl.options.date | formatYear }}</span></div></div><div class="widget-content flex-auto layout-column layout-align-space-around-center" ng-hide="widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1"><span class="weekday md-headline" ng-hide="widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1">{{ widgetCtrl.options.date | formatLongDayOfWeek }}</span> <span class="weekday" ng-show="widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1">{{ widgetCtrl.options.date | formatLongDayOfWeek }}</span> <span class="date lm12 rm12">{{ widgetCtrl.options.date.getDate() }}</span> <span class="month-year md-headline">{{ widgetCtrl.options.date | formatLongMonth }} {{ widgetCtrl.options.date | formatYear }}</span></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/event/ConfigDialogExtension.html',
    '<div class="w-stretch"><md-input-container class="w-stretch bm0"><label>Title:</label> <input type="text" ng-model="$ctrl.title"></md-input-container>Date:<md-datepicker ng-model="$ctrl.date" class="w-stretch bm8"></md-datepicker><md-input-container class="w-stretch"><label>Description:</label> <textarea type="text" ng-model="$ctrl.text">\n' +
    '    </textarea></md-input-container>Backdrop\'s opacity:<md-slider aria-label="opacity" type="number" min="0.1" max="0.9" step="0.01" ng-model="$ctrl.opacity" ng-change="$ctrl.onOpacitytest($ctrl.opacity)"></md-slider></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/event/WidgetEvent.html',
    '<div class="widget-box pip-event-widget {{ widgetCtrl.color }} layout-column layout-fill" ng-class="{ small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1, medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1, big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }"><img ng-if="widgetCtrl.options.image" ng-src="{{widgetCtrl.options.image}}" alt="{{widgetCtrl.options.title || widgetCtrl.options.name}}"><div class="text-backdrop" style="background-color: rgba(0, 0, 0, {{ widgetCtrl.opacity }})"><div class="widget-heading layout-row layout-align-start-center flex-none"><span class="widget-title flex-auto text-overflow">{{ widgetCtrl.options.title || widgetCtrl.options.name }}</span><pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget></div><div class="text-container flex-auto pip-scroll"><p class="date flex-none" ng-if="widgetCtrl.options.date">{{ widgetCtrl.options.date | formatShortDate }}</p><p class="text flex-auto">{{ widgetCtrl.options.text || widgetCtrl.options.description }}</p></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/notes/ConfigDialogExtension.html',
    '<div class="w-stretch"><md-input-container class="w-stretch bm0"><label>Title:</label> <input type="text" ng-model="$ctrl.title"></md-input-container><md-input-container class="w-stretch tm0"><label>Text:</label> <textarea type="text" ng-model="$ctrl.text">\n' +
    '    </textarea></md-input-container></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/notes/WidgetNotes.html',
    '<div class="widget-box pip-notes-widget {{ widgetCtrl.color }} layout-column"><div class="widget-heading layout-row layout-align-start-center flex-none" ng-if="widgetCtrl.options.title || widgetCtrl.options.name"><span class="widget-title flex-auto text-overflow">{{ widgetCtrl.options.title || widgetCtrl.options.name }}</span></div><pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget><div class="text-container flex-auto pip-scroll"><p>{{ widgetCtrl.options.text }}</p></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/menu/WidgetMenu.html',
    '<md-menu class="widget-menu" md-position-mode="target-right target"><md-button class="md-icon-button flex-none" ng-click="$mdOpenMenu()" aria-label="Menu"><md-icon md-svg-icon="icons:vdots"></md-icon></md-button><md-menu-content width="4"><md-menu-item ng-repeat="item in widgetCtrl.menu"><md-button ng-if="!item.submenu" ng-click="widgetCtrl.callAction(item.action, item.params, item)">{{:: item.title }}</md-button><md-menu ng-if="item.submenu"><md-button ng-click="widgetCtrl.callAction(item.action)">{{:: item.title }}</md-button><md-menu-content><md-menu-item ng-repeat="subitem in item.submenu"><md-button ng-click="widgetCtrl.callAction(subitem.action, subitem.params, subitem)">{{:: subitem.title }}</md-button></md-menu-item></md-menu-content></md-menu></md-menu-item></md-menu-content></md-menu>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/picture_slider/WidgetPictureSlider.html',
    '<div class="widget-box pip-picture-slider-widget {{ widgetCtrl.color }} layout-column layout-fill" ng-class="{ small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1, medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1, big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }" index="{{ widgetCtrl.index }}" group="{{ widgetCtrl.group }}"><div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none"><span class="flex text-overflow">{{ widgetCtrl.options.title }}</span><pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget></div><div class="slider-container"><div pip-image-slider="" pip-animation-type="\'fading\'" pip-animation-interval="widgetCtrl.animationInterval" ng-if="widgetCtrl.animationType == \'fading\'"><div class="pip-animation-block" ng-repeat="slide in widgetCtrl.options.slides"><img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="widgetCtrl.onImageLoad($event)"><p class="slide-text" ng-if="slide.text">{{ slide.text }}</p></div></div><div pip-image-slider="" pip-animation-type="\'carousel\'" pip-animation-interval="widgetCtrl.animationInterval" ng-if="widgetCtrl.animationType == \'carousel\'"><div class="pip-animation-block" ng-repeat="slide in widgetCtrl.options.slides"><img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="widgetCtrl.onImageLoad($event)"><p class="slide-text" ng-if="slide.text">{{ slide.text }}</p></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/position/ConfigDialogExtension.html',
    '<div class="w-stretch"><md-input-container class="w-stretch bm0"><label>Location name:</label> <input type="text" ng-model="$ctrl.locationName"></md-input-container></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/position/WidgetPosition.html',
    '<div class="pip-position-widget widget-box p0 layout-column layout-fill" ng-class="{ small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1, medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1, big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }" index="{{ widgetCtrl.index }}" group="{{ widgetCtrl.group }}"><div class="position-absolute-right-top" ng-if="!widgetCtrl.options.locationName"><pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget></div><div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none" ng-if="widgetCtrl.options.locationName"><span class="flex text-overflow">{{ widgetCtrl.options.locationName }}</span><pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget></div><pip-location-map class="flex" ng-if="widgetCtrl.showPosition" pip-stretch="true" pip-rebind="true" pip-location-pos="widgetCtrl.options.location"></pip-location-map></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('widgets/statistics/WidgetStatistics.html',
    '<div class="widget-box pip-statistics-widget layout-column layout-fill" ng-class="{ small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1, medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1, big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }"><div class="widget-heading layout-row layout-align-start-center flex-none"><span class="widget-title flex-auto text-overflow">{{ widgetCtrl.options.title || widgetCtrl.options.name }}</span><pip-menu-widget></pip-menu-widget></div><div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="widgetCtrl.options.series && !widgetCtrl.reset"><pip-pie-chart pip-series="widgetCtrl.options.series" ng-if="!widgetCtrl.options.chartType || widgetCtrl.options.chartType == \'pie\'" pip-donut="true" pip-pie-size="widgetCtrl.chartSize" pip-show-total="true" pip-centered="true"></pip-pie-chart></div></div>');
}]);
})();



},{}]},{},[24,1,2,3,4,5,6,7,8,12,13,9,10,11,14,16,17,18,19,20,21,22,23,15])(24)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRGFzaGJvYXJkLnRzIiwic3JjL0Rhc2hib2FyZENvbXBvbmVudC50cyIsInNyYy9EYXNoYm9hcmRDb250cm9sbGVyLnRzIiwic3JjL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyLnRzIiwic3JjL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnRQcm92aWRlci50cyIsInNyYy9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nQ29udHJvbGxlci50cyIsInNyYy9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50LnRzIiwic3JjL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlLnRzIiwic3JjL2RyYWdnYWJsZS9EcmFnZ2FibGUudHMiLCJzcmMvZHJhZ2dhYmxlL0RyYWdnYWJsZUNvbXBvbmVudC50cyIsInNyYy9kcmFnZ2FibGUvRHJhZ2dhYmxlVGlsZVNlcnZpY2UudHMiLCJzcmMvZHJhZ2dhYmxlL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwRGlyZWN0aXZlLnRzIiwic3JjL2RyYWdnYWJsZS9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UudHMiLCJzcmMvdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHkudHMiLCJzcmMvd2lkZ2V0cy9XaWRnZXRzLnRzIiwic3JjL3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIudHMiLCJzcmMvd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudURpcmVjdGl2ZS50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UudHMiLCJzcmMvd2lkZ2V0cy9ub3Rlcy9XaWRnZXROb3Rlcy50cyIsInNyYy93aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIudHMiLCJzcmMvd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi50cyIsInNyYy93aWRnZXRzL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcy50cyIsInRlbXAvcGlwLXdlYnVpLWRhc2hib2FyZC1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSw2QkFBMkI7QUFDM0IsaUNBQStCO0FBRS9CLENBQUM7SUFDQyxZQUFZLENBQUM7SUFFYixPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtRQUM3QixXQUFXO1FBQ1gsWUFBWTtRQUNaLHVCQUF1QjtRQUN2QixnQ0FBZ0M7UUFDaEMsd0JBQXdCO1FBR3hCLFdBQVc7UUFDWCxjQUFjO1FBQ2QsYUFBYTtRQUNiLFdBQVc7UUFDWCxjQUFjO1FBQ2QsYUFBYTtLQUNkLENBQUMsQ0FBQztBQUVMLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCwyQ0FBeUM7QUFDekMsMERBQXdEO0FBQ3hELGdFQUE4RDtBQUM5RCxpQ0FBK0I7QUFDL0IsZ0NBQThCOztBQzVCOUIsQ0FBQztJQUNDLFlBQVksQ0FBQztJQUViLElBQU0sWUFBWSxHQUF5QjtRQUN6QyxRQUFRLEVBQUU7WUFDUixXQUFXLEVBQUUsaUJBQWlCO1lBQzlCLHNCQUFzQixFQUFFLGtCQUFrQjtZQUMxQyxjQUFjLEVBQUUsWUFBWTtTQUM3QjtRQUNELFVBQVUsRUFBRSxrQkFBa0I7UUFDOUIsWUFBWSxFQUFFLGVBQWU7UUFDN0IsV0FBVyxFQUFFLGdCQUFnQjtLQUM5QixDQUFBO0lBRUQsT0FBTztTQUNKLE1BQU0sQ0FBQyxjQUFjLENBQUM7U0FDdEIsU0FBUyxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUMsRUFBRSxDQUFDOztBQ2pCTCxZQUFZLENBQUM7QUFLYix5QkFBeUIsU0FBbUM7SUFDMUQsSUFBTSxZQUFZLEdBQUcs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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICcuL3dpZGdldHMvV2lkZ2V0cyc7XHJcbmltcG9ydCAnLi9kcmFnZ2FibGUvRHJhZ2dhYmxlJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkJywgW1xyXG4gICAgJ3BpcFdpZGdldCcsIFxyXG4gICAgJ3BpcERyYWdnZWQnLCBcclxuICAgICdwaXBXaWRnZXRDb25maWdEaWFsb2cnLCBcclxuICAgICdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2cnLFxyXG4gICAgJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLFxyXG5cclxuICAgIC8vIEV4dGVybmFsIHBpcCBtb2R1bGVzXHJcbiAgICAncGlwTGF5b3V0JyxcclxuICAgICdwaXBMb2NhdGlvbnMnLFxyXG4gICAgJ3BpcERhdGVUaW1lJyxcclxuICAgICdwaXBDaGFydHMnLFxyXG4gICAgJ3BpcFRyYW5zbGF0ZScsXHJcbiAgICAncGlwQ29udHJvbHMnXHJcbiAgXSk7XHJcbiAgXHJcbn0pKCk7XHJcblxyXG5pbXBvcnQgJy4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQgJy4vZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vZGlhbG9ncy9hZGRfY29tcG9uZW50L0FkZENvbXBvbmVudERpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vRGFzaGJvYXJkQ29udHJvbGxlcic7XHJcbmltcG9ydCAnLi9EYXNoYm9hcmRDb21wb25lbnQnO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgY29uc3QgcGlwRGFzaGJvYXJkOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIGdyaWRPcHRpb25zOiAnPXBpcEdyaWRPcHRpb25zJyxcclxuICAgICAgZ3JvdXBBZGRpdGlvbmFsQWN0aW9uczogJz1waXBHcm91cEFjdGlvbnMnLFxyXG4gICAgICBncm91cGVkV2lkZ2V0czogJz1waXBHcm91cHMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogJ3BpcERhc2hib2FyZEN0cmwnLFxyXG4gICAgY29udHJvbGxlckFzOiAnZGFzaGJvYXJkQ3RybCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ0Rhc2hib2FyZC5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb21wb25lbnQoJ3BpcERhc2hib2FyZCcsIHBpcERhc2hib2FyZCk7XHJcbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgSVdpZGdldFRlbXBsYXRlU2VydmljZSB9IGZyb20gJy4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQgeyBJQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSwgSUFkZENvbXBvbmVudERpYWxvZ3Byb3ZpZGVyIH0gZnJvbSAnLi9kaWFsb2dzL2FkZF9jb21wb25lbnQvQWRkQ29tcG9uZW50UHJvdmlkZXInXHJcblxyXG5mdW5jdGlvbiBzZXRUcmFuc2xhdGlvbnMoJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICBjb25zdCBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGVQcm92aWRlcicpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA6IG51bGw7XHJcbiAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgKDxhbnk+cGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICBEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVA6ICdEcm9wIGhlcmUgdG8gY3JlYXRlIG5ldyBncm91cCcsXHJcbiAgICB9KTtcclxuICAgICg8YW55PnBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdydScsIHtcclxuICAgICAgRFJPUF9UT19DUkVBVEVfTkVXX0dST1VQOiAn0J/QtdGA0LXRgtCw0YnQuNGC0LUg0YHRjtC00LAg0LTQu9GPINGB0L7Qt9C00LDQvdC40Y8g0L3QvtCy0L7QuSDQs9GA0YPQv9C/0YsnXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbmZpZ3VyZUF2YWlsYWJsZVdpZGdldHMocGlwQWRkQ29tcG9uZW50RGlhbG9nUHJvdmlkZXI6IElBZGRDb21wb25lbnREaWFsb2dwcm92aWRlcikge1xyXG4gIHBpcEFkZENvbXBvbmVudERpYWxvZ1Byb3ZpZGVyLmNvbmZpZ1dpZGdldExpc3QoW1xyXG4gICAgW3tcclxuICAgICAgICB0aXRsZTogJ0V2ZW50JyxcclxuICAgICAgICBpY29uOiAnZG9jdW1lbnQnLFxyXG4gICAgICAgIG5hbWU6ICdldmVudCcsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1Bvc2l0aW9uJyxcclxuICAgICAgICBpY29uOiAnbG9jYXRpb24nLFxyXG4gICAgICAgIG5hbWU6ICdwb3NpdGlvbicsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBbe1xyXG4gICAgICAgIHRpdGxlOiAnQ2FsZW5kYXInLFxyXG4gICAgICAgIGljb246ICdkYXRlJyxcclxuICAgICAgICBuYW1lOiAnY2FsZW5kYXInLFxyXG4gICAgICAgIGFtb3VudDogMFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICdTdGlja3kgTm90ZXMnLFxyXG4gICAgICAgIGljb246ICdub3RlLXRha2UnLFxyXG4gICAgICAgIG5hbWU6ICdub3RlcycsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1N0YXRpc3RpY3MnLFxyXG4gICAgICAgIGljb246ICd0ci1zdGF0aXN0aWNzJyxcclxuICAgICAgICBuYW1lOiAnc3RhdGlzdGljcycsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH1cclxuICAgIF1cclxuICBdKTtcclxufVxyXG5cclxuY2xhc3MgZHJhZ2dhYmxlT3B0aW9ucyB7XHJcbiAgdGlsZVdpZHRoOiBudW1iZXI7XHJcbiAgdGlsZUhlaWdodDogbnVtYmVyO1xyXG4gIGd1dHRlcjogbnVtYmVyO1xyXG4gIGlubGluZTogYm9vbGVhbjtcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9HUklEX09QVElPTlM6IGRyYWdnYWJsZU9wdGlvbnMgPSB7XHJcbiAgdGlsZVdpZHRoOiAxNTAsIC8vICdweCdcclxuICB0aWxlSGVpZ2h0OiAxNTAsIC8vICdweCdcclxuICBndXR0ZXI6IDEwLCAvLyAncHgnXHJcbiAgaW5saW5lOiBmYWxzZVxyXG59O1xyXG5cclxuY2xhc3MgRGFzaGJvYXJkQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyIHtcclxuICBwcml2YXRlIGRlZmF1bHRHcm91cE1lbnVBY3Rpb25zOiBhbnkgPSBbe1xyXG4gICAgICB0aXRsZTogJ0FkZCBDb21wb25lbnQnLFxyXG4gICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudChncm91cEluZGV4KTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdGl0bGU6ICdSZW1vdmUnLFxyXG4gICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdyb3VwKGdyb3VwSW5kZXgpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0aXRsZTogJ0NvbmZpZ3VyYXRlJyxcclxuICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2NvbmZpZ3VyYXRlIGdyb3VwIHdpdGggaW5kZXg6JywgZ3JvdXBJbmRleCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdO1xyXG4gIHByaXZhdGUgXyRzY29wZTogYW5ndWxhci5JU2NvcGU7XHJcbiAgcHJpdmF0ZSBfJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZTtcclxuICBwcml2YXRlIF8kYXR0cnM6IGFueTtcclxuICBwcml2YXRlIF8kZWxlbWVudDogYW55O1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICBwcml2YXRlIF9waXBBZGRDb21wb25lbnREaWFsb2c6IElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX3BpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX2luY2x1ZGVUcGw6IHN0cmluZyA9ICc8cGlwLXt7IHR5cGUgfX0td2lkZ2V0IGdyb3VwPVwiZ3JvdXBJbmRleFwiIGluZGV4PVwiaW5kZXhcIicgK1xyXG4gICAgJ3BpcC1vcHRpb25zPVwiJHBhcmVudC5kYXNoYm9hcmRDdHJsLmdyb3VwZWRXaWRnZXRzW2dyb3VwSW5kZXhdW1xcJ3NvdXJjZVxcJ11baW5kZXhdLm9wdHNcIj4nICtcclxuICAgICc8L3BpcC17eyB0eXBlIH19LXdpZGdldD4nO1xyXG5cclxuICBwdWJsaWMgZ3JvdXBlZFdpZGdldHM6IGFueTtcclxuICBwdWJsaWMgZHJhZ2dhYmxlR3JpZE9wdGlvbnM6IGRyYWdnYWJsZU9wdGlvbnM7XHJcbiAgcHVibGljIHdpZGdldHNUZW1wbGF0ZXM6IGFueTtcclxuICBwdWJsaWMgZ3JvdXBNZW51QWN0aW9uczogYW55ID0gdGhpcy5kZWZhdWx0R3JvdXBNZW51QWN0aW9ucztcclxuICBwdWJsaWMgd2lkZ2V0c0NvbnRleHQ6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICRhdHRyczogYW55LFxyXG4gICAgJGVsZW1lbnQ6IGFueSxcclxuICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlLFxyXG4gICAgcGlwQWRkQ29tcG9uZW50RGlhbG9nOiBJQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSxcclxuICAgIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLl8kcm9vdFNjb3BlID0gJHJvb3RTY29wZTtcclxuICAgIHRoaXMuXyRhdHRycyA9ICRhdHRycztcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fJGludGVycG9sYXRlID0gJGludGVycG9sYXRlO1xyXG4gICAgdGhpcy5fcGlwQWRkQ29tcG9uZW50RGlhbG9nID0gcGlwQWRkQ29tcG9uZW50RGlhbG9nO1xyXG4gICAgdGhpcy5fcGlwV2lkZ2V0VGVtcGxhdGUgPSBwaXBXaWRnZXRUZW1wbGF0ZTtcclxuXHJcbiAgICAvLyBBZGQgY2xhc3MgdG8gc3R5bGUgc2Nyb2xsIGJhclxyXG4gICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1zY3JvbGwnKTtcclxuXHJcbiAgICAvLyBTZXQgdGlsZXMgZ3JpZCBvcHRpb25zXHJcbiAgICB0aGlzLmRyYWdnYWJsZUdyaWRPcHRpb25zID0gJHNjb3BlWydncmlkT3B0aW9ucyddIHx8IERFRkFVTFRfR1JJRF9PUFRJT05TO1xyXG5cclxuICAgIC8vIFN3aXRjaCBpbmxpbmUgZGlzcGxheWluZ1xyXG4gICAgaWYgKHRoaXMuZHJhZ2dhYmxlR3JpZE9wdGlvbnMuaW5saW5lID09PSB0cnVlKSB7XHJcbiAgICAgICRlbGVtZW50LmFkZENsYXNzKCdpbmxpbmUtZ3JpZCcpO1xyXG4gICAgfVxyXG4gICAgLy8gRXh0ZW5kIGdyb3VwJ3MgbWVudSBhY3Rpb25zXHJcbiAgICBpZiAoJHNjb3BlWydncm91cEFkZGl0aW9uYWxBY3Rpb25zJ10pIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZ3JvdXBNZW51QWN0aW9ucywgJHNjb3BlWydncm91cEFkZGl0aW9uYWxBY3Rpb25zJ10pO1xyXG5cclxuICAgIC8vIENvbXBpbGUgd2lkZ2V0c1xyXG4gICAgdGhpcy53aWRnZXRzQ29udGV4dCA9ICRzY29wZTtcclxuICAgIHRoaXMuY29tcGlsZVdpZGdldHMoKTtcclxuXHJcbiAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuXyRlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICB9LCA3MDApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21waWxlV2lkZ2V0cygpIHtcclxuICAgIF8uZWFjaCh0aGlzLmdyb3VwZWRXaWRnZXRzLCAoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICBncm91cC5yZW1vdmVkV2lkZ2V0cyA9IGdyb3VwLnJlbW92ZWRXaWRnZXRzIHx8IFtdLFxyXG4gICAgICAgIGdyb3VwLnNvdXJjZSA9IGdyb3VwLnNvdXJjZS5tYXAoKHdpZGdldCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgIC8vIEVzdGFibGlzaCBkZWZhdWx0IHByb3BzXHJcbiAgICAgICAgICB3aWRnZXQuc2l6ZSA9IHdpZGdldC5zaXplIHx8IHtcclxuICAgICAgICAgICAgY29sU3BhbjogMSxcclxuICAgICAgICAgICAgcm93U3BhbjogMVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHdpZGdldC5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgd2lkZ2V0Lmdyb3VwSW5kZXggPSBncm91cEluZGV4O1xyXG4gICAgICAgICAgd2lkZ2V0Lm1lbnUgPSB3aWRnZXQubWVudSB8fCB7fTtcclxuICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHdpZGdldC5tZW51LCBbe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1JlbW92ZScsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoaXRlbSwgcGFyYW1zLCBvYmplY3QpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnJlbW92ZVdpZGdldChpdGVtLCBwYXJhbXMsIG9iamVjdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1dKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvcHRzOiB3aWRnZXQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLl9waXBXaWRnZXRUZW1wbGF0ZS5nZXRUZW1wbGF0ZSh3aWRnZXQsIHRoaXMuX2luY2x1ZGVUcGwpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRDb21wb25lbnQoZ3JvdXBJbmRleCkge1xyXG4gICAgdGhpcy5fcGlwQWRkQ29tcG9uZW50RGlhbG9nXHJcbiAgICAgIC5zaG93KHRoaXMuZ3JvdXBlZFdpZGdldHMsIGdyb3VwSW5kZXgpXHJcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdGl2ZUdyb3VwO1xyXG5cclxuICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICBhY3RpdmVHcm91cCA9IHRoaXMuZ3JvdXBlZFdpZGdldHNbZGF0YS5ncm91cEluZGV4XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYWN0aXZlR3JvdXAgPSB7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnTmV3IGdyb3VwJyxcclxuICAgICAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWRkV2lkZ2V0cyhhY3RpdmVHcm91cC5zb3VyY2UsIGRhdGEud2lkZ2V0cyk7XHJcblxyXG4gICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnB1c2goYWN0aXZlR3JvdXApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb21waWxlV2lkZ2V0cygpO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgcmVtb3ZlR3JvdXAgPSAoZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZUdyb3VwJywgZ3JvdXBJbmRleCk7XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnNwbGljZShncm91cEluZGV4LCAxKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkV2lkZ2V0cyhncm91cCwgd2lkZ2V0cykge1xyXG4gICAgd2lkZ2V0cy5mb3JFYWNoKCh3aWRnZXRHcm91cCkgPT4ge1xyXG4gICAgICB3aWRnZXRHcm91cC5mb3JFYWNoKCh3aWRnZXQpID0+IHtcclxuICAgICAgICBpZiAod2lkZ2V0LmFtb3VudCkge1xyXG4gICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkod2lkZ2V0LmFtb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgICBncm91cC5wdXNoKHtcclxuICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQubmFtZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVtb3ZlV2lkZ2V0KGl0ZW0sIHBhcmFtcywgb2JqZWN0KSB7XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzW3BhcmFtcy5vcHRpb25zLmdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzID0gW107XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzW3BhcmFtcy5vcHRpb25zLmdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzLnB1c2gocGFyYW1zLm9wdGlvbnMuaW5kZXgpO1xyXG4gICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5zb3VyY2Uuc3BsaWNlKHBhcmFtcy5vcHRpb25zLmluZGV4LCAxKTtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cyA9IFtdO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgLmNvbmZpZyhjb25maWd1cmVBdmFpbGFibGVXaWRnZXRzKVxyXG4gIC5jb25maWcoc2V0VHJhbnNsYXRpb25zKVxyXG4gIC5jb250cm9sbGVyKCdwaXBEYXNoYm9hcmRDdHJsJywgRGFzaGJvYXJkQ29udHJvbGxlcik7IiwiZXhwb3J0IGNsYXNzIHdpZGdldCB7XHJcbiAgICB0aXRsZTogc3RyaW5nO1xyXG4gICAgaWNvbjogc3RyaW5nO1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgYW1vdW50OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIge1xyXG4gICAgcHVibGljIGRlZmF1bHRXaWRnZXRzOiBbd2lkZ2V0W11dO1xyXG4gICAgcHVibGljIGdyb3VwczogYW55O1xyXG4gICAgcHVibGljIHRvdGFsV2lkZ2V0czogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBncm91cHMsIC8vIExhdGVyIG1heSBiZSBncm91cCB0eXBlXHJcbiAgICAgICAgcHVibGljIGFjdGl2ZUdyb3VwSW5kZXg6IG51bWJlcixcclxuICAgICAgICB3aWRnZXRMaXN0OiBbd2lkZ2V0W11dLFxyXG4gICAgICAgIHB1YmxpYyAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlR3JvdXBJbmRleCA9IF8uaXNOdW1iZXIoYWN0aXZlR3JvdXBJbmRleCkgPyBhY3RpdmVHcm91cEluZGV4IDogLTE7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0V2lkZ2V0cyA9IF8uY2xvbmVEZWVwKHdpZGdldExpc3QpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gXy5tYXAoZ3JvdXBzLCBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwWyd0aXRsZSddO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IHRoaXMuYWN0aXZlR3JvdXBJbmRleCxcclxuICAgICAgICAgICAgd2lkZ2V0czogdGhpcy5kZWZhdWx0V2lkZ2V0c1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgY2FuY2VsKCkge1xyXG4gICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgZW5jcmVhc2UoZ3JvdXBJbmRleDogbnVtYmVyLCB3aWRnZXRJbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3Qgd2lkZ2V0ID0gdGhpcy5kZWZhdWx0V2lkZ2V0c1tncm91cEluZGV4XVt3aWRnZXRJbmRleF07XHJcbiAgICAgICAgd2lkZ2V0LmFtb3VudCsrO1xyXG4gICAgICAgIHRoaXMudG90YWxXaWRnZXRzKys7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBkZWNyZWFzZShncm91cEluZGV4OiBudW1iZXIsIHdpZGdldEluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB3aWRnZXQgPSB0aGlzLmRlZmF1bHRXaWRnZXRzW2dyb3VwSW5kZXhdW3dpZGdldEluZGV4XTtcclxuICAgICAgICB3aWRnZXQuYW1vdW50ID0gd2lkZ2V0LmFtb3VudCA/IHdpZGdldC5hbW91bnQgLSAxIDogMDtcclxuICAgICAgICB0aGlzLnRvdGFsV2lkZ2V0cyA9IHRoaXMudG90YWxXaWRnZXRzID8gdGhpcy50b3RhbFdpZGdldHMgLSAxIDogMDtcclxuICAgIH07XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcEFkZERhc2hib2FyZENvbXBvbmVudERpYWxvZycsIFsnbmdNYXRlcmlhbCddKTtcclxuXHJcbmltcG9ydCAnLi9BZGRDb21wb25lbnRQcm92aWRlcic7IiwiaW1wb3J0IHtcclxuICB3aWRnZXQsXHJcbiAgQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlclxyXG59IGZyb20gJy4vQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlIHtcclxuICBzaG93KGdyb3VwcywgYWN0aXZlR3JvdXBJbmRleCk6IGFuZ3VsYXIuSVByb21pc2UgPCBhbnkgPiA7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFkZENvbXBvbmVudERpYWxvZ3Byb3ZpZGVyIHtcclxuICBjb25maWdXaWRnZXRMaXN0KGxpc3Q6IFt3aWRnZXRbXV0pOiB2b2lkO1xyXG59XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgZnVuY3Rpb24gc2V0VHJhbnNsYXRpb25zKCRpbmplY3RvcjogbmcuYXV0by5JSW5qZWN0b3JTZXJ2aWNlKSB7XHJcbiAgICBjb25zdCBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGVQcm92aWRlcicpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA6IG51bGw7XHJcbiAgICBpZiAocGlwVHJhbnNsYXRlKSB7XHJcbiAgICAgICg8YW55PnBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICBEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfVElUTEU6ICdBZGQgY29tcG9uZW50JyxcclxuICAgICAgICBEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfVVNFX0hPVF9LRVlTOiAnVXNlIFwiRW50ZXJcIiBvciBcIitcIiBidXR0b25zIG9uIGtleWJvYXJkIHRvIGVuY3JlYXNlIGFuZCBcIkRlbGV0ZVwiIG9yIFwiLVwiIHRvIGRlY3JlYXNlIHRpbGVzIGFtb3VudCcsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX0NSRUFURV9ORVdfR1JPVVA6ICdDcmVhdGUgbmV3IGdyb3VwJ1xyXG4gICAgICB9KTtcclxuICAgICAgKDxhbnk+cGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgIERBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19USVRMRTogJ9CU0L7QsdCw0LLQuNGC0Ywg0LrQvtC80L/QvtC90LXQvdGCJyxcclxuICAgICAgICBEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfVVNFX0hPVF9LRVlTOiAn0JjRgdC/0L7Qu9GM0LfRg9C50YLQtSBcIkVudGVyXCIg0LjQu9C4IFwiK1wiINC60LvQsNCy0LjRiNC4INC90LAg0LrQu9Cw0LLQuNCw0YLRg9GA0LUg0YfRgtC+0LHRiyDRg9Cy0LXQu9C40YfQuNGC0Ywg0LggXCJEZWxldGVcIiBvciBcIi1cIiDRh9GC0L7QsdGLINGD0LzQtdC90YjQuNGC0Ywg0LrQvtC70LjRh9C10YHRgtCy0L4g0YLQsNC50LvQvtCyJyxcclxuICAgICAgICBEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfQ1JFQVRFX05FV19HUk9VUDogJ9Ch0L7Qt9C00LDRgtGMINC90L7QstGD0Y4g0LPRgNGD0L/Qv9GDJ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNsYXNzIEFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2UgaW1wbGVtZW50cyBJQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSB7XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIHdpZGdldExpc3Q6IFt3aWRnZXRbXV0sXHJcbiAgICAgIHByaXZhdGUgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICApIHt9XHJcblxyXG4gICAgcHVibGljIHNob3coZ3JvdXBzLCBhY3RpdmVHcm91cEluZGV4KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLiRtZERpYWxvZ1xyXG4gICAgICAgIC5zaG93KHtcclxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZGlhbG9ncy9hZGRfY29tcG9uZW50L0FkZENvbXBvbmVudC5odG1sJyxcclxuICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICBjb250cm9sbGVyOiBBZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgICAgY29udHJvbGxlckFzOiAnZGlhbG9nQ3RybCcsXHJcbiAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICBncm91cHM6ICgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhY3RpdmVHcm91cEluZGV4OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUdyb3VwSW5kZXg7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHdpZGdldExpc3Q6ICgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy53aWRnZXRMaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNsYXNzIEFkZENvbXBvbmVudERpYWxvZ1Byb3ZpZGVyIGltcGxlbWVudHMgSUFkZENvbXBvbmVudERpYWxvZ3Byb3ZpZGVyIHtcclxuICAgIHByaXZhdGUgX3NlcnZpY2U6IEFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2U7XHJcbiAgICBwcml2YXRlIF93aWRnZXRMaXN0OiBbd2lkZ2V0W11dID0gbnVsbDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gICAgcHVibGljIGNvbmZpZ1dpZGdldExpc3QgPSBmdW5jdGlvbiAobGlzdDogW3dpZGdldFtdXSkge1xyXG4gICAgICB0aGlzLl93aWRnZXRMaXN0ID0gbGlzdDtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljICRnZXQoJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlKSB7XHJcbiAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9zZXJ2aWNlID09IG51bGwpXHJcbiAgICAgICAgdGhpcy5fc2VydmljZSA9IG5ldyBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlKHRoaXMuX3dpZGdldExpc3QsICRtZERpYWxvZyk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5fc2VydmljZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuY29uZmlnKHNldFRyYW5zbGF0aW9ucylcclxuICAgIC5wcm92aWRlcigncGlwQWRkQ29tcG9uZW50RGlhbG9nJywgQWRkQ29tcG9uZW50RGlhbG9nUHJvdmlkZXIpO1xyXG59KSgpOyIsIlxyXG5jbGFzcyBUaWxlQ29sb3JzIHtcclxuICAgIHN0YXRpYyBhbGw6IHN0cmluZ1tdID0gWydwdXJwbGUnLCAnZ3JlZW4nLCAnZ3JheScsICdvcmFuZ2UnLCAnYmx1ZSddO1xyXG59XHJcblxyXG5jbGFzcyBUaWxlU2l6ZXMge1xyXG4gICAgc3RhdGljIGFsbDogYW55ID0gW3tcclxuICAgICAgICAgICAgbmFtZTogJ0RBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX1NNQUxMJyxcclxuICAgICAgICAgICAgaWQ6ICcxMSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ0RBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX1dJREUnLFxyXG4gICAgICAgICAgICBpZDogJzIxJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfTEFSR0UnLFxyXG4gICAgICAgICAgICBpZDogJzIyJ1xyXG4gICAgICAgIH1cclxuICAgIF07XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXaWRnZXRDb25maWdEaWFsb2dDb250cm9sbGVyIHtcclxuICAgIHB1YmxpYyBjb2xvcnM6IHN0cmluZ1tdID0gVGlsZUNvbG9ycy5hbGw7XHJcbiAgICBwdWJsaWMgc2l6ZXM6IGFueSA9IFRpbGVTaXplcy5hbGw7XHJcbiAgICBwdWJsaWMgc2l6ZUlkOiBzdHJpbmcgPSBUaWxlU2l6ZXMuYWxsWzBdLmlkO1xyXG4gICAgcHVibGljIG9uQ2FuY2VsOiBGdW5jdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgcGFyYW1zLFxyXG4gICAgICAgIHB1YmxpYyAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgdGhpcy5wYXJhbXMpO1xyXG4gICAgICAgIHRoaXMuc2l6ZUlkID0gJycgKyB0aGlzLnBhcmFtcy5zaXplLmNvbFNwYW4gKyB0aGlzLnBhcmFtcy5zaXplLnJvd1NwYW47XHJcblxyXG4gICAgICAgIHRoaXMub25DYW5jZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25BcHBseSh1cGRhdGVkRGF0YSkge1xyXG4gICAgICAgIHRoaXNbJ3NpemUnXS5zaXplWCA9IE51bWJlcih0aGlzLnNpemVJZC5zdWJzdHIoMCwgMSkpO1xyXG4gICAgICAgIHRoaXNbJ3NpemUnXS5zaXplWSA9IE51bWJlcih0aGlzLnNpemVJZC5zdWJzdHIoMSwgMSkpO1xyXG4gICAgICAgIHRoaXMuJG1kRGlhbG9nLmhpZGUodXBkYXRlZERhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXRDb25maWdEaWFsb2cnLCBbJ25nTWF0ZXJpYWwnXSk7XHJcblxyXG5pbXBvcnQgJy4vQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcbmltcG9ydCAnLi9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQnOyIsIlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIGludGVyZmFjZSBJV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgcGlwRXh0ZW5zaW9uVXJsOiBhbnk7XHJcbiAgICAgICAgcGlwRGlhbG9nU2NvcGU6IGFueTtcclxuICAgICAgICBwaXBBcHBseTogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzOiBJV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3MgPSB7XHJcbiAgICAgICAgcGlwRXh0ZW5zaW9uVXJsOiAnPCcsXHJcbiAgICAgICAgcGlwRGlhbG9nU2NvcGU6ICc8JyxcclxuICAgICAgICBwaXBBcHBseTogJyYnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50Q2hhbmdlcyBpbXBsZW1lbnRzIG5nLklPbkNoYW5nZXNPYmplY3QsIElXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogbmcuSUNoYW5nZXNPYmplY3Q8YW55PjtcclxuXHJcbiAgICAgICAgcGlwRXh0ZW5zaW9uVXJsOiBuZy5JQ2hhbmdlc09iamVjdDxzdHJpbmc+O1xyXG4gICAgICAgIHBpcERpYWxvZ1Njb3BlOiBuZy5JQ2hhbmdlc09iamVjdDxuZy5JU2NvcGU+O1xyXG5cclxuICAgICAgICBwaXBBcHBseTogbmcuSUNoYW5nZXNPYmplY3Q8KHt1cGRhdGVkRGF0YTogYW55fSkgPT4gbmcuSVByb21pc2U8dm9pZD4+O1xyXG4gICAgfVxyXG5cclxuICAgIGludGVyZmFjZSBJV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QXR0cmlidXRlcyBleHRlbmRzIG5nLklBdHRyaWJ1dGVzIHtcclxuICAgICAgICBwaXBFeHRlbnNpb25Vcmw6IHN0cmluZ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudENvbnRyb2xsZXIgaW1wbGVtZW50cyBJV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3Mge1xyXG4gICAgICAgIHB1YmxpYyBwaXBFeHRlbnNpb25Vcmw6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgcGlwRGlhbG9nU2NvcGU6IG5nLklTY29wZTtcclxuICAgICAgICBwdWJsaWMgcGlwQXBwbHk6IChwYXJhbToge3VwZGF0ZWREYXRhOiBhbnl9KSA9PiBuZy5JUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHRlbXBsYXRlUmVxdWVzdDogYW5ndWxhci5JVGVtcGxhdGVSZXF1ZXN0U2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSwgXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSwgXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGF0dHJzOiBJV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QXR0cmlidXRlc1xyXG4gICAgICAgICkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudENoYW5nZXMpIHtcclxuICAgICAgICAgICAgaWYgKGNoYW5nZXMucGlwRGlhbG9nU2NvcGUpIHtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIGNoYW5nZXMucGlwRGlhbG9nU2NvcGUuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5waXBFeHRlbnNpb25VcmwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRlbXBsYXRlUmVxdWVzdChjaGFuZ2VzLnBpcEV4dGVuc2lvblVybC5jdXJyZW50VmFsdWUsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdwaXAtZXh0ZW5zaW9uLXBvaW50JykucmVwbGFjZVdpdGgodGhpcy4kY29tcGlsZShodG1sKSh0aGlzLiRzY29wZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbkFwcGx5KCkge1xyXG4gICAgICAgICAgICB0aGlzLnBpcEFwcGx5KHt1cGRhdGVkRGF0YTogdGhpc30pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwaXBXaWRnZXRDb25maWdDb21wb25lbnQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRDb250cm9sbGVyLFxyXG4gICAgICAgIGJpbmRpbmdzOiBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5nc1xyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBXaWRnZXRDb25maWdEaWFsb2cnKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudCcsIHBpcFdpZGdldENvbmZpZ0NvbXBvbmVudCk7XHJcbn0pKCk7IiwiaW1wb3J0IHsgV2lkZ2V0Q29uZmlnRGlhbG9nQ29udHJvbGxlciB9IGZyb20gJy4vQ29uZmlnRGlhbG9nQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElXaWRnZXRDb25maWdTZXJ2aWNlIHtcclxuICAgIHNob3cocGFyYW1zOiBhbnksIHN1Y2Nlc3NDYWxsYmFjayA/IDogKGtleSkgPT4gdm9pZCwgY2FuY2VsQ2FsbGJhY2sgPyA6ICgpID0+IHZvaWQpOiBhbnk7XHJcbn1cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0VHJhbnNsYXRpb25zKCRpbmplY3RvcjogbmcuYXV0by5JSW5qZWN0b3JTZXJ2aWNlKSB7XHJcbiAgICAgICAgY29uc3QgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgOiBudWxsO1xyXG4gICAgICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19USVRMRTogJ0VkaXQgdGlsZScsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTDogJ1NtYWxsJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX1dJREU6ICdXaWRlJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFOiAnTGFyZ2UnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1RJVExFOiAn0JjQt9C80LXQvdC40YLRjCDQstC40LTQttC10YInLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfU01BTEw6ICfQnNCw0LvQtdC9LicsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9XSURFOiAn0KjQuNGA0L7QutC40LknLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfTEFSR0U6ICfQkdC+0LvRjNGI0L7QuSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uge1xyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHVibGljICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgICAgICkge31cclxuXHJcbiAgICAgICAgcHVibGljIHNob3cocGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2sgPyA6IChrZXkpID0+IHZvaWQsIGNhbmNlbENhbGxiYWNrID8gOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50OiBwYXJhbXMuZXZlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHBhcmFtcy50ZW1wbGF0ZVVybCB8fCAnZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZy5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBXaWRnZXRDb25maWdEaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXNcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2soa2V5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbmNlbENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBXaWRnZXRDb25maWdEaWFsb2cnKVxyXG4gICAgICAgIC5jb25maWcoc2V0VHJhbnNsYXRpb25zKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlJywgV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZSk7XHJcblxyXG59KSgpOyIsImFuZ3VsYXIubW9kdWxlKCdwaXBEcmFnZ2VkJywgW10pO1xyXG5cclxuaW1wb3J0ICcuL0RyYWdnYWJsZVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0ICcuL0RyYWdnYWJsZUNvbXBvbmVudCc7XHJcbmltcG9ydCAnLi9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UnXHJcbmltcG9ydCAnLi9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cERpcmVjdGl2ZSciLCJkZWNsYXJlIHZhciBpbnRlcmFjdDtcclxuXHJcbmltcG9ydCB7XHJcbiAgRHJhZ1RpbGVTZXJ2aWNlLFxyXG4gIElEcmFnVGlsZVNlcnZpY2UsXHJcbiAgSURyYWdUaWxlQ29uc3RydWN0b3JcclxufSBmcm9tICcuL0RyYWdnYWJsZVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBUaWxlc0dyaWRTZXJ2aWNlLFxyXG4gIElUaWxlc0dyaWRTZXJ2aWNlLFxyXG4gIElUaWxlc0dyaWRDb25zdHJ1Y3RvclxyXG59IGZyb20gJy4vZHJhZ2dhYmxlX2dyb3VwL0RyYWdnYWJsZVRpbGVzR3JvdXBTZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1RJTEVfV0lEVEg6IG51bWJlciA9IDE1MDtcclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVElMRV9IRUlHSFQ6IG51bWJlciA9IDE1MDtcclxuZXhwb3J0IGNvbnN0IFVQREFURV9HUk9VUFNfRVZFTlQgPSBcInBpcFVwZGF0ZURhc2hib2FyZEdyb3Vwc0NvbmZpZ1wiO1xyXG5cclxuY29uc3QgU0lNUExFX0xBWU9VVF9DT0xVTU5TX0NPVU5UOiBudW1iZXIgPSAyO1xyXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgdGlsZVdpZHRoOiBERUZBVUxUX1RJTEVfV0lEVEgsIC8vICdweCdcclxuICB0aWxlSGVpZ2h0OiBERUZBVUxUX1RJTEVfSEVJR0hULCAvLyAncHgnXHJcbiAgZ3V0dGVyOiAyMCwgLy8gJ3B4J1xyXG4gIGNvbnRhaW5lcjogJ3BpcC1kcmFnZ2FibGUtZ3JpZDpmaXJzdC1vZi10eXBlJyxcclxuICAvL21vYmlsZUJyZWFrcG9pbnQgICAgICAgOiBYWFgsICAgLy8gR2V0IGZyb20gcGlwTWVkaWEgU2VydmljZSBpbiB0aGUgY29uc3RydWN0b3JcclxuICBhY3RpdmVEcm9wem9uZUNsYXNzOiAnZHJvcHpvbmUtYWN0aXZlJyxcclxuICBncm91cENvbnRhbmluZXJTZWxlY3RvcjogJy5waXAtZHJhZ2dhYmxlLWdyb3VwOm5vdCguZmljdC1ncm91cCknLFxyXG59O1xyXG5cclxue1xyXG4gIGludGVyZmFjZSBJRHJhZ2dhYmxlQ29udHJvbGxlclNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgIGRyYWdnYWJsZUN0cmw6IGFueTtcclxuICAgICRjb250YWluZXI6IEpRdWVyeTtcclxuICB9XHJcblxyXG4gIGludGVyZmFjZSBJVGlsZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgIGluZGV4OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgICBncm91cEluZGV4OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgfVxyXG5cclxuICBjbGFzcyBEcmFnZ2FibGVDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgcHVibGljIG9wdHM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cHM6IGFueTtcclxuICAgIHB1YmxpYyBzb3VyY2VEcm9wWm9uZUVsZW06IGFueSA9IG51bGw7XHJcbiAgICBwdWJsaWMgaXNTYW1lRHJvcHpvbmU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIHRpbGVHcm91cHM6IGFueSA9IG51bGw7XHJcbiAgICBwdWJsaWMgYXZhaWxhYmxlV2lkdGg6IG51bWJlcjtcclxuICAgIHB1YmxpYyBhdmFpbGFibGVDb2x1bW5zOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgZ3JvdXBzQ29udGFpbmVyczogYW55O1xyXG4gICAgcHVibGljIGNvbnRhaW5lcjogYW55O1xyXG4gICAgcHVibGljIGFjdGl2ZURyYWdnZWRHcm91cDogYW55O1xyXG4gICAgcHVibGljIGRyYWdnZWRUaWxlOiBhbnk7XHJcbiAgICBwdWJsaWMgY29udGFpbmVyT2Zmc2V0OiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgJHNjb3BlOiBJRHJhZ2dhYmxlQ29udHJvbGxlclNjb3BlLFxyXG4gICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICBwaXBEcmFnVGlsZTogSURyYWdUaWxlU2VydmljZSxcclxuICAgICAgcGlwVGlsZXNHcmlkOiBJVGlsZXNHcmlkU2VydmljZSxcclxuICAgICAgcGlwTWVkaWE6IHBpcC5sYXlvdXRzLklNZWRpYVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICB0aGlzLm9wdHMgPSBfLm1lcmdlKHtcclxuICAgICAgICBtb2JpbGVCcmVha3BvaW50OiBwaXBNZWRpYS5icmVha3BvaW50cy54c1xyXG4gICAgICB9LCBERUZBVUxUX09QVElPTlMsICRzY29wZVsnZHJhZ2dhYmxlQ3RybCddLm9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMgPSAkc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc1RlbXBsYXRlcy5tYXAoKGdyb3VwLCBncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRpdGxlOiBncm91cC50aXRsZSxcclxuICAgICAgICAgIGVkaXRpbmdOYW1lOiBmYWxzZSxcclxuICAgICAgICAgIGluZGV4OiBncm91cEluZGV4LFxyXG4gICAgICAgICAgc291cmNlOiBncm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpbGVTY29wZSA9IHRoaXMuY3JlYXRlVGlsZVNjb3BlKHRpbGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIElEcmFnVGlsZUNvbnN0cnVjdG9yKERyYWdUaWxlU2VydmljZSwge1xyXG4gICAgICAgICAgICAgIHRwbDogJGNvbXBpbGUodGlsZS50ZW1wbGF0ZSkodGlsZVNjb3BlKSxcclxuICAgICAgICAgICAgICBvcHRpb25zOiB0aWxlLm9wdHMsXHJcbiAgICAgICAgICAgICAgc2l6ZTogdGlsZS5vcHRzLnNpemVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQWRkIHRlbXBsYXRlcyB3YXRjaGVyXHJcbiAgICAgICRzY29wZS4kd2F0Y2goJ2RyYWdnYWJsZUN0cmwudGlsZXNUZW1wbGF0ZXMnLCAobmV3VmFsKSA9PiB7XHJcbiAgICAgICAgdGhpcy53YXRjaChuZXdWYWwpO1xyXG4gICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgZGF0YVxyXG4gICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICAgIC8vIFJlc2l6ZSBoYW5kbGVyIFRPRE86IHJlcGxhY2UgYnkgcGlwIHJlc2l6ZSB3YXRjaGVyc1xyXG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlV2lkdGggPSB0aGlzLmdldENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVDb2x1bW5zID0gdGhpcy5nZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlV2lkdGgpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgIGdyb3VwXHJcbiAgICAgICAgICAgIC5zZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlQ29sdW1ucylcclxuICAgICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sIDUwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUG9zdCBsaW5rIGZ1bmN0aW9uXHJcbiAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICB0aGlzLiRzY29wZS4kY29udGFpbmVyID0gdGhpcy4kZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXYXRjaCBoYW5kbGVyXHJcbiAgICBwcml2YXRlIHdhdGNoKG5ld1ZhbCkge1xyXG4gICAgICBjb25zdCBwcmV2VmFsID0gdGhpcy5ncm91cHM7XHJcbiAgICAgIGxldCBjaGFuZ2VkR3JvdXBJbmRleCA9IG51bGw7XHJcblxyXG4gICAgICBpZiAobmV3VmFsLmxlbmd0aCA+IHByZXZWYWwubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5hZGRHcm91cChuZXdWYWxbbmV3VmFsLmxlbmd0aCAtIDFdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobmV3VmFsLmxlbmd0aCA8IHByZXZWYWwubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVHcm91cHMobmV3VmFsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld1ZhbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwV2lkZ2V0RGlmZiA9IHByZXZWYWxbaV0uc291cmNlLmxlbmd0aCAtIG5ld1ZhbFtpXS5zb3VyY2UubGVuZ3RoO1xyXG4gICAgICAgIGlmIChncm91cFdpZGdldERpZmYgfHwgKG5ld1ZhbFtpXS5yZW1vdmVkV2lkZ2V0cyAmJiBuZXdWYWxbaV0ucmVtb3ZlZFdpZGdldHMubGVuZ3RoID4gMCkpIHtcclxuICAgICAgICAgIGNoYW5nZWRHcm91cEluZGV4ID0gaTtcclxuXHJcbiAgICAgICAgICBpZiAoZ3JvdXBXaWRnZXREaWZmIDwgMCkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdUaWxlcyA9IG5ld1ZhbFtjaGFuZ2VkR3JvdXBJbmRleF0uc291cmNlLnNsaWNlKGdyb3VwV2lkZ2V0RGlmZik7XHJcblxyXG4gICAgICAgICAgICBfLmVhY2gobmV3VGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbGUnLCB0aWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZFRpbGVzSW50b0dyb3VwKG5ld1RpbGVzLCB0aGlzLnRpbGVHcm91cHNbY2hhbmdlZEdyb3VwSW5kZXhdLCB0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbY2hhbmdlZEdyb3VwSW5kZXhdKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKHRoaXMudGlsZUdyb3Vwc1tjaGFuZ2VkR3JvdXBJbmRleF0sIG5ld1ZhbFtjaGFuZ2VkR3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tjaGFuZ2VkR3JvdXBJbmRleF0pO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuZXdWYWwgJiYgdGhpcy50aWxlR3JvdXBzKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUaWxlc09wdGlvbnMobmV3VmFsKTtcclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElubGluZSBlZGl0IGdyb3VwIGhhbmRsZXJzXHJcbiAgICBwdWJsaWMgb25UaXRsZUNsaWNrKGdyb3VwLCBldmVudCkge1xyXG4gICAgICBpZiAoIWdyb3VwLmVkaXRpbmdOYW1lKSB7XHJcbiAgICAgICAgZ3JvdXAub2xkVGl0bGUgPSBfLmNsb25lKGdyb3VwLnRpdGxlKTtcclxuICAgICAgICBncm91cC5lZGl0aW5nTmFtZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQuY2hpbGRyZW5bMF0pLmZvY3VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2FuY2VsRWRpdGluZyhncm91cCkge1xyXG4gICAgICBncm91cC50aXRsZSA9IGdyb3VwLm9sZFRpdGxlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkJsdXJUaXRsZUlucHV0KGdyb3VwKSB7XHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLmVkaXRpbmdOYW1lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoVVBEQVRFX0dST1VQU19FVkVOVCwgdGhpcy5ncm91cHMpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSB0aXRsZSBpbiBvdXRlciBzY29wZVxyXG4gICAgICAgIHRoaXMuJHNjb3BlLmRyYWdnYWJsZUN0cmwudGlsZXNUZW1wbGF0ZXNbZ3JvdXAuaW5kZXhdLnRpdGxlID0gZ3JvdXAudGl0bGU7XHJcbiAgICAgIH0sIDEwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uS3llcHJlc3NUaXRsZUlucHV0KGdyb3VwLCBldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICB0aGlzLm9uQmx1clRpdGxlSW5wdXQoZ3JvdXApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIG91dGVyIHNjb3BlIGZ1bmN0aW9uc1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc1RlbXBsYXRlcyh1cGRhdGVUeXBlOiBzdHJpbmcsIHNvdXJjZSA/IDogYW55KSB7XHJcbiAgICAgIHN3aXRjaCAodXBkYXRlVHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ2FkZEdyb3VwJzpcclxuICAgICAgICAgIGlmICh0aGlzLmdyb3Vwcy5sZW5ndGggIT09IHRoaXMuJHNjb3BlLmRyYWdnYWJsZUN0cmwudGlsZXNUZW1wbGF0ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmRyYWdnYWJsZUN0cmwudGlsZXNUZW1wbGF0ZXMucHVzaChzb3VyY2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbW92ZVRpbGUnOlxyXG4gICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICBmcm9tSW5kZXgsXHJcbiAgICAgICAgICAgIHRvSW5kZXgsXHJcbiAgICAgICAgICAgIHRpbGVPcHRpb25zLFxyXG4gICAgICAgICAgICBmcm9tVGlsZUluZGV4XHJcbiAgICAgICAgICB9ID0ge1xyXG4gICAgICAgICAgICBmcm9tSW5kZXg6IHNvdXJjZS5mcm9tLmVsZW0uYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlLFxyXG4gICAgICAgICAgICB0b0luZGV4OiBzb3VyY2UudG8uZWxlbS5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWUsXHJcbiAgICAgICAgICAgIHRpbGVPcHRpb25zOiBzb3VyY2UudGlsZS5vcHRzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyb21UaWxlSW5kZXg6IHNvdXJjZS50aWxlLm9wdHMub3B0aW9ucy5pbmRleFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy4kc2NvcGUuZHJhZ2dhYmxlQ3RybC50aWxlc1RlbXBsYXRlc1tmcm9tSW5kZXhdLnNvdXJjZS5zcGxpY2UoZnJvbVRpbGVJbmRleCwgMSk7XHJcbiAgICAgICAgICB0aGlzLiRzY29wZS5kcmFnZ2FibGVDdHJsLnRpbGVzVGVtcGxhdGVzW3RvSW5kZXhdLnNvdXJjZS5wdXNoKHtcclxuICAgICAgICAgICAgb3B0czogdGlsZU9wdGlvbnNcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHRoaXMucmVJbmRleFRpbGVzKHNvdXJjZS5mcm9tLmVsZW0pO1xyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoc291cmNlLnRvLmVsZW0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNYW5hZ2UgdGlsZXMgZnVuY3Rpb25zXHJcbiAgICBwcml2YXRlIGNyZWF0ZVRpbGVTY29wZSh0aWxlOiBhbnkpOiBJVGlsZVNjb3BlIHtcclxuICAgICAgY29uc3QgdGlsZVNjb3BlID0gPCBJVGlsZVNjb3BlID4gdGhpcy4kcm9vdFNjb3BlLiRuZXcoZmFsc2UsIHRoaXMuJHNjb3BlLmRyYWdnYWJsZUN0cmwudGlsZXNDb250ZXh0KTtcclxuICAgICAgdGlsZVNjb3BlLmluZGV4ID0gdGlsZS5vcHRzLmluZGV4ID09IHVuZGVmaW5lZCA/IHRpbGUub3B0cy5vcHRpb25zLmluZGV4IDogdGlsZS5vcHRzLmluZGV4O1xyXG4gICAgICB0aWxlU2NvcGUuZ3JvdXBJbmRleCA9IHRpbGUub3B0cy5ncm91cEluZGV4ID09IHVuZGVmaW5lZCA/IHRpbGUub3B0cy5vcHRpb25zLmdyb3VwSW5kZXggOiB0aWxlLm9wdHMuZ3JvdXBJbmRleDtcclxuXHJcbiAgICAgIHJldHVybiB0aWxlU2NvcGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVUaWxlcyhncm91cCwgaW5kZXhlcywgY29udGFpbmVyKSB7XHJcbiAgICAgIGNvbnN0IHRpbGVzID0gJChjb250YWluZXIpLmZpbmQoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKTtcclxuXHJcbiAgICAgIF8uZWFjaChpbmRleGVzLCAoaW5kZXgpID0+IHtcclxuICAgICAgICBncm91cC50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHRpbGVzW2luZGV4XS5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlSW5kZXhUaWxlcyhjb250YWluZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVJbmRleFRpbGVzKGNvbnRhaW5lciwgZ0luZGV4ID8gKSB7XHJcbiAgICAgIGNvbnN0IHRpbGVzID0gJChjb250YWluZXIpLmZpbmQoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKSxcclxuICAgICAgICBncm91cEluZGV4ID0gZ0luZGV4ID09PSB1bmRlZmluZWQgPyBjb250YWluZXIuYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlIDogZ0luZGV4O1xyXG5cclxuICAgICAgXy5lYWNoKHRpbGVzLCAodGlsZSwgaW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBjaGlsZCA9ICQodGlsZSkuY2hpbGRyZW4oKVswXTtcclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY2hpbGQpLnNjb3BlKClbJ2luZGV4J10gPSBpbmRleDtcclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY2hpbGQpLnNjb3BlKClbJ2dyb3VwSW5kZXgnXSA9IGdyb3VwSW5kZXg7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlR3JvdXBzKG5ld0dyb3Vwcykge1xyXG4gICAgICBjb25zdCByZW1vdmVJbmRleGVzID0gW10sXHJcbiAgICAgICAgcmVtYWluID0gW10sXHJcbiAgICAgICAgY29udGFpbmVycyA9IFtdO1xyXG5cclxuXHJcbiAgICAgIF8uZWFjaCh0aGlzLmdyb3VwcywgKGdyb3VwLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChfLmZpbmRJbmRleChuZXdHcm91cHMsIChnKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBnWyd0aXRsZSddID09PSBncm91cC50aXRsZVxyXG4gICAgICAgICAgfSkgPCAwKSB7XHJcbiAgICAgICAgICByZW1vdmVJbmRleGVzLnB1c2goaW5kZXgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZW1haW4ucHVzaChpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIF8uZWFjaChyZW1vdmVJbmRleGVzLnJldmVyc2UoKSwgKGluZGV4KSA9PiB7XHJcbiAgICAgICAgdGhpcy5ncm91cHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB0aGlzLnRpbGVHcm91cHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBfLmVhY2gocmVtYWluLCAoaW5kZXgpID0+IHtcclxuICAgICAgICBjb250YWluZXJzLnB1c2godGhpcy5ncm91cHNDb250YWluZXJzW2luZGV4XSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gY29udGFpbmVycztcclxuXHJcbiAgICAgIF8uZWFjaCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnMsIChjb250YWluZXIsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoY29udGFpbmVyLCBpbmRleCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkR3JvdXAoc291cmNlR3JvdXApIHtcclxuICAgICAgY29uc3QgZ3JvdXAgPSB7XHJcbiAgICAgICAgdGl0bGU6IHNvdXJjZUdyb3VwLnRpdGxlLFxyXG4gICAgICAgIHNvdXJjZTogc291cmNlR3JvdXAuc291cmNlLm1hcCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIElEcmFnVGlsZUNvbnN0cnVjdG9yKERyYWdUaWxlU2VydmljZSwge1xyXG4gICAgICAgICAgICB0cGw6IHRoaXMuJGNvbXBpbGUodGlsZS50ZW1wbGF0ZSkodGlsZVNjb3BlKSxcclxuICAgICAgICAgICAgb3B0aW9uczogdGlsZS5vcHRzLFxyXG4gICAgICAgICAgICBzaXplOiB0aWxlLm9wdHMuc2l6ZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMuZ3JvdXBzLnB1c2goZ3JvdXApO1xyXG4gICAgICBpZiAoIXRoaXMuJHNjb3BlLiQkcGhhc2UpIHRoaXMuJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdHMuZ3JvdXBDb250YW5pbmVyU2VsZWN0b3IpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3Vwcy5wdXNoKFxyXG4gICAgICAgICAgSVRpbGVzR3JpZENvbnN0cnVjdG9yKFRpbGVzR3JpZFNlcnZpY2UsIGdyb3VwLnNvdXJjZSwgdGhpcy5vcHRzLCB0aGlzLmF2YWlsYWJsZUNvbHVtbnMsIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1t0aGlzLmdyb3Vwc0NvbnRhaW5lcnMubGVuZ3RoIC0gMV0pXHJcbiAgICAgICAgICAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpXHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzVGVtcGxhdGVzKCdhZGRHcm91cCcsIHNvdXJjZUdyb3VwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZFRpbGVzSW50b0dyb3VwKG5ld1RpbGVzLCBncm91cCwgZ3JvdXBDb250YWluZXIpIHtcclxuICAgICAgbmV3VGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRpbGVTY29wZSA9IHRoaXMuY3JlYXRlVGlsZVNjb3BlKHRpbGUpO1xyXG5cclxuICAgICAgICBjb25zdCBuZXdUaWxlID0gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICB0cGw6IHRoaXMuJGNvbXBpbGUodGlsZS50ZW1wbGF0ZSkodGlsZVNjb3BlKSxcclxuICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgIHNpemU6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZFRpbGUobmV3VGlsZSk7XHJcblxyXG4gICAgICAgICQoJzxkaXY+JylcclxuICAgICAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5hcHBlbmQobmV3VGlsZS5nZXRDb21waWxlZFRlbXBsYXRlKCkpXHJcbiAgICAgICAgICAuYXBwZW5kVG8oZ3JvdXBDb250YWluZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzT3B0aW9ucyhvcHRpb25zR3JvdXApIHtcclxuICAgICAgb3B0aW9uc0dyb3VwLmZvckVhY2goKG9wdGlvbkdyb3VwKSA9PiB7XHJcbiAgICAgICAgb3B0aW9uR3JvdXAuc291cmNlLmZvckVhY2goKHRpbGVPcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgICAgZ3JvdXAudXBkYXRlVGlsZU9wdGlvbnModGlsZU9wdGlvbnMub3B0cyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0VGlsZXNHcm91cHModGlsZUdyb3Vwcywgb3B0cywgZ3JvdXBzQ29udGFpbmVycykge1xyXG4gICAgICByZXR1cm4gdGlsZUdyb3Vwcy5tYXAoKGdyb3VwLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCBvcHRzLCB0aGlzLmF2YWlsYWJsZUNvbHVtbnMsIGdyb3Vwc0NvbnRhaW5lcnNbaW5kZXhdKVxyXG4gICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnMoKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc0dyb3Vwcyhvbmx5UG9zaXRpb24gPyAsIGRyYWdnZWRUaWxlID8gKSB7XHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgICBncm91cC5nZW5lcmF0ZUdyaWQodGhpcy5nZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUodGhpcy5hdmFpbGFibGVXaWR0aCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ3JvdXBcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnMob25seVBvc2l0aW9uLCBkcmFnZ2VkVGlsZSlcclxuICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q29udGFpbmVyV2lkdGgoKTogYW55IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy4kc2NvcGUuJGNvbnRhaW5lciB8fCAkKCdib2R5Jyk7XHJcbiAgICAgIHJldHVybiBjb250YWluZXIud2lkdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEF2YWlsYWJsZUNvbHVtbnMoYXZhaWxhYmxlV2lkdGgpOiBhbnkge1xyXG4gICAgICByZXR1cm4gdGhpcy5vcHRzLm1vYmlsZUJyZWFrcG9pbnQgPiBhdmFpbGFibGVXaWR0aCA/IFNJTVBMRV9MQVlPVVRfQ09MVU1OU19DT1VOVCA6XHJcbiAgICAgICAgTWF0aC5mbG9vcihhdmFpbGFibGVXaWR0aCAvICh0aGlzLm9wdHMudGlsZVdpZHRoICsgdGhpcy5vcHRzLmd1dHRlcikpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QWN0aXZlR3JvdXBBbmRUaWxlKGVsZW0pOiBhbnkge1xyXG4gICAgICBjb25zdCBhY3RpdmUgPSB7fTtcclxuXHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZvdW5kVGlsZSA9IGdyb3VwLmdldFRpbGVCeU5vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIGlmIChmb3VuZFRpbGUpIHtcclxuICAgICAgICAgIGFjdGl2ZVsnZ3JvdXAnXSA9IGdyb3VwO1xyXG4gICAgICAgICAgYWN0aXZlWyd0aWxlJ10gPSBmb3VuZFRpbGU7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBhY3RpdmU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUoYXZhaWxhYmxlV2lkdGgpOiBhbnkge1xyXG4gICAgICByZXR1cm4gdGhpcy5vcHRzLm1vYmlsZUJyZWFrcG9pbnQgPiBhdmFpbGFibGVXaWR0aCA/IGF2YWlsYWJsZVdpZHRoIC8gMiAtIHRoaXMub3B0cy5ndXR0ZXIgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnU3RhcnRMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBjb25zdCBhY3RpdmVFbnRpdGllcyA9IHRoaXMuZ2V0QWN0aXZlR3JvdXBBbmRUaWxlKGV2ZW50LnRhcmdldCk7XHJcblxyXG4gICAgICB0aGlzLmNvbnRhaW5lciA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoJy5waXAtZHJhZ2dhYmxlLWdyb3VwJykuZ2V0KDApO1xyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlID0gYWN0aXZlRW50aXRpZXNbJ3RpbGUnXTtcclxuICAgICAgdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAgPSBhY3RpdmVFbnRpdGllc1snZ3JvdXAnXTtcclxuXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2RyYWctdHJhbnNmZXInKTtcclxuXHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUuc3RhcnREcmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICBjb25zdCB4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LnN0eWxlLmxlZnQpIHx8IDApICsgZXZlbnQuZHg7XHJcbiAgICAgIGNvbnN0IHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuc3R5bGUudG9wKSB8fCAwKSArIGV2ZW50LmR5O1xyXG5cclxuICAgICAgdGhpcy5jb250YWluZXJPZmZzZXQgPSB0aGlzLmdldENvbnRhaW5lck9mZnNldCgpO1xyXG5cclxuICAgICAgdGFyZ2V0LnN0eWxlLmxlZnQgPSB4ICsgJ3B4JzsgLy8gVE9ETyBbYXBpZGhpcm55aV0gRXh0cmFjdCB1bml0cyBpbnRvIG9wdGlvbnMgc2VjdGlvblxyXG4gICAgICB0YXJnZXQuc3R5bGUudG9wID0geSArICdweCc7XHJcblxyXG4gICAgICBjb25zdCBiZWxvd0VsZW1lbnQgPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cC5nZXRUaWxlQnlDb29yZGluYXRlcyh7XHJcbiAgICAgICAgbGVmdDogZXZlbnQucGFnZVggLSB0aGlzLmNvbnRhaW5lck9mZnNldC5sZWZ0LFxyXG4gICAgICAgIHRvcDogZXZlbnQucGFnZVkgLSB0aGlzLmNvbnRhaW5lck9mZnNldC50b3BcclxuICAgICAgfSwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcblxyXG4gICAgICBpZiAoYmVsb3dFbGVtZW50KSB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dlZFRpbGVJbmRleCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVJbmRleCh0aGlzLmRyYWdnZWRUaWxlKTtcclxuICAgICAgICBjb25zdCBiZWxvd0VsZW1JbmRleCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVJbmRleChiZWxvd0VsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGRyYWdnZWRUaWxlSW5kZXggKyAxKSA9PT0gYmVsb3dFbGVtSW5kZXgpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwXHJcbiAgICAgICAgICAuc3dhcFRpbGVzKHRoaXMuZHJhZ2dlZFRpbGUsIGJlbG93RWxlbWVudClcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnModHJ1ZSwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zZXRHcm91cENvbnRhaW5lcnNIZWlnaHQoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnRW5kTGlzdGVuZXIoKSB7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUuc3RvcERyYWcodGhpcy5pc1NhbWVEcm9wem9uZSk7XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdkcmFnLXRyYW5zZmVyJyk7XHJcbiAgICAgIHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwID0gbnVsbDtcclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDb250YWluZXJPZmZzZXQoKSB7XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5lclJlY3QgPSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbGVmdDogY29udGFpbmVyUmVjdC5sZWZ0LFxyXG4gICAgICAgIHRvcDogY29udGFpbmVyUmVjdC50b3BcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEdyb3VwQ29udGFpbmVyc0hlaWdodCgpIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKHRpbGVHcm91cCkgPT4ge1xyXG4gICAgICAgIHRpbGVHcm91cC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW92ZVRpbGUoZnJvbSwgdG8sIHRpbGUpIHtcclxuICAgICAgbGV0IGVsZW07XHJcbiAgICAgIGNvbnN0IG1vdmVkVGlsZSA9IGZyb20ucmVtb3ZlVGlsZSh0aWxlKTtcclxuICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAkKHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tfLmZpbmRJbmRleCh0aGlzLnRpbGVHcm91cHMsIGZyb20pXSlcclxuICAgICAgICAuZmluZChtb3ZlZFRpbGUuZ2V0RWxlbSgpKVxyXG4gICAgICAgIC5yZW1vdmUoKTtcclxuXHJcbiAgICAgIGlmICh0byAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRvLmFkZFRpbGUobW92ZWRUaWxlKTtcclxuXHJcbiAgICAgICAgZWxlbSA9IHRoaXMuJGNvbXBpbGUobW92ZWRUaWxlLmdldEVsZW0oKSkodGlsZVNjb3BlKTtcclxuXHJcbiAgICAgICAgJCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbXy5maW5kSW5kZXgodGhpcy50aWxlR3JvdXBzLCB0byldKVxyXG4gICAgICAgICAgLmFwcGVuZChlbGVtKTtcclxuXHJcbiAgICAgICAgdGhpcy4kdGltZW91dCh0by5zZXRUaWxlc0RpbWVuc2lvbnMuYmluZCh0bywgdHJ1ZSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzVGVtcGxhdGVzKCdtb3ZlVGlsZScsIHtcclxuICAgICAgICBmcm9tOiBmcm9tLFxyXG4gICAgICAgIHRvOiB0byxcclxuICAgICAgICB0aWxlOiBtb3ZlZFRpbGVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyb3BMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBjb25zdCBkcm9wcGVkR3JvdXBJbmRleCA9IGV2ZW50LnRhcmdldC5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWU7XHJcbiAgICAgIGNvbnN0IGRyb3BwZWRHcm91cCA9IHRoaXMudGlsZUdyb3Vwc1tkcm9wcGVkR3JvdXBJbmRleF07XHJcblxyXG4gICAgICBpZiAodGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAgIT09IGRyb3BwZWRHcm91cCkge1xyXG4gICAgICAgIHRoaXMubW92ZVRpbGUodGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAsIGRyb3BwZWRHcm91cCwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHModHJ1ZSk7XHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcFRvRmljdEdyb3VwTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZnJvbSA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwO1xyXG4gICAgICBjb25zdCB0aWxlID0gdGhpcy5kcmFnZ2VkVGlsZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkR3JvdXAoe1xyXG4gICAgICAgIHRpdGxlOiAnTmV3IGdyb3VwJyxcclxuICAgICAgICBzb3VyY2U6IFtdXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLm1vdmVUaWxlKGZyb20sIHRoaXMudGlsZUdyb3Vwc1t0aGlzLnRpbGVHcm91cHMubGVuZ3RoIC0gMV0sIHRpbGUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHModHJ1ZSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBpZiAoIXRoaXMuc291cmNlRHJvcFpvbmVFbGVtKSB7XHJcbiAgICAgICAgdGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gPSBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gIT09IGV2ZW50LmRyYWdFdmVudC5kcmFnRW50ZXIpIHtcclxuICAgICAgICBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyLmNsYXNzTGlzdC5hZGQoJ2Ryb3B6b25lLWFjdGl2ZScpO1xyXG4gICAgICAgICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICdjb3B5Jyk7XHJcbiAgICAgICAgdGhpcy5pc1NhbWVEcm9wem9uZSA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICcnKTtcclxuICAgICAgICB0aGlzLmlzU2FtZURyb3B6b25lID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGlmICh0aGlzLnNvdXJjZURyb3Bab25lRWxlbSAhPT0gZXZlbnQudGFyZ2V0KSB7XHJcbiAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5vcHRzLmFjdGl2ZURyb3B6b25lQ2xhc3MpO1xyXG4gICAgICAgICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICcnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wTGVhdmVMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLm9wdHMuYWN0aXZlRHJvcHpvbmVDbGFzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplKCkge1xyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZVdpZHRoID0gdGhpcy5nZXRDb250YWluZXJXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlQ29sdW1ucyA9IHRoaXMuZ2V0QXZhaWxhYmxlQ29sdW1ucyh0aGlzLmF2YWlsYWJsZVdpZHRoKTtcclxuICAgICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0cy5ncm91cENvbnRhbmluZXJTZWxlY3Rvcik7XHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzID0gdGhpcy5pbml0VGlsZXNHcm91cHModGhpcy5ncm91cHMsIHRoaXMub3B0cywgdGhpcy5ncm91cHNDb250YWluZXJzKTtcclxuXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKVxyXG4gICAgICAgICAgLmRyYWdnYWJsZSh7XHJcbiAgICAgICAgICAgIC8vIGVuYWJsZSBhdXRvU2Nyb2xsXHJcbiAgICAgICAgICAgIGF1dG9TY3JvbGw6IHRydWUsXHJcbiAgICAgICAgICAgIG9uc3RhcnQ6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25EcmFnU3RhcnRMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25tb3ZlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJhZ01vdmVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25lbmQ6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25EcmFnRW5kTGlzdGVuZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLWdyb3VwLmZpY3QtZ3JvdXAnKVxyXG4gICAgICAgICAgLmRyb3B6b25lKHtcclxuICAgICAgICAgICAgb25kcm9wOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcFRvRmljdEdyb3VwTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJhZ2VudGVyOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcEVudGVyTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJvcGRlYWN0aXZhdGU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyYWdsZWF2ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BMZWF2ZUxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG5cclxuICAgICAgICBpbnRlcmFjdCgnLnBpcC1kcmFnZ2FibGUtZ3JvdXAnKVxyXG4gICAgICAgICAgLmRyb3B6b25lKHtcclxuICAgICAgICAgICAgb25kcm9wOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcExpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyYWdlbnRlcjogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BFbnRlckxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyb3BkZWFjdGl2YXRlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnbGVhdmU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wTGVhdmVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlWyckY29udGFpbmVyJ11cclxuICAgICAgICAgIC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAnbWQtbWVudSAubWQtaWNvbi1idXR0b24nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJykuZHJhZ2dhYmxlKGZhbHNlKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5vbignbW91c2V1cCB0b3VjaGVuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKS5kcmFnZ2FibGUodHJ1ZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgY29uc3QgRHJhZ0NvbXBvbmVudDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICB0aWxlc1RlbXBsYXRlczogJz1waXBUaWxlc1RlbXBsYXRlcycsXHJcbiAgICAgIHRpbGVzQ29udGV4dDogJz1waXBUaWxlc0NvbnRleHQnLFxyXG4gICAgICBvcHRpb25zOiAnPXBpcERyYWdnYWJsZUdyaWQnLFxyXG4gICAgICBncm91cE1lbnVBY3Rpb25zOiAnPXBpcEdyb3VwTWVudUFjdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICdkcmFnZ2FibGUvRHJhZ2dhYmxlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlckFzOiAnZHJhZ2dhYmxlQ3RybCcsXHJcbiAgICBjb250cm9sbGVyOiBEcmFnZ2FibGVDb250cm9sbGVyXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBEcmFnZ2FibGVHcmlkJywgRHJhZ0NvbXBvbmVudCk7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERyYWdUaWxlQ29uc3RydWN0b3Ige1xyXG4gIG5ldyAob3B0aW9uczogYW55KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIElEcmFnVGlsZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBEcmFnVGlsZUNvbnN0cnVjdG9yLCBvcHRpb25zOiBhbnkpOiBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHRwbDogYW55O1xyXG4gIG9wdHM6IGFueTtcclxuICBzaXplOiBhbnk7XHJcbiAgZWxlbTogYW55O1xyXG4gIHByZXZpZXc6IGFueTtcclxuICBnZXRTaXplKCk6IGFueTtcclxuICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnk7XHJcbiAgc2V0UG9zaXRpb24obGVmdCwgdG9wKTogYW55O1xyXG4gIGdldENvbXBpbGVkVGVtcGxhdGUoKTogYW55O1xyXG4gIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55O1xyXG4gIGdldEVsZW0oKTogYW55O1xyXG4gIHN0YXJ0RHJhZygpOiBhbnk7XHJcbiAgc3RvcERyYWcoaXNBbmltYXRlKTogYW55O1xyXG4gIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpOiB2b2lkO1xyXG4gIGdldE9wdGlvbnMoKTogYW55O1xyXG4gIHNldE9wdGlvbnMob3B0aW9ucyk6IGFueTtcclxufVxyXG5cclxubGV0IERFRkFVTFRfVElMRV9TSVpFID0ge1xyXG4gIGNvbFNwYW46IDEsXHJcbiAgcm93U3BhbjogMVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIERyYWdUaWxlU2VydmljZSBpbXBsZW1lbnRzIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHB1YmxpYyB0cGw6IGFueTtcclxuICBwdWJsaWMgb3B0czogYW55O1xyXG4gIHB1YmxpYyBzaXplOiBhbnk7XHJcbiAgcHVibGljIGVsZW06IGFueTtcclxuICBwdWJsaWMgcHJldmlldzogYW55O1xyXG5cclxuICBjb25zdHJ1Y3RvciAob3B0aW9uczogYW55KSB7XHJcbiAgICB0aGlzLnRwbCA9IG9wdGlvbnMudHBsLmdldCgwKTtcclxuICAgIHRoaXMub3B0cyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLnNpemUgPSBfLm1lcmdlKHt9LCBERUZBVUxUX1RJTEVfU0laRSwgb3B0aW9ucy5zaXplKTtcclxuICAgIHRoaXMuZWxlbSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2l6ZSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2l6ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnkge1xyXG4gICAgdGhpcy5zaXplLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLnNpemUuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFBvc2l0aW9uKGxlZnQsIHRvcCk6IGFueSB7XHJcbiAgICB0aGlzLnNpemUubGVmdCA9IGxlZnQ7XHJcbiAgICB0aGlzLnNpemUudG9wID0gdG9wO1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICB0b3A6IHRvcFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDb21waWxlZFRlbXBsYXRlKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy50cGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55IHtcclxuICAgIHRoaXMuZWxlbSA9ICQodGhpcy50cGwpLnBhcmVudChwYXJlbnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtLmdldCgwKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCk6IGFueSB7XHJcbiAgICB0aGlzLnByZXZpZXcgPSAkKCc8ZGl2PicpXHJcbiAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnZWQtcHJldmlldycpXHJcbiAgICAgIC5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMuZWxlbS5jc3MoJ2xlZnQnKSxcclxuICAgICAgICB0b3A6IHRoaXMuZWxlbS5jc3MoJ3RvcCcpLFxyXG4gICAgICAgIHdpZHRoOiB0aGlzLmVsZW0uY3NzKCd3aWR0aCcpLFxyXG4gICAgICAgIGhlaWdodDogdGhpcy5lbGVtLmNzcygnaGVpZ2h0JylcclxuICAgICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtXHJcbiAgICAgIC5hZGRDbGFzcygnbm8tYW5pbWF0aW9uJylcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgekluZGV4OiAnOTk5OSdcclxuICAgICAgfSlcclxuICAgICAgLmFmdGVyKHRoaXMucHJldmlldyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0b3BEcmFnKGlzQW5pbWF0ZSk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgaWYgKGlzQW5pbWF0ZSkge1xyXG4gICAgICB0aGlzLmVsZW1cclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ25vLWFuaW1hdGlvbicpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiB0aGlzLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHRoaXMucHJldmlldy5jc3MoJ3RvcCcpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub24oJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiBzZWxmLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHNlbGYucHJldmlldy5jc3MoJ3RvcCcpLFxyXG4gICAgICAgICAgekluZGV4OiAnJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCduby1hbmltYXRpb24nKTtcclxuXHJcbiAgICAgIHNlbGYucHJldmlldy5yZW1vdmUoKTtcclxuICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICBmdW5jdGlvbiBvblRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICAgIGlmIChzZWxmLnByZXZpZXcpIHtcclxuICAgICAgICBzZWxmLnByZXZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcygnekluZGV4JywgJycpXHJcbiAgICAgICAgLm9mZigndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpIHtcclxuICAgIHRoaXMucHJldmlldy5jc3MoY29vcmRzKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0T3B0aW9ucygpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0cy5vcHRpb25zO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRPcHRpb25zKG9wdGlvbnMpOiBhbnkge1xyXG4gICAgXy5tZXJnZSh0aGlzLm9wdHMub3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICBfLm1lcmdlKHRoaXMuc2l6ZSwgb3B0aW9ucy5zaXplKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgLnNlcnZpY2UoJ3BpcERyYWdUaWxlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgIGxldCBuZXdUaWxlID0gbmV3IERyYWdUaWxlU2VydmljZShvcHRpb25zKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdUaWxlO1xyXG4gICAgfVxyXG4gIH0pOyIsIntcclxuICBpbnRlcmZhY2UgRHJhZ2dhYmxlVGlsZUF0dHJpYnV0ZXMgZXh0ZW5kcyBuZy5JQXR0cmlidXRlcyB7XHJcbiAgICBwaXBEcmFnZ2FibGVUaWxlczogYW55O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gRHJhZ2dhYmxlVGlsZUxpbmsoXHJcbiAgICAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICRlbGVtOiBKUXVlcnksXHJcbiAgICAkYXR0cjogRHJhZ2dhYmxlVGlsZUF0dHJpYnV0ZXNcclxuICApIHtcclxuICAgIGNvbnN0IGRvY0ZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXHJcbiAgICAgIGdyb3VwID0gJHNjb3BlLiRldmFsKCRhdHRyLnBpcERyYWdnYWJsZVRpbGVzKTtcclxuXHJcbiAgICBncm91cC5mb3JFYWNoKGZ1bmN0aW9uICh0aWxlKSB7XHJcbiAgICAgIGNvbnN0IHRwbCA9IHdyYXBDb21wb25lbnQodGlsZS5nZXRDb21waWxlZFRlbXBsYXRlKCkpO1xyXG4gICAgICBkb2NGcmFnLmFwcGVuZENoaWxkKHRwbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkZWxlbS5hcHBlbmQoZG9jRnJhZyk7XHJcblxyXG4gICAgZnVuY3Rpb24gd3JhcENvbXBvbmVudChlbGVtKSB7XHJcbiAgICAgIHJldHVybiAkKCc8ZGl2PicpXHJcbiAgICAgICAgLmFkZENsYXNzKCdwaXAtZHJhZ2dhYmxlLXRpbGUnKVxyXG4gICAgICAgIC5hcHBlbmQoZWxlbSlcclxuICAgICAgICAuZ2V0KDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gRHJhZ2dhYmxlVGlsZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgIGxpbms6IERyYWdnYWJsZVRpbGVMaW5rXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBEcmFnZ2FibGVUaWxlcycsIERyYWdnYWJsZVRpbGUpO1xyXG5cclxufSIsImV4cG9ydCBpbnRlcmZhY2UgVGlsZXNHcmlkQ29uc3RydWN0b3Ige1xyXG4gIG5ldyh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBJVGlsZXNHcmlkQ29uc3RydWN0b3IoY29uc3RydWN0b3I6IFRpbGVzR3JpZENvbnN0cnVjdG9yLCB0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk6IElUaWxlc0dyaWRTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgdGlsZXM6IGFueTtcclxuICBvcHRzOiBhbnk7XHJcbiAgY29sdW1uczogYW55O1xyXG4gIGVsZW06IGFueTtcclxuICBncmlkQ2VsbHM6IGFueTtcclxuICBpbmxpbmU6IGJvb2xlYW47XHJcbiAgaXNNb2JpbGVMYXlvdXQ6IGJvb2xlYW47XHJcblxyXG4gIGFkZFRpbGUodGlsZSk6IGFueTtcclxuICBnZXRDZWxsQnlQb3NpdGlvbihyb3csIGNvbCk6IGFueTtcclxuICBnZXRDZWxscyhwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueTtcclxuICBnZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRCYXNpY1JvdyhwcmV2Q2VsbCk6IGFueTtcclxuICBpc0NlbGxGcmVlKHJvdywgY29sKTogYW55O1xyXG4gIGdldENlbGxJbmRleChzcmNDZWxsKTogYW55O1xyXG4gIHJlc2VydmVDZWxscyhzdGFydCwgZW5kLCBlbGVtKTogdm9pZDtcclxuICBjbGVhckVsZW1lbnRzKCk6IHZvaWQ7XHJcbiAgc2V0QXZhaWxhYmxlQ29sdW1ucyhjb2x1bW5zKTogYW55O1xyXG4gIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGggPyApOiBhbnk7XHJcbiAgc2V0VGlsZXNEaW1lbnNpb25zKG9ubHlQb3NpdGlvbiwgZHJhZ2dlZFRpbGUpOiBhbnk7XHJcbiAgY2FsY0NvbnRhaW5lckhlaWdodCgpOiBhbnk7XHJcbiAgZ2V0VGlsZUJ5Tm9kZShub2RlKTogYW55O1xyXG4gIGdldFRpbGVCeUNvb3JkaW5hdGVzKGNvb3JkcywgZHJhZ2dlZFRpbGUpOiBhbnk7XHJcbiAgZ2V0VGlsZUluZGV4KHRpbGUpOiBhbnk7XHJcbiAgc3dhcFRpbGVzKG1vdmVkVGlsZSwgYmVmb3JlVGlsZSk6IGFueTtcclxuICByZW1vdmVUaWxlKHJlbW92ZVRpbGUpOiBhbnk7XHJcbiAgdXBkYXRlVGlsZU9wdGlvbnMob3B0cyk6IGFueTtcclxufVxyXG5cclxuY29uc3QgTU9CSUxFX0xBWU9VVF9DT0xVTU5TID0gMjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUaWxlc0dyaWRTZXJ2aWNlIGltcGxlbWVudHMgSVRpbGVzR3JpZFNlcnZpY2Uge1xyXG4gIHB1YmxpYyB0aWxlczogYW55O1xyXG4gIHB1YmxpYyBvcHRzOiBhbnk7XHJcbiAgcHVibGljIGNvbHVtbnM6IGFueTtcclxuICBwdWJsaWMgZWxlbTogYW55O1xyXG4gIHB1YmxpYyBncmlkQ2VsbHM6IGFueSA9IFtdO1xyXG4gIHB1YmxpYyBpbmxpbmU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgaXNNb2JpbGVMYXlvdXQ6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKSB7XHJcbiAgICB0aGlzLnRpbGVzID0gdGlsZXM7XHJcbiAgICB0aGlzLm9wdHMgPSBvcHRpb25zO1xyXG4gICAgdGhpcy5jb2x1bW5zID0gY29sdW1ucyB8fCAwOyAvLyBhdmFpbGFibGUgY29sdW1ucyBpbiBhIHJvd1xyXG4gICAgdGhpcy5lbGVtID0gZWxlbTtcclxuICAgIHRoaXMuZ3JpZENlbGxzID0gW107XHJcbiAgICB0aGlzLmlubGluZSA9IG9wdGlvbnMuaW5saW5lIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5pc01vYmlsZUxheW91dCA9IGNvbHVtbnMgPT09IE1PQklMRV9MQVlPVVRfQ09MVU1OUztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRUaWxlKHRpbGUpOiBhbnkge1xyXG4gICAgdGhpcy50aWxlcy5wdXNoKHRpbGUpO1xyXG4gICAgaWYgKHRoaXMudGlsZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdGVHcmlkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldENlbGxCeVBvc2l0aW9uKHJvdywgY29sKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRDZWxsc1tyb3ddW2NvbF07XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldENlbGxzKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55IHtcclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEF2YWlsYWJsZUNlbGxzTW9iaWxlKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEF2YWlsYWJsZUNlbGxzRGVza3RvcChwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEF2YWlsYWJsZUNlbGxzRGVza3RvcChwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueSB7XHJcbiAgICBsZXQgbGVmdENvcm5lckNlbGw7XHJcbiAgICBsZXQgcmlnaHRDb3JuZXJDZWxsO1xyXG4gICAgY29uc3QgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuICAgIGNvbnN0IGJhc2ljUm93ID0gdGhpcy5nZXRCYXNpY1JvdyhwcmV2Q2VsbCk7XHJcblxyXG4gICAgLy8gU21hbGwgdGlsZVxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDEgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBjb25zdCBncmlkQ29weSA9IHRoaXMuZ3JpZENlbGxzLnNsaWNlKCk7XHJcblxyXG4gICAgICBpZiAoIXByZXZDZWxsKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSBncmlkQ29weVswXVswXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3csIGJhc2ljQ29sLCB0aGlzLmNvbHVtbnMpO1xyXG5cclxuICAgICAgICBpZiAoIWxlZnRDb3JuZXJDZWxsKSB7XHJcbiAgICAgICAgICBjb25zdCByb3dTaGlmdCA9IHRoaXMuaXNNb2JpbGVMYXlvdXQgPyAxIDogMjtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdyArIHJvd1NoaWZ0LCAwLCB0aGlzLmNvbHVtbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1lZGl1bSB0aWxlXHJcbiAgICBpZiAoY29sU3BhbiA9PT0gMiAmJiByb3dTcGFuID09PSAxKSB7XHJcbiAgICAgIGNvbnN0IHByZXZUaWxlU2l6ZSA9IHByZXZDZWxsICYmIHByZXZDZWxsLmVsZW0uc2l6ZSB8fCBudWxsO1xyXG5cclxuICAgICAgaWYgKCFwcmV2VGlsZVNpemUpIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sKTtcclxuICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpO1xyXG4gICAgICB9IGVsc2UgaWYgKHByZXZUaWxlU2l6ZS5jb2xTcGFuID09PSAyICYmIHByZXZUaWxlU2l6ZS5yb3dTcGFuID09PSAyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAtIGJhc2ljQ29sIC0gMiA+IDApIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmIChwcmV2Q2VsbC5yb3cgJSAyID09PSAwKSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCAtIDEpO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAtIGJhc2ljQ29sIC0gMyA+PSAwKSB7XHJcbiAgICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHByZXZUaWxlU2l6ZS5jb2xTcGFuID09PSAxICYmIHByZXZUaWxlU2l6ZS5yb3dTcGFuID09PSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAtIGJhc2ljQ29sIC0gMyA+PSAwKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5pc0NlbGxGcmVlKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpKSB7XHJcbiAgICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQmlnIHRpbGVcclxuICAgIGlmICghcHJldkNlbGwgJiYgcm93U3BhbiA9PT0gMiAmJiBjb2xTcGFuID09PSAyKSB7XHJcbiAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wpO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgKyAxKTtcclxuICAgIH0gZWxzZSBpZiAocm93U3BhbiA9PT0gMiAmJiBjb2xTcGFuID09PSAyKSB7XHJcbiAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDIgPiAwKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNDZWxsRnJlZShiYXNpY1JvdywgYmFzaWNDb2wgKyAxKSkge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCArIDMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMywgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGFydDogbGVmdENvcm5lckNlbGwsXHJcbiAgICAgIGVuZDogcmlnaHRDb3JuZXJDZWxsXHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsKHNyYywgYmFzaWNSb3csIGJhc2ljQ29sLCBjb2x1bW5zKTogYW55IHtcclxuICAgIGxldCBjZWxsLCBjb2wsIHJvdztcclxuXHJcbiAgICBpZiAodGhpcy5pc01vYmlsZUxheW91dCkge1xyXG4gICAgICAvLyBtb2JpbGUgbGF5b3V0XHJcbiAgICAgIGZvciAoY29sID0gYmFzaWNDb2w7IGNvbCA8IGNvbHVtbnM7IGNvbCsrKSB7XHJcbiAgICAgICAgaWYgKCFzcmNbYmFzaWNSb3ddW2NvbF0uZWxlbSkge1xyXG4gICAgICAgICAgY2VsbCA9IHNyY1tiYXNpY1Jvd11bY29sXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGNlbGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVza3RvcFxyXG4gICAgZm9yIChjb2wgPSBiYXNpY0NvbDsgY29sIDwgY29sdW1uczsgY29sKyspIHtcclxuICAgICAgZm9yIChyb3cgPSAwOyByb3cgPCAyOyByb3crKykge1xyXG4gICAgICAgIGlmICghc3JjW3JvdyArIGJhc2ljUm93XVtjb2xdLmVsZW0pIHtcclxuICAgICAgICAgIGNlbGwgPSBzcmNbcm93ICsgYmFzaWNSb3ddW2NvbF07XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjZWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QXZhaWxhYmxlQ2VsbHNNb2JpbGUocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnkge1xyXG4gICAgbGV0IGxlZnRDb3JuZXJDZWxsO1xyXG4gICAgbGV0IHJpZ2h0Q29ybmVyQ2VsbDtcclxuICAgIGNvbnN0IGJhc2ljUm93ID0gdGhpcy5nZXRCYXNpY1JvdyhwcmV2Q2VsbCk7XHJcbiAgICBjb25zdCBiYXNpY0NvbCA9IHByZXZDZWxsICYmIHByZXZDZWxsLmNvbCB8fCAwO1xyXG5cclxuXHJcbiAgICBpZiAoY29sU3BhbiA9PT0gMSAmJiByb3dTcGFuID09PSAxKSB7XHJcbiAgICAgIGNvbnN0IGdyaWRDb3B5ID0gdGhpcy5ncmlkQ2VsbHMuc2xpY2UoKTtcclxuXHJcbiAgICAgIGlmICghcHJldkNlbGwpIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IGdyaWRDb3B5WzBdWzBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdywgYmFzaWNDb2wsIHRoaXMuY29sdW1ucyk7XHJcblxyXG4gICAgICAgIGlmICghbGVmdENvcm5lckNlbGwpIHtcclxuICAgICAgICAgIGNvbnN0IHJvd1NoaWZ0ID0gdGhpcy5pc01vYmlsZUxheW91dCA/IDEgOiAyO1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93ICsgcm93U2hpZnQsIDAsIHRoaXMuY29sdW1ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIDApO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgcm93U3BhbiAtIDEsIDEpO1xyXG4gICAgfSBlbHNlIGlmIChjb2xTcGFuID09PSAyKSB7XHJcbiAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIDApO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgcm93U3BhbiwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QmFzaWNSb3cocHJldkNlbGwpOiBhbnkge1xyXG4gICAgbGV0IGJhc2ljUm93O1xyXG5cclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIGlmIChwcmV2Q2VsbCkge1xyXG4gICAgICAgIGJhc2ljUm93ID0gcHJldkNlbGwgJiYgcHJldkNlbGwucm93IHx8IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocHJldkNlbGwpIHtcclxuICAgICAgICBiYXNpY1JvdyA9IHByZXZDZWxsLnJvdyAlIDIgPT09IDAgPyBwcmV2Q2VsbC5yb3cgOiBwcmV2Q2VsbC5yb3cgLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2ljUm93ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBiYXNpY1JvdztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgaXNDZWxsRnJlZShyb3csIGNvbCk6IGFueSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZ3JpZENlbGxzW3Jvd11bY29sXS5lbGVtO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsSW5kZXgoc3JjQ2VsbCk6IGFueSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGxldCBpbmRleDtcclxuXHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3csIHJvd0luZGV4KSA9PiB7XHJcbiAgICAgIGluZGV4ID0gXy5maW5kSW5kZXgoc2VsZi5ncmlkQ2VsbHNbcm93SW5kZXhdLCAoY2VsbCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBjZWxsID09PSBzcmNDZWxsO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBpbmRleCAhPT0gLTEgPyBpbmRleCA6IDA7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHJlc2VydmVDZWxscyhzdGFydCwgZW5kLCBlbGVtKSB7XHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgcm93LmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgICBpZiAoY2VsbC5yb3cgPj0gc3RhcnQucm93ICYmIGNlbGwucm93IDw9IGVuZC5yb3cgJiZcclxuICAgICAgICAgIGNlbGwuY29sID49IHN0YXJ0LmNvbCAmJiBjZWxsLmNvbCA8PSBlbmQuY29sKSB7XHJcbiAgICAgICAgICBjZWxsLmVsZW0gPSBlbGVtO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgY2xlYXJFbGVtZW50cygpIHtcclxuICAgIHRoaXMuZ3JpZENlbGxzLmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgICByb3cuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgIHRpbGUuZWxlbSA9IG51bGw7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldEF2YWlsYWJsZUNvbHVtbnMoY29sdW1ucyk6IGFueSB7XHJcbiAgICB0aGlzLmlzTW9iaWxlTGF5b3V0ID0gY29sdW1ucyA9PT0gTU9CSUxFX0xBWU9VVF9DT0xVTU5TO1xyXG4gICAgdGhpcy5jb2x1bW5zID0gY29sdW1ucztcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2VuZXJhdGVHcmlkKHNpbmdsZVRpbGVXaWR0aCA/ICk6IGFueSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcyxcclxuICAgICAgICAgIHRpbGVXaWR0aCA9IHNpbmdsZVRpbGVXaWR0aCB8fCB0aGlzLm9wdHMudGlsZVdpZHRoLFxyXG4gICAgICAgICAgb2Zmc2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBpcC1kcmFnZ2FibGUtZ3JvdXAtdGl0bGUnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGxldCAgIGNvbHNJblJvdyA9IDAsXHJcbiAgICAgICAgICByb3dzID0gMCxcclxuICAgICAgICAgIGdyaWRJblJvdyA9IFtdO1xyXG5cclxuICAgIHRoaXMuZ3JpZENlbGxzID0gW107XHJcblxyXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlLCBpbmRleCwgc3JjVGlsZXMpID0+IHtcclxuICAgICAgY29uc3QgdGlsZVNpemUgPSB0aWxlLmdldFNpemUoKTtcclxuXHJcbiAgICAgIGdlbmVyYXRlQ2VsbHModGlsZVNpemUuY29sU3Bhbik7XHJcblxyXG4gICAgICBpZiAoc3JjVGlsZXMubGVuZ3RoID09PSBpbmRleCArIDEpIHtcclxuICAgICAgICBpZiAoY29sc0luUm93IDwgc2VsZi5jb2x1bW5zKSB7XHJcbiAgICAgICAgICBnZW5lcmF0ZUNlbGxzKHNlbGYuY29sdW1ucyAtIGNvbHNJblJvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBtb3JlIGNlbGxzIGZvciBleHRlbmRzIHRpbGUgc2l6ZSB0byBiaWdcclxuICAgICAgICBpZiAoc2VsZi50aWxlcy5sZW5ndGggKiAyID4gc2VsZi5ncmlkQ2VsbHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBBcnJheS5hcHBseShudWxsLCBBcnJheShzZWxmLnRpbGVzLmxlbmd0aCAqIDIgLSBzZWxmLmdyaWRDZWxscy5sZW5ndGgpKS5mb3JFYWNoKCgpID0+IHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVDZWxscyhzZWxmLmNvbHVtbnMpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNlbGxzKG5ld0NlbGxDb3VudCkge1xyXG4gICAgICBBcnJheS5hcHBseShudWxsLCBBcnJheShuZXdDZWxsQ291bnQpKS5mb3JFYWNoKCgpID0+IHtcclxuICAgICAgICBpZiAoc2VsZi5jb2x1bW5zIDwgY29sc0luUm93ICsgMSkge1xyXG4gICAgICAgICAgcm93cysrO1xyXG4gICAgICAgICAgY29sc0luUm93ID0gMDtcclxuXHJcbiAgICAgICAgICBzZWxmLmdyaWRDZWxscy5wdXNoKGdyaWRJblJvdyk7XHJcbiAgICAgICAgICBncmlkSW5Sb3cgPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3AgPSByb3dzICogc2VsZi5vcHRzLnRpbGVIZWlnaHQgKyAocm93cyA/IHJvd3MgKiBzZWxmLm9wdHMuZ3V0dGVyIDogMCkgKyBvZmZzZXQuaGVpZ2h0O1xyXG4gICAgICAgIGxldCBsZWZ0ID0gY29sc0luUm93ICogdGlsZVdpZHRoICsgKGNvbHNJblJvdyA/IGNvbHNJblJvdyAqIHNlbGYub3B0cy5ndXR0ZXIgOiAwKTtcclxuXHJcbiAgICAgICAgLy8gRGVzY3JpYmUgZ3JpZCBjZWxsIHNpemUgdGhyb3VnaCBibG9jayBjb3JuZXJzIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgZ3JpZEluUm93LnB1c2goe1xyXG4gICAgICAgICAgdG9wOiB0b3AsXHJcbiAgICAgICAgICBsZWZ0OiBsZWZ0LFxyXG4gICAgICAgICAgYm90dG9tOiB0b3AgKyBzZWxmLm9wdHMudGlsZUhlaWdodCxcclxuICAgICAgICAgIHJpZ2h0OiBsZWZ0ICsgdGlsZVdpZHRoLFxyXG4gICAgICAgICAgcm93OiByb3dzLFxyXG4gICAgICAgICAgY29sOiBjb2xzSW5Sb3dcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29sc0luUm93Kys7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRUaWxlc0RpbWVuc2lvbnMob25seVBvc2l0aW9uLCBkcmFnZ2VkVGlsZSk6IGFueSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGxldCBjdXJySW5kZXggPSAwO1xyXG4gICAgbGV0IHByZXZDZWxsO1xyXG5cclxuICAgIGlmIChvbmx5UG9zaXRpb24pIHtcclxuICAgICAgc2VsZi5jbGVhckVsZW1lbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcbiAgICAgIGxldCBzdGFydENlbGw7XHJcbiAgICAgIGxldCB3aWR0aDtcclxuICAgICAgbGV0IGhlaWdodDtcclxuICAgICAgbGV0IGNlbGxzO1xyXG5cclxuICAgICAgdGlsZS51cGRhdGVFbGVtKCcucGlwLWRyYWdnYWJsZS10aWxlJyk7XHJcbiAgICAgIGlmICh0aWxlU2l6ZS5jb2xTcGFuID09PSAxKSB7XHJcbiAgICAgICAgaWYgKHByZXZDZWxsICYmIHByZXZDZWxsLmVsZW0uc2l6ZS5jb2xTcGFuID09PSAyICYmIHByZXZDZWxsLmVsZW0uc2l6ZS5yb3dTcGFuID09PSAxKSB7XHJcbiAgICAgICAgICBzdGFydENlbGwgPSBzZWxmLmdldENlbGxzKHNlbGYuZ2V0Q2VsbEJ5UG9zaXRpb24ocHJldkNlbGwucm93LCBwcmV2Q2VsbC5jb2wgLSAxKSwgMSwgMSkuc3RhcnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXJ0Q2VsbCA9IHNlbGYuZ2V0Q2VsbHMocHJldkNlbGwsIDEsIDEpLnN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgICB3aWR0aCA9IHN0YXJ0Q2VsbC5yaWdodCAtIHN0YXJ0Q2VsbC5sZWZ0O1xyXG4gICAgICAgICAgaGVpZ2h0ID0gc3RhcnRDZWxsLmJvdHRvbSAtIHN0YXJ0Q2VsbC50b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmV2Q2VsbCA9IHN0YXJ0Q2VsbDtcclxuXHJcbiAgICAgICAgc2VsZi5yZXNlcnZlQ2VsbHMoc3RhcnRDZWxsLCBzdGFydENlbGwsIHRpbGUpO1xyXG5cclxuICAgICAgICBjdXJySW5kZXgrKztcclxuICAgICAgfSBlbHNlIGlmICh0aWxlU2l6ZS5jb2xTcGFuID09PSAyKSB7XHJcbiAgICAgICAgY2VsbHMgPSBzZWxmLmdldENlbGxzKHByZXZDZWxsLCB0aWxlU2l6ZS5yb3dTcGFuLCB0aWxlU2l6ZS5jb2xTcGFuKTtcclxuICAgICAgICBzdGFydENlbGwgPSBjZWxscy5zdGFydDtcclxuXHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIHdpZHRoID0gY2VsbHMuZW5kLnJpZ2h0IC0gY2VsbHMuc3RhcnQubGVmdDtcclxuICAgICAgICAgIGhlaWdodCA9IGNlbGxzLmVuZC5ib3R0b20gLSBjZWxscy5zdGFydC50b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmV2Q2VsbCA9IGNlbGxzLmVuZDtcclxuXHJcbiAgICAgICAgc2VsZi5yZXNlcnZlQ2VsbHMoY2VsbHMuc3RhcnQsIGNlbGxzLmVuZCwgdGlsZSk7XHJcblxyXG4gICAgICAgIGN1cnJJbmRleCArPSAyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW5kZXIgcHJldmlld1xyXG4gICAgICAvLyB3aGlsZSB0aWxlcyBmcm9tIGdyb3VwIGlzIGRyYWdnZWRcclxuICAgICAgaWYgKGRyYWdnZWRUaWxlID09PSB0aWxlKSB7XHJcbiAgICAgICAgdGlsZS5zZXRQcmV2aWV3UG9zaXRpb24oe1xyXG4gICAgICAgICAgbGVmdDogc3RhcnRDZWxsLmxlZnQsXHJcbiAgICAgICAgICB0b3A6IHN0YXJ0Q2VsbC50b3BcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgIHRpbGUuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGlsZS5zZXRQb3NpdGlvbihzdGFydENlbGwubGVmdCwgc3RhcnRDZWxsLnRvcCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgY2FsY0NvbnRhaW5lckhlaWdodCgpOiBhbnkge1xyXG4gICAgbGV0IG1heEhlaWdodFNpemUsIG1heFdpZHRoU2l6ZTtcclxuXHJcbiAgICBpZiAoIXRoaXMudGlsZXMubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIG1heEhlaWdodFNpemUgPSBfLm1heEJ5KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgIHJldHVybiB0aWxlU2l6ZS50b3AgKyB0aWxlU2l6ZS5oZWlnaHQ7XHJcbiAgICB9KVsnZ2V0U2l6ZSddKCk7XHJcblxyXG4gICAgdGhpcy5lbGVtLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodFNpemUudG9wICsgbWF4SGVpZ2h0U2l6ZS5oZWlnaHQgKyAncHgnO1xyXG5cclxuICAgIGlmICh0aGlzLmlubGluZSkge1xyXG4gICAgICBtYXhXaWR0aFNpemUgPSBfLm1heEJ5KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGlsZVNpemUgPSB0aWxlWydnZXRTaXplJ10oKTtcclxuICAgICAgICByZXR1cm4gdGlsZVNpemUubGVmdCArIHRpbGVTaXplLndpZHRoO1xyXG4gICAgICB9KVsnZ2V0U2l6ZSddKCk7XHJcblxyXG4gICAgICB0aGlzLmVsZW0uc3R5bGUud2lkdGggPSBtYXhXaWR0aFNpemUubGVmdCArIG1heFdpZHRoU2l6ZS53aWR0aCArICdweCc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldFRpbGVCeU5vZGUobm9kZSk6IGFueSB7XHJcbiAgICBjb25zdCBmb3VuZFRpbGUgPSB0aGlzLnRpbGVzLmZpbHRlcigodGlsZSkgPT4ge1xyXG4gICAgICByZXR1cm4gbm9kZSA9PT0gdGlsZS5nZXRFbGVtKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZm91bmRUaWxlLmxlbmd0aCA/IGZvdW5kVGlsZVswXSA6IG51bGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldFRpbGVCeUNvb3JkaW5hdGVzKGNvb3JkcywgZHJhZ2dlZFRpbGUpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMudGlsZXNcclxuICAgICAgLmZpbHRlcigodGlsZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aWxlICE9PSBkcmFnZ2VkVGlsZSAmJlxyXG4gICAgICAgICAgdGlsZVNpemUubGVmdCA8PSBjb29yZHMubGVmdCAmJiBjb29yZHMubGVmdCA8PSAodGlsZVNpemUubGVmdCArIHRpbGVTaXplLndpZHRoKSAmJlxyXG4gICAgICAgICAgdGlsZVNpemUudG9wIDw9IGNvb3Jkcy50b3AgJiYgY29vcmRzLnRvcCA8PSAodGlsZVNpemUudG9wICsgdGlsZVNpemUuaGVpZ2h0KTtcclxuICAgICAgfSlbMF0gfHwgbnVsbDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0VGlsZUluZGV4KHRpbGUpOiBhbnkge1xyXG4gICAgcmV0dXJuIF8uZmluZEluZGV4KHRoaXMudGlsZXMsIHRpbGUpO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzd2FwVGlsZXMobW92ZWRUaWxlLCBiZWZvcmVUaWxlKTogYW55IHtcclxuICAgIGNvbnN0IG1vdmVkVGlsZUluZGV4ID0gXy5maW5kSW5kZXgodGhpcy50aWxlcywgbW92ZWRUaWxlKTtcclxuICAgIGNvbnN0IGJlZm9yZVRpbGVJbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsIGJlZm9yZVRpbGUpO1xyXG5cclxuICAgIHRoaXMudGlsZXMuc3BsaWNlKG1vdmVkVGlsZUluZGV4LCAxKTtcclxuICAgIHRoaXMudGlsZXMuc3BsaWNlKGJlZm9yZVRpbGVJbmRleCwgMCwgbW92ZWRUaWxlKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgcmVtb3ZlVGlsZShyZW1vdmVUaWxlKTogYW55IHtcclxuICAgIGxldCBkcm9wcGVkVGlsZTtcclxuXHJcbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUsIGluZGV4LCB0aWxlcykgPT4ge1xyXG4gICAgICBpZiAodGlsZSA9PT0gcmVtb3ZlVGlsZSkge1xyXG4gICAgICAgIGRyb3BwZWRUaWxlID0gdGlsZXMuc3BsaWNlKGluZGV4LCAxKVswXTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBkcm9wcGVkVGlsZTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgdXBkYXRlVGlsZU9wdGlvbnMob3B0cyk6IGFueSB7XHJcbiAgICBjb25zdCBpbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aWxlWydnZXRPcHRpb25zJ10oKSA9PT0gb3B0cztcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy50aWxlc1tpbmRleF0uc2V0T3B0aW9ucyhvcHRzKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH07XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBEcmFnZ2VkJylcclxuICAuc2VydmljZSgncGlwVGlsZXNHcmlkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSkge1xyXG4gICAgICBsZXQgbmV3R3JpZCA9IG5ldyBUaWxlc0dyaWRTZXJ2aWNlKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdHcmlkO1xyXG4gICAgfVxyXG4gIH0pOyIsImV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldFRlbXBsYXRlU2VydmljZSB7XHJcbiAgICBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55O1xyXG4gICAgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKTogdm9pZDtcclxufSBcclxuXHJcbntcclxuICAgIGNsYXNzIHdpZGdldFRlbXBsYXRlU2VydmljZSBpbXBsZW1lbnRzIElXaWRnZXRUZW1wbGF0ZVNlcnZpY2Uge1xyXG4gICAgICAgIHByaXZhdGUgXyRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlO1xyXG4gICAgICAgIHByaXZhdGUgXyRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZTtcclxuICAgICAgICBwcml2YXRlIF8kdGVtcGxhdGVSZXF1ZXN0OiBhbmd1bGFyLklUZW1wbGF0ZVJlcXVlc3RTZXJ2aWNlO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgJGludGVycG9sYXRlOiBhbmd1bGFyLklJbnRlcnBvbGF0ZVNlcnZpY2UsXHJcbiAgICAgICAgICAgICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgICAgICAgJHRlbXBsYXRlUmVxdWVzdDogYW5ndWxhci5JVGVtcGxhdGVSZXF1ZXN0U2VydmljZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLl8kaW50ZXJwb2xhdGUgPSAkaW50ZXJwb2xhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuXyRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICAgICAgICAgIHRoaXMuXyR0ZW1wbGF0ZVJlcXVlc3QgPSAkdGVtcGxhdGVSZXF1ZXN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFRlbXBsYXRlKHNvdXJjZSwgdHBsID8gLCB0aWxlU2NvcGUgPyAsIHN0cmljdENvbXBpbGUgPyApOiBhbnkge1xyXG4gICAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsLFxyXG4gICAgICAgICAgICAgICAgdHlwZVxyXG4gICAgICAgICAgICB9ID0gc291cmNlO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGludGVycG9sYXRlZCA9IHRwbCA/IHRoaXMuXyRpbnRlcnBvbGF0ZSh0cGwpKHNvdXJjZSkgOiB0aGlzLl8kaW50ZXJwb2xhdGUodGVtcGxhdGUpKHNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyaWN0Q29tcGlsZSA9PSB0cnVlID9cclxuICAgICAgICAgICAgICAgICAgICAodGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaW50ZXJwb2xhdGVkKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUoaW50ZXJwb2xhdGVkKSkgOlxyXG4gICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRlZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUodGVtcGxhdGUpKHRpbGVTY29wZSkgOiB0aGlzLl8kY29tcGlsZSh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZVVybCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fJHRlbXBsYXRlUmVxdWVzdCh0ZW1wbGF0ZVVybCwgZmFsc2UpLnRoZW4oKGh0bWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aWxlU2NvcGUgPyB0aGlzLl8kY29tcGlsZShodG1sKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUoaHRtbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRJbWFnZU1hcmdpbkNTUygkZWxlbWVudCwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgbGV0XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJXaWR0aCA9ICRlbGVtZW50LndpZHRoID8gJGVsZW1lbnQud2lkdGgoKSA6ICRlbGVtZW50LmNsaWVudFdpZHRoLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGVsZW1lbnQuaGVpZ2h0ID8gJGVsZW1lbnQuaGVpZ2h0KCkgOiAkZWxlbWVudC5jbGllbnRIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICBpbWFnZVdpZHRoID0gKGltYWdlWzBdID8gaW1hZ2VbMF0ubmF0dXJhbFdpZHRoIDogaW1hZ2UubmF0dXJhbFdpZHRoKSB8fCBpbWFnZS53aWR0aCxcclxuICAgICAgICAgICAgICAgIGltYWdlSGVpZ2h0ID0gKGltYWdlWzBdID8gaW1hZ2VbMF0ubmF0dXJhbEhlaWdodCA6IGltYWdlLm5hdHVyYWxXaWR0aCkgfHwgaW1hZ2UuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgbWFyZ2luID0gMCxcclxuICAgICAgICAgICAgICAgIGNzc1BhcmFtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKChpbWFnZVdpZHRoIC8gY29udGFpbmVyV2lkdGgpID4gKGltYWdlSGVpZ2h0IC8gY29udGFpbmVySGVpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VXaWR0aCAvIGltYWdlSGVpZ2h0ICogY29udGFpbmVySGVpZ2h0IC0gY29udGFpbmVyV2lkdGgpIC8gMik7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi1sZWZ0J10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBjb250YWluZXJIZWlnaHQgKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgICAgICAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgaW1hZ2VXaWR0aCAqIGNvbnRhaW5lckhlaWdodCAvIGltYWdlSGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi10b3AnXSA9ICcnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VIZWlnaHQgLyBpbWFnZVdpZHRoICogY29udGFpbmVyV2lkdGggLSBjb250YWluZXJIZWlnaHQpIC8gMik7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi10b3AnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgICAgICAgICAgIGNzc1BhcmFtc1snaGVpZ2h0J10gPSAnJyArIGltYWdlSGVpZ2h0ICogY29udGFpbmVyV2lkdGggLyBpbWFnZVdpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGNvbnRhaW5lcldpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi1sZWZ0J10gPSAnJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJChpbWFnZSkuY3NzKGNzc1BhcmFtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGltYWdlIGxvYWQgZGlyZWN0aXZlIFRPRE86IHJlbW92ZSB0byBwaXBJbWFnZVV0aWxzXHJcbiAgICBjb25zdCBJbWFnZUxvYWQgPSBmdW5jdGlvbiBJbWFnZUxvYWQoJHBhcnNlOiBuZy5JUGFyc2VTZXJ2aWNlKTogbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IEpRdWVyeSwgYXR0cnM6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMucGlwSW1hZ2VMb2FkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2xvYWQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhzY29wZSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQ6IGV2ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgICAgICAuc2VydmljZSgncGlwV2lkZ2V0VGVtcGxhdGUnLCB3aWRnZXRUZW1wbGF0ZVNlcnZpY2UpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgncGlwSW1hZ2VMb2FkJywgSW1hZ2VMb2FkKTtcclxufSIsIigoKSA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGlwV2lkZ2V0JywgW10pO1xyXG59KSgpO1xyXG5cclxuaW1wb3J0ICcuL2NhbGVuZGFyL1dpZGdldENhbGVuZGFyJztcclxuaW1wb3J0ICcuL2V2ZW50L1dpZGdldEV2ZW50JztcclxuaW1wb3J0ICcuL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQgJy4vbWVudS9XaWRnZXRNZW51RGlyZWN0aXZlJztcclxuaW1wb3J0ICcuL25vdGVzL1dpZGdldE5vdGVzJztcclxuaW1wb3J0ICcuL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uJztcclxuaW1wb3J0ICcuL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcyc7XHJcbmltcG9ydCAnLi9waWN0dXJlX3NsaWRlci9XaWRnZXRQaWN0dXJlU2xpZGVyJztcclxuIiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNsYXNzIENhbGVuZGFyV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICAgIHByaXZhdGUgXyRzY29wZTogYW5ndWxhci5JU2NvcGU7XHJcbiAgICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG5cclxuICAgIHB1YmxpYyBjb2xvcjogc3RyaW5nID0gJ2JsdWUnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwaXBXaWRnZXRNZW51OiBhbnksXHJcbiAgICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgICB0aGlzLl9jb25maWdEaWFsb2cgPSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlO1xyXG5cclxuICAgICAgaWYgKHRoaXNbJ29wdGlvbnMnXSkge1xyXG4gICAgICAgIHRoaXMubWVudSA9IHRoaXNbJ29wdGlvbnMnXVsnbWVudSddID8gXy51bmlvbih0aGlzLm1lbnUsIHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKSA6IHRoaXMubWVudTtcclxuICAgICAgICB0aGlzLm1lbnUucHVzaCh7XHJcbiAgICAgICAgICB0aXRsZTogJ0NvbmZpZ3VyYXRlJyxcclxuICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25Db25maWdDbGljaygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5kYXRlID0gdGhpc1snb3B0aW9ucyddLmRhdGUgfHwgbmV3IERhdGUoKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICAgIHRoaXMuX2NvbmZpZ0RpYWxvZy5zaG93KHtcclxuICAgICAgICBkaWFsb2dDbGFzczogJ3BpcC1jYWxlbmRhci1jb25maWcnLFxyXG4gICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICAgIHNpemU6IHRoaXNbJ29wdGlvbnMnXS5zaXplLFxyXG4gICAgICAgIGRhdGU6IHRoaXNbJ29wdGlvbnMnXS5kYXRlLFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvY2FsZW5kYXIvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpc1snb3B0aW9ucyddLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgICAgdGhpc1snb3B0aW9ucyddLmRhdGUgPSByZXN1bHQuZGF0ZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgY29uc3QgcGlwQ2FsZW5kYXJXaWRnZXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJyxcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBDYWxlbmRhcldpZGdldENvbnRyb2xsZXIsXHJcbiAgICBjb250cm9sbGVyQXM6ICd3aWRnZXRDdHJsJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnd2lkZ2V0cy9jYWxlbmRhci9XaWRnZXRDYWxlbmRhci5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5jb21wb25lbnQoJ3BpcENhbGVuZGFyV2lkZ2V0JywgcGlwQ2FsZW5kYXJXaWRnZXQpO1xyXG5cclxufSIsImltcG9ydCB7IE1lbnVXaWRnZXRTZXJ2aWNlfSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHsgSVdpZGdldENvbmZpZ1NlcnZpY2UgfSBmcm9tICcuLi8uLi9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcblxyXG5jbGFzcyBFdmVudFdpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF8kZWxlbWVudDogYW55O1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX29sZE9wYWNpdHk6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGNvbG9yOiBzdHJpbmcgPSAnZ3JheSc7XHJcbiAgcHVibGljIG9wYWNpdHk6IG51bWJlciA9IDAuNTc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICRlbGVtZW50OiBhbnksXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG4gICkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuXyRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuXHJcbiAgICBpZiAodGhpc1snb3B0aW9ucyddKSB7XHJcbiAgICAgIGlmICh0aGlzWydvcHRpb25zJ11bJ21lbnUnXSkgdGhpcy5tZW51ID0gXy51bmlvbih0aGlzLm1lbnUsIHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1lbnUucHVzaCh7IHRpdGxlOiAnQ29uZmlndXJhdGUnLCBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICB9fSk7XHJcbiAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgICB0aGlzLm9wYWNpdHkgPSB0aGlzWydvcHRpb25zJ10ub3BhY2l0eSB8fCB0aGlzLm9wYWNpdHk7XHJcblxyXG4gICAgdGhpcy5kcmF3SW1hZ2UoKTtcclxuXHJcbiAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB7IHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTsgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYXdJbWFnZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdJbWFnZSgpIHtcclxuICAgIGlmICh0aGlzWydvcHRpb25zJ10uaW1hZ2UpIHtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMub25JbWFnZUxvYWQodGhpcy5fJGVsZW1lbnQuZmluZCgnaW1nJykpO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgdGhpcy5fb2xkT3BhY2l0eSA9IF8uY2xvbmUodGhpcy5vcGFjaXR5KTtcclxuICAgIHRoaXMuX2NvbmZpZ0RpYWxvZy5zaG93KHtcclxuICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgIHNpemU6IHRoaXNbJ29wdGlvbnMnXS5zaXplIHx8IHtjb2xTcGFuOiAxLCByb3dTcGFuOiAxfSxcclxuICAgICAgZGF0ZTogdGhpc1snb3B0aW9ucyddLmRhdGUsXHJcbiAgICAgIHRpdGxlOiB0aGlzWydvcHRpb25zJ10udGl0bGUsXHJcbiAgICAgIHRleHQ6IHRoaXNbJ29wdGlvbnMnXS50ZXh0LFxyXG4gICAgICBvcGFjaXR5OiB0aGlzLm9wYWNpdHksXHJcbiAgICAgIG9uT3BhY2l0eXRlc3Q6IChvcGFjaXR5KSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgfSxcclxuICAgICAgZXh0ZW5zaW9uVXJsOiAnd2lkZ2V0cy9ldmVudC9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10uY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS50aXRsZSA9IHJlc3VsdC50aXRsZTtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLnRleHQgPSByZXN1bHQudGV4dDtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLm9wYWNpdHkgPSByZXN1bHQub3BhY2l0eTtcclxuICAgIH0sICgpID0+IHtcclxuICAgICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5fb2xkT3BhY2l0eTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkltYWdlTG9hZChpbWFnZSkge1xyXG4gICAgdGhpcy5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLl8kZWxlbWVudC5wYXJlbnQoKSwgaW1hZ2UpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICBpZiAodGhpc1snb3B0aW9ucyddLmltYWdlKSB7XHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuXyRlbGVtZW50LnBhcmVudCgpLCB0aGlzLl8kZWxlbWVudC5maW5kKCdpbWcnKSk7XHJcbiAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBMYXRlciByZXBsYWNlIGJ5IHBpcEltYWdlVXRpbHMgc2V2aWNlJ3MgZnVuY3Rpb25cclxuICBwcml2YXRlIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSkge1xyXG4gICAgbGV0XHJcbiAgICAgIGNvbnRhaW5lcldpZHRoID0gJGVsZW1lbnQud2lkdGggPyAkZWxlbWVudC53aWR0aCgpIDogJGVsZW1lbnQuY2xpZW50V2lkdGgsIC8vIHx8IDgwLFxyXG4gICAgICBjb250YWluZXJIZWlnaHQgPSAkZWxlbWVudC5oZWlnaHQgPyAkZWxlbWVudC5oZWlnaHQoKSA6ICRlbGVtZW50LmNsaWVudEhlaWdodCwgLy8gfHwgODAsXHJcbiAgICAgIGltYWdlV2lkdGggPSBpbWFnZVswXS5uYXR1cmFsV2lkdGggfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgIGltYWdlSGVpZ2h0ID0gaW1hZ2VbMF0ubmF0dXJhbEhlaWdodCB8fCBpbWFnZS5oZWlnaHQsXHJcbiAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgIGNzc1BhcmFtcyA9IHt9O1xyXG5cclxuICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgbWFyZ2luID0gLSgoaW1hZ2VXaWR0aCAvIGltYWdlSGVpZ2h0ICogY29udGFpbmVySGVpZ2h0IC0gY29udGFpbmVyV2lkdGgpIC8gMik7XHJcbiAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgaW1hZ2VXaWR0aCAqIGNvbnRhaW5lckhlaWdodCAvIGltYWdlSGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJyc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtYXJnaW4gPSAtKChpbWFnZUhlaWdodCAvIGltYWdlV2lkdGggKiBjb250YWluZXJXaWR0aCAtIGNvbnRhaW5lckhlaWdodCkgLyAyKTtcclxuICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgIGNzc1BhcmFtc1snaGVpZ2h0J10gPSAnJyArIGltYWdlSGVpZ2h0ICogY29udGFpbmVyV2lkdGggLyBpbWFnZVdpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgY29udGFpbmVyV2lkdGggKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgaW1hZ2UuY3NzKGNzc1BhcmFtcyk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuKCgpID0+IHtcclxuICBsZXQgcGlwRXZlbnRXaWRnZXQgPSAge1xyXG4gICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgICAgfSxcclxuICAgICAgY29udHJvbGxlcjogRXZlbnRXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgICBjb250cm9sbGVyQXM6ICd3aWRnZXRDdHJsJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL2V2ZW50L1dpZGdldEV2ZW50Lmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRXZlbnRXaWRnZXQnLCBwaXBFdmVudFdpZGdldCk7XHJcbn0pKCk7IiwiKCgpID0+IHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBNZW51V2lkZ2V0JywgcGlwTWVudVdpZGdldCk7XHJcblxyXG4gIGZ1bmN0aW9uIHBpcE1lbnVXaWRnZXQoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdCAgICAgICAgOiAnRUEnLFxyXG4gICAgICB0ZW1wbGF0ZVVybCAgICAgOiAnd2lkZ2V0cy9tZW51L1dpZGdldE1lbnUuaHRtbCdcclxuICAgIH07XHJcbiAgfVxyXG59KSgpO1xyXG4iLCJcclxuZXhwb3J0IGNsYXNzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwdWJsaWMgbWVudTogYW55ID0gW1xyXG4gICAge1xyXG4gICAgICB0aXRsZTogJ0NoYW5nZSBTaXplJyxcclxuICAgICAgYWN0aW9uOiBhbmd1bGFyLm5vb3AsXHJcbiAgICAgIHN1Ym1lbnU6IFt7XHJcbiAgICAgICAgICB0aXRsZTogJzEgeCAxJyxcclxuICAgICAgICAgIGFjdGlvbjogJ2NoYW5nZVNpemUnLFxyXG4gICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgIHNpemVYOiAxLFxyXG4gICAgICAgICAgICBzaXplWTogMVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGl0bGU6ICcyIHggMScsXHJcbiAgICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICBzaXplWDogMixcclxuICAgICAgICAgICAgc2l6ZVk6IDFcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnMiB4IDInLFxyXG4gICAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgc2l6ZVg6IDIsXHJcbiAgICAgICAgICAgIHNpemVZOiAyXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcIm5nSW5qZWN0XCI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FsbEFjdGlvbihhY3Rpb25OYW1lLCBwYXJhbXMsIGl0ZW0pIHtcclxuICAgIGlmICh0aGlzW2FjdGlvbk5hbWVdKSB7XHJcbiAgICAgIHRoaXNbYWN0aW9uTmFtZV0uY2FsbCh0aGlzLCBwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpdGVtWydjbGljayddKSB7XHJcbiAgICAgIGl0ZW1bJ2NsaWNrJ10uY2FsbChpdGVtLCBwYXJhbXMsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcbiAgfTtcclxufVxyXG5cclxuY2xhc3MgTWVudVdpZGdldFByb3ZpZGVyIHtcclxuICAgIHByaXZhdGUgX3NlcnZpY2U6IE1lbnVXaWRnZXRTZXJ2aWNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgfVxyXG5cclxuICAgcHVibGljICRnZXQoKSB7XHJcbiAgICAgICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fc2VydmljZSA9PSBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE1lbnVXaWRnZXRTZXJ2aWNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlcnZpY2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLnByb3ZpZGVyKCdwaXBXaWRnZXRNZW51JywgTWVudVdpZGdldFByb3ZpZGVyKTtcclxufSkoKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBNZW51V2lkZ2V0U2VydmljZSB9IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnU2VydmljZSB9IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbmNsYXNzIE5vdGVzV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgX2NvbmZpZ0RpYWxvZzogSVdpZGdldENvbmZpZ1NlcnZpY2U7XHJcblxyXG4gIHB1YmxpYyBjb2xvcjogc3RyaW5nID0gJ29yYW5nZSc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMuXyRzY29wZSA9ICRzY29wZTtcclxuICAgICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuXHJcbiAgICAgIGlmICh0aGlzWydvcHRpb25zJ10pIHtcclxuICAgICAgICB0aGlzLm1lbnUgPSB0aGlzWydvcHRpb25zJ11bJ21lbnUnXSA/IF8udW5pb24odGhpcy5tZW51LCB0aGlzWydvcHRpb25zJ11bJ21lbnUnXSkgOiB0aGlzLm1lbnU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHsgdGl0bGU6ICdDb25maWd1cmF0ZScsIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgfX0pO1xyXG4gICAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICB0aGlzLl9jb25maWdEaWFsb2cuc2hvdyh7XHJcbiAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLWNhbGVuZGFyLWNvbmZpZycsXHJcbiAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICBzaXplOiB0aGlzWydvcHRpb25zJ10uc2l6ZSxcclxuICAgICAgdGl0bGU6IHRoaXNbJ29wdGlvbnMnXS50aXRsZSxcclxuICAgICAgdGV4dDogdGhpc1snb3B0aW9ucyddLnRleHQsXHJcbiAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvbm90ZXMvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgdGhpcy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10udGV4dCA9IHJlc3VsdC50ZXh0O1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10udGl0bGUgPSByZXN1bHQudGl0bGU7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbiAgbGV0IHBpcE5vdGVzV2lkZ2V0ID0ge1xyXG4gICAgICBiaW5kaW5ncyAgICAgICAgICAgOiB7XHJcbiAgICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgICB9LFxyXG4gICAgICBjb250cm9sbGVyICAgICAgOiBOb3Rlc1dpZGdldENvbnRyb2xsZXIsXHJcbiAgICAgIGNvbnRyb2xsZXJBcyAgICA6ICd3aWRnZXRDdHJsJyxcclxuICAgICAgdGVtcGxhdGVVcmwgICAgIDogJ3dpZGdldHMvbm90ZXMvV2lkZ2V0Tm90ZXMuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBOb3Rlc1dpZGdldCcsIHBpcE5vdGVzV2lkZ2V0KTtcclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5cclxuY2xhc3MgUGljdHVyZVNsaWRlckNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX3dpZGdldFV0aWxpdHk6IElXaWRnZXRUZW1wbGF0ZVNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBfJGVsZW1lbnQ6IGFueTtcclxuICBwcml2YXRlIF8kdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2U7XHJcblxyXG4gIHB1YmxpYyBhbmltYXRpb25UeXBlOiBzdHJpbmcgPSAnZmFkaW5nJztcclxuICBwdWJsaWMgYW5pbWF0aW9uSW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICRlbGVtZW50OiBhbnksXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZSxcclxuICAgIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuICAgIHRoaXMuX3dpZGdldFV0aWxpdHkgPSBwaXBXaWRnZXRUZW1wbGF0ZTtcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgaWYgKHRoaXNbJ29wdGlvbnMnXSkge1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblR5cGUgPSB0aGlzWydvcHRpb25zJ10uYW5pbWF0aW9uVHlwZSB8fCB0aGlzLmFuaW1hdGlvblR5cGU7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uSW50ZXJ2YWwgPSB0aGlzWydvcHRpb25zJ10uYW5pbWF0aW9uSW50ZXJ2YWwgfHwgdGhpcy5hbmltYXRpb25JbnRlcnZhbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkltYWdlTG9hZCgkZXZlbnQpIHtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5fd2lkZ2V0VXRpbGl0eS5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLl8kZWxlbWVudC5wYXJlbnQoKSwgJGV2ZW50LnRhcmdldCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcblxyXG4gICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBfLmVhY2godGhpcy5fJGVsZW1lbnQuZmluZCgnaW1nJyksIChpbWFnZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuX3dpZGdldFV0aWxpdHkuc2V0SW1hZ2VNYXJnaW5DU1ModGhpcy5fJGVsZW1lbnQucGFyZW50KCksIGltYWdlKTtcclxuICAgICAgfSk7XHJcbiAgICB9LCA1MDApO1xyXG4gIH1cclxufVxyXG5cclxubGV0IHBpcFBpY3R1cmVTbGlkZXJXaWRnZXQgPSB7XHJcbiAgYmluZGluZ3M6IHtcclxuICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucycsXHJcbiAgICBpbmRleDogJz0nLFxyXG4gICAgZ3JvdXA6ICc9J1xyXG4gIH0sXHJcbiAgY29udHJvbGxlcjogUGljdHVyZVNsaWRlckNvbnRyb2xsZXIsXHJcbiAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIuaHRtbCcsXHJcbiAgY29udHJvbGxlckFzOiAnd2lkZ2V0Q3RybCdcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgLmNvbXBvbmVudCgncGlwUGljdHVyZVNsaWRlcldpZGdldCcsIHBpcFBpY3R1cmVTbGlkZXJXaWRnZXQpOyIsImltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbmNsYXNzIFBvc2l0aW9uV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX2xvY2F0aW9uRGlhbG9nOiBhbnk7XHJcblxyXG4gIHB1YmxpYyBzaG93UG9zaXRpb246IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHBpcFdpZGdldE1lbnU6IGFueSxcclxuICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAkZWxlbWVudDogYW55LFxyXG4gICAgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2UsXHJcbiAgICBwaXBMb2NhdGlvbkVkaXREaWFsb2c6IGFueSxcclxuICApIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuICAgIHRoaXMuX2xvY2F0aW9uRGlhbG9nID0gcGlwTG9jYXRpb25FZGl0RGlhbG9nO1xyXG5cclxuICAgIGlmICh0aGlzWydvcHRpb25zJ10pIHtcclxuICAgICAgaWYgKHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKSB0aGlzLm1lbnUgPSBfLnVuaW9uKHRoaXMubWVudSwgdGhpc1snb3B0aW9ucyddWydtZW51J10pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICB0aXRsZTogJ0NoYW5nZSBsb2NhdGlvbicsXHJcbiAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGVuTG9jYXRpb25FZGl0RGlhbG9nKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiA9IHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiB8fCB0aGlzWydvcHRpb25zJ10ucG9zaXRpb247XHJcblxyXG4gICAgJHNjb3BlLiR3YXRjaCgnd2lkZ2V0Q3RybC5vcHRpb25zLmxvY2F0aW9uJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlRHJhd1Bvc2l0aW9uKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB7IHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTsgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICBpZiAobmV3VmFsID09IHRydWUpIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nLnNob3coe1xyXG4gICAgICBkaWFsb2dDbGFzczogJ3BpcC1wb3NpdGlvbi1jb25maWcnLFxyXG4gICAgICBzaXplOiB0aGlzWydvcHRpb25zJ10uc2l6ZSxcclxuICAgICAgbG9jYXRpb25OYW1lOiB0aGlzWydvcHRpb25zJ10ubG9jYXRpb25OYW1lLFxyXG4gICAgICBoaWRlQ29sb3JzOiB0cnVlLFxyXG4gICAgICBleHRlbnNpb25Vcmw6ICd3aWRnZXRzL3Bvc2l0aW9uL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbk5hbWUgPSByZXN1bHQubG9jYXRpb25OYW1lO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvcGVuTG9jYXRpb25FZGl0RGlhbG9nKCkge1xyXG4gICAgdGhpcy5fbG9jYXRpb25EaWFsb2cuc2hvdyh7XHJcbiAgICAgIGxvY2F0aW9uTmFtZTogdGhpc1snb3B0aW9ucyddLmxvY2F0aW9uTmFtZSxcclxuICAgICAgbG9jYXRpb25Qb3M6IHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvblxyXG4gICAgfSwgKG5ld1Bvc2l0aW9uKSA9PiB7XHJcbiAgICAgIGlmIChuZXdQb3NpdGlvbikge1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9uO1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbk5hbWUgPSBuZXdQb3NpdGlvbi5sb2NhdGlvTmFtZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlRHJhd1Bvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5zaG93UG9zaXRpb24gPSBmYWxzZTtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSB0cnVlO1xyXG4gICAgfSwgNTApO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmxldCBwaXBQb3NpdGlvbldpZGdldCA9IHtcclxuICBiaW5kaW5nczoge1xyXG4gICAgb3B0aW9uczogJz1waXBPcHRpb25zJyxcclxuICAgIGluZGV4OiAnPScsXHJcbiAgICBncm91cDogJz0nXHJcbiAgfSxcclxuICBjb250cm9sbGVyOiBQb3NpdGlvbldpZGdldENvbnRyb2xsZXIsXHJcbiAgY29udHJvbGxlckFzOiAnd2lkZ2V0Q3RybCcsXHJcbiAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uLmh0bWwnXHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gIC5jb21wb25lbnQoJ3BpcFBvc2l0aW9uV2lkZ2V0JywgcGlwUG9zaXRpb25XaWRnZXQpOyIsImltcG9ydCB7IE1lbnVXaWRnZXRTZXJ2aWNlIH0gZnJvbSAnLi4vbWVudS9XaWRnZXRNZW51U2VydmljZSc7XHJcblxyXG5sZXQgU01BTExfQ0hBUlQ6IG51bWJlciA9IDcwO1xyXG5sZXQgQklHX0NIQVJUOiBudW1iZXIgPSAyNTA7XHJcblxyXG5jbGFzcyBTdGF0aXN0aWNzV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuXHJcbiAgcHVibGljIHJlc2V0OiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGNoYXJ0U2l6ZTogbnVtYmVyID0gU01BTExfQ0hBUlQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZVxyXG4gICkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0ID0gJHRpbWVvdXQ7XHJcblxyXG4gICAgICBpZiAodGhpc1snb3B0aW9ucyddKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpc1snb3B0aW9ucyddWydtZW51J10gPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpc1snb3B0aW9ucyddWydtZW51J10pIDogdGhpcy5tZW51O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldENoYXJ0U2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICB0aGlzLnJlc2V0ID0gdHJ1ZTtcclxuICAgIHRoaXMuc2V0Q2hhcnRTaXplKCk7XHJcbiAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzZXQgPSBmYWxzZTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldENoYXJ0U2l6ZSgpIHtcclxuICAgIHRoaXMuY2hhcnRTaXplID0gdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9PSAyICYmIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPT0gMiA/IEJJR19DSEFSVCA6IFNNQUxMX0NIQVJUO1xyXG4gIH1cclxufVxyXG5cclxuKCgpID0+IHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBwaXBTdGF0aXN0aWNzV2lkZ2V0ID0ge1xyXG4gICAgICBiaW5kaW5ncyAgICAgICAgICAgOiB7XHJcbiAgICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgICB9LFxyXG4gICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICBjb250cm9sbGVyICAgICAgOiBTdGF0aXN0aWNzV2lkZ2V0Q29udHJvbGxlcixcclxuICAgICAgY29udHJvbGxlckFzICAgIDogJ3dpZGdldEN0cmwnLFxyXG4gICAgICB0ZW1wbGF0ZVVybCAgICAgOiAnd2lkZ2V0cy9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBTdGF0aXN0aWNzV2lkZ2V0JywgcGlwU3RhdGlzdGljc1dpZGdldCk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdEYXNoYm9hcmQuaHRtbCcsXG4gICAgJzxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnQgbWQtcmFpc2VkIG1kLWZhYiBsYXlvdXQtY29sdW1uIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgYXJpYS1sYWJlbD1cIkFkZCBjb21wb25lbnRcIiBuZy1jbGljaz1cImRhc2hib2FyZEN0cmwuYWRkQ29tcG9uZW50KClcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXNcIiBjbGFzcz1cIm1kLWhlYWRsaW5lIGNlbnRlcmVkLWFkZC1pY29uXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWdyaWQtaG9sZGVyXCI+PHBpcC1kcmFnZ2FibGUtZ3JpZCBwaXAtdGlsZXMtdGVtcGxhdGVzPVwiZGFzaGJvYXJkQ3RybC5ncm91cGVkV2lkZ2V0c1wiIHBpcC10aWxlcy1jb250ZXh0PVwiZGFzaGJvYXJkQ3RybC53aWRnZXRzQ29udGV4dFwiIHBpcC1kcmFnZ2FibGUtZ3JpZD1cImRhc2hib2FyZEN0cmwuZHJhZ2dhYmxlR3JpZE9wdGlvbnNcIiBwaXAtZ3JvdXAtbWVudS1hY3Rpb25zPVwiZGFzaGJvYXJkQ3RybC5ncm91cE1lbnVBY3Rpb25zXCI+PC9waXAtZHJhZ2dhYmxlLWdyaWQ+PG1kLXByb2dyZXNzLWNpcmN1bGFyIG1kLW1vZGU9XCJpbmRldGVybWluYXRlXCIgY2xhc3M9XCJwcm9ncmVzcy1yaW5nXCI+PC9tZC1wcm9ncmVzcy1jaXJjdWxhcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkcmFnZ2FibGUvRHJhZ2dhYmxlLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ob2xkZXJcIj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cFwiIG5nLXJlcGVhdD1cImdyb3VwIGluIGRyYWdnYWJsZUN0cmwuZ3JvdXBzXCIgZGF0YS1ncm91cC1pZD1cInt7ICRpbmRleCB9fVwiIHBpcC1kcmFnZ2FibGUtdGlsZXM9XCJncm91cC5zb3VyY2VcIj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cC10aXRsZSBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXJcIj48ZGl2IGNsYXNzPVwidGl0bGUtaW5wdXQtY29udGFpbmVyXCIgbmctY2xpY2s9XCJkcmFnZ2FibGVDdHJsLm9uVGl0bGVDbGljayhncm91cCwgJGV2ZW50KVwiPjxpbnB1dCBuZy1pZj1cImdyb3VwLmVkaXRpbmdOYW1lXCIgbmctYmx1cj1cImRyYWdnYWJsZUN0cmwub25CbHVyVGl0bGVJbnB1dChncm91cClcIiBuZy1rZXlwcmVzcz1cImRyYWdnYWJsZUN0cmwub25LeWVwcmVzc1RpdGxlSW5wdXQoZ3JvdXAsICRldmVudClcIiBuZy1tb2RlbD1cImdyb3VwLnRpdGxlXCI+PGRpdiBjbGFzcz1cInRleHQtb3ZlcmZsb3cgZmxleC1ub25lXCIgbmctaWY9XCIhZ3JvdXAuZWRpdGluZ05hbWVcIj57eyBncm91cC50aXRsZSB9fTwvZGl2PjwvZGl2PjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmUgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1zaG93PVwiZ3JvdXAuZWRpdGluZ05hbWVcIiBuZy1jbGljaz1cImRyYWdnYWJsZUN0cmwuY2FuY2VsRWRpdGluZyhncm91cClcIiBhcmlhLWxhYmVsPVwiQ2FuY2VsXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpjcm9zc1wiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtbWVudSBjbGFzcz1cImZsZXgtbm9uZSBsYXlvdXQtY29sdW1uXCIgbWQtcG9zaXRpb24tbW9kZT1cInRhcmdldC1yaWdodCB0YXJnZXRcIiBuZy1zaG93PVwiIWdyb3VwLmVkaXRpbmdOYW1lXCI+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLWNsaWNrPVwiJG1kT3Blbk1lbnUoKTsgZ3JvdXBJZCA9ICRpbmRleFwiIGFyaWEtbGFiZWw9XCJNZW51XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpkb3RzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1tZW51LWNvbnRlbnQgd2lkdGg9XCI0XCI+PG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJhY3Rpb24gaW4gZHJhZ2dhYmxlQ3RybC5ncm91cE1lbnVBY3Rpb25zXCI+PG1kLWJ1dHRvbiBuZy1jbGljaz1cImFjdGlvbi5jYWxsYmFjayhncm91cElkKVwiPnt7IGFjdGlvbi50aXRsZSB9fTwvbWQtYnV0dG9uPjwvbWQtbWVudS1pdGVtPjwvbWQtbWVudS1jb250ZW50PjwvbWQtbWVudT48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cCBmaWN0LWdyb3VwIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyIGxheW91dC1jb2x1bW4gdG0xNlwiPjxkaXYgY2xhc3M9XCJmaWN0LWdyb3VwLXRleHQtY29udGFpbmVyXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPnt7IFxcJ0RST1BfVE9fQ1JFQVRFX05FV19HUk9VUFxcJyB8IHRyYW5zbGF0ZSB9fTwvZGl2PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC1hZGQtY29tcG9uZW50LWRpYWxvZ1wiPjxtZC1kaWFsb2ctY29udGVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIj48ZGl2IGNsYXNzPVwidGhlbWUtZGl2aWRlciBwMTYgZmxleC1hdXRvXCI+PGgzIGNsYXNzPVwiaGlkZS14cyBtMCBibTE2IHRoZW1lLXRleHQtcHJpbWFyeVwiIGhpZGUteHM9XCJcIj57eyBcXCdEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfVElUTEVcXCcgfCB0cmFuc2xhdGUgfX08bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwibGF5b3V0LXJvdyBmbGV4LWF1dG8gbTAgdG0xNlwiPjxtZC1zZWxlY3QgY2xhc3M9XCJmbGV4LWF1dG8gbTAgdGhlbWUtdGV4dC1wcmltYXJ5XCIgbmctbW9kZWw9XCJkaWFsb2dDdHJsLmFjdGl2ZUdyb3VwSW5kZXhcIiBwbGFjZWhvbGRlcj1cInt7IFxcJ0RBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19DUkVBVEVfTkVXX0dST1VQXFwnIHwgdHJhbnNsYXRlIH19XCIgYXJpYS1sYWJlbD1cIkdyb3VwXCI+PG1kLW9wdGlvbiBuZy12YWx1ZT1cIiRpbmRleFwiIG5nLXJlcGVhdD1cImdyb3VwIGluIGRpYWxvZ0N0cmwuZ3JvdXBzXCI+e3sgZ3JvdXAgfX08L21kLW9wdGlvbj48L21kLXNlbGVjdD48L21kLWlucHV0LWNvbnRhaW5lcj48L2gzPjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtYm9keSBwaXAtc2Nyb2xsIHAwIGZsZXgtYXV0b1wiPjxwIGNsYXNzPVwibWQtYm9keS0xIHRoZW1lLXRleHQtc2Vjb25kYXJ5IG0wIGxwMTYgcnAxNlwiPnt7IFxcJ0RBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19VU0VfSE9UX0tFWVNcXCcgfCB0cmFuc2xhdGUgfX08L3A+PG1kLWxpc3QgbmctaW5pdD1cImdyb3VwSW5kZXggPSAkaW5kZXhcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiBkaWFsb2dDdHJsLmRlZmF1bHRXaWRnZXRzXCI+PG1kLWxpc3QtaXRlbSBjbGFzcz1cImxheW91dC1yb3cgcGlwLWxpc3QtaXRlbSBscDE2IHJwMTZcIiBuZy1yZXBlYXQ9XCJpdGVtIGluIGdyb3VwXCI+PGRpdiBjbGFzcz1cImljb24taG9sZGVyIGZsZXgtbm9uZVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6e3s6OiBpdGVtLmljb24gfX1cIj48L21kLWljb24+PGRpdiBjbGFzcz1cInBpcC1iYWRnZSB0aGVtZS1iYWRnZSBtZC13YXJuXCIgbmctaWY9XCJpdGVtLmFtb3VudFwiPjxzcGFuPnt7IGl0ZW0uYW1vdW50IH19PC9zcGFuPjwvZGl2PjwvZGl2PjxzcGFuIGNsYXNzPVwiZmxleC1hdXRvIGxtMjQgdGhlbWUtdGV4dC1wcmltYXJ5XCI+e3s6OiBpdGVtLnRpdGxlIH19PC9zcGFuPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmVcIiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuZW5jcmVhc2UoZ3JvdXBJbmRleCwgJGluZGV4KVwiIGFyaWEtbGFiZWw9XCJFbmNyZWFzZVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1cy1jaXJjbGVcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5kZWNyZWFzZShncm91cEluZGV4LCAkaW5kZXgpXCIgYXJpYS1sYWJlbD1cIkRlY3JlYXNlXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51cy1jaXJjbGVcIj48L21kLWljb24+PC9tZC1idXR0b24+PC9tZC1saXN0LWl0ZW0+PG1kLWRpdmlkZXIgY2xhc3M9XCJsbTcyIHRtOCBibThcIiBuZy1pZj1cImdyb3VwSW5kZXggIT09IChkaWFsb2dDdHJsLmRlZmF1bHRXaWRnZXRzLmxlbmd0aCAtIDEpXCI+PC9tZC1kaXZpZGVyPjwvbWQtbGlzdD48L2Rpdj48L21kLWRpYWxvZy1jb250ZW50PjxtZC1kaWFsb2ctYWN0aW9ucyBjbGFzcz1cImZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciB0aGVtZS1kaXZpZGVyIGRpdmlkZXItdG9wIHRoZW1lLXRleHQtcHJpbWFyeVwiPjxtZC1idXR0b24gbmctY2xpY2s9XCJkaWFsb2dDdHJsLmNhbmNlbCgpXCIgYXJpYS1sYWJlbD1cIkNhbmNlbFwiPnt7IFxcJ0NBTkNFTFxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjxtZC1idXR0b24gbmctY2xpY2s9XCJkaWFsb2dDdHJsLmFkZCgpXCIgbmctZGlzYWJsZWQ9XCJkaWFsb2dDdHJsLnRvdGFsV2lkZ2V0cyA9PT0gMFwiIGFyaWFsLWxhYmVsPVwiQWRkXCI+e3sgXFwnQUREXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PC9tZC1kaWFsb2ctYWN0aW9ucz48L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nLmh0bWwnLFxuICAgICc8bWQtZGlhbG9nIGNsYXNzPVwicGlwLWRpYWxvZyBwaXAtd2lkZ2V0LWNvbmZpZy1kaWFsb2cge3sgdm0ucGFyYW1zLmRpYWxvZ0NsYXNzIH19XCIgd2lkdGg9XCI0MDBcIiBtZC10aGVtZT1cInt7dm0udGhlbWV9fVwiPjxwaXAtd2lkZ2V0LWNvbmZpZy1leHRlbmQtY29tcG9uZW50IGNsYXNzPVwibGF5b3V0LWNvbHVtblwiIHBpcC1kaWFsb2ctc2NvcGU9XCJ2bVwiIHBpcC1leHRlbnNpb24tdXJsPVwidm0ucGFyYW1zLmV4dGVuc2lvblVybFwiIHBpcC1hcHBseT1cInZtLm9uQXBwbHkodXBkYXRlZERhdGEpXCI+PC9waXAtd2lkZ2V0LWNvbmZpZy1leHRlbmQtY29tcG9uZW50PjwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQuaHRtbCcsXG4gICAgJzxoMyBjbGFzcz1cInRtMCBmbGV4LW5vbmVcIj57eyBcXCdEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfVElUTEVcXCcgfCB0cmFuc2xhdGUgfX08L2gzPjxkaXYgY2xhc3M9XCJwaXAtYm9keSBwaXAtc2Nyb2xsIHAxNiBicDAgZmxleC1hdXRvXCI+PHBpcC1leHRlbnNpb24tcG9pbnQ+PC9waXAtZXh0ZW5zaW9uLXBvaW50PjxwaXAtdG9nZ2xlLWJ1dHRvbnMgY2xhc3M9XCJibTE2XCIgbmctaWY9XCIhJGN0cmwuaGlkZVNpemVzXCIgcGlwLWJ1dHRvbnM9XCIkY3RybC5zaXplc1wiIG5nLW1vZGVsPVwiJGN0cmwuc2l6ZUlkXCI+PC9waXAtdG9nZ2xlLWJ1dHRvbnM+PHBpcC1jb2xvci1waWNrZXIgbmctaWY9XCIhJGN0cmwuaGlkZUNvbG9yc1wiIHBpcC1jb2xvcnM9XCIkY3RybC5jb2xvcnNcIiBuZy1tb2RlbD1cIiRjdHJsLmNvbG9yXCI+PC9waXAtY29sb3ItcGlja2VyPjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtZm9vdGVyIGZsZXgtbm9uZVwiPjxkaXY+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25DYW5jZWwoKVwiPnt7IFxcJ0NBTkNFTFxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uQXBwbHkoKVwiPnt7IFxcJ0FQUExZXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9jYWxlbmRhci9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0xNlwiPkRhdGU6PG1kLWRhdGVwaWNrZXIgbmctbW9kZWw9XCIkY3RybC5kYXRlXCIgY2xhc3M9XCJ3LXN0cmV0Y2hcIj48L21kLWRhdGVwaWNrZXI+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9jYWxlbmRhci9XaWRnZXRDYWxlbmRhci5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLWNhbGVuZGFyLXdpZGdldCB7eyB3aWRnZXRDdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGwgdHAwXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBtZWRpdW06IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIGJpZzogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCI+PGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXIgZmxleC1ub25lXCI+PHBpcC1tZW51LXdpZGdldD48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1pZj1cIndpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDFcIj48c3BhbiBjbGFzcz1cImRhdGUgbG0yNCBybTEyXCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUuZ2V0RGF0ZSgpIH19PC9zcGFuPjxkaXYgY2xhc3M9XCJmbGV4LWF1dG8gbGF5b3V0LWNvbHVtblwiPjxzcGFuIGNsYXNzPVwid2Vla2RheSBtZC1oZWFkbGluZVwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJtb250aC15ZWFyIG1kLWhlYWRsaW5lXCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRMb25nTW9udGggfX0ge3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRZZWFyIH19PC9zcGFuPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3BhY2UtYXJvdW5kLWNlbnRlclwiIG5nLWhpZGU9XCJ3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+PHNwYW4gY2xhc3M9XCJ3ZWVrZGF5IG1kLWhlYWRsaW5lXCIgbmctaGlkZT1cIndpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDFcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwid2Vla2RheVwiIG5nLXNob3c9XCJ3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRMb25nRGF5T2ZXZWVrIH19PC9zcGFuPiA8c3BhbiBjbGFzcz1cImRhdGUgbG0xMiBybTEyXCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUuZ2V0RGF0ZSgpIH19PC9zcGFuPiA8c3BhbiBjbGFzcz1cIm1vbnRoLXllYXIgbWQtaGVhZGxpbmVcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdNb250aCB9fSB7eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdFllYXIgfX08L3NwYW4+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9ldmVudC9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2hcIj48bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIGJtMFwiPjxsYWJlbD5UaXRsZTo8L2xhYmVsPiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLnRpdGxlXCI+PC9tZC1pbnB1dC1jb250YWluZXI+RGF0ZTo8bWQtZGF0ZXBpY2tlciBuZy1tb2RlbD1cIiRjdHJsLmRhdGVcIiBjbGFzcz1cInctc3RyZXRjaCBibThcIj48L21kLWRhdGVwaWNrZXI+PG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaFwiPjxsYWJlbD5EZXNjcmlwdGlvbjo8L2xhYmVsPiA8dGV4dGFyZWEgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLnRleHRcIj5cXG4nICtcbiAgICAnICAgIDwvdGV4dGFyZWE+PC9tZC1pbnB1dC1jb250YWluZXI+QmFja2Ryb3BcXCdzIG9wYWNpdHk6PG1kLXNsaWRlciBhcmlhLWxhYmVsPVwib3BhY2l0eVwiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIwLjFcIiBtYXg9XCIwLjlcIiBzdGVwPVwiMC4wMVwiIG5nLW1vZGVsPVwiJGN0cmwub3BhY2l0eVwiIG5nLWNoYW5nZT1cIiRjdHJsLm9uT3BhY2l0eXRlc3QoJGN0cmwub3BhY2l0eSlcIj48L21kLXNsaWRlcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL2V2ZW50L1dpZGdldEV2ZW50Lmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtZXZlbnQtd2lkZ2V0IHt7IHdpZGdldEN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwieyBzbWFsbDogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiPjxpbWcgbmctaWY9XCJ3aWRnZXRDdHJsLm9wdGlvbnMuaW1hZ2VcIiBuZy1zcmM9XCJ7e3dpZGdldEN0cmwub3B0aW9ucy5pbWFnZX19XCIgYWx0PVwie3t3aWRnZXRDdHJsLm9wdGlvbnMudGl0bGUgfHwgd2lkZ2V0Q3RybC5vcHRpb25zLm5hbWV9fVwiPjxkaXYgY2xhc3M9XCJ0ZXh0LWJhY2tkcm9wXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIHt7IHdpZGdldEN0cmwub3BhY2l0eSB9fSlcIj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiPjxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRpdGxlIHx8IHdpZGdldEN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPjxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhd2lkZ2V0Q3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+PC9kaXY+PGRpdiBjbGFzcz1cInRleHQtY29udGFpbmVyIGZsZXgtYXV0byBwaXAtc2Nyb2xsXCI+PHAgY2xhc3M9XCJkYXRlIGZsZXgtbm9uZVwiIG5nLWlmPVwid2lkZ2V0Q3RybC5vcHRpb25zLmRhdGVcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdFNob3J0RGF0ZSB9fTwvcD48cCBjbGFzcz1cInRleHQgZmxleC1hdXRvXCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRleHQgfHwgd2lkZ2V0Q3RybC5vcHRpb25zLmRlc2NyaXB0aW9uIH19PC9wPjwvZGl2PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvbm90ZXMvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoXCI+PG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCBibTBcIj48bGFiZWw+VGl0bGU6PC9sYWJlbD4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC50aXRsZVwiPjwvbWQtaW5wdXQtY29udGFpbmVyPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggdG0wXCI+PGxhYmVsPlRleHQ6PC9sYWJlbD4gPHRleHRhcmVhIHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC50ZXh0XCI+XFxuJyArXG4gICAgJyAgICA8L3RleHRhcmVhPjwvbWQtaW5wdXQtY29udGFpbmVyPjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvbm90ZXMvV2lkZ2V0Tm90ZXMuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1ub3Rlcy13aWRnZXQge3sgd2lkZ2V0Q3RybC5jb2xvciB9fSBsYXlvdXQtY29sdW1uXCI+PGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBmbGV4LW5vbmVcIiBuZy1pZj1cIndpZGdldEN0cmwub3B0aW9ucy50aXRsZSB8fCB3aWRnZXRDdHJsLm9wdGlvbnMubmFtZVwiPjxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRpdGxlIHx8IHdpZGdldEN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPjwvZGl2PjxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhd2lkZ2V0Q3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+PGRpdiBjbGFzcz1cInRleHQtY29udGFpbmVyIGZsZXgtYXV0byBwaXAtc2Nyb2xsXCI+PHA+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRleHQgfX08L3A+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9tZW51L1dpZGdldE1lbnUuaHRtbCcsXG4gICAgJzxtZC1tZW51IGNsYXNzPVwid2lkZ2V0LW1lbnVcIiBtZC1wb3NpdGlvbi1tb2RlPVwidGFyZ2V0LXJpZ2h0IHRhcmdldFwiPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmVcIiBuZy1jbGljaz1cIiRtZE9wZW5NZW51KClcIiBhcmlhLWxhYmVsPVwiTWVudVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dmRvdHNcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLW1lbnUtY29udGVudCB3aWR0aD1cIjRcIj48bWQtbWVudS1pdGVtIG5nLXJlcGVhdD1cIml0ZW0gaW4gd2lkZ2V0Q3RybC5tZW51XCI+PG1kLWJ1dHRvbiBuZy1pZj1cIiFpdGVtLnN1Ym1lbnVcIiBuZy1jbGljaz1cIndpZGdldEN0cmwuY2FsbEFjdGlvbihpdGVtLmFjdGlvbiwgaXRlbS5wYXJhbXMsIGl0ZW0pXCI+e3s6OiBpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+PG1kLW1lbnUgbmctaWY9XCJpdGVtLnN1Ym1lbnVcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwid2lkZ2V0Q3RybC5jYWxsQWN0aW9uKGl0ZW0uYWN0aW9uKVwiPnt7OjogaXRlbS50aXRsZSB9fTwvbWQtYnV0dG9uPjxtZC1tZW51LWNvbnRlbnQ+PG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJzdWJpdGVtIGluIGl0ZW0uc3VibWVudVwiPjxtZC1idXR0b24gbmctY2xpY2s9XCJ3aWRnZXRDdHJsLmNhbGxBY3Rpb24oc3ViaXRlbS5hY3Rpb24sIHN1Yml0ZW0ucGFyYW1zLCBzdWJpdGVtKVwiPnt7Ojogc3ViaXRlbS50aXRsZSB9fTwvbWQtYnV0dG9uPjwvbWQtbWVudS1pdGVtPjwvbWQtbWVudS1jb250ZW50PjwvbWQtbWVudT48L21kLW1lbnUtaXRlbT48L21kLW1lbnUtY29udGVudD48L21kLW1lbnU+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9waWN0dXJlX3NsaWRlci9XaWRnZXRQaWN0dXJlU2xpZGVyLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtcGljdHVyZS1zbGlkZXItd2lkZ2V0IHt7IHdpZGdldEN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwieyBzbWFsbDogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiIGluZGV4PVwie3sgd2lkZ2V0Q3RybC5pbmRleCB9fVwiIGdyb3VwPVwie3sgd2lkZ2V0Q3RybC5ncm91cCB9fVwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBscDE2IHJwOCBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiPjxzcGFuIGNsYXNzPVwiZmxleCB0ZXh0LW92ZXJmbG93XCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRpdGxlIH19PC9zcGFuPjxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhd2lkZ2V0Q3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+PC9kaXY+PGRpdiBjbGFzcz1cInNsaWRlci1jb250YWluZXJcIj48ZGl2IHBpcC1pbWFnZS1zbGlkZXI9XCJcIiBwaXAtYW5pbWF0aW9uLXR5cGU9XCJcXCdmYWRpbmdcXCdcIiBwaXAtYW5pbWF0aW9uLWludGVydmFsPVwid2lkZ2V0Q3RybC5hbmltYXRpb25JbnRlcnZhbFwiIG5nLWlmPVwid2lkZ2V0Q3RybC5hbmltYXRpb25UeXBlID09IFxcJ2ZhZGluZ1xcJ1wiPjxkaXYgY2xhc3M9XCJwaXAtYW5pbWF0aW9uLWJsb2NrXCIgbmctcmVwZWF0PVwic2xpZGUgaW4gd2lkZ2V0Q3RybC5vcHRpb25zLnNsaWRlc1wiPjxpbWcgbmctc3JjPVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBhbHQ9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIHBpcC1pbWFnZS1sb2FkPVwid2lkZ2V0Q3RybC5vbkltYWdlTG9hZCgkZXZlbnQpXCI+PHAgY2xhc3M9XCJzbGlkZS10ZXh0XCIgbmctaWY9XCJzbGlkZS50ZXh0XCI+e3sgc2xpZGUudGV4dCB9fTwvcD48L2Rpdj48L2Rpdj48ZGl2IHBpcC1pbWFnZS1zbGlkZXI9XCJcIiBwaXAtYW5pbWF0aW9uLXR5cGU9XCJcXCdjYXJvdXNlbFxcJ1wiIHBpcC1hbmltYXRpb24taW50ZXJ2YWw9XCJ3aWRnZXRDdHJsLmFuaW1hdGlvbkludGVydmFsXCIgbmctaWY9XCJ3aWRnZXRDdHJsLmFuaW1hdGlvblR5cGUgPT0gXFwnY2Fyb3VzZWxcXCdcIj48ZGl2IGNsYXNzPVwicGlwLWFuaW1hdGlvbi1ibG9ja1wiIG5nLXJlcGVhdD1cInNsaWRlIGluIHdpZGdldEN0cmwub3B0aW9ucy5zbGlkZXNcIj48aW1nIG5nLXNyYz1cInt7IHNsaWRlLmltYWdlIH19XCIgYWx0PVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBwaXAtaW1hZ2UtbG9hZD1cIndpZGdldEN0cmwub25JbWFnZUxvYWQoJGV2ZW50KVwiPjxwIGNsYXNzPVwic2xpZGUtdGV4dFwiIG5nLWlmPVwic2xpZGUudGV4dFwiPnt7IHNsaWRlLnRleHQgfX08L3A+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9wb3NpdGlvbi9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2hcIj48bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIGJtMFwiPjxsYWJlbD5Mb2NhdGlvbiBuYW1lOjwvbGFiZWw+IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwubG9jYXRpb25OYW1lXCI+PC9tZC1pbnB1dC1jb250YWluZXI+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1wb3NpdGlvbi13aWRnZXQgd2lkZ2V0LWJveCBwMCBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBtZWRpdW06IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIGJpZzogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCIgaW5kZXg9XCJ7eyB3aWRnZXRDdHJsLmluZGV4IH19XCIgZ3JvdXA9XCJ7eyB3aWRnZXRDdHJsLmdyb3VwIH19XCI+PGRpdiBjbGFzcz1cInBvc2l0aW9uLWFic29sdXRlLXJpZ2h0LXRvcFwiIG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5sb2NhdGlvbk5hbWVcIj48cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PjwvZGl2PjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBscDE2IHJwOCBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiIG5nLWlmPVwid2lkZ2V0Q3RybC5vcHRpb25zLmxvY2F0aW9uTmFtZVwiPjxzcGFuIGNsYXNzPVwiZmxleCB0ZXh0LW92ZXJmbG93XCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLmxvY2F0aW9uTmFtZSB9fTwvc3Bhbj48cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PjwvZGl2PjxwaXAtbG9jYXRpb24tbWFwIGNsYXNzPVwiZmxleFwiIG5nLWlmPVwid2lkZ2V0Q3RybC5zaG93UG9zaXRpb25cIiBwaXAtc3RyZXRjaD1cInRydWVcIiBwaXAtcmViaW5kPVwidHJ1ZVwiIHBpcC1sb2NhdGlvbi1wb3M9XCJ3aWRnZXRDdHJsLm9wdGlvbnMubG9jYXRpb25cIj48L3BpcC1sb2NhdGlvbi1tYXA+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1zdGF0aXN0aWNzLXdpZGdldCBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBtZWRpdW06IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIGJpZzogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCI+PGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBmbGV4LW5vbmVcIj48c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7IHdpZGdldEN0cmwub3B0aW9ucy50aXRsZSB8fCB3aWRnZXRDdHJsLm9wdGlvbnMubmFtZSB9fTwvc3Bhbj48cGlwLW1lbnUtd2lkZ2V0PjwvcGlwLW1lbnUtd2lkZ2V0PjwvZGl2PjxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLWlmPVwid2lkZ2V0Q3RybC5vcHRpb25zLnNlcmllcyAmJiAhd2lkZ2V0Q3RybC5yZXNldFwiPjxwaXAtcGllLWNoYXJ0IHBpcC1zZXJpZXM9XCJ3aWRnZXRDdHJsLm9wdGlvbnMuc2VyaWVzXCIgbmctaWY9XCIhd2lkZ2V0Q3RybC5vcHRpb25zLmNoYXJ0VHlwZSB8fCB3aWRnZXRDdHJsLm9wdGlvbnMuY2hhcnRUeXBlID09IFxcJ3BpZVxcJ1wiIHBpcC1kb251dD1cInRydWVcIiBwaXAtcGllLXNpemU9XCJ3aWRnZXRDdHJsLmNoYXJ0U2l6ZVwiIHBpcC1zaG93LXRvdGFsPVwidHJ1ZVwiIHBpcC1jZW50ZXJlZD1cInRydWVcIj48L3BpcC1waWUtY2hhcnQ+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1waXAtd2VidWktZGFzaGJvYXJkLWh0bWwubWluLmpzLm1hcFxuIl19