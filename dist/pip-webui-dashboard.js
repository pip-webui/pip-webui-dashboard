(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).dashboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
        .module('pipAddDashboardComponentDialog')
        .config(setTranslations)
        .provider('pipAddComponentDialog', AddComponentDialogProvider);
    console.log('add provider pipAddComponentDialog');
}
},{"./AddComponentDialogController":2}],4:[function(require,module,exports){
"use strict";
angular
    .module('pipAddDashboardComponentDialog', ['ngMaterial']);
require("./AddComponentDialogController");
require("./AddComponentProvider");
},{"./AddComponentDialogController":2,"./AddComponentProvider":3}],5:[function(require,module,exports){
"use strict";
angular.module('pipDashboardDialogs', [
    'pipAddDashboardComponentDialog',
    'pipWidgetConfigDialog'
]);
require("./add_component");
require("./tile_config");
},{"./add_component":4,"./tile_config":9}],6:[function(require,module,exports){
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
    WidgetConfigDialogController.$inject = ['params', 'extensionUrl', '$mdDialog'];
    function WidgetConfigDialogController(params, extensionUrl, $mdDialog) {
        "ngInject";
        var _this = this;
        this.params = params;
        this.extensionUrl = extensionUrl;
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
},{}],7:[function(require,module,exports){
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
                delete changes.pipDialogScope.currentValue['$scope'];
                angular.extend(this, changes.pipDialogScope.currentValue);
            }
            if (changes.pipExtensionUrl && changes.pipExtensionUrl.currentValue) {
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
        templateUrl: 'dialogs/tile_config/ConfigDialogExtendComponent.html',
        controller: WidgetConfigExtendComponentController,
        bindings: WidgetConfigExtendComponentBindings
    };
    angular
        .module('pipWidgetConfigDialog')
        .component('pipWidgetConfigExtendComponent', pipWidgetConfigComponent);
}
},{}],8:[function(require,module,exports){
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
                templateUrl: params.templateUrl || 'dialogs/tile_config/ConfigDialog.html',
                controller: ConfigDialogController_1.WidgetConfigDialogController,
                bindToController: true,
                controllerAs: 'vm',
                locals: {
                    extensionUrl: params.extensionUrl,
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
},{"./ConfigDialogController":6}],9:[function(require,module,exports){
"use strict";
angular
    .module('pipWidgetConfigDialog', ['ngMaterial']);
require("./ConfigDialogController");
require("./ConfigDialogService");
require("./ConfigDialogExtendComponent");
},{"./ConfigDialogController":6,"./ConfigDialogExtendComponent":7,"./ConfigDialogService":8}],10:[function(require,module,exports){
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
                    autoScroll: {
                        enabled: true,
                        container: $('#content').get(0),
                        speed: 500
                    },
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
},{"./DraggableTileService":11,"./draggable_group/DraggableTilesGroupService":13}],11:[function(require,module,exports){
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
angular.module('pipDragged', []);
require("./DraggableTileService");
require("./Draggable");
require("./draggable_group/DraggableTilesGroupService");
require("./draggable_group/DraggableTilesGroupDirective");
},{"./Draggable":10,"./DraggableTileService":11,"./draggable_group/DraggableTilesGroupDirective":12,"./draggable_group/DraggableTilesGroupService":13}],15:[function(require,module,exports){
"use strict";
require("./widgets/index");
require("./draggable/index");
console.log('here');
angular.module('pipDashboard', [
    'pipWidget',
    'pipDragged',
    'pipDashboardDialogs',
    'pipDashboard.Templates',
    'pipLayout',
    'pipLocations',
    'pipDateTime',
    'pipCharts',
    'pipTranslate',
    'pipControls',
    'pipButtons'
]);
require("./utility/WidgetTemplateUtility");
require("./dialogs/index");
require("./Dashboard");
},{"./Dashboard":1,"./dialogs/index":5,"./draggable/index":14,"./utility/WidgetTemplateUtility":16,"./widgets/index":20}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
"use strict";
var DashboardWidget = (function () {
    function DashboardWidget() {
    }
    return DashboardWidget;
}());
exports.DashboardWidget = DashboardWidget;
},{}],18:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":22}],19:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":22}],20:[function(require,module,exports){
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
},{"./calendar/WidgetCalendar":18,"./event/WidgetEvent":19,"./menu/WidgetMenuDirective":21,"./menu/WidgetMenuService":22,"./notes/WidgetNotes":23,"./picture_slider/WidgetPictureSlider":24,"./position/WidgetPosition":25,"./statistics/WidgetStatistics":26}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
},{"../WidgetClass":17}],23:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":22}],24:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":22}],25:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":22}],26:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":22}],27:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('Dashboard.html',
    '<md-button class="md-accent md-raised md-fab layout-column layout-align-center-center" aria-label="Add component" ng-click="$ctrl.addComponent()"><md-icon md-svg-icon="icons:plus" class="md-headline centered-add-icon"></md-icon></md-button><div class="pip-draggable-grid-holder"><pip-draggable-grid pip-tiles-templates="$ctrl.groupedWidgets" pip-tiles-context="$ctrl.widgetsContext" pip-draggable-grid="$ctrl.draggableGridOptions" pip-group-menu-actions="$ctrl.groupMenuActions"></pip-draggable-grid><md-progress-circular md-mode="indeterminate" class="progress-ring"></md-progress-circular></div>');
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
    '<div class="pip-draggable-holder"><div class="pip-draggable-group" ng-repeat="group in $ctrl.groups" data-group-id="{{ $index }}" pip-draggable-tiles="group.source"><div class="pip-draggable-group-title layout-row layout-align-start-center"><div class="title-input-container" ng-click="$ctrl.onTitleClick(group, $event)"><input ng-if="group.editingName" ng-blur="$ctrl.onBlurTitleInput(group)" ng-keypress="$ctrl.onKyepressTitleInput(group, $event)" ng-model="group.title"><div class="text-overflow flex-none" ng-if="!group.editingName">{{ group.title }}</div></div><md-button class="md-icon-button flex-none layout-align-center-center" ng-show="group.editingName" ng-click="$ctrl.cancelEditing(group)" aria-label="Cancel"><md-icon md-svg-icon="icons:cross"></md-icon></md-button><md-menu class="flex-none layout-column" md-position-mode="target-right target" ng-show="!group.editingName"><md-button class="md-icon-button flex-none layout-align-center-center" ng-click="$mdOpenMenu(); groupId = $index" aria-label="Menu"><md-icon md-svg-icon="icons:dots"></md-icon></md-button><md-menu-content width="4"><md-menu-item ng-repeat="action in $ctrl.groupMenuActions"><md-button ng-click="action.callback(groupId)">{{ action.title }}</md-button></md-menu-item></md-menu-content></md-menu></div></div><div class="pip-draggable-group fict-group layout-align-center-center layout-column tm16"><div class="fict-group-text-container"><md-icon md-svg-icon="icons:plus"></md-icon>{{ \'DROP_TO_CREATE_NEW_GROUP\' | translate }}</div></div></div>');
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
  $templateCache.put('dialogs/tile_config/ConfigDialog.html',
    '<md-dialog class="pip-dialog pip-widget-config-dialog {{ vm.params.dialogClass }}" width="400" md-theme="{{vm.theme}}"><pip-widget-config-extend-component class="layout-column" pip-dialog-scope="vm" pip-extension-url="vm.extensionUrl" pip-apply="vm.onApply(updatedData)"></pip-widget-config-extend-component></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('dialogs/tile_config/ConfigDialogExtendComponent.html',
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
    '<div class="widget-box pip-calendar-widget {{ $ctrl.color }} layout-column layout-fill tp0" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }"><div class="widget-heading layout-row layout-align-end-center flex-none"><pip-menu-widget></pip-menu-widget></div><div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="$ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1"><span class="date lm24 rm12">{{ $ctrl.options.date.getDate() }}</span><div class="flex-auto layout-column"><span class="weekday md-headline">{{ $ctrl.options.date | formatLongDayOfWeek }}</span> <span class="month-year md-headline">{{ $ctrl.options.date | formatLongMonth }} {{ $ctrl.options.date | formatYear }}</span></div></div><div class="widget-content flex-auto layout-column layout-align-space-around-center" ng-hide="$ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1"><span class="weekday md-headline" ng-hide="$ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1">{{ $ctrl.options.date | formatLongDayOfWeek }}</span> <span class="weekday" ng-show="$ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1">{{ $ctrl.options.date | formatLongDayOfWeek }}</span> <span class="date lm12 rm12">{{ $ctrl.options.date.getDate() }}</span> <span class="month-year md-headline">{{ $ctrl.options.date | formatLongMonth }} {{ $ctrl.options.date | formatYear }}</span></div></div>');
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
    '<md-menu class="widget-menu" md-position-mode="target-right target"><md-button class="md-icon-button flex-none" ng-click="$mdOpenMenu()" aria-label="Menu"><md-icon md-svg-icon="icons:vdots"></md-icon></md-button><md-menu-content width="4"><md-menu-item ng-repeat="item in $ctrl.menu"><md-button ng-if="!item.submenu" ng-click="$ctrl.callAction(item.action, item.params, item)">{{:: item.title }}</md-button><md-menu ng-if="item.submenu"><md-button ng-click="$ctrl.callAction(item.action)">{{:: item.title }}</md-button><md-menu-content><md-menu-item ng-repeat="subitem in item.submenu"><md-button ng-click="$ctrl.callAction(subitem.action, subitem.params, subitem)">{{:: subitem.title }}</md-button></md-menu-item></md-menu-content></md-menu></md-menu-item></md-menu-content></md-menu>');
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
    '<div class="widget-box pip-event-widget {{ $ctrl.color }} layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }"><img ng-if="$ctrl.options.image" ng-src="{{$ctrl.options.image}}" alt="{{$ctrl.options.title || $ctrl.options.name}}"><div class="text-backdrop" style="background-color: rgba(0, 0, 0, {{ $ctrl.opacity }})"><div class="widget-heading layout-row layout-align-start-center flex-none"><span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span><pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget></div><div class="text-container flex-auto pip-scroll"><p class="date flex-none" ng-if="$ctrl.options.date">{{ $ctrl.options.date | formatShortDate }}</p><p class="text flex-auto">{{ $ctrl.options.text || $ctrl.options.description }}</p></div></div></div>');
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
    '<div class="widget-box pip-notes-widget {{ $ctrl.color }} layout-column"><div class="widget-heading layout-row layout-align-start-center flex-none" ng-if="$ctrl.options.title || $ctrl.options.name"><span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span></div><pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget><div class="text-container flex-auto pip-scroll"><p>{{ $ctrl.options.text }}</p></div></div>');
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
    '<div class="widget-box pip-picture-slider-widget {{ $ctrl.color }} layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }" index="{{ $ctrl.index }}" group="{{ $ctrl.group }}"><div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none"><span class="flex text-overflow">{{ $ctrl.options.title }}</span><pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget></div><div class="slider-container"><div pip-image-slider="" pip-animation-type="\'fading\'" pip-animation-interval="$ctrl.animationInterval" ng-if="$ctrl.animationType == \'fading\'"><div class="pip-animation-block" ng-repeat="slide in $ctrl.options.slides"><img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="$ctrl.onImageLoad($event)"><p class="slide-text" ng-if="slide.text">{{ slide.text }}</p></div></div><div pip-image-slider="" pip-animation-type="\'carousel\'" pip-animation-interval="$ctrl.animationInterval" ng-if="$ctrl.animationType == \'carousel\'"><div class="pip-animation-block" ng-repeat="slide in $ctrl.options.slides"><img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="$ctrl.onImageLoad($event)"><p class="slide-text" ng-if="slide.text">{{ slide.text }}</p></div></div></div></div>');
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
    '<div class="pip-position-widget widget-box p0 layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }" index="{{ $ctrl.index }}" group="{{ $ctrl.group }}"><div class="position-absolute-right-top" ng-if="!$ctrl.options.locationName"><pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget></div><div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none" ng-if="$ctrl.options.locationName"><span class="flex text-overflow">{{ $ctrl.options.locationName }}</span><pip-menu-widget ng-if="!$ctrl.options.hideMenu"></pip-menu-widget></div><pip-location-map class="flex" ng-if="$ctrl.showPosition" pip-stretch="true" pip-rebind="true" pip-location-pos="$ctrl.options.location"></pip-location-map></div>');
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
    '<div class="widget-box pip-statistics-widget layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }"><div class="widget-heading layout-row layout-align-start-center flex-none"><span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span><pip-menu-widget></pip-menu-widget></div><div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="$ctrl.options.series && !$ctrl.reset"><pip-pie-chart pip-series="$ctrl.options.series" ng-if="!$ctrl.options.chartType || $ctrl.options.chartType == \'pie\'" pip-donut="true" pip-pie-size="$ctrl.chartSize" pip-show-total="true" pip-centered="true"></pip-pie-chart></div></div>');
}]);
})();



},{}]},{},[15,27])(27)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRGFzaGJvYXJkLnRzIiwic3JjL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyLnRzIiwic3JjL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnRQcm92aWRlci50cyIsInNyYy9kaWFsb2dzL2FkZF9jb21wb25lbnQvaW5kZXgudHMiLCJzcmMvZGlhbG9ncy9pbmRleC50cyIsInNyYy9kaWFsb2dzL3RpbGVfY29uZmlnL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXIudHMiLCJzcmMvZGlhbG9ncy90aWxlX2NvbmZpZy9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQudHMiLCJzcmMvZGlhbG9ncy90aWxlX2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlLnRzIiwic3JjL2RpYWxvZ3MvdGlsZV9jb25maWcvaW5kZXgudHMiLCJzcmMvZHJhZ2dhYmxlL0RyYWdnYWJsZS50cyIsInNyYy9kcmFnZ2FibGUvRHJhZ2dhYmxlVGlsZVNlcnZpY2UudHMiLCJzcmMvZHJhZ2dhYmxlL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwRGlyZWN0aXZlLnRzIiwic3JjL2RyYWdnYWJsZS9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UudHMiLCJzcmMvZHJhZ2dhYmxlL2luZGV4LnRzIiwic3JjL2luZGV4LnRzIiwic3JjL3V0aWxpdHkvV2lkZ2V0VGVtcGxhdGVVdGlsaXR5LnRzIiwic3JjL3dpZGdldHMvV2lkZ2V0Q2xhc3MudHMiLCJzcmMvd2lkZ2V0cy9jYWxlbmRhci9XaWRnZXRDYWxlbmRhci50cyIsInNyYy93aWRnZXRzL2V2ZW50L1dpZGdldEV2ZW50LnRzIiwic3JjL3dpZGdldHMvaW5kZXgudHMiLCJzcmMvd2lkZ2V0cy9tZW51L1dpZGdldE1lbnVEaXJlY3RpdmUudHMiLCJzcmMvd2lkZ2V0cy9tZW51L1dpZGdldE1lbnVTZXJ2aWNlLnRzIiwic3JjL3dpZGdldHMvbm90ZXMvV2lkZ2V0Tm90ZXMudHMiLCJzcmMvd2lkZ2V0cy9waWN0dXJlX3NsaWRlci9XaWRnZXRQaWN0dXJlU2xpZGVyLnRzIiwic3JjL3dpZGdldHMvcG9zaXRpb24vV2lkZ2V0UG9zaXRpb24udHMiLCJzcmMvd2lkZ2V0cy9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MudHMiLCJ0ZW1wL3BpcC13ZWJ1aS1kYXNoYm9hcmQtaHRtbC5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDUUEsQ0FBQztJQUNDLElBQU0sZUFBZSxHQUFHLFVBQVUsU0FBbUM7UUFDbkUsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDMUcsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNQLFlBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO2dCQUM1Qyx3QkFBd0IsRUFBRSwrQkFBK0I7YUFDMUQsQ0FBQyxDQUFDO1lBQ08sWUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVDLHdCQUF3QixFQUFFLDJDQUEyQzthQUN0RSxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQyxDQUFBO0lBRUQsSUFBTSx5QkFBeUIsR0FBRyxVQUFVLDZCQUEwRDtRQUNwRyw2QkFBNkIsQ0FBQyxnQkFBZ0IsQ0FBQztZQUM3QyxDQUFDO29CQUNHLEtBQUssRUFBRSxPQUFPO29CQUNkLElBQUksRUFBRSxVQUFVO29CQUNoQixJQUFJLEVBQUUsT0FBTztvQkFDYixNQUFNLEVBQUUsQ0FBQztpQkFDVjtnQkFDRDtvQkFDRSxLQUFLLEVBQUUsVUFBVTtvQkFDakIsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLElBQUksRUFBRSxVQUFVO29CQUNoQixNQUFNLEVBQUUsQ0FBQztpQkFDVjthQUNGO1lBQ0QsQ0FBQztvQkFDRyxLQUFLLEVBQUUsVUFBVTtvQkFDakIsSUFBSSxFQUFFLE1BQU07b0JBQ1osSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLE1BQU0sRUFBRSxDQUFDO2lCQUNWO2dCQUNEO29CQUNFLEtBQUssRUFBRSxjQUFjO29CQUNyQixJQUFJLEVBQUUsV0FBVztvQkFDakIsSUFBSSxFQUFFLE9BQU87b0JBQ2IsTUFBTSxFQUFFLENBQUM7aUJBQ1Y7Z0JBQ0Q7b0JBQ0UsS0FBSyxFQUFFLFlBQVk7b0JBQ25CLElBQUksRUFBRSxlQUFlO29CQUNyQixJQUFJLEVBQUUsWUFBWTtvQkFDbEIsTUFBTSxFQUFFLENBQUM7aUJBQ1Y7YUFDRjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQTtJQUVEO1FBQUE7UUFLQSxDQUFDO1FBQUQsdUJBQUM7SUFBRCxDQUxBLEFBS0MsSUFBQTtJQUVELElBQU0sc0JBQW9CLEdBQXFCO1FBQzdDLFNBQVMsRUFBRSxHQUFHO1FBQ2QsVUFBVSxFQUFFLEdBQUc7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE1BQU0sRUFBRSxLQUFLO0tBQ2QsQ0FBQztJQVFGO1FBZ0NFLDZCQUNFLE1BQXNCLEVBQ2QsVUFBcUMsRUFDckMsTUFBVyxFQUNYLFFBQWEsRUFDYixRQUFpQyxFQUNqQyxZQUF5QyxFQUN6QyxxQkFBaUQsRUFDakQsaUJBQXlDO1lBUm5ELGlCQThCQztZQTVCUyxlQUFVLEdBQVYsVUFBVSxDQUEyQjtZQUNyQyxXQUFNLEdBQU4sTUFBTSxDQUFLO1lBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNiLGFBQVEsR0FBUixRQUFRLENBQXlCO1lBQ2pDLGlCQUFZLEdBQVosWUFBWSxDQUE2QjtZQUN6QywwQkFBcUIsR0FBckIscUJBQXFCLENBQTRCO1lBQ2pELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBd0I7WUF2QzNDLDRCQUF1QixHQUFRLENBQUM7b0JBQ3BDLEtBQUssRUFBRSxlQUFlO29CQUN0QixRQUFRLEVBQUUsVUFBQyxVQUFVO3dCQUNuQixLQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNoQyxDQUFDO2lCQUNGO2dCQUNEO29CQUNFLEtBQUssRUFBRSxRQUFRO29CQUNmLFFBQVEsRUFBRSxVQUFDLFVBQVU7d0JBQ25CLEtBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQy9CLENBQUM7aUJBQ0Y7Z0JBQ0Q7b0JBQ0UsS0FBSyxFQUFFLGFBQWE7b0JBQ3BCLFFBQVEsRUFBRSxVQUFDLFVBQVU7d0JBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQzNELENBQUM7aUJBQ0Y7YUFDRixDQUFDO1lBQ00sZ0JBQVcsR0FBVyx5REFBeUQ7Z0JBQ3JGLGlGQUFpRjtnQkFDakYsMEJBQTBCLENBQUM7WUFLdEIscUJBQWdCLEdBQVEsSUFBSSxDQUFDLHVCQUF1QixDQUFDO1lBNkZyRCxnQkFBVyxHQUFHLFVBQUMsVUFBVTtnQkFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLEtBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxDQUFDLENBQUE7WUFoRkMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUdoQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxzQkFBb0IsQ0FBQztZQUdyRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztnQkFBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUdwRyxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztZQUM3QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixLQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDO1FBRU8sNENBQWMsR0FBdEI7WUFBQSxpQkF5QkM7WUF4QkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFVBQUMsS0FBSyxFQUFFLFVBQVU7Z0JBQzVDLEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsSUFBSSxFQUFFO29CQUMvQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTSxFQUFFLEtBQUs7d0JBRTVDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSTs0QkFDM0IsT0FBTyxFQUFFLENBQUM7NEJBQ1YsT0FBTyxFQUFFLENBQUM7eUJBQ1gsQ0FBQzt3QkFDRixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDckIsTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7d0JBQy9CLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ2hDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dDQUMzQixLQUFLLEVBQUUsUUFBUTtnQ0FDZixLQUFLLEVBQUUsVUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU07b0NBQzFCLEtBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQ0FDMUMsQ0FBQzs2QkFDRixDQUFDLENBQUMsQ0FBQzt3QkFFSixNQUFNLENBQUM7NEJBQ0wsSUFBSSxFQUFFLE1BQU07NEJBQ1osUUFBUSxFQUFFLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUksQ0FBQyxXQUFXLENBQUM7eUJBQ3ZFLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQUE7WUFDTixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTSwwQ0FBWSxHQUFuQixVQUFvQixVQUFVO1lBQTlCLGlCQTJCQztZQTFCQyxJQUFJLENBQUMscUJBQXFCO2lCQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUM7aUJBQ3JDLElBQUksQ0FBQyxVQUFDLElBQUk7Z0JBQ1QsSUFBSSxXQUFXLENBQUM7Z0JBRWhCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDVixNQUFNLENBQUM7Z0JBQ1QsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsV0FBVyxHQUFHLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLFdBQVcsR0FBRzt3QkFDWixLQUFLLEVBQUUsV0FBVzt3QkFDbEIsTUFBTSxFQUFFLEVBQUU7cUJBQ1gsQ0FBQztnQkFDSixDQUFDO2dCQUVELEtBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRWxELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixLQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztnQkFFRCxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUEsQ0FBQztRQU9NLHdDQUFVLEdBQWxCLFVBQW1CLEtBQUssRUFBRSxPQUFPO1lBQy9CLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxXQUFXO2dCQUMxQixXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTtvQkFDekIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ2xCLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7NEJBQzlDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0NBQ1QsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJOzZCQUNsQixDQUFDLENBQUM7d0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLDBDQUFZLEdBQXBCLFVBQXFCLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTTtZQUF6QyxpQkFPQztZQU5DLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1lBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixLQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztZQUNyRSxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFSCwwQkFBQztJQUFELENBcEpBLEFBb0pDLElBQUE7SUFFRCxJQUFNLFlBQVksR0FBeUI7UUFDekMsUUFBUSxFQUFFO1lBQ1IsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixzQkFBc0IsRUFBRSxrQkFBa0I7WUFDMUMsY0FBYyxFQUFFLFlBQVk7U0FDN0I7UUFDRCxVQUFVLEVBQUUsbUJBQW1CO1FBQy9CLFdBQVcsRUFBRSxnQkFBZ0I7S0FDOUIsQ0FBQTtJQUVELE9BQU87U0FDSixNQUFNLENBQUMsY0FBYyxDQUFDO1NBQ3RCLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQztTQUNqQyxNQUFNLENBQUMsZUFBZSxDQUFDO1NBQ3ZCLFNBQVMsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFFN0MsQ0FBQzs7O0FDcFBEO0lBQUE7SUFLQSxDQUFDO0lBQUQsK0JBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDREQUF3QjtBQU9yQztJQUtJLHNDQUNJLE1BQU0sRUFDQyxnQkFBd0IsRUFDL0IsVUFBd0MsRUFDakMsU0FBMEM7UUFGMUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFRO1FBRXhCLGNBQVMsR0FBVCxTQUFTLENBQWlDO1FBTjlDLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBUTVCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sMENBQUcsR0FBVjtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2hCLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ2pDLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYztTQUMvQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQUEsQ0FBQztJQUVLLDZDQUFNLEdBQWI7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFBQSxDQUFDO0lBRUssK0NBQVEsR0FBZixVQUFnQixVQUFrQixFQUFFLFdBQW1CO1FBQ25ELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDNUQsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQUEsQ0FBQztJQUVLLCtDQUFRLEdBQWYsVUFBZ0IsVUFBa0IsRUFBRSxXQUFtQjtRQUNuRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBQUEsQ0FBQztJQUNOLG1DQUFDO0FBQUQsQ0F4Q0EsQUF3Q0MsSUFBQTtBQXhDWSxvRUFBNEI7OztBQ1B6QywrRUFHd0M7QUFVeEMsQ0FBQztJQUNDLElBQU0sZUFBZSxHQUFHLFVBQVMsU0FBbUM7UUFDbEUsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDMUcsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNYLFlBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO2dCQUN4QyxvQ0FBb0MsRUFBRSxlQUFlO2dCQUNyRCwyQ0FBMkMsRUFBRSxpR0FBaUc7Z0JBQzlJLCtDQUErQyxFQUFFLGtCQUFrQjthQUNwRSxDQUFDLENBQUM7WUFDRyxZQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRTtnQkFDeEMsb0NBQW9DLEVBQUUsb0JBQW9CO2dCQUMxRCwyQ0FBMkMsRUFBRSxzSEFBc0g7Z0JBQ25LLCtDQUErQyxFQUFFLHNCQUFzQjthQUN4RSxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQyxDQUFBO0lBRUQ7UUFFRSxxQ0FDVSxVQUF3QyxFQUN4QyxTQUEwQztZQUQxQyxlQUFVLEdBQVYsVUFBVSxDQUE4QjtZQUN4QyxjQUFTLEdBQVQsU0FBUyxDQUFpQztRQUNqRCxDQUFDO1FBRUcsMENBQUksR0FBWCxVQUFZLE1BQU0sRUFBRSxnQkFBZ0I7WUFBcEMsaUJBb0JDO1lBbkJDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUztpQkFDbEIsSUFBSSxDQUFDO2dCQUNKLFdBQVcsRUFBRSx5Q0FBeUM7Z0JBQ3RELGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLFVBQVUsRUFBRSwyREFBNEI7Z0JBQ3hDLFlBQVksRUFBRSxZQUFZO2dCQUMxQixtQkFBbUIsRUFBRSxJQUFJO2dCQUN6QixPQUFPLEVBQUU7b0JBQ1AsTUFBTSxFQUFFO3dCQUNOLE1BQU0sQ0FBQyxNQUFNLENBQUM7b0JBQ2hCLENBQUM7b0JBQ0QsZ0JBQWdCLEVBQUU7d0JBQ2hCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDMUIsQ0FBQztvQkFDRCxVQUFVLEVBQUU7d0JBQ1YsTUFBTSxDQUFPLEtBQUksQ0FBQyxVQUFXLENBQUM7b0JBQ2hDLENBQUM7aUJBQ0Y7YUFDRixDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUEsQ0FBQztRQUNKLGtDQUFDO0lBQUQsQ0E1QkEsQUE0QkMsSUFBQTtJQUVEO1FBSUU7WUFGUSxnQkFBVyxHQUFpQyxJQUFJLENBQUM7WUFJbEQscUJBQWdCLEdBQUcsVUFBVSxJQUFrQztnQkFDcEUsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDMUIsQ0FBQyxDQUFDO1FBSmEsQ0FBQztRQU1ULHlDQUFJLEdBQVgsVUFBWSxTQUEwQztZQUNwRCxVQUFVLENBQUM7WUFFWCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLDJCQUF5QixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFN0UsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdkIsQ0FBQztRQUNILGlDQUFDO0lBQUQsQ0FsQkEsQUFrQkMsSUFBQTtJQUVELE9BQU87U0FDSixNQUFNLENBQUMsZ0NBQWdDLENBQUM7U0FDeEMsTUFBTSxDQUFDLGVBQWUsQ0FBQztTQUN2QixRQUFRLENBQUMsdUJBQXVCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztJQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDdEQsQ0FBQzs7O0FDckZELE9BQU87S0FDRixNQUFNLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBRTlELDBDQUF3QztBQUN4QyxrQ0FBZ0M7OztBQ0hoQyxPQUFPLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFO0lBQ2xDLGdDQUFnQztJQUNoQyx1QkFBdUI7Q0FDMUIsQ0FBQyxDQUFDO0FBRUgsMkJBQXlCO0FBQ3pCLHlCQUF1Qjs7O0FDTnZCO0lBQUE7SUFFQSxDQUFDO0lBQUQsaUJBQUM7QUFBRCxDQUZBLEFBRUM7QUFEVSxjQUFHLEdBQWEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFHekU7SUFBQTtJQWNBLENBQUM7SUFBRCxnQkFBQztBQUFELENBZEEsQUFjQztBQWJVLGFBQUcsR0FBUSxDQUFDO1FBQ1gsSUFBSSxFQUFFLDJDQUEyQztRQUNqRCxFQUFFLEVBQUUsSUFBSTtLQUNYO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsMENBQTBDO1FBQ2hELEVBQUUsRUFBRSxJQUFJO0tBQ1g7SUFDRDtRQUNJLElBQUksRUFBRSwyQ0FBMkM7UUFDakQsRUFBRSxFQUFFLElBQUk7S0FDWDtDQUNKLENBQUM7QUFHTjtJQU1JLHNDQUNXLE1BQU0sRUFDTixZQUFZLEVBQ1osU0FBMEM7UUFFakQsVUFBVSxDQUFDO1FBTGYsaUJBYUM7UUFaVSxXQUFNLEdBQU4sTUFBTSxDQUFBO1FBQ04saUJBQVksR0FBWixZQUFZLENBQUE7UUFDWixjQUFTLEdBQVQsU0FBUyxDQUFpQztRQVI5QyxXQUFNLEdBQWEsVUFBVSxDQUFDLEdBQUcsQ0FBQztRQUNsQyxVQUFLLEdBQVEsU0FBUyxDQUFDLEdBQUcsQ0FBQztRQUMzQixXQUFNLEdBQVcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFVeEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFdkUsSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNaLEtBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFBO0lBQ0wsQ0FBQztJQUVNLDhDQUFPLEdBQWQsVUFBZSxXQUFXO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDTCxtQ0FBQztBQUFELENBMUJBLEFBMEJDLElBQUE7QUExQlksb0VBQTRCOztBQ3JCekMsQ0FBQztJQVNHLElBQU0sbUNBQW1DLEdBQXlDO1FBQzlFLGVBQWUsRUFBRSxHQUFHO1FBQ3BCLGNBQWMsRUFBRSxHQUFHO1FBQ25CLFFBQVEsRUFBRSxHQUFHO0tBQ2hCLENBQUE7SUFFRDtRQUFBO1FBT0EsQ0FBQztRQUFELHlDQUFDO0lBQUQsQ0FQQSxBQU9DLElBQUE7SUFNRDtRQUtJLCtDQUNZLGdCQUFpRCxFQUNqRCxRQUFpQyxFQUNqQyxNQUFzQixFQUN0QixRQUFnQixFQUNoQixNQUE4QztZQUo5QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlDO1lBQ2pELGFBQVEsR0FBUixRQUFRLENBQXlCO1lBQ2pDLFdBQU0sR0FBTixNQUFNLENBQWdCO1lBQ3RCLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBd0M7UUFDdEQsQ0FBQztRQUVFLDBEQUFVLEdBQWpCLFVBQWtCLE9BQTJDO1lBQTdELGlCQVVDO1lBVEcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3JELE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDOUQsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSTtvQkFDekUsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDNUYsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQztRQUVNLHVEQUFPLEdBQWQ7WUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNMLDRDQUFDO0lBQUQsQ0E1QkEsQUE0QkMsSUFBQTtJQUVELElBQU0sd0JBQXdCLEdBQXlCO1FBQ25ELFdBQVcsRUFBRSxzREFBc0Q7UUFDbkUsVUFBVSxFQUFFLHFDQUFxQztRQUNqRCxRQUFRLEVBQUUsbUNBQW1DO0tBQ2hELENBQUE7SUFFRCxPQUFPO1NBQ0YsTUFBTSxDQUFDLHVCQUF1QixDQUFDO1NBQy9CLFNBQVMsQ0FBQyxnQ0FBZ0MsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0FBQy9FLENBQUM7OztBQ25FRCxtRUFBd0U7QUFZeEUsQ0FBQztJQUNHLElBQU0sZUFBZSxHQUFHLFVBQVMsU0FBbUM7UUFDaEUsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDMUcsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNMLFlBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO2dCQUMxQyxvQ0FBb0MsRUFBRSxXQUFXO2dCQUNqRCx5Q0FBeUMsRUFBRSxPQUFPO2dCQUNsRCx3Q0FBd0MsRUFBRSxNQUFNO2dCQUNoRCx5Q0FBeUMsRUFBRSxPQUFPO2FBQ3JELENBQUMsQ0FBQztZQUNPLFlBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO2dCQUMxQyxvQ0FBb0MsRUFBRSxpQkFBaUI7Z0JBQ3ZELHlDQUF5QyxFQUFFLFFBQVE7Z0JBQ25ELHdDQUF3QyxFQUFFLFNBQVM7Z0JBQ25ELHlDQUF5QyxFQUFFLFNBQVM7YUFDdkQsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUMsQ0FBQTtJQUVEO1FBQ0ksbUNBQ1csU0FBMEM7WUFBMUMsY0FBUyxHQUFULFNBQVMsQ0FBaUM7UUFDbEQsQ0FBQztRQUVHLHdDQUFJLEdBQVgsVUFBWSxNQUFrQyxFQUFFLGVBQWlDLEVBQUUsY0FBNkI7WUFDNUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osV0FBVyxFQUFFLE1BQU0sQ0FBQyxLQUFLO2dCQUN6QixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsSUFBSSx1Q0FBdUM7Z0JBQzFFLFVBQVUsRUFBRSxxREFBNEI7Z0JBQ3hDLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixNQUFNLEVBQUU7b0JBQ0osWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO29CQUNqQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07aUJBQ3hCO2dCQUNELG1CQUFtQixFQUFFLElBQUk7YUFDNUIsQ0FBQztpQkFDRCxJQUFJLENBQUMsVUFBQyxHQUFHO2dCQUNOLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekIsQ0FBQztZQUNMLENBQUMsRUFBRTtnQkFDQyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUNqQixjQUFjLEVBQUUsQ0FBQztnQkFDckIsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUNMLGdDQUFDO0lBQUQsQ0E1QkEsQUE0QkMsSUFBQTtJQUVELE9BQU87U0FDRixNQUFNLENBQUMsdUJBQXVCLENBQUM7U0FDL0IsTUFBTSxDQUFDLGVBQWUsQ0FBQztTQUN2QixPQUFPLENBQUMsOEJBQThCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztBQUM1RSxDQUFDOzs7QUNoRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFFckQsb0NBQWtDO0FBQ2xDLGlDQUErQjtBQUMvQix5Q0FBdUM7OztBQ0p2QywrREFJZ0M7QUFDaEMsMkZBSXNEO0FBRXpDLFFBQUEsa0JBQWtCLEdBQVcsR0FBRyxDQUFDO0FBQ2pDLFFBQUEsbUJBQW1CLEdBQVcsR0FBRyxDQUFDO0FBQ2xDLFFBQUEsbUJBQW1CLEdBQUcsZ0NBQWdDLENBQUM7QUFFcEUsSUFBTSwyQkFBMkIsR0FBVyxDQUFDLENBQUM7QUFDOUMsSUFBTSxlQUFlLEdBQUc7SUFDdEIsU0FBUyxFQUFFLDBCQUFrQjtJQUM3QixVQUFVLEVBQUUsMkJBQW1CO0lBQy9CLE1BQU0sRUFBRSxFQUFFO0lBQ1YsU0FBUyxFQUFFLGtDQUFrQztJQUU3QyxtQkFBbUIsRUFBRSxpQkFBaUI7SUFDdEMsdUJBQXVCLEVBQUUsdUNBQXVDO0NBQ2pFLENBQUM7QUFFRixDQUFDO0lBb0JDO1FBbUJFLDZCQUNVLE1BQWlDLEVBQ2pDLFVBQXFDLEVBQ3JDLFFBQWlDLEVBQ2pDLFFBQWlDLEVBQ2pDLFFBQWdCLEVBQ3hCLFdBQTZCLEVBQzdCLFlBQStCLEVBQy9CLFFBQW1DO1lBUnJDLGlCQW9EQztZQW5EUyxXQUFNLEdBQU4sTUFBTSxDQUEyQjtZQUNqQyxlQUFVLEdBQVYsVUFBVSxDQUEyQjtZQUNyQyxhQUFRLEdBQVIsUUFBUSxDQUF5QjtZQUNqQyxhQUFRLEdBQVIsUUFBUSxDQUF5QjtZQUNqQyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBckJuQix1QkFBa0IsR0FBUSxJQUFJLENBQUM7WUFDL0IsbUJBQWMsR0FBWSxJQUFJLENBQUM7WUFDL0IsZUFBVSxHQUFRLElBQUksQ0FBQztZQXdCNUIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNsQixnQkFBZ0IsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7YUFDMUMsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUUsVUFBVTtnQkFDdEQsTUFBTSxDQUFDO29CQUNMLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztvQkFDbEIsV0FBVyxFQUFFLEtBQUs7b0JBQ2xCLEtBQUssRUFBRSxVQUFVO29CQUNqQixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJO3dCQUM1QixJQUFNLFNBQVMsR0FBRyxLQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUU3QyxNQUFNLENBQUMsMkNBQW9CLENBQUMsc0NBQWUsRUFBRTs0QkFDM0MsR0FBRyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUN2QyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUk7NEJBQ2xCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7eUJBQ3JCLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUM7aUJBQ0gsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBR0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxVQUFDLE1BQU07Z0JBQzNDLEtBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBR1QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBR2xCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQ2hDLEtBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQy9DLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUV0RSxLQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUs7b0JBQzVCLEtBQUs7eUJBQ0YsbUJBQW1CLENBQUMsS0FBSSxDQUFDLGdCQUFnQixDQUFDO3lCQUMxQyxZQUFZLENBQUMsS0FBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzt5QkFDbkUsa0JBQWtCLEVBQUU7eUJBQ3BCLG1CQUFtQixFQUFFLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDO1FBR00sdUNBQVMsR0FBaEI7WUFDRSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDbEMsQ0FBQztRQUdPLG1DQUFLLEdBQWIsVUFBYyxNQUFNO1lBQXBCLGlCQW1EQztZQWxEQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzVCLElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBRTdCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFekMsTUFBTSxDQUFDO1lBQ1QsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRTFCLE1BQU0sQ0FBQztZQUNULENBQUM7WUFFRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDdkMsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQzNFLEVBQUUsQ0FBQyxDQUFDLGVBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6RixpQkFBaUIsR0FBRyxDQUFDLENBQUM7b0JBRXRCLEVBQUUsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN4QixJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO3dCQUV6RSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFDLElBQUk7NEJBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUM1QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO3dCQUUvRyxJQUFJLENBQUMsUUFBUSxDQUFDOzRCQUNaLEtBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO3dCQUMzQixDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO3dCQUN6SSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUM7NEJBQ1osS0FBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7d0JBQzNCLENBQUMsQ0FBQyxDQUFDO29CQUNMLENBQUM7b0JBRUQsTUFBTSxDQUFDO2dCQUNULENBQUM7WUFDSCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ1osS0FBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFHTSwwQ0FBWSxHQUFuQixVQUFvQixLQUFLLEVBQUUsS0FBSztZQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN0QyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDWixDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDN0MsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQztRQUVNLDJDQUFhLEdBQXBCLFVBQXFCLEtBQUs7WUFDeEIsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBQy9CLENBQUM7UUFFTSw4Q0FBZ0IsR0FBdkIsVUFBd0IsS0FBSztZQUE3QixpQkFPQztZQU5DLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ1osS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQzFCLEtBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLDJCQUFtQixFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFN0QsS0FBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDdkQsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVNLGtEQUFvQixHQUEzQixVQUE0QixLQUFLLEVBQUUsS0FBSztZQUN0QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0gsQ0FBQztRQUdPLGtEQUFvQixHQUE1QixVQUE2QixVQUFrQixFQUFFLE1BQWM7WUFDN0QsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsS0FBSyxVQUFVO29CQUNiLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDdEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ25DLENBQUM7b0JBQ0QsS0FBSyxDQUFDO2dCQUNSLEtBQUssVUFBVTtvQkFDUCxJQUFBOzs7OztxQkFVTCxFQVRDLHdCQUFTLEVBQ1Qsb0JBQU8sRUFDUCw0QkFBVyxFQUNYLGdDQUFhLENBTWQ7b0JBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDL0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO3dCQUN2QyxJQUFJLEVBQUUsV0FBVztxQkFDbEIsQ0FBQyxDQUFDO29CQUVILElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsQyxLQUFLLENBQUM7WUFDVixDQUFDO1FBQ0gsQ0FBQztRQUdPLDZDQUFlLEdBQXZCLFVBQXdCLElBQVM7WUFDL0IsSUFBTSxTQUFTLEdBQWtCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEYsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzNGLFNBQVMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUUvRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFFTyx5Q0FBVyxHQUFuQixVQUFvQixLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVM7WUFDM0MsSUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRXZELENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSztnQkFDcEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTywwQ0FBWSxHQUFwQixVQUFxQixTQUFTLEVBQUUsTUFBUTtZQUN0QyxJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQ3BELFVBQVUsR0FBRyxNQUFNLEtBQUssU0FBUyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztZQUUzRixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFDLElBQUksRUFBRSxLQUFLO2dCQUN4QixJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUNoRCxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQyxHQUFHLFVBQVUsQ0FBQztZQUM1RCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTywwQ0FBWSxHQUFwQixVQUFxQixTQUFTO1lBQTlCLGlCQThCQztZQTdCQyxJQUFNLGFBQWEsR0FBRyxFQUFFLEVBQ3RCLE1BQU0sR0FBRyxFQUFFLEVBQ1gsVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUdsQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQUUsS0FBSztnQkFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBQyxDQUFDO29CQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUE7Z0JBQ25DLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1QsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxVQUFDLEtBQUs7Z0JBQ3BDLEtBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDN0IsS0FBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDO1lBRUgsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLO2dCQUNuQixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztZQUVuQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxVQUFDLFNBQVMsRUFBRSxLQUFLO2dCQUM3QyxLQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxzQ0FBUSxHQUFoQixVQUFpQixXQUFXO1lBQTVCLGlCQTRCQztZQTNCQyxJQUFNLEtBQUssR0FBRztnQkFDWixLQUFLLEVBQUUsV0FBVyxDQUFDLEtBQUs7Z0JBQ3hCLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUk7b0JBQ2xDLElBQU0sU0FBUyxHQUFHLEtBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTdDLE1BQU0sQ0FBQywyQ0FBb0IsQ0FBQyxzQ0FBZSxFQUFFO3dCQUMzQyxHQUFHLEVBQUUsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDO3dCQUM1QyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUk7d0JBQ2xCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7cUJBQ3JCLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUM7YUFDSCxDQUFDO1lBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRS9DLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ1osS0FBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBQ3JGLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUNsQixrREFBcUIsQ0FBQyw2Q0FBZ0IsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSSxDQUFDLGdCQUFnQixFQUFFLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUMvSSxZQUFZLENBQUMsS0FBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztxQkFDbkUsa0JBQWtCLEVBQUU7cUJBQ3BCLG1CQUFtQixFQUFFLENBQ3ZCLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVPLCtDQUFpQixHQUF6QixVQUEwQixRQUFRLEVBQUUsS0FBSyxFQUFFLGNBQWM7WUFBekQsaUJBaUJDO1lBaEJDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO2dCQUNwQixJQUFNLFNBQVMsR0FBRyxLQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU3QyxJQUFNLE9BQU8sR0FBRywyQ0FBb0IsQ0FBQyxzQ0FBZSxFQUFFO29CQUNwRCxHQUFHLEVBQUUsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDO29CQUM1QyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2xCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7aUJBQ3JCLENBQUMsQ0FBQztnQkFFSCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV2QixDQUFDLENBQUMsT0FBTyxDQUFDO3FCQUNQLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDOUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO3FCQUNyQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sZ0RBQWtCLEdBQTFCLFVBQTJCLFlBQVk7WUFBdkMsaUJBUUM7WUFQQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUMsV0FBVztnQkFDL0IsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxXQUFXO29CQUNyQyxLQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUs7d0JBQzVCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzVDLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sNkNBQWUsR0FBdkIsVUFBd0IsVUFBVSxFQUFFLElBQUksRUFBRSxnQkFBZ0I7WUFBMUQsaUJBT0M7WUFOQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUssRUFBRSxLQUFLO2dCQUNqQyxNQUFNLENBQUMsa0RBQXFCLENBQUMsNkNBQWdCLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUMvRyxZQUFZLENBQUMsS0FBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztxQkFDbkUsa0JBQWtCLEVBQUU7cUJBQ3BCLG1CQUFtQixFQUFFLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sK0NBQWlCLEdBQXpCLFVBQTBCLFlBQWMsRUFBRyxXQUFhO1lBQXhELGlCQVVDO1lBVEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUM1RSxDQUFDO2dCQUVELEtBQUs7cUJBQ0Ysa0JBQWtCLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQztxQkFDN0MsbUJBQW1CLEVBQUUsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTywrQ0FBaUIsR0FBekI7WUFDRSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxpREFBbUIsR0FBM0IsVUFBNEIsY0FBYztZQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxjQUFjLEdBQUcsMkJBQTJCO2dCQUM5RSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRU8sbURBQXFCLEdBQTdCLFVBQThCLElBQUk7WUFDaEMsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBRWxCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztnQkFDNUIsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFNUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDZCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO29CQUN4QixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO29CQUMzQixNQUFNLENBQUM7Z0JBQ1QsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRU8seURBQTJCLEdBQW5DLFVBQW9DLGNBQWM7WUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsY0FBYyxHQUFHLGNBQWMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3BHLENBQUM7UUFFTyxpREFBbUIsR0FBM0IsVUFBNEIsS0FBSztZQUMvQixJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWhFLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFFTyxnREFBa0IsR0FBMUIsVUFBMkIsS0FBSztZQUFoQyxpQkErQkM7WUE5QkMsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUM1QixJQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDMUQsSUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBRXpELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFFakQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM3QixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBRTVCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztnQkFDaEUsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJO2dCQUM3QyxHQUFHLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUc7YUFDNUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFckIsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDakIsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDaEYsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxNQUFNLENBQUM7Z0JBQ1QsQ0FBQztnQkFFRCxJQUFJLENBQUMsa0JBQWtCO3FCQUNwQixTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUM7cUJBQ3pDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRTlDLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ1osS0FBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ2xDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNSLENBQUM7UUFDSCxDQUFDO1FBRU8sK0NBQWlCLEdBQXpCO1lBQ0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRS9DLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUVPLGdEQUFrQixHQUExQjtZQUNFLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUU3RCxNQUFNLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJO2dCQUN4QixHQUFHLEVBQUUsYUFBYSxDQUFDLEdBQUc7YUFDdkIsQ0FBQztRQUNKLENBQUM7UUFFTyxzREFBd0IsR0FBaEM7WUFDRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFNBQVM7Z0JBQ2hDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLHNDQUFRLEdBQWhCLFVBQWlCLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSTtZQUM3QixJQUFJLElBQUksQ0FBQztZQUNULElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3QyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUN6QixNQUFNLEVBQUUsQ0FBQztZQUVaLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUV0QixJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVoQixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEQsQ0FBQztZQUVELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BDLElBQUksRUFBRSxJQUFJO2dCQUNWLEVBQUUsRUFBRSxFQUFFO2dCQUNOLElBQUksRUFBRSxTQUFTO2FBQ2hCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyw0Q0FBYyxHQUF0QixVQUF1QixLQUFLO1lBQzFCLElBQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3pFLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV4RCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6RSxDQUFDO1lBRUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDakMsQ0FBQztRQUVPLHVEQUF5QixHQUFqQyxVQUFrQyxLQUFLO1lBQXZDLGlCQWNDO1lBYkMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1lBQ3JDLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFFOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixLQUFLLEVBQUUsV0FBVztnQkFDbEIsTUFBTSxFQUFFLEVBQUU7YUFDWCxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNaLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUksQ0FBQyxVQUFVLENBQUMsS0FBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZFLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDakMsQ0FBQztRQUVPLGlEQUFtQixHQUEzQixVQUE0QixLQUFLO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBQ3RELENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEtBQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQzNELENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUM5QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzdCLENBQUM7UUFDSCxDQUFDO1FBRU8sc0RBQXdCLEdBQWhDLFVBQWlDLEtBQUs7WUFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUM3RCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0gsQ0FBQztRQUVPLGlEQUFtQixHQUEzQixVQUE0QixLQUFLO1lBQy9CLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVPLHdDQUFVLEdBQWxCO1lBQUEsaUJBbUVDO1lBbEVDLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ1osS0FBSSxDQUFDLGNBQWMsR0FBRyxLQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDL0MsS0FBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3RFLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2dCQUNyRixLQUFJLENBQUMsVUFBVSxHQUFHLEtBQUksQ0FBQyxlQUFlLENBQUMsS0FBSSxDQUFDLE1BQU0sRUFBRSxLQUFJLENBQUMsSUFBSSxFQUFFLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUV0RixRQUFRLENBQUMscUJBQXFCLENBQUM7cUJBQzVCLFNBQVMsQ0FBQztvQkFDVCxVQUFVLEVBQUU7d0JBQ1YsT0FBTyxFQUFFLElBQUk7d0JBQ2IsU0FBUyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMvQixLQUFLLEVBQUUsR0FBRztxQkFDWDtvQkFDRCxPQUFPLEVBQUUsVUFBQyxLQUFLO3dCQUNiLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtvQkFDakMsQ0FBQztvQkFDRCxNQUFNLEVBQUUsVUFBQyxLQUFLO3dCQUNaLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQTtvQkFDaEMsQ0FBQztvQkFDRCxLQUFLLEVBQUUsVUFBQyxLQUFLO3dCQUNYLEtBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO29CQUMxQixDQUFDO2lCQUNGLENBQUMsQ0FBQztnQkFFTCxRQUFRLENBQUMsaUNBQWlDLENBQUM7cUJBQ3hDLFFBQVEsQ0FBQztvQkFDUixNQUFNLEVBQUUsVUFBQyxLQUFLO3dCQUNaLEtBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtvQkFDdkMsQ0FBQztvQkFDRCxXQUFXLEVBQUUsVUFBQyxLQUFLO3dCQUNqQixLQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ2pDLENBQUM7b0JBQ0QsZ0JBQWdCLEVBQUUsVUFBQyxLQUFLO3dCQUN0QixLQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ3RDLENBQUM7b0JBQ0QsV0FBVyxFQUFFLFVBQUMsS0FBSzt3QkFDakIsS0FBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFBO29CQUNqQyxDQUFDO2lCQUNGLENBQUMsQ0FBQztnQkFFTCxRQUFRLENBQUMsc0JBQXNCLENBQUM7cUJBQzdCLFFBQVEsQ0FBQztvQkFDUixNQUFNLEVBQUUsVUFBQyxLQUFLO3dCQUNaLEtBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQzVCLENBQUM7b0JBQ0QsV0FBVyxFQUFFLFVBQUMsS0FBSzt3QkFDakIsS0FBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFBO29CQUNqQyxDQUFDO29CQUNELGdCQUFnQixFQUFFLFVBQUMsS0FBSzt3QkFDdEIsS0FBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFBO29CQUN0QyxDQUFDO29CQUNELFdBQVcsRUFBRSxVQUFDLEtBQUs7d0JBQ2pCLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtvQkFDakMsQ0FBQztpQkFDRixDQUFDLENBQUM7Z0JBRUwsS0FBSSxDQUFDLFVBQVU7cUJBQ1osRUFBRSxDQUFDLHNCQUFzQixFQUFFLHlCQUF5QixFQUFFO29CQUNyRCxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2pELENBQUMsQ0FBQyxLQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNCLENBQUMsQ0FBQztxQkFDRCxFQUFFLENBQUMsa0JBQWtCLEVBQUU7b0JBQ3RCLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxDQUFDLENBQUM7WUFFUCxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUixDQUFDO1FBQ0gsMEJBQUM7SUFBRCxDQXZrQkEsQUF1a0JDLElBQUE7SUFFRCxJQUFNLGFBQWEsR0FBeUI7UUFDMUMsUUFBUSxFQUFFO1lBQ1IsY0FBYyxFQUFFLG9CQUFvQjtZQUNwQyxZQUFZLEVBQUUsa0JBQWtCO1lBQ2hDLE9BQU8sRUFBRSxtQkFBbUI7WUFDNUIsZ0JBQWdCLEVBQUUsc0JBQXNCO1NBQ3pDO1FBRUQsV0FBVyxFQUFFLDBCQUEwQjtRQUN2QyxVQUFVLEVBQUUsbUJBQW1CO0tBQ2hDLENBQUE7SUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztTQUN6QixTQUFTLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDbEQsQ0FBQzs7O0FDbm9CRCw4QkFBcUMsV0FBZ0MsRUFBRSxPQUFZO0lBQ2pGLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRkQsb0RBRUM7QUFxQkQsSUFBSSxpQkFBaUIsR0FBRztJQUN0QixPQUFPLEVBQUUsQ0FBQztJQUNWLE9BQU8sRUFBRSxDQUFDO0NBQ1gsQ0FBQztBQUVGO0lBT0UseUJBQWEsT0FBWTtRQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFTSxpQ0FBTyxHQUFkO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVNLGlDQUFPLEdBQWQsVUFBZSxLQUFLLEVBQUUsTUFBTTtRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRTFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ1osS0FBSyxFQUFFLEtBQUs7Z0JBQ1osTUFBTSxFQUFFLE1BQU07YUFDZixDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTSxxQ0FBVyxHQUFsQixVQUFtQixJQUFJLEVBQUUsR0FBRztRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRXBCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ1osSUFBSSxFQUFFLElBQUk7Z0JBQ1YsR0FBRyxFQUFFLEdBQUc7YUFDVCxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTSw2Q0FBbUIsR0FBMUI7UUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNsQixDQUFDO0lBQUEsQ0FBQztJQUVLLG9DQUFVLEdBQWpCLFVBQWtCLE1BQU07UUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV2QyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUFBLENBQUM7SUFFSyxpQ0FBTyxHQUFkO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFBQSxDQUFDO0lBRUssbUNBQVMsR0FBaEI7UUFDRSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7YUFDdEIsUUFBUSxDQUFDLHFCQUFxQixDQUFDO2FBQy9CLEdBQUcsQ0FBQztZQUNILFFBQVEsRUFBRSxVQUFVO1lBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDM0IsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQzdCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7U0FDaEMsQ0FBQyxDQUFDO1FBRUwsSUFBSSxDQUFDLElBQUk7YUFDTixRQUFRLENBQUMsY0FBYyxDQUFDO2FBQ3hCLEdBQUcsQ0FBQztZQUNILE1BQU0sRUFBRSxNQUFNO1NBQ2YsQ0FBQzthQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFBQSxDQUFDO0lBRUssa0NBQVEsR0FBZixVQUFnQixTQUFTO1FBQ3ZCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUk7aUJBQ04sV0FBVyxDQUFDLGNBQWMsQ0FBQztpQkFDM0IsR0FBRyxDQUFDO2dCQUNILElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQzlCLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7YUFDN0IsQ0FBQztpQkFDRCxFQUFFLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxJQUFJO2lCQUNOLEdBQUcsQ0FBQztnQkFDSCxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUM5QixHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUM1QixNQUFNLEVBQUUsRUFBRTthQUNYLENBQUM7aUJBQ0QsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRS9CLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFWjtZQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN0QixDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUk7aUJBQ04sR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7aUJBQ2pCLEdBQUcsQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDM0MsQ0FBQztJQUNILENBQUM7SUFBQSxDQUFDO0lBRUssNENBQWtCLEdBQXpCLFVBQTBCLE1BQU07UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUFBLENBQUM7SUFFSyxvQ0FBVSxHQUFqQjtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBQUEsQ0FBQztJQUVLLG9DQUFVLEdBQWpCLFVBQWtCLE9BQU87UUFDdkIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQUEsQ0FBQztJQUNKLHNCQUFDO0FBQUQsQ0FySUEsQUFxSUMsSUFBQTtBQXJJWSwwQ0FBZTtBQXVJNUIsT0FBTztLQUNKLE1BQU0sQ0FBQyxZQUFZLENBQUM7S0FDcEIsT0FBTyxDQUFDLGFBQWEsRUFBRTtJQUN0QixNQUFNLENBQUMsVUFBVSxPQUFPO1FBQ3RCLElBQUksT0FBTyxHQUFHLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDakIsQ0FBQyxDQUFBO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FDL0tMLENBQUM7SUFLQywyQkFDRSxNQUFpQixFQUNqQixLQUFhLEVBQ2IsS0FBOEI7UUFFOUIsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixFQUFFLEVBQy9DLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRWhELEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJO1lBQzFCLElBQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRCLHVCQUF1QixJQUFJO1lBQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO2lCQUNkLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQztpQkFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQztpQkFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWixDQUFDO0lBQ0gsQ0FBQztJQUVEO1FBQ0UsTUFBTSxDQUFDO1lBQ0wsUUFBUSxFQUFFLEdBQUc7WUFDYixJQUFJLEVBQUUsaUJBQWlCO1NBQ3hCLENBQUM7SUFDSixDQUFDO0lBRUQsT0FBTztTQUNKLE1BQU0sQ0FBQyxZQUFZLENBQUM7U0FDcEIsU0FBUyxDQUFDLG1CQUFtQixFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRW5ELENBQUM7OztBQ25DRCwrQkFBc0MsV0FBaUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJO0lBQ3BHLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRkQsc0RBRUM7QUFrQ0QsSUFBTSxxQkFBcUIsR0FBRyxDQUFDLENBQUM7QUFFaEM7SUFTRSwwQkFBWSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJO1FBSmxDLGNBQVMsR0FBUSxFQUFFLENBQUM7UUFDcEIsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUk3QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQztRQUN0QyxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sS0FBSyxxQkFBcUIsQ0FBQztJQUMxRCxDQUFDO0lBRU0sa0NBQU8sR0FBZCxVQUFlLElBQUk7UUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQUEsQ0FBQztJQUVLLDRDQUFpQixHQUF4QixVQUF5QixHQUFHLEVBQUUsR0FBRztRQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQUEsQ0FBQztJQUVLLG1DQUFRLEdBQWYsVUFBZ0IsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPO1FBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkUsQ0FBQztJQUNILENBQUM7SUFBQSxDQUFDO0lBRUssbURBQXdCLEdBQS9CLFVBQWdDLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTztRQUN4RCxJQUFJLGNBQWMsQ0FBQztRQUNuQixJQUFJLGVBQWUsQ0FBQztRQUNwQixJQUFNLFFBQVEsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUc1QyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNkLGNBQWMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFMUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUNwQixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzdDLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2hGLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUdELEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBTSxZQUFZLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztZQUU1RCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM1RCxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkUsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxLQUFLLENBQUMsSUFBSSxZQUFZLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2hFLGVBQWUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbkUsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELGVBQWUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDNUQsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksWUFBWSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ25FLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3JDLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDaEUsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuRSxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDekQsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUM1RCxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLFlBQVksQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzVDLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDaEUsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuRSxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDaEUsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuRSxDQUFDO2dCQUNILENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN6RCxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUdELEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUQsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDaEUsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdkUsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2hFLGVBQWUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZFLENBQUM7WUFDSCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLENBQUM7WUFDTCxLQUFLLEVBQUUsY0FBYztZQUNyQixHQUFHLEVBQUUsZUFBZTtTQUNyQixDQUFDO0lBQ0osQ0FBQztJQUFBLENBQUM7SUFFSyxrQ0FBTyxHQUFkLFVBQWUsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTztRQUM3QyxJQUFJLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBRW5CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBRXhCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxHQUFHLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO2dCQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMxQixLQUFLLENBQUM7Z0JBQ1IsQ0FBQztZQUNILENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUdELEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxHQUFHLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQzFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO2dCQUM3QixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hDLEtBQUssQ0FBQztnQkFDUixDQUFDO1lBQ0gsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUFBLENBQUM7SUFFSyxrREFBdUIsR0FBOUIsVUFBK0IsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPO1FBQ3ZELElBQUksY0FBYyxDQUFDO1FBQ25CLElBQUksZUFBZSxDQUFDO1FBQ3BCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBTSxRQUFRLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRy9DLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2QsY0FBYyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUUxRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDN0MsY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDaEYsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2QsY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckQsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RCxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELE1BQU0sQ0FBQztZQUNMLEtBQUssRUFBRSxjQUFjO1lBQ3JCLEdBQUcsRUFBRSxlQUFlO1NBQ3JCLENBQUM7SUFDSixDQUFDO0lBQUEsQ0FBQztJQUVLLHNDQUFXLEdBQWxCLFVBQW1CLFFBQVE7UUFDekIsSUFBSSxRQUFRLENBQUM7UUFFYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNiLFFBQVEsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDM0MsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDZixDQUFDO1FBQ0gsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDYixRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDZixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUFBLENBQUM7SUFFSyxxQ0FBVSxHQUFqQixVQUFrQixHQUFHLEVBQUUsR0FBRztRQUN4QixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN4QyxDQUFDO0lBQUEsQ0FBQztJQUVLLHVDQUFZLEdBQW5CLFVBQW9CLE9BQU87UUFDekIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksS0FBSyxDQUFDO1FBRVYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHLEVBQUUsUUFBUTtZQUNuQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQUMsSUFBSTtnQkFDakQsTUFBTSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUM7WUFDMUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLENBQUM7WUFDVCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUFBLENBQUM7SUFFSyx1Q0FBWSxHQUFuQixVQUFvQixLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUk7UUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHO1lBQ3pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO2dCQUNmLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHO29CQUM5QyxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ25CLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUFBLENBQUM7SUFFSyx3Q0FBYSxHQUFwQjtRQUNFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRztZQUN6QixHQUFHLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtnQkFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUFBLENBQUM7SUFFSyw4Q0FBbUIsR0FBMUIsVUFBMkIsT0FBTztRQUNoQyxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sS0FBSyxxQkFBcUIsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUFBLENBQUM7SUFFSyx1Q0FBWSxHQUFuQixVQUFvQixlQUFpQjtRQUNuQyxJQUFNLElBQUksR0FBRyxJQUFJLEVBQ1gsU0FBUyxHQUFHLGVBQWUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDbEQsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzVGLElBQU0sU0FBUyxHQUFHLENBQUMsRUFDYixJQUFJLEdBQUcsQ0FBQyxFQUNSLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVE7WUFDdkMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWhDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFaEMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUM3QixhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFDMUMsQ0FBQztnQkFHRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNsRCxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7d0JBQzlFLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzlCLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCx1QkFBdUIsWUFBWTtZQUNqQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQzdDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLElBQUksRUFBRSxDQUFDO29CQUNQLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBRWQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQy9CLFNBQVMsR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLENBQUM7Z0JBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUM3RixJQUFJLElBQUksR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFHbEYsU0FBUyxDQUFDLElBQUksQ0FBQztvQkFDYixHQUFHLEVBQUUsR0FBRztvQkFDUixJQUFJLEVBQUUsSUFBSTtvQkFDVixNQUFNLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFDbEMsS0FBSyxFQUFFLElBQUksR0FBRyxTQUFTO29CQUN2QixHQUFHLEVBQUUsSUFBSTtvQkFDVCxHQUFHLEVBQUUsU0FBUztpQkFDZixDQUFDLENBQUM7Z0JBRUgsU0FBUyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUFBLENBQUM7SUFFSyw2Q0FBa0IsR0FBekIsVUFBMEIsWUFBWSxFQUFFLFdBQVc7UUFDakQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLFFBQVEsQ0FBQztRQUViLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7WUFDdEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hDLElBQUksU0FBUyxDQUFDO1lBQ2QsSUFBSSxLQUFLLENBQUM7WUFDVixJQUFJLE1BQU0sQ0FBQztZQUNYLElBQUksS0FBSyxDQUFDO1lBRVYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JGLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDaEcsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDbEQsQ0FBQztnQkFHRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQ3pDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7Z0JBQzVDLENBQUM7Z0JBRUQsUUFBUSxHQUFHLFNBQVMsQ0FBQztnQkFFckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU5QyxTQUFTLEVBQUUsQ0FBQztZQUNkLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BFLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUV4QixFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDM0MsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2dCQUM5QyxDQUFDO2dCQUVELFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO2dCQUVyQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFaEQsU0FBUyxJQUFJLENBQUMsQ0FBQztZQUNqQixDQUFDO1lBSUQsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztvQkFDdEIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO29CQUNwQixHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUc7aUJBQ25CLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUM7WUFDVCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQUEsQ0FBQztJQUVLLDhDQUFtQixHQUExQjtRQUNFLElBQUksYUFBYSxFQUFFLFlBQVksQ0FBQztRQUVoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELGFBQWEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBQyxJQUFJO1lBQ3ZDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUVoQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUV6RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNoQixZQUFZLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQUMsSUFBSTtnQkFDdEMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUVoQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN4RSxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFBQSxDQUFDO0lBRUssd0NBQWEsR0FBcEIsVUFBcUIsSUFBSTtRQUN2QixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUk7WUFDdkMsTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2hELENBQUM7SUFBQSxDQUFDO0lBRUssK0NBQW9CLEdBQTNCLFVBQTRCLE1BQU0sRUFBRSxXQUFXO1FBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSzthQUNkLE1BQU0sQ0FBQyxVQUFDLElBQUk7WUFDWCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEMsTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXO2dCQUN6QixRQUFRLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDL0UsUUFBUSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDbEIsQ0FBQztJQUFBLENBQUM7SUFFSyx1Q0FBWSxHQUFuQixVQUFvQixJQUFJO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUFBLENBQUM7SUFFSyxvQ0FBUyxHQUFoQixVQUFpQixTQUFTLEVBQUUsVUFBVTtRQUNwQyxJQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUQsSUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRWpELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQUEsQ0FBQztJQUVLLHFDQUFVLEdBQWpCLFVBQWtCLFVBQVU7UUFDMUIsSUFBSSxXQUFXLENBQUM7UUFFaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUs7WUFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNmLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQUFBLENBQUM7SUFFSyw0Q0FBaUIsR0FBeEIsVUFBeUIsSUFBSTtRQUMzQixJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBQyxJQUFJO1lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7SUFBQSxDQUFDO0lBQ0osdUJBQUM7QUFBRCxDQS9kQSxBQStkQyxJQUFBO0FBL2RZLDRDQUFnQjtBQWllN0IsT0FBTztLQUNKLE1BQU0sQ0FBQyxZQUFZLENBQUM7S0FDcEIsT0FBTyxDQUFDLGNBQWMsRUFBRTtJQUN2QixNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJO1FBQzVDLElBQUksT0FBTyxHQUFHLElBQUksZ0JBQWdCLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbEUsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDLENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQzs7O0FDbmhCTCxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUVqQyxrQ0FBZ0M7QUFDaEMsdUJBQXFCO0FBQ3JCLHdEQUFxRDtBQUNyRCwwREFBdUQ7OztBQ0x2RCwyQkFBeUI7QUFDekIsNkJBQTJCO0FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7SUFDN0IsV0FBVztJQUNYLFlBQVk7SUFDWixxQkFBcUI7SUFDckIsd0JBQXdCO0lBR3hCLFdBQVc7SUFDWCxjQUFjO0lBQ2QsYUFBYTtJQUNiLFdBQVc7SUFDWCxjQUFjO0lBQ2QsYUFBYTtJQUNiLFlBQVk7Q0FDYixDQUFDLENBQUM7QUFFSCwyQ0FBeUM7QUFDekMsMkJBQXlCO0FBQ3pCLHVCQUFxQjs7O0FDaEJyQixDQUFDO0lBQ0c7UUFLSSwrQkFDSSxZQUF5QyxFQUN6QyxRQUFpQyxFQUNqQyxnQkFBaUQ7WUFFakQsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7WUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBQzlDLENBQUM7UUFFTSwyQ0FBVyxHQUFsQixVQUFtQixNQUFNLEVBQUUsR0FBSyxFQUFHLFNBQVcsRUFBRyxhQUFlO1lBQWhFLGlCQTBCQztZQXhCTyxJQUFBLDBCQUFRLEVBQ1IsZ0NBQVcsRUFDWCxrQkFBSSxDQUNHO1lBQ1gsSUFBSSxNQUFNLENBQUM7WUFFWCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNQLElBQU0sWUFBWSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2xHLE1BQU0sQ0FBQyxhQUFhLElBQUksSUFBSTtvQkFDeEIsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNwRixZQUFZLENBQUM7WUFDckIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEYsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJO29CQUNqRCxNQUFNLEdBQUcsU0FBUyxHQUFHLEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEYsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU0saURBQWlCLEdBQXhCLFVBQXlCLFFBQVEsRUFBRSxLQUFLO1lBQ3BDLElBQ0ksY0FBYyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQ3pFLGVBQWUsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsWUFBWSxFQUM3RSxVQUFVLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssRUFDbkYsV0FBVyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQ3RGLE1BQU0sR0FBRyxDQUFDLEVBQ1YsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUVuQixFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsV0FBVyxHQUFHLGVBQWUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDOUUsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUM5QyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUM7Z0JBQ2xELFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxHQUFHLGVBQWUsR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUM1RSxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2pDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLFVBQVUsR0FBRyxjQUFjLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDN0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxXQUFXLEdBQUcsY0FBYyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQzVFLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDaEQsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNsQyxDQUFDO1lBRUQsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBQ0wsNEJBQUM7SUFBRCxDQXBFQSxBQW9FQyxJQUFBO0lBR0QsSUFBTSxTQUFTLEdBQUcsbUJBQW1CLE1BQXdCO1FBQ3pELE1BQU0sQ0FBQztZQUNILFFBQVEsRUFBRSxHQUFHO1lBQ2IsSUFBSSxFQUFFLFVBQVUsS0FBZ0IsRUFBRSxPQUFlLEVBQUUsS0FBVTtnQkFDekQsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLO29CQUN2QixRQUFRLENBQUMsS0FBSyxFQUFFO3dCQUNaLE1BQU0sRUFBRSxLQUFLO3FCQUNoQixDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1NBQ0osQ0FBQTtJQUNMLENBQUMsQ0FBQTtJQUVELE9BQU87U0FDRixNQUFNLENBQUMsY0FBYyxDQUFDO1NBQ3RCLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQztTQUNuRCxTQUFTLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzlDLENBQUM7OztBQzFGRDtJQUtJO0lBQWdCLENBQUM7SUFDckIsc0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDBDQUFlOzs7Ozs7OztBQ041QiwrREFFbUM7QUFLbkMsQ0FBQztJQUNDO1FBQXVDLDRDQUFpQjtRQUN0RCxrQ0FDVSw0QkFBa0Q7WUFENUQsWUFHRSxpQkFBTyxTQWFSO1lBZlMsa0NBQTRCLEdBQTVCLDRCQUE0QixDQUFzQjtZQUkxRCxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDakIsS0FBSSxDQUFDLElBQUksR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNsRixLQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDYixLQUFLLEVBQUUsYUFBYTtvQkFDcEIsS0FBSyxFQUFFO3dCQUNMLEtBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDdkIsQ0FBQztpQkFDRixDQUFDLENBQUM7Z0JBQ0gsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDcEQsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUM7WUFDNUMsQ0FBQzs7UUFDSCxDQUFDO1FBRU8sZ0RBQWEsR0FBckI7WUFBQSxpQkFnQkM7WUFmQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxXQUFXLEVBQUUscUJBQXFCO2dCQUNsQyxNQUFNLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO29CQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO2lCQUN4QjtnQkFDRCxZQUFZLEVBQUUsNkNBQTZDO2FBQzVELEVBQUUsVUFBQyxNQUFXO2dCQUNiLEtBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU3QixLQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2xDLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUgsK0JBQUM7SUFBRCxDQXJDQSxBQXFDQyxDQXJDc0MscUNBQWlCLEdBcUN2RDtJQUVELElBQU0sY0FBYyxHQUF5QjtRQUMzQyxRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUUsYUFBYTtTQUN2QjtRQUNELFVBQVUsRUFBRSx3QkFBd0I7UUFDcEMsV0FBVyxFQUFFLHNDQUFzQztLQUNwRCxDQUFBO0lBRUQsT0FBTztTQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUM7U0FDbkIsU0FBUyxDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBRXBELENBQUM7Ozs7Ozs7O0FDM0RELCtEQUVtQztBQUluQyxDQUFDO0lBQ0M7UUFBb0MseUNBQWlCO1FBS25ELCtCQUNFLE1BQWlCLEVBQ1QsUUFBZ0IsRUFDaEIsUUFBaUMsRUFDakMsNEJBQWtEO1lBSjVELFlBTUUsaUJBQU8sU0F1QlI7WUEzQlMsY0FBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixjQUFRLEdBQVIsUUFBUSxDQUF5QjtZQUNqQyxrQ0FBNEIsR0FBNUIsNEJBQTRCLENBQXNCO1lBTnJELGFBQU8sR0FBVyxJQUFJLENBQUM7WUFVNUIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO29CQUFDLEtBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFJLENBQUMsSUFBSSxFQUFFLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0UsQ0FBQztZQUVELEtBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNiLEtBQUssRUFBRSxhQUFhO2dCQUNwQixLQUFLLEVBQUU7b0JBQ0wsS0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN2QixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUM7WUFDMUMsS0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxLQUFJLENBQUMsT0FBTyxDQUFDO1lBRXBELEtBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUdqQixNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsRUFBRSxVQUFDLE1BQU07Z0JBQ1IsS0FBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDOztRQUNMLENBQUM7UUFFTyx5Q0FBUyxHQUFqQjtZQUFBLGlCQU1DO1lBTEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDO29CQUNaLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsQ0FBQztRQUNILENBQUM7UUFFTyw2Q0FBYSxHQUFyQjtZQUFBLGlCQStCQztZQTlCQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUM7Z0JBQ3JDLFdBQVcsRUFBRSxxQkFBcUI7Z0JBQ2xDLE1BQU0sRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSTt3QkFDekIsT0FBTyxFQUFFLENBQUM7d0JBQ1YsT0FBTyxFQUFFLENBQUM7cUJBQ1g7b0JBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtvQkFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFDekIsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtvQkFDdkIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNyQixhQUFhLEVBQUUsVUFBQyxPQUFPO3dCQUNyQixLQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztvQkFDekIsQ0FBQztpQkFDRjtnQkFDRCxZQUFZLEVBQUUsMENBQTBDO2FBQ3pELEVBQUUsVUFBQyxNQUFXO2dCQUNiLEtBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU3QixLQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2xDLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hDLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2xDLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hDLEtBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDeEMsQ0FBQyxFQUFFO2dCQUNELEtBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTywyQ0FBVyxHQUFuQixVQUFvQixLQUFLO1lBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFTSwwQ0FBVSxHQUFqQixVQUFrQixNQUFNO1lBQXhCLGlCQVNDO1lBUkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFFekMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDO29CQUNaLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNWLENBQUM7UUFDSCxDQUFDO1FBR08saURBQWlCLEdBQXpCLFVBQTBCLFFBQVEsRUFBRSxLQUFLO1lBQ3ZDLElBQ0UsY0FBYyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQ3pFLGVBQWUsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsWUFBWSxFQUM3RSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUNqRCxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUNwRCxNQUFNLEdBQUcsQ0FBQyxFQUNWLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFFakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLFdBQVcsR0FBRyxlQUFlLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLFNBQVMsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDOUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDO2dCQUNsRCxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsR0FBRyxlQUFlLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDNUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMvQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxVQUFVLEdBQUcsY0FBYyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQzdDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBVyxHQUFHLGNBQWMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUM1RSxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ2hELFNBQVMsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDaEMsQ0FBQztZQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0F0SEEsQUFzSEMsQ0F0SG1DLHFDQUFpQixHQXNIcEQ7SUFHRCxJQUFNLFdBQVcsR0FBeUI7UUFDeEMsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLGFBQWE7U0FDdkI7UUFDRCxVQUFVLEVBQUUscUJBQXFCO1FBQ2pDLFdBQVcsRUFBRSxnQ0FBZ0M7S0FDOUMsQ0FBQTtJQUVELE9BQU87U0FDSixNQUFNLENBQUMsV0FBVyxDQUFDO1NBQ25CLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUM5QyxDQUFDOzs7QUMzSUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFaEMscUNBQW1DO0FBQ25DLCtCQUE2QjtBQUM3QixvQ0FBa0M7QUFDbEMsc0NBQW9DO0FBQ3BDLCtCQUE2QjtBQUM3QixxQ0FBbUM7QUFDbkMseUNBQXVDO0FBQ3ZDLGdEQUE4Qzs7QUNUOUMsQ0FBQztJQUNDLFlBQVksQ0FBQztJQUViLE9BQU87U0FDSixNQUFNLENBQUMsV0FBVyxDQUFDO1NBQ25CLFNBQVMsQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFFN0M7UUFDRSxNQUFNLENBQUM7WUFDTCxRQUFRLEVBQVUsSUFBSTtZQUN0QixXQUFXLEVBQU8sOEJBQThCO1NBQ2pELENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7Ozs7Ozs7QUNiTCw4Q0FBaUQ7QUFFakQ7SUFBdUMscUNBQWU7SUErQnBEO1FBQ0UsVUFBVSxDQUFDO1FBRGIsWUFHRSxpQkFBTyxTQUNSO1FBbENNLFVBQUksR0FBUSxDQUFDO2dCQUNsQixLQUFLLEVBQUUsYUFBYTtnQkFDcEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2dCQUNwQixPQUFPLEVBQUUsQ0FBQzt3QkFDTixLQUFLLEVBQUUsT0FBTzt3QkFDZCxNQUFNLEVBQUUsWUFBWTt3QkFDcEIsTUFBTSxFQUFFOzRCQUNOLEtBQUssRUFBRSxDQUFDOzRCQUNSLEtBQUssRUFBRSxDQUFDO3lCQUNUO3FCQUNGO29CQUNEO3dCQUNFLEtBQUssRUFBRSxPQUFPO3dCQUNkLE1BQU0sRUFBRSxZQUFZO3dCQUNwQixNQUFNLEVBQUU7NEJBQ04sS0FBSyxFQUFFLENBQUM7NEJBQ1IsS0FBSyxFQUFFLENBQUM7eUJBQ1Q7cUJBQ0Y7b0JBQ0Q7d0JBQ0UsS0FBSyxFQUFFLE9BQU87d0JBQ2QsTUFBTSxFQUFFLFlBQVk7d0JBQ3BCLE1BQU0sRUFBRTs0QkFDTixLQUFLLEVBQUUsQ0FBQzs0QkFDUixLQUFLLEVBQUUsQ0FBQzt5QkFDVDtxQkFDRjtpQkFDRjthQUNGLENBQUMsQ0FBQzs7SUFNSCxDQUFDO0lBRU0sc0NBQVUsR0FBakIsVUFBa0IsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJO1FBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pDLENBQUM7SUFDSCxDQUFDO0lBQUEsQ0FBQztJQUVLLHNDQUFVLEdBQWpCLFVBQWtCLE1BQU07UUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDM0MsQ0FBQztJQUFBLENBQUM7SUFDSix3QkFBQztBQUFELENBbkRBLEFBbURDLENBbkRzQyw2QkFBZSxHQW1EckQ7QUFuRFksOENBQWlCO0FBcUQ5QixDQUFDO0lBQ0M7UUFHRTtRQUFlLENBQUM7UUFFVCxpQ0FBSSxHQUFYO1lBQ0UsVUFBVSxDQUFDO1lBRVgsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBRTFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3ZCLENBQUM7UUFDSCx5QkFBQztJQUFELENBYkEsQUFhQyxJQUFBO0lBRUQsT0FBTztTQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUM7U0FDbkIsUUFBUSxDQUFDLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBQ25ELENBQUM7Ozs7Ozs7O0FDMUVELCtEQUVtQztBQUtuQyxDQUFDO0lBQ0M7UUFBb0MseUNBQWlCO1FBRW5ELCtCQUNVLDRCQUFrRDtZQUQ1RCxZQUdFLGlCQUFPLFNBYVI7WUFmUyxrQ0FBNEIsR0FBNUIsNEJBQTRCLENBQXNCO1lBSTFELEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixLQUFJLENBQUMsSUFBSSxHQUFHLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSSxDQUFDLElBQUksRUFBRSxLQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUM7WUFDcEYsQ0FBQztZQUVELEtBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNiLEtBQUssRUFBRSxhQUFhO2dCQUNwQixLQUFLLEVBQUU7b0JBQ0wsS0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN2QixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUM7O1FBQzlDLENBQUM7UUFFTyw2Q0FBYSxHQUFyQjtZQUFBLGlCQWlCQztZQWhCQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxXQUFXLEVBQUUscUJBQXFCO2dCQUNsQyxNQUFNLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO29CQUN2QixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUN6QixJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO2lCQUN4QjtnQkFDRCxZQUFZLEVBQUUsMENBQTBDO2FBQ3pELEVBQUUsVUFBQyxNQUFXO2dCQUNiLEtBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDMUIsS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDbEMsS0FBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdCLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hDLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQXRDQSxBQXNDQyxDQXRDbUMscUNBQWlCLEdBc0NwRDtJQUVELElBQU0sV0FBVyxHQUF5QjtRQUN4QyxRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUUsYUFBYTtTQUN2QjtRQUNELFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsV0FBVyxFQUFFLGdDQUFnQztLQUM5QyxDQUFBO0lBRUQsT0FBTztTQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUM7U0FDbkIsU0FBUyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzlDLENBQUM7O0FDM0RELFlBQVksQ0FBQzs7Ozs7O0FBRWIsK0RBRW1DO0FBUW5DLENBQUM7SUFDQztRQUFzQywyQ0FBaUI7UUFJckQsaUNBQ1UsTUFBc0IsRUFDdEIsUUFBYSxFQUNiLFFBQWlDLEVBQ2pDLDRCQUFrRCxFQUNsRCxpQkFBeUM7WUFMbkQsWUFPRSxpQkFBTyxTQU1SO1lBWlMsWUFBTSxHQUFOLE1BQU0sQ0FBZ0I7WUFDdEIsY0FBUSxHQUFSLFFBQVEsQ0FBSztZQUNiLGNBQVEsR0FBUixRQUFRLENBQXlCO1lBQ2pDLGtDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBc0I7WUFDbEQsdUJBQWlCLEdBQWpCLGlCQUFpQixDQUF3QjtZQVI1QyxtQkFBYSxHQUFXLFFBQVEsQ0FBQztZQUNqQyx1QkFBaUIsR0FBVyxJQUFJLENBQUM7WUFXdEMsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEtBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksS0FBSSxDQUFDLGFBQWEsQ0FBQztnQkFDdEUsS0FBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLElBQUksS0FBSSxDQUFDLGlCQUFpQixDQUFDO1lBQ3BGLENBQUM7O1FBQ0gsQ0FBQztRQUVNLDZDQUFXLEdBQWxCLFVBQW1CLE1BQU07WUFBekIsaUJBSUM7WUFIQyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNaLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTSw0Q0FBVSxHQUFqQixVQUFrQixNQUFNO1lBQXhCLGlCQVNDO1lBUkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFFekMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQUMsS0FBSztvQkFDdEMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEtBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFFLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUNILDhCQUFDO0lBQUQsQ0FuQ0EsQUFtQ0MsQ0FuQ3FDLHFDQUFpQixHQW1DdEQ7SUFFRCxJQUFNLG1CQUFtQixHQUF5QjtRQUNoRCxRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUUsYUFBYTtTQUN2QjtRQUNELFVBQVUsRUFBRSx1QkFBdUI7UUFDbkMsV0FBVyxFQUFFLGlEQUFpRDtLQUMvRCxDQUFBO0lBRUQsT0FBTztTQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUM7U0FDbkIsU0FBUyxDQUFDLHdCQUF3QixFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDOUQsQ0FBQzs7Ozs7Ozs7QUM3REQsK0RBRW1DO0FBS25DLENBQUM7SUFDQztRQUF1Qyw0Q0FBaUI7UUFHdEQsa0NBQ0UsTUFBc0IsRUFDZCxRQUFpQyxFQUNqQyxRQUFhLEVBQ2IsNEJBQWtELEVBQ2xELHFCQUEwQjtZQUxwQyxZQU9FLGlCQUFPLFNBK0JSO1lBcENTLGNBQVEsR0FBUixRQUFRLENBQXlCO1lBQ2pDLGNBQVEsR0FBUixRQUFRLENBQUs7WUFDYixrQ0FBNEIsR0FBNUIsNEJBQTRCLENBQXNCO1lBQ2xELDJCQUFxQixHQUFyQixxQkFBcUIsQ0FBSztZQVA3QixrQkFBWSxHQUFZLElBQUksQ0FBQztZQVdsQyxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDakIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQUMsS0FBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRSxDQUFDO1lBRUQsS0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ2IsS0FBSyxFQUFFLGFBQWE7Z0JBQ3BCLEtBQUssRUFBRTtvQkFDTCxLQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRixDQUFDLENBQUM7WUFDSCxLQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixLQUFLLEVBQUUsaUJBQWlCO2dCQUN4QixLQUFLLEVBQUU7b0JBQ0wsS0FBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQ2hDLENBQUM7YUFDRixDQUFDLENBQUM7WUFFSCxLQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxLQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUV2RSxNQUFNLENBQUMsTUFBTSxDQUFDLDZCQUE2QixFQUFFO2dCQUMzQyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7WUFHSCxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsRUFBRSxVQUFDLE1BQU07Z0JBQ1IsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztvQkFBQyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDNUMsQ0FBQyxDQUFDLENBQUM7O1FBQ0wsQ0FBQztRQUVPLGdEQUFhLEdBQXJCO1lBQUEsaUJBYUM7WUFaQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxXQUFXLEVBQUUscUJBQXFCO2dCQUNsQyxNQUFNLEVBQUU7b0JBQ04sSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtvQkFDdkIsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWTtvQkFDdkMsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2dCQUNELFlBQVksRUFBRSw2Q0FBNkM7YUFDNUQsRUFBRSxVQUFDLE1BQVc7Z0JBQ2IsS0FBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdCLEtBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU0sNkNBQVUsR0FBakIsVUFBa0IsTUFBTTtZQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUV6QyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVNLHlEQUFzQixHQUE3QjtZQUFBLGlCQVVDO1lBVEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQztnQkFDOUIsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWTtnQkFDdkMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUTthQUNuQyxFQUFFLFVBQUMsV0FBVztnQkFDYixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUNoQixLQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO29CQUM3QyxLQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO2dCQUN0RCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8saURBQWMsR0FBdEI7WUFBQSxpQkFLQztZQUpDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ1osS0FBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDM0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQztRQUNILCtCQUFDO0lBQUQsQ0FuRkEsQUFtRkMsQ0FuRnNDLHFDQUFpQixHQW1GdkQ7SUFHRCxJQUFNLGNBQWMsR0FBeUI7UUFDM0MsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLGFBQWE7WUFDdEIsS0FBSyxFQUFFLEdBQUc7WUFDVixLQUFLLEVBQUUsR0FBRztTQUNYO1FBQ0QsVUFBVSxFQUFFLHdCQUF3QjtRQUNwQyxXQUFXLEVBQUUsc0NBQXNDO0tBQ3BELENBQUE7SUFFRCxPQUFPO1NBQ0osTUFBTSxDQUFDLFdBQVcsQ0FBQztTQUNuQixTQUFTLENBQUMsbUJBQW1CLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDcEQsQ0FBQzs7Ozs7Ozs7QUMzR0QsK0RBRW1DO0FBRW5DLENBQUM7SUFDQyxJQUFNLGFBQVcsR0FBVyxFQUFFLENBQUM7SUFDL0IsSUFBTSxXQUFTLEdBQVcsR0FBRyxDQUFDO0lBRTlCO1FBQXlDLDhDQUFpQjtRQU94RCxvQ0FDRSxhQUFrQixFQUNsQixNQUFzQixFQUN0QixRQUFpQztZQUhuQyxZQUtFLGlCQUFPLFNBU1I7WUFqQk0sV0FBSyxHQUFZLEtBQUssQ0FBQztZQUN2QixlQUFTLEdBQVcsYUFBVyxDQUFDO1lBUXJDLEtBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLEtBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBRTFCLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixLQUFJLENBQUMsSUFBSSxHQUFHLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSSxDQUFDLElBQUksRUFBRSxLQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUM7WUFDcEYsQ0FBQztZQUVELEtBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7UUFDdEIsQ0FBQztRQUVNLCtDQUFVLEdBQWpCLFVBQWtCLE1BQU07WUFBeEIsaUJBU0M7WUFSQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUV6QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDYixLQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNyQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDO1FBRU8saURBQVksR0FBcEI7WUFDRSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxXQUFTLEdBQUcsYUFBVyxDQUFDO1FBQzlHLENBQUM7UUFDSCxpQ0FBQztJQUFELENBckNBLEFBcUNDLENBckN3QyxxQ0FBaUIsR0FxQ3pEO0lBR0QsSUFBTSxnQkFBZ0IsR0FBeUI7UUFDN0MsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLGFBQWE7U0FDdkI7UUFDRCxVQUFVLEVBQUUsMEJBQTBCO1FBQ3RDLFdBQVcsRUFBRSwwQ0FBMEM7S0FDeEQsQ0FBQTtJQUVELE9BQU87U0FDSixNQUFNLENBQUMsV0FBVyxDQUFDO1NBQ25CLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hELENBQUM7O0FDM0REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7XHJcbiAgSVdpZGdldFRlbXBsYXRlU2VydmljZVxyXG59IGZyb20gJy4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQge1xyXG4gIElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlLFxyXG4gIElBZGRDb21wb25lbnREaWFsb2dwcm92aWRlclxyXG59IGZyb20gJy4vZGlhbG9ncy9hZGRfY29tcG9uZW50L0FkZENvbXBvbmVudFByb3ZpZGVyJ1xyXG5cclxue1xyXG4gIGNvbnN0IHNldFRyYW5zbGF0aW9ucyA9IGZ1bmN0aW9uICgkaW5qZWN0b3I6IG5nLmF1dG8uSUluamVjdG9yU2VydmljZSkge1xyXG4gICAgY29uc3QgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgOiBudWxsO1xyXG4gICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgIERST1BfVE9fQ1JFQVRFX05FV19HUk9VUDogJ0Ryb3AgaGVyZSB0byBjcmVhdGUgbmV3IGdyb3VwJyxcclxuICAgICAgfSk7XHJcbiAgICAgICggPCBhbnkgPiBwaXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgRFJPUF9UT19DUkVBVEVfTkVXX0dST1VQOiAn0J/QtdGA0LXRgtCw0YnQuNGC0LUg0YHRjtC00LAg0LTQu9GPINGB0L7Qt9C00LDQvdC40Y8g0L3QvtCy0L7QuSDQs9GA0YPQv9C/0YsnXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgY29uZmlndXJlQXZhaWxhYmxlV2lkZ2V0cyA9IGZ1bmN0aW9uIChwaXBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlcjogSUFkZENvbXBvbmVudERpYWxvZ3Byb3ZpZGVyKSB7XHJcbiAgICBwaXBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlci5jb25maWdXaWRnZXRMaXN0KFtcclxuICAgICAgW3tcclxuICAgICAgICAgIHRpdGxlOiAnRXZlbnQnLFxyXG4gICAgICAgICAgaWNvbjogJ2RvY3VtZW50JyxcclxuICAgICAgICAgIG5hbWU6ICdldmVudCcsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnUG9zaXRpb24nLFxyXG4gICAgICAgICAgaWNvbjogJ2xvY2F0aW9uJyxcclxuICAgICAgICAgIG5hbWU6ICdwb3NpdGlvbicsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFt7XHJcbiAgICAgICAgICB0aXRsZTogJ0NhbGVuZGFyJyxcclxuICAgICAgICAgIGljb246ICdkYXRlJyxcclxuICAgICAgICAgIG5hbWU6ICdjYWxlbmRhcicsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnU3RpY2t5IE5vdGVzJyxcclxuICAgICAgICAgIGljb246ICdub3RlLXRha2UnLFxyXG4gICAgICAgICAgbmFtZTogJ25vdGVzJyxcclxuICAgICAgICAgIGFtb3VudDogMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGl0bGU6ICdTdGF0aXN0aWNzJyxcclxuICAgICAgICAgIGljb246ICd0ci1zdGF0aXN0aWNzJyxcclxuICAgICAgICAgIG5hbWU6ICdzdGF0aXN0aWNzJyxcclxuICAgICAgICAgIGFtb3VudDogMFxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgXSk7XHJcbiAgfVxyXG5cclxuICBjbGFzcyBkcmFnZ2FibGVPcHRpb25zIHtcclxuICAgIHRpbGVXaWR0aDogbnVtYmVyO1xyXG4gICAgdGlsZUhlaWdodDogbnVtYmVyO1xyXG4gICAgZ3V0dGVyOiBudW1iZXI7XHJcbiAgICBpbmxpbmU6IGJvb2xlYW47XHJcbiAgfVxyXG5cclxuICBjb25zdCBERUZBVUxUX0dSSURfT1BUSU9OUzogZHJhZ2dhYmxlT3B0aW9ucyA9IHtcclxuICAgIHRpbGVXaWR0aDogMTUwLCAvLyAncHgnXHJcbiAgICB0aWxlSGVpZ2h0OiAxNTAsIC8vICdweCdcclxuICAgIGd1dHRlcjogMTAsIC8vICdweCdcclxuICAgIGlubGluZTogZmFsc2VcclxuICB9O1xyXG5cclxuICBpbnRlcmZhY2UgRGFzaGJvYXJkQmluZGluZ3Mge1xyXG4gICAgICBncmlkT3B0aW9uczogYW55O1xyXG4gICAgICBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiBhbnk7XHJcbiAgICAgIGdyb3VwZWRXaWRnZXRzOiBhbnk7XHJcbiAgfVxyXG5cclxuICBjbGFzcyBEYXNoYm9hcmRDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIsIERhc2hib2FyZEJpbmRpbmdzIHtcclxuICAgIHByaXZhdGUgZGVmYXVsdEdyb3VwTWVudUFjdGlvbnM6IGFueSA9IFt7XHJcbiAgICAgICAgdGl0bGU6ICdBZGQgQ29tcG9uZW50JyxcclxuICAgICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KGdyb3VwSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRpdGxlOiAnUmVtb3ZlJyxcclxuICAgICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlR3JvdXAoZ3JvdXBJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnY29uZmlndXJhdGUgZ3JvdXAgd2l0aCBpbmRleDonLCBncm91cEluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF07XHJcbiAgICBwcml2YXRlIF9pbmNsdWRlVHBsOiBzdHJpbmcgPSAnPHBpcC17eyB0eXBlIH19LXdpZGdldCBncm91cD1cImdyb3VwSW5kZXhcIiBpbmRleD1cImluZGV4XCInICtcclxuICAgICAgJ3BpcC1vcHRpb25zPVwiJHBhcmVudC4kY3RybC5ncm91cGVkV2lkZ2V0c1tncm91cEluZGV4XVtcXCdzb3VyY2VcXCddW2luZGV4XS5vcHRzXCI+JyArXHJcbiAgICAgICc8L3BpcC17eyB0eXBlIH19LXdpZGdldD4nO1xyXG5cclxuICAgIHB1YmxpYyBncm91cGVkV2lkZ2V0czogYW55O1xyXG4gICAgcHVibGljIGRyYWdnYWJsZUdyaWRPcHRpb25zOiBkcmFnZ2FibGVPcHRpb25zO1xyXG4gICAgcHVibGljIHdpZGdldHNUZW1wbGF0ZXM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cE1lbnVBY3Rpb25zOiBhbnkgPSB0aGlzLmRlZmF1bHRHcm91cE1lbnVBY3Rpb25zO1xyXG4gICAgcHVibGljIHdpZGdldHNDb250ZXh0OiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JpZE9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkYXR0cnM6IGFueSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW55LFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBBZGRDb21wb25lbnREaWFsb2c6IElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgLy8gQWRkIGNsYXNzIHRvIHN0eWxlIHNjcm9sbCBiYXJcclxuICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1zY3JvbGwnKTtcclxuXHJcbiAgICAgIC8vIFNldCB0aWxlcyBncmlkIG9wdGlvbnNcclxuICAgICAgdGhpcy5kcmFnZ2FibGVHcmlkT3B0aW9ucyA9IHRoaXMuZ3JpZE9wdGlvbnMgfHwgREVGQVVMVF9HUklEX09QVElPTlM7XHJcblxyXG4gICAgICAvLyBTd2l0Y2ggaW5saW5lIGRpc3BsYXlpbmdcclxuICAgICAgaWYgKHRoaXMuZHJhZ2dhYmxlR3JpZE9wdGlvbnMuaW5saW5lID09PSB0cnVlKSB7XHJcbiAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ2lubGluZS1ncmlkJyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gRXh0ZW5kIGdyb3VwJ3MgbWVudSBhY3Rpb25zXHJcbiAgICAgIGlmICh0aGlzLmdyb3VwQWRkaXRpb25hbEFjdGlvbnMpIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZ3JvdXBNZW51QWN0aW9ucywgdGhpcy5ncm91cEFkZGl0aW9uYWxBY3Rpb25zKTtcclxuXHJcbiAgICAgIC8vIENvbXBpbGUgd2lkZ2V0c1xyXG4gICAgICB0aGlzLndpZGdldHNDb250ZXh0ID0gJHNjb3BlO1xyXG4gICAgICB0aGlzLmNvbXBpbGVXaWRnZXRzKCk7XHJcblxyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICAgIH0sIDcwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb21waWxlV2lkZ2V0cygpIHtcclxuICAgICAgXy5lYWNoKHRoaXMuZ3JvdXBlZFdpZGdldHMsIChncm91cCwgZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLnJlbW92ZWRXaWRnZXRzID0gZ3JvdXAucmVtb3ZlZFdpZGdldHMgfHwgW10sXHJcbiAgICAgICAgICBncm91cC5zb3VyY2UgPSBncm91cC5zb3VyY2UubWFwKCh3aWRnZXQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEVzdGFibGlzaCBkZWZhdWx0IHByb3BzXHJcbiAgICAgICAgICAgIHdpZGdldC5zaXplID0gd2lkZ2V0LnNpemUgfHwge1xyXG4gICAgICAgICAgICAgIGNvbFNwYW46IDEsXHJcbiAgICAgICAgICAgICAgcm93U3BhbjogMVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3aWRnZXQuaW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgd2lkZ2V0Lmdyb3VwSW5kZXggPSBncm91cEluZGV4O1xyXG4gICAgICAgICAgICB3aWRnZXQubWVudSA9IHdpZGdldC5tZW51IHx8IHt9O1xyXG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh3aWRnZXQubWVudSwgW3tcclxuICAgICAgICAgICAgICB0aXRsZTogJ1JlbW92ZScsXHJcbiAgICAgICAgICAgICAgY2xpY2s6IChpdGVtLCBwYXJhbXMsIG9iamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVXaWRnZXQoaXRlbSwgcGFyYW1zLCBvYmplY3QpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBvcHRzOiB3aWRnZXQsXHJcbiAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMucGlwV2lkZ2V0VGVtcGxhdGUuZ2V0VGVtcGxhdGUod2lkZ2V0LCB0aGlzLl9pbmNsdWRlVHBsKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZENvbXBvbmVudChncm91cEluZGV4KSB7XHJcbiAgICAgIHRoaXMucGlwQWRkQ29tcG9uZW50RGlhbG9nXHJcbiAgICAgICAgLnNob3codGhpcy5ncm91cGVkV2lkZ2V0cywgZ3JvdXBJbmRleClcclxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgdmFyIGFjdGl2ZUdyb3VwO1xyXG5cclxuICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGRhdGEuZ3JvdXBJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgYWN0aXZlR3JvdXAgPSB0aGlzLmdyb3VwZWRXaWRnZXRzW2RhdGEuZ3JvdXBJbmRleF07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhY3RpdmVHcm91cCA9IHtcclxuICAgICAgICAgICAgICB0aXRsZTogJ05ldyBncm91cCcsXHJcbiAgICAgICAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuYWRkV2lkZ2V0cyhhY3RpdmVHcm91cC5zb3VyY2UsIGRhdGEud2lkZ2V0cyk7XHJcblxyXG4gICAgICAgICAgaWYgKGRhdGEuZ3JvdXBJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0cy5wdXNoKGFjdGl2ZUdyb3VwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmNvbXBpbGVXaWRnZXRzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyByZW1vdmVHcm91cCA9IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmVHcm91cCcsIGdyb3VwSW5kZXgpO1xyXG4gICAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnNwbGljZShncm91cEluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZFdpZGdldHMoZ3JvdXAsIHdpZGdldHMpIHtcclxuICAgICAgd2lkZ2V0cy5mb3JFYWNoKCh3aWRnZXRHcm91cCkgPT4ge1xyXG4gICAgICAgIHdpZGdldEdyb3VwLmZvckVhY2goKHdpZGdldCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHdpZGdldC5hbW91bnQpIHtcclxuICAgICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkod2lkZ2V0LmFtb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGdyb3VwLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0Lm5hbWVcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlV2lkZ2V0KGl0ZW0sIHBhcmFtcywgb2JqZWN0KSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMgPSBbXTtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cy5wdXNoKHBhcmFtcy5vcHRpb25zLmluZGV4KTtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5zb3VyY2Uuc3BsaWNlKHBhcmFtcy5vcHRpb25zLmluZGV4LCAxKTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cyA9IFtdO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb25zdCBwaXBEYXNoYm9hcmQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgZ3JpZE9wdGlvbnM6ICc9cGlwR3JpZE9wdGlvbnMnLFxyXG4gICAgICBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiAnPXBpcEdyb3VwQWN0aW9ucycsXHJcbiAgICAgIGdyb3VwZWRXaWRnZXRzOiAnPXBpcEdyb3VwcydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBEYXNoYm9hcmRDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdEYXNoYm9hcmQuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuY29uZmlnKGNvbmZpZ3VyZUF2YWlsYWJsZVdpZGdldHMpXHJcbiAgICAuY29uZmlnKHNldFRyYW5zbGF0aW9ucylcclxuICAgIC5jb21wb25lbnQoJ3BpcERhc2hib2FyZCcsIHBpcERhc2hib2FyZCk7XHJcblxyXG59IiwiZXhwb3J0IGNsYXNzIEFkZENvbXBvbmVudERpYWxvZ1dpZGdldCB7XHJcbiAgICB0aXRsZTogc3RyaW5nO1xyXG4gICAgaWNvbjogc3RyaW5nO1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgYW1vdW50OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbnRyb2xsZXIge1xyXG4gICAgcHVibGljIGRlZmF1bHRXaWRnZXRzOiBbQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0W11dO1xyXG4gICAgcHVibGljIGdyb3VwczogYW55O1xyXG4gICAgcHVibGljIHRvdGFsV2lkZ2V0czogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBncm91cHMsIC8vIExhdGVyIG1heSBiZSBncm91cCB0eXBlXHJcbiAgICAgICAgcHVibGljIGFjdGl2ZUdyb3VwSW5kZXg6IG51bWJlcixcclxuICAgICAgICB3aWRnZXRMaXN0OiBbQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0W11dLFxyXG4gICAgICAgIHB1YmxpYyAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlR3JvdXBJbmRleCA9IF8uaXNOdW1iZXIoYWN0aXZlR3JvdXBJbmRleCkgPyBhY3RpdmVHcm91cEluZGV4IDogLTE7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0V2lkZ2V0cyA9IF8uY2xvbmVEZWVwKHdpZGdldExpc3QpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gXy5tYXAoZ3JvdXBzLCBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwWyd0aXRsZSddO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IHRoaXMuYWN0aXZlR3JvdXBJbmRleCxcclxuICAgICAgICAgICAgd2lkZ2V0czogdGhpcy5kZWZhdWx0V2lkZ2V0c1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgY2FuY2VsKCkge1xyXG4gICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgZW5jcmVhc2UoZ3JvdXBJbmRleDogbnVtYmVyLCB3aWRnZXRJbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3Qgd2lkZ2V0ID0gdGhpcy5kZWZhdWx0V2lkZ2V0c1tncm91cEluZGV4XVt3aWRnZXRJbmRleF07XHJcbiAgICAgICAgd2lkZ2V0LmFtb3VudCsrO1xyXG4gICAgICAgIHRoaXMudG90YWxXaWRnZXRzKys7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBkZWNyZWFzZShncm91cEluZGV4OiBudW1iZXIsIHdpZGdldEluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB3aWRnZXQgPSB0aGlzLmRlZmF1bHRXaWRnZXRzW2dyb3VwSW5kZXhdW3dpZGdldEluZGV4XTtcclxuICAgICAgICB3aWRnZXQuYW1vdW50ID0gd2lkZ2V0LmFtb3VudCA/IHdpZGdldC5hbW91bnQgLSAxIDogMDtcclxuICAgICAgICB0aGlzLnRvdGFsV2lkZ2V0cyA9IHRoaXMudG90YWxXaWRnZXRzID8gdGhpcy50b3RhbFdpZGdldHMgLSAxIDogMDtcclxuICAgIH07XHJcbn0iLCJpbXBvcnQge1xyXG4gIEFkZENvbXBvbmVudERpYWxvZ1dpZGdldCxcclxuICBBZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyXHJcbn0gZnJvbSAnLi9BZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2Uge1xyXG4gIHNob3coZ3JvdXBzLCBhY3RpdmVHcm91cEluZGV4KTogYW5ndWxhci5JUHJvbWlzZSA8IGFueSA+IDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQWRkQ29tcG9uZW50RGlhbG9ncHJvdmlkZXIge1xyXG4gIGNvbmZpZ1dpZGdldExpc3QobGlzdDogW0FkZENvbXBvbmVudERpYWxvZ1dpZGdldFtdXSk6IHZvaWQ7XHJcbn1cclxuXHJcbntcclxuICBjb25zdCBzZXRUcmFuc2xhdGlvbnMgPSBmdW5jdGlvbigkaW5qZWN0b3I6IG5nLmF1dG8uSUluamVjdG9yU2VydmljZSkge1xyXG4gICAgY29uc3QgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgOiBudWxsO1xyXG4gICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAoPGFueT5waXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygnZW4nLCB7XHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1RJVExFOiAnQWRkIGNvbXBvbmVudCcsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1VTRV9IT1RfS0VZUzogJ1VzZSBcIkVudGVyXCIgb3IgXCIrXCIgYnV0dG9ucyBvbiBrZXlib2FyZCB0byBlbmNyZWFzZSBhbmQgXCJEZWxldGVcIiBvciBcIi1cIiB0byBkZWNyZWFzZSB0aWxlcyBhbW91bnQnLFxyXG4gICAgICAgIERBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19DUkVBVEVfTkVXX0dST1VQOiAnQ3JlYXRlIG5ldyBncm91cCdcclxuICAgICAgfSk7XHJcbiAgICAgICg8YW55PnBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdydScsIHtcclxuICAgICAgICBEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfVElUTEU6ICfQlNC+0LHQsNCy0LjRgtGMINC60L7QvNC/0L7QvdC10L3RgicsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1VTRV9IT1RfS0VZUzogJ9CY0YHQv9C+0LvRjNC30YPQudGC0LUgXCJFbnRlclwiINC40LvQuCBcIitcIiDQutC70LDQstC40YjQuCDQvdCwINC60LvQsNCy0LjQsNGC0YPRgNC1INGH0YLQvtCx0Ysg0YPQstC10LvQuNGH0LjRgtGMINC4IFwiRGVsZXRlXCIgb3IgXCItXCIg0YfRgtC+0LHRiyDRg9C80LXQvdGI0LjRgtGMINC60L7Qu9C40YfQtdGB0YLQstC+INGC0LDQudC70L7QsicsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX0NSRUFURV9ORVdfR1JPVVA6ICfQodC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINCz0YDRg9C/0L/RgydcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlIGltcGxlbWVudHMgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2Uge1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSB3aWRnZXRMaXN0OiBbQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0W11dLFxyXG4gICAgICBwcml2YXRlICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgKSB7fVxyXG5cclxuICAgIHB1YmxpYyBzaG93KGdyb3VwcywgYWN0aXZlR3JvdXBJbmRleCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kbWREaWFsb2dcclxuICAgICAgICAuc2hvdyh7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXHJcbiAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgY29udHJvbGxlcjogQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlcixcclxuICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2RpYWxvZ0N0cmwnLFxyXG4gICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZSxcclxuICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgZ3JvdXBzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGdyb3VwcztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWN0aXZlR3JvdXBJbmRleDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBhY3RpdmVHcm91cEluZGV4O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3aWRnZXRMaXN0OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICg8YW55PnRoaXMud2lkZ2V0TGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjbGFzcyBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlciBpbXBsZW1lbnRzIElBZGRDb21wb25lbnREaWFsb2dwcm92aWRlciB7XHJcbiAgICBwcml2YXRlIF9zZXJ2aWNlOiBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlO1xyXG4gICAgcHJpdmF0ZSBfd2lkZ2V0TGlzdDogW0FkZENvbXBvbmVudERpYWxvZ1dpZGdldFtdXSA9IG51bGw7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIHB1YmxpYyBjb25maWdXaWRnZXRMaXN0ID0gZnVuY3Rpb24gKGxpc3Q6IFtBZGRDb21wb25lbnREaWFsb2dXaWRnZXRbXV0pIHtcclxuICAgICAgdGhpcy5fd2lkZ2V0TGlzdCA9IGxpc3Q7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyAkZ2V0KCRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZSkge1xyXG4gICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICBpZiAodGhpcy5fc2VydmljZSA9PSBudWxsKVxyXG4gICAgICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSh0aGlzLl93aWRnZXRMaXN0LCAkbWREaWFsb2cpO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuX3NlcnZpY2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2cnKVxyXG4gICAgLmNvbmZpZyhzZXRUcmFuc2xhdGlvbnMpXHJcbiAgICAucHJvdmlkZXIoJ3BpcEFkZENvbXBvbmVudERpYWxvZycsIEFkZENvbXBvbmVudERpYWxvZ1Byb3ZpZGVyKTtcclxuICAgIGNvbnNvbGUubG9nKCdhZGQgcHJvdmlkZXIgcGlwQWRkQ29tcG9uZW50RGlhbG9nJyk7XHJcbn0iLCJhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2cnLCBbJ25nTWF0ZXJpYWwnXSk7XHJcblxyXG5pbXBvcnQgJy4vQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlcic7XHJcbmltcG9ydCAnLi9BZGRDb21wb25lbnRQcm92aWRlcic7IiwiXHJcbmFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmREaWFsb2dzJywgW1xyXG4gICAgJ3BpcEFkZERhc2hib2FyZENvbXBvbmVudERpYWxvZycsIFxyXG4gICAgJ3BpcFdpZGdldENvbmZpZ0RpYWxvZydcclxuXSk7XHJcblxyXG5pbXBvcnQgJy4vYWRkX2NvbXBvbmVudCc7XHJcbmltcG9ydCAnLi90aWxlX2NvbmZpZyc7IiwiXHJcbmNsYXNzIFRpbGVDb2xvcnMge1xyXG4gICAgc3RhdGljIGFsbDogc3RyaW5nW10gPSBbJ3B1cnBsZScsICdncmVlbicsICdncmF5JywgJ29yYW5nZScsICdibHVlJ107XHJcbn1cclxuXHJcbmNsYXNzIFRpbGVTaXplcyB7XHJcbiAgICBzdGF0aWMgYWxsOiBhbnkgPSBbe1xyXG4gICAgICAgICAgICBuYW1lOiAnREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfU01BTEwnLFxyXG4gICAgICAgICAgICBpZDogJzExJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfV0lERScsXHJcbiAgICAgICAgICAgIGlkOiAnMjEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9MQVJHRScsXHJcbiAgICAgICAgICAgIGlkOiAnMjInXHJcbiAgICAgICAgfVxyXG4gICAgXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFdpZGdldENvbmZpZ0RpYWxvZ0NvbnRyb2xsZXIge1xyXG4gICAgcHVibGljIGNvbG9yczogc3RyaW5nW10gPSBUaWxlQ29sb3JzLmFsbDtcclxuICAgIHB1YmxpYyBzaXplczogYW55ID0gVGlsZVNpemVzLmFsbDtcclxuICAgIHB1YmxpYyBzaXplSWQ6IHN0cmluZyA9IFRpbGVTaXplcy5hbGxbMF0uaWQ7XHJcbiAgICBwdWJsaWMgb25DYW5jZWw6IEZ1bmN0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBwYXJhbXMsXHJcbiAgICAgICAgcHVibGljIGV4dGVuc2lvblVybCxcclxuICAgICAgICBwdWJsaWMgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHRoaXMucGFyYW1zKTtcclxuICAgICAgICB0aGlzLnNpemVJZCA9ICcnICsgdGhpcy5wYXJhbXMuc2l6ZS5jb2xTcGFuICsgdGhpcy5wYXJhbXMuc2l6ZS5yb3dTcGFuO1xyXG5cclxuICAgICAgICB0aGlzLm9uQ2FuY2VsID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQXBwbHkodXBkYXRlZERhdGEpIHtcclxuICAgICAgICB0aGlzWydzaXplJ10uc2l6ZVggPSBOdW1iZXIodGhpcy5zaXplSWQuc3Vic3RyKDAsIDEpKTtcclxuICAgICAgICB0aGlzWydzaXplJ10uc2l6ZVkgPSBOdW1iZXIodGhpcy5zaXplSWQuc3Vic3RyKDEsIDEpKTtcclxuICAgICAgICB0aGlzLiRtZERpYWxvZy5oaWRlKHVwZGF0ZWREYXRhKTtcclxuICAgIH1cclxufSIsInsgICAgXHJcbiAgICBpbnRlcmZhY2UgSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogYW55O1xyXG4gICAgICAgIHBpcERpYWxvZ1Njb3BlOiBhbnk7XHJcbiAgICAgICAgcGlwQXBwbHk6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5nczogSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogJzwnLFxyXG4gICAgICAgIHBpcERpYWxvZ1Njb3BlOiAnPCcsXHJcbiAgICAgICAgcGlwQXBwbHk6ICcmJ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudENoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IG5nLklDaGFuZ2VzT2JqZWN0PGFueT47XHJcblxyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogbmcuSUNoYW5nZXNPYmplY3Q8c3RyaW5nPjtcclxuICAgICAgICBwaXBEaWFsb2dTY29wZTogbmcuSUNoYW5nZXNPYmplY3Q8bmcuSVNjb3BlPjtcclxuXHJcbiAgICAgICAgcGlwQXBwbHk6IG5nLklDaGFuZ2VzT2JqZWN0PCh7dXBkYXRlZERhdGE6IGFueX0pID0+IG5nLklQcm9taXNlPHZvaWQ+PjtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEF0dHJpYnV0ZXMgZXh0ZW5kcyBuZy5JQXR0cmlidXRlcyB7XHJcbiAgICAgICAgcGlwRXh0ZW5zaW9uVXJsOiBzdHJpbmdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRDb250cm9sbGVyIGltcGxlbWVudHMgSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgcGlwRXh0ZW5zaW9uVXJsOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIHBpcERpYWxvZ1Njb3BlOiBuZy5JU2NvcGU7XHJcbiAgICAgICAgcHVibGljIHBpcEFwcGx5OiAocGFyYW06IHt1cGRhdGVkRGF0YTogYW55fSkgPT4gbmcuSVByb21pc2U8dm9pZD47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsIFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksIFxyXG4gICAgICAgICAgICBwcml2YXRlICRhdHRyczogSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEF0dHJpYnV0ZXNcclxuICAgICAgICApIHsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBpcERpYWxvZ1Njb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgY2hhbmdlcy5waXBEaWFsb2dTY29wZS5jdXJyZW50VmFsdWVbJyRzY29wZSddO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgY2hhbmdlcy5waXBEaWFsb2dTY29wZS5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBpcEV4dGVuc2lvblVybCAmJiBjaGFuZ2VzLnBpcEV4dGVuc2lvblVybC5jdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRlbXBsYXRlUmVxdWVzdChjaGFuZ2VzLnBpcEV4dGVuc2lvblVybC5jdXJyZW50VmFsdWUsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdwaXAtZXh0ZW5zaW9uLXBvaW50JykucmVwbGFjZVdpdGgodGhpcy4kY29tcGlsZShodG1sKSh0aGlzLiRzY29wZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbkFwcGx5KCkge1xyXG4gICAgICAgICAgICB0aGlzLnBpcEFwcGx5KHt1cGRhdGVkRGF0YTogdGhpc30pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwaXBXaWRnZXRDb25maWdDb21wb25lbnQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnZGlhbG9ncy90aWxlX2NvbmZpZy9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50Q29udHJvbGxlcixcclxuICAgICAgICBiaW5kaW5nczogV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3NcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nJylcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnQnLCBwaXBXaWRnZXRDb25maWdDb21wb25lbnQpO1xyXG59IiwiaW1wb3J0IHsgV2lkZ2V0Q29uZmlnRGlhbG9nQ29udHJvbGxlciB9IGZyb20gJy4vQ29uZmlnRGlhbG9nQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElXaWRnZXRDb25maWdTZXJ2aWNlIHtcclxuICAgIHNob3cocGFyYW1zOiBJV2lkZ2V0Q29uZmlnRGlhbG9nT3B0aW9ucywgc3VjY2Vzc0NhbGxiYWNrID8gOiAoa2V5KSA9PiB2b2lkLCBjYW5jZWxDYWxsYmFjayA/IDogKCkgPT4gdm9pZCk6IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJV2lkZ2V0Q29uZmlnRGlhbG9nT3B0aW9ucyBleHRlbmRzIGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ09wdGlvbnMge1xyXG4gICAgZGlhbG9nQ2xhc3M/OiBzdHJpbmc7XHJcbiAgICBleHRlbnNpb25Vcmw/OiBzdHJpbmc7XHJcbiAgICBldmVudD86IGFueTtcclxufVxyXG5cclxue1xyXG4gICAgY29uc3Qgc2V0VHJhbnNsYXRpb25zID0gZnVuY3Rpb24oJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgICAgICBjb25zdCBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGVQcm92aWRlcicpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA6IG51bGw7XHJcbiAgICAgICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1RJVExFOiAnRWRpdCB0aWxlJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX1NNQUxMOiAnU21hbGwnLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfV0lERTogJ1dpZGUnLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfTEFSR0U6ICdMYXJnZSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICggPCBhbnkgPiBwaXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfVElUTEU6ICfQmNC30LzQtdC90LjRgtGMINCy0LjQtNC20LXRgicsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTDogJ9Cc0LDQu9C10L0uJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX1dJREU6ICfQqNC40YDQvtC60LjQuScsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9MQVJHRTogJ9CR0L7Qu9GM0YjQvtC5J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZSB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwdWJsaWMgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICAgICAgKSB7fVxyXG5cclxuICAgICAgICBwdWJsaWMgc2hvdyhwYXJhbXM6IElXaWRnZXRDb25maWdEaWFsb2dPcHRpb25zLCBzdWNjZXNzQ2FsbGJhY2sgPyA6IChrZXkpID0+IHZvaWQsIGNhbmNlbENhbGxiYWNrID8gOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50OiBwYXJhbXMuZXZlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHBhcmFtcy50ZW1wbGF0ZVVybCB8fCAnZGlhbG9ncy90aWxlX2NvbmZpZy9Db25maWdEaWFsb2cuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogV2lkZ2V0Q29uZmlnRGlhbG9nQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uVXJsOiBwYXJhbXMuZXh0ZW5zaW9uVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHBhcmFtcy5sb2NhbHNcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2soa2V5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbmNlbENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBXaWRnZXRDb25maWdEaWFsb2cnKVxyXG4gICAgICAgIC5jb25maWcoc2V0VHJhbnNsYXRpb25zKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlJywgV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZSk7XHJcbn0iLCJcclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nJywgWyduZ01hdGVyaWFsJ10pO1xyXG5cclxuaW1wb3J0ICcuL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcbmltcG9ydCAnLi9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQnOyIsImRlY2xhcmUgdmFyIGludGVyYWN0O1xyXG5cclxuaW1wb3J0IHtcclxuICBEcmFnVGlsZVNlcnZpY2UsXHJcbiAgSURyYWdUaWxlU2VydmljZSxcclxuICBJRHJhZ1RpbGVDb25zdHJ1Y3RvclxyXG59IGZyb20gJy4vRHJhZ2dhYmxlVGlsZVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIFRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgSVRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgSVRpbGVzR3JpZENvbnN0cnVjdG9yXHJcbn0gZnJvbSAnLi9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UnO1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVElMRV9XSURUSDogbnVtYmVyID0gMTUwO1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9USUxFX0hFSUdIVDogbnVtYmVyID0gMTUwO1xyXG5leHBvcnQgY29uc3QgVVBEQVRFX0dST1VQU19FVkVOVCA9IFwicGlwVXBkYXRlRGFzaGJvYXJkR3JvdXBzQ29uZmlnXCI7XHJcblxyXG5jb25zdCBTSU1QTEVfTEFZT1VUX0NPTFVNTlNfQ09VTlQ6IG51bWJlciA9IDI7XHJcbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcclxuICB0aWxlV2lkdGg6IERFRkFVTFRfVElMRV9XSURUSCwgLy8gJ3B4J1xyXG4gIHRpbGVIZWlnaHQ6IERFRkFVTFRfVElMRV9IRUlHSFQsIC8vICdweCdcclxuICBndXR0ZXI6IDIwLCAvLyAncHgnXHJcbiAgY29udGFpbmVyOiAncGlwLWRyYWdnYWJsZS1ncmlkOmZpcnN0LW9mLXR5cGUnLFxyXG4gIC8vbW9iaWxlQnJlYWtwb2ludCAgICAgICA6IFhYWCwgICAvLyBHZXQgZnJvbSBwaXBNZWRpYSBTZXJ2aWNlIGluIHRoZSBjb25zdHJ1Y3RvclxyXG4gIGFjdGl2ZURyb3B6b25lQ2xhc3M6ICdkcm9wem9uZS1hY3RpdmUnLFxyXG4gIGdyb3VwQ29udGFuaW5lclNlbGVjdG9yOiAnLnBpcC1kcmFnZ2FibGUtZ3JvdXA6bm90KC5maWN0LWdyb3VwKScsXHJcbn07XHJcblxyXG57XHJcbiAgaW50ZXJmYWNlIElEcmFnZ2FibGVCaW5kaW5ncyB7XHJcbiAgICAgIHRpbGVzVGVtcGxhdGVzOiBhbnk7XHJcbiAgICAgIHRpbGVzQ29udGV4dDogYW55O1xyXG4gICAgICBvcHRpb25zOiBhbnk7XHJcbiAgICAgIGdyb3VwTWVudUFjdGlvbnM6IGFueTtcclxuICAgICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gIH1cclxuXHJcbiAgaW50ZXJmYWNlIElEcmFnZ2FibGVDb250cm9sbGVyU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgdGlsZXNUZW1wbGF0ZXM6IGFueTtcclxuICAgIG9wdGlvbnM6IGFueTtcclxuICB9XHJcblxyXG4gIGludGVyZmFjZSBJVGlsZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgIGluZGV4OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgICBncm91cEluZGV4OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgfVxyXG5cclxuICBjbGFzcyBEcmFnZ2FibGVDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbXBvbmVudENvbnRyb2xsZXIsIElEcmFnZ2FibGVCaW5kaW5ncyB7XHJcbiAgICBwdWJsaWMgb3B0czogYW55O1xyXG4gICAgcHVibGljIGdyb3VwczogYW55O1xyXG4gICAgcHVibGljIHNvdXJjZURyb3Bab25lRWxlbTogYW55ID0gbnVsbDtcclxuICAgIHB1YmxpYyBpc1NhbWVEcm9wem9uZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgdGlsZUdyb3VwczogYW55ID0gbnVsbDtcclxuICAgIHB1YmxpYyBhdmFpbGFibGVXaWR0aDogbnVtYmVyO1xyXG4gICAgcHVibGljIGF2YWlsYWJsZUNvbHVtbnM6IG51bWJlcjtcclxuICAgIHB1YmxpYyBncm91cHNDb250YWluZXJzOiBhbnk7XHJcbiAgICBwdWJsaWMgY29udGFpbmVyOiBhbnk7XHJcbiAgICBwdWJsaWMgYWN0aXZlRHJhZ2dlZEdyb3VwOiBhbnk7XHJcbiAgICBwdWJsaWMgZHJhZ2dlZFRpbGU6IGFueTtcclxuICAgIHB1YmxpYyBjb250YWluZXJPZmZzZXQ6IGFueTtcclxuICAgIHB1YmxpYyB0aWxlc1RlbXBsYXRlczogYW55O1xyXG4gICAgcHVibGljIHRpbGVzQ29udGV4dDogYW55O1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cE1lbnVBY3Rpb25zOiBhbnk7XHJcbiAgICBwdWJsaWMgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlICRzY29wZTogSURyYWdnYWJsZUNvbnRyb2xsZXJTY29wZSxcclxuICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgcGlwRHJhZ1RpbGU6IElEcmFnVGlsZVNlcnZpY2UsXHJcbiAgICAgIHBpcFRpbGVzR3JpZDogSVRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgICAgIHBpcE1lZGlhOiBwaXAubGF5b3V0cy5JTWVkaWFTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgdGhpcy5vcHRzID0gXy5tZXJnZSh7XHJcbiAgICAgICAgbW9iaWxlQnJlYWtwb2ludDogcGlwTWVkaWEuYnJlYWtwb2ludHMueHNcclxuICAgICAgfSwgREVGQVVMVF9PUFRJT05TLCB0aGlzLm9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMgPSB0aGlzLnRpbGVzVGVtcGxhdGVzLm1hcCgoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdGl0bGU6IGdyb3VwLnRpdGxlLFxyXG4gICAgICAgICAgZWRpdGluZ05hbWU6IGZhbHNlLFxyXG4gICAgICAgICAgaW5kZXg6IGdyb3VwSW5kZXgsXHJcbiAgICAgICAgICBzb3VyY2U6IGdyb3VwLnNvdXJjZS5tYXAoKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICAgICAgdHBsOiAkY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgICAgICBzaXplOiB0aWxlLm9wdHMuc2l6ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBZGQgdGVtcGxhdGVzIHdhdGNoZXJcclxuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwudGlsZXNUZW1wbGF0ZXMnLCAobmV3VmFsKSA9PiB7XHJcbiAgICAgICAgdGhpcy53YXRjaChuZXdWYWwpO1xyXG4gICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgZGF0YVxyXG4gICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICAgIC8vIFJlc2l6ZSBoYW5kbGVyIFRPRE86IHJlcGxhY2UgYnkgcGlwIHJlc2l6ZSB3YXRjaGVyc1xyXG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlV2lkdGggPSB0aGlzLmdldENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVDb2x1bW5zID0gdGhpcy5nZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlV2lkdGgpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgIGdyb3VwXHJcbiAgICAgICAgICAgIC5zZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlQ29sdW1ucylcclxuICAgICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sIDUwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUG9zdCBsaW5rIGZ1bmN0aW9uXHJcbiAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdhdGNoIGhhbmRsZXJcclxuICAgIHByaXZhdGUgd2F0Y2gobmV3VmFsKSB7XHJcbiAgICAgIGNvbnN0IHByZXZWYWwgPSB0aGlzLmdyb3VwcztcclxuICAgICAgbGV0IGNoYW5nZWRHcm91cEluZGV4ID0gbnVsbDtcclxuXHJcbiAgICAgIGlmIChuZXdWYWwubGVuZ3RoID4gcHJldlZhbC5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmFkZEdyb3VwKG5ld1ZhbFtuZXdWYWwubGVuZ3RoIC0gMV0pO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuZXdWYWwubGVuZ3RoIDwgcHJldlZhbC5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdyb3VwcyhuZXdWYWwpO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3VmFsLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBXaWRnZXREaWZmID0gcHJldlZhbFtpXS5zb3VyY2UubGVuZ3RoIC0gbmV3VmFsW2ldLnNvdXJjZS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGdyb3VwV2lkZ2V0RGlmZiB8fCAobmV3VmFsW2ldLnJlbW92ZWRXaWRnZXRzICYmIG5ld1ZhbFtpXS5yZW1vdmVkV2lkZ2V0cy5sZW5ndGggPiAwKSkge1xyXG4gICAgICAgICAgY2hhbmdlZEdyb3VwSW5kZXggPSBpO1xyXG5cclxuICAgICAgICAgIGlmIChncm91cFdpZGdldERpZmYgPCAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1RpbGVzID0gbmV3VmFsW2NoYW5nZWRHcm91cEluZGV4XS5zb3VyY2Uuc2xpY2UoZ3JvdXBXaWRnZXREaWZmKTtcclxuXHJcbiAgICAgICAgICAgIF8uZWFjaChuZXdUaWxlcywgKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGlsZScsIHRpbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRkVGlsZXNJbnRvR3JvdXAobmV3VGlsZXMsIHRoaXMudGlsZUdyb3Vwc1tjaGFuZ2VkR3JvdXBJbmRleF0sIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tjaGFuZ2VkR3JvdXBJbmRleF0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZXModGhpcy50aWxlR3JvdXBzW2NoYW5nZWRHcm91cEluZGV4XSwgbmV3VmFsW2NoYW5nZWRHcm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cywgdGhpcy5ncm91cHNDb250YWluZXJzW2NoYW5nZWRHcm91cEluZGV4XSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNPcHRpb25zKG5ld1ZhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbCAmJiB0aGlzLnRpbGVHcm91cHMpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSW5saW5lIGVkaXQgZ3JvdXAgaGFuZGxlcnNcclxuICAgIHB1YmxpYyBvblRpdGxlQ2xpY2soZ3JvdXAsIGV2ZW50KSB7XHJcbiAgICAgIGlmICghZ3JvdXAuZWRpdGluZ05hbWUpIHtcclxuICAgICAgICBncm91cC5vbGRUaXRsZSA9IF8uY2xvbmUoZ3JvdXAudGl0bGUpO1xyXG4gICAgICAgIGdyb3VwLmVkaXRpbmdOYW1lID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldC5jaGlsZHJlblswXSkuZm9jdXMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5jZWxFZGl0aW5nKGdyb3VwKSB7XHJcbiAgICAgIGdyb3VwLnRpdGxlID0gZ3JvdXAub2xkVGl0bGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQmx1clRpdGxlSW5wdXQoZ3JvdXApIHtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ3JvdXAuZWRpdGluZ05hbWUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChVUERBVEVfR1JPVVBTX0VWRU5ULCB0aGlzLmdyb3Vwcyk7XHJcbiAgICAgICAgLy8gVXBkYXRlIHRpdGxlIGluIG91dGVyIHNjb3BlXHJcbiAgICAgICAgdGhpcy50aWxlc1RlbXBsYXRlc1tncm91cC5pbmRleF0udGl0bGUgPSBncm91cC50aXRsZTtcclxuICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25LeWVwcmVzc1RpdGxlSW5wdXQoZ3JvdXAsIGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgIHRoaXMub25CbHVyVGl0bGVJbnB1dChncm91cCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgb3V0ZXIgc2NvcGUgZnVuY3Rpb25zXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzVGVtcGxhdGVzKHVwZGF0ZVR5cGU6IHN0cmluZywgc291cmNlID8gOiBhbnkpIHtcclxuICAgICAgc3dpdGNoICh1cGRhdGVUeXBlKSB7XHJcbiAgICAgICAgY2FzZSAnYWRkR3JvdXAnOlxyXG4gICAgICAgICAgaWYgKHRoaXMuZ3JvdXBzLmxlbmd0aCAhPT0gdGhpcy50aWxlc1RlbXBsYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy50aWxlc1RlbXBsYXRlcy5wdXNoKHNvdXJjZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtb3ZlVGlsZSc6XHJcbiAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIGZyb21JbmRleCxcclxuICAgICAgICAgICAgdG9JbmRleCxcclxuICAgICAgICAgICAgdGlsZU9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyb21UaWxlSW5kZXhcclxuICAgICAgICAgIH0gPSB7XHJcbiAgICAgICAgICAgIGZyb21JbmRleDogc291cmNlLmZyb20uZWxlbS5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWUsXHJcbiAgICAgICAgICAgIHRvSW5kZXg6IHNvdXJjZS50by5lbGVtLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSxcclxuICAgICAgICAgICAgdGlsZU9wdGlvbnM6IHNvdXJjZS50aWxlLm9wdHMub3B0aW9ucyxcclxuICAgICAgICAgICAgZnJvbVRpbGVJbmRleDogc291cmNlLnRpbGUub3B0cy5vcHRpb25zLmluZGV4XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnRpbGVzVGVtcGxhdGVzW2Zyb21JbmRleF0uc291cmNlLnNwbGljZShmcm9tVGlsZUluZGV4LCAxKTtcclxuICAgICAgICAgIHRoaXMudGlsZXNUZW1wbGF0ZXNbdG9JbmRleF0uc291cmNlLnB1c2goe1xyXG4gICAgICAgICAgICBvcHRzOiB0aWxlT3B0aW9uc1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoc291cmNlLmZyb20uZWxlbSk7XHJcbiAgICAgICAgICB0aGlzLnJlSW5kZXhUaWxlcyhzb3VyY2UudG8uZWxlbSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1hbmFnZSB0aWxlcyBmdW5jdGlvbnNcclxuICAgIHByaXZhdGUgY3JlYXRlVGlsZVNjb3BlKHRpbGU6IGFueSk6IElUaWxlU2NvcGUge1xyXG4gICAgICBjb25zdCB0aWxlU2NvcGUgPSA8IElUaWxlU2NvcGUgPiB0aGlzLiRyb290U2NvcGUuJG5ldyhmYWxzZSwgdGhpcy50aWxlc0NvbnRleHQpO1xyXG4gICAgICB0aWxlU2NvcGUuaW5kZXggPSB0aWxlLm9wdHMuaW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuaW5kZXggOiB0aWxlLm9wdHMuaW5kZXg7XHJcbiAgICAgIHRpbGVTY29wZS5ncm91cEluZGV4ID0gdGlsZS5vcHRzLmdyb3VwSW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuZ3JvdXBJbmRleCA6IHRpbGUub3B0cy5ncm91cEluZGV4O1xyXG5cclxuICAgICAgcmV0dXJuIHRpbGVTY29wZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbW92ZVRpbGVzKGdyb3VwLCBpbmRleGVzLCBjb250YWluZXIpIHtcclxuICAgICAgY29uc3QgdGlsZXMgPSAkKGNvbnRhaW5lcikuZmluZCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpO1xyXG5cclxuICAgICAgXy5lYWNoKGluZGV4ZXMsIChpbmRleCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgdGlsZXNbaW5kZXhdLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVJbmRleFRpbGVzKGNvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZUluZGV4VGlsZXMoY29udGFpbmVyLCBnSW5kZXggPyApIHtcclxuICAgICAgY29uc3QgdGlsZXMgPSAkKGNvbnRhaW5lcikuZmluZCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpLFxyXG4gICAgICAgIGdyb3VwSW5kZXggPSBnSW5kZXggPT09IHVuZGVmaW5lZCA/IGNvbnRhaW5lci5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWUgOiBnSW5kZXg7XHJcblxyXG4gICAgICBfLmVhY2godGlsZXMsICh0aWxlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gJCh0aWxlKS5jaGlsZHJlbigpWzBdO1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnaW5kZXgnXSA9IGluZGV4O1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnZ3JvdXBJbmRleCddID0gZ3JvdXBJbmRleDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVHcm91cHMobmV3R3JvdXBzKSB7XHJcbiAgICAgIGNvbnN0IHJlbW92ZUluZGV4ZXMgPSBbXSxcclxuICAgICAgICByZW1haW4gPSBbXSxcclxuICAgICAgICBjb250YWluZXJzID0gW107XHJcblxyXG5cclxuICAgICAgXy5lYWNoKHRoaXMuZ3JvdXBzLCAoZ3JvdXAsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKF8uZmluZEluZGV4KG5ld0dyb3VwcywgKGcpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGdbJ3RpdGxlJ10gPT09IGdyb3VwLnRpdGxlXHJcbiAgICAgICAgICB9KSA8IDApIHtcclxuICAgICAgICAgIHJlbW92ZUluZGV4ZXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlbWFpbi5wdXNoKGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgXy5lYWNoKHJlbW92ZUluZGV4ZXMucmV2ZXJzZSgpLCAoaW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLmdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIF8uZWFjaChyZW1haW4sIChpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnRhaW5lcnMucHVzaCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbaW5kZXhdKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBjb250YWluZXJzO1xyXG5cclxuICAgICAgXy5lYWNoKHRoaXMuZ3JvdXBzQ29udGFpbmVycywgKGNvbnRhaW5lciwgaW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLnJlSW5kZXhUaWxlcyhjb250YWluZXIsIGluZGV4KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRHcm91cChzb3VyY2VHcm91cCkge1xyXG4gICAgICBjb25zdCBncm91cCA9IHtcclxuICAgICAgICB0aXRsZTogc291cmNlR3JvdXAudGl0bGUsXHJcbiAgICAgICAgc291cmNlOiBzb3VyY2VHcm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB0aWxlU2NvcGUgPSB0aGlzLmNyZWF0ZVRpbGVTY29wZSh0aWxlKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICAgIHRwbDogdGhpcy4kY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB0aWxlLm9wdHMsXHJcbiAgICAgICAgICAgIHNpemU6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMucHVzaChncm91cCk7XHJcbiAgICAgIGlmICghdGhpcy4kc2NvcGUuJCRwaGFzZSkgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcblxyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0cy5ncm91cENvbnRhbmluZXJTZWxlY3Rvcik7XHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzLnB1c2goXHJcbiAgICAgICAgICBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCB0aGlzLm9wdHMsIHRoaXMuYXZhaWxhYmxlQ29sdW1ucywgdGhpcy5ncm91cHNDb250YWluZXJzW3RoaXMuZ3JvdXBzQ29udGFpbmVycy5sZW5ndGggLSAxXSlcclxuICAgICAgICAgIC5nZW5lcmF0ZUdyaWQodGhpcy5nZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUodGhpcy5hdmFpbGFibGVXaWR0aCkpXHJcbiAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKClcclxuICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KClcclxuICAgICAgICApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNUZW1wbGF0ZXMoJ2FkZEdyb3VwJywgc291cmNlR3JvdXApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkVGlsZXNJbnRvR3JvdXAobmV3VGlsZXMsIGdyb3VwLCBncm91cENvbnRhaW5lcikge1xyXG4gICAgICBuZXdUaWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld1RpbGUgPSBJRHJhZ1RpbGVDb25zdHJ1Y3RvcihEcmFnVGlsZVNlcnZpY2UsIHtcclxuICAgICAgICAgIHRwbDogdGhpcy4kY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgb3B0aW9uczogdGlsZS5vcHRzLFxyXG4gICAgICAgICAgc2l6ZTogdGlsZS5vcHRzLnNpemVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JvdXAuYWRkVGlsZShuZXdUaWxlKTtcclxuXHJcbiAgICAgICAgJCgnPGRpdj4nKVxyXG4gICAgICAgICAgLmFkZENsYXNzKCdwaXAtZHJhZ2dhYmxlLXRpbGUnKVxyXG4gICAgICAgICAgLmFwcGVuZChuZXdUaWxlLmdldENvbXBpbGVkVGVtcGxhdGUoKSlcclxuICAgICAgICAgIC5hcHBlbmRUbyhncm91cENvbnRhaW5lcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlVGlsZXNPcHRpb25zKG9wdGlvbnNHcm91cCkge1xyXG4gICAgICBvcHRpb25zR3JvdXAuZm9yRWFjaCgob3B0aW9uR3JvdXApID0+IHtcclxuICAgICAgICBvcHRpb25Hcm91cC5zb3VyY2UuZm9yRWFjaCgodGlsZU9wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgICAgICBncm91cC51cGRhdGVUaWxlT3B0aW9ucyh0aWxlT3B0aW9ucy5vcHRzKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRUaWxlc0dyb3Vwcyh0aWxlR3JvdXBzLCBvcHRzLCBncm91cHNDb250YWluZXJzKSB7XHJcbiAgICAgIHJldHVybiB0aWxlR3JvdXBzLm1hcCgoZ3JvdXAsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIElUaWxlc0dyaWRDb25zdHJ1Y3RvcihUaWxlc0dyaWRTZXJ2aWNlLCBncm91cC5zb3VyY2UsIG9wdHMsIHRoaXMuYXZhaWxhYmxlQ29sdW1ucywgZ3JvdXBzQ29udGFpbmVyc1tpbmRleF0pXHJcbiAgICAgICAgICAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzR3JvdXBzKG9ubHlQb3NpdGlvbiA/ICwgZHJhZ2dlZFRpbGUgPyApIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIGdyb3VwLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBncm91cFxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDb250YWluZXJXaWR0aCgpOiBhbnkge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLiRjb250YWluZXIgfHwgJCgnYm9keScpO1xyXG4gICAgICByZXR1cm4gY29udGFpbmVyLndpZHRoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBdmFpbGFibGVDb2x1bW5zKGF2YWlsYWJsZVdpZHRoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0cy5tb2JpbGVCcmVha3BvaW50ID4gYXZhaWxhYmxlV2lkdGggPyBTSU1QTEVfTEFZT1VUX0NPTFVNTlNfQ09VTlQgOlxyXG4gICAgICAgIE1hdGguZmxvb3IoYXZhaWxhYmxlV2lkdGggLyAodGhpcy5vcHRzLnRpbGVXaWR0aCArIHRoaXMub3B0cy5ndXR0ZXIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEFjdGl2ZUdyb3VwQW5kVGlsZShlbGVtKTogYW55IHtcclxuICAgICAgY29uc3QgYWN0aXZlID0ge307XHJcblxyXG4gICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICBjb25zdCBmb3VuZFRpbGUgPSBncm91cC5nZXRUaWxlQnlOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICBpZiAoZm91bmRUaWxlKSB7XHJcbiAgICAgICAgICBhY3RpdmVbJ2dyb3VwJ10gPSBncm91cDtcclxuICAgICAgICAgIGFjdGl2ZVsndGlsZSddID0gZm91bmRUaWxlO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gYWN0aXZlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKGF2YWlsYWJsZVdpZHRoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0cy5tb2JpbGVCcmVha3BvaW50ID4gYXZhaWxhYmxlV2lkdGggPyBhdmFpbGFibGVXaWR0aCAvIDIgLSB0aGlzLm9wdHMuZ3V0dGVyIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ1N0YXJ0TGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgYWN0aXZlRW50aXRpZXMgPSB0aGlzLmdldEFjdGl2ZUdyb3VwQW5kVGlsZShldmVudC50YXJnZXQpO1xyXG5cclxuICAgICAgdGhpcy5jb250YWluZXIgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50KCcucGlwLWRyYWdnYWJsZS1ncm91cCcpLmdldCgwKTtcclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZSA9IGFjdGl2ZUVudGl0aWVzWyd0aWxlJ107XHJcbiAgICAgIHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwID0gYWN0aXZlRW50aXRpZXNbJ2dyb3VwJ107XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdkcmFnLXRyYW5zZmVyJyk7XHJcblxyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlLnN0YXJ0RHJhZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnTW92ZUxpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgY29uc3QgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5zdHlsZS5sZWZ0KSB8fCAwKSArIGV2ZW50LmR4O1xyXG4gICAgICBjb25zdCB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LnN0eWxlLnRvcCkgfHwgMCkgKyBldmVudC5keTtcclxuXHJcbiAgICAgIHRoaXMuY29udGFpbmVyT2Zmc2V0ID0gdGhpcy5nZXRDb250YWluZXJPZmZzZXQoKTtcclxuXHJcbiAgICAgIHRhcmdldC5zdHlsZS5sZWZ0ID0geCArICdweCc7IC8vIFRPRE8gW2FwaWRoaXJueWldIEV4dHJhY3QgdW5pdHMgaW50byBvcHRpb25zIHNlY3Rpb25cclxuICAgICAgdGFyZ2V0LnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG5cclxuICAgICAgY29uc3QgYmVsb3dFbGVtZW50ID0gdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAuZ2V0VGlsZUJ5Q29vcmRpbmF0ZXMoe1xyXG4gICAgICAgIGxlZnQ6IGV2ZW50LnBhZ2VYIC0gdGhpcy5jb250YWluZXJPZmZzZXQubGVmdCxcclxuICAgICAgICB0b3A6IGV2ZW50LnBhZ2VZIC0gdGhpcy5jb250YWluZXJPZmZzZXQudG9wXHJcbiAgICAgIH0sIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG5cclxuICAgICAgaWYgKGJlbG93RWxlbWVudCkge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnZWRUaWxlSW5kZXggPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cC5nZXRUaWxlSW5kZXgodGhpcy5kcmFnZ2VkVGlsZSk7XHJcbiAgICAgICAgY29uc3QgYmVsb3dFbGVtSW5kZXggPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cC5nZXRUaWxlSW5kZXgoYmVsb3dFbGVtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKChkcmFnZ2VkVGlsZUluZGV4ICsgMSkgPT09IGJlbG93RWxlbUluZGV4KSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cFxyXG4gICAgICAgICAgLnN3YXBUaWxlcyh0aGlzLmRyYWdnZWRUaWxlLCBiZWxvd0VsZW1lbnQpXHJcbiAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKHRydWUsIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG5cclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2V0R3JvdXBDb250YWluZXJzSGVpZ2h0KCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ0VuZExpc3RlbmVyKCkge1xyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlLnN0b3BEcmFnKHRoaXMuaXNTYW1lRHJvcHpvbmUpO1xyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnZHJhZy10cmFuc2ZlcicpO1xyXG4gICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCA9IG51bGw7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q29udGFpbmVyT2Zmc2V0KCkge1xyXG4gICAgICBjb25zdCBjb250YWluZXJSZWN0ID0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGxlZnQ6IGNvbnRhaW5lclJlY3QubGVmdCxcclxuICAgICAgICB0b3A6IGNvbnRhaW5lclJlY3QudG9wXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRHcm91cENvbnRhaW5lcnNIZWlnaHQoKSB7XHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKCh0aWxlR3JvdXApID0+IHtcclxuICAgICAgICB0aWxlR3JvdXAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1vdmVUaWxlKGZyb20sIHRvLCB0aWxlKSB7XHJcbiAgICAgIGxldCBlbGVtO1xyXG4gICAgICBjb25zdCBtb3ZlZFRpbGUgPSBmcm9tLnJlbW92ZVRpbGUodGlsZSk7XHJcbiAgICAgIGNvbnN0IHRpbGVTY29wZSA9IHRoaXMuY3JlYXRlVGlsZVNjb3BlKHRpbGUpO1xyXG5cclxuICAgICAgJCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbXy5maW5kSW5kZXgodGhpcy50aWxlR3JvdXBzLCBmcm9tKV0pXHJcbiAgICAgICAgLmZpbmQobW92ZWRUaWxlLmdldEVsZW0oKSlcclxuICAgICAgICAucmVtb3ZlKCk7XHJcblxyXG4gICAgICBpZiAodG8gIT09IG51bGwpIHtcclxuICAgICAgICB0by5hZGRUaWxlKG1vdmVkVGlsZSk7XHJcblxyXG4gICAgICAgIGVsZW0gPSB0aGlzLiRjb21waWxlKG1vdmVkVGlsZS5nZXRFbGVtKCkpKHRpbGVTY29wZSk7XHJcblxyXG4gICAgICAgICQodGhpcy5ncm91cHNDb250YWluZXJzW18uZmluZEluZGV4KHRoaXMudGlsZUdyb3VwcywgdG8pXSlcclxuICAgICAgICAgIC5hcHBlbmQoZWxlbSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQodG8uc2V0VGlsZXNEaW1lbnNpb25zLmJpbmQodG8sIHRydWUpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy51cGRhdGVUaWxlc1RlbXBsYXRlcygnbW92ZVRpbGUnLCB7XHJcbiAgICAgICAgZnJvbTogZnJvbSxcclxuICAgICAgICB0bzogdG8sXHJcbiAgICAgICAgdGlsZTogbW92ZWRUaWxlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZHJvcHBlZEdyb3VwSW5kZXggPSBldmVudC50YXJnZXQuYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlO1xyXG4gICAgICBjb25zdCBkcm9wcGVkR3JvdXAgPSB0aGlzLnRpbGVHcm91cHNbZHJvcHBlZEdyb3VwSW5kZXhdO1xyXG5cclxuICAgICAgaWYgKHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwICE9PSBkcm9wcGVkR3JvdXApIHtcclxuICAgICAgICB0aGlzLm1vdmVUaWxlKHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLCBkcm9wcGVkR3JvdXAsIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKHRydWUpO1xyXG4gICAgICB0aGlzLnNvdXJjZURyb3Bab25lRWxlbSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyb3BUb0ZpY3RHcm91cExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cDtcclxuICAgICAgY29uc3QgdGlsZSA9IHRoaXMuZHJhZ2dlZFRpbGU7XHJcblxyXG4gICAgICB0aGlzLmFkZEdyb3VwKHtcclxuICAgICAgICB0aXRsZTogJ05ldyBncm91cCcsXHJcbiAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVGlsZShmcm9tLCB0aGlzLnRpbGVHcm91cHNbdGhpcy50aWxlR3JvdXBzLmxlbmd0aCAtIDFdLCB0aWxlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKHRydWUpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcEVudGVyTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgaWYgKCF0aGlzLnNvdXJjZURyb3Bab25lRWxlbSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc291cmNlRHJvcFpvbmVFbGVtICE9PSBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyKSB7XHJcbiAgICAgICAgZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlci5jbGFzc0xpc3QuYWRkKCdkcm9wem9uZS1hY3RpdmUnKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnY29weScpO1xyXG4gICAgICAgIHRoaXMuaXNTYW1lRHJvcHpvbmUgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgICAgdGhpcy5pc1NhbWVEcm9wem9uZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBpZiAodGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gIT09IGV2ZW50LnRhcmdldCkge1xyXG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMub3B0cy5hY3RpdmVEcm9wem9uZUNsYXNzKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5vcHRzLmFjdGl2ZURyb3B6b25lQ2xhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVXaWR0aCA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkdGgoKTtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZUNvbHVtbnMgPSB0aGlzLmdldEF2YWlsYWJsZUNvbHVtbnModGhpcy5hdmFpbGFibGVXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdHMuZ3JvdXBDb250YW5pbmVyU2VsZWN0b3IpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3VwcyA9IHRoaXMuaW5pdFRpbGVzR3JvdXBzKHRoaXMuZ3JvdXBzLCB0aGlzLm9wdHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVycyk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5kcmFnZ2FibGUoe1xyXG4gICAgICAgICAgICBhdXRvU2Nyb2xsOiB7XHJcbiAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICBjb250YWluZXI6ICQoJyNjb250ZW50JykuZ2V0KDApLFxyXG4gICAgICAgICAgICAgIHNwZWVkOiA1MDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25zdGFydDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyYWdTdGFydExpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbm1vdmU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25EcmFnTW92ZUxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmVuZDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyYWdFbmRMaXN0ZW5lcigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpbnRlcmFjdCgnLnBpcC1kcmFnZ2FibGUtZ3JvdXAuZmljdC1ncm91cCcpXHJcbiAgICAgICAgICAuZHJvcHpvbmUoe1xyXG4gICAgICAgICAgICBvbmRyb3A6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wVG9GaWN0R3JvdXBMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnZW50ZXI6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BEZWFjdGl2YXRlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJhZ2xlYXZlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpbnRlcmFjdCgnLnBpcC1kcmFnZ2FibGUtZ3JvdXAnKVxyXG4gICAgICAgICAgLmRyb3B6b25lKHtcclxuICAgICAgICAgICAgb25kcm9wOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcExpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyYWdlbnRlcjogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BFbnRlckxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyb3BkZWFjdGl2YXRlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnbGVhdmU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wTGVhdmVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lclxyXG4gICAgICAgICAgLm9uKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsICdtZC1tZW51IC5tZC1pY29uLWJ1dHRvbicsICgpID0+IHtcclxuICAgICAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKS5kcmFnZ2FibGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLm9uKCdtb3VzZXVwIHRvdWNoZW5kJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBpbnRlcmFjdCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpLmRyYWdnYWJsZSh0cnVlKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgXHJcbiAgICAgIH0sIDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgRHJhZ0NvbXBvbmVudDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICB0aWxlc1RlbXBsYXRlczogJz1waXBUaWxlc1RlbXBsYXRlcycsXHJcbiAgICAgIHRpbGVzQ29udGV4dDogJz1waXBUaWxlc0NvbnRleHQnLFxyXG4gICAgICBvcHRpb25zOiAnPXBpcERyYWdnYWJsZUdyaWQnLFxyXG4gICAgICBncm91cE1lbnVBY3Rpb25zOiAnPXBpcEdyb3VwTWVudUFjdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgLy9jb250cm9sbGVyQXM6ICdEcmFnZ2VkQ3RybCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2RyYWdnYWJsZS9EcmFnZ2FibGUuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiBEcmFnZ2FibGVDb250cm9sbGVyXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBEcmFnZ2FibGVHcmlkJywgRHJhZ0NvbXBvbmVudCk7XHJcbn0iLCJleHBvcnQgaW50ZXJmYWNlIERyYWdUaWxlQ29uc3RydWN0b3Ige1xyXG4gIG5ldyAob3B0aW9uczogYW55KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIElEcmFnVGlsZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBEcmFnVGlsZUNvbnN0cnVjdG9yLCBvcHRpb25zOiBhbnkpOiBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHRwbDogYW55O1xyXG4gIG9wdHM6IGFueTtcclxuICBzaXplOiBhbnk7XHJcbiAgZWxlbTogYW55O1xyXG4gIHByZXZpZXc6IGFueTtcclxuICBnZXRTaXplKCk6IGFueTtcclxuICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnk7XHJcbiAgc2V0UG9zaXRpb24obGVmdCwgdG9wKTogYW55O1xyXG4gIGdldENvbXBpbGVkVGVtcGxhdGUoKTogYW55O1xyXG4gIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55O1xyXG4gIGdldEVsZW0oKTogYW55O1xyXG4gIHN0YXJ0RHJhZygpOiBhbnk7XHJcbiAgc3RvcERyYWcoaXNBbmltYXRlKTogYW55O1xyXG4gIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpOiB2b2lkO1xyXG4gIGdldE9wdGlvbnMoKTogYW55O1xyXG4gIHNldE9wdGlvbnMob3B0aW9ucyk6IGFueTtcclxufVxyXG5cclxubGV0IERFRkFVTFRfVElMRV9TSVpFID0ge1xyXG4gIGNvbFNwYW46IDEsXHJcbiAgcm93U3BhbjogMVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIERyYWdUaWxlU2VydmljZSBpbXBsZW1lbnRzIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHB1YmxpYyB0cGw6IGFueTtcclxuICBwdWJsaWMgb3B0czogYW55O1xyXG4gIHB1YmxpYyBzaXplOiBhbnk7XHJcbiAgcHVibGljIGVsZW06IGFueTtcclxuICBwdWJsaWMgcHJldmlldzogYW55O1xyXG5cclxuICBjb25zdHJ1Y3RvciAob3B0aW9uczogYW55KSB7XHJcbiAgICB0aGlzLnRwbCA9IG9wdGlvbnMudHBsLmdldCgwKTtcclxuICAgIHRoaXMub3B0cyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLnNpemUgPSBfLm1lcmdlKHt9LCBERUZBVUxUX1RJTEVfU0laRSwgb3B0aW9ucy5zaXplKTtcclxuICAgIHRoaXMuZWxlbSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2l6ZSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2l6ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnkge1xyXG4gICAgdGhpcy5zaXplLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLnNpemUuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFBvc2l0aW9uKGxlZnQsIHRvcCk6IGFueSB7XHJcbiAgICB0aGlzLnNpemUubGVmdCA9IGxlZnQ7XHJcbiAgICB0aGlzLnNpemUudG9wID0gdG9wO1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICB0b3A6IHRvcFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDb21waWxlZFRlbXBsYXRlKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy50cGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55IHtcclxuICAgIHRoaXMuZWxlbSA9ICQodGhpcy50cGwpLnBhcmVudChwYXJlbnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtLmdldCgwKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCk6IGFueSB7XHJcbiAgICB0aGlzLnByZXZpZXcgPSAkKCc8ZGl2PicpXHJcbiAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnZWQtcHJldmlldycpXHJcbiAgICAgIC5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMuZWxlbS5jc3MoJ2xlZnQnKSxcclxuICAgICAgICB0b3A6IHRoaXMuZWxlbS5jc3MoJ3RvcCcpLFxyXG4gICAgICAgIHdpZHRoOiB0aGlzLmVsZW0uY3NzKCd3aWR0aCcpLFxyXG4gICAgICAgIGhlaWdodDogdGhpcy5lbGVtLmNzcygnaGVpZ2h0JylcclxuICAgICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtXHJcbiAgICAgIC5hZGRDbGFzcygnbm8tYW5pbWF0aW9uJylcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgekluZGV4OiAnOTk5OSdcclxuICAgICAgfSlcclxuICAgICAgLmFmdGVyKHRoaXMucHJldmlldyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0b3BEcmFnKGlzQW5pbWF0ZSk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgaWYgKGlzQW5pbWF0ZSkge1xyXG4gICAgICB0aGlzLmVsZW1cclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ25vLWFuaW1hdGlvbicpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiB0aGlzLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHRoaXMucHJldmlldy5jc3MoJ3RvcCcpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub24oJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiBzZWxmLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHNlbGYucHJldmlldy5jc3MoJ3RvcCcpLFxyXG4gICAgICAgICAgekluZGV4OiAnJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCduby1hbmltYXRpb24nKTtcclxuXHJcbiAgICAgIHNlbGYucHJldmlldy5yZW1vdmUoKTtcclxuICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICBmdW5jdGlvbiBvblRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICAgIGlmIChzZWxmLnByZXZpZXcpIHtcclxuICAgICAgICBzZWxmLnByZXZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcygnekluZGV4JywgJycpXHJcbiAgICAgICAgLm9mZigndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpIHtcclxuICAgIHRoaXMucHJldmlldy5jc3MoY29vcmRzKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0T3B0aW9ucygpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0cy5vcHRpb25zO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRPcHRpb25zKG9wdGlvbnMpOiBhbnkge1xyXG4gICAgXy5tZXJnZSh0aGlzLm9wdHMub3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICBfLm1lcmdlKHRoaXMuc2l6ZSwgb3B0aW9ucy5zaXplKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgLnNlcnZpY2UoJ3BpcERyYWdUaWxlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgIGxldCBuZXdUaWxlID0gbmV3IERyYWdUaWxlU2VydmljZShvcHRpb25zKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdUaWxlO1xyXG4gICAgfVxyXG4gIH0pOyIsIntcclxuICBpbnRlcmZhY2UgRHJhZ2dhYmxlVGlsZUF0dHJpYnV0ZXMgZXh0ZW5kcyBuZy5JQXR0cmlidXRlcyB7XHJcbiAgICBwaXBEcmFnZ2FibGVUaWxlczogYW55O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gRHJhZ2dhYmxlVGlsZUxpbmsoXHJcbiAgICAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICRlbGVtOiBKUXVlcnksXHJcbiAgICAkYXR0cjogRHJhZ2dhYmxlVGlsZUF0dHJpYnV0ZXNcclxuICApIHtcclxuICAgIGNvbnN0IGRvY0ZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXHJcbiAgICAgIGdyb3VwID0gJHNjb3BlLiRldmFsKCRhdHRyLnBpcERyYWdnYWJsZVRpbGVzKTtcclxuXHJcbiAgICBncm91cC5mb3JFYWNoKGZ1bmN0aW9uICh0aWxlKSB7XHJcbiAgICAgIGNvbnN0IHRwbCA9IHdyYXBDb21wb25lbnQodGlsZS5nZXRDb21waWxlZFRlbXBsYXRlKCkpO1xyXG4gICAgICBkb2NGcmFnLmFwcGVuZENoaWxkKHRwbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkZWxlbS5hcHBlbmQoZG9jRnJhZyk7XHJcblxyXG4gICAgZnVuY3Rpb24gd3JhcENvbXBvbmVudChlbGVtKSB7XHJcbiAgICAgIHJldHVybiAkKCc8ZGl2PicpXHJcbiAgICAgICAgLmFkZENsYXNzKCdwaXAtZHJhZ2dhYmxlLXRpbGUnKVxyXG4gICAgICAgIC5hcHBlbmQoZWxlbSlcclxuICAgICAgICAuZ2V0KDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gRHJhZ2dhYmxlVGlsZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgIGxpbms6IERyYWdnYWJsZVRpbGVMaW5rXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBEcmFnZ2FibGVUaWxlcycsIERyYWdnYWJsZVRpbGUpO1xyXG5cclxufSIsImV4cG9ydCBpbnRlcmZhY2UgVGlsZXNHcmlkQ29uc3RydWN0b3Ige1xyXG4gIG5ldyh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBJVGlsZXNHcmlkQ29uc3RydWN0b3IoY29uc3RydWN0b3I6IFRpbGVzR3JpZENvbnN0cnVjdG9yLCB0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk6IElUaWxlc0dyaWRTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgdGlsZXM6IGFueTtcclxuICBvcHRzOiBhbnk7XHJcbiAgY29sdW1uczogYW55O1xyXG4gIGVsZW06IGFueTtcclxuICBncmlkQ2VsbHM6IGFueTtcclxuICBpbmxpbmU6IGJvb2xlYW47XHJcbiAgaXNNb2JpbGVMYXlvdXQ6IGJvb2xlYW47XHJcblxyXG4gIGFkZFRpbGUodGlsZSk6IGFueTtcclxuICBnZXRDZWxsQnlQb3NpdGlvbihyb3csIGNvbCk6IGFueTtcclxuICBnZXRDZWxscyhwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueTtcclxuICBnZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRCYXNpY1JvdyhwcmV2Q2VsbCk6IGFueTtcclxuICBpc0NlbGxGcmVlKHJvdywgY29sKTogYW55O1xyXG4gIGdldENlbGxJbmRleChzcmNDZWxsKTogYW55O1xyXG4gIHJlc2VydmVDZWxscyhzdGFydCwgZW5kLCBlbGVtKTogdm9pZDtcclxuICBjbGVhckVsZW1lbnRzKCk6IHZvaWQ7XHJcbiAgc2V0QXZhaWxhYmxlQ29sdW1ucyhjb2x1bW5zKTogYW55O1xyXG4gIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGggPyApOiBhbnk7XHJcbiAgc2V0VGlsZXNEaW1lbnNpb25zKG9ubHlQb3NpdGlvbiwgZHJhZ2dlZFRpbGUpOiBhbnk7XHJcbiAgY2FsY0NvbnRhaW5lckhlaWdodCgpOiBhbnk7XHJcbiAgZ2V0VGlsZUJ5Tm9kZShub2RlKTogYW55O1xyXG4gIGdldFRpbGVCeUNvb3JkaW5hdGVzKGNvb3JkcywgZHJhZ2dlZFRpbGUpOiBhbnk7XHJcbiAgZ2V0VGlsZUluZGV4KHRpbGUpOiBhbnk7XHJcbiAgc3dhcFRpbGVzKG1vdmVkVGlsZSwgYmVmb3JlVGlsZSk6IGFueTtcclxuICByZW1vdmVUaWxlKHJlbW92ZVRpbGUpOiBhbnk7XHJcbiAgdXBkYXRlVGlsZU9wdGlvbnMob3B0cyk6IGFueTtcclxufVxyXG5cclxuY29uc3QgTU9CSUxFX0xBWU9VVF9DT0xVTU5TID0gMjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUaWxlc0dyaWRTZXJ2aWNlIGltcGxlbWVudHMgSVRpbGVzR3JpZFNlcnZpY2Uge1xyXG4gIHB1YmxpYyB0aWxlczogYW55O1xyXG4gIHB1YmxpYyBvcHRzOiBhbnk7XHJcbiAgcHVibGljIGNvbHVtbnM6IGFueTtcclxuICBwdWJsaWMgZWxlbTogYW55O1xyXG4gIHB1YmxpYyBncmlkQ2VsbHM6IGFueSA9IFtdO1xyXG4gIHB1YmxpYyBpbmxpbmU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgaXNNb2JpbGVMYXlvdXQ6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKSB7XHJcbiAgICB0aGlzLnRpbGVzID0gdGlsZXM7XHJcbiAgICB0aGlzLm9wdHMgPSBvcHRpb25zO1xyXG4gICAgdGhpcy5jb2x1bW5zID0gY29sdW1ucyB8fCAwOyAvLyBhdmFpbGFibGUgY29sdW1ucyBpbiBhIHJvd1xyXG4gICAgdGhpcy5lbGVtID0gZWxlbTtcclxuICAgIHRoaXMuZ3JpZENlbGxzID0gW107XHJcbiAgICB0aGlzLmlubGluZSA9IG9wdGlvbnMuaW5saW5lIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5pc01vYmlsZUxheW91dCA9IGNvbHVtbnMgPT09IE1PQklMRV9MQVlPVVRfQ09MVU1OUztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRUaWxlKHRpbGUpOiBhbnkge1xyXG4gICAgdGhpcy50aWxlcy5wdXNoKHRpbGUpO1xyXG4gICAgaWYgKHRoaXMudGlsZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdGVHcmlkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldENlbGxCeVBvc2l0aW9uKHJvdywgY29sKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRDZWxsc1tyb3ddW2NvbF07XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldENlbGxzKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55IHtcclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEF2YWlsYWJsZUNlbGxzTW9iaWxlKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEF2YWlsYWJsZUNlbGxzRGVza3RvcChwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEF2YWlsYWJsZUNlbGxzRGVza3RvcChwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueSB7XHJcbiAgICBsZXQgbGVmdENvcm5lckNlbGw7XHJcbiAgICBsZXQgcmlnaHRDb3JuZXJDZWxsO1xyXG4gICAgY29uc3QgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuICAgIGNvbnN0IGJhc2ljUm93ID0gdGhpcy5nZXRCYXNpY1JvdyhwcmV2Q2VsbCk7XHJcblxyXG4gICAgLy8gU21hbGwgdGlsZVxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDEgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBjb25zdCBncmlkQ29weSA9IHRoaXMuZ3JpZENlbGxzLnNsaWNlKCk7XHJcblxyXG4gICAgICBpZiAoIXByZXZDZWxsKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSBncmlkQ29weVswXVswXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3csIGJhc2ljQ29sLCB0aGlzLmNvbHVtbnMpO1xyXG5cclxuICAgICAgICBpZiAoIWxlZnRDb3JuZXJDZWxsKSB7XHJcbiAgICAgICAgICBjb25zdCByb3dTaGlmdCA9IHRoaXMuaXNNb2JpbGVMYXlvdXQgPyAxIDogMjtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdyArIHJvd1NoaWZ0LCAwLCB0aGlzLmNvbHVtbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1lZGl1bSB0aWxlXHJcbiAgICBpZiAoY29sU3BhbiA9PT0gMiAmJiByb3dTcGFuID09PSAxKSB7XHJcbiAgICAgIGNvbnN0IHByZXZUaWxlU2l6ZSA9IHByZXZDZWxsICYmIHByZXZDZWxsLmVsZW0uc2l6ZSB8fCBudWxsO1xyXG5cclxuICAgICAgaWYgKCFwcmV2VGlsZVNpemUpIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sKTtcclxuICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpO1xyXG4gICAgICB9IGVsc2UgaWYgKHByZXZUaWxlU2l6ZS5jb2xTcGFuID09PSAyICYmIHByZXZUaWxlU2l6ZS5yb3dTcGFuID09PSAyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAtIGJhc2ljQ29sIC0gMiA+IDApIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmIChwcmV2Q2VsbC5yb3cgJSAyID09PSAwKSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCAtIDEpO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAtIGJhc2ljQ29sIC0gMyA+PSAwKSB7XHJcbiAgICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHByZXZUaWxlU2l6ZS5jb2xTcGFuID09PSAxICYmIHByZXZUaWxlU2l6ZS5yb3dTcGFuID09PSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAtIGJhc2ljQ29sIC0gMyA+PSAwKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5pc0NlbGxGcmVlKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpKSB7XHJcbiAgICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQmlnIHRpbGVcclxuICAgIGlmICghcHJldkNlbGwgJiYgcm93U3BhbiA9PT0gMiAmJiBjb2xTcGFuID09PSAyKSB7XHJcbiAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wpO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgKyAxKTtcclxuICAgIH0gZWxzZSBpZiAocm93U3BhbiA9PT0gMiAmJiBjb2xTcGFuID09PSAyKSB7XHJcbiAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDIgPiAwKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNDZWxsRnJlZShiYXNpY1JvdywgYmFzaWNDb2wgKyAxKSkge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCArIDMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMywgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGFydDogbGVmdENvcm5lckNlbGwsXHJcbiAgICAgIGVuZDogcmlnaHRDb3JuZXJDZWxsXHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsKHNyYywgYmFzaWNSb3csIGJhc2ljQ29sLCBjb2x1bW5zKTogYW55IHtcclxuICAgIGxldCBjZWxsLCBjb2wsIHJvdztcclxuXHJcbiAgICBpZiAodGhpcy5pc01vYmlsZUxheW91dCkge1xyXG4gICAgICAvLyBtb2JpbGUgbGF5b3V0XHJcbiAgICAgIGZvciAoY29sID0gYmFzaWNDb2w7IGNvbCA8IGNvbHVtbnM7IGNvbCsrKSB7XHJcbiAgICAgICAgaWYgKCFzcmNbYmFzaWNSb3ddW2NvbF0uZWxlbSkge1xyXG4gICAgICAgICAgY2VsbCA9IHNyY1tiYXNpY1Jvd11bY29sXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGNlbGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVza3RvcFxyXG4gICAgZm9yIChjb2wgPSBiYXNpY0NvbDsgY29sIDwgY29sdW1uczsgY29sKyspIHtcclxuICAgICAgZm9yIChyb3cgPSAwOyByb3cgPCAyOyByb3crKykge1xyXG4gICAgICAgIGlmICghc3JjW3JvdyArIGJhc2ljUm93XVtjb2xdLmVsZW0pIHtcclxuICAgICAgICAgIGNlbGwgPSBzcmNbcm93ICsgYmFzaWNSb3ddW2NvbF07XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjZWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QXZhaWxhYmxlQ2VsbHNNb2JpbGUocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnkge1xyXG4gICAgbGV0IGxlZnRDb3JuZXJDZWxsO1xyXG4gICAgbGV0IHJpZ2h0Q29ybmVyQ2VsbDtcclxuICAgIGNvbnN0IGJhc2ljUm93ID0gdGhpcy5nZXRCYXNpY1JvdyhwcmV2Q2VsbCk7XHJcbiAgICBjb25zdCBiYXNpY0NvbCA9IHByZXZDZWxsICYmIHByZXZDZWxsLmNvbCB8fCAwO1xyXG5cclxuXHJcbiAgICBpZiAoY29sU3BhbiA9PT0gMSAmJiByb3dTcGFuID09PSAxKSB7XHJcbiAgICAgIGNvbnN0IGdyaWRDb3B5ID0gdGhpcy5ncmlkQ2VsbHMuc2xpY2UoKTtcclxuXHJcbiAgICAgIGlmICghcHJldkNlbGwpIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IGdyaWRDb3B5WzBdWzBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdywgYmFzaWNDb2wsIHRoaXMuY29sdW1ucyk7XHJcblxyXG4gICAgICAgIGlmICghbGVmdENvcm5lckNlbGwpIHtcclxuICAgICAgICAgIGNvbnN0IHJvd1NoaWZ0ID0gdGhpcy5pc01vYmlsZUxheW91dCA/IDEgOiAyO1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93ICsgcm93U2hpZnQsIDAsIHRoaXMuY29sdW1ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIDApO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgcm93U3BhbiAtIDEsIDEpO1xyXG4gICAgfSBlbHNlIGlmIChjb2xTcGFuID09PSAyKSB7XHJcbiAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIDApO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgcm93U3BhbiwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QmFzaWNSb3cocHJldkNlbGwpOiBhbnkge1xyXG4gICAgbGV0IGJhc2ljUm93O1xyXG5cclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIGlmIChwcmV2Q2VsbCkge1xyXG4gICAgICAgIGJhc2ljUm93ID0gcHJldkNlbGwgJiYgcHJldkNlbGwucm93IHx8IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocHJldkNlbGwpIHtcclxuICAgICAgICBiYXNpY1JvdyA9IHByZXZDZWxsLnJvdyAlIDIgPT09IDAgPyBwcmV2Q2VsbC5yb3cgOiBwcmV2Q2VsbC5yb3cgLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2ljUm93ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBiYXNpY1JvdztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgaXNDZWxsRnJlZShyb3csIGNvbCk6IGFueSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZ3JpZENlbGxzW3Jvd11bY29sXS5lbGVtO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsSW5kZXgoc3JjQ2VsbCk6IGFueSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGxldCBpbmRleDtcclxuXHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3csIHJvd0luZGV4KSA9PiB7XHJcbiAgICAgIGluZGV4ID0gXy5maW5kSW5kZXgoc2VsZi5ncmlkQ2VsbHNbcm93SW5kZXhdLCAoY2VsbCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBjZWxsID09PSBzcmNDZWxsO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBpbmRleCAhPT0gLTEgPyBpbmRleCA6IDA7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHJlc2VydmVDZWxscyhzdGFydCwgZW5kLCBlbGVtKSB7XHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgcm93LmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgICBpZiAoY2VsbC5yb3cgPj0gc3RhcnQucm93ICYmIGNlbGwucm93IDw9IGVuZC5yb3cgJiZcclxuICAgICAgICAgIGNlbGwuY29sID49IHN0YXJ0LmNvbCAmJiBjZWxsLmNvbCA8PSBlbmQuY29sKSB7XHJcbiAgICAgICAgICBjZWxsLmVsZW0gPSBlbGVtO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgY2xlYXJFbGVtZW50cygpIHtcclxuICAgIHRoaXMuZ3JpZENlbGxzLmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgICByb3cuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgIHRpbGUuZWxlbSA9IG51bGw7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldEF2YWlsYWJsZUNvbHVtbnMoY29sdW1ucyk6IGFueSB7XHJcbiAgICB0aGlzLmlzTW9iaWxlTGF5b3V0ID0gY29sdW1ucyA9PT0gTU9CSUxFX0xBWU9VVF9DT0xVTU5TO1xyXG4gICAgdGhpcy5jb2x1bW5zID0gY29sdW1ucztcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2VuZXJhdGVHcmlkKHNpbmdsZVRpbGVXaWR0aCA/ICk6IGFueSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcyxcclxuICAgICAgICAgIHRpbGVXaWR0aCA9IHNpbmdsZVRpbGVXaWR0aCB8fCB0aGlzLm9wdHMudGlsZVdpZHRoLFxyXG4gICAgICAgICAgb2Zmc2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBpcC1kcmFnZ2FibGUtZ3JvdXAtdGl0bGUnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGxldCAgIGNvbHNJblJvdyA9IDAsXHJcbiAgICAgICAgICByb3dzID0gMCxcclxuICAgICAgICAgIGdyaWRJblJvdyA9IFtdO1xyXG5cclxuICAgIHRoaXMuZ3JpZENlbGxzID0gW107XHJcblxyXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlLCBpbmRleCwgc3JjVGlsZXMpID0+IHtcclxuICAgICAgY29uc3QgdGlsZVNpemUgPSB0aWxlLmdldFNpemUoKTtcclxuXHJcbiAgICAgIGdlbmVyYXRlQ2VsbHModGlsZVNpemUuY29sU3Bhbik7XHJcblxyXG4gICAgICBpZiAoc3JjVGlsZXMubGVuZ3RoID09PSBpbmRleCArIDEpIHtcclxuICAgICAgICBpZiAoY29sc0luUm93IDwgc2VsZi5jb2x1bW5zKSB7XHJcbiAgICAgICAgICBnZW5lcmF0ZUNlbGxzKHNlbGYuY29sdW1ucyAtIGNvbHNJblJvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBtb3JlIGNlbGxzIGZvciBleHRlbmRzIHRpbGUgc2l6ZSB0byBiaWdcclxuICAgICAgICBpZiAoc2VsZi50aWxlcy5sZW5ndGggKiAyID4gc2VsZi5ncmlkQ2VsbHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBBcnJheS5hcHBseShudWxsLCBBcnJheShzZWxmLnRpbGVzLmxlbmd0aCAqIDIgLSBzZWxmLmdyaWRDZWxscy5sZW5ndGgpKS5mb3JFYWNoKCgpID0+IHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVDZWxscyhzZWxmLmNvbHVtbnMpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNlbGxzKG5ld0NlbGxDb3VudCkge1xyXG4gICAgICBBcnJheS5hcHBseShudWxsLCBBcnJheShuZXdDZWxsQ291bnQpKS5mb3JFYWNoKCgpID0+IHtcclxuICAgICAgICBpZiAoc2VsZi5jb2x1bW5zIDwgY29sc0luUm93ICsgMSkge1xyXG4gICAgICAgICAgcm93cysrO1xyXG4gICAgICAgICAgY29sc0luUm93ID0gMDtcclxuXHJcbiAgICAgICAgICBzZWxmLmdyaWRDZWxscy5wdXNoKGdyaWRJblJvdyk7XHJcbiAgICAgICAgICBncmlkSW5Sb3cgPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3AgPSByb3dzICogc2VsZi5vcHRzLnRpbGVIZWlnaHQgKyAocm93cyA/IHJvd3MgKiBzZWxmLm9wdHMuZ3V0dGVyIDogMCkgKyBvZmZzZXQuaGVpZ2h0O1xyXG4gICAgICAgIGxldCBsZWZ0ID0gY29sc0luUm93ICogdGlsZVdpZHRoICsgKGNvbHNJblJvdyA/IGNvbHNJblJvdyAqIHNlbGYub3B0cy5ndXR0ZXIgOiAwKTtcclxuXHJcbiAgICAgICAgLy8gRGVzY3JpYmUgZ3JpZCBjZWxsIHNpemUgdGhyb3VnaCBibG9jayBjb3JuZXJzIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgZ3JpZEluUm93LnB1c2goe1xyXG4gICAgICAgICAgdG9wOiB0b3AsXHJcbiAgICAgICAgICBsZWZ0OiBsZWZ0LFxyXG4gICAgICAgICAgYm90dG9tOiB0b3AgKyBzZWxmLm9wdHMudGlsZUhlaWdodCxcclxuICAgICAgICAgIHJpZ2h0OiBsZWZ0ICsgdGlsZVdpZHRoLFxyXG4gICAgICAgICAgcm93OiByb3dzLFxyXG4gICAgICAgICAgY29sOiBjb2xzSW5Sb3dcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29sc0luUm93Kys7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRUaWxlc0RpbWVuc2lvbnMob25seVBvc2l0aW9uLCBkcmFnZ2VkVGlsZSk6IGFueSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGxldCBjdXJySW5kZXggPSAwO1xyXG4gICAgbGV0IHByZXZDZWxsO1xyXG5cclxuICAgIGlmIChvbmx5UG9zaXRpb24pIHtcclxuICAgICAgc2VsZi5jbGVhckVsZW1lbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcbiAgICAgIGxldCBzdGFydENlbGw7XHJcbiAgICAgIGxldCB3aWR0aDtcclxuICAgICAgbGV0IGhlaWdodDtcclxuICAgICAgbGV0IGNlbGxzO1xyXG5cclxuICAgICAgdGlsZS51cGRhdGVFbGVtKCcucGlwLWRyYWdnYWJsZS10aWxlJyk7XHJcbiAgICAgIGlmICh0aWxlU2l6ZS5jb2xTcGFuID09PSAxKSB7XHJcbiAgICAgICAgaWYgKHByZXZDZWxsICYmIHByZXZDZWxsLmVsZW0uc2l6ZS5jb2xTcGFuID09PSAyICYmIHByZXZDZWxsLmVsZW0uc2l6ZS5yb3dTcGFuID09PSAxKSB7XHJcbiAgICAgICAgICBzdGFydENlbGwgPSBzZWxmLmdldENlbGxzKHNlbGYuZ2V0Q2VsbEJ5UG9zaXRpb24ocHJldkNlbGwucm93LCBwcmV2Q2VsbC5jb2wgLSAxKSwgMSwgMSkuc3RhcnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXJ0Q2VsbCA9IHNlbGYuZ2V0Q2VsbHMocHJldkNlbGwsIDEsIDEpLnN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgICB3aWR0aCA9IHN0YXJ0Q2VsbC5yaWdodCAtIHN0YXJ0Q2VsbC5sZWZ0O1xyXG4gICAgICAgICAgaGVpZ2h0ID0gc3RhcnRDZWxsLmJvdHRvbSAtIHN0YXJ0Q2VsbC50b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmV2Q2VsbCA9IHN0YXJ0Q2VsbDtcclxuXHJcbiAgICAgICAgc2VsZi5yZXNlcnZlQ2VsbHMoc3RhcnRDZWxsLCBzdGFydENlbGwsIHRpbGUpO1xyXG5cclxuICAgICAgICBjdXJySW5kZXgrKztcclxuICAgICAgfSBlbHNlIGlmICh0aWxlU2l6ZS5jb2xTcGFuID09PSAyKSB7XHJcbiAgICAgICAgY2VsbHMgPSBzZWxmLmdldENlbGxzKHByZXZDZWxsLCB0aWxlU2l6ZS5yb3dTcGFuLCB0aWxlU2l6ZS5jb2xTcGFuKTtcclxuICAgICAgICBzdGFydENlbGwgPSBjZWxscy5zdGFydDtcclxuXHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIHdpZHRoID0gY2VsbHMuZW5kLnJpZ2h0IC0gY2VsbHMuc3RhcnQubGVmdDtcclxuICAgICAgICAgIGhlaWdodCA9IGNlbGxzLmVuZC5ib3R0b20gLSBjZWxscy5zdGFydC50b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmV2Q2VsbCA9IGNlbGxzLmVuZDtcclxuXHJcbiAgICAgICAgc2VsZi5yZXNlcnZlQ2VsbHMoY2VsbHMuc3RhcnQsIGNlbGxzLmVuZCwgdGlsZSk7XHJcblxyXG4gICAgICAgIGN1cnJJbmRleCArPSAyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW5kZXIgcHJldmlld1xyXG4gICAgICAvLyB3aGlsZSB0aWxlcyBmcm9tIGdyb3VwIGlzIGRyYWdnZWRcclxuICAgICAgaWYgKGRyYWdnZWRUaWxlID09PSB0aWxlKSB7XHJcbiAgICAgICAgdGlsZS5zZXRQcmV2aWV3UG9zaXRpb24oe1xyXG4gICAgICAgICAgbGVmdDogc3RhcnRDZWxsLmxlZnQsXHJcbiAgICAgICAgICB0b3A6IHN0YXJ0Q2VsbC50b3BcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgIHRpbGUuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGlsZS5zZXRQb3NpdGlvbihzdGFydENlbGwubGVmdCwgc3RhcnRDZWxsLnRvcCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgY2FsY0NvbnRhaW5lckhlaWdodCgpOiBhbnkge1xyXG4gICAgbGV0IG1heEhlaWdodFNpemUsIG1heFdpZHRoU2l6ZTtcclxuXHJcbiAgICBpZiAoIXRoaXMudGlsZXMubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIG1heEhlaWdodFNpemUgPSBfLm1heEJ5KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgIHJldHVybiB0aWxlU2l6ZS50b3AgKyB0aWxlU2l6ZS5oZWlnaHQ7XHJcbiAgICB9KVsnZ2V0U2l6ZSddKCk7XHJcblxyXG4gICAgdGhpcy5lbGVtLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodFNpemUudG9wICsgbWF4SGVpZ2h0U2l6ZS5oZWlnaHQgKyAncHgnO1xyXG5cclxuICAgIGlmICh0aGlzLmlubGluZSkge1xyXG4gICAgICBtYXhXaWR0aFNpemUgPSBfLm1heEJ5KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGlsZVNpemUgPSB0aWxlWydnZXRTaXplJ10oKTtcclxuICAgICAgICByZXR1cm4gdGlsZVNpemUubGVmdCArIHRpbGVTaXplLndpZHRoO1xyXG4gICAgICB9KVsnZ2V0U2l6ZSddKCk7XHJcblxyXG4gICAgICB0aGlzLmVsZW0uc3R5bGUud2lkdGggPSBtYXhXaWR0aFNpemUubGVmdCArIG1heFdpZHRoU2l6ZS53aWR0aCArICdweCc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldFRpbGVCeU5vZGUobm9kZSk6IGFueSB7XHJcbiAgICBjb25zdCBmb3VuZFRpbGUgPSB0aGlzLnRpbGVzLmZpbHRlcigodGlsZSkgPT4ge1xyXG4gICAgICByZXR1cm4gbm9kZSA9PT0gdGlsZS5nZXRFbGVtKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZm91bmRUaWxlLmxlbmd0aCA/IGZvdW5kVGlsZVswXSA6IG51bGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldFRpbGVCeUNvb3JkaW5hdGVzKGNvb3JkcywgZHJhZ2dlZFRpbGUpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMudGlsZXNcclxuICAgICAgLmZpbHRlcigodGlsZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aWxlICE9PSBkcmFnZ2VkVGlsZSAmJlxyXG4gICAgICAgICAgdGlsZVNpemUubGVmdCA8PSBjb29yZHMubGVmdCAmJiBjb29yZHMubGVmdCA8PSAodGlsZVNpemUubGVmdCArIHRpbGVTaXplLndpZHRoKSAmJlxyXG4gICAgICAgICAgdGlsZVNpemUudG9wIDw9IGNvb3Jkcy50b3AgJiYgY29vcmRzLnRvcCA8PSAodGlsZVNpemUudG9wICsgdGlsZVNpemUuaGVpZ2h0KTtcclxuICAgICAgfSlbMF0gfHwgbnVsbDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0VGlsZUluZGV4KHRpbGUpOiBhbnkge1xyXG4gICAgcmV0dXJuIF8uZmluZEluZGV4KHRoaXMudGlsZXMsIHRpbGUpO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzd2FwVGlsZXMobW92ZWRUaWxlLCBiZWZvcmVUaWxlKTogYW55IHtcclxuICAgIGNvbnN0IG1vdmVkVGlsZUluZGV4ID0gXy5maW5kSW5kZXgodGhpcy50aWxlcywgbW92ZWRUaWxlKTtcclxuICAgIGNvbnN0IGJlZm9yZVRpbGVJbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsIGJlZm9yZVRpbGUpO1xyXG5cclxuICAgIHRoaXMudGlsZXMuc3BsaWNlKG1vdmVkVGlsZUluZGV4LCAxKTtcclxuICAgIHRoaXMudGlsZXMuc3BsaWNlKGJlZm9yZVRpbGVJbmRleCwgMCwgbW92ZWRUaWxlKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgcmVtb3ZlVGlsZShyZW1vdmVUaWxlKTogYW55IHtcclxuICAgIGxldCBkcm9wcGVkVGlsZTtcclxuXHJcbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUsIGluZGV4LCB0aWxlcykgPT4ge1xyXG4gICAgICBpZiAodGlsZSA9PT0gcmVtb3ZlVGlsZSkge1xyXG4gICAgICAgIGRyb3BwZWRUaWxlID0gdGlsZXMuc3BsaWNlKGluZGV4LCAxKVswXTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBkcm9wcGVkVGlsZTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgdXBkYXRlVGlsZU9wdGlvbnMob3B0cyk6IGFueSB7XHJcbiAgICBjb25zdCBpbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aWxlWydnZXRPcHRpb25zJ10oKSA9PT0gb3B0cztcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy50aWxlc1tpbmRleF0uc2V0T3B0aW9ucyhvcHRzKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH07XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBEcmFnZ2VkJylcclxuICAuc2VydmljZSgncGlwVGlsZXNHcmlkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSkge1xyXG4gICAgICBsZXQgbmV3R3JpZCA9IG5ldyBUaWxlc0dyaWRTZXJ2aWNlKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdHcmlkO1xyXG4gICAgfVxyXG4gIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdwaXBEcmFnZ2VkJywgW10pO1xyXG5cclxuaW1wb3J0ICcuL0RyYWdnYWJsZVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0ICcuL0RyYWdnYWJsZSc7XHJcbmltcG9ydCAnLi9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UnXHJcbmltcG9ydCAnLi9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cERpcmVjdGl2ZSciLCJpbXBvcnQgJy4vd2lkZ2V0cy9pbmRleCc7XHJcbmltcG9ydCAnLi9kcmFnZ2FibGUvaW5kZXgnO1xyXG5jb25zb2xlLmxvZygnaGVyZScpO1xyXG5hbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkJywgW1xyXG4gICdwaXBXaWRnZXQnLFxyXG4gICdwaXBEcmFnZ2VkJyxcclxuICAncGlwRGFzaGJvYXJkRGlhbG9ncycsXHJcbiAgJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLFxyXG5cclxuICAvLyBFeHRlcm5hbCBwaXAgbW9kdWxlc1xyXG4gICdwaXBMYXlvdXQnLFxyXG4gICdwaXBMb2NhdGlvbnMnLFxyXG4gICdwaXBEYXRlVGltZScsXHJcbiAgJ3BpcENoYXJ0cycsXHJcbiAgJ3BpcFRyYW5zbGF0ZScsXHJcbiAgJ3BpcENvbnRyb2xzJyxcclxuICAncGlwQnV0dG9ucydcclxuXSk7XHJcblxyXG5pbXBvcnQgJy4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQgJy4vZGlhbG9ncy9pbmRleCc7XHJcbmltcG9ydCAnLi9EYXNoYm9hcmQnO1xyXG4iLCJleHBvcnQgaW50ZXJmYWNlIElXaWRnZXRUZW1wbGF0ZVNlcnZpY2Uge1xyXG4gICAgZ2V0VGVtcGxhdGUoc291cmNlLCB0cGwgPyAsIHRpbGVTY29wZSA/ICwgc3RyaWN0Q29tcGlsZSA/ICk6IGFueTtcclxuICAgIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSk6IHZvaWQ7XHJcbn0gXHJcblxyXG57XHJcbiAgICBjbGFzcyB3aWRnZXRUZW1wbGF0ZVNlcnZpY2UgaW1wbGVtZW50cyBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlIHtcclxuICAgICAgICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICAgICAgICBwcml2YXRlIF8kY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XHJcbiAgICAgICAgcHJpdmF0ZSBfJHRlbXBsYXRlUmVxdWVzdDogYW5ndWxhci5JVGVtcGxhdGVSZXF1ZXN0U2VydmljZTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgICRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXHJcbiAgICAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5fJGludGVycG9sYXRlID0gJGludGVycG9sYXRlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgICAgICAgICB0aGlzLl8kdGVtcGxhdGVSZXF1ZXN0ID0gJHRlbXBsYXRlUmVxdWVzdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55IHtcclxuICAgICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgICAgIHR5cGVcclxuICAgICAgICAgICAgfSA9IHNvdXJjZTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnBvbGF0ZWQgPSB0cGwgPyB0aGlzLl8kaW50ZXJwb2xhdGUodHBsKShzb3VyY2UpIDogdGhpcy5fJGludGVycG9sYXRlKHRlbXBsYXRlKShzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmljdENvbXBpbGUgPT0gdHJ1ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkpIDpcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKHRlbXBsYXRlKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVVcmwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyR0ZW1wbGF0ZVJlcXVlc3QodGVtcGxhdGVVcmwsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaHRtbCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGh0bWwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGxldFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGggPSAkZWxlbWVudC53aWR0aCA/ICRlbGVtZW50LndpZHRoKCkgOiAkZWxlbWVudC5jbGllbnRXaWR0aCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRlbGVtZW50LmhlaWdodCA/ICRlbGVtZW50LmhlaWdodCgpIDogJGVsZW1lbnQuY2xpZW50SGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxXaWR0aCA6IGltYWdlLm5hdHVyYWxXaWR0aCkgfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBpbWFnZUhlaWdodCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlV2lkdGggLyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lckhlaWdodCAtIGNvbnRhaW5lcldpZHRoKSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGltYWdlV2lkdGggKiBjb250YWluZXJIZWlnaHQgLyBpbWFnZUhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlSGVpZ2h0IC8gaW1hZ2VXaWR0aCAqIGNvbnRhaW5lcldpZHRoIC0gY29udGFpbmVySGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWyd3aWR0aCddID0gJycgKyBjb250YWluZXJXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQoaW1hZ2UpLmNzcyhjc3NQYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbWFnZSBsb2FkIGRpcmVjdGl2ZSBUT0RPOiByZW1vdmUgdG8gcGlwSW1hZ2VVdGlsc1xyXG4gICAgY29uc3QgSW1hZ2VMb2FkID0gZnVuY3Rpb24gSW1hZ2VMb2FkKCRwYXJzZTogbmcuSVBhcnNlU2VydmljZSk6IG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnBpcEltYWdlTG9hZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdsb2FkJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcGUsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAgICAgLnNlcnZpY2UoJ3BpcFdpZGdldFRlbXBsYXRlJywgd2lkZ2V0VGVtcGxhdGVTZXJ2aWNlKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3BpcEltYWdlTG9hZCcsIEltYWdlTG9hZCk7XHJcbn0iLCJleHBvcnQgaW50ZXJmYWNlIElEYXNoYm9hcmRXaWRnZXQge1xyXG4gICAgb3B0aW9uczogYW55O1xyXG4gICAgY29sb3I6IHN0cmluZztcclxuICAgIHNpemU6IE9iamVjdCB8IHN0cmluZyB8IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIERhc2hib2FyZFdpZGdldCBpbXBsZW1lbnRzIElEYXNoYm9hcmRXaWRnZXQge1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBjb2xvcjogc3RyaW5nO1xyXG4gICAgcHVibGljIHNpemU6IE9iamVjdCB8IHN0cmluZyB8IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG59IiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vZGlhbG9ncy90aWxlX2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbntcclxuICBjbGFzcyBDYWxlbmRhcldpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpcy5vcHRpb25zLm1lbnUgPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpIDogdGhpcy5tZW51O1xyXG4gICAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSB0aGlzLm9wdGlvbnMuZGF0ZSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLm9wdGlvbnMuY29sb3IgfHwgJ2JsdWUnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLnBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICAgICAgc2l6ZTogdGhpcy5vcHRpb25zLnNpemUsXHJcbiAgICAgICAgICBkYXRlOiB0aGlzLm9wdGlvbnMuZGF0ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvY2FsZW5kYXIvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGNvbnN0IENhbGVuZGFyV2lkZ2V0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucycsXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogQ2FsZW5kYXJXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL2NhbGVuZGFyL1dpZGdldENhbGVuZGFyLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwQ2FsZW5kYXJXaWRnZXQnLCBDYWxlbmRhcldpZGdldCk7XHJcblxyXG59IiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vZGlhbG9ncy90aWxlX2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJzsgXHJcbntcclxuICBjbGFzcyBFdmVudFdpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgICBwcml2YXRlIF9vbGRPcGFjaXR5OiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIG9wYWNpdHk6IG51bWJlciA9IDAuNTc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICRzY29wZTogbmcuSVNjb3BlLFxyXG4gICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1lbnUpIHRoaXMubWVudSA9IF8udW5pb24odGhpcy5tZW51LCB0aGlzLm9wdGlvbnMubWVudSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICB0aXRsZTogJ0NvbmZpZ3VyYXRlJyxcclxuICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5jb2xvciA9IHRoaXMub3B0aW9ucy5jb2xvciB8fCAnZ3JheSc7XHJcbiAgICAgIHRoaXMub3BhY2l0eSA9IHRoaXMub3B0aW9ucy5vcGFjaXR5IHx8IHRoaXMub3BhY2l0eTtcclxuXHJcbiAgICAgIHRoaXMuZHJhd0ltYWdlKCk7XHJcblxyXG4gICAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgICAkc2NvcGUuJHdhdGNoKCgpID0+IHtcclxuICAgICAgICByZXR1cm4gJGVsZW1lbnQuaXMoJzp2aXNpYmxlJyk7XHJcbiAgICAgIH0sIChuZXdWYWwpID0+IHtcclxuICAgICAgICB0aGlzLmRyYXdJbWFnZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRyYXdJbWFnZSgpIHtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbWFnZSkge1xyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkltYWdlTG9hZCh0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLl9vbGRPcGFjaXR5ID0gXy5jbG9uZSh0aGlzLm9wYWNpdHkpO1xyXG4gICAgICB0aGlzLnBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICAgICAgc2l6ZTogdGhpcy5vcHRpb25zLnNpemUgfHwge1xyXG4gICAgICAgICAgICBjb2xTcGFuOiAxLFxyXG4gICAgICAgICAgICByb3dTcGFuOiAxXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGF0ZTogdGhpcy5vcHRpb25zLmRhdGUsXHJcbiAgICAgICAgICB0aXRsZTogdGhpcy5vcHRpb25zLnRpdGxlLFxyXG4gICAgICAgICAgdGV4dDogdGhpcy5vcHRpb25zLnRleHQsXHJcbiAgICAgICAgICBvcGFjaXR5OiB0aGlzLm9wYWNpdHksXHJcbiAgICAgICAgICBvbk9wYWNpdHl0ZXN0OiAob3BhY2l0eSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXh0ZW5zaW9uVXJsOiAnd2lkZ2V0cy9ldmVudC9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTaXplKHJlc3VsdC5zaXplKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSByZXN1bHQuZGF0ZTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudGl0bGUgPSByZXN1bHQudGl0bGU7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnRleHQgPSByZXN1bHQudGV4dDtcclxuICAgICAgICB0aGlzLm9wdGlvbnMub3BhY2l0eSA9IHJlc3VsdC5vcGFjaXR5O1xyXG4gICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5fb2xkT3BhY2l0eTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkltYWdlTG9hZChpbWFnZSkge1xyXG4gICAgICB0aGlzLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuJGVsZW1lbnQucGFyZW50KCksIGltYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW1hZ2UpIHtcclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2V0SW1hZ2VNYXJnaW5DU1ModGhpcy4kZWxlbWVudC5wYXJlbnQoKSwgdGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKSk7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIExhdGVyIHJlcGxhY2UgYnkgcGlwSW1hZ2VVdGlscyBzZXZpY2UncyBmdW5jdGlvblxyXG4gICAgcHJpdmF0ZSBzZXRJbWFnZU1hcmdpbkNTUygkZWxlbWVudCwgaW1hZ2UpIHtcclxuICAgICAgbGV0XHJcbiAgICAgICAgY29udGFpbmVyV2lkdGggPSAkZWxlbWVudC53aWR0aCA/ICRlbGVtZW50LndpZHRoKCkgOiAkZWxlbWVudC5jbGllbnRXaWR0aCwgLy8gfHwgODAsXHJcbiAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGVsZW1lbnQuaGVpZ2h0ID8gJGVsZW1lbnQuaGVpZ2h0KCkgOiAkZWxlbWVudC5jbGllbnRIZWlnaHQsIC8vIHx8IDgwLFxyXG4gICAgICAgIGltYWdlV2lkdGggPSBpbWFnZVswXS5uYXR1cmFsV2lkdGggfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgaW1hZ2VIZWlnaHQgPSBpbWFnZVswXS5uYXR1cmFsSGVpZ2h0IHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICBtYXJnaW4gPSAwLFxyXG4gICAgICAgIGNzc1BhcmFtcyA9IHt9O1xyXG5cclxuICAgICAgaWYgKChpbWFnZVdpZHRoIC8gY29udGFpbmVyV2lkdGgpID4gKGltYWdlSGVpZ2h0IC8gY29udGFpbmVySGVpZ2h0KSkge1xyXG4gICAgICAgIG1hcmdpbiA9IC0oKGltYWdlV2lkdGggLyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lckhlaWdodCAtIGNvbnRhaW5lcldpZHRoKSAvIDIpO1xyXG4gICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBjb250YWluZXJIZWlnaHQgKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGltYWdlV2lkdGggKiBjb250YWluZXJIZWlnaHQgLyBpbWFnZUhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VIZWlnaHQgLyBpbWFnZVdpZHRoICogY29udGFpbmVyV2lkdGggLSBjb250YWluZXJIZWlnaHQpIC8gMik7XHJcbiAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgaW1hZ2VIZWlnaHQgKiBjb250YWluZXJXaWR0aCAvIGltYWdlV2lkdGggKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGNvbnRhaW5lcldpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGltYWdlLmNzcyhjc3NQYXJhbXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIGNvbnN0IEV2ZW50V2lkZ2V0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBFdmVudFdpZGdldENvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3dpZGdldHMvZXZlbnQvV2lkZ2V0RXZlbnQuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBFdmVudFdpZGdldCcsIEV2ZW50V2lkZ2V0KTtcclxufSIsImFuZ3VsYXIubW9kdWxlKCdwaXBXaWRnZXQnLCBbXSk7XHJcblxyXG5pbXBvcnQgJy4vY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXInO1xyXG5pbXBvcnQgJy4vZXZlbnQvV2lkZ2V0RXZlbnQnO1xyXG5pbXBvcnQgJy4vbWVudS9XaWRnZXRNZW51U2VydmljZSc7XHJcbmltcG9ydCAnLi9tZW51L1dpZGdldE1lbnVEaXJlY3RpdmUnO1xyXG5pbXBvcnQgJy4vbm90ZXMvV2lkZ2V0Tm90ZXMnO1xyXG5pbXBvcnQgJy4vcG9zaXRpb24vV2lkZ2V0UG9zaXRpb24nO1xyXG5pbXBvcnQgJy4vc3RhdGlzdGljcy9XaWRnZXRTdGF0aXN0aWNzJztcclxuaW1wb3J0ICcuL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXInO1xyXG4iLCIoKCkgPT4ge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5kaXJlY3RpdmUoJ3BpcE1lbnVXaWRnZXQnLCBwaXBNZW51V2lkZ2V0KTtcclxuXHJcbiAgZnVuY3Rpb24gcGlwTWVudVdpZGdldCgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0ICAgICAgICA6ICdFQScsXHJcbiAgICAgIHRlbXBsYXRlVXJsICAgICA6ICd3aWRnZXRzL21lbnUvV2lkZ2V0TWVudS5odG1sJ1xyXG4gICAgfTtcclxuICB9XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IERhc2hib2FyZFdpZGdldCB9IGZyb20gJy4uL1dpZGdldENsYXNzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBNZW51V2lkZ2V0U2VydmljZSBleHRlbmRzIERhc2hib2FyZFdpZGdldCB7XHJcbiAgcHVibGljIG1lbnU6IGFueSA9IFt7XHJcbiAgICB0aXRsZTogJ0NoYW5nZSBTaXplJyxcclxuICAgIGFjdGlvbjogYW5ndWxhci5ub29wLFxyXG4gICAgc3VibWVudTogW3tcclxuICAgICAgICB0aXRsZTogJzEgeCAxJyxcclxuICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgIHNpemVYOiAxLFxyXG4gICAgICAgICAgc2l6ZVk6IDFcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJzIgeCAxJyxcclxuICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgIHNpemVYOiAyLFxyXG4gICAgICAgICAgc2l6ZVk6IDFcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJzIgeCAyJyxcclxuICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgIHNpemVYOiAyLFxyXG4gICAgICAgICAgc2l6ZVk6IDJcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9XTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjYWxsQWN0aW9uKGFjdGlvbk5hbWUsIHBhcmFtcywgaXRlbSkge1xyXG4gICAgaWYgKHRoaXNbYWN0aW9uTmFtZV0pIHtcclxuICAgICAgdGhpc1thY3Rpb25OYW1lXS5jYWxsKHRoaXMsIHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGl0ZW1bJ2NsaWNrJ10pIHtcclxuICAgICAgaXRlbVsnY2xpY2snXS5jYWxsKGl0ZW0sIHBhcmFtcywgdGhpcyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuICB9O1xyXG59XHJcblxyXG57XHJcbiAgY2xhc3MgTWVudVdpZGdldFByb3ZpZGVyIHtcclxuICAgIHByaXZhdGUgX3NlcnZpY2U6IE1lbnVXaWRnZXRTZXJ2aWNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBwdWJsaWMgJGdldCgpIHtcclxuICAgICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX3NlcnZpY2UgPT0gbnVsbClcclxuICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE1lbnVXaWRnZXRTZXJ2aWNlKCk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5fc2VydmljZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAucHJvdmlkZXIoJ3BpcFdpZGdldE1lbnUnLCBNZW51V2lkZ2V0UHJvdmlkZXIpO1xyXG59IiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vZGlhbG9ncy90aWxlX2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbntcclxuICBjbGFzcyBOb3Rlc1dpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMubWVudSA9IHRoaXMub3B0aW9ucy5tZW51ID8gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KSA6IHRoaXMubWVudTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmNvbG9yID0gdGhpcy5vcHRpb25zLmNvbG9yIHx8ICdvcmFuZ2UnO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Db25maWdDbGljaygpIHtcclxuICAgICAgdGhpcy5waXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlLnNob3coe1xyXG4gICAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLWNhbGVuZGFyLWNvbmZpZycsXHJcbiAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgdGl0bGU6IHRoaXMub3B0aW9ucy50aXRsZSxcclxuICAgICAgICAgIHRleHQ6IHRoaXMub3B0aW9ucy50ZXh0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXh0ZW5zaW9uVXJsOiAnd2lkZ2V0cy9ub3Rlcy9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTaXplKHJlc3VsdC5zaXplKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudGV4dCA9IHJlc3VsdC50ZXh0O1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50aXRsZSA9IHJlc3VsdC50aXRsZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBOb3Rlc1dpZGdldDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogTm90ZXNXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL25vdGVzL1dpZGdldE5vdGVzLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwTm90ZXNXaWRnZXQnLCBOb3Rlc1dpZGdldCk7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQge1xyXG4gIE1lbnVXaWRnZXRTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudS9XaWRnZXRNZW51U2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVdpZGdldENvbmZpZ1NlcnZpY2VcclxufSBmcm9tICcuLi8uLi9kaWFsb2dzL3RpbGVfY29uZmlnL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRUZW1wbGF0ZVNlcnZpY2VcclxufSBmcm9tICcuLi8uLi91dGlsaXR5L1dpZGdldFRlbXBsYXRlVXRpbGl0eSc7XHJcblxyXG57XHJcbiAgY2xhc3MgUGljdHVyZVNsaWRlckNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgICBwdWJsaWMgYW5pbWF0aW9uVHlwZTogc3RyaW5nID0gJ2ZhZGluZyc7XHJcbiAgICBwdWJsaWMgYW5pbWF0aW9uSW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW55LFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBXaWRnZXRUZW1wbGF0ZTogSVdpZGdldFRlbXBsYXRlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25UeXBlID0gdGhpcy5vcHRpb25zLmFuaW1hdGlvblR5cGUgfHwgdGhpcy5hbmltYXRpb25UeXBlO1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uSW50ZXJ2YWwgfHwgdGhpcy5hbmltYXRpb25JbnRlcnZhbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkltYWdlTG9hZCgkZXZlbnQpIHtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5waXBXaWRnZXRUZW1wbGF0ZS5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLiRlbGVtZW50LnBhcmVudCgpLCAkZXZlbnQudGFyZ2V0KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcblxyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICBfLmVhY2godGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKSwgKGltYWdlKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBpcFdpZGdldFRlbXBsYXRlLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuJGVsZW1lbnQucGFyZW50KCksIGltYWdlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IFBpY3R1cmVTbGlkZXJXaWRnZXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IFBpY3R1cmVTbGlkZXJDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBQaWN0dXJlU2xpZGVyV2lkZ2V0JywgUGljdHVyZVNsaWRlcldpZGdldCk7XHJcbn0iLCJpbXBvcnQge1xyXG4gIE1lbnVXaWRnZXRTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudS9XaWRnZXRNZW51U2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVdpZGdldENvbmZpZ1NlcnZpY2VcclxufSBmcm9tICcuLi8uLi9kaWFsb2dzL3RpbGVfY29uZmlnL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNsYXNzIFBvc2l0aW9uV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICAgIHB1YmxpYyBzaG93UG9zaXRpb246IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW55LFxyXG4gICAgICBwcml2YXRlIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcExvY2F0aW9uRWRpdERpYWxvZzogYW55LFxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tZW51KSB0aGlzLm1lbnUgPSBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLm1lbnUucHVzaCh7XHJcbiAgICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub25Db25maWdDbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICB0aXRsZTogJ0NoYW5nZSBsb2NhdGlvbicsXHJcbiAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub3BlbkxvY2F0aW9uRWRpdERpYWxvZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLm9wdGlvbnMubG9jYXRpb24gPSB0aGlzLm9wdGlvbnMubG9jYXRpb24gfHwgdGhpcy5vcHRpb25zLnBvc2l0aW9uO1xyXG5cclxuICAgICAgJHNjb3BlLiR3YXRjaCgnd2lkZ2V0Q3RybC5vcHRpb25zLmxvY2F0aW9uJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgICAkc2NvcGUuJHdhdGNoKCgpID0+IHtcclxuICAgICAgICByZXR1cm4gJGVsZW1lbnQuaXMoJzp2aXNpYmxlJyk7XHJcbiAgICAgIH0sIChuZXdWYWwpID0+IHtcclxuICAgICAgICBpZiAobmV3VmFsID09IHRydWUpIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLnBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtcG9zaXRpb24tY29uZmlnJyxcclxuICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgbG9jYXRpb25OYW1lOiB0aGlzLm9wdGlvbnMubG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgaGlkZUNvbG9yczogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvcG9zaXRpb24vQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uTmFtZSA9IHJlc3VsdC5sb2NhdGlvbk5hbWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgICAgdGhpcy5yZURyYXdQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcGVuTG9jYXRpb25FZGl0RGlhbG9nKCkge1xyXG4gICAgICB0aGlzLnBpcExvY2F0aW9uRWRpdERpYWxvZy5zaG93KHtcclxuICAgICAgICBsb2NhdGlvbk5hbWU6IHRoaXMub3B0aW9ucy5sb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgbG9jYXRpb25Qb3M6IHRoaXMub3B0aW9ucy5sb2NhdGlvblxyXG4gICAgICB9LCAobmV3UG9zaXRpb24pID0+IHtcclxuICAgICAgICBpZiAobmV3UG9zaXRpb24pIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5sb2NhdGlvbiA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9uO1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uTmFtZSA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9OYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZURyYXdQb3NpdGlvbigpIHtcclxuICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSBmYWxzZTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSB0cnVlO1xyXG4gICAgICB9LCA1MCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgY29uc3QgUG9zaXRpb25XaWRnZXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJyxcclxuICAgICAgaW5kZXg6ICc9JyxcclxuICAgICAgZ3JvdXA6ICc9J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IFBvc2l0aW9uV2lkZ2V0Q29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5jb21wb25lbnQoJ3BpcFBvc2l0aW9uV2lkZ2V0JywgUG9zaXRpb25XaWRnZXQpO1xyXG59IiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNvbnN0IFNNQUxMX0NIQVJUOiBudW1iZXIgPSA3MDtcclxuICBjb25zdCBCSUdfQ0hBUlQ6IG51bWJlciA9IDI1MDtcclxuXHJcbiAgY2xhc3MgU3RhdGlzdGljc1dpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gICAgcHJpdmF0ZSBfJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlO1xyXG5cclxuICAgIHB1YmxpYyByZXNldDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGNoYXJ0U2l6ZTogbnVtYmVyID0gU01BTExfQ0hBUlQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHBpcFdpZGdldE1lbnU6IGFueSxcclxuICAgICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMubWVudSA9IHRoaXMub3B0aW9ucy5tZW51ID8gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KSA6IHRoaXMubWVudTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zZXRDaGFydFNpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICAgIHRoaXMucmVzZXQgPSB0cnVlO1xyXG4gICAgICB0aGlzLnNldENoYXJ0U2l6ZSgpO1xyXG4gICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZXNldCA9IGZhbHNlO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Q2hhcnRTaXplKCkge1xyXG4gICAgICB0aGlzLmNoYXJ0U2l6ZSA9IHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgPyBCSUdfQ0hBUlQgOiBTTUFMTF9DSEFSVDtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICBjb25zdCBTdGF0aXN0aWNzV2lkZ2V0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBTdGF0aXN0aWNzV2lkZ2V0Q29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnd2lkZ2V0cy9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBTdGF0aXN0aWNzV2lkZ2V0JywgU3RhdGlzdGljc1dpZGdldCk7XHJcbn0iLCIoZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnRGFzaGJvYXJkLmh0bWwnLFxuICAgICc8bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50IG1kLXJhaXNlZCBtZC1mYWIgbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIGFyaWEtbGFiZWw9XCJBZGQgY29tcG9uZW50XCIgbmctY2xpY2s9XCIkY3RybC5hZGRDb21wb25lbnQoKVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1c1wiIGNsYXNzPVwibWQtaGVhZGxpbmUgY2VudGVyZWQtYWRkLWljb25cIj48L21kLWljb24+PC9tZC1idXR0b24+PGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JpZC1ob2xkZXJcIj48cGlwLWRyYWdnYWJsZS1ncmlkIHBpcC10aWxlcy10ZW1wbGF0ZXM9XCIkY3RybC5ncm91cGVkV2lkZ2V0c1wiIHBpcC10aWxlcy1jb250ZXh0PVwiJGN0cmwud2lkZ2V0c0NvbnRleHRcIiBwaXAtZHJhZ2dhYmxlLWdyaWQ9XCIkY3RybC5kcmFnZ2FibGVHcmlkT3B0aW9uc1wiIHBpcC1ncm91cC1tZW51LWFjdGlvbnM9XCIkY3RybC5ncm91cE1lbnVBY3Rpb25zXCI+PC9waXAtZHJhZ2dhYmxlLWdyaWQ+PG1kLXByb2dyZXNzLWNpcmN1bGFyIG1kLW1vZGU9XCJpbmRldGVybWluYXRlXCIgY2xhc3M9XCJwcm9ncmVzcy1yaW5nXCI+PC9tZC1wcm9ncmVzcy1jaXJjdWxhcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkcmFnZ2FibGUvRHJhZ2dhYmxlLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ob2xkZXJcIj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cFwiIG5nLXJlcGVhdD1cImdyb3VwIGluICRjdHJsLmdyb3Vwc1wiIGRhdGEtZ3JvdXAtaWQ9XCJ7eyAkaW5kZXggfX1cIiBwaXAtZHJhZ2dhYmxlLXRpbGVzPVwiZ3JvdXAuc291cmNlXCI+PGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXAtdGl0bGUgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyXCI+PGRpdiBjbGFzcz1cInRpdGxlLWlucHV0LWNvbnRhaW5lclwiIG5nLWNsaWNrPVwiJGN0cmwub25UaXRsZUNsaWNrKGdyb3VwLCAkZXZlbnQpXCI+PGlucHV0IG5nLWlmPVwiZ3JvdXAuZWRpdGluZ05hbWVcIiBuZy1ibHVyPVwiJGN0cmwub25CbHVyVGl0bGVJbnB1dChncm91cClcIiBuZy1rZXlwcmVzcz1cIiRjdHJsLm9uS3llcHJlc3NUaXRsZUlucHV0KGdyb3VwLCAkZXZlbnQpXCIgbmctbW9kZWw9XCJncm91cC50aXRsZVwiPjxkaXYgY2xhc3M9XCJ0ZXh0LW92ZXJmbG93IGZsZXgtbm9uZVwiIG5nLWlmPVwiIWdyb3VwLmVkaXRpbmdOYW1lXCI+e3sgZ3JvdXAudGl0bGUgfX08L2Rpdj48L2Rpdj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgbmctc2hvdz1cImdyb3VwLmVkaXRpbmdOYW1lXCIgbmctY2xpY2s9XCIkY3RybC5jYW5jZWxFZGl0aW5nKGdyb3VwKVwiIGFyaWEtbGFiZWw9XCJDYW5jZWxcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmNyb3NzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1tZW51IGNsYXNzPVwiZmxleC1ub25lIGxheW91dC1jb2x1bW5cIiBtZC1wb3NpdGlvbi1tb2RlPVwidGFyZ2V0LXJpZ2h0IHRhcmdldFwiIG5nLXNob3c9XCIhZ3JvdXAuZWRpdGluZ05hbWVcIj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgbmctY2xpY2s9XCIkbWRPcGVuTWVudSgpOyBncm91cElkID0gJGluZGV4XCIgYXJpYS1sYWJlbD1cIk1lbnVcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmRvdHNcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLW1lbnUtY29udGVudCB3aWR0aD1cIjRcIj48bWQtbWVudS1pdGVtIG5nLXJlcGVhdD1cImFjdGlvbiBpbiAkY3RybC5ncm91cE1lbnVBY3Rpb25zXCI+PG1kLWJ1dHRvbiBuZy1jbGljaz1cImFjdGlvbi5jYWxsYmFjayhncm91cElkKVwiPnt7IGFjdGlvbi50aXRsZSB9fTwvbWQtYnV0dG9uPjwvbWQtbWVudS1pdGVtPjwvbWQtbWVudS1jb250ZW50PjwvbWQtbWVudT48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cCBmaWN0LWdyb3VwIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyIGxheW91dC1jb2x1bW4gdG0xNlwiPjxkaXYgY2xhc3M9XCJmaWN0LWdyb3VwLXRleHQtY29udGFpbmVyXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPnt7IFxcJ0RST1BfVE9fQ1JFQVRFX05FV19HUk9VUFxcJyB8IHRyYW5zbGF0ZSB9fTwvZGl2PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC1hZGQtY29tcG9uZW50LWRpYWxvZ1wiPjxtZC1kaWFsb2ctY29udGVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIj48ZGl2IGNsYXNzPVwidGhlbWUtZGl2aWRlciBwMTYgZmxleC1hdXRvXCI+PGgzIGNsYXNzPVwiaGlkZS14cyBtMCBibTE2IHRoZW1lLXRleHQtcHJpbWFyeVwiIGhpZGUteHM9XCJcIj57eyBcXCdEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfVElUTEVcXCcgfCB0cmFuc2xhdGUgfX08bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwibGF5b3V0LXJvdyBmbGV4LWF1dG8gbTAgdG0xNlwiPjxtZC1zZWxlY3QgY2xhc3M9XCJmbGV4LWF1dG8gbTAgdGhlbWUtdGV4dC1wcmltYXJ5XCIgbmctbW9kZWw9XCJkaWFsb2dDdHJsLmFjdGl2ZUdyb3VwSW5kZXhcIiBwbGFjZWhvbGRlcj1cInt7IFxcJ0RBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19DUkVBVEVfTkVXX0dST1VQXFwnIHwgdHJhbnNsYXRlIH19XCIgYXJpYS1sYWJlbD1cIkdyb3VwXCI+PG1kLW9wdGlvbiBuZy12YWx1ZT1cIiRpbmRleFwiIG5nLXJlcGVhdD1cImdyb3VwIGluIGRpYWxvZ0N0cmwuZ3JvdXBzXCI+e3sgZ3JvdXAgfX08L21kLW9wdGlvbj48L21kLXNlbGVjdD48L21kLWlucHV0LWNvbnRhaW5lcj48L2gzPjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtYm9keSBwaXAtc2Nyb2xsIHAwIGZsZXgtYXV0b1wiPjxwIGNsYXNzPVwibWQtYm9keS0xIHRoZW1lLXRleHQtc2Vjb25kYXJ5IG0wIGxwMTYgcnAxNlwiPnt7IFxcJ0RBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19VU0VfSE9UX0tFWVNcXCcgfCB0cmFuc2xhdGUgfX08L3A+PG1kLWxpc3QgbmctaW5pdD1cImdyb3VwSW5kZXggPSAkaW5kZXhcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiBkaWFsb2dDdHJsLmRlZmF1bHRXaWRnZXRzXCI+PG1kLWxpc3QtaXRlbSBjbGFzcz1cImxheW91dC1yb3cgcGlwLWxpc3QtaXRlbSBscDE2IHJwMTZcIiBuZy1yZXBlYXQ9XCJpdGVtIGluIGdyb3VwXCI+PGRpdiBjbGFzcz1cImljb24taG9sZGVyIGZsZXgtbm9uZVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6e3s6OiBpdGVtLmljb24gfX1cIj48L21kLWljb24+PGRpdiBjbGFzcz1cInBpcC1iYWRnZSB0aGVtZS1iYWRnZSBtZC13YXJuXCIgbmctaWY9XCJpdGVtLmFtb3VudFwiPjxzcGFuPnt7IGl0ZW0uYW1vdW50IH19PC9zcGFuPjwvZGl2PjwvZGl2PjxzcGFuIGNsYXNzPVwiZmxleC1hdXRvIGxtMjQgdGhlbWUtdGV4dC1wcmltYXJ5XCI+e3s6OiBpdGVtLnRpdGxlIH19PC9zcGFuPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmVcIiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuZW5jcmVhc2UoZ3JvdXBJbmRleCwgJGluZGV4KVwiIGFyaWEtbGFiZWw9XCJFbmNyZWFzZVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1cy1jaXJjbGVcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5kZWNyZWFzZShncm91cEluZGV4LCAkaW5kZXgpXCIgYXJpYS1sYWJlbD1cIkRlY3JlYXNlXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczptaW51cy1jaXJjbGVcIj48L21kLWljb24+PC9tZC1idXR0b24+PC9tZC1saXN0LWl0ZW0+PG1kLWRpdmlkZXIgY2xhc3M9XCJsbTcyIHRtOCBibThcIiBuZy1pZj1cImdyb3VwSW5kZXggIT09IChkaWFsb2dDdHJsLmRlZmF1bHRXaWRnZXRzLmxlbmd0aCAtIDEpXCI+PC9tZC1kaXZpZGVyPjwvbWQtbGlzdD48L2Rpdj48L21kLWRpYWxvZy1jb250ZW50PjxtZC1kaWFsb2ctYWN0aW9ucyBjbGFzcz1cImZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciB0aGVtZS1kaXZpZGVyIGRpdmlkZXItdG9wIHRoZW1lLXRleHQtcHJpbWFyeVwiPjxtZC1idXR0b24gbmctY2xpY2s9XCJkaWFsb2dDdHJsLmNhbmNlbCgpXCIgYXJpYS1sYWJlbD1cIkNhbmNlbFwiPnt7IFxcJ0NBTkNFTFxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjxtZC1idXR0b24gbmctY2xpY2s9XCJkaWFsb2dDdHJsLmFkZCgpXCIgbmctZGlzYWJsZWQ9XCJkaWFsb2dDdHJsLnRvdGFsV2lkZ2V0cyA9PT0gMFwiIGFyaWFsLWxhYmVsPVwiQWRkXCI+e3sgXFwnQUREXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PC9tZC1kaWFsb2ctYWN0aW9ucz48L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkaWFsb2dzL3RpbGVfY29uZmlnL0NvbmZpZ0RpYWxvZy5odG1sJyxcbiAgICAnPG1kLWRpYWxvZyBjbGFzcz1cInBpcC1kaWFsb2cgcGlwLXdpZGdldC1jb25maWctZGlhbG9nIHt7IHZtLnBhcmFtcy5kaWFsb2dDbGFzcyB9fVwiIHdpZHRoPVwiNDAwXCIgbWQtdGhlbWU9XCJ7e3ZtLnRoZW1lfX1cIj48cGlwLXdpZGdldC1jb25maWctZXh0ZW5kLWNvbXBvbmVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIiBwaXAtZGlhbG9nLXNjb3BlPVwidm1cIiBwaXAtZXh0ZW5zaW9uLXVybD1cInZtLmV4dGVuc2lvblVybFwiIHBpcC1hcHBseT1cInZtLm9uQXBwbHkodXBkYXRlZERhdGEpXCI+PC9waXAtd2lkZ2V0LWNvbmZpZy1leHRlbmQtY29tcG9uZW50PjwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3MvdGlsZV9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50Lmh0bWwnLFxuICAgICc8aDMgY2xhc3M9XCJ0bTAgZmxleC1ub25lXCI+e3sgXFwnREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1RJVExFXFwnIHwgdHJhbnNsYXRlIH19PC9oMz48ZGl2IGNsYXNzPVwicGlwLWJvZHkgcGlwLXNjcm9sbCBwMTYgYnAwIGZsZXgtYXV0b1wiPjxwaXAtZXh0ZW5zaW9uLXBvaW50PjwvcGlwLWV4dGVuc2lvbi1wb2ludD48cGlwLXRvZ2dsZS1idXR0b25zIGNsYXNzPVwiYm0xNlwiIG5nLWlmPVwiISRjdHJsLmhpZGVTaXplc1wiIHBpcC1idXR0b25zPVwiJGN0cmwuc2l6ZXNcIiBuZy1tb2RlbD1cIiRjdHJsLnNpemVJZFwiPjwvcGlwLXRvZ2dsZS1idXR0b25zPjxwaXAtY29sb3ItcGlja2VyIG5nLWlmPVwiISRjdHJsLmhpZGVDb2xvcnNcIiBwaXAtY29sb3JzPVwiJGN0cmwuY29sb3JzXCIgbmctbW9kZWw9XCIkY3RybC5jb2xvclwiPjwvcGlwLWNvbG9yLXBpY2tlcj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWZvb3RlciBmbGV4LW5vbmVcIj48ZGl2PjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uQ2FuY2VsKClcIj57eyBcXCdDQU5DRUxcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50XCIgbmctY2xpY2s9XCIkY3RybC5vbkFwcGx5KClcIj57eyBcXCdBUFBMWVxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvY2FsZW5kYXIvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoIGJtMTZcIj5EYXRlOjxtZC1kYXRlcGlja2VyIG5nLW1vZGVsPVwiJGN0cmwuZGF0ZVwiIGNsYXNzPVwidy1zdHJldGNoXCI+PC9tZC1kYXRlcGlja2VyPjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1jYWxlbmRhci13aWRnZXQge3sgJGN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbCB0cDBcIiBuZy1jbGFzcz1cInsgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIGJpZzogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIj48cGlwLW1lbnUtd2lkZ2V0PjwvcGlwLW1lbnUtd2lkZ2V0PjwvZGl2PjxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLWlmPVwiJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+PHNwYW4gY2xhc3M9XCJkYXRlIGxtMjQgcm0xMlwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZS5nZXREYXRlKCkgfX08L3NwYW4+PGRpdiBjbGFzcz1cImZsZXgtYXV0byBsYXlvdXQtY29sdW1uXCI+PHNwYW4gY2xhc3M9XCJ3ZWVrZGF5IG1kLWhlYWRsaW5lXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJtb250aC15ZWFyIG1kLWhlYWRsaW5lXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ01vbnRoIH19IHt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdFllYXIgfX08L3NwYW4+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cIndpZGdldC1jb250ZW50IGZsZXgtYXV0byBsYXlvdXQtY29sdW1uIGxheW91dC1hbGlnbi1zcGFjZS1hcm91bmQtY2VudGVyXCIgbmctaGlkZT1cIiRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPjxzcGFuIGNsYXNzPVwid2Vla2RheSBtZC1oZWFkbGluZVwiIG5nLWhpZGU9XCIkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDFcIj57eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRMb25nRGF5T2ZXZWVrIH19PC9zcGFuPiA8c3BhbiBjbGFzcz1cIndlZWtkYXlcIiBuZy1zaG93PVwiJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJkYXRlIGxtMTIgcm0xMlwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZS5nZXREYXRlKCkgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwibW9udGgteWVhciBtZC1oZWFkbGluZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdNb250aCB9fSB7eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRZZWFyIH19PC9zcGFuPjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvbWVudS9XaWRnZXRNZW51Lmh0bWwnLFxuICAgICc8bWQtbWVudSBjbGFzcz1cIndpZGdldC1tZW51XCIgbWQtcG9zaXRpb24tbW9kZT1cInRhcmdldC1yaWdodCB0YXJnZXRcIj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lXCIgbmctY2xpY2s9XCIkbWRPcGVuTWVudSgpXCIgYXJpYS1sYWJlbD1cIk1lbnVcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnZkb3RzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1tZW51LWNvbnRlbnQgd2lkdGg9XCI0XCI+PG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJpdGVtIGluICRjdHJsLm1lbnVcIj48bWQtYnV0dG9uIG5nLWlmPVwiIWl0ZW0uc3VibWVudVwiIG5nLWNsaWNrPVwiJGN0cmwuY2FsbEFjdGlvbihpdGVtLmFjdGlvbiwgaXRlbS5wYXJhbXMsIGl0ZW0pXCI+e3s6OiBpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+PG1kLW1lbnUgbmctaWY9XCJpdGVtLnN1Ym1lbnVcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwiJGN0cmwuY2FsbEFjdGlvbihpdGVtLmFjdGlvbilcIj57ezo6IGl0ZW0udGl0bGUgfX08L21kLWJ1dHRvbj48bWQtbWVudS1jb250ZW50PjxtZC1tZW51LWl0ZW0gbmctcmVwZWF0PVwic3ViaXRlbSBpbiBpdGVtLnN1Ym1lbnVcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwiJGN0cmwuY2FsbEFjdGlvbihzdWJpdGVtLmFjdGlvbiwgc3ViaXRlbS5wYXJhbXMsIHN1Yml0ZW0pXCI+e3s6OiBzdWJpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+PC9tZC1tZW51LWl0ZW0+PC9tZC1tZW51LWNvbnRlbnQ+PC9tZC1tZW51PjwvbWQtbWVudS1pdGVtPjwvbWQtbWVudS1jb250ZW50PjwvbWQtbWVudT4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL2V2ZW50L0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+PGxhYmVsPlRpdGxlOjwvbGFiZWw+IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGl0bGVcIj48L21kLWlucHV0LWNvbnRhaW5lcj5EYXRlOjxtZC1kYXRlcGlja2VyIG5nLW1vZGVsPVwiJGN0cmwuZGF0ZVwiIGNsYXNzPVwidy1zdHJldGNoIGJtOFwiPjwvbWQtZGF0ZXBpY2tlcj48bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoXCI+PGxhYmVsPkRlc2NyaXB0aW9uOjwvbGFiZWw+IDx0ZXh0YXJlYSB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGV4dFwiPlxcbicgK1xuICAgICcgICAgPC90ZXh0YXJlYT48L21kLWlucHV0LWNvbnRhaW5lcj5CYWNrZHJvcFxcJ3Mgb3BhY2l0eTo8bWQtc2xpZGVyIGFyaWEtbGFiZWw9XCJvcGFjaXR5XCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIjAuMVwiIG1heD1cIjAuOVwiIHN0ZXA9XCIwLjAxXCIgbmctbW9kZWw9XCIkY3RybC5vcGFjaXR5XCIgbmctY2hhbmdlPVwiJGN0cmwub25PcGFjaXR5dGVzdCgkY3RybC5vcGFjaXR5KVwiPjwvbWQtc2xpZGVyPjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvZXZlbnQvV2lkZ2V0RXZlbnQuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1ldmVudC13aWRnZXQge3sgJGN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwieyBzbWFsbDogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBtZWRpdW06ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgYmlnOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiPjxpbWcgbmctaWY9XCIkY3RybC5vcHRpb25zLmltYWdlXCIgbmctc3JjPVwie3skY3RybC5vcHRpb25zLmltYWdlfX1cIiBhbHQ9XCJ7eyRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lfX1cIj48ZGl2IGNsYXNzPVwidGV4dC1iYWNrZHJvcFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCB7eyAkY3RybC5vcGFjaXR5IH19KVwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgZmxleC1ub25lXCI+PHNwYW4gY2xhc3M9XCJ3aWRnZXQtdGl0bGUgZmxleC1hdXRvIHRleHQtb3ZlcmZsb3dcIj57eyAkY3RybC5vcHRpb25zLnRpdGxlIHx8ICRjdHJsLm9wdGlvbnMubmFtZSB9fTwvc3Bhbj48cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48ZGl2IGNsYXNzPVwidGV4dC1jb250YWluZXIgZmxleC1hdXRvIHBpcC1zY3JvbGxcIj48cCBjbGFzcz1cImRhdGUgZmxleC1ub25lXCIgbmctaWY9XCIkY3RybC5vcHRpb25zLmRhdGVcIj57eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRTaG9ydERhdGUgfX08L3A+PHAgY2xhc3M9XCJ0ZXh0IGZsZXgtYXV0b1wiPnt7ICRjdHJsLm9wdGlvbnMudGV4dCB8fCAkY3RybC5vcHRpb25zLmRlc2NyaXB0aW9uIH19PC9wPjwvZGl2PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvbm90ZXMvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoXCI+PG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCBibTBcIj48bGFiZWw+VGl0bGU6PC9sYWJlbD4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC50aXRsZVwiPjwvbWQtaW5wdXQtY29udGFpbmVyPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggdG0wXCI+PGxhYmVsPlRleHQ6PC9sYWJlbD4gPHRleHRhcmVhIHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC50ZXh0XCI+XFxuJyArXG4gICAgJyAgICA8L3RleHRhcmVhPjwvbWQtaW5wdXQtY29udGFpbmVyPjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvbm90ZXMvV2lkZ2V0Tm90ZXMuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1ub3Rlcy13aWRnZXQge3sgJGN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtblwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgZmxleC1ub25lXCIgbmctaWY9XCIkY3RybC5vcHRpb25zLnRpdGxlIHx8ICRjdHJsLm9wdGlvbnMubmFtZVwiPjxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgJGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWUgfX08L3NwYW4+PC9kaXY+PHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+PGRpdiBjbGFzcz1cInRleHQtY29udGFpbmVyIGZsZXgtYXV0byBwaXAtc2Nyb2xsXCI+PHA+e3sgJGN0cmwub3B0aW9ucy50ZXh0IH19PC9wPjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvcGljdHVyZV9zbGlkZXIvV2lkZ2V0UGljdHVyZVNsaWRlci5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLXBpY3R1cmUtc2xpZGVyLXdpZGdldCB7eyAkY3RybC5jb2xvciB9fSBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIG1lZGl1bTogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCIgaW5kZXg9XCJ7eyAkY3RybC5pbmRleCB9fVwiIGdyb3VwPVwie3sgJGN0cmwuZ3JvdXAgfX1cIj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbHAxNiBycDggbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIj48c3BhbiBjbGFzcz1cImZsZXggdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfX08L3NwYW4+PHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+PC9kaXY+PGRpdiBjbGFzcz1cInNsaWRlci1jb250YWluZXJcIj48ZGl2IHBpcC1pbWFnZS1zbGlkZXI9XCJcIiBwaXAtYW5pbWF0aW9uLXR5cGU9XCJcXCdmYWRpbmdcXCdcIiBwaXAtYW5pbWF0aW9uLWludGVydmFsPVwiJGN0cmwuYW5pbWF0aW9uSW50ZXJ2YWxcIiBuZy1pZj1cIiRjdHJsLmFuaW1hdGlvblR5cGUgPT0gXFwnZmFkaW5nXFwnXCI+PGRpdiBjbGFzcz1cInBpcC1hbmltYXRpb24tYmxvY2tcIiBuZy1yZXBlYXQ9XCJzbGlkZSBpbiAkY3RybC5vcHRpb25zLnNsaWRlc1wiPjxpbWcgbmctc3JjPVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBhbHQ9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIHBpcC1pbWFnZS1sb2FkPVwiJGN0cmwub25JbWFnZUxvYWQoJGV2ZW50KVwiPjxwIGNsYXNzPVwic2xpZGUtdGV4dFwiIG5nLWlmPVwic2xpZGUudGV4dFwiPnt7IHNsaWRlLnRleHQgfX08L3A+PC9kaXY+PC9kaXY+PGRpdiBwaXAtaW1hZ2Utc2xpZGVyPVwiXCIgcGlwLWFuaW1hdGlvbi10eXBlPVwiXFwnY2Fyb3VzZWxcXCdcIiBwaXAtYW5pbWF0aW9uLWludGVydmFsPVwiJGN0cmwuYW5pbWF0aW9uSW50ZXJ2YWxcIiBuZy1pZj1cIiRjdHJsLmFuaW1hdGlvblR5cGUgPT0gXFwnY2Fyb3VzZWxcXCdcIj48ZGl2IGNsYXNzPVwicGlwLWFuaW1hdGlvbi1ibG9ja1wiIG5nLXJlcGVhdD1cInNsaWRlIGluICRjdHJsLm9wdGlvbnMuc2xpZGVzXCI+PGltZyBuZy1zcmM9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIGFsdD1cInt7IHNsaWRlLmltYWdlIH19XCIgcGlwLWltYWdlLWxvYWQ9XCIkY3RybC5vbkltYWdlTG9hZCgkZXZlbnQpXCI+PHAgY2xhc3M9XCJzbGlkZS10ZXh0XCIgbmctaWY9XCJzbGlkZS50ZXh0XCI+e3sgc2xpZGUudGV4dCB9fTwvcD48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL3Bvc2l0aW9uL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+PGxhYmVsPkxvY2F0aW9uIG5hbWU6PC9sYWJlbD4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC5sb2NhdGlvbk5hbWVcIj48L21kLWlucHV0LWNvbnRhaW5lcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGlwLXBvc2l0aW9uLXdpZGdldCB3aWRnZXQtYm94IHAwIGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIiBuZy1jbGFzcz1cInsgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIGJpZzogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIiBpbmRleD1cInt7ICRjdHJsLmluZGV4IH19XCIgZ3JvdXA9XCJ7eyAkY3RybC5ncm91cCB9fVwiPjxkaXYgY2xhc3M9XCJwb3NpdGlvbi1hYnNvbHV0ZS1yaWdodC10b3BcIiBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmxvY2F0aW9uTmFtZVwiPjxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PjwvZGl2PjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBscDE2IHJwOCBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiIG5nLWlmPVwiJGN0cmwub3B0aW9ucy5sb2NhdGlvbk5hbWVcIj48c3BhbiBjbGFzcz1cImZsZXggdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lIH19PC9zcGFuPjxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PjwvZGl2PjxwaXAtbG9jYXRpb24tbWFwIGNsYXNzPVwiZmxleFwiIG5nLWlmPVwiJGN0cmwuc2hvd1Bvc2l0aW9uXCIgcGlwLXN0cmV0Y2g9XCJ0cnVlXCIgcGlwLXJlYmluZD1cInRydWVcIiBwaXAtbG9jYXRpb24tcG9zPVwiJGN0cmwub3B0aW9ucy5sb2NhdGlvblwiPjwvcGlwLWxvY2F0aW9uLW1hcD48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcy5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLXN0YXRpc3RpY3Mtd2lkZ2V0IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIiBuZy1jbGFzcz1cInsgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIGJpZzogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiPjxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgJGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWUgfX08L3NwYW4+PHBpcC1tZW51LXdpZGdldD48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMuc2VyaWVzICYmICEkY3RybC5yZXNldFwiPjxwaXAtcGllLWNoYXJ0IHBpcC1zZXJpZXM9XCIkY3RybC5vcHRpb25zLnNlcmllc1wiIG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuY2hhcnRUeXBlIHx8ICRjdHJsLm9wdGlvbnMuY2hhcnRUeXBlID09IFxcJ3BpZVxcJ1wiIHBpcC1kb251dD1cInRydWVcIiBwaXAtcGllLXNpemU9XCIkY3RybC5jaGFydFNpemVcIiBwaXAtc2hvdy10b3RhbD1cInRydWVcIiBwaXAtY2VudGVyZWQ9XCJ0cnVlXCI+PC9waXAtcGllLWNoYXJ0PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWRhc2hib2FyZC1odG1sLm1pbi5qcy5tYXBcbiJdfQ==