(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).dashboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./widgets/Widgets");
require("./draggable/Draggable");
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
require("./utility/WidgetTemplateUtility");
require("./dialogs/widget_config/ConfigDialogController");
require("./dialogs/add_component/AddComponentDialogController");
require("./DashboardComponent");
},{"./DashboardComponent":2,"./dialogs/add_component/AddComponentDialogController":3,"./dialogs/widget_config/ConfigDialogController":5,"./draggable/Draggable":8,"./utility/WidgetTemplateUtility":13,"./widgets/Widgets":15}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var setTranslations = function ($injector) {
        var pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
        if (pipTranslate) {
            pipTranslate.setTranslations('en', {
                DROP_TO_CREATE_NEW_GROUP: 'Drop here to create new group',
            });
            pipTranslate.setTranslations('ru', {
                DROP_TO_CREATE_NEW_GROUP: 'Перетащите сюда для создания новой группы'
            });
        }
    };
    setTranslations.$inject = ['$injector'];
    var configureAvailableWidgets = function (pipAddComponentDialogProvider) {
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
    };
    configureAvailableWidgets.$inject = ['pipAddComponentDialogProvider'];
    var draggableOptions = (function () {
        function draggableOptions() {
        }
        return draggableOptions;
    }());
    var DEFAULT_GRID_OPTIONS_1 = {
        tileWidth: 150,
        tileHeight: 150,
        gutter: 10,
        inline: false
    };
    var DashboardController = (function () {
        function DashboardController($scope, $rootScope, $attrs, $element, $timeout, $interpolate, pipAddComponentDialog, pipWidgetTemplate) {
            var _this = this;
            this.$rootScope = $rootScope;
            this.$attrs = $attrs;
            this.$element = $element;
            this.$timeout = $timeout;
            this.$interpolate = $interpolate;
            this.pipAddComponentDialog = pipAddComponentDialog;
            this.pipWidgetTemplate = pipWidgetTemplate;
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
                'pip-options="$parent.$ctrl.groupedWidgets[groupIndex][\'source\'][index].opts">' +
                '</pip-{{ type }}-widget>';
            this.groupMenuActions = this.defaultGroupMenuActions;
            this.removeGroup = function (groupIndex) {
                console.log('removeGroup', groupIndex);
                _this.groupedWidgets.splice(groupIndex, 1);
            };
            $element.addClass('pip-scroll');
            this.draggableGridOptions = this.gridOptions || DEFAULT_GRID_OPTIONS_1;
            if (this.draggableGridOptions.inline === true) {
                $element.addClass('inline-grid');
            }
            if (this.groupAdditionalActions)
                angular.extend(this.groupMenuActions, this.groupAdditionalActions);
            this.widgetsContext = $scope;
            this.compileWidgets();
            this.$timeout(function () {
                _this.$element.addClass('visible');
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
                            template: _this.pipWidgetTemplate.getTemplate(widget, _this._includeTpl)
                        };
                    });
            });
        };
        DashboardController.prototype.addComponent = function (groupIndex) {
            var _this = this;
            this.pipAddComponentDialog
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
            this.$timeout(function () {
                _this.groupedWidgets[params.options.groupIndex].removedWidgets = [];
            });
        };
        return DashboardController;
    }());
    var pipDashboard = {
        bindings: {
            gridOptions: '=pipGridOptions',
            groupAdditionalActions: '=pipGroupActions',
            groupedWidgets: '=pipGroups'
        },
        controller: DashboardController,
        templateUrl: 'Dashboard.html'
    };
    angular
        .module('pipDashboard')
        .config(configureAvailableWidgets)
        .config(setTranslations)
        .component('pipDashboard', pipDashboard);
}
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddComponentDialogWidget = (function () {
    function AddComponentDialogWidget() {
    }
    return AddComponentDialogWidget;
}());
exports.AddComponentDialogWidget = AddComponentDialogWidget;
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
},{"./AddComponentProvider":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddComponentDialogController_1 = require("./AddComponentDialogController");
{
    var setTranslations = function ($injector) {
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
    };
    setTranslations.$inject = ['$injector'];
    var AddComponentDialogService_1 = (function () {
        function AddComponentDialogService_1(widgetList, $mdDialog) {
            this.widgetList = widgetList;
            this.$mdDialog = $mdDialog;
        }
        AddComponentDialogService_1.prototype.show = function (groups, activeGroupIndex) {
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
        return AddComponentDialogService_1;
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
                this._service = new AddComponentDialogService_1(this._widgetList, $mdDialog);
            return this._service;
        }];
        return AddComponentDialogProvider;
    }());
    angular
        .module('pipDashboard')
        .config(setTranslations)
        .provider('pipAddComponentDialog', AddComponentDialogProvider);
}
},{"./AddComponentDialogController":3}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{"./ConfigDialogExtendComponent":6,"./ConfigDialogService":7}],6:[function(require,module,exports){
{
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
}
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigDialogController_1 = require("./ConfigDialogController");
{
    var setTranslations = function ($injector) {
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
    };
    setTranslations.$inject = ['$injector'];
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
                bindToController: true,
                controllerAs: 'vm',
                locals: {
                    params: params.locals
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
}
},{"./ConfigDialogController":5}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipDragged', []);
require("./DraggableTileService");
require("./DraggableComponent");
require("./draggable_group/DraggableTilesGroupService");
require("./draggable_group/DraggableTilesGroupDirective");
},{"./DraggableComponent":9,"./DraggableTileService":10,"./draggable_group/DraggableTilesGroupDirective":11,"./draggable_group/DraggableTilesGroupService":12}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            }, DEFAULT_OPTIONS, this.options);
            this.groups = this.tilesTemplates.map(function (group, groupIndex) {
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
            $scope.$watch('$ctrl.tilesTemplates', function (newVal) {
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
            this.$container = this.$element;
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
                _this.tilesTemplates[group.index].title = group.title;
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
                    if (this.groups.length !== this.tilesTemplates.length) {
                        this.tilesTemplates.push(source);
                    }
                    break;
                case 'moveTile':
                    var _a = {
                        fromIndex: source.from.elem.attributes['data-group-id'].value,
                        toIndex: source.to.elem.attributes['data-group-id'].value,
                        tileOptions: source.tile.opts.options,
                        fromTileIndex: source.tile.opts.options.index
                    }, fromIndex = _a.fromIndex, toIndex = _a.toIndex, tileOptions = _a.tileOptions, fromTileIndex = _a.fromTileIndex;
                    this.tilesTemplates[fromIndex].source.splice(fromTileIndex, 1);
                    this.tilesTemplates[toIndex].source.push({
                        opts: tileOptions
                    });
                    this.reIndexTiles(source.from.elem);
                    this.reIndexTiles(source.to.elem);
                    break;
            }
        };
        DraggableController.prototype.createTileScope = function (tile) {
            var tileScope = this.$rootScope.$new(false, this.tilesContext);
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
            var container = this.$container || $('body');
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
                _this.$container
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
        controller: DraggableController
    };
    angular.module('pipDragged')
        .component('pipDraggableGrid', DragComponent);
}
},{"./DraggableTileService":10,"./draggable_group/DraggableTilesGroupService":12}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DashboardWidget = (function () {
    function DashboardWidget() {
    }
    return DashboardWidget;
}());
exports.DashboardWidget = DashboardWidget;
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipWidget', []);
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
{
    var CalendarWidgetController = (function (_super) {
        __extends(CalendarWidgetController, _super);
        function CalendarWidgetController(pipWidgetConfigDialogService) {
            var _this = _super.call(this) || this;
            _this.pipWidgetConfigDialogService = pipWidgetConfigDialogService;
            if (_this.options) {
                _this.menu = _this.options.menu ? _.union(_this.menu, _this.options.menu) : _this.menu;
                _this.menu.push({
                    title: 'Configurate',
                    click: function () {
                        _this.onConfigClick();
                    }
                });
                _this.options.date = _this.options.date || new Date();
                _this.color = _this.options.color || 'blue';
            }
            return _this;
        }
        CalendarWidgetController.prototype.onConfigClick = function () {
            var _this = this;
            this.pipWidgetConfigDialogService.show({
                dialogClass: 'pip-calendar-config',
                locals: {
                    color: this.color,
                    size: this.options.size,
                    date: this.options.date,
                },
                extensionUrl: 'widgets/calendar/ConfigDialogExtension.html'
            }, function (result) {
                _this.changeSize(result.size);
                _this.color = result.color;
                _this.options.color = result.color;
                _this.options.date = result.date;
            });
        };
        return CalendarWidgetController;
    }(WidgetMenuService_1.MenuWidgetService));
    var CalendarWidget = {
        bindings: {
            options: '=pipOptions',
        },
        controller: CalendarWidgetController,
        templateUrl: 'widgets/calendar/WidgetCalendar.html'
    };
    angular
        .module('pipWidget')
        .component('pipCalendarWidget', CalendarWidget);
}
},{"../menu/WidgetMenuService":19}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
{
    var EventWidgetController = (function (_super) {
        __extends(EventWidgetController, _super);
        function EventWidgetController($scope, $element, $timeout, pipWidgetConfigDialogService) {
            var _this = _super.call(this) || this;
            _this.$element = $element;
            _this.$timeout = $timeout;
            _this.pipWidgetConfigDialogService = pipWidgetConfigDialogService;
            _this.opacity = 0.57;
            if (_this.options) {
                if (_this.options.menu)
                    _this.menu = _.union(_this.menu, _this.options.menu);
            }
            _this.menu.push({
                title: 'Configurate',
                click: function () {
                    _this.onConfigClick();
                }
            });
            _this.color = _this.options.color || 'gray';
            _this.opacity = _this.options.opacity || _this.opacity;
            _this.drawImage();
            $scope.$watch(function () {
                return $element.is(':visible');
            }, function (newVal) {
                _this.drawImage();
            });
            return _this;
        }
        EventWidgetController.prototype.drawImage = function () {
            var _this = this;
            if (this.options.image) {
                this.$timeout(function () {
                    _this.onImageLoad(_this.$element.find('img'));
                }, 500);
            }
        };
        EventWidgetController.prototype.onConfigClick = function () {
            var _this = this;
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
                    onOpacitytest: function (opacity) {
                        _this.opacity = opacity;
                    }
                },
                extensionUrl: 'widgets/event/ConfigDialogExtension.html'
            }, function (result) {
                _this.changeSize(result.size);
                _this.color = result.color;
                _this.options.color = result.color;
                _this.options.date = result.date;
                _this.options.title = result.title;
                _this.options.text = result.text;
                _this.options.opacity = result.opacity;
            }, function () {
                _this.opacity = _this._oldOpacity;
            });
        };
        EventWidgetController.prototype.onImageLoad = function (image) {
            this.setImageMarginCSS(this.$element.parent(), image);
        };
        EventWidgetController.prototype.changeSize = function (params) {
            var _this = this;
            this.options.size.colSpan = params.sizeX;
            this.options.size.rowSpan = params.sizeY;
            if (this.options.image) {
                this.$timeout(function () {
                    _this.setImageMarginCSS(_this.$element.parent(), _this.$element.find('img'));
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
    var EventWidget = {
        bindings: {
            options: '=pipOptions'
        },
        controller: EventWidgetController,
        templateUrl: 'widgets/event/WidgetEvent.html'
    };
    angular
        .module('pipWidget')
        .component('pipEventWidget', EventWidget);
}
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WidgetClass_1 = require("../WidgetClass");
var MenuWidgetService = (function (_super) {
    __extends(MenuWidgetService, _super);
    function MenuWidgetService() {
        "ngInject";
        var _this = _super.call(this) || this;
        _this.menu = [{
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
            }];
        return _this;
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
        this.options.size.colSpan = params.sizeX;
        this.options.size.rowSpan = params.sizeY;
    };
    ;
    return MenuWidgetService;
}(WidgetClass_1.DashboardWidget));
exports.MenuWidgetService = MenuWidgetService;
{
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
    angular
        .module('pipWidget')
        .provider('pipWidgetMenu', MenuWidgetProvider);
}
},{"../WidgetClass":14}],20:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
{
    var NotesWidgetController = (function (_super) {
        __extends(NotesWidgetController, _super);
        function NotesWidgetController(pipWidgetConfigDialogService) {
            var _this = _super.call(this) || this;
            _this.pipWidgetConfigDialogService = pipWidgetConfigDialogService;
            if (_this.options) {
                _this.menu = _this.options.menu ? _.union(_this.menu, _this.options.menu) : _this.menu;
            }
            _this.menu.push({
                title: 'Configurate',
                click: function () {
                    _this.onConfigClick();
                }
            });
            _this.color = _this.options.color || 'orange';
            return _this;
        }
        NotesWidgetController.prototype.onConfigClick = function () {
            var _this = this;
            this.pipWidgetConfigDialogService.show({
                dialogClass: 'pip-calendar-config',
                locals: {
                    color: this.color,
                    size: this.options.size,
                    title: this.options.title,
                    text: this.options.text,
                },
                extensionUrl: 'widgets/notes/ConfigDialogExtension.html'
            }, function (result) {
                _this.color = result.color;
                _this.options.color = result.color;
                _this.changeSize(result.size);
                _this.options.text = result.text;
                _this.options.title = result.title;
            });
        };
        return NotesWidgetController;
    }(WidgetMenuService_1.MenuWidgetService));
    var NotesWidget = {
        bindings: {
            options: '=pipOptions'
        },
        controller: NotesWidgetController,
        templateUrl: 'widgets/notes/WidgetNotes.html'
    };
    angular
        .module('pipWidget')
        .component('pipNotesWidget', NotesWidget);
}
},{"../menu/WidgetMenuService":19}],21:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
{
    var PictureSliderController = (function (_super) {
        __extends(PictureSliderController, _super);
        function PictureSliderController($scope, $element, $timeout, pipWidgetConfigDialogService, pipWidgetTemplate) {
            var _this = _super.call(this) || this;
            _this.$scope = $scope;
            _this.$element = $element;
            _this.$timeout = $timeout;
            _this.pipWidgetConfigDialogService = pipWidgetConfigDialogService;
            _this.pipWidgetTemplate = pipWidgetTemplate;
            _this.animationType = 'fading';
            _this.animationInterval = 5000;
            if (_this.options) {
                _this.animationType = _this.options.animationType || _this.animationType;
                _this.animationInterval = _this.options.animationInterval || _this.animationInterval;
            }
            return _this;
        }
        PictureSliderController.prototype.onImageLoad = function ($event) {
            var _this = this;
            this.$timeout(function () {
                _this.pipWidgetTemplate.setImageMarginCSS(_this.$element.parent(), $event.target);
            });
        };
        PictureSliderController.prototype.changeSize = function (params) {
            var _this = this;
            this.options.size.colSpan = params.sizeX;
            this.options.size.rowSpan = params.sizeY;
            this.$timeout(function () {
                _.each(_this.$element.find('img'), function (image) {
                    _this.pipWidgetTemplate.setImageMarginCSS(_this.$element.parent(), image);
                });
            }, 500);
        };
        return PictureSliderController;
    }(WidgetMenuService_1.MenuWidgetService));
    var PictureSliderWidget = {
        bindings: {
            options: '=pipOptions'
        },
        controller: PictureSliderController,
        templateUrl: 'widgets/picture_slider/WidgetPictureSlider.html'
    };
    angular
        .module('pipWidget')
        .component('pipPictureSliderWidget', PictureSliderWidget);
}
},{"../menu/WidgetMenuService":19}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
{
    var PositionWidgetController = (function (_super) {
        __extends(PositionWidgetController, _super);
        function PositionWidgetController($scope, $timeout, $element, pipWidgetConfigDialogService, pipLocationEditDialog) {
            var _this = _super.call(this) || this;
            _this.$timeout = $timeout;
            _this.$element = $element;
            _this.pipWidgetConfigDialogService = pipWidgetConfigDialogService;
            _this.pipLocationEditDialog = pipLocationEditDialog;
            _this.showPosition = true;
            if (_this.options) {
                if (_this.options.menu)
                    _this.menu = _.union(_this.menu, _this.options.menu);
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
            _this.options.location = _this.options.location || _this.options.position;
            $scope.$watch('widgetCtrl.options.location', function () {
                _this.reDrawPosition();
            });
            $scope.$watch(function () {
                return $element.is(':visible');
            }, function (newVal) {
                if (newVal == true)
                    _this.reDrawPosition();
            });
            return _this;
        }
        PositionWidgetController.prototype.onConfigClick = function () {
            var _this = this;
            this.pipWidgetConfigDialogService.show({
                dialogClass: 'pip-position-config',
                locals: {
                    size: this.options.size,
                    locationName: this.options.locationName,
                    hideColors: true,
                },
                extensionUrl: 'widgets/position/ConfigDialogExtension.html'
            }, function (result) {
                _this.changeSize(result.size);
                _this.options.locationName = result.locationName;
            });
        };
        PositionWidgetController.prototype.changeSize = function (params) {
            this.options.size.colSpan = params.sizeX;
            this.options.size.rowSpan = params.sizeY;
            this.reDrawPosition();
        };
        PositionWidgetController.prototype.openLocationEditDialog = function () {
            var _this = this;
            this.pipLocationEditDialog.show({
                locationName: this.options.locationName,
                locationPos: this.options.location
            }, function (newPosition) {
                if (newPosition) {
                    _this.options.location = newPosition.location;
                    _this.options.locationName = newPosition.locatioName;
                }
            });
        };
        PositionWidgetController.prototype.reDrawPosition = function () {
            var _this = this;
            this.showPosition = false;
            this.$timeout(function () {
                _this.showPosition = true;
            }, 50);
        };
        return PositionWidgetController;
    }(WidgetMenuService_1.MenuWidgetService));
    var PositionWidget = {
        bindings: {
            options: '=pipOptions',
            index: '=',
            group: '='
        },
        controller: PositionWidgetController,
        templateUrl: 'widgets/position/WidgetPosition.html'
    };
    angular
        .module('pipWidget')
        .component('pipPositionWidget', PositionWidget);
}
},{"../menu/WidgetMenuService":19}],23:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WidgetMenuService_1 = require("../menu/WidgetMenuService");
{
    var SMALL_CHART_1 = 70;
    var BIG_CHART_1 = 250;
    var StatisticsWidgetController = (function (_super) {
        __extends(StatisticsWidgetController, _super);
        function StatisticsWidgetController(pipWidgetMenu, $scope, $timeout) {
            var _this = _super.call(this) || this;
            _this.reset = false;
            _this.chartSize = SMALL_CHART_1;
            _this._$scope = $scope;
            _this._$timeout = $timeout;
            if (_this.options) {
                _this.menu = _this.options.menu ? _.union(_this.menu, _this.options.menu) : _this.menu;
            }
            _this.setChartSize();
            return _this;
        }
        StatisticsWidgetController.prototype.changeSize = function (params) {
            var _this = this;
            this.options.size.colSpan = params.sizeX;
            this.options.size.rowSpan = params.sizeY;
            this.reset = true;
            this.setChartSize();
            this._$timeout(function () {
                _this.reset = false;
            }, 500);
        };
        StatisticsWidgetController.prototype.setChartSize = function () {
            this.chartSize = this.options.size.colSpan == 2 && this.options.size.rowSpan == 2 ? BIG_CHART_1 : SMALL_CHART_1;
        };
        return StatisticsWidgetController;
    }(WidgetMenuService_1.MenuWidgetService));
    var StatisticsWidget = {
        bindings: {
            options: '=pipOptions'
        },
        controller: StatisticsWidgetController,
        templateUrl: 'widgets/statistics/WidgetStatistics.html'
    };
    angular
        .module('pipWidget')
        .component('pipStatisticsWidget', StatisticsWidget);
}
},{"../menu/WidgetMenuService":19}],24:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('Dashboard.html',
    '<md-button class="md-accent md-raised md-fab layout-column layout-align-center-center" aria-label="Add component"\n' +
    '           ng-click="$ctrl.addComponent()">\n' +
    '    <md-icon md-svg-icon="icons:plus" class="md-headline centered-add-icon"></md-icon>\n' +
    '</md-button>\n' +
    '\n' +
    '<div class="pip-draggable-grid-holder">\n' +
    '  <pip-draggable-grid pip-tiles-templates="$ctrl.groupedWidgets"\n' +
    '                      pip-tiles-context="$ctrl.widgetsContext"\n' +
    '                      pip-draggable-grid="$ctrl.draggableGridOptions"\n' +
    '                      pip-group-menu-actions="$ctrl.groupMenuActions">\n' +
    '  </pip-draggable-grid>\n' +
    '  \n' +
    '  <md-progress-circular md-mode="indeterminate" class="progress-ring"></md-progress-circular>\n' +
    '\n' +
    '</div>\n' +
    '');
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
    '<div class="pip-draggable-holder">\n' +
    '  <div class="pip-draggable-group" \n' +
    '       ng-repeat="group in $ctrl.groups" \n' +
    '       data-group-id="{{ $index }}" \n' +
    '       pip-draggable-tiles="group.source">\n' +
    '    <div class="pip-draggable-group-title layout-row layout-align-start-center">\n' +
    '      <div class="title-input-container" ng-click="$ctrl.onTitleClick(group, $event)">\n' +
    '        <input ng-if="group.editingName" ng-blur="$ctrl.onBlurTitleInput(group)" \n' +
    '               ng-keypress="$ctrl.onKyepressTitleInput(group, $event)"\n' +
    '               ng-model="group.title">\n' +
    '        </input>\n' +
    '        <div class="text-overflow flex-none" ng-if="!group.editingName">{{ group.title }}</div>\n' +
    '      </div>\n' +
    '      <md-button class="md-icon-button flex-none layout-align-center-center" \n' +
    '        ng-show="group.editingName" ng-click="$ctrl.cancelEditing(group)"\n' +
    '        aria-label="Cancel">\n' +
    '        <md-icon md-svg-icon="icons:cross"></md-icon>\n' +
    '      </md-button>\n' +
    '      <md-menu class="flex-none layout-column" md-position-mode="target-right target" ng-show="!group.editingName">\n' +
    '        <md-button class="md-icon-button flex-none layout-align-center-center" ng-click="$mdOpenMenu(); groupId = $index" aria-label="Menu">\n' +
    '          <md-icon md-svg-icon="icons:dots"></md-icon>\n' +
    '        </md-button>\n' +
    '        <md-menu-content width="4">\n' +
    '          <md-menu-item ng-repeat="action in $ctrl.groupMenuActions">\n' +
    '            <md-button ng-click="action.callback(groupId)">{{ action.title }}</md-button>\n' +
    '          </md-menu-item>\n' +
    '        </md-menu-content>\n' +
    '      </md-menu>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '\n' +
    '  <div class="pip-draggable-group fict-group layout-align-center-center layout-column tm16" >\n' +
    '    <div class="fict-group-text-container">\n' +
    '          <md-icon md-svg-icon="icons:plus"></md-icon>{{ \'DROP_TO_CREATE_NEW_GROUP\' | translate }}\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>');
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
    '<md-dialog class="pip-dialog pip-add-component-dialog">\n' +
    '  <md-dialog-content class="layout-column">\n' +
    '    <div class="theme-divider p16 flex-auto">\n' +
    '      <h3 class="hide-xs m0 bm16 theme-text-primary" hide-xs>{{ \'DASHBOARD_ADD_COMPONENT_DIALOG_TITLE\' | translate }}</h4>\n' +
    '      <md-input-container class="layout-row flex-auto m0 tm16">\n' +
    '        <md-select class="flex-auto m0 theme-text-primary" ng-model="dialogCtrl.activeGroupIndex" \n' +
    '            placeholder="{{ \'DASHBOARD_ADD_COMPONENT_DIALOG_CREATE_NEW_GROUP\' | translate }}"\n' +
    '            aria-label="Group">\n' +
    '          <md-option ng-value="$index" ng-repeat="group in dialogCtrl.groups">{{ group }}</md-option>\n' +
    '        </md-select>\n' +
    '      </md-input-container>\n' +
    '    </div>\n' +
    '    <div class="pip-body pip-scroll p0 flex-auto">\n' +
    '      <p class="md-body-1 theme-text-secondary m0 lp16 rp16" >\n' +
    '        {{ \'DASHBOARD_ADD_COMPONENT_DIALOG_USE_HOT_KEYS\' | translate }}\n' +
    '      </p>\n' +
    '      <md-list ng-init="groupIndex = $index" ng-repeat="group in dialogCtrl.defaultWidgets">\n' +
    '        <md-list-item class="layout-row pip-list-item lp16 rp16" ng-repeat="item in group">\n' +
    '          <div class="icon-holder flex-none">\n' +
    '            <md-icon md-svg-icon="icons:{{:: item.icon }}"></md-icon>\n' +
    '            <div class="pip-badge theme-badge md-warn" ng-if="item.amount">\n' +
    '              <span>{{ item.amount }}</span>\n' +
    '            </div>\n' +
    '          </div>\n' +
    '          <span class="flex-auto lm24 theme-text-primary">{{:: item.title }}</span>\n' +
    '          <md-button class="md-icon-button flex-none" ng-click="dialogCtrl.encrease(groupIndex, $index)" aria-label="Encrease">\n' +
    '            <md-icon md-svg-icon="icons:plus-circle"></md-icon>\n' +
    '          </md-button>\n' +
    '          <md-button class="md-icon-button flex-none" ng-click="dialogCtrl.decrease(groupIndex, $index)" aria-label="Decrease">\n' +
    '            <md-icon md-svg-icon="icons:minus-circle"></md-icon>\n' +
    '          </md-button>\n' +
    '        </md-list-item>\n' +
    '        <md-divider class="lm72 tm8 bm8" ng-if="groupIndex !== (dialogCtrl.defaultWidgets.length - 1)"></md-divider>\n' +
    '      </md-list>\n' +
    '    </div>\n' +
    '  </md-dialog-content>\n' +
    '  <md-dialog-actions class="flex-none layout-align-end-center theme-divider divider-top theme-text-primary">\n' +
    '    <md-button ng-click="dialogCtrl.cancel()" aria-label="Cancel">{{ \'CANCEL\' | translate }}</md-button>\n' +
    '    <md-button ng-click="dialogCtrl.add()" ng-disabled="dialogCtrl.totalWidgets === 0" arial-label="Add">{{ \'ADD\' | translate }}</md-button>\n' +
    '  </md-dialog-actions>\n' +
    '</md-dialog>');
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
    '<md-dialog class="pip-dialog pip-widget-config-dialog {{ vm.params.dialogClass }}" width="400" md-theme="{{vm.theme}}">\n' +
    '    <pip-widget-config-extend-component class="layout-column" pip-dialog-scope="vm" pip-extension-url="vm.params.extensionUrl" \n' +
    '        pip-apply="vm.onApply(updatedData)">\n' +
    '    </pip-widget-config-extend-component>\n' +
    '</md-dialog>');
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
    '<h3 class="tm0 flex-none">{{ \'DASHBOARD_WIDGET_CONFIG_DIALOG_TITLE\' | translate }}</h3>\n' +
    '<div class="pip-body pip-scroll p16 bp0 flex-auto">\n' +
    '    <pip-extension-point></pip-extension-point>\n' +
    '    <pip-toggle-buttons class="bm16" ng-if="!$ctrl.hideSizes" pip-buttons="$ctrl.sizes" ng-model="$ctrl.sizeId">\n' +
    '    </pip-toggle-buttons>\n' +
    '    <pip-color-picker ng-if="!$ctrl.hideColors" pip-colors="$ctrl.colors" ng-model="$ctrl.color">\n' +
    '    </pip-color-picker>\n' +
    '</div>\n' +
    '</div>\n' +
    '<div class="pip-footer flex-none">\n' +
    '    <div>\n' +
    '        <md-button class="md-accent" ng-click="$ctrl.onCancel()">{{ \'CANCEL\' | translate }}</md-button>\n' +
    '        <md-button class="md-accent" ng-click="$ctrl.onApply()">{{ \'APPLY\' | translate }}</md-button>\n' +
    '    </div>\n' +
    '</div>');
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
    '<div class="w-stretch bm16">\n' +
    '    Date:\n' +
    '    <md-datepicker ng-model="$ctrl.date" class="w-stretch ">\n' +
    '    </md-datepicker>\n' +
    '</div>');
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
    '<div class="widget-box pip-calendar-widget {{ $ctrl.color }} layout-column layout-fill tp0"\n' +
    '     ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1,\n' +
    '        medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1,\n' +
    '        big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }">\n' +
    '  <div class="widget-heading layout-row layout-align-end-center flex-none">\n' +
    '    <pip-menu-widget></pip-menu-widget>\n' +
    '  </div>\n' +
    '\n' +
    '  <div class="widget-content flex-auto layout-row layout-align-center-center"\n' +
    '       ng-if="$ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1">\n' +
    '    <span class="date lm24 rm12">{{ $ctrl.options.date.getDate() }}</span>\n' +
    '    <div class="flex-auto layout-column">\n' +
    '      <span class="weekday md-headline">{{ $ctrl.options.date | formatLongDayOfWeek }}</span>\n' +
    '      <span class="month-year md-headline">{{ $ctrl.options.date | formatLongMonth }} {{ $ctrl.options.date | formatYear }}</span>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '\n' +
    '  <div class="widget-content flex-auto layout-column layout-align-space-around-center"\n' +
    '       ng-hide="$ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1">\n' +
    '    <span class="weekday md-headline"\n' +
    '          ng-hide="$ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1">{{ $ctrl.options.date | formatLongDayOfWeek }}</span>\n' +
    '    <span class="weekday"\n' +
    '          ng-show="$ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1">{{ $ctrl.options.date | formatLongDayOfWeek }}</span>\n' +
    '    <span class="date lm12 rm12">{{ $ctrl.options.date.getDate() }}</span>\n' +
    '    <span class="month-year md-headline">{{ $ctrl.options.date | formatLongMonth }} {{ $ctrl.options.date | formatYear }}</span>\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
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
    '<div class="w-stretch">\n' +
    '    <md-input-container class="w-stretch bm0">\n' +
    '        <label>Title:</label>\n' +
    '        <input type="text" ng-model="$ctrl.title"/>\n' +
    '    </md-input-container>\n' +
    '\n' +
    '    Date:\n' +
    '    <md-datepicker ng-model="$ctrl.date" class="w-stretch bm8">\n' +
    '    </md-datepicker>\n' +
    '\n' +
    '    <md-input-container class="w-stretch">\n' +
    '        <label>Description:</label>\n' +
    '        <textarea type="text" ng-model="$ctrl.text"/>\n' +
    '    </md-input-container>\n' +
    '\n' +
    '    Backdrop\'s opacity:\n' +
    '    <md-slider aria-label="opacity"  type="number" min="0.1" max="0.9" step="0.01" \n' +
    '        ng-model="$ctrl.opacity" ng-change="$ctrl.onOpacitytest($ctrl.opacity)">\n' +
    '    </md-slider>\n' +
    '</div>');
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
    '<div class="widget-box pip-event-widget {{ $ctrl.color }} layout-column layout-fill" ng-class="{\n' +
    '        small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1,\n' +
    '        medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1,\n' +
    '        big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }" >\n' +
    '    <img ng-if="$ctrl.options.image" ng-src="{{$ctrl.options.image}}" alt="{{$ctrl.options.title || $ctrl.options.name}}"\n' +
    '    />\n' +
    '    <div class="text-backdrop" style="background-color: rgba(0, 0, 0, {{ $ctrl.opacity }})">\n' +
    '        <div class="widget-heading layout-row layout-align-start-center flex-none">\n' +
    '            <span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span>\n' +
    '            <pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget>\n' +
    '        </div>\n' +
    '        <div class="text-container flex-auto pip-scroll">\n' +
    '            <p class="date flex-none" ng-if="$ctrl.options.date">\n' +
    '                {{ $ctrl.options.date | formatShortDate }}\n' +
    '            </p>\n' +
    '            <p class="text flex-auto">\n' +
    '                {{ $ctrl.options.text || $ctrl.options.description }}\n' +
    '            </p>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>');
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
    '<md-menu class="widget-menu" md-position-mode="target-right target">\n' +
    '    <md-button class="md-icon-button flex-none" ng-click="$mdOpenMenu()" aria-label="Menu">\n' +
    '        <md-icon md-svg-icon="icons:vdots"></md-icon>\n' +
    '    </md-button>\n' +
    '\n' +
    '    <md-menu-content width="4">\n' +
    '        <md-menu-item ng-repeat="item in $ctrl.menu">\n' +
    '            <md-button ng-if="!item.submenu" ng-click="$ctrl.callAction(item.action, item.params, item)">{{:: item.title }}</md-button>\n' +
    '\n' +
    '            <md-menu ng-if="item.submenu">\n' +
    '                <md-button ng-click="$ctrl.callAction(item.action)">{{:: item.title }}</md-button>\n' +
    '\n' +
    '                <md-menu-content>\n' +
    '                    <md-menu-item ng-repeat="subitem in item.submenu">\n' +
    '                        <md-button ng-click="$ctrl.callAction(subitem.action, subitem.params, subitem)">{{:: subitem.title }}</md-button>\n' +
    '                    </md-menu-item>\n' +
    '                </md-menu-content>\n' +
    '            </md-menu>\n' +
    '        </md-menu-item>\n' +
    '\n' +
    '    </md-menu-content>\n' +
    '</md-menu>');
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
    '<div class="w-stretch">\n' +
    '    <md-input-container class="w-stretch bm0">\n' +
    '        <label>Title:</label>\n' +
    '        <input type="text" ng-model="$ctrl.title"/>\n' +
    '    </md-input-container>\n' +
    '\n' +
    '    <md-input-container class="w-stretch tm0">\n' +
    '        <label>Text:</label>\n' +
    '        <textarea type="text" ng-model="$ctrl.text"/>\n' +
    '    </md-input-container>\n' +
    '</div>');
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
    '<div class="widget-box pip-notes-widget {{ $ctrl.color }} layout-column">\n' +
    '    <div class="widget-heading layout-row layout-align-start-center flex-none" ng-if="$ctrl.options.title || $ctrl.options.name">\n' +
    '        <span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span>\n' +
    '    </div>\n' +
    '    <pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget>\n' +
    '    \n' +
    '    <div class="text-container flex-auto pip-scroll">\n' +
    '        <p>{{ $ctrl.options.text }}</p>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
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
    '<div class="widget-box pip-picture-slider-widget {{ $ctrl.color }} layout-column layout-fill" ng-class="{\n' +
    '        small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1,\n' +
    '        medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1,\n' +
    '        big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }" \n' +
    '        index=\'{{ $ctrl.index }}\' group=\'{{ $ctrl.group }}\'>\n' +
    '\n' +
    '        <div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none">\n' +
    '            <span class="flex text-overflow">{{ $ctrl.options.title }}</span>\n' +
    '            <pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget>\n' +
    '        </div>\n' +
    '\n' +
    '        <div class="slider-container">\n' +
    '            <div pip-image-slider pip-animation-type="\'fading\'" pip-animation-interval="$ctrl.animationInterval" \n' +
    '                ng-if="$ctrl.animationType == \'fading\'">\n' +
    '                <div class="pip-animation-block" ng-repeat="slide in $ctrl.options.slides">\n' +
    '                    <img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="$ctrl.onImageLoad($event)"/>\n' +
    '                    <p class="slide-text" ng-if="slide.text">{{ slide.text }}</p>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '\n' +
    '            <div pip-image-slider pip-animation-type="\'carousel\'" pip-animation-interval="$ctrl.animationInterval" \n' +
    '                ng-if="$ctrl.animationType == \'carousel\'">\n' +
    '                <div class="pip-animation-block" ng-repeat="slide in $ctrl.options.slides">\n' +
    '                    <img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="$ctrl.onImageLoad($event)"/>\n' +
    '                    <p class="slide-text" ng-if="slide.text">{{ slide.text }}</p>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '</div>');
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
    '<div class="w-stretch">\n' +
    '    <md-input-container class="w-stretch bm0">\n' +
    '        <label>Location name:</label>\n' +
    '        <input type="text" ng-model="$ctrl.locationName"/>\n' +
    '    </md-input-container>\n' +
    '</div>');
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
    '<div class="pip-position-widget widget-box p0 layout-column layout-fill"\n' +
    '     ng-class="{\n' +
    '        small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1,\n' +
    '        medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1,\n' +
    '        big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }"\n' +
    '        index=\'{{ $ctrl.index }}\' group=\'{{ $ctrl.group }}\'>\n' +
    '    <div class="position-absolute-right-top" ng-if="!$ctrl.options.locationName">\n' +
    '        <pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none" ng-if="$ctrl.options.locationName">\n' +
    '        <span class="flex text-overflow">{{ $ctrl.options.locationName }}</span>\n' +
    '        <pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget>\n' +
    '    </div>\n' +
    '\n' +
    '    <pip-location-map class="flex" ng-if="$ctrl.showPosition" pip-stretch="true" pip-rebind="true"\n' +
    '        pip-location-pos="$ctrl.options.location"></pip-location>\n' +
    '</div>\n' +
    '');
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
    '<div class="widget-box pip-statistics-widget layout-column layout-fill"\n' +
    '     ng-class="{\n' +
    '        small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1,\n' +
    '        medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1,\n' +
    '        big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }">\n' +
    '    <div class="widget-heading layout-row layout-align-start-center flex-none">\n' +
    '        <span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span>\n' +
    '        <pip-menu-widget></pip-menu-widget>\n' +
    '    </div>\n' +
    '    <div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="$ctrl.options.series && !$ctrl.reset">\n' +
    '        <pip-pie-chart pip-series="$ctrl.options.series" ng-if="!$ctrl.options.chartType || $ctrl.options.chartType == \'pie\'"\n' +
    '                    pip-donut="true" \n' +
    '                    pip-pie-size="$ctrl.chartSize" \n' +
    '                    pip-show-total="true" \n' +
    '                    pip-centered="true">\n' +
    '        </pip-pie-chart>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);
})();



},{}]},{},[24,1,2,3,4,5,6,7,11,12,8,9,10,13,16,17,18,19,20,21,22,23,14,15])(24)
});

//# sourceMappingURL=pip-webui-dashboard.js.map
