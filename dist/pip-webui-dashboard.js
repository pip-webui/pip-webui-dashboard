(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).dashboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
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
angular.module('pipDragged', []);
require("./DraggableTileService");
require("./DraggableComponent");
require("./draggable_group/DraggableTilesGroupService");
require("./draggable_group/DraggableTilesGroupDirective");
},{"./DraggableComponent":9,"./DraggableTileService":10,"./draggable_group/DraggableTilesGroupDirective":11,"./draggable_group/DraggableTilesGroupService":12}],9:[function(require,module,exports){
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
var DashboardWidget = (function () {
    function DashboardWidget() {
    }
    return DashboardWidget;
}());
exports.DashboardWidget = DashboardWidget;
},{}],15:[function(require,module,exports){
"use strict";
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRGFzaGJvYXJkLnRzIiwic3JjL0Rhc2hib2FyZENvbXBvbmVudC50cyIsInNyYy9kaWFsb2dzL2FkZF9jb21wb25lbnQvQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlci50cyIsInNyYy9kaWFsb2dzL2FkZF9jb21wb25lbnQvQWRkQ29tcG9uZW50UHJvdmlkZXIudHMiLCJzcmMvZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXIudHMiLCJzcmMvZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudC50cyIsInNyYy9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZS50cyIsInNyYy9kcmFnZ2FibGUvRHJhZ2dhYmxlLnRzIiwic3JjL2RyYWdnYWJsZS9EcmFnZ2FibGVDb21wb25lbnQudHMiLCJzcmMvZHJhZ2dhYmxlL0RyYWdnYWJsZVRpbGVTZXJ2aWNlLnRzIiwic3JjL2RyYWdnYWJsZS9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cERpcmVjdGl2ZS50cyIsInNyYy9kcmFnZ2FibGUvZHJhZ2dhYmxlX2dyb3VwL0RyYWdnYWJsZVRpbGVzR3JvdXBTZXJ2aWNlLnRzIiwic3JjL3V0aWxpdHkvV2lkZ2V0VGVtcGxhdGVVdGlsaXR5LnRzIiwic3JjL3dpZGdldHMvV2lkZ2V0Q2xhc3MudHMiLCJzcmMvd2lkZ2V0cy9XaWRnZXRzLnRzIiwic3JjL3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIudHMiLCJzcmMvd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudURpcmVjdGl2ZS50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UudHMiLCJzcmMvd2lkZ2V0cy9ub3Rlcy9XaWRnZXROb3Rlcy50cyIsInNyYy93aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIudHMiLCJzcmMvd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi50cyIsInNyYy93aWRnZXRzL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcy50cyIsInRlbXAvcGlwLXdlYnVpLWRhc2hib2FyZC1odG1sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLDZCQUEyQjtBQUMzQixpQ0FBK0I7QUFFL0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7SUFDN0IsV0FBVztJQUNYLFlBQVk7SUFDWix1QkFBdUI7SUFDdkIsZ0NBQWdDO0lBQ2hDLHdCQUF3QjtJQUd4QixXQUFXO0lBQ1gsY0FBYztJQUNkLGFBQWE7SUFDYixXQUFXO0lBQ1gsY0FBYztJQUNkLGFBQWE7Q0FDZCxDQUFDLENBQUM7QUFFSCwyQ0FBeUM7QUFDekMsMERBQXdEO0FBQ3hELGdFQUE4RDtBQUM5RCxnQ0FBOEI7OztBQ2Q5QixDQUFDO0lBQ0MsSUFBTSxlQUFlLEdBQUcsVUFBVSxTQUFtQztRQUNuRSxJQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUMxRyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ1AsWUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVDLHdCQUF3QixFQUFFLCtCQUErQjthQUMxRCxDQUFDLENBQUM7WUFDTyxZQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRTtnQkFDNUMsd0JBQXdCLEVBQUUsMkNBQTJDO2FBQ3RFLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDLENBQUE7SUFFRCxJQUFNLHlCQUF5QixHQUFHLFVBQVUsNkJBQTBEO1FBQ3BHLDZCQUE2QixDQUFDLGdCQUFnQixDQUFDO1lBQzdDLENB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAnLi93aWRnZXRzL1dpZGdldHMnO1xyXG5pbXBvcnQgJy4vZHJhZ2dhYmxlL0RyYWdnYWJsZSc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkJywgW1xyXG4gICdwaXBXaWRnZXQnLFxyXG4gICdwaXBEcmFnZ2VkJyxcclxuICAncGlwV2lkZ2V0Q29uZmlnRGlhbG9nJyxcclxuICAncGlwQWRkRGFzaGJvYXJkQ29tcG9uZW50RGlhbG9nJyxcclxuICAncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsXHJcblxyXG4gIC8vIEV4dGVybmFsIHBpcCBtb2R1bGVzXHJcbiAgJ3BpcExheW91dCcsXHJcbiAgJ3BpcExvY2F0aW9ucycsXHJcbiAgJ3BpcERhdGVUaW1lJyxcclxuICAncGlwQ2hhcnRzJyxcclxuICAncGlwVHJhbnNsYXRlJyxcclxuICAncGlwQ29udHJvbHMnXHJcbl0pO1xyXG5cclxuaW1wb3J0ICcuL3V0aWxpdHkvV2lkZ2V0VGVtcGxhdGVVdGlsaXR5JztcclxuaW1wb3J0ICcuL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dDb250cm9sbGVyJztcclxuaW1wb3J0ICcuL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyJztcclxuaW1wb3J0ICcuL0Rhc2hib2FyZENvbXBvbmVudCc7XHJcbiIsImltcG9ydCB7XHJcbiAgSVdpZGdldFRlbXBsYXRlU2VydmljZVxyXG59IGZyb20gJy4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQge1xyXG4gIElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlLFxyXG4gIElBZGRDb21wb25lbnREaWFsb2dwcm92aWRlclxyXG59IGZyb20gJy4vZGlhbG9ncy9hZGRfY29tcG9uZW50L0FkZENvbXBvbmVudFByb3ZpZGVyJ1xyXG5cclxue1xyXG4gIGNvbnN0IHNldFRyYW5zbGF0aW9ucyA9IGZ1bmN0aW9uICgkaW5qZWN0b3I6IG5nLmF1dG8uSUluamVjdG9yU2VydmljZSkge1xyXG4gICAgY29uc3QgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgOiBudWxsO1xyXG4gICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgIERST1BfVE9fQ1JFQVRFX05FV19HUk9VUDogJ0Ryb3AgaGVyZSB0byBjcmVhdGUgbmV3IGdyb3VwJyxcclxuICAgICAgfSk7XHJcbiAgICAgICggPCBhbnkgPiBwaXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgRFJPUF9UT19DUkVBVEVfTkVXX0dST1VQOiAn0J/QtdGA0LXRgtCw0YnQuNGC0LUg0YHRjtC00LAg0LTQu9GPINGB0L7Qt9C00LDQvdC40Y8g0L3QvtCy0L7QuSDQs9GA0YPQv9C/0YsnXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgY29uZmlndXJlQXZhaWxhYmxlV2lkZ2V0cyA9IGZ1bmN0aW9uIChwaXBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlcjogSUFkZENvbXBvbmVudERpYWxvZ3Byb3ZpZGVyKSB7XHJcbiAgICBwaXBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlci5jb25maWdXaWRnZXRMaXN0KFtcclxuICAgICAgW3tcclxuICAgICAgICAgIHRpdGxlOiAnRXZlbnQnLFxyXG4gICAgICAgICAgaWNvbjogJ2RvY3VtZW50JyxcclxuICAgICAgICAgIG5hbWU6ICdldmVudCcsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnUG9zaXRpb24nLFxyXG4gICAgICAgICAgaWNvbjogJ2xvY2F0aW9uJyxcclxuICAgICAgICAgIG5hbWU6ICdwb3NpdGlvbicsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFt7XHJcbiAgICAgICAgICB0aXRsZTogJ0NhbGVuZGFyJyxcclxuICAgICAgICAgIGljb246ICdkYXRlJyxcclxuICAgICAgICAgIG5hbWU6ICdjYWxlbmRhcicsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnU3RpY2t5IE5vdGVzJyxcclxuICAgICAgICAgIGljb246ICdub3RlLXRha2UnLFxyXG4gICAgICAgICAgbmFtZTogJ25vdGVzJyxcclxuICAgICAgICAgIGFtb3VudDogMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGl0bGU6ICdTdGF0aXN0aWNzJyxcclxuICAgICAgICAgIGljb246ICd0ci1zdGF0aXN0aWNzJyxcclxuICAgICAgICAgIG5hbWU6ICdzdGF0aXN0aWNzJyxcclxuICAgICAgICAgIGFtb3VudDogMFxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgXSk7XHJcbiAgfVxyXG5cclxuICBjbGFzcyBkcmFnZ2FibGVPcHRpb25zIHtcclxuICAgIHRpbGVXaWR0aDogbnVtYmVyO1xyXG4gICAgdGlsZUhlaWdodDogbnVtYmVyO1xyXG4gICAgZ3V0dGVyOiBudW1iZXI7XHJcbiAgICBpbmxpbmU6IGJvb2xlYW47XHJcbiAgfVxyXG5cclxuICBjb25zdCBERUZBVUxUX0dSSURfT1BUSU9OUzogZHJhZ2dhYmxlT3B0aW9ucyA9IHtcclxuICAgIHRpbGVXaWR0aDogMTUwLCAvLyAncHgnXHJcbiAgICB0aWxlSGVpZ2h0OiAxNTAsIC8vICdweCdcclxuICAgIGd1dHRlcjogMTAsIC8vICdweCdcclxuICAgIGlubGluZTogZmFsc2VcclxuICB9O1xyXG5cclxuICBpbnRlcmZhY2UgRGFzaGJvYXJkQmluZGluZ3Mge1xyXG4gICAgICBncmlkT3B0aW9uczogYW55O1xyXG4gICAgICBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiBhbnk7XHJcbiAgICAgIGdyb3VwZWRXaWRnZXRzOiBhbnk7XHJcbiAgfVxyXG5cclxuICBjbGFzcyBEYXNoYm9hcmRDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIsIERhc2hib2FyZEJpbmRpbmdzIHtcclxuICAgIHByaXZhdGUgZGVmYXVsdEdyb3VwTWVudUFjdGlvbnM6IGFueSA9IFt7XHJcbiAgICAgICAgdGl0bGU6ICdBZGQgQ29tcG9uZW50JyxcclxuICAgICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KGdyb3VwSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRpdGxlOiAnUmVtb3ZlJyxcclxuICAgICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlR3JvdXAoZ3JvdXBJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnY29uZmlndXJhdGUgZ3JvdXAgd2l0aCBpbmRleDonLCBncm91cEluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF07XHJcbiAgICBwcml2YXRlIF9pbmNsdWRlVHBsOiBzdHJpbmcgPSAnPHBpcC17eyB0eXBlIH19LXdpZGdldCBncm91cD1cImdyb3VwSW5kZXhcIiBpbmRleD1cImluZGV4XCInICtcclxuICAgICAgJ3BpcC1vcHRpb25zPVwiJHBhcmVudC4kY3RybC5ncm91cGVkV2lkZ2V0c1tncm91cEluZGV4XVtcXCdzb3VyY2VcXCddW2luZGV4XS5vcHRzXCI+JyArXHJcbiAgICAgICc8L3BpcC17eyB0eXBlIH19LXdpZGdldD4nO1xyXG5cclxuICAgIHB1YmxpYyBncm91cGVkV2lkZ2V0czogYW55O1xyXG4gICAgcHVibGljIGRyYWdnYWJsZUdyaWRPcHRpb25zOiBkcmFnZ2FibGVPcHRpb25zO1xyXG4gICAgcHVibGljIHdpZGdldHNUZW1wbGF0ZXM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cE1lbnVBY3Rpb25zOiBhbnkgPSB0aGlzLmRlZmF1bHRHcm91cE1lbnVBY3Rpb25zO1xyXG4gICAgcHVibGljIHdpZGdldHNDb250ZXh0OiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JpZE9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkYXR0cnM6IGFueSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW55LFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBBZGRDb21wb25lbnREaWFsb2c6IElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgLy8gQWRkIGNsYXNzIHRvIHN0eWxlIHNjcm9sbCBiYXJcclxuICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1zY3JvbGwnKTtcclxuXHJcbiAgICAgIC8vIFNldCB0aWxlcyBncmlkIG9wdGlvbnNcclxuICAgICAgdGhpcy5kcmFnZ2FibGVHcmlkT3B0aW9ucyA9IHRoaXMuZ3JpZE9wdGlvbnMgfHwgREVGQVVMVF9HUklEX09QVElPTlM7XHJcblxyXG4gICAgICAvLyBTd2l0Y2ggaW5saW5lIGRpc3BsYXlpbmdcclxuICAgICAgaWYgKHRoaXMuZHJhZ2dhYmxlR3JpZE9wdGlvbnMuaW5saW5lID09PSB0cnVlKSB7XHJcbiAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ2lubGluZS1ncmlkJyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gRXh0ZW5kIGdyb3VwJ3MgbWVudSBhY3Rpb25zXHJcbiAgICAgIGlmICh0aGlzLmdyb3VwQWRkaXRpb25hbEFjdGlvbnMpIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZ3JvdXBNZW51QWN0aW9ucywgdGhpcy5ncm91cEFkZGl0aW9uYWxBY3Rpb25zKTtcclxuXHJcbiAgICAgIC8vIENvbXBpbGUgd2lkZ2V0c1xyXG4gICAgICB0aGlzLndpZGdldHNDb250ZXh0ID0gJHNjb3BlO1xyXG4gICAgICB0aGlzLmNvbXBpbGVXaWRnZXRzKCk7XHJcblxyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICAgIH0sIDcwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb21waWxlV2lkZ2V0cygpIHtcclxuICAgICAgXy5lYWNoKHRoaXMuZ3JvdXBlZFdpZGdldHMsIChncm91cCwgZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLnJlbW92ZWRXaWRnZXRzID0gZ3JvdXAucmVtb3ZlZFdpZGdldHMgfHwgW10sXHJcbiAgICAgICAgICBncm91cC5zb3VyY2UgPSBncm91cC5zb3VyY2UubWFwKCh3aWRnZXQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEVzdGFibGlzaCBkZWZhdWx0IHByb3BzXHJcbiAgICAgICAgICAgIHdpZGdldC5zaXplID0gd2lkZ2V0LnNpemUgfHwge1xyXG4gICAgICAgICAgICAgIGNvbFNwYW46IDEsXHJcbiAgICAgICAgICAgICAgcm93U3BhbjogMVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3aWRnZXQuaW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgd2lkZ2V0Lmdyb3VwSW5kZXggPSBncm91cEluZGV4O1xyXG4gICAgICAgICAgICB3aWRnZXQubWVudSA9IHdpZGdldC5tZW51IHx8IHt9O1xyXG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh3aWRnZXQubWVudSwgW3tcclxuICAgICAgICAgICAgICB0aXRsZTogJ1JlbW92ZScsXHJcbiAgICAgICAgICAgICAgY2xpY2s6IChpdGVtLCBwYXJhbXMsIG9iamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVXaWRnZXQoaXRlbSwgcGFyYW1zLCBvYmplY3QpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBvcHRzOiB3aWRnZXQsXHJcbiAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMucGlwV2lkZ2V0VGVtcGxhdGUuZ2V0VGVtcGxhdGUod2lkZ2V0LCB0aGlzLl9pbmNsdWRlVHBsKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZENvbXBvbmVudChncm91cEluZGV4KSB7XHJcbiAgICAgIHRoaXMucGlwQWRkQ29tcG9uZW50RGlhbG9nXHJcbiAgICAgICAgLnNob3codGhpcy5ncm91cGVkV2lkZ2V0cywgZ3JvdXBJbmRleClcclxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgdmFyIGFjdGl2ZUdyb3VwO1xyXG5cclxuICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGRhdGEuZ3JvdXBJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgYWN0aXZlR3JvdXAgPSB0aGlzLmdyb3VwZWRXaWRnZXRzW2RhdGEuZ3JvdXBJbmRleF07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhY3RpdmVHcm91cCA9IHtcclxuICAgICAgICAgICAgICB0aXRsZTogJ05ldyBncm91cCcsXHJcbiAgICAgICAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuYWRkV2lkZ2V0cyhhY3RpdmVHcm91cC5zb3VyY2UsIGRhdGEud2lkZ2V0cyk7XHJcblxyXG4gICAgICAgICAgaWYgKGRhdGEuZ3JvdXBJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0cy5wdXNoKGFjdGl2ZUdyb3VwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmNvbXBpbGVXaWRnZXRzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyByZW1vdmVHcm91cCA9IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmVHcm91cCcsIGdyb3VwSW5kZXgpO1xyXG4gICAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnNwbGljZShncm91cEluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZFdpZGdldHMoZ3JvdXAsIHdpZGdldHMpIHtcclxuICAgICAgd2lkZ2V0cy5mb3JFYWNoKCh3aWRnZXRHcm91cCkgPT4ge1xyXG4gICAgICAgIHdpZGdldEdyb3VwLmZvckVhY2goKHdpZGdldCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHdpZGdldC5hbW91bnQpIHtcclxuICAgICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkod2lkZ2V0LmFtb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGdyb3VwLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0Lm5hbWVcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlV2lkZ2V0KGl0ZW0sIHBhcmFtcywgb2JqZWN0KSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMgPSBbXTtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cy5wdXNoKHBhcmFtcy5vcHRpb25zLmluZGV4KTtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5zb3VyY2Uuc3BsaWNlKHBhcmFtcy5vcHRpb25zLmluZGV4LCAxKTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cyA9IFtdO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb25zdCBwaXBEYXNoYm9hcmQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgZ3JpZE9wdGlvbnM6ICc9cGlwR3JpZE9wdGlvbnMnLFxyXG4gICAgICBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiAnPXBpcEdyb3VwQWN0aW9ucycsXHJcbiAgICAgIGdyb3VwZWRXaWRnZXRzOiAnPXBpcEdyb3VwcydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBEYXNoYm9hcmRDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdEYXNoYm9hcmQuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuY29uZmlnKGNvbmZpZ3VyZUF2YWlsYWJsZVdpZGdldHMpXHJcbiAgICAuY29uZmlnKHNldFRyYW5zbGF0aW9ucylcclxuICAgIC5jb21wb25lbnQoJ3BpcERhc2hib2FyZCcsIHBpcERhc2hib2FyZCk7XHJcblxyXG59IiwiZXhwb3J0IGNsYXNzIEFkZENvbXBvbmVudERpYWxvZ1dpZGdldCB7XHJcbiAgICB0aXRsZTogc3RyaW5nO1xyXG4gICAgaWNvbjogc3RyaW5nO1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgYW1vdW50OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIge1xyXG4gICAgcHVibGljIGRlZmF1bHRXaWRnZXRzOiBbQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0W11dO1xyXG4gICAgcHVibGljIGdyb3VwczogYW55O1xyXG4gICAgcHVibGljIHRvdGFsV2lkZ2V0czogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBncm91cHMsIC8vIExhdGVyIG1heSBiZSBncm91cCB0eXBlXHJcbiAgICAgICAgcHVibGljIGFjdGl2ZUdyb3VwSW5kZXg6IG51bWJlcixcclxuICAgICAgICB3aWRnZXRMaXN0OiBbQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0W11dLFxyXG4gICAgICAgIHB1YmxpYyAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlR3JvdXBJbmRleCA9IF8uaXNOdW1iZXIoYWN0aXZlR3JvdXBJbmRleCkgPyBhY3RpdmVHcm91cEluZGV4IDogLTE7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0V2lkZ2V0cyA9IF8uY2xvbmVEZWVwKHdpZGdldExpc3QpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gXy5tYXAoZ3JvdXBzLCBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwWyd0aXRsZSddO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IHRoaXMuYWN0aXZlR3JvdXBJbmRleCxcclxuICAgICAgICAgICAgd2lkZ2V0czogdGhpcy5kZWZhdWx0V2lkZ2V0c1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgY2FuY2VsKCkge1xyXG4gICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgZW5jcmVhc2UoZ3JvdXBJbmRleDogbnVtYmVyLCB3aWRnZXRJbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3Qgd2lkZ2V0ID0gdGhpcy5kZWZhdWx0V2lkZ2V0c1tncm91cEluZGV4XVt3aWRnZXRJbmRleF07XHJcbiAgICAgICAgd2lkZ2V0LmFtb3VudCsrO1xyXG4gICAgICAgIHRoaXMudG90YWxXaWRnZXRzKys7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBkZWNyZWFzZShncm91cEluZGV4OiBudW1iZXIsIHdpZGdldEluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB3aWRnZXQgPSB0aGlzLmRlZmF1bHRXaWRnZXRzW2dyb3VwSW5kZXhdW3dpZGdldEluZGV4XTtcclxuICAgICAgICB3aWRnZXQuYW1vdW50ID0gd2lkZ2V0LmFtb3VudCA/IHdpZGdldC5hbW91bnQgLSAxIDogMDtcclxuICAgICAgICB0aGlzLnRvdGFsV2lkZ2V0cyA9IHRoaXMudG90YWxXaWRnZXRzID8gdGhpcy50b3RhbFdpZGdldHMgLSAxIDogMDtcclxuICAgIH07XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcEFkZERhc2hib2FyZENvbXBvbmVudERpYWxvZycsIFsnbmdNYXRlcmlhbCddKTtcclxuXHJcbmltcG9ydCAnLi9BZGRDb21wb25lbnRQcm92aWRlcic7IiwiaW1wb3J0IHtcclxuICBBZGRDb21wb25lbnREaWFsb2dXaWRnZXQsXHJcbiAgQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlclxyXG59IGZyb20gJy4vQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlIHtcclxuICBzaG93KGdyb3VwcywgYWN0aXZlR3JvdXBJbmRleCk6IGFuZ3VsYXIuSVByb21pc2UgPCBhbnkgPiA7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFkZENvbXBvbmVudERpYWxvZ3Byb3ZpZGVyIHtcclxuICBjb25maWdXaWRnZXRMaXN0KGxpc3Q6IFtBZGRDb21wb25lbnREaWFsb2dXaWRnZXRbXV0pOiB2b2lkO1xyXG59XHJcblxyXG57XHJcbiAgY29uc3Qgc2V0VHJhbnNsYXRpb25zID0gZnVuY3Rpb24oJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgIGNvbnN0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGVQcm92aWRlcicpIDogbnVsbDtcclxuICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgKDxhbnk+cGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgIERBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19USVRMRTogJ0FkZCBjb21wb25lbnQnLFxyXG4gICAgICAgIERBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19VU0VfSE9UX0tFWVM6ICdVc2UgXCJFbnRlclwiIG9yIFwiK1wiIGJ1dHRvbnMgb24ga2V5Ym9hcmQgdG8gZW5jcmVhc2UgYW5kIFwiRGVsZXRlXCIgb3IgXCItXCIgdG8gZGVjcmVhc2UgdGlsZXMgYW1vdW50JyxcclxuICAgICAgICBEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfQ1JFQVRFX05FV19HUk9VUDogJ0NyZWF0ZSBuZXcgZ3JvdXAnXHJcbiAgICAgIH0pO1xyXG4gICAgICAoPGFueT5waXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1RJVExFOiAn0JTQvtCx0LDQstC40YLRjCDQutC+0LzQv9C+0L3QtdC90YInLFxyXG4gICAgICAgIERBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19VU0VfSE9UX0tFWVM6ICfQmNGB0L/QvtC70YzQt9GD0LnRgtC1IFwiRW50ZXJcIiDQuNC70LggXCIrXCIg0LrQu9Cw0LLQuNGI0Lgg0L3QsCDQutC70LDQstC40LDRgtGD0YDQtSDRh9GC0L7QsdGLINGD0LLQtdC70LjRh9C40YLRjCDQuCBcIkRlbGV0ZVwiIG9yIFwiLVwiINGH0YLQvtCx0Ysg0YPQvNC10L3RiNC40YLRjCDQutC+0LvQuNGH0LXRgdGC0LLQviDRgtCw0LnQu9C+0LInLFxyXG4gICAgICAgIERBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19DUkVBVEVfTkVXX0dST1VQOiAn0KHQvtC30LTQsNGC0Ywg0L3QvtCy0YPRjiDQs9GA0YPQv9C/0YMnXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xhc3MgQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSBpbXBsZW1lbnRzIElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlIHtcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgd2lkZ2V0TGlzdDogW0FkZENvbXBvbmVudERpYWxvZ1dpZGdldFtdXSxcclxuICAgICAgcHJpdmF0ZSAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2VcclxuICAgICkge31cclxuXHJcbiAgICBwdWJsaWMgc2hvdyhncm91cHMsIGFjdGl2ZUdyb3VwSW5kZXgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJG1kRGlhbG9nXHJcbiAgICAgICAgLnNob3coe1xyXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdkaWFsb2dzL2FkZF9jb21wb25lbnQvQWRkQ29tcG9uZW50Lmh0bWwnLFxyXG4gICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAgIGNvbnRyb2xsZXI6IEFkZENvbXBvbmVudERpYWxvZ0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICBjb250cm9sbGVyQXM6ICdkaWFsb2dDdHJsJyxcclxuICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWUsXHJcbiAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgIGdyb3VwczogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBncm91cHM7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFjdGl2ZUdyb3VwSW5kZXg6ICgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlR3JvdXBJbmRleDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgd2lkZ2V0TGlzdDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiAoPGFueT50aGlzLndpZGdldExpc3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgQWRkQ29tcG9uZW50RGlhbG9nUHJvdmlkZXIgaW1wbGVtZW50cyBJQWRkQ29tcG9uZW50RGlhbG9ncHJvdmlkZXIge1xyXG4gICAgcHJpdmF0ZSBfc2VydmljZTogQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZTtcclxuICAgIHByaXZhdGUgX3dpZGdldExpc3Q6IFtBZGRDb21wb25lbnREaWFsb2dXaWRnZXRbXV0gPSBudWxsO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBwdWJsaWMgY29uZmlnV2lkZ2V0TGlzdCA9IGZ1bmN0aW9uIChsaXN0OiBbQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0W11dKSB7XHJcbiAgICAgIHRoaXMuX3dpZGdldExpc3QgPSBsaXN0O1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgJGdldCgkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UpIHtcclxuICAgICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX3NlcnZpY2UgPT0gbnVsbClcclxuICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IEFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2UodGhpcy5fd2lkZ2V0TGlzdCwgJG1kRGlhbG9nKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb25maWcoc2V0VHJhbnNsYXRpb25zKVxyXG4gICAgLnByb3ZpZGVyKCdwaXBBZGRDb21wb25lbnREaWFsb2cnLCBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlcik7XHJcbn0iLCJcclxuY2xhc3MgVGlsZUNvbG9ycyB7XHJcbiAgICBzdGF0aWMgYWxsOiBzdHJpbmdbXSA9IFsncHVycGxlJywgJ2dyZWVuJywgJ2dyYXknLCAnb3JhbmdlJywgJ2JsdWUnXTtcclxufVxyXG5cclxuY2xhc3MgVGlsZVNpemVzIHtcclxuICAgIHN0YXRpYyBhbGw6IGFueSA9IFt7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTCcsXHJcbiAgICAgICAgICAgIGlkOiAnMTEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9XSURFJyxcclxuICAgICAgICAgICAgaWQ6ICcyMSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ0RBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFJyxcclxuICAgICAgICAgICAgaWQ6ICcyMidcclxuICAgICAgICB9XHJcbiAgICBdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV2lkZ2V0Q29uZmlnRGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICBwdWJsaWMgY29sb3JzOiBzdHJpbmdbXSA9IFRpbGVDb2xvcnMuYWxsO1xyXG4gICAgcHVibGljIHNpemVzOiBhbnkgPSBUaWxlU2l6ZXMuYWxsO1xyXG4gICAgcHVibGljIHNpemVJZDogc3RyaW5nID0gVGlsZVNpemVzLmFsbFswXS5pZDtcclxuICAgIHB1YmxpYyBvbkNhbmNlbDogRnVuY3Rpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIHBhcmFtcyxcclxuICAgICAgICBwdWJsaWMgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHRoaXMucGFyYW1zKTtcclxuICAgICAgICB0aGlzLnNpemVJZCA9ICcnICsgdGhpcy5wYXJhbXMuc2l6ZS5jb2xTcGFuICsgdGhpcy5wYXJhbXMuc2l6ZS5yb3dTcGFuO1xyXG5cclxuICAgICAgICB0aGlzLm9uQ2FuY2VsID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQXBwbHkodXBkYXRlZERhdGEpIHtcclxuICAgICAgICB0aGlzWydzaXplJ10uc2l6ZVggPSBOdW1iZXIodGhpcy5zaXplSWQuc3Vic3RyKDAsIDEpKTtcclxuICAgICAgICB0aGlzWydzaXplJ10uc2l6ZVkgPSBOdW1iZXIodGhpcy5zaXplSWQuc3Vic3RyKDEsIDEpKTtcclxuICAgICAgICB0aGlzLiRtZERpYWxvZy5oaWRlKHVwZGF0ZWREYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nJywgWyduZ01hdGVyaWFsJ10pO1xyXG5cclxuaW1wb3J0ICcuL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5pbXBvcnQgJy4vQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50JzsiLCJ7ICAgIFxyXG4gICAgaW50ZXJmYWNlIElXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBwaXBFeHRlbnNpb25Vcmw6IGFueTtcclxuICAgICAgICBwaXBEaWFsb2dTY29wZTogYW55O1xyXG4gICAgICAgIHBpcEFwcGx5OiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3M6IElXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5ncyA9IHtcclxuICAgICAgICBwaXBFeHRlbnNpb25Vcmw6ICc8JyxcclxuICAgICAgICBwaXBEaWFsb2dTY29wZTogJzwnLFxyXG4gICAgICAgIHBpcEFwcGx5OiAnJidcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBuZy5JQ2hhbmdlc09iamVjdDxhbnk+O1xyXG5cclxuICAgICAgICBwaXBFeHRlbnNpb25Vcmw6IG5nLklDaGFuZ2VzT2JqZWN0PHN0cmluZz47XHJcbiAgICAgICAgcGlwRGlhbG9nU2NvcGU6IG5nLklDaGFuZ2VzT2JqZWN0PG5nLklTY29wZT47XHJcblxyXG4gICAgICAgIHBpcEFwcGx5OiBuZy5JQ2hhbmdlc09iamVjdDwoe3VwZGF0ZWREYXRhOiBhbnl9KSA9PiBuZy5JUHJvbWlzZTx2b2lkPj47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIElXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRBdHRyaWJ1dGVzIGV4dGVuZHMgbmcuSUF0dHJpYnV0ZXMge1xyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogc3RyaW5nXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50Q29udHJvbGxlciBpbXBsZW1lbnRzIElXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHBpcEV4dGVuc2lvblVybDogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBwaXBEaWFsb2dTY29wZTogbmcuSVNjb3BlO1xyXG4gICAgICAgIHB1YmxpYyBwaXBBcHBseTogKHBhcmFtOiB7dXBkYXRlZERhdGE6IGFueX0pID0+IG5nLklQcm9taXNlPHZvaWQ+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkdGVtcGxhdGVSZXF1ZXN0OiBhbmd1bGFyLklUZW1wbGF0ZVJlcXVlc3RTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBcclxuICAgICAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LCBcclxuICAgICAgICAgICAgcHJpdmF0ZSAkYXR0cnM6IElXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRBdHRyaWJ1dGVzXHJcbiAgICAgICAgKSB7IH1cclxuXHJcbiAgICAgICAgcHVibGljICRvbkNoYW5nZXMoY2hhbmdlczogV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50Q2hhbmdlcykge1xyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5waXBEaWFsb2dTY29wZSkge1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgY2hhbmdlcy5waXBEaWFsb2dTY29wZS5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBpcEV4dGVuc2lvblVybCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGVtcGxhdGVSZXF1ZXN0KGNoYW5nZXMucGlwRXh0ZW5zaW9uVXJsLmN1cnJlbnRWYWx1ZSwgZmFsc2UpLnRoZW4oKGh0bWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ3BpcC1leHRlbnNpb24tcG9pbnQnKS5yZXBsYWNlV2l0aCh0aGlzLiRjb21waWxlKGh0bWwpKHRoaXMuJHNjb3BlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9uQXBwbHkoKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGlwQXBwbHkoe3VwZGF0ZWREYXRhOiB0aGlzfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBpcFdpZGdldENvbmZpZ0NvbXBvbmVudDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdkaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50Lmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudENvbnRyb2xsZXIsXHJcbiAgICAgICAgYmluZGluZ3M6IFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcFdpZGdldENvbmZpZ0RpYWxvZycpXHJcbiAgICAgICAgLmNvbXBvbmVudCgncGlwV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50JywgcGlwV2lkZ2V0Q29uZmlnQ29tcG9uZW50KTtcclxufSIsImltcG9ydCB7IFdpZGdldENvbmZpZ0RpYWxvZ0NvbnRyb2xsZXIgfSBmcm9tICcuL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJV2lkZ2V0Q29uZmlnU2VydmljZSB7XHJcbiAgICBzaG93KHBhcmFtczogSVdpZGdldENvbmZpZ0RpYWxvZ09wdGlvbnMsIHN1Y2Nlc3NDYWxsYmFjayA/IDogKGtleSkgPT4gdm9pZCwgY2FuY2VsQ2FsbGJhY2sgPyA6ICgpID0+IHZvaWQpOiBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldENvbmZpZ0RpYWxvZ09wdGlvbnMgZXh0ZW5kcyBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dPcHRpb25zIHtcclxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nO1xyXG4gICAgZXh0ZW5zaW9uVXJsPzogc3RyaW5nO1xyXG4gICAgZXZlbnQ/OiBhbnk7XHJcbn1cclxuXHJcbntcclxuICAgIGNvbnN0IHNldFRyYW5zbGF0aW9ucyA9IGZ1bmN0aW9uKCRpbmplY3RvcjogbmcuYXV0by5JSW5qZWN0b3JTZXJ2aWNlKSB7XHJcbiAgICAgICAgY29uc3QgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgOiBudWxsO1xyXG4gICAgICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19USVRMRTogJ0VkaXQgdGlsZScsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTDogJ1NtYWxsJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX1dJREU6ICdXaWRlJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFOiAnTGFyZ2UnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1RJVExFOiAn0JjQt9C80LXQvdC40YLRjCDQstC40LTQttC10YInLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfU01BTEw6ICfQnNCw0LvQtdC9LicsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9XSURFOiAn0KjQuNGA0L7QutC40LknLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfTEFSR0U6ICfQkdC+0LvRjNGI0L7QuSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uge1xyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHVibGljICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgICAgICkge31cclxuXHJcbiAgICAgICAgcHVibGljIHNob3cocGFyYW1zOiBJV2lkZ2V0Q29uZmlnRGlhbG9nT3B0aW9ucywgc3VjY2Vzc0NhbGxiYWNrID8gOiAoa2V5KSA9PiB2b2lkLCBjYW5jZWxDYWxsYmFjayA/IDogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudDogcGFyYW1zLmV2ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBwYXJhbXMudGVtcGxhdGVVcmwgfHwgJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2cuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogV2lkZ2V0Q29uZmlnRGlhbG9nQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMubG9jYWxzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYW5jZWxDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nJylcclxuICAgICAgICAuY29uZmlnKHNldFRyYW5zbGF0aW9ucylcclxuICAgICAgICAuc2VydmljZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZScsIFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2UpO1xyXG59IiwiYW5ndWxhci5tb2R1bGUoJ3BpcERyYWdnZWQnLCBbXSk7XHJcblxyXG5pbXBvcnQgJy4vRHJhZ2dhYmxlVGlsZVNlcnZpY2UnO1xyXG5pbXBvcnQgJy4vRHJhZ2dhYmxlQ29tcG9uZW50JztcclxuaW1wb3J0ICcuL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwU2VydmljZSdcclxuaW1wb3J0ICcuL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwRGlyZWN0aXZlJyIsImRlY2xhcmUgdmFyIGludGVyYWN0O1xyXG5cclxuaW1wb3J0IHtcclxuICBEcmFnVGlsZVNlcnZpY2UsXHJcbiAgSURyYWdUaWxlU2VydmljZSxcclxuICBJRHJhZ1RpbGVDb25zdHJ1Y3RvclxyXG59IGZyb20gJy4vRHJhZ2dhYmxlVGlsZVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIFRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgSVRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgSVRpbGVzR3JpZENvbnN0cnVjdG9yXHJcbn0gZnJvbSAnLi9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UnO1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVElMRV9XSURUSDogbnVtYmVyID0gMTUwO1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9USUxFX0hFSUdIVDogbnVtYmVyID0gMTUwO1xyXG5leHBvcnQgY29uc3QgVVBEQVRFX0dST1VQU19FVkVOVCA9IFwicGlwVXBkYXRlRGFzaGJvYXJkR3JvdXBzQ29uZmlnXCI7XHJcblxyXG5jb25zdCBTSU1QTEVfTEFZT1VUX0NPTFVNTlNfQ09VTlQ6IG51bWJlciA9IDI7XHJcbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcclxuICB0aWxlV2lkdGg6IERFRkFVTFRfVElMRV9XSURUSCwgLy8gJ3B4J1xyXG4gIHRpbGVIZWlnaHQ6IERFRkFVTFRfVElMRV9IRUlHSFQsIC8vICdweCdcclxuICBndXR0ZXI6IDIwLCAvLyAncHgnXHJcbiAgY29udGFpbmVyOiAncGlwLWRyYWdnYWJsZS1ncmlkOmZpcnN0LW9mLXR5cGUnLFxyXG4gIC8vbW9iaWxlQnJlYWtwb2ludCAgICAgICA6IFhYWCwgICAvLyBHZXQgZnJvbSBwaXBNZWRpYSBTZXJ2aWNlIGluIHRoZSBjb25zdHJ1Y3RvclxyXG4gIGFjdGl2ZURyb3B6b25lQ2xhc3M6ICdkcm9wem9uZS1hY3RpdmUnLFxyXG4gIGdyb3VwQ29udGFuaW5lclNlbGVjdG9yOiAnLnBpcC1kcmFnZ2FibGUtZ3JvdXA6bm90KC5maWN0LWdyb3VwKScsXHJcbn07XHJcblxyXG57XHJcbiAgaW50ZXJmYWNlIElEcmFnZ2FibGVCaW5kaW5ncyB7XHJcbiAgICAgIHRpbGVzVGVtcGxhdGVzOiBhbnk7XHJcbiAgICAgIHRpbGVzQ29udGV4dDogYW55O1xyXG4gICAgICBvcHRpb25zOiBhbnk7XHJcbiAgICAgIGdyb3VwTWVudUFjdGlvbnM6IGFueTtcclxuICAgICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gIH1cclxuXHJcbiAgaW50ZXJmYWNlIElEcmFnZ2FibGVDb250cm9sbGVyU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgdGlsZXNUZW1wbGF0ZXM6IGFueTtcclxuICAgIG9wdGlvbnM6IGFueTtcclxuICB9XHJcblxyXG4gIGludGVyZmFjZSBJVGlsZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgIGluZGV4OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgICBncm91cEluZGV4OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgfVxyXG5cclxuICBjbGFzcyBEcmFnZ2FibGVDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbXBvbmVudENvbnRyb2xsZXIsIElEcmFnZ2FibGVCaW5kaW5ncyB7XHJcbiAgICBwdWJsaWMgb3B0czogYW55O1xyXG4gICAgcHVibGljIGdyb3VwczogYW55O1xyXG4gICAgcHVibGljIHNvdXJjZURyb3Bab25lRWxlbTogYW55ID0gbnVsbDtcclxuICAgIHB1YmxpYyBpc1NhbWVEcm9wem9uZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgdGlsZUdyb3VwczogYW55ID0gbnVsbDtcclxuICAgIHB1YmxpYyBhdmFpbGFibGVXaWR0aDogbnVtYmVyO1xyXG4gICAgcHVibGljIGF2YWlsYWJsZUNvbHVtbnM6IG51bWJlcjtcclxuICAgIHB1YmxpYyBncm91cHNDb250YWluZXJzOiBhbnk7XHJcbiAgICBwdWJsaWMgY29udGFpbmVyOiBhbnk7XHJcbiAgICBwdWJsaWMgYWN0aXZlRHJhZ2dlZEdyb3VwOiBhbnk7XHJcbiAgICBwdWJsaWMgZHJhZ2dlZFRpbGU6IGFueTtcclxuICAgIHB1YmxpYyBjb250YWluZXJPZmZzZXQ6IGFueTtcclxuICAgIHB1YmxpYyB0aWxlc1RlbXBsYXRlczogYW55O1xyXG4gICAgcHVibGljIHRpbGVzQ29udGV4dDogYW55O1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cE1lbnVBY3Rpb25zOiBhbnk7XHJcbiAgICBwdWJsaWMgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlICRzY29wZTogSURyYWdnYWJsZUNvbnRyb2xsZXJTY29wZSxcclxuICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgcGlwRHJhZ1RpbGU6IElEcmFnVGlsZVNlcnZpY2UsXHJcbiAgICAgIHBpcFRpbGVzR3JpZDogSVRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgICAgIHBpcE1lZGlhOiBwaXAubGF5b3V0cy5JTWVkaWFTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgdGhpcy5vcHRzID0gXy5tZXJnZSh7XHJcbiAgICAgICAgbW9iaWxlQnJlYWtwb2ludDogcGlwTWVkaWEuYnJlYWtwb2ludHMueHNcclxuICAgICAgfSwgREVGQVVMVF9PUFRJT05TLCB0aGlzLm9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMgPSB0aGlzLnRpbGVzVGVtcGxhdGVzLm1hcCgoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdGl0bGU6IGdyb3VwLnRpdGxlLFxyXG4gICAgICAgICAgZWRpdGluZ05hbWU6IGZhbHNlLFxyXG4gICAgICAgICAgaW5kZXg6IGdyb3VwSW5kZXgsXHJcbiAgICAgICAgICBzb3VyY2U6IGdyb3VwLnNvdXJjZS5tYXAoKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICAgICAgdHBsOiAkY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgICAgICBzaXplOiB0aWxlLm9wdHMuc2l6ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBZGQgdGVtcGxhdGVzIHdhdGNoZXJcclxuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwudGlsZXNUZW1wbGF0ZXMnLCAobmV3VmFsKSA9PiB7XHJcbiAgICAgICAgdGhpcy53YXRjaChuZXdWYWwpO1xyXG4gICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgZGF0YVxyXG4gICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICAgIC8vIFJlc2l6ZSBoYW5kbGVyIFRPRE86IHJlcGxhY2UgYnkgcGlwIHJlc2l6ZSB3YXRjaGVyc1xyXG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlV2lkdGggPSB0aGlzLmdldENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVDb2x1bW5zID0gdGhpcy5nZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlV2lkdGgpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgIGdyb3VwXHJcbiAgICAgICAgICAgIC5zZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlQ29sdW1ucylcclxuICAgICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sIDUwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUG9zdCBsaW5rIGZ1bmN0aW9uXHJcbiAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdhdGNoIGhhbmRsZXJcclxuICAgIHByaXZhdGUgd2F0Y2gobmV3VmFsKSB7XHJcbiAgICAgIGNvbnN0IHByZXZWYWwgPSB0aGlzLmdyb3VwcztcclxuICAgICAgbGV0IGNoYW5nZWRHcm91cEluZGV4ID0gbnVsbDtcclxuXHJcbiAgICAgIGlmIChuZXdWYWwubGVuZ3RoID4gcHJldlZhbC5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmFkZEdyb3VwKG5ld1ZhbFtuZXdWYWwubGVuZ3RoIC0gMV0pO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuZXdWYWwubGVuZ3RoIDwgcHJldlZhbC5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdyb3VwcyhuZXdWYWwpO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3VmFsLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBXaWRnZXREaWZmID0gcHJldlZhbFtpXS5zb3VyY2UubGVuZ3RoIC0gbmV3VmFsW2ldLnNvdXJjZS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGdyb3VwV2lkZ2V0RGlmZiB8fCAobmV3VmFsW2ldLnJlbW92ZWRXaWRnZXRzICYmIG5ld1ZhbFtpXS5yZW1vdmVkV2lkZ2V0cy5sZW5ndGggPiAwKSkge1xyXG4gICAgICAgICAgY2hhbmdlZEdyb3VwSW5kZXggPSBpO1xyXG5cclxuICAgICAgICAgIGlmIChncm91cFdpZGdldERpZmYgPCAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1RpbGVzID0gbmV3VmFsW2NoYW5nZWRHcm91cEluZGV4XS5zb3VyY2Uuc2xpY2UoZ3JvdXBXaWRnZXREaWZmKTtcclxuXHJcbiAgICAgICAgICAgIF8uZWFjaChuZXdUaWxlcywgKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGlsZScsIHRpbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRkVGlsZXNJbnRvR3JvdXAobmV3VGlsZXMsIHRoaXMudGlsZUdyb3Vwc1tjaGFuZ2VkR3JvdXBJbmRleF0sIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tjaGFuZ2VkR3JvdXBJbmRleF0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZXModGhpcy50aWxlR3JvdXBzW2NoYW5nZWRHcm91cEluZGV4XSwgbmV3VmFsW2NoYW5nZWRHcm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cywgdGhpcy5ncm91cHNDb250YWluZXJzW2NoYW5nZWRHcm91cEluZGV4XSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNPcHRpb25zKG5ld1ZhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbCAmJiB0aGlzLnRpbGVHcm91cHMpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSW5saW5lIGVkaXQgZ3JvdXAgaGFuZGxlcnNcclxuICAgIHB1YmxpYyBvblRpdGxlQ2xpY2soZ3JvdXAsIGV2ZW50KSB7XHJcbiAgICAgIGlmICghZ3JvdXAuZWRpdGluZ05hbWUpIHtcclxuICAgICAgICBncm91cC5vbGRUaXRsZSA9IF8uY2xvbmUoZ3JvdXAudGl0bGUpO1xyXG4gICAgICAgIGdyb3VwLmVkaXRpbmdOYW1lID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldC5jaGlsZHJlblswXSkuZm9jdXMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5jZWxFZGl0aW5nKGdyb3VwKSB7XHJcbiAgICAgIGdyb3VwLnRpdGxlID0gZ3JvdXAub2xkVGl0bGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQmx1clRpdGxlSW5wdXQoZ3JvdXApIHtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ3JvdXAuZWRpdGluZ05hbWUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChVUERBVEVfR1JPVVBTX0VWRU5ULCB0aGlzLmdyb3Vwcyk7XHJcbiAgICAgICAgLy8gVXBkYXRlIHRpdGxlIGluIG91dGVyIHNjb3BlXHJcbiAgICAgICAgdGhpcy50aWxlc1RlbXBsYXRlc1tncm91cC5pbmRleF0udGl0bGUgPSBncm91cC50aXRsZTtcclxuICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25LeWVwcmVzc1RpdGxlSW5wdXQoZ3JvdXAsIGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgIHRoaXMub25CbHVyVGl0bGVJbnB1dChncm91cCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgb3V0ZXIgc2NvcGUgZnVuY3Rpb25zXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzVGVtcGxhdGVzKHVwZGF0ZVR5cGU6IHN0cmluZywgc291cmNlID8gOiBhbnkpIHtcclxuICAgICAgc3dpdGNoICh1cGRhdGVUeXBlKSB7XHJcbiAgICAgICAgY2FzZSAnYWRkR3JvdXAnOlxyXG4gICAgICAgICAgaWYgKHRoaXMuZ3JvdXBzLmxlbmd0aCAhPT0gdGhpcy50aWxlc1RlbXBsYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy50aWxlc1RlbXBsYXRlcy5wdXNoKHNvdXJjZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtb3ZlVGlsZSc6XHJcbiAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIGZyb21JbmRleCxcclxuICAgICAgICAgICAgdG9JbmRleCxcclxuICAgICAgICAgICAgdGlsZU9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyb21UaWxlSW5kZXhcclxuICAgICAgICAgIH0gPSB7XHJcbiAgICAgICAgICAgIGZyb21JbmRleDogc291cmNlLmZyb20uZWxlbS5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWUsXHJcbiAgICAgICAgICAgIHRvSW5kZXg6IHNvdXJjZS50by5lbGVtLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSxcclxuICAgICAgICAgICAgdGlsZU9wdGlvbnM6IHNvdXJjZS50aWxlLm9wdHMub3B0aW9ucyxcclxuICAgICAgICAgICAgZnJvbVRpbGVJbmRleDogc291cmNlLnRpbGUub3B0cy5vcHRpb25zLmluZGV4XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnRpbGVzVGVtcGxhdGVzW2Zyb21JbmRleF0uc291cmNlLnNwbGljZShmcm9tVGlsZUluZGV4LCAxKTtcclxuICAgICAgICAgIHRoaXMudGlsZXNUZW1wbGF0ZXNbdG9JbmRleF0uc291cmNlLnB1c2goe1xyXG4gICAgICAgICAgICBvcHRzOiB0aWxlT3B0aW9uc1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoc291cmNlLmZyb20uZWxlbSk7XHJcbiAgICAgICAgICB0aGlzLnJlSW5kZXhUaWxlcyhzb3VyY2UudG8uZWxlbSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1hbmFnZSB0aWxlcyBmdW5jdGlvbnNcclxuICAgIHByaXZhdGUgY3JlYXRlVGlsZVNjb3BlKHRpbGU6IGFueSk6IElUaWxlU2NvcGUge1xyXG4gICAgICBjb25zdCB0aWxlU2NvcGUgPSA8IElUaWxlU2NvcGUgPiB0aGlzLiRyb290U2NvcGUuJG5ldyhmYWxzZSwgdGhpcy50aWxlc0NvbnRleHQpO1xyXG4gICAgICB0aWxlU2NvcGUuaW5kZXggPSB0aWxlLm9wdHMuaW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuaW5kZXggOiB0aWxlLm9wdHMuaW5kZXg7XHJcbiAgICAgIHRpbGVTY29wZS5ncm91cEluZGV4ID0gdGlsZS5vcHRzLmdyb3VwSW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuZ3JvdXBJbmRleCA6IHRpbGUub3B0cy5ncm91cEluZGV4O1xyXG5cclxuICAgICAgcmV0dXJuIHRpbGVTY29wZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbW92ZVRpbGVzKGdyb3VwLCBpbmRleGVzLCBjb250YWluZXIpIHtcclxuICAgICAgY29uc3QgdGlsZXMgPSAkKGNvbnRhaW5lcikuZmluZCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpO1xyXG5cclxuICAgICAgXy5lYWNoKGluZGV4ZXMsIChpbmRleCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgdGlsZXNbaW5kZXhdLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVJbmRleFRpbGVzKGNvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZUluZGV4VGlsZXMoY29udGFpbmVyLCBnSW5kZXggPyApIHtcclxuICAgICAgY29uc3QgdGlsZXMgPSAkKGNvbnRhaW5lcikuZmluZCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpLFxyXG4gICAgICAgIGdyb3VwSW5kZXggPSBnSW5kZXggPT09IHVuZGVmaW5lZCA/IGNvbnRhaW5lci5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWUgOiBnSW5kZXg7XHJcblxyXG4gICAgICBfLmVhY2godGlsZXMsICh0aWxlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gJCh0aWxlKS5jaGlsZHJlbigpWzBdO1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnaW5kZXgnXSA9IGluZGV4O1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnZ3JvdXBJbmRleCddID0gZ3JvdXBJbmRleDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVHcm91cHMobmV3R3JvdXBzKSB7XHJcbiAgICAgIGNvbnN0IHJlbW92ZUluZGV4ZXMgPSBbXSxcclxuICAgICAgICByZW1haW4gPSBbXSxcclxuICAgICAgICBjb250YWluZXJzID0gW107XHJcblxyXG5cclxuICAgICAgXy5lYWNoKHRoaXMuZ3JvdXBzLCAoZ3JvdXAsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKF8uZmluZEluZGV4KG5ld0dyb3VwcywgKGcpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGdbJ3RpdGxlJ10gPT09IGdyb3VwLnRpdGxlXHJcbiAgICAgICAgICB9KSA8IDApIHtcclxuICAgICAgICAgIHJlbW92ZUluZGV4ZXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlbWFpbi5wdXNoKGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgXy5lYWNoKHJlbW92ZUluZGV4ZXMucmV2ZXJzZSgpLCAoaW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLmdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIF8uZWFjaChyZW1haW4sIChpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnRhaW5lcnMucHVzaCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbaW5kZXhdKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBjb250YWluZXJzO1xyXG5cclxuICAgICAgXy5lYWNoKHRoaXMuZ3JvdXBzQ29udGFpbmVycywgKGNvbnRhaW5lciwgaW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLnJlSW5kZXhUaWxlcyhjb250YWluZXIsIGluZGV4KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRHcm91cChzb3VyY2VHcm91cCkge1xyXG4gICAgICBjb25zdCBncm91cCA9IHtcclxuICAgICAgICB0aXRsZTogc291cmNlR3JvdXAudGl0bGUsXHJcbiAgICAgICAgc291cmNlOiBzb3VyY2VHcm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB0aWxlU2NvcGUgPSB0aGlzLmNyZWF0ZVRpbGVTY29wZSh0aWxlKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICAgIHRwbDogdGhpcy4kY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB0aWxlLm9wdHMsXHJcbiAgICAgICAgICAgIHNpemU6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMucHVzaChncm91cCk7XHJcbiAgICAgIGlmICghdGhpcy4kc2NvcGUuJCRwaGFzZSkgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcblxyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0cy5ncm91cENvbnRhbmluZXJTZWxlY3Rvcik7XHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzLnB1c2goXHJcbiAgICAgICAgICBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCB0aGlzLm9wdHMsIHRoaXMuYXZhaWxhYmxlQ29sdW1ucywgdGhpcy5ncm91cHNDb250YWluZXJzW3RoaXMuZ3JvdXBzQ29udGFpbmVycy5sZW5ndGggLSAxXSlcclxuICAgICAgICAgIC5nZW5lcmF0ZUdyaWQodGhpcy5nZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUodGhpcy5hdmFpbGFibGVXaWR0aCkpXHJcbiAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKClcclxuICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KClcclxuICAgICAgICApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNUZW1wbGF0ZXMoJ2FkZEdyb3VwJywgc291cmNlR3JvdXApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkVGlsZXNJbnRvR3JvdXAobmV3VGlsZXMsIGdyb3VwLCBncm91cENvbnRhaW5lcikge1xyXG4gICAgICBuZXdUaWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld1RpbGUgPSBJRHJhZ1RpbGVDb25zdHJ1Y3RvcihEcmFnVGlsZVNlcnZpY2UsIHtcclxuICAgICAgICAgIHRwbDogdGhpcy4kY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgb3B0aW9uczogdGlsZS5vcHRzLFxyXG4gICAgICAgICAgc2l6ZTogdGlsZS5vcHRzLnNpemVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JvdXAuYWRkVGlsZShuZXdUaWxlKTtcclxuXHJcbiAgICAgICAgJCgnPGRpdj4nKVxyXG4gICAgICAgICAgLmFkZENsYXNzKCdwaXAtZHJhZ2dhYmxlLXRpbGUnKVxyXG4gICAgICAgICAgLmFwcGVuZChuZXdUaWxlLmdldENvbXBpbGVkVGVtcGxhdGUoKSlcclxuICAgICAgICAgIC5hcHBlbmRUbyhncm91cENvbnRhaW5lcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlVGlsZXNPcHRpb25zKG9wdGlvbnNHcm91cCkge1xyXG4gICAgICBvcHRpb25zR3JvdXAuZm9yRWFjaCgob3B0aW9uR3JvdXApID0+IHtcclxuICAgICAgICBvcHRpb25Hcm91cC5zb3VyY2UuZm9yRWFjaCgodGlsZU9wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgICAgICBncm91cC51cGRhdGVUaWxlT3B0aW9ucyh0aWxlT3B0aW9ucy5vcHRzKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRUaWxlc0dyb3Vwcyh0aWxlR3JvdXBzLCBvcHRzLCBncm91cHNDb250YWluZXJzKSB7XHJcbiAgICAgIHJldHVybiB0aWxlR3JvdXBzLm1hcCgoZ3JvdXAsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIElUaWxlc0dyaWRDb25zdHJ1Y3RvcihUaWxlc0dyaWRTZXJ2aWNlLCBncm91cC5zb3VyY2UsIG9wdHMsIHRoaXMuYXZhaWxhYmxlQ29sdW1ucywgZ3JvdXBzQ29udGFpbmVyc1tpbmRleF0pXHJcbiAgICAgICAgICAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzR3JvdXBzKG9ubHlQb3NpdGlvbiA/ICwgZHJhZ2dlZFRpbGUgPyApIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIGdyb3VwLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBncm91cFxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDb250YWluZXJXaWR0aCgpOiBhbnkge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLiRjb250YWluZXIgfHwgJCgnYm9keScpO1xyXG4gICAgICByZXR1cm4gY29udGFpbmVyLndpZHRoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBdmFpbGFibGVDb2x1bW5zKGF2YWlsYWJsZVdpZHRoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0cy5tb2JpbGVCcmVha3BvaW50ID4gYXZhaWxhYmxlV2lkdGggPyBTSU1QTEVfTEFZT1VUX0NPTFVNTlNfQ09VTlQgOlxyXG4gICAgICAgIE1hdGguZmxvb3IoYXZhaWxhYmxlV2lkdGggLyAodGhpcy5vcHRzLnRpbGVXaWR0aCArIHRoaXMub3B0cy5ndXR0ZXIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEFjdGl2ZUdyb3VwQW5kVGlsZShlbGVtKTogYW55IHtcclxuICAgICAgY29uc3QgYWN0aXZlID0ge307XHJcblxyXG4gICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICBjb25zdCBmb3VuZFRpbGUgPSBncm91cC5nZXRUaWxlQnlOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICBpZiAoZm91bmRUaWxlKSB7XHJcbiAgICAgICAgICBhY3RpdmVbJ2dyb3VwJ10gPSBncm91cDtcclxuICAgICAgICAgIGFjdGl2ZVsndGlsZSddID0gZm91bmRUaWxlO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gYWN0aXZlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKGF2YWlsYWJsZVdpZHRoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0cy5tb2JpbGVCcmVha3BvaW50ID4gYXZhaWxhYmxlV2lkdGggPyBhdmFpbGFibGVXaWR0aCAvIDIgLSB0aGlzLm9wdHMuZ3V0dGVyIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ1N0YXJ0TGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgYWN0aXZlRW50aXRpZXMgPSB0aGlzLmdldEFjdGl2ZUdyb3VwQW5kVGlsZShldmVudC50YXJnZXQpO1xyXG5cclxuICAgICAgdGhpcy5jb250YWluZXIgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50KCcucGlwLWRyYWdnYWJsZS1ncm91cCcpLmdldCgwKTtcclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZSA9IGFjdGl2ZUVudGl0aWVzWyd0aWxlJ107XHJcbiAgICAgIHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwID0gYWN0aXZlRW50aXRpZXNbJ2dyb3VwJ107XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdkcmFnLXRyYW5zZmVyJyk7XHJcblxyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlLnN0YXJ0RHJhZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnTW92ZUxpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgY29uc3QgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5zdHlsZS5sZWZ0KSB8fCAwKSArIGV2ZW50LmR4O1xyXG4gICAgICBjb25zdCB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LnN0eWxlLnRvcCkgfHwgMCkgKyBldmVudC5keTtcclxuXHJcbiAgICAgIHRoaXMuY29udGFpbmVyT2Zmc2V0ID0gdGhpcy5nZXRDb250YWluZXJPZmZzZXQoKTtcclxuXHJcbiAgICAgIHRhcmdldC5zdHlsZS5sZWZ0ID0geCArICdweCc7IC8vIFRPRE8gW2FwaWRoaXJueWldIEV4dHJhY3QgdW5pdHMgaW50byBvcHRpb25zIHNlY3Rpb25cclxuICAgICAgdGFyZ2V0LnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG5cclxuICAgICAgY29uc3QgYmVsb3dFbGVtZW50ID0gdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAuZ2V0VGlsZUJ5Q29vcmRpbmF0ZXMoe1xyXG4gICAgICAgIGxlZnQ6IGV2ZW50LnBhZ2VYIC0gdGhpcy5jb250YWluZXJPZmZzZXQubGVmdCxcclxuICAgICAgICB0b3A6IGV2ZW50LnBhZ2VZIC0gdGhpcy5jb250YWluZXJPZmZzZXQudG9wXHJcbiAgICAgIH0sIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG5cclxuICAgICAgaWYgKGJlbG93RWxlbWVudCkge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnZWRUaWxlSW5kZXggPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cC5nZXRUaWxlSW5kZXgodGhpcy5kcmFnZ2VkVGlsZSk7XHJcbiAgICAgICAgY29uc3QgYmVsb3dFbGVtSW5kZXggPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cC5nZXRUaWxlSW5kZXgoYmVsb3dFbGVtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKChkcmFnZ2VkVGlsZUluZGV4ICsgMSkgPT09IGJlbG93RWxlbUluZGV4KSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cFxyXG4gICAgICAgICAgLnN3YXBUaWxlcyh0aGlzLmRyYWdnZWRUaWxlLCBiZWxvd0VsZW1lbnQpXHJcbiAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKHRydWUsIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG5cclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2V0R3JvdXBDb250YWluZXJzSGVpZ2h0KCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ0VuZExpc3RlbmVyKCkge1xyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlLnN0b3BEcmFnKHRoaXMuaXNTYW1lRHJvcHpvbmUpO1xyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnZHJhZy10cmFuc2ZlcicpO1xyXG4gICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCA9IG51bGw7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q29udGFpbmVyT2Zmc2V0KCkge1xyXG4gICAgICBjb25zdCBjb250YWluZXJSZWN0ID0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGxlZnQ6IGNvbnRhaW5lclJlY3QubGVmdCxcclxuICAgICAgICB0b3A6IGNvbnRhaW5lclJlY3QudG9wXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRHcm91cENvbnRhaW5lcnNIZWlnaHQoKSB7XHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKCh0aWxlR3JvdXApID0+IHtcclxuICAgICAgICB0aWxlR3JvdXAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1vdmVUaWxlKGZyb20sIHRvLCB0aWxlKSB7XHJcbiAgICAgIGxldCBlbGVtO1xyXG4gICAgICBjb25zdCBtb3ZlZFRpbGUgPSBmcm9tLnJlbW92ZVRpbGUodGlsZSk7XHJcbiAgICAgIGNvbnN0IHRpbGVTY29wZSA9IHRoaXMuY3JlYXRlVGlsZVNjb3BlKHRpbGUpO1xyXG5cclxuICAgICAgJCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbXy5maW5kSW5kZXgodGhpcy50aWxlR3JvdXBzLCBmcm9tKV0pXHJcbiAgICAgICAgLmZpbmQobW92ZWRUaWxlLmdldEVsZW0oKSlcclxuICAgICAgICAucmVtb3ZlKCk7XHJcblxyXG4gICAgICBpZiAodG8gIT09IG51bGwpIHtcclxuICAgICAgICB0by5hZGRUaWxlKG1vdmVkVGlsZSk7XHJcblxyXG4gICAgICAgIGVsZW0gPSB0aGlzLiRjb21waWxlKG1vdmVkVGlsZS5nZXRFbGVtKCkpKHRpbGVTY29wZSk7XHJcblxyXG4gICAgICAgICQodGhpcy5ncm91cHNDb250YWluZXJzW18uZmluZEluZGV4KHRoaXMudGlsZUdyb3VwcywgdG8pXSlcclxuICAgICAgICAgIC5hcHBlbmQoZWxlbSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQodG8uc2V0VGlsZXNEaW1lbnNpb25zLmJpbmQodG8sIHRydWUpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy51cGRhdGVUaWxlc1RlbXBsYXRlcygnbW92ZVRpbGUnLCB7XHJcbiAgICAgICAgZnJvbTogZnJvbSxcclxuICAgICAgICB0bzogdG8sXHJcbiAgICAgICAgdGlsZTogbW92ZWRUaWxlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZHJvcHBlZEdyb3VwSW5kZXggPSBldmVudC50YXJnZXQuYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlO1xyXG4gICAgICBjb25zdCBkcm9wcGVkR3JvdXAgPSB0aGlzLnRpbGVHcm91cHNbZHJvcHBlZEdyb3VwSW5kZXhdO1xyXG5cclxuICAgICAgaWYgKHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwICE9PSBkcm9wcGVkR3JvdXApIHtcclxuICAgICAgICB0aGlzLm1vdmVUaWxlKHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLCBkcm9wcGVkR3JvdXAsIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKHRydWUpO1xyXG4gICAgICB0aGlzLnNvdXJjZURyb3Bab25lRWxlbSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyb3BUb0ZpY3RHcm91cExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cDtcclxuICAgICAgY29uc3QgdGlsZSA9IHRoaXMuZHJhZ2dlZFRpbGU7XHJcblxyXG4gICAgICB0aGlzLmFkZEdyb3VwKHtcclxuICAgICAgICB0aXRsZTogJ05ldyBncm91cCcsXHJcbiAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVGlsZShmcm9tLCB0aGlzLnRpbGVHcm91cHNbdGhpcy50aWxlR3JvdXBzLmxlbmd0aCAtIDFdLCB0aWxlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKHRydWUpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcEVudGVyTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgaWYgKCF0aGlzLnNvdXJjZURyb3Bab25lRWxlbSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc291cmNlRHJvcFpvbmVFbGVtICE9PSBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyKSB7XHJcbiAgICAgICAgZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlci5jbGFzc0xpc3QuYWRkKCdkcm9wem9uZS1hY3RpdmUnKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnY29weScpO1xyXG4gICAgICAgIHRoaXMuaXNTYW1lRHJvcHpvbmUgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgICAgdGhpcy5pc1NhbWVEcm9wem9uZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBpZiAodGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gIT09IGV2ZW50LnRhcmdldCkge1xyXG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMub3B0cy5hY3RpdmVEcm9wem9uZUNsYXNzKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5vcHRzLmFjdGl2ZURyb3B6b25lQ2xhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVXaWR0aCA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkdGgoKTtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZUNvbHVtbnMgPSB0aGlzLmdldEF2YWlsYWJsZUNvbHVtbnModGhpcy5hdmFpbGFibGVXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdHMuZ3JvdXBDb250YW5pbmVyU2VsZWN0b3IpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3VwcyA9IHRoaXMuaW5pdFRpbGVzR3JvdXBzKHRoaXMuZ3JvdXBzLCB0aGlzLm9wdHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVycyk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5kcmFnZ2FibGUoe1xyXG4gICAgICAgICAgICAvLyBlbmFibGUgYXV0b1Njcm9sbFxyXG4gICAgICAgICAgICBhdXRvU2Nyb2xsOiB0cnVlLFxyXG4gICAgICAgICAgICBvbnN0YXJ0OiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0TGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9ubW92ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZW5kOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0VuZExpc3RlbmVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS1ncm91cC5maWN0LWdyb3VwJylcclxuICAgICAgICAgIC5kcm9wem9uZSh7XHJcbiAgICAgICAgICAgIG9uZHJvcDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BUb0ZpY3RHcm91cExpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyYWdlbnRlcjogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BFbnRlckxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyb3BkZWFjdGl2YXRlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnbGVhdmU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wTGVhdmVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLWdyb3VwJylcclxuICAgICAgICAgIC5kcm9wem9uZSh7XHJcbiAgICAgICAgICAgIG9uZHJvcDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnZW50ZXI6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BEZWFjdGl2YXRlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJhZ2xlYXZlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRjb250YWluZXJcclxuICAgICAgICAgIC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAnbWQtbWVudSAubWQtaWNvbi1idXR0b24nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJykuZHJhZ2dhYmxlKGZhbHNlKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5vbignbW91c2V1cCB0b3VjaGVuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKS5kcmFnZ2FibGUodHJ1ZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgY29uc3QgRHJhZ0NvbXBvbmVudDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICB0aWxlc1RlbXBsYXRlczogJz1waXBUaWxlc1RlbXBsYXRlcycsXHJcbiAgICAgIHRpbGVzQ29udGV4dDogJz1waXBUaWxlc0NvbnRleHQnLFxyXG4gICAgICBvcHRpb25zOiAnPXBpcERyYWdnYWJsZUdyaWQnLFxyXG4gICAgICBncm91cE1lbnVBY3Rpb25zOiAnPXBpcEdyb3VwTWVudUFjdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICdkcmFnZ2FibGUvRHJhZ2dhYmxlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogRHJhZ2dhYmxlQ29udHJvbGxlclxyXG4gIH1cclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ3BpcERyYWdnZWQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRHJhZ2dhYmxlR3JpZCcsIERyYWdDb21wb25lbnQpO1xyXG59IiwiZXhwb3J0IGludGVyZmFjZSBEcmFnVGlsZUNvbnN0cnVjdG9yIHtcclxuICBuZXcgKG9wdGlvbnM6IGFueSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBJRHJhZ1RpbGVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3RvcjogRHJhZ1RpbGVDb25zdHJ1Y3Rvciwgb3B0aW9uczogYW55KTogSURyYWdUaWxlU2VydmljZSB7XHJcbiAgcmV0dXJuIG5ldyBjb25zdHJ1Y3RvcihvcHRpb25zKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICB0cGw6IGFueTtcclxuICBvcHRzOiBhbnk7XHJcbiAgc2l6ZTogYW55O1xyXG4gIGVsZW06IGFueTtcclxuICBwcmV2aWV3OiBhbnk7XHJcbiAgZ2V0U2l6ZSgpOiBhbnk7XHJcbiAgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTogYW55O1xyXG4gIHNldFBvc2l0aW9uKGxlZnQsIHRvcCk6IGFueTtcclxuICBnZXRDb21waWxlZFRlbXBsYXRlKCk6IGFueTtcclxuICB1cGRhdGVFbGVtKHBhcmVudCk6IGFueTtcclxuICBnZXRFbGVtKCk6IGFueTtcclxuICBzdGFydERyYWcoKTogYW55O1xyXG4gIHN0b3BEcmFnKGlzQW5pbWF0ZSk6IGFueTtcclxuICBzZXRQcmV2aWV3UG9zaXRpb24oY29vcmRzKTogdm9pZDtcclxuICBnZXRPcHRpb25zKCk6IGFueTtcclxuICBzZXRPcHRpb25zKG9wdGlvbnMpOiBhbnk7XHJcbn1cclxuXHJcbmxldCBERUZBVUxUX1RJTEVfU0laRSA9IHtcclxuICBjb2xTcGFuOiAxLFxyXG4gIHJvd1NwYW46IDFcclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBEcmFnVGlsZVNlcnZpY2UgaW1wbGVtZW50cyBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICBwdWJsaWMgdHBsOiBhbnk7XHJcbiAgcHVibGljIG9wdHM6IGFueTtcclxuICBwdWJsaWMgc2l6ZTogYW55O1xyXG4gIHB1YmxpYyBlbGVtOiBhbnk7XHJcbiAgcHVibGljIHByZXZpZXc6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnM6IGFueSkge1xyXG4gICAgdGhpcy50cGwgPSBvcHRpb25zLnRwbC5nZXQoMCk7XHJcbiAgICB0aGlzLm9wdHMgPSBvcHRpb25zO1xyXG4gICAgdGhpcy5zaXplID0gXy5tZXJnZSh7fSwgREVGQVVMVF9USUxFX1NJWkUsIG9wdGlvbnMuc2l6ZSk7XHJcbiAgICB0aGlzLmVsZW0gPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFNpemUoKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnNpemU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTogYW55IHtcclxuICAgIHRoaXMuc2l6ZS53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5zaXplLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICBpZiAodGhpcy5lbGVtKSB7XHJcbiAgICAgIHRoaXMuZWxlbS5jc3Moe1xyXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcclxuICAgICAgICBoZWlnaHQ6IGhlaWdodFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRQb3NpdGlvbihsZWZ0LCB0b3ApOiBhbnkge1xyXG4gICAgdGhpcy5zaXplLmxlZnQgPSBsZWZ0O1xyXG4gICAgdGhpcy5zaXplLnRvcCA9IHRvcDtcclxuXHJcbiAgICBpZiAodGhpcy5lbGVtKSB7XHJcbiAgICAgIHRoaXMuZWxlbS5jc3Moe1xyXG4gICAgICAgIGxlZnQ6IGxlZnQsXHJcbiAgICAgICAgdG9wOiB0b3BcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q29tcGlsZWRUZW1wbGF0ZSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMudHBsO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVFbGVtKHBhcmVudCk6IGFueSB7XHJcbiAgICB0aGlzLmVsZW0gPSAkKHRoaXMudHBsKS5wYXJlbnQocGFyZW50KTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0RWxlbSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbS5nZXQoMCk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhZygpOiBhbnkge1xyXG4gICAgdGhpcy5wcmV2aWV3ID0gJCgnPGRpdj4nKVxyXG4gICAgICAuYWRkQ2xhc3MoJ3BpcC1kcmFnZ2VkLXByZXZpZXcnKVxyXG4gICAgICAuY3NzKHtcclxuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICBsZWZ0OiB0aGlzLmVsZW0uY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgdG9wOiB0aGlzLmVsZW0uY3NzKCd0b3AnKSxcclxuICAgICAgICB3aWR0aDogdGhpcy5lbGVtLmNzcygnd2lkdGgnKSxcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuZWxlbS5jc3MoJ2hlaWdodCcpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbVxyXG4gICAgICAuYWRkQ2xhc3MoJ25vLWFuaW1hdGlvbicpXHJcbiAgICAgIC5jc3Moe1xyXG4gICAgICAgIHpJbmRleDogJzk5OTknXHJcbiAgICAgIH0pXHJcbiAgICAgIC5hZnRlcih0aGlzLnByZXZpZXcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzdG9wRHJhZyhpc0FuaW1hdGUpOiBhbnkge1xyXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgIGlmIChpc0FuaW1hdGUpIHtcclxuICAgICAgdGhpcy5lbGVtXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCduby1hbmltYXRpb24nKVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgbGVmdDogdGhpcy5wcmV2aWV3LmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgdG9wOiB0aGlzLnByZXZpZXcuY3NzKCd0b3AnKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm9uKCd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuZWxlbVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgbGVmdDogc2VsZi5wcmV2aWV3LmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgdG9wOiBzZWxmLnByZXZpZXcuY3NzKCd0b3AnKSxcclxuICAgICAgICAgIHpJbmRleDogJydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnbm8tYW5pbWF0aW9uJyk7XHJcblxyXG4gICAgICBzZWxmLnByZXZpZXcucmVtb3ZlKCk7XHJcbiAgICAgIHNlbGYucHJldmlldyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgZnVuY3Rpb24gb25UcmFuc2l0aW9uRW5kKCkge1xyXG4gICAgICBpZiAoc2VsZi5wcmV2aWV3KSB7XHJcbiAgICAgICAgc2VsZi5wcmV2aWV3LnJlbW92ZSgpO1xyXG4gICAgICAgIHNlbGYucHJldmlldyA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYuZWxlbVxyXG4gICAgICAgIC5jc3MoJ3pJbmRleCcsICcnKVxyXG4gICAgICAgIC5vZmYoJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRQcmV2aWV3UG9zaXRpb24oY29vcmRzKSB7XHJcbiAgICB0aGlzLnByZXZpZXcuY3NzKGNvb3Jkcyk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldE9wdGlvbnMoKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLm9wdHMub3B0aW9ucztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc2V0T3B0aW9ucyhvcHRpb25zKTogYW55IHtcclxuICAgIF8ubWVyZ2UodGhpcy5vcHRzLm9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgXy5tZXJnZSh0aGlzLnNpemUsIG9wdGlvbnMuc2l6ZSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcERyYWdnZWQnKVxyXG4gIC5zZXJ2aWNlKCdwaXBEcmFnVGlsZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICBsZXQgbmV3VGlsZSA9IG5ldyBEcmFnVGlsZVNlcnZpY2Uob3B0aW9ucyk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3VGlsZTtcclxuICAgIH1cclxuICB9KTsiLCJ7XHJcbiAgaW50ZXJmYWNlIERyYWdnYWJsZVRpbGVBdHRyaWJ1dGVzIGV4dGVuZHMgbmcuSUF0dHJpYnV0ZXMge1xyXG4gICAgcGlwRHJhZ2dhYmxlVGlsZXM6IGFueTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIERyYWdnYWJsZVRpbGVMaW5rKFxyXG4gICAgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAkZWxlbTogSlF1ZXJ5LFxyXG4gICAgJGF0dHI6IERyYWdnYWJsZVRpbGVBdHRyaWJ1dGVzXHJcbiAgKSB7XHJcbiAgICBjb25zdCBkb2NGcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxyXG4gICAgICBncm91cCA9ICRzY29wZS4kZXZhbCgkYXR0ci5waXBEcmFnZ2FibGVUaWxlcyk7XHJcblxyXG4gICAgZ3JvdXAuZm9yRWFjaChmdW5jdGlvbiAodGlsZSkge1xyXG4gICAgICBjb25zdCB0cGwgPSB3cmFwQ29tcG9uZW50KHRpbGUuZ2V0Q29tcGlsZWRUZW1wbGF0ZSgpKTtcclxuICAgICAgZG9jRnJhZy5hcHBlbmRDaGlsZCh0cGwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJGVsZW0uYXBwZW5kKGRvY0ZyYWcpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHdyYXBDb21wb25lbnQoZWxlbSkge1xyXG4gICAgICByZXR1cm4gJCgnPGRpdj4nKVxyXG4gICAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAuYXBwZW5kKGVsZW0pXHJcbiAgICAgICAgLmdldCgwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIERyYWdnYWJsZVRpbGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICBsaW5rOiBEcmFnZ2FibGVUaWxlTGlua1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERyYWdnZWQnKVxyXG4gICAgLmRpcmVjdGl2ZSgncGlwRHJhZ2dhYmxlVGlsZXMnLCBEcmFnZ2FibGVUaWxlKTtcclxuXHJcbn0iLCJleHBvcnQgaW50ZXJmYWNlIFRpbGVzR3JpZENvbnN0cnVjdG9yIHtcclxuICBuZXcodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSVRpbGVzR3JpZENvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBUaWxlc0dyaWRDb25zdHJ1Y3RvciwgdGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pOiBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgcmV0dXJuIG5ldyBjb25zdHJ1Y3Rvcih0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVRpbGVzR3JpZFNlcnZpY2Uge1xyXG4gIHRpbGVzOiBhbnk7XHJcbiAgb3B0czogYW55O1xyXG4gIGNvbHVtbnM6IGFueTtcclxuICBlbGVtOiBhbnk7XHJcbiAgZ3JpZENlbGxzOiBhbnk7XHJcbiAgaW5saW5lOiBib29sZWFuO1xyXG4gIGlzTW9iaWxlTGF5b3V0OiBib29sZWFuO1xyXG5cclxuICBhZGRUaWxlKHRpbGUpOiBhbnk7XHJcbiAgZ2V0Q2VsbEJ5UG9zaXRpb24ocm93LCBjb2wpOiBhbnk7XHJcbiAgZ2V0Q2VsbHMocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55O1xyXG4gIGdldENlbGwoc3JjLCBiYXNpY1JvdywgYmFzaWNDb2wsIGNvbHVtbnMpOiBhbnk7XHJcbiAgZ2V0QXZhaWxhYmxlQ2VsbHNNb2JpbGUocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0QmFzaWNSb3cocHJldkNlbGwpOiBhbnk7XHJcbiAgaXNDZWxsRnJlZShyb3csIGNvbCk6IGFueTtcclxuICBnZXRDZWxsSW5kZXgoc3JjQ2VsbCk6IGFueTtcclxuICByZXNlcnZlQ2VsbHMoc3RhcnQsIGVuZCwgZWxlbSk6IHZvaWQ7XHJcbiAgY2xlYXJFbGVtZW50cygpOiB2b2lkO1xyXG4gIHNldEF2YWlsYWJsZUNvbHVtbnMoY29sdW1ucyk6IGFueTtcclxuICBnZW5lcmF0ZUdyaWQoc2luZ2xlVGlsZVdpZHRoID8gKTogYW55O1xyXG4gIHNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGNhbGNDb250YWluZXJIZWlnaHQoKTogYW55O1xyXG4gIGdldFRpbGVCeU5vZGUobm9kZSk6IGFueTtcclxuICBnZXRUaWxlQnlDb29yZGluYXRlcyhjb29yZHMsIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGdldFRpbGVJbmRleCh0aWxlKTogYW55O1xyXG4gIHN3YXBUaWxlcyhtb3ZlZFRpbGUsIGJlZm9yZVRpbGUpOiBhbnk7XHJcbiAgcmVtb3ZlVGlsZShyZW1vdmVUaWxlKTogYW55O1xyXG4gIHVwZGF0ZVRpbGVPcHRpb25zKG9wdHMpOiBhbnk7XHJcbn1cclxuXHJcbmNvbnN0IE1PQklMRV9MQVlPVVRfQ09MVU1OUyA9IDI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGlsZXNHcmlkU2VydmljZSBpbXBsZW1lbnRzIElUaWxlc0dyaWRTZXJ2aWNlIHtcclxuICBwdWJsaWMgdGlsZXM6IGFueTtcclxuICBwdWJsaWMgb3B0czogYW55O1xyXG4gIHB1YmxpYyBjb2x1bW5zOiBhbnk7XHJcbiAgcHVibGljIGVsZW06IGFueTtcclxuICBwdWJsaWMgZ3JpZENlbGxzOiBhbnkgPSBbXTtcclxuICBwdWJsaWMgaW5saW5lOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzTW9iaWxlTGF5b3V0OiBib29sZWFuO1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSkge1xyXG4gICAgdGhpcy50aWxlcyA9IHRpbGVzO1xyXG4gICAgdGhpcy5vcHRzID0gb3B0aW9ucztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnMgfHwgMDsgLy8gYXZhaWxhYmxlIGNvbHVtbnMgaW4gYSByb3dcclxuICAgIHRoaXMuZWxlbSA9IGVsZW07XHJcbiAgICB0aGlzLmdyaWRDZWxscyA9IFtdO1xyXG4gICAgdGhpcy5pbmxpbmUgPSBvcHRpb25zLmlubGluZSB8fCBmYWxzZTtcclxuICAgIHRoaXMuaXNNb2JpbGVMYXlvdXQgPSBjb2x1bW5zID09PSBNT0JJTEVfTEFZT1VUX0NPTFVNTlM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkVGlsZSh0aWxlKTogYW55IHtcclxuICAgIHRoaXMudGlsZXMucHVzaCh0aWxlKTtcclxuICAgIGlmICh0aGlzLnRpbGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICB0aGlzLmdlbmVyYXRlR3JpZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsQnlQb3NpdGlvbihyb3csIGNvbCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkQ2VsbHNbcm93XVtjb2xdO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxscyhwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueSB7XHJcbiAgICBpZiAodGhpcy5pc01vYmlsZUxheW91dCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnkge1xyXG4gICAgbGV0IGxlZnRDb3JuZXJDZWxsO1xyXG4gICAgbGV0IHJpZ2h0Q29ybmVyQ2VsbDtcclxuICAgIGNvbnN0IGJhc2ljQ29sID0gcHJldkNlbGwgJiYgcHJldkNlbGwuY29sIHx8IDA7XHJcbiAgICBjb25zdCBiYXNpY1JvdyA9IHRoaXMuZ2V0QmFzaWNSb3cocHJldkNlbGwpO1xyXG5cclxuICAgIC8vIFNtYWxsIHRpbGVcclxuICAgIGlmIChjb2xTcGFuID09PSAxICYmIHJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgY29uc3QgZ3JpZENvcHkgPSB0aGlzLmdyaWRDZWxscy5zbGljZSgpO1xyXG5cclxuICAgICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gZ3JpZENvcHlbMF1bMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93LCBiYXNpY0NvbCwgdGhpcy5jb2x1bW5zKTtcclxuXHJcbiAgICAgICAgaWYgKCFsZWZ0Q29ybmVyQ2VsbCkge1xyXG4gICAgICAgICAgY29uc3Qgcm93U2hpZnQgPSB0aGlzLmlzTW9iaWxlTGF5b3V0ID8gMSA6IDI7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3cgKyByb3dTaGlmdCwgMCwgdGhpcy5jb2x1bW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNZWRpdW0gdGlsZVxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDIgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBjb25zdCBwcmV2VGlsZVNpemUgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5lbGVtLnNpemUgfHwgbnVsbDtcclxuXHJcbiAgICAgIGlmICghcHJldlRpbGVTaXplKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMikge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDIgPiAwKSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAocHJldlRpbGVTaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldlRpbGVTaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAocHJldkNlbGwucm93ICUgMiA9PT0gMCkge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgLSAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMSAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuaXNDZWxsRnJlZShiYXNpY1JvdywgYmFzaWNDb2wgKyAxKSkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJpZyB0aWxlXHJcbiAgICBpZiAoIXByZXZDZWxsICYmIHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sICsgMSk7XHJcbiAgICB9IGVsc2UgaWYgKHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBpZiAodGhpcy5jb2x1bW5zIC0gYmFzaWNDb2wgLSAyID4gMCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ2VsbEZyZWUoYmFzaWNSb3csIGJhc2ljQ29sICsgMSkpIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgKyAzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDMsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueSB7XHJcbiAgICBsZXQgY2VsbCwgY29sLCByb3c7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNNb2JpbGVMYXlvdXQpIHtcclxuICAgICAgLy8gbW9iaWxlIGxheW91dFxyXG4gICAgICBmb3IgKGNvbCA9IGJhc2ljQ29sOyBjb2wgPCBjb2x1bW5zOyBjb2wrKykge1xyXG4gICAgICAgIGlmICghc3JjW2Jhc2ljUm93XVtjb2xdLmVsZW0pIHtcclxuICAgICAgICAgIGNlbGwgPSBzcmNbYmFzaWNSb3ddW2NvbF07XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjZWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlc2t0b3BcclxuICAgIGZvciAoY29sID0gYmFzaWNDb2w7IGNvbCA8IGNvbHVtbnM7IGNvbCsrKSB7XHJcbiAgICAgIGZvciAocm93ID0gMDsgcm93IDwgMjsgcm93KyspIHtcclxuICAgICAgICBpZiAoIXNyY1tyb3cgKyBiYXNpY1Jvd11bY29sXS5lbGVtKSB7XHJcbiAgICAgICAgICBjZWxsID0gc3JjW3JvdyArIGJhc2ljUm93XVtjb2xdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2VsbCkge1xyXG4gICAgICAgIHJldHVybiBjZWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEF2YWlsYWJsZUNlbGxzTW9iaWxlKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55IHtcclxuICAgIGxldCBsZWZ0Q29ybmVyQ2VsbDtcclxuICAgIGxldCByaWdodENvcm5lckNlbGw7XHJcbiAgICBjb25zdCBiYXNpY1JvdyA9IHRoaXMuZ2V0QmFzaWNSb3cocHJldkNlbGwpO1xyXG4gICAgY29uc3QgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuXHJcblxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDEgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBjb25zdCBncmlkQ29weSA9IHRoaXMuZ3JpZENlbGxzLnNsaWNlKCk7XHJcblxyXG4gICAgICBpZiAoIXByZXZDZWxsKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSBncmlkQ29weVswXVswXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3csIGJhc2ljQ29sLCB0aGlzLmNvbHVtbnMpO1xyXG5cclxuICAgICAgICBpZiAoIWxlZnRDb3JuZXJDZWxsKSB7XHJcbiAgICAgICAgICBjb25zdCByb3dTaGlmdCA9IHRoaXMuaXNNb2JpbGVMYXlvdXQgPyAxIDogMjtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdyArIHJvd1NoaWZ0LCAwLCB0aGlzLmNvbHVtbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghcHJldkNlbGwpIHtcclxuICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCAwKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIHJvd1NwYW4gLSAxLCAxKTtcclxuICAgIH0gZWxzZSBpZiAoY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCAwKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIHJvd1NwYW4sIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXJ0OiBsZWZ0Q29ybmVyQ2VsbCxcclxuICAgICAgZW5kOiByaWdodENvcm5lckNlbGxcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEJhc2ljUm93KHByZXZDZWxsKTogYW55IHtcclxuICAgIGxldCBiYXNpY1JvdztcclxuXHJcbiAgICBpZiAodGhpcy5pc01vYmlsZUxheW91dCkge1xyXG4gICAgICBpZiAocHJldkNlbGwpIHtcclxuICAgICAgICBiYXNpY1JvdyA9IHByZXZDZWxsICYmIHByZXZDZWxsLnJvdyB8fCAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2ljUm93ID0gMDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHByZXZDZWxsKSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSBwcmV2Q2VsbC5yb3cgJSAyID09PSAwID8gcHJldkNlbGwucm93IDogcHJldkNlbGwucm93IC0gMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBiYXNpY1JvdyA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYmFzaWNSb3c7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGlzQ2VsbEZyZWUocm93LCBjb2wpOiBhbnkge1xyXG4gICAgcmV0dXJuICF0aGlzLmdyaWRDZWxsc1tyb3ddW2NvbF0uZWxlbTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbEluZGV4KHNyY0NlbGwpOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgaW5kZXg7XHJcblxyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xyXG4gICAgICBpbmRleCA9IF8uZmluZEluZGV4KHNlbGYuZ3JpZENlbGxzW3Jvd0luZGV4XSwgKGNlbGwpID0+IHtcclxuICAgICAgICByZXR1cm4gY2VsbCA9PT0gc3JjQ2VsbDtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gaW5kZXggIT09IC0xID8gaW5kZXggOiAwO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyByZXNlcnZlQ2VsbHMoc3RhcnQsIGVuZCwgZWxlbSkge1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgIHJvdy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgaWYgKGNlbGwucm93ID49IHN0YXJ0LnJvdyAmJiBjZWxsLnJvdyA8PSBlbmQucm93ICYmXHJcbiAgICAgICAgICBjZWxsLmNvbCA+PSBzdGFydC5jb2wgJiYgY2VsbC5jb2wgPD0gZW5kLmNvbCkge1xyXG4gICAgICAgICAgY2VsbC5lbGVtID0gZWxlbTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNsZWFyRWxlbWVudHMoKSB7XHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgcm93LmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICB0aWxlLmVsZW0gPSBudWxsO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRBdmFpbGFibGVDb2x1bW5zKGNvbHVtbnMpOiBhbnkge1xyXG4gICAgdGhpcy5pc01vYmlsZUxheW91dCA9IGNvbHVtbnMgPT09IE1PQklMRV9MQVlPVVRfQ09MVU1OUztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnM7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGggPyApOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICB0aWxlV2lkdGggPSBzaW5nbGVUaWxlV2lkdGggfHwgdGhpcy5vcHRzLnRpbGVXaWR0aCxcclxuICAgICAgICAgIG9mZnNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5waXAtZHJhZ2dhYmxlLWdyb3VwLXRpdGxlJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgICBjb2xzSW5Sb3cgPSAwLFxyXG4gICAgICAgICAgcm93cyA9IDAsXHJcbiAgICAgICAgICBncmlkSW5Sb3cgPSBbXTtcclxuXHJcbiAgICB0aGlzLmdyaWRDZWxscyA9IFtdO1xyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSwgaW5kZXgsIHNyY1RpbGVzKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcblxyXG4gICAgICBnZW5lcmF0ZUNlbGxzKHRpbGVTaXplLmNvbFNwYW4pO1xyXG5cclxuICAgICAgaWYgKHNyY1RpbGVzLmxlbmd0aCA9PT0gaW5kZXggKyAxKSB7XHJcbiAgICAgICAgaWYgKGNvbHNJblJvdyA8IHNlbGYuY29sdW1ucykge1xyXG4gICAgICAgICAgZ2VuZXJhdGVDZWxscyhzZWxmLmNvbHVtbnMgLSBjb2xzSW5Sb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgbW9yZSBjZWxscyBmb3IgZXh0ZW5kcyB0aWxlIHNpemUgdG8gYmlnXHJcbiAgICAgICAgaWYgKHNlbGYudGlsZXMubGVuZ3RoICogMiA+IHNlbGYuZ3JpZENlbGxzLmxlbmd0aCkge1xyXG4gICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkoc2VsZi50aWxlcy5sZW5ndGggKiAyIC0gc2VsZi5ncmlkQ2VsbHMubGVuZ3RoKSkuZm9yRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGdlbmVyYXRlQ2VsbHMoc2VsZi5jb2x1bW5zKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDZWxscyhuZXdDZWxsQ291bnQpIHtcclxuICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkobmV3Q2VsbENvdW50KSkuZm9yRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHNlbGYuY29sdW1ucyA8IGNvbHNJblJvdyArIDEpIHtcclxuICAgICAgICAgIHJvd3MrKztcclxuICAgICAgICAgIGNvbHNJblJvdyA9IDA7XHJcblxyXG4gICAgICAgICAgc2VsZi5ncmlkQ2VsbHMucHVzaChncmlkSW5Sb3cpO1xyXG4gICAgICAgICAgZ3JpZEluUm93ID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdG9wID0gcm93cyAqIHNlbGYub3B0cy50aWxlSGVpZ2h0ICsgKHJvd3MgPyByb3dzICogc2VsZi5vcHRzLmd1dHRlciA6IDApICsgb2Zmc2V0LmhlaWdodDtcclxuICAgICAgICBsZXQgbGVmdCA9IGNvbHNJblJvdyAqIHRpbGVXaWR0aCArIChjb2xzSW5Sb3cgPyBjb2xzSW5Sb3cgKiBzZWxmLm9wdHMuZ3V0dGVyIDogMCk7XHJcblxyXG4gICAgICAgIC8vIERlc2NyaWJlIGdyaWQgY2VsbCBzaXplIHRocm91Z2ggYmxvY2sgY29ybmVycyBjb29yZGluYXRlc1xyXG4gICAgICAgIGdyaWRJblJvdy5wdXNoKHtcclxuICAgICAgICAgIHRvcDogdG9wLFxyXG4gICAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICAgIGJvdHRvbTogdG9wICsgc2VsZi5vcHRzLnRpbGVIZWlnaHQsXHJcbiAgICAgICAgICByaWdodDogbGVmdCArIHRpbGVXaWR0aCxcclxuICAgICAgICAgIHJvdzogcm93cyxcclxuICAgICAgICAgIGNvbDogY29sc0luUm93XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbHNJblJvdysrO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc2V0VGlsZXNEaW1lbnNpb25zKG9ubHlQb3NpdGlvbiwgZHJhZ2dlZFRpbGUpOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgY3VyckluZGV4ID0gMDtcclxuICAgIGxldCBwcmV2Q2VsbDtcclxuXHJcbiAgICBpZiAob25seVBvc2l0aW9uKSB7XHJcbiAgICAgIHNlbGYuY2xlYXJFbGVtZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGUuZ2V0U2l6ZSgpO1xyXG4gICAgICBsZXQgc3RhcnRDZWxsO1xyXG4gICAgICBsZXQgd2lkdGg7XHJcbiAgICAgIGxldCBoZWlnaHQ7XHJcbiAgICAgIGxldCBjZWxscztcclxuXHJcbiAgICAgIHRpbGUudXBkYXRlRWxlbSgnLnBpcC1kcmFnZ2FibGUtdGlsZScpO1xyXG4gICAgICBpZiAodGlsZVNpemUuY29sU3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmIChwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5lbGVtLnNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2Q2VsbC5lbGVtLnNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgICAgc3RhcnRDZWxsID0gc2VsZi5nZXRDZWxscyhzZWxmLmdldENlbGxCeVBvc2l0aW9uKHByZXZDZWxsLnJvdywgcHJldkNlbGwuY29sIC0gMSksIDEsIDEpLnN0YXJ0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzdGFydENlbGwgPSBzZWxmLmdldENlbGxzKHByZXZDZWxsLCAxLCAxKS5zdGFydDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgd2lkdGggPSBzdGFydENlbGwucmlnaHQgLSBzdGFydENlbGwubGVmdDtcclxuICAgICAgICAgIGhlaWdodCA9IHN0YXJ0Q2VsbC5ib3R0b20gLSBzdGFydENlbGwudG9wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldkNlbGwgPSBzdGFydENlbGw7XHJcblxyXG4gICAgICAgIHNlbGYucmVzZXJ2ZUNlbGxzKHN0YXJ0Q2VsbCwgc3RhcnRDZWxsLCB0aWxlKTtcclxuXHJcbiAgICAgICAgY3VyckluZGV4Kys7XHJcbiAgICAgIH0gZWxzZSBpZiAodGlsZVNpemUuY29sU3BhbiA9PT0gMikge1xyXG4gICAgICAgIGNlbGxzID0gc2VsZi5nZXRDZWxscyhwcmV2Q2VsbCwgdGlsZVNpemUucm93U3BhbiwgdGlsZVNpemUuY29sU3Bhbik7XHJcbiAgICAgICAgc3RhcnRDZWxsID0gY2VsbHMuc3RhcnQ7XHJcblxyXG4gICAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgICB3aWR0aCA9IGNlbGxzLmVuZC5yaWdodCAtIGNlbGxzLnN0YXJ0LmxlZnQ7XHJcbiAgICAgICAgICBoZWlnaHQgPSBjZWxscy5lbmQuYm90dG9tIC0gY2VsbHMuc3RhcnQudG9wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldkNlbGwgPSBjZWxscy5lbmQ7XHJcblxyXG4gICAgICAgIHNlbGYucmVzZXJ2ZUNlbGxzKGNlbGxzLnN0YXJ0LCBjZWxscy5lbmQsIHRpbGUpO1xyXG5cclxuICAgICAgICBjdXJySW5kZXggKz0gMjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVuZGVyIHByZXZpZXdcclxuICAgICAgLy8gd2hpbGUgdGlsZXMgZnJvbSBncm91cCBpcyBkcmFnZ2VkXHJcbiAgICAgIGlmIChkcmFnZ2VkVGlsZSA9PT0gdGlsZSkge1xyXG4gICAgICAgIHRpbGUuc2V0UHJldmlld1Bvc2l0aW9uKHtcclxuICAgICAgICAgIGxlZnQ6IHN0YXJ0Q2VsbC5sZWZ0LFxyXG4gICAgICAgICAgdG9wOiBzdGFydENlbGwudG9wXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICB0aWxlLnNldFNpemUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRpbGUuc2V0UG9zaXRpb24oc3RhcnRDZWxsLmxlZnQsIHN0YXJ0Q2VsbC50b3ApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNhbGNDb250YWluZXJIZWlnaHQoKTogYW55IHtcclxuICAgIGxldCBtYXhIZWlnaHRTaXplLCBtYXhXaWR0aFNpemU7XHJcblxyXG4gICAgaWYgKCF0aGlzLnRpbGVzLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBtYXhIZWlnaHRTaXplID0gXy5tYXhCeSh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGVbJ2dldFNpemUnXSgpO1xyXG4gICAgICByZXR1cm4gdGlsZVNpemUudG9wICsgdGlsZVNpemUuaGVpZ2h0O1xyXG4gICAgfSlbJ2dldFNpemUnXSgpO1xyXG5cclxuICAgIHRoaXMuZWxlbS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHRTaXplLnRvcCArIG1heEhlaWdodFNpemUuaGVpZ2h0ICsgJ3B4JztcclxuXHJcbiAgICBpZiAodGhpcy5pbmxpbmUpIHtcclxuICAgICAgbWF4V2lkdGhTaXplID0gXy5tYXhCeSh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgICAgcmV0dXJuIHRpbGVTaXplLmxlZnQgKyB0aWxlU2l6ZS53aWR0aDtcclxuICAgICAgfSlbJ2dldFNpemUnXSgpO1xyXG5cclxuICAgICAgdGhpcy5lbGVtLnN0eWxlLndpZHRoID0gbWF4V2lkdGhTaXplLmxlZnQgKyBtYXhXaWR0aFNpemUud2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlQnlOb2RlKG5vZGUpOiBhbnkge1xyXG4gICAgY29uc3QgZm91bmRUaWxlID0gdGhpcy50aWxlcy5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgcmV0dXJuIG5vZGUgPT09IHRpbGUuZ2V0RWxlbSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGZvdW5kVGlsZS5sZW5ndGggPyBmb3VuZFRpbGVbMF0gOiBudWxsO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlQnlDb29yZGluYXRlcyhjb29yZHMsIGRyYWdnZWRUaWxlKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnRpbGVzXHJcbiAgICAgIC5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGUuZ2V0U2l6ZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGlsZSAhPT0gZHJhZ2dlZFRpbGUgJiZcclxuICAgICAgICAgIHRpbGVTaXplLmxlZnQgPD0gY29vcmRzLmxlZnQgJiYgY29vcmRzLmxlZnQgPD0gKHRpbGVTaXplLmxlZnQgKyB0aWxlU2l6ZS53aWR0aCkgJiZcclxuICAgICAgICAgIHRpbGVTaXplLnRvcCA8PSBjb29yZHMudG9wICYmIGNvb3Jkcy50b3AgPD0gKHRpbGVTaXplLnRvcCArIHRpbGVTaXplLmhlaWdodCk7XHJcbiAgICAgIH0pWzBdIHx8IG51bGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldFRpbGVJbmRleCh0aWxlKTogYW55IHtcclxuICAgIHJldHVybiBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCB0aWxlKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3dhcFRpbGVzKG1vdmVkVGlsZSwgYmVmb3JlVGlsZSk6IGFueSB7XHJcbiAgICBjb25zdCBtb3ZlZFRpbGVJbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsIG1vdmVkVGlsZSk7XHJcbiAgICBjb25zdCBiZWZvcmVUaWxlSW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCBiZWZvcmVUaWxlKTtcclxuXHJcbiAgICB0aGlzLnRpbGVzLnNwbGljZShtb3ZlZFRpbGVJbmRleCwgMSk7XHJcbiAgICB0aGlzLnRpbGVzLnNwbGljZShiZWZvcmVUaWxlSW5kZXgsIDAsIG1vdmVkVGlsZSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHJlbW92ZVRpbGUocmVtb3ZlVGlsZSk6IGFueSB7XHJcbiAgICBsZXQgZHJvcHBlZFRpbGU7XHJcblxyXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlLCBpbmRleCwgdGlsZXMpID0+IHtcclxuICAgICAgaWYgKHRpbGUgPT09IHJlbW92ZVRpbGUpIHtcclxuICAgICAgICBkcm9wcGVkVGlsZSA9IHRpbGVzLnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZHJvcHBlZFRpbGU7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHVwZGF0ZVRpbGVPcHRpb25zKG9wdHMpOiBhbnkge1xyXG4gICAgY29uc3QgaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICByZXR1cm4gdGlsZVsnZ2V0T3B0aW9ucyddKCkgPT09IG9wdHM7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgIHRoaXMudGlsZXNbaW5kZXhdLnNldE9wdGlvbnMob3B0cyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgLnNlcnZpY2UoJ3BpcFRpbGVzR3JpZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pIHtcclxuICAgICAgbGV0IG5ld0dyaWQgPSBuZXcgVGlsZXNHcmlkU2VydmljZSh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3R3JpZDtcclxuICAgIH1cclxuICB9KTsiLCJleHBvcnQgaW50ZXJmYWNlIElXaWRnZXRUZW1wbGF0ZVNlcnZpY2Uge1xyXG4gICAgZ2V0VGVtcGxhdGUoc291cmNlLCB0cGwgPyAsIHRpbGVTY29wZSA/ICwgc3RyaWN0Q29tcGlsZSA/ICk6IGFueTtcclxuICAgIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSk6IHZvaWQ7XHJcbn0gXHJcblxyXG57XHJcbiAgICBjbGFzcyB3aWRnZXRUZW1wbGF0ZVNlcnZpY2UgaW1wbGVtZW50cyBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlIHtcclxuICAgICAgICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICAgICAgICBwcml2YXRlIF8kY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XHJcbiAgICAgICAgcHJpdmF0ZSBfJHRlbXBsYXRlUmVxdWVzdDogYW5ndWxhci5JVGVtcGxhdGVSZXF1ZXN0U2VydmljZTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgICRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXHJcbiAgICAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5fJGludGVycG9sYXRlID0gJGludGVycG9sYXRlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgICAgICAgICB0aGlzLl8kdGVtcGxhdGVSZXF1ZXN0ID0gJHRlbXBsYXRlUmVxdWVzdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55IHtcclxuICAgICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgICAgIHR5cGVcclxuICAgICAgICAgICAgfSA9IHNvdXJjZTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnBvbGF0ZWQgPSB0cGwgPyB0aGlzLl8kaW50ZXJwb2xhdGUodHBsKShzb3VyY2UpIDogdGhpcy5fJGludGVycG9sYXRlKHRlbXBsYXRlKShzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmljdENvbXBpbGUgPT0gdHJ1ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkpIDpcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKHRlbXBsYXRlKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVVcmwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyR0ZW1wbGF0ZVJlcXVlc3QodGVtcGxhdGVVcmwsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaHRtbCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGh0bWwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGxldFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGggPSAkZWxlbWVudC53aWR0aCA/ICRlbGVtZW50LndpZHRoKCkgOiAkZWxlbWVudC5jbGllbnRXaWR0aCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRlbGVtZW50LmhlaWdodCA/ICRlbGVtZW50LmhlaWdodCgpIDogJGVsZW1lbnQuY2xpZW50SGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxXaWR0aCA6IGltYWdlLm5hdHVyYWxXaWR0aCkgfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBpbWFnZUhlaWdodCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlV2lkdGggLyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lckhlaWdodCAtIGNvbnRhaW5lcldpZHRoKSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGltYWdlV2lkdGggKiBjb250YWluZXJIZWlnaHQgLyBpbWFnZUhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlSGVpZ2h0IC8gaW1hZ2VXaWR0aCAqIGNvbnRhaW5lcldpZHRoIC0gY29udGFpbmVySGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWyd3aWR0aCddID0gJycgKyBjb250YWluZXJXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQoaW1hZ2UpLmNzcyhjc3NQYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbWFnZSBsb2FkIGRpcmVjdGl2ZSBUT0RPOiByZW1vdmUgdG8gcGlwSW1hZ2VVdGlsc1xyXG4gICAgY29uc3QgSW1hZ2VMb2FkID0gZnVuY3Rpb24gSW1hZ2VMb2FkKCRwYXJzZTogbmcuSVBhcnNlU2VydmljZSk6IG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnBpcEltYWdlTG9hZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdsb2FkJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcGUsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAgICAgLnNlcnZpY2UoJ3BpcFdpZGdldFRlbXBsYXRlJywgd2lkZ2V0VGVtcGxhdGVTZXJ2aWNlKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3BpcEltYWdlTG9hZCcsIEltYWdlTG9hZCk7XHJcbn0iLCJleHBvcnQgaW50ZXJmYWNlIElEYXNoYm9hcmRXaWRnZXQge1xyXG4gICAgb3B0aW9uczogYW55O1xyXG4gICAgY29sb3I6IHN0cmluZztcclxuICAgIHNpemU6IE9iamVjdCB8IHN0cmluZyB8IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIERhc2hib2FyZFdpZGdldCBpbXBsZW1lbnRzIElEYXNoYm9hcmRXaWRnZXQge1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBjb2xvcjogc3RyaW5nO1xyXG4gICAgcHVibGljIHNpemU6IE9iamVjdCB8IHN0cmluZyB8IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG59IiwiYW5ndWxhci5tb2R1bGUoJ3BpcFdpZGdldCcsIFtdKTtcclxuXHJcbmltcG9ydCAnLi9jYWxlbmRhci9XaWRnZXRDYWxlbmRhcic7XHJcbmltcG9ydCAnLi9ldmVudC9XaWRnZXRFdmVudCc7XHJcbmltcG9ydCAnLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0ICcuL21lbnUvV2lkZ2V0TWVudURpcmVjdGl2ZSc7XHJcbmltcG9ydCAnLi9ub3Rlcy9XaWRnZXROb3Rlcyc7XHJcbmltcG9ydCAnLi9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbic7XHJcbmltcG9ydCAnLi9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MnO1xyXG5pbXBvcnQgJy4vcGljdHVyZV9zbGlkZXIvV2lkZ2V0UGljdHVyZVNsaWRlcic7XHJcbiIsImltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbntcclxuICBjbGFzcyBDYWxlbmRhcldpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpcy5vcHRpb25zLm1lbnUgPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpIDogdGhpcy5tZW51O1xyXG4gICAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSB0aGlzLm9wdGlvbnMuZGF0ZSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLm9wdGlvbnMuY29sb3IgfHwgJ2JsdWUnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLnBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICAgICAgc2l6ZTogdGhpcy5vcHRpb25zLnNpemUsXHJcbiAgICAgICAgICBkYXRlOiB0aGlzLm9wdGlvbnMuZGF0ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvY2FsZW5kYXIvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGNvbnN0IENhbGVuZGFyV2lkZ2V0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucycsXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogQ2FsZW5kYXJXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL2NhbGVuZGFyL1dpZGdldENhbGVuZGFyLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwQ2FsZW5kYXJXaWRnZXQnLCBDYWxlbmRhcldpZGdldCk7XHJcblxyXG59IiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnOyBcclxue1xyXG4gIGNsYXNzIEV2ZW50V2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICAgIHByaXZhdGUgX29sZE9wYWNpdHk6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgb3BhY2l0eTogbnVtYmVyID0gMC41NztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWVudSkgdGhpcy5tZW51ID0gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmNvbG9yID0gdGhpcy5vcHRpb25zLmNvbG9yIHx8ICdncmF5JztcclxuICAgICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5vcHRpb25zLm9wYWNpdHkgfHwgdGhpcy5vcGFjaXR5O1xyXG5cclxuICAgICAgdGhpcy5kcmF3SW1hZ2UoKTtcclxuXHJcbiAgICAgIC8vIFRPRE8gaXQgZG9lc24ndCB3b3JrXHJcbiAgICAgICRzY29wZS4kd2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTtcclxuICAgICAgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZHJhd0ltYWdlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhd0ltYWdlKCkge1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmltYWdlKSB7XHJcbiAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uSW1hZ2VMb2FkKHRoaXMuJGVsZW1lbnQuZmluZCgnaW1nJykpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICAgIHRoaXMuX29sZE9wYWNpdHkgPSBfLmNsb25lKHRoaXMub3BhY2l0eSk7XHJcbiAgICAgIHRoaXMucGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZS5zaG93KHtcclxuICAgICAgICBkaWFsb2dDbGFzczogJ3BpcC1jYWxlbmRhci1jb25maWcnLFxyXG4gICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgICAgICBzaXplOiB0aGlzLm9wdGlvbnMuc2l6ZSB8fCB7XHJcbiAgICAgICAgICAgIGNvbFNwYW46IDEsXHJcbiAgICAgICAgICAgIHJvd1NwYW46IDFcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkYXRlOiB0aGlzLm9wdGlvbnMuZGF0ZSxcclxuICAgICAgICAgIHRpdGxlOiB0aGlzLm9wdGlvbnMudGl0bGUsXHJcbiAgICAgICAgICB0ZXh0OiB0aGlzLm9wdGlvbnMudGV4dCxcclxuICAgICAgICAgIG9wYWNpdHk6IHRoaXMub3BhY2l0eSxcclxuICAgICAgICAgIG9uT3BhY2l0eXRlc3Q6IChvcGFjaXR5KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBleHRlbnNpb25Vcmw6ICd3aWRnZXRzL2V2ZW50L0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuZGF0ZSA9IHJlc3VsdC5kYXRlO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50aXRsZSA9IHJlc3VsdC50aXRsZTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudGV4dCA9IHJlc3VsdC50ZXh0O1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vcGFjaXR5ID0gcmVzdWx0Lm9wYWNpdHk7XHJcbiAgICAgIH0sICgpID0+IHtcclxuICAgICAgICB0aGlzLm9wYWNpdHkgPSB0aGlzLl9vbGRPcGFjaXR5O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uSW1hZ2VMb2FkKGltYWdlKSB7XHJcbiAgICAgIHRoaXMuc2V0SW1hZ2VNYXJnaW5DU1ModGhpcy4kZWxlbWVudC5wYXJlbnQoKSwgaW1hZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbWFnZSkge1xyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLiRlbGVtZW50LnBhcmVudCgpLCB0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGF0ZXIgcmVwbGFjZSBieSBwaXBJbWFnZVV0aWxzIHNldmljZSdzIGZ1bmN0aW9uXHJcbiAgICBwcml2YXRlIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSkge1xyXG4gICAgICBsZXRcclxuICAgICAgICBjb250YWluZXJXaWR0aCA9ICRlbGVtZW50LndpZHRoID8gJGVsZW1lbnQud2lkdGgoKSA6ICRlbGVtZW50LmNsaWVudFdpZHRoLCAvLyB8fCA4MCxcclxuICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkZWxlbWVudC5oZWlnaHQgPyAkZWxlbWVudC5oZWlnaHQoKSA6ICRlbGVtZW50LmNsaWVudEhlaWdodCwgLy8gfHwgODAsXHJcbiAgICAgICAgaW1hZ2VXaWR0aCA9IGltYWdlWzBdLm5hdHVyYWxXaWR0aCB8fCBpbWFnZS53aWR0aCxcclxuICAgICAgICBpbWFnZUhlaWdodCA9IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgfHwgaW1hZ2UuaGVpZ2h0LFxyXG4gICAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgICAgY3NzUGFyYW1zID0ge307XHJcblxyXG4gICAgICBpZiAoKGltYWdlV2lkdGggLyBjb250YWluZXJXaWR0aCkgPiAoaW1hZ2VIZWlnaHQgLyBjb250YWluZXJIZWlnaHQpKSB7XHJcbiAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VXaWR0aCAvIGltYWdlSGVpZ2h0ICogY29udGFpbmVySGVpZ2h0IC0gY29udGFpbmVyV2lkdGgpIC8gMik7XHJcbiAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snaGVpZ2h0J10gPSAnJyArIGNvbnRhaW5lckhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgaW1hZ2VXaWR0aCAqIGNvbnRhaW5lckhlaWdodCAvIGltYWdlSGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtYXJnaW4gPSAtKChpbWFnZUhlaWdodCAvIGltYWdlV2lkdGggKiBjb250YWluZXJXaWR0aCAtIGNvbnRhaW5lckhlaWdodCkgLyAyKTtcclxuICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi10b3AnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgY29udGFpbmVyV2lkdGggKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi1sZWZ0J10gPSAnJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaW1hZ2UuY3NzKGNzc1BhcmFtcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgY29uc3QgRXZlbnRXaWRnZXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IEV2ZW50V2lkZ2V0Q29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5jb21wb25lbnQoJ3BpcEV2ZW50V2lkZ2V0JywgRXZlbnRXaWRnZXQpO1xyXG59IiwiKCgpID0+IHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBNZW51V2lkZ2V0JywgcGlwTWVudVdpZGdldCk7XHJcblxyXG4gIGZ1bmN0aW9uIHBpcE1lbnVXaWRnZXQoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdCAgICAgICAgOiAnRUEnLFxyXG4gICAgICB0ZW1wbGF0ZVVybCAgICAgOiAnd2lkZ2V0cy9tZW51L1dpZGdldE1lbnUuaHRtbCdcclxuICAgIH07XHJcbiAgfVxyXG59KSgpO1xyXG4iLCJpbXBvcnQgeyBEYXNoYm9hcmRXaWRnZXQgfSBmcm9tICcuLi9XaWRnZXRDbGFzcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTWVudVdpZGdldFNlcnZpY2UgZXh0ZW5kcyBEYXNoYm9hcmRXaWRnZXQge1xyXG4gIHB1YmxpYyBtZW51OiBhbnkgPSBbe1xyXG4gICAgdGl0bGU6ICdDaGFuZ2UgU2l6ZScsXHJcbiAgICBhY3Rpb246IGFuZ3VsYXIubm9vcCxcclxuICAgIHN1Ym1lbnU6IFt7XHJcbiAgICAgICAgdGl0bGU6ICcxIHggMScsXHJcbiAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICBzaXplWDogMSxcclxuICAgICAgICAgIHNpemVZOiAxXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICcyIHggMScsXHJcbiAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICBzaXplWDogMixcclxuICAgICAgICAgIHNpemVZOiAxXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICcyIHggMicsXHJcbiAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICBzaXplWDogMixcclxuICAgICAgICAgIHNpemVZOiAyXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfV07XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FsbEFjdGlvbihhY3Rpb25OYW1lLCBwYXJhbXMsIGl0ZW0pIHtcclxuICAgIGlmICh0aGlzW2FjdGlvbk5hbWVdKSB7XHJcbiAgICAgIHRoaXNbYWN0aW9uTmFtZV0uY2FsbCh0aGlzLCBwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpdGVtWydjbGljayddKSB7XHJcbiAgICAgIGl0ZW1bJ2NsaWNrJ10uY2FsbChpdGVtLCBwYXJhbXMsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgIHRoaXMub3B0aW9ucy5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcbiAgfTtcclxufVxyXG5cclxue1xyXG4gIGNsYXNzIE1lbnVXaWRnZXRQcm92aWRlciB7XHJcbiAgICBwcml2YXRlIF9zZXJ2aWNlOiBNZW51V2lkZ2V0U2VydmljZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gICAgcHVibGljICRnZXQoKSB7XHJcbiAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9zZXJ2aWNlID09IG51bGwpXHJcbiAgICAgICAgdGhpcy5fc2VydmljZSA9IG5ldyBNZW51V2lkZ2V0U2VydmljZSgpO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuX3NlcnZpY2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLnByb3ZpZGVyKCdwaXBXaWRnZXRNZW51JywgTWVudVdpZGdldFByb3ZpZGVyKTtcclxufSIsImltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbntcclxuICBjbGFzcyBOb3Rlc1dpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMubWVudSA9IHRoaXMub3B0aW9ucy5tZW51ID8gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KSA6IHRoaXMubWVudTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmNvbG9yID0gdGhpcy5vcHRpb25zLmNvbG9yIHx8ICdvcmFuZ2UnO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Db25maWdDbGljaygpIHtcclxuICAgICAgdGhpcy5waXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlLnNob3coe1xyXG4gICAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLWNhbGVuZGFyLWNvbmZpZycsXHJcbiAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgdGl0bGU6IHRoaXMub3B0aW9ucy50aXRsZSxcclxuICAgICAgICAgIHRleHQ6IHRoaXMub3B0aW9ucy50ZXh0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXh0ZW5zaW9uVXJsOiAnd2lkZ2V0cy9ub3Rlcy9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTaXplKHJlc3VsdC5zaXplKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudGV4dCA9IHJlc3VsdC50ZXh0O1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50aXRsZSA9IHJlc3VsdC50aXRsZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBOb3Rlc1dpZGdldDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogTm90ZXNXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL25vdGVzL1dpZGdldE5vdGVzLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwTm90ZXNXaWRnZXQnLCBOb3Rlc1dpZGdldCk7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQge1xyXG4gIE1lbnVXaWRnZXRTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudS9XaWRnZXRNZW51U2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVdpZGdldENvbmZpZ1NlcnZpY2VcclxufSBmcm9tICcuLi8uLi9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVdpZGdldFRlbXBsYXRlU2VydmljZVxyXG59IGZyb20gJy4uLy4uL3V0aWxpdHkvV2lkZ2V0VGVtcGxhdGVVdGlsaXR5JztcclxuXHJcbntcclxuICBjbGFzcyBQaWN0dXJlU2xpZGVyQ29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICAgIHB1YmxpYyBhbmltYXRpb25UeXBlOiBzdHJpbmcgPSAnZmFkaW5nJztcclxuICAgIHB1YmxpYyBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyID0gNTAwMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICBwcml2YXRlICRlbGVtZW50OiBhbnksXHJcbiAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvblR5cGUgPSB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uVHlwZSB8fCB0aGlzLmFuaW1hdGlvblR5cGU7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25JbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5hbmltYXRpb25JbnRlcnZhbCB8fCB0aGlzLmFuaW1hdGlvbkludGVydmFsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uSW1hZ2VMb2FkKCRldmVudCkge1xyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnBpcFdpZGdldFRlbXBsYXRlLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuJGVsZW1lbnQucGFyZW50KCksICRldmVudC50YXJnZXQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpLCAoaW1hZ2UpID0+IHtcclxuICAgICAgICAgIHRoaXMucGlwV2lkZ2V0VGVtcGxhdGUuc2V0SW1hZ2VNYXJnaW5DU1ModGhpcy4kZWxlbWVudC5wYXJlbnQoKSwgaW1hZ2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgUGljdHVyZVNsaWRlcldpZGdldDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogUGljdHVyZVNsaWRlckNvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3dpZGdldHMvcGljdHVyZV9zbGlkZXIvV2lkZ2V0UGljdHVyZVNsaWRlci5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5jb21wb25lbnQoJ3BpcFBpY3R1cmVTbGlkZXJXaWRnZXQnLCBQaWN0dXJlU2xpZGVyV2lkZ2V0KTtcclxufSIsImltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbntcclxuICBjbGFzcyBQb3NpdGlvbldpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgICBwdWJsaWMgc2hvd1Bvc2l0aW9uOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFueSxcclxuICAgICAgcHJpdmF0ZSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBMb2NhdGlvbkVkaXREaWFsb2c6IGFueSxcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWVudSkgdGhpcy5tZW51ID0gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLm1lbnUucHVzaCh7XHJcbiAgICAgICAgdGl0bGU6ICdDaGFuZ2UgbG9jYXRpb24nLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9wZW5Mb2NhdGlvbkVkaXREaWFsb2coKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uID0gdGhpcy5vcHRpb25zLmxvY2F0aW9uIHx8IHRoaXMub3B0aW9ucy5wb3NpdGlvbjtcclxuXHJcbiAgICAgICRzY29wZS4kd2F0Y2goJ3dpZGdldEN0cmwub3B0aW9ucy5sb2NhdGlvbicsICgpID0+IHtcclxuICAgICAgICB0aGlzLnJlRHJhd1Bvc2l0aW9uKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gVE9ETyBpdCBkb2Vzbid0IHdvcmtcclxuICAgICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICRlbGVtZW50LmlzKCc6dmlzaWJsZScpO1xyXG4gICAgICB9LCAobmV3VmFsKSA9PiB7XHJcbiAgICAgICAgaWYgKG5ld1ZhbCA9PSB0cnVlKSB0aGlzLnJlRHJhd1Bvc2l0aW9uKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Db25maWdDbGljaygpIHtcclxuICAgICAgdGhpcy5waXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlLnNob3coe1xyXG4gICAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLXBvc2l0aW9uLWNvbmZpZycsXHJcbiAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICBzaXplOiB0aGlzLm9wdGlvbnMuc2l6ZSxcclxuICAgICAgICAgIGxvY2F0aW9uTmFtZTogdGhpcy5vcHRpb25zLmxvY2F0aW9uTmFtZSxcclxuICAgICAgICAgIGhpZGVDb2xvcnM6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBleHRlbnNpb25Vcmw6ICd3aWRnZXRzL3Bvc2l0aW9uL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5sb2NhdGlvbk5hbWUgPSByZXN1bHQubG9jYXRpb25OYW1lO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICAgIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3BlbkxvY2F0aW9uRWRpdERpYWxvZygpIHtcclxuICAgICAgdGhpcy5waXBMb2NhdGlvbkVkaXREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgbG9jYXRpb25OYW1lOiB0aGlzLm9wdGlvbnMubG9jYXRpb25OYW1lLFxyXG4gICAgICAgIGxvY2F0aW9uUG9zOiB0aGlzLm9wdGlvbnMubG9jYXRpb25cclxuICAgICAgfSwgKG5ld1Bvc2l0aW9uKSA9PiB7XHJcbiAgICAgICAgaWYgKG5ld1Bvc2l0aW9uKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMubG9jYXRpb24gPSBuZXdQb3NpdGlvbi5sb2NhdGlvbjtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5sb2NhdGlvbk5hbWUgPSBuZXdQb3NpdGlvbi5sb2NhdGlvTmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVEcmF3UG9zaXRpb24oKSB7XHJcbiAgICAgIHRoaXMuc2hvd1Bvc2l0aW9uID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2hvd1Bvc2l0aW9uID0gdHJ1ZTtcclxuICAgICAgfSwgNTApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIGNvbnN0IFBvc2l0aW9uV2lkZ2V0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucycsXHJcbiAgICAgIGluZGV4OiAnPScsXHJcbiAgICAgIGdyb3VwOiAnPSdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBQb3NpdGlvbldpZGdldENvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3dpZGdldHMvcG9zaXRpb24vV2lkZ2V0UG9zaXRpb24uaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBQb3NpdGlvbldpZGdldCcsIFBvc2l0aW9uV2lkZ2V0KTtcclxufSIsImltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuXHJcbntcclxuICBjb25zdCBTTUFMTF9DSEFSVDogbnVtYmVyID0gNzA7XHJcbiAgY29uc3QgQklHX0NIQVJUOiBudW1iZXIgPSAyNTA7XHJcblxyXG4gIGNsYXNzIFN0YXRpc3RpY3NXaWRnZXRDb250cm9sbGVyIGV4dGVuZHMgTWVudVdpZGdldFNlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICAgIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuXHJcbiAgICBwdWJsaWMgcmVzZXQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBjaGFydFNpemU6IG51bWJlciA9IFNNQUxMX0NIQVJUO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwaXBXaWRnZXRNZW51OiBhbnksXHJcbiAgICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMuXyRzY29wZSA9ICRzY29wZTtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQgPSAkdGltZW91dDtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm1lbnUgPSB0aGlzLm9wdGlvbnMubWVudSA/IF8udW5pb24odGhpcy5tZW51LCB0aGlzLm9wdGlvbnMubWVudSkgOiB0aGlzLm1lbnU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc2V0Q2hhcnRTaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcblxyXG4gICAgICB0aGlzLnJlc2V0ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5zZXRDaGFydFNpemUoKTtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVzZXQgPSBmYWxzZTtcclxuICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldENoYXJ0U2l6ZSgpIHtcclxuICAgICAgdGhpcy5jaGFydFNpemUgPSB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyID8gQklHX0NIQVJUIDogU01BTExfQ0hBUlQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgY29uc3QgU3RhdGlzdGljc1dpZGdldDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogU3RhdGlzdGljc1dpZGdldENvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3dpZGdldHMvc3RhdGlzdGljcy9XaWRnZXRTdGF0aXN0aWNzLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwU3RhdGlzdGljc1dpZGdldCcsIFN0YXRpc3RpY3NXaWRnZXQpO1xyXG59IiwiKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ0Rhc2hib2FyZC5odG1sJyxcbiAgICAnPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudCBtZC1yYWlzZWQgbWQtZmFiIGxheW91dC1jb2x1bW4gbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBhcmlhLWxhYmVsPVwiQWRkIGNvbXBvbmVudFwiXFxuJyArXG4gICAgJyAgICAgICAgICAgbmctY2xpY2s9XCIkY3RybC5hZGRDb21wb25lbnQoKVwiPlxcbicgK1xuICAgICcgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCIgY2xhc3M9XCJtZC1oZWFkbGluZSBjZW50ZXJlZC1hZGQtaWNvblwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnPC9tZC1idXR0b24+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncmlkLWhvbGRlclwiPlxcbicgK1xuICAgICcgIDxwaXAtZHJhZ2dhYmxlLWdyaWQgcGlwLXRpbGVzLXRlbXBsYXRlcz1cIiRjdHJsLmdyb3VwZWRXaWRnZXRzXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICAgIHBpcC10aWxlcy1jb250ZXh0PVwiJGN0cmwud2lkZ2V0c0NvbnRleHRcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICAgcGlwLWRyYWdnYWJsZS1ncmlkPVwiJGN0cmwuZHJhZ2dhYmxlR3JpZE9wdGlvbnNcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICAgcGlwLWdyb3VwLW1lbnUtYWN0aW9ucz1cIiRjdHJsLmdyb3VwTWVudUFjdGlvbnNcIj5cXG4nICtcbiAgICAnICA8L3BpcC1kcmFnZ2FibGUtZ3JpZD5cXG4nICtcbiAgICAnICBcXG4nICtcbiAgICAnICA8bWQtcHJvZ3Jlc3MtY2lyY3VsYXIgbWQtbW9kZT1cImluZGV0ZXJtaW5hdGVcIiBjbGFzcz1cInByb2dyZXNzLXJpbmdcIj48L21kLXByb2dyZXNzLWNpcmN1bGFyPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJycpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RyYWdnYWJsZS9EcmFnZ2FibGUuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWhvbGRlclwiPlxcbicgK1xuICAgICcgIDxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWdyb3VwXCIgXFxuJyArXG4gICAgJyAgICAgICBuZy1yZXBlYXQ9XCJncm91cCBpbiAkY3RybC5ncm91cHNcIiBcXG4nICtcbiAgICAnICAgICAgIGRhdGEtZ3JvdXAtaWQ9XCJ7eyAkaW5kZXggfX1cIiBcXG4nICtcbiAgICAnICAgICAgIHBpcC1kcmFnZ2FibGUtdGlsZXM9XCJncm91cC5zb3VyY2VcIj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWdyb3VwLXRpdGxlIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlclwiPlxcbicgK1xuICAgICcgICAgICA8ZGl2IGNsYXNzPVwidGl0bGUtaW5wdXQtY29udGFpbmVyXCIgbmctY2xpY2s9XCIkY3RybC5vblRpdGxlQ2xpY2soZ3JvdXAsICRldmVudClcIj5cXG4nICtcbiAgICAnICAgICAgICA8aW5wdXQgbmctaWY9XCJncm91cC5lZGl0aW5nTmFtZVwiIG5nLWJsdXI9XCIkY3RybC5vbkJsdXJUaXRsZUlucHV0KGdyb3VwKVwiIFxcbicgK1xuICAgICcgICAgICAgICAgICAgICBuZy1rZXlwcmVzcz1cIiRjdHJsLm9uS3llcHJlc3NUaXRsZUlucHV0KGdyb3VwLCAkZXZlbnQpXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgbmctbW9kZWw9XCJncm91cC50aXRsZVwiPlxcbicgK1xuICAgICcgICAgICAgIDwvaW5wdXQ+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtb3ZlcmZsb3cgZmxleC1ub25lXCIgbmctaWY9XCIhZ3JvdXAuZWRpdGluZ05hbWVcIj57eyBncm91cC50aXRsZSB9fTwvZGl2PlxcbicgK1xuICAgICcgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIFxcbicgK1xuICAgICcgICAgICAgIG5nLXNob3c9XCJncm91cC5lZGl0aW5nTmFtZVwiIG5nLWNsaWNrPVwiJGN0cmwuY2FuY2VsRWRpdGluZyhncm91cClcIlxcbicgK1xuICAgICcgICAgICAgIGFyaWEtbGFiZWw9XCJDYW5jZWxcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmNyb3NzXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgPG1kLW1lbnUgY2xhc3M9XCJmbGV4LW5vbmUgbGF5b3V0LWNvbHVtblwiIG1kLXBvc2l0aW9uLW1vZGU9XCJ0YXJnZXQtcmlnaHQgdGFyZ2V0XCIgbmctc2hvdz1cIiFncm91cC5lZGl0aW5nTmFtZVwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmUgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1jbGljaz1cIiRtZE9wZW5NZW51KCk7IGdyb3VwSWQgPSAkaW5kZXhcIiBhcmlhLWxhYmVsPVwiTWVudVwiPlxcbicgK1xuICAgICcgICAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpkb3RzXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1tZW51LWNvbnRlbnQgd2lkdGg9XCI0XCI+XFxuJyArXG4gICAgJyAgICAgICAgICA8bWQtbWVudS1pdGVtIG5nLXJlcGVhdD1cImFjdGlvbiBpbiAkY3RybC5ncm91cE1lbnVBY3Rpb25zXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCJhY3Rpb24uY2FsbGJhY2soZ3JvdXBJZClcIj57eyBhY3Rpb24udGl0bGUgfX08L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICAgIDwvbWQtbWVudS1pdGVtPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtbWVudS1jb250ZW50PlxcbicgK1xuICAgICcgICAgICA8L21kLW1lbnU+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgPGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXAgZmljdC1ncm91cCBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlciBsYXlvdXQtY29sdW1uIHRtMTZcIiA+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiZmljdC1ncm91cC10ZXh0LWNvbnRhaW5lclwiPlxcbicgK1xuICAgICcgICAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPnt7IFxcJ0RST1BfVE9fQ1JFQVRFX05FV19HUk9VUFxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC1hZGQtY29tcG9uZW50LWRpYWxvZ1wiPlxcbicgK1xuICAgICcgIDxtZC1kaWFsb2ctY29udGVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0aGVtZS1kaXZpZGVyIHAxNiBmbGV4LWF1dG9cIj5cXG4nICtcbiAgICAnICAgICAgPGgzIGNsYXNzPVwiaGlkZS14cyBtMCBibTE2IHRoZW1lLXRleHQtcHJpbWFyeVwiIGhpZGUteHM+e3sgXFwnREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1RJVExFXFwnIHwgdHJhbnNsYXRlIH19PC9oND5cXG4nICtcbiAgICAnICAgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cImxheW91dC1yb3cgZmxleC1hdXRvIG0wIHRtMTZcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtc2VsZWN0IGNsYXNzPVwiZmxleC1hdXRvIG0wIHRoZW1lLXRleHQtcHJpbWFyeVwiIG5nLW1vZGVsPVwiZGlhbG9nQ3RybC5hY3RpdmVHcm91cEluZGV4XCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwie3sgXFwnREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX0NSRUFURV9ORVdfR1JPVVBcXCcgfCB0cmFuc2xhdGUgfX1cIlxcbicgK1xuICAgICcgICAgICAgICAgICBhcmlhLWxhYmVsPVwiR3JvdXBcIj5cXG4nICtcbiAgICAnICAgICAgICAgIDxtZC1vcHRpb24gbmctdmFsdWU9XCIkaW5kZXhcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiBkaWFsb2dDdHJsLmdyb3Vwc1wiPnt7IGdyb3VwIH19PC9tZC1vcHRpb24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1zZWxlY3Q+XFxuJyArXG4gICAgJyAgICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwicGlwLWJvZHkgcGlwLXNjcm9sbCBwMCBmbGV4LWF1dG9cIj5cXG4nICtcbiAgICAnICAgICAgPHAgY2xhc3M9XCJtZC1ib2R5LTEgdGhlbWUtdGV4dC1zZWNvbmRhcnkgbTAgbHAxNiBycDE2XCIgPlxcbicgK1xuICAgICcgICAgICAgIHt7IFxcJ0RBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19VU0VfSE9UX0tFWVNcXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgICAgPC9wPlxcbicgK1xuICAgICcgICAgICA8bWQtbGlzdCBuZy1pbml0PVwiZ3JvdXBJbmRleCA9ICRpbmRleFwiIG5nLXJlcGVhdD1cImdyb3VwIGluIGRpYWxvZ0N0cmwuZGVmYXVsdFdpZGdldHNcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtbGlzdC1pdGVtIGNsYXNzPVwibGF5b3V0LXJvdyBwaXAtbGlzdC1pdGVtIGxwMTYgcnAxNlwiIG5nLXJlcGVhdD1cIml0ZW0gaW4gZ3JvdXBcIj5cXG4nICtcbiAgICAnICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uLWhvbGRlciBmbGV4LW5vbmVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp7ezo6IGl0ZW0uaWNvbiB9fVwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1iYWRnZSB0aGVtZS1iYWRnZSBtZC13YXJuXCIgbmctaWY9XCJpdGVtLmFtb3VudFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgIDxzcGFuPnt7IGl0ZW0uYW1vdW50IH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGV4LWF1dG8gbG0yNCB0aGVtZS10ZXh0LXByaW1hcnlcIj57ezo6IGl0ZW0udGl0bGUgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lXCIgbmctY2xpY2s9XCJkaWFsb2dDdHJsLmVuY3JlYXNlKGdyb3VwSW5kZXgsICRpbmRleClcIiBhcmlhLWxhYmVsPVwiRW5jcmVhc2VcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzLWNpcmNsZVwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5kZWNyZWFzZShncm91cEluZGV4LCAkaW5kZXgpXCIgYXJpYS1sYWJlbD1cIkRlY3JlYXNlXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bWludXMtY2lyY2xlXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1saXN0LWl0ZW0+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWRpdmlkZXIgY2xhc3M9XCJsbTcyIHRtOCBibThcIiBuZy1pZj1cImdyb3VwSW5kZXggIT09IChkaWFsb2dDdHJsLmRlZmF1bHRXaWRnZXRzLmxlbmd0aCAtIDEpXCI+PC9tZC1kaXZpZGVyPlxcbicgK1xuICAgICcgICAgICA8L21kLWxpc3Q+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICA8L21kLWRpYWxvZy1jb250ZW50PlxcbicgK1xuICAgICcgIDxtZC1kaWFsb2ctYWN0aW9ucyBjbGFzcz1cImZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciB0aGVtZS1kaXZpZGVyIGRpdmlkZXItdG9wIHRoZW1lLXRleHQtcHJpbWFyeVwiPlxcbicgK1xuICAgICcgICAgPG1kLWJ1dHRvbiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuY2FuY2VsKClcIiBhcmlhLWxhYmVsPVwiQ2FuY2VsXCI+e3sgXFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICA8bWQtYnV0dG9uIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5hZGQoKVwiIG5nLWRpc2FibGVkPVwiZGlhbG9nQ3RybC50b3RhbFdpZGdldHMgPT09IDBcIiBhcmlhbC1sYWJlbD1cIkFkZFwiPnt7IFxcJ0FERFxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgIDwvbWQtZGlhbG9nLWFjdGlvbnM+XFxuJyArXG4gICAgJzwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2cuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC13aWRnZXQtY29uZmlnLWRpYWxvZyB7eyB2bS5wYXJhbXMuZGlhbG9nQ2xhc3MgfX1cIiB3aWR0aD1cIjQwMFwiIG1kLXRoZW1lPVwie3t2bS50aGVtZX19XCI+XFxuJyArXG4gICAgJyAgICA8cGlwLXdpZGdldC1jb25maWctZXh0ZW5kLWNvbXBvbmVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIiBwaXAtZGlhbG9nLXNjb3BlPVwidm1cIiBwaXAtZXh0ZW5zaW9uLXVybD1cInZtLnBhcmFtcy5leHRlbnNpb25VcmxcIiBcXG4nICtcbiAgICAnICAgICAgICBwaXAtYXBwbHk9XCJ2bS5vbkFwcGx5KHVwZGF0ZWREYXRhKVwiPlxcbicgK1xuICAgICcgICAgPC9waXAtd2lkZ2V0LWNvbmZpZy1leHRlbmQtY29tcG9uZW50PlxcbicgK1xuICAgICc8L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50Lmh0bWwnLFxuICAgICc8aDMgY2xhc3M9XCJ0bTAgZmxleC1ub25lXCI+e3sgXFwnREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1RJVExFXFwnIHwgdHJhbnNsYXRlIH19PC9oMz5cXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1ib2R5IHBpcC1zY3JvbGwgcDE2IGJwMCBmbGV4LWF1dG9cIj5cXG4nICtcbiAgICAnICAgIDxwaXAtZXh0ZW5zaW9uLXBvaW50PjwvcGlwLWV4dGVuc2lvbi1wb2ludD5cXG4nICtcbiAgICAnICAgIDxwaXAtdG9nZ2xlLWJ1dHRvbnMgY2xhc3M9XCJibTE2XCIgbmctaWY9XCIhJGN0cmwuaGlkZVNpemVzXCIgcGlwLWJ1dHRvbnM9XCIkY3RybC5zaXplc1wiIG5nLW1vZGVsPVwiJGN0cmwuc2l6ZUlkXCI+XFxuJyArXG4gICAgJyAgICA8L3BpcC10b2dnbGUtYnV0dG9ucz5cXG4nICtcbiAgICAnICAgIDxwaXAtY29sb3ItcGlja2VyIG5nLWlmPVwiISRjdHJsLmhpZGVDb2xvcnNcIiBwaXAtY29sb3JzPVwiJGN0cmwuY29sb3JzXCIgbmctbW9kZWw9XCIkY3RybC5jb2xvclwiPlxcbicgK1xuICAgICcgICAgPC9waXAtY29sb3ItcGlja2VyPlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtZm9vdGVyIGZsZXgtbm9uZVwiPlxcbicgK1xuICAgICcgICAgPGRpdj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50XCIgbmctY2xpY2s9XCIkY3RybC5vbkNhbmNlbCgpXCI+e3sgXFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25BcHBseSgpXCI+e3sgXFwnQVBQTFlcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL2NhbGVuZGFyL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaCBibTE2XCI+XFxuJyArXG4gICAgJyAgICBEYXRlOlxcbicgK1xuICAgICcgICAgPG1kLWRhdGVwaWNrZXIgbmctbW9kZWw9XCIkY3RybC5kYXRlXCIgY2xhc3M9XCJ3LXN0cmV0Y2ggXCI+XFxuJyArXG4gICAgJyAgICA8L21kLWRhdGVwaWNrZXI+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1jYWxlbmRhci13aWRnZXQge3sgJGN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbCB0cDBcIlxcbicgK1xuICAgICcgICAgIG5nLWNsYXNzPVwieyBzbWFsbDogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLFxcbicgK1xuICAgICcgICAgICAgIG1lZGl1bTogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLFxcbicgK1xuICAgICcgICAgICAgIGJpZzogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIj5cXG4nICtcbiAgICAnICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIj5cXG4nICtcbiAgICAnICAgIDxwaXAtbWVudS13aWRnZXQ+PC9waXAtbWVudS13aWRnZXQ+XFxuJyArXG4gICAgJyAgPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiXFxuJyArXG4gICAgJyAgICAgICBuZy1pZj1cIiRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPlxcbicgK1xuICAgICcgICAgPHNwYW4gY2xhc3M9XCJkYXRlIGxtMjQgcm0xMlwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZS5nZXREYXRlKCkgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiZmxleC1hdXRvIGxheW91dC1jb2x1bW5cIj5cXG4nICtcbiAgICAnICAgICAgPHNwYW4gY2xhc3M9XCJ3ZWVrZGF5IG1kLWhlYWRsaW5lXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgPHNwYW4gY2xhc3M9XCJtb250aC15ZWFyIG1kLWhlYWRsaW5lXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ01vbnRoIH19IHt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdFllYXIgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgPGRpdiBjbGFzcz1cIndpZGdldC1jb250ZW50IGZsZXgtYXV0byBsYXlvdXQtY29sdW1uIGxheW91dC1hbGlnbi1zcGFjZS1hcm91bmQtY2VudGVyXCJcXG4nICtcbiAgICAnICAgICAgIG5nLWhpZGU9XCIkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDFcIj5cXG4nICtcbiAgICAnICAgIDxzcGFuIGNsYXNzPVwid2Vla2RheSBtZC1oZWFkbGluZVwiXFxuJyArXG4gICAgJyAgICAgICAgICBuZy1oaWRlPVwiJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgIDxzcGFuIGNsYXNzPVwid2Vla2RheVwiXFxuJyArXG4gICAgJyAgICAgICAgICBuZy1zaG93PVwiJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgIDxzcGFuIGNsYXNzPVwiZGF0ZSBsbTEyIHJtMTJcIj57eyAkY3RybC5vcHRpb25zLmRhdGUuZ2V0RGF0ZSgpIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgPHNwYW4gY2xhc3M9XCJtb250aC15ZWFyIG1kLWhlYWRsaW5lXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ01vbnRoIH19IHt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdFllYXIgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL2V2ZW50L0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPlxcbicgK1xuICAgICcgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCBibTBcIj5cXG4nICtcbiAgICAnICAgICAgICA8bGFiZWw+VGl0bGU6PC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLnRpdGxlXCIvPlxcbicgK1xuICAgICcgICAgPC9tZC1pbnB1dC1jb250YWluZXI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgRGF0ZTpcXG4nICtcbiAgICAnICAgIDxtZC1kYXRlcGlja2VyIG5nLW1vZGVsPVwiJGN0cmwuZGF0ZVwiIGNsYXNzPVwidy1zdHJldGNoIGJtOFwiPlxcbicgK1xuICAgICcgICAgPC9tZC1kYXRlcGlja2VyPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2hcIj5cXG4nICtcbiAgICAnICAgICAgICA8bGFiZWw+RGVzY3JpcHRpb246PC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8dGV4dGFyZWEgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLnRleHRcIi8+XFxuJyArXG4gICAgJyAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICBCYWNrZHJvcFxcJ3Mgb3BhY2l0eTpcXG4nICtcbiAgICAnICAgIDxtZC1zbGlkZXIgYXJpYS1sYWJlbD1cIm9wYWNpdHlcIiAgdHlwZT1cIm51bWJlclwiIG1pbj1cIjAuMVwiIG1heD1cIjAuOVwiIHN0ZXA9XCIwLjAxXCIgXFxuJyArXG4gICAgJyAgICAgICAgbmctbW9kZWw9XCIkY3RybC5vcGFjaXR5XCIgbmctY2hhbmdlPVwiJGN0cmwub25PcGFjaXR5dGVzdCgkY3RybC5vcGFjaXR5KVwiPlxcbicgK1xuICAgICcgICAgPC9tZC1zbGlkZXI+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvZXZlbnQvV2lkZ2V0RXZlbnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1ldmVudC13aWRnZXQge3sgJGN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwie1xcbicgK1xuICAgICcgICAgICAgIHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgYmlnOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiID5cXG4nICtcbiAgICAnICAgIDxpbWcgbmctaWY9XCIkY3RybC5vcHRpb25zLmltYWdlXCIgbmctc3JjPVwie3skY3RybC5vcHRpb25zLmltYWdlfX1cIiBhbHQ9XCJ7eyRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lfX1cIlxcbicgK1xuICAgICcgICAgLz5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWJhY2tkcm9wXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIHt7ICRjdHJsLm9wYWNpdHkgfX0pXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBmbGV4LW5vbmVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ3aWRnZXQtdGl0bGUgZmxleC1hdXRvIHRleHQtb3ZlcmZsb3dcIj57eyAkY3RybC5vcHRpb25zLnRpdGxlIHx8ICRjdHJsLm9wdGlvbnMubmFtZSB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY29udGFpbmVyIGZsZXgtYXV0byBwaXAtc2Nyb2xsXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxwIGNsYXNzPVwiZGF0ZSBmbGV4LW5vbmVcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMuZGF0ZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0U2hvcnREYXRlIH19XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvcD5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0IGZsZXgtYXV0b1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgJGN0cmwub3B0aW9ucy50ZXh0IHx8ICRjdHJsLm9wdGlvbnMuZGVzY3JpcHRpb24gfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9wPlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvbWVudS9XaWRnZXRNZW51Lmh0bWwnLFxuICAgICc8bWQtbWVudSBjbGFzcz1cIndpZGdldC1tZW51XCIgbWQtcG9zaXRpb24tbW9kZT1cInRhcmdldC1yaWdodCB0YXJnZXRcIj5cXG4nICtcbiAgICAnICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmVcIiBuZy1jbGljaz1cIiRtZE9wZW5NZW51KClcIiBhcmlhLWxhYmVsPVwiTWVudVwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dmRvdHNcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8bWQtbWVudS1jb250ZW50IHdpZHRoPVwiNFwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1tZW51LWl0ZW0gbmctcmVwZWF0PVwiaXRlbSBpbiAkY3RybC5tZW51XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gbmctaWY9XCIhaXRlbS5zdWJtZW51XCIgbmctY2xpY2s9XCIkY3RybC5jYWxsQWN0aW9uKGl0ZW0uYWN0aW9uLCBpdGVtLnBhcmFtcywgaXRlbSlcIj57ezo6IGl0ZW0udGl0bGUgfX08L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1tZW51IG5nLWlmPVwiaXRlbS5zdWJtZW51XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8bWQtYnV0dG9uIG5nLWNsaWNrPVwiJGN0cmwuY2FsbEFjdGlvbihpdGVtLmFjdGlvbilcIj57ezo6IGl0ZW0udGl0bGUgfX08L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8bWQtbWVudS1jb250ZW50PlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDxtZC1tZW51LWl0ZW0gbmctcmVwZWF0PVwic3ViaXRlbSBpbiBpdGVtLnN1Ym1lbnVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICAgICAgPG1kLWJ1dHRvbiBuZy1jbGljaz1cIiRjdHJsLmNhbGxBY3Rpb24oc3ViaXRlbS5hY3Rpb24sIHN1Yml0ZW0ucGFyYW1zLCBzdWJpdGVtKVwiPnt7Ojogc3ViaXRlbS50aXRsZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDwvbWQtbWVudS1pdGVtPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPC9tZC1tZW51LWNvbnRlbnQ+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvbWQtbWVudT5cXG4nICtcbiAgICAnICAgICAgICA8L21kLW1lbnUtaXRlbT5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8L21kLW1lbnUtY29udGVudD5cXG4nICtcbiAgICAnPC9tZC1tZW51PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvcGljdHVyZV9zbGlkZXIvV2lkZ2V0UGljdHVyZVNsaWRlci5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLXBpY3R1cmUtc2xpZGVyLXdpZGdldCB7eyAkY3RybC5jb2xvciB9fSBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7XFxuJyArXG4gICAgJyAgICAgICAgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBtZWRpdW06ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCIgXFxuJyArXG4gICAgJyAgICAgICAgaW5kZXg9XFwne3sgJGN0cmwuaW5kZXggfX1cXCcgZ3JvdXA9XFwne3sgJGN0cmwuZ3JvdXAgfX1cXCc+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBscDE2IHJwOCBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZsZXggdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwic2xpZGVyLWNvbnRhaW5lclwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IHBpcC1pbWFnZS1zbGlkZXIgcGlwLWFuaW1hdGlvbi10eXBlPVwiXFwnZmFkaW5nXFwnXCIgcGlwLWFuaW1hdGlvbi1pbnRlcnZhbD1cIiRjdHJsLmFuaW1hdGlvbkludGVydmFsXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICBuZy1pZj1cIiRjdHJsLmFuaW1hdGlvblR5cGUgPT0gXFwnZmFkaW5nXFwnXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGlwLWFuaW1hdGlvbi1ibG9ja1wiIG5nLXJlcGVhdD1cInNsaWRlIGluICRjdHJsLm9wdGlvbnMuc2xpZGVzXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPGltZyBuZy1zcmM9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIGFsdD1cInt7IHNsaWRlLmltYWdlIH19XCIgcGlwLWltYWdlLWxvYWQ9XCIkY3RybC5vbkltYWdlTG9hZCgkZXZlbnQpXCIvPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwic2xpZGUtdGV4dFwiIG5nLWlmPVwic2xpZGUudGV4dFwiPnt7IHNsaWRlLnRleHQgfX08L3A+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IHBpcC1pbWFnZS1zbGlkZXIgcGlwLWFuaW1hdGlvbi10eXBlPVwiXFwnY2Fyb3VzZWxcXCdcIiBwaXAtYW5pbWF0aW9uLWludGVydmFsPVwiJGN0cmwuYW5pbWF0aW9uSW50ZXJ2YWxcIiBcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWlmPVwiJGN0cmwuYW5pbWF0aW9uVHlwZSA9PSBcXCdjYXJvdXNlbFxcJ1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1hbmltYXRpb24tYmxvY2tcIiBuZy1yZXBlYXQ9XCJzbGlkZSBpbiAkY3RybC5vcHRpb25zLnNsaWRlc1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDxpbWcgbmctc3JjPVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBhbHQ9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIHBpcC1pbWFnZS1sb2FkPVwiJGN0cmwub25JbWFnZUxvYWQoJGV2ZW50KVwiLz5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInNsaWRlLXRleHRcIiBuZy1pZj1cInNsaWRlLnRleHRcIj57eyBzbGlkZS50ZXh0IH19PC9wPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL25vdGVzL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPlxcbicgK1xuICAgICcgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCBibTBcIj5cXG4nICtcbiAgICAnICAgICAgICA8bGFiZWw+VGl0bGU6PC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLnRpdGxlXCIvPlxcbicgK1xuICAgICcgICAgPC9tZC1pbnB1dC1jb250YWluZXI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCB0bTBcIj5cXG4nICtcbiAgICAnICAgICAgICA8bGFiZWw+VGV4dDo8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDx0ZXh0YXJlYSB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGV4dFwiLz5cXG4nICtcbiAgICAnICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL25vdGVzL1dpZGdldE5vdGVzLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtbm90ZXMtd2lkZ2V0IHt7ICRjdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW5cIj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgZmxleC1ub25lXCIgbmctaWY9XCIkY3RybC5vcHRpb25zLnRpdGxlIHx8ICRjdHJsLm9wdGlvbnMubmFtZVwiPlxcbicgK1xuICAgICcgICAgICAgIDxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgJGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWUgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PlxcbicgK1xuICAgICcgICAgXFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwidGV4dC1jb250YWluZXIgZmxleC1hdXRvIHBpcC1zY3JvbGxcIj5cXG4nICtcbiAgICAnICAgICAgICA8cD57eyAkY3RybC5vcHRpb25zLnRleHQgfX08L3A+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJycpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvcG9zaXRpb24vQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoXCI+XFxuJyArXG4gICAgJyAgICA8bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIGJtMFwiPlxcbicgK1xuICAgICcgICAgICAgIDxsYWJlbD5Mb2NhdGlvbiBuYW1lOjwvbGFiZWw+XFxuJyArXG4gICAgJyAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC5sb2NhdGlvbk5hbWVcIi8+XFxuJyArXG4gICAgJyAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1wb3NpdGlvbi13aWRnZXQgd2lkZ2V0LWJveCBwMCBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCJcXG4nICtcbiAgICAnICAgICBuZy1jbGFzcz1cIntcXG4nICtcbiAgICAnICAgICAgICBzbWFsbDogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLFxcbicgK1xuICAgICcgICAgICAgIG1lZGl1bTogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLFxcbicgK1xuICAgICcgICAgICAgIGJpZzogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIlxcbicgK1xuICAgICcgICAgICAgIGluZGV4PVxcJ3t7ICRjdHJsLmluZGV4IH19XFwnIGdyb3VwPVxcJ3t7ICRjdHJsLmdyb3VwIH19XFwnPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBvc2l0aW9uLWFic29sdXRlLXJpZ2h0LXRvcFwiIG5nLWlmPVwiISRjdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lXCI+XFxuJyArXG4gICAgJyAgICAgICAgPHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbHAxNiBycDggbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lXCI+XFxuJyArXG4gICAgJyAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGV4IHRleHQtb3ZlcmZsb3dcIj57eyAkY3RybC5vcHRpb25zLmxvY2F0aW9uTmFtZSB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICA8cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxwaXAtbG9jYXRpb24tbWFwIGNsYXNzPVwiZmxleFwiIG5nLWlmPVwiJGN0cmwuc2hvd1Bvc2l0aW9uXCIgcGlwLXN0cmV0Y2g9XCJ0cnVlXCIgcGlwLXJlYmluZD1cInRydWVcIlxcbicgK1xuICAgICcgICAgICAgIHBpcC1sb2NhdGlvbi1wb3M9XCIkY3RybC5vcHRpb25zLmxvY2F0aW9uXCI+PC9waXAtbG9jYXRpb24+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcy5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLXN0YXRpc3RpY3Mtd2lkZ2V0IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIlxcbicgK1xuICAgICcgICAgIG5nLWNsYXNzPVwie1xcbicgK1xuICAgICcgICAgICAgIHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgYmlnOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBmbGV4LW5vbmVcIj5cXG4nICtcbiAgICAnICAgICAgICA8c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgIDxwaXAtbWVudS13aWRnZXQ+PC9waXAtbWVudS13aWRnZXQ+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLWlmPVwiJGN0cmwub3B0aW9ucy5zZXJpZXMgJiYgISRjdHJsLnJlc2V0XCI+XFxuJyArXG4gICAgJyAgICAgICAgPHBpcC1waWUtY2hhcnQgcGlwLXNlcmllcz1cIiRjdHJsLm9wdGlvbnMuc2VyaWVzXCIgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5jaGFydFR5cGUgfHwgJGN0cmwub3B0aW9ucy5jaGFydFR5cGUgPT0gXFwncGllXFwnXCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICBwaXAtZG9udXQ9XCJ0cnVlXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgcGlwLXBpZS1zaXplPVwiJGN0cmwuY2hhcnRTaXplXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgcGlwLXNob3ctdG90YWw9XCJ0cnVlXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgcGlwLWNlbnRlcmVkPVwidHJ1ZVwiPlxcbicgK1xuICAgICcgICAgICAgIDwvcGlwLXBpZS1jaGFydD5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnJyk7XG59XSk7XG59KSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1waXAtd2VidWktZGFzaGJvYXJkLWh0bWwuanMubWFwXG4iXX0=