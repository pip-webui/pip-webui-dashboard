(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).dashboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var AddTileDialog = (function () {
    function AddTileDialog() {
    }
    return AddTileDialog;
}());
exports.AddTileDialog = AddTileDialog;
var AddTileDialogController = (function () {
    function AddTileDialogController(groups, activeGroupIndex, widgetList, $mdDialog) {
        this.activeGroupIndex = activeGroupIndex;
        this.$mdDialog = $mdDialog;
        this.totalTiles = 0;
        this.activeGroupIndex = _.isNumber(activeGroupIndex) ? activeGroupIndex : -1;
        this.defaultTiles = _.cloneDeep(widgetList);
        this.groups = _.map(groups, function (group) {
            return group['title'];
        });
    }
    AddTileDialogController.prototype.add = function () {
        this.$mdDialog.hide({
            groupIndex: this.activeGroupIndex,
            widgets: this.defaultTiles
        });
    };
    ;
    AddTileDialogController.prototype.cancel = function () {
        this.$mdDialog.cancel();
    };
    ;
    AddTileDialogController.prototype.encrease = function (groupIndex, widgetIndex) {
        var widget = this.defaultTiles[groupIndex][widgetIndex];
        widget.amount++;
        this.totalTiles++;
    };
    ;
    AddTileDialogController.prototype.decrease = function (groupIndex, widgetIndex) {
        var widget = this.defaultTiles[groupIndex][widgetIndex];
        widget.amount = widget.amount ? widget.amount - 1 : 0;
        this.totalTiles = this.totalTiles ? this.totalTiles - 1 : 0;
    };
    ;
    return AddTileDialogController;
}());
exports.AddTileDialogController = AddTileDialogController;
},{}],2:[function(require,module,exports){
"use strict";
var AddTileDialogController_1 = require("./AddTileDialogController");
{
    var setTranslations = function ($injector) {
        var pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
        if (pipTranslate) {
            pipTranslate.setTranslations('en', {
                DASHBOARD_ADD_TILE_DIALOG_TITLE: 'Add component',
                DASHBOARD_ADD_TILE_DIALOG_USE_HOT_KEYS: 'Use "Enter" or "+" buttons on keyboard to encrease and "Delete" or "-" to decrease tiles amount',
                DASHBOARD_ADD_TILE_DIALOG_CREATE_NEW_GROUP: 'Create new group'
            });
            pipTranslate.setTranslations('ru', {
                DASHBOARD_ADD_TILE_DIALOG_TITLE: 'Добавить компонент',
                DASHBOARD_ADD_TILE_DIALOG_USE_HOT_KEYS: 'Используйте "Enter" или "+" клавиши на клавиатуре чтобы увеличить и "Delete" or "-" чтобы уменшить количество тайлов',
                DASHBOARD_ADD_TILE_DIALOG_CREATE_NEW_GROUP: 'Создать новую группу'
            });
        }
    };
    setTranslations.$inject = ['$injector'];
    var AddTileDialogService_1 = (function () {
        function AddTileDialogService_1(widgetList, $mdDialog) {
            this.widgetList = widgetList;
            this.$mdDialog = $mdDialog;
        }
        AddTileDialogService_1.prototype.show = function (groups, activeGroupIndex) {
            var _this = this;
            return this.$mdDialog
                .show({
                templateUrl: 'add_tile_dialog/AddTile.html',
                bindToController: true,
                controller: AddTileDialogController_1.AddTileDialogController,
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
        return AddTileDialogService_1;
    }());
    var AddTileDialogProvider = (function () {
        function AddTileDialogProvider() {
            this._widgetList = null;
            this.configWidgetList = function (list) {
                this._widgetList = list;
            };
        }
        AddTileDialogProvider.prototype.$get = ['$mdDialog', function ($mdDialog) {
            "ngInject";
            if (this._service == null)
                this._service = new AddTileDialogService_1(this._widgetList, $mdDialog);
            return this._service;
        }];
        return AddTileDialogProvider;
    }());
    angular
        .module('pipAddDashboardTileDialog')
        .config(setTranslations)
        .provider('pipAddTileDialog', AddTileDialogProvider);
}
},{"./AddTileDialogController":1}],3:[function(require,module,exports){
"use strict";
angular
    .module('pipAddDashboardTileDialog', ['ngMaterial']);
require("./AddTileDialogController");
require("./AddTileProvider");
},{"./AddTileDialogController":1,"./AddTileProvider":2}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MenuTileService_1 = require("../menu_tile/MenuTileService");
{
    var CalendarTileController = (function (_super) {
        __extends(CalendarTileController, _super);
        function CalendarTileController(pipTileConfigDialogService) {
            var _this = _super.call(this) || this;
            _this.pipTileConfigDialogService = pipTileConfigDialogService;
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
        CalendarTileController.prototype.onConfigClick = function () {
            var _this = this;
            this.pipTileConfigDialogService.show({
                dialogClass: 'pip-calendar-config',
                locals: {
                    color: this.color,
                    size: this.options.size,
                    date: this.options.date,
                },
                extensionUrl: 'calendar_tile/ConfigDialogExtension.html'
            }, function (result) {
                _this.changeSize(result.size);
                _this.color = result.color;
                _this.options.color = result.color;
                _this.options.date = result.date;
            });
        };
        return CalendarTileController;
    }(MenuTileService_1.MenuTileService));
    var CalendarTile = {
        bindings: {
            options: '=pipOptions',
        },
        controller: CalendarTileController,
        templateUrl: 'calendar_tile/CalendarTile.html'
    };
    angular
        .module('pipDashboard')
        .component('pipCalendarTile', CalendarTile);
}
},{"../menu_tile/MenuTileService":17}],5:[function(require,module,exports){
"use strict";
var DashboardTile = (function () {
    function DashboardTile() {
    }
    return DashboardTile;
}());
exports.DashboardTile = DashboardTile;
},{}],6:[function(require,module,exports){
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
        name: 'DASHBOARD_TILE_CONFIG_DIALOG_SIZE_SMALL',
        id: '11'
    },
    {
        name: 'DASHBOARD_TILE_CONFIG_DIALOG_SIZE_WIDE',
        id: '21'
    },
    {
        name: 'DASHBOARD_TILE_CONFIG_DIALOG_SIZE_LARGE',
        id: '22'
    }
];
var TileConfigDialogController = (function () {
    TileConfigDialogController.$inject = ['params', 'extensionUrl', '$mdDialog'];
    function TileConfigDialogController(params, extensionUrl, $mdDialog) {
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
    TileConfigDialogController.prototype.onApply = function (updatedData) {
        this['size'].sizeX = Number(this.sizeId.substr(0, 1));
        this['size'].sizeY = Number(this.sizeId.substr(1, 1));
        this.$mdDialog.hide(updatedData);
    };
    return TileConfigDialogController;
}());
exports.TileConfigDialogController = TileConfigDialogController;
},{}],7:[function(require,module,exports){
{
    var TileConfigExtendComponentBindings = {
        pipExtensionUrl: '<',
        pipDialogScope: '<',
        pipApply: '&'
    };
    var TileConfigExtendComponentChanges = (function () {
        function TileConfigExtendComponentChanges() {
        }
        return TileConfigExtendComponentChanges;
    }());
    var TileConfigExtendComponentController = (function () {
        function TileConfigExtendComponentController($templateRequest, $compile, $scope, $element, $attrs) {
            this.$templateRequest = $templateRequest;
            this.$compile = $compile;
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
        }
        TileConfigExtendComponentController.prototype.$onChanges = function (changes) {
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
        TileConfigExtendComponentController.prototype.onApply = function () {
            this.pipApply({ updatedData: this });
        };
        return TileConfigExtendComponentController;
    }());
    var pipTileConfigComponent = {
        templateUrl: 'config_tile_dialog/ConfigDialogExtendComponent.html',
        controller: TileConfigExtendComponentController,
        bindings: TileConfigExtendComponentBindings
    };
    angular
        .module('pipConfigDashboardTileDialog')
        .component('pipTileConfigExtendComponent', pipTileConfigComponent);
}
},{}],8:[function(require,module,exports){
"use strict";
var ConfigDialogController_1 = require("./ConfigDialogController");
{
    var setTranslations = function ($injector) {
        var pipTranslate = $injector.has('pipTranslateProvider') ? $injector.get('pipTranslateProvider') : null;
        if (pipTranslate) {
            pipTranslate.setTranslations('en', {
                DASHBOARD_TILE_CONFIG_DIALOG_TITLE: 'Edit tile',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_SMALL: 'Small',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_WIDE: 'Wide',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_LARGE: 'Large'
            });
            pipTranslate.setTranslations('ru', {
                DASHBOARD_TILE_CONFIG_DIALOG_TITLE: 'Изменить виджет',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_SMALL: 'Мален.',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_WIDE: 'Широкий',
                DASHBOARD_TILE_CONFIG_DIALOG_SIZE_LARGE: 'Большой'
            });
        }
    };
    setTranslations.$inject = ['$injector'];
    var TileConfigDialogService = (function () {
        TileConfigDialogService.$inject = ['$mdDialog'];
        function TileConfigDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        TileConfigDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: params.templateUrl || 'dialogs/tile_config/ConfigDialog.html',
                controller: ConfigDialogController_1.TileConfigDialogController,
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
        return TileConfigDialogService;
    }());
    angular
        .module('pipConfigDashboardTileDialog')
        .config(setTranslations)
        .service('pipTileConfigDialogService', TileConfigDialogService);
}
},{"./ConfigDialogController":6}],9:[function(require,module,exports){
"use strict";
angular
    .module('pipConfigDashboardTileDialog', ['ngMaterial']);
require("./ConfigDialogController");
require("./ConfigDialogService");
require("./ConfigDialogExtendComponent");
},{"./ConfigDialogController":6,"./ConfigDialogExtendComponent":7,"./ConfigDialogService":8}],10:[function(require,module,exports){
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
    var configureAvailableWidgets = function (pipAddTileDialogProvider) {
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
    };
    configureAvailableWidgets.$inject = ['pipAddTileDialogProvider'];
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
        function DashboardController($scope, $rootScope, $attrs, $element, $timeout, $interpolate, pipAddTileDialog, pipTileTemplate) {
            var _this = this;
            this.$rootScope = $rootScope;
            this.$attrs = $attrs;
            this.$element = $element;
            this.$timeout = $timeout;
            this.$interpolate = $interpolate;
            this.pipAddTileDialog = pipAddTileDialog;
            this.pipTileTemplate = pipTileTemplate;
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
                            template: _this.pipTileTemplate.getTemplate(widget, _this._includeTpl)
                        };
                    });
            });
        };
        DashboardController.prototype.addComponent = function (groupIndex) {
            var _this = this;
            this.pipAddTileDialog
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
    var Dashboard = {
        bindings: {
            gridOptions: '=pipGridOptions',
            groupAdditionalActions: '=pipGroupActions',
            groupedWidgets: '=pipGroups'
        },
        controller: DashboardController,
        templateUrl: 'dashboard/Dashboard.html'
    };
    angular
        .module('pipDashboard')
        .config(configureAvailableWidgets)
        .config(setTranslations)
        .component('pipDashboard', Dashboard);
}
},{}],11:[function(require,module,exports){
"use strict";
var DraggableTileService_1 = require("./DraggableTileService");
var TileGroupService_1 = require("../tile_group/TileGroupService");
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
                _this.tileGroups.push(TileGroupService_1.ITilesGridConstructor(TileGroupService_1.TilesGridService, group.source, _this.opts, _this.availableColumns, _this.groupsContainers[_this.groupsContainers.length - 1])
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
                return TileGroupService_1.ITilesGridConstructor(TileGroupService_1.TilesGridService, group.source, opts, _this.availableColumns, groupsContainers[index])
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
    angular.module('pipDraggableTiles')
        .component('pipDraggableGrid', DragComponent);
}
},{"../tile_group/TileGroupService":24,"./DraggableTileService":12}],12:[function(require,module,exports){
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
    .module('pipDraggableTiles')
    .service('pipDragTile', function () {
    return function (options) {
        var newTile = new DragTileService(options);
        return newTile;
    };
});
},{}],13:[function(require,module,exports){
"use strict";
angular.module('pipDraggableTiles', []);
require("./DraggableTileService");
require("./Draggable");
},{"./Draggable":11,"./DraggableTileService":12}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MenuTileService_1 = require("../menu_tile/MenuTileService");
{
    var EventTileController = (function (_super) {
        __extends(EventTileController, _super);
        function EventTileController($scope, $element, $timeout, pipTileConfigDialogService) {
            var _this = _super.call(this) || this;
            _this.$element = $element;
            _this.$timeout = $timeout;
            _this.pipTileConfigDialogService = pipTileConfigDialogService;
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
        EventTileController.prototype.drawImage = function () {
            var _this = this;
            if (this.options.image) {
                this.$timeout(function () {
                    _this.onImageLoad(_this.$element.find('img'));
                }, 500);
            }
        };
        EventTileController.prototype.onConfigClick = function () {
            var _this = this;
            this._oldOpacity = _.clone(this.opacity);
            this.pipTileConfigDialogService.show({
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
                extensionUrl: 'event_tile/ConfigDialogExtension.html'
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
        EventTileController.prototype.onImageLoad = function (image) {
            this.setImageMarginCSS(this.$element.parent(), image);
        };
        EventTileController.prototype.changeSize = function (params) {
            var _this = this;
            this.options.size.colSpan = params.sizeX;
            this.options.size.rowSpan = params.sizeY;
            if (this.options.image) {
                this.$timeout(function () {
                    _this.setImageMarginCSS(_this.$element.parent(), _this.$element.find('img'));
                }, 500);
            }
        };
        EventTileController.prototype.setImageMarginCSS = function ($element, image) {
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
        return EventTileController;
    }(MenuTileService_1.MenuTileService));
    var EventTile = {
        bindings: {
            options: '=pipOptions'
        },
        controller: EventTileController,
        templateUrl: 'event_tile/EventTile.html'
    };
    angular
        .module('pipDashboard')
        .component('pipEventTile', EventTile);
}
},{"../menu_tile/MenuTileService":17}],15:[function(require,module,exports){
"use strict";
require("./tile_group/index");
require("./draggable");
require("./menu_tile");
require("./add_tile_dialog");
require("./config_tile_dialog");
angular.module('pipDashboard', [
    'pipDraggableTiles',
    'pipDraggableTilesGroup',
    'pipMenuTile',
    'pipConfigDashboardTileDialog',
    'pipAddDashboardTileDialog',
    'pipDashboard.Templates',
    'pipLayout',
    'pipLocations',
    'pipDateTime',
    'pipCharts',
    'pipTranslate',
    'pipControls',
    'pipButtons'
]);
require("./utility/TileTemplateUtility");
require("./common_tile/Tile");
require("./calendar_tile/CalendarTile");
require("./event_tile/EventTile");
require("./note_tile/NoteTile");
require("./picture_slider_tile/PictureSliderTile");
require("./position_tile/PositionTile");
require("./statistics_tile/StatisticsTile");
require("./dashboard/Dashboard");
},{"./add_tile_dialog":3,"./calendar_tile/CalendarTile":4,"./common_tile/Tile":5,"./config_tile_dialog":9,"./dashboard/Dashboard":10,"./draggable":13,"./event_tile/EventTile":14,"./menu_tile":18,"./note_tile/NoteTile":19,"./picture_slider_tile/PictureSliderTile":20,"./position_tile/PositionTile":21,"./statistics_tile/StatisticsTile":22,"./tile_group/index":25,"./utility/TileTemplateUtility":26}],16:[function(require,module,exports){
{
    var MenuTile = function () {
        return {
            restrict: 'EA',
            templateUrl: 'menu_tile/MenuTile.html'
        };
    };
    angular
        .module('pipMenuTile')
        .directive('pipMenuTile', MenuTile);
}
},{}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Tile_1 = require("../common_tile/Tile");
var MenuTileService = (function (_super) {
    __extends(MenuTileService, _super);
    function MenuTileService() {
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
    MenuTileService.prototype.callAction = function (actionName, params, item) {
        if (this[actionName]) {
            this[actionName].call(this, params);
        }
        if (item['click']) {
            item['click'].call(item, params, this);
        }
    };
    ;
    MenuTileService.prototype.changeSize = function (params) {
        this.options.size.colSpan = params.sizeX;
        this.options.size.rowSpan = params.sizeY;
    };
    ;
    return MenuTileService;
}(Tile_1.DashboardTile));
exports.MenuTileService = MenuTileService;
{
    var MenuTileProvider = (function () {
        function MenuTileProvider() {
        }
        MenuTileProvider.prototype.$get = function () {
            "ngInject";
            if (this._service == null)
                this._service = new MenuTileService();
            return this._service;
        };
        return MenuTileProvider;
    }());
    angular
        .module('pipMenuTile')
        .provider('pipMenuTile', MenuTileProvider);
}
},{"../common_tile/Tile":5}],18:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
angular
    .module('pipMenuTile', []);
require("./MenuTileDirective");
require("./MenuTileService");
__export(require("./MenuTileService"));
},{"./MenuTileDirective":16,"./MenuTileService":17}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MenuTileService_1 = require("../menu_tile/MenuTileService");
{
    var NoteTileController = (function (_super) {
        __extends(NoteTileController, _super);
        function NoteTileController(pipTileConfigDialogService) {
            var _this = _super.call(this) || this;
            _this.pipTileConfigDialogService = pipTileConfigDialogService;
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
        NoteTileController.prototype.onConfigClick = function () {
            var _this = this;
            this.pipTileConfigDialogService.show({
                locals: {
                    color: this.color,
                    size: this.options.size,
                    title: this.options.title,
                    text: this.options.text,
                },
                extensionUrl: 'note_tile/ConfigDialogExtension.html'
            }, function (result) {
                _this.color = result.color;
                _this.options.color = result.color;
                _this.changeSize(result.size);
                _this.options.text = result.text;
                _this.options.title = result.title;
            });
        };
        return NoteTileController;
    }(MenuTileService_1.MenuTileService));
    var NoteTile = {
        bindings: {
            options: '=pipOptions'
        },
        controller: NoteTileController,
        templateUrl: 'note_tile/NoteTile.html'
    };
    angular
        .module('pipDashboard')
        .component('pipNoteTile', NoteTile);
}
},{"../menu_tile/MenuTileService":17}],20:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MenuTileService_1 = require("../menu_tile/MenuTileService");
{
    var PictureSliderController = (function (_super) {
        __extends(PictureSliderController, _super);
        function PictureSliderController($scope, $element, $timeout, pipTileTemplate) {
            var _this = _super.call(this) || this;
            _this.$scope = $scope;
            _this.$element = $element;
            _this.$timeout = $timeout;
            _this.pipTileTemplate = pipTileTemplate;
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
                _this.pipTileTemplate.setImageMarginCSS(_this.$element.parent(), $event.target);
            });
        };
        PictureSliderController.prototype.changeSize = function (params) {
            var _this = this;
            this.options.size.colSpan = params.sizeX;
            this.options.size.rowSpan = params.sizeY;
            this.$timeout(function () {
                _.each(_this.$element.find('img'), function (image) {
                    _this.pipTileTemplate.setImageMarginCSS(_this.$element.parent(), image);
                });
            }, 500);
        };
        return PictureSliderController;
    }(MenuTileService_1.MenuTileService));
    var PictureSliderTile = {
        bindings: {
            options: '=pipOptions'
        },
        controller: PictureSliderController,
        templateUrl: 'picture_slider_tile/PictureSliderTile.html'
    };
    angular
        .module('pipDashboard')
        .component('pipPictureSliderTile', PictureSliderTile);
}
},{"../menu_tile/MenuTileService":17}],21:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MenuTileService_1 = require("../menu_tile/MenuTileService");
{
    var PositionTileController = (function (_super) {
        __extends(PositionTileController, _super);
        function PositionTileController($scope, $timeout, $element, pipTileConfigDialogService, pipLocationEditDialog) {
            var _this = _super.call(this) || this;
            _this.$timeout = $timeout;
            _this.$element = $element;
            _this.pipTileConfigDialogService = pipTileConfigDialogService;
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
            $scope.$watch('$ctrl.options.location', function () {
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
        PositionTileController.prototype.onConfigClick = function () {
            var _this = this;
            this.pipTileConfigDialogService.show({
                dialogClass: 'pip-position-config',
                locals: {
                    size: this.options.size,
                    locationName: this.options.locationName,
                    hideColors: true,
                },
                extensionUrl: 'position_tile/ConfigDialogExtension.html'
            }, function (result) {
                _this.changeSize(result.size);
                _this.options.locationName = result.locationName;
            });
        };
        PositionTileController.prototype.changeSize = function (params) {
            this.options.size.colSpan = params.sizeX;
            this.options.size.rowSpan = params.sizeY;
            this.reDrawPosition();
        };
        PositionTileController.prototype.openLocationEditDialog = function () {
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
        PositionTileController.prototype.reDrawPosition = function () {
            var _this = this;
            this.showPosition = false;
            this.$timeout(function () {
                _this.showPosition = true;
            }, 50);
        };
        return PositionTileController;
    }(MenuTileService_1.MenuTileService));
    var PositionTile = {
        bindings: {
            options: '=pipOptions'
        },
        controller: PositionTileController,
        templateUrl: 'position_tile/PositionTile.html'
    };
    angular
        .module('pipDashboard')
        .component('pipPositionTile', PositionTile);
}
},{"../menu_tile/MenuTileService":17}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MenuTileService_1 = require("../menu_tile/MenuTileService");
{
    var SMALL_CHART_1 = 70;
    var BIG_CHART_1 = 250;
    var StatisticsTileController = (function (_super) {
        __extends(StatisticsTileController, _super);
        function StatisticsTileController(pipTileMenu, $scope, $timeout) {
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
        StatisticsTileController.prototype.changeSize = function (params) {
            var _this = this;
            this.options.size.colSpan = params.sizeX;
            this.options.size.rowSpan = params.sizeY;
            this.reset = true;
            this.setChartSize();
            this._$timeout(function () {
                _this.reset = false;
            }, 500);
        };
        StatisticsTileController.prototype.setChartSize = function () {
            this.chartSize = this.options.size.colSpan == 2 && this.options.size.rowSpan == 2 ? BIG_CHART_1 : SMALL_CHART_1;
        };
        return StatisticsTileController;
    }(MenuTileService_1.MenuTileService));
    var StatisticsTile = {
        bindings: {
            options: '=pipOptions'
        },
        controller: StatisticsTileController,
        templateUrl: 'statistics_tile/StatisticsTile.html'
    };
    angular
        .module('pipDashboard')
        .component('pipStatisticsTile', StatisticsTile);
}
},{"../menu_tile/MenuTileService":17}],23:[function(require,module,exports){
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
    console.log('here 3');
    angular
        .module('pipDraggableTilesGroup')
        .directive('pipDraggableTiles', DraggableTile);
}
},{}],24:[function(require,module,exports){
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
{
    angular
        .module('pipDraggableTilesGroup', [])
        .service('pipTilesGrid', function () {
        return function (tiles, options, columns, elem) {
            var newGrid = new TilesGridService(tiles, options, columns, elem);
            return newGrid;
        };
    });
}
},{}],25:[function(require,module,exports){
"use strict";
console.log('here 1');
angular
    .module('pipDraggableTilesGroup', []);
console.log('pipDraggableTilesGroup defined');
require("./TileGroupDirective");
require("./TileGroupService");
},{"./TileGroupDirective":23,"./TileGroupService":24}],26:[function(require,module,exports){
"use strict";
{
    var tileTemplateService = (function () {
        tileTemplateService.$inject = ['$interpolate', '$compile', '$templateRequest'];
        function tileTemplateService($interpolate, $compile, $templateRequest) {
            this._$interpolate = $interpolate;
            this._$compile = $compile;
            this._$templateRequest = $templateRequest;
        }
        tileTemplateService.prototype.getTemplate = function (source, tpl, tileScope, strictCompile) {
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
        tileTemplateService.prototype.setImageMarginCSS = function ($element, image) {
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
        return tileTemplateService;
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
        .service('pipTileTemplate', tileTemplateService)
        .directive('pipImageLoad', ImageLoad);
}
},{}],27:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('add_tile_dialog/AddTile.html',
    '<md-dialog class="pip-dialog pip-add-component-dialog"><md-dialog-content class="layout-column"><div class="theme-divider p16 flex-auto"><h3 class="hide-xs m0 bm16 theme-text-primary" hide-xs="">{{ \'DASHBOARD_ADD_TILE_DIALOG_TITLE\' | translate }}<md-input-container class="layout-row flex-auto m0 tm16"><md-select class="flex-auto m0 theme-text-primary" ng-model="dialogCtrl.activeGroupIndex" placeholder="{{ \'DASHBOARD_ADD_TILE_DIALOG_CREATE_NEW_GROUP\' | translate }}" aria-label="Group"><md-option ng-value="$index" ng-repeat="group in dialogCtrl.groups">{{ group }}</md-option></md-select></md-input-container></h3></div><div class="pip-body pip-scroll p0 flex-auto"><p class="md-body-1 theme-text-secondary m0 lp16 rp16">{{ \'DASHBOARD_ADD_TILE_DIALOG_USE_HOT_KEYS\' | translate }}</p><md-list ng-init="groupIndex = $index" ng-repeat="group in dialogCtrl.defaultWidgets"><md-list-item class="layout-row pip-list-item lp16 rp16" ng-repeat="item in group"><div class="icon-holder flex-none"><md-icon md-svg-icon="icons:{{:: item.icon }}"></md-icon><div class="pip-badge theme-badge md-warn" ng-if="item.amount"><span>{{ item.amount }}</span></div></div><span class="flex-auto lm24 theme-text-primary">{{:: item.title }}</span><md-button class="md-icon-button flex-none" ng-click="dialogCtrl.encrease(groupIndex, $index)" aria-label="Encrease"><md-icon md-svg-icon="icons:plus-circle"></md-icon></md-button><md-button class="md-icon-button flex-none" ng-click="dialogCtrl.decrease(groupIndex, $index)" aria-label="Decrease"><md-icon md-svg-icon="icons:minus-circle"></md-icon></md-button></md-list-item><md-divider class="lm72 tm8 bm8" ng-if="groupIndex !== (dialogCtrl.defaultWidgets.length - 1)"></md-divider></md-list></div></md-dialog-content><md-dialog-actions class="flex-none layout-align-end-center theme-divider divider-top theme-text-primary"><md-button ng-click="dialogCtrl.cancel()" aria-label="Cancel">{{ \'CANCEL\' | translate }}</md-button><md-button ng-click="dialogCtrl.add()" ng-disabled="dialogCtrl.totalWidgets === 0" arial-label="Add">{{ \'ADD\' | translate }}</md-button></md-dialog-actions></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('calendar_tile/CalendarTile.html',
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
  $templateCache.put('calendar_tile/ConfigDialogExtension.html',
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
  $templateCache.put('config_tile_dialog/ConfigDialog.html',
    '<md-dialog class="pip-dialog pip-tile-config-dialog {{ vm.params.dialogClass }}" width="400" md-theme="{{vm.theme}}"><pip-tile-config-extend-component class="layout-column" pip-dialog-scope="vm" pip-extension-url="vm.extensionUrl" pip-apply="vm.onApply(updatedData)"></pip-tile-config-extend-component></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('config_tile_dialog/ConfigDialogExtendComponent.html',
    '<h3 class="tm0 flex-none">{{ \'DASHBOARD_TILE_CONFIG_DIALOG_TITLE\' | translate }}</h3><div class="pip-body pip-scroll p16 bp0 flex-auto"><pip-extension-point></pip-extension-point><pip-toggle-buttons class="bm16" ng-if="!$ctrl.hideSizes" pip-buttons="$ctrl.sizes" ng-model="$ctrl.sizeId"></pip-toggle-buttons><pip-color-picker ng-if="!$ctrl.hideColors" pip-colors="$ctrl.colors" ng-model="$ctrl.color"></pip-color-picker></div><div class="pip-footer flex-none"><div><md-button class="md-accent" ng-click="$ctrl.onCancel()">{{ \'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-click="$ctrl.onApply()">{{ \'APPLY\' | translate }}</md-button></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDashboard.Templates');
} catch (e) {
  module = angular.module('pipDashboard.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('dashboard/Dashboard.html',
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
  $templateCache.put('event_tile/ConfigDialogExtension.html',
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
  $templateCache.put('event_tile/EventTile.html',
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
  $templateCache.put('menu_tile/MenuTile.html',
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
  $templateCache.put('note_tile/ConfigDialogExtension.html',
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
  $templateCache.put('note_tile/NoteTile.html',
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
  $templateCache.put('position_tile/ConfigDialogExtension.html',
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
  $templateCache.put('position_tile/PositionTile.html',
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
  $templateCache.put('picture_slider_tile/PictureSliderTile.html',
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
  $templateCache.put('statistics_tile/StatisticsTile.html',
    '<div class="widget-box pip-statistics-widget layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }"><div class="widget-heading layout-row layout-align-start-center flex-none"><span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span><pip-menu-widget></pip-menu-widget></div><div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="$ctrl.options.series && !$ctrl.reset"><pip-pie-chart pip-series="$ctrl.options.series" ng-if="!$ctrl.options.chartType || $ctrl.options.chartType == \'pie\'" pip-donut="true" pip-pie-size="$ctrl.chartSize" pip-show-total="true" pip-centered="true"></pip-pie-chart></div></div>');
}]);
})();



},{}]},{},[15,27])(27)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRkX3RpbGVfZGlhbG9nL0FkZFRpbGVEaWFsb2dDb250cm9sbGVyLnRzIiwic3JjL2FkZF90aWxlX2RpYWxvZy9BZGRUaWxlUHJvdmlkZXIudHMiLCJzcmMvYWRkX3RpbGVfZGlhbG9nL2luZGV4LnRzIiwic3JjL2NhbGVuZGFyX3RpbGUvQ2FsZW5kYXJUaWxlLnRzIiwic3JjL2NvbW1vbl90aWxlL1RpbGUudHMiLCJzcmMvY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXIudHMiLCJzcmMvY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudC50cyIsInNyYy9jb25maWdfdGlsZV9kaWFsb2cvQ29uZmlnRGlhbG9nU2VydmljZS50cyIsInNyYy9jb25maWdfdGlsZV9kaWFsb2cvaW5kZXgudHMiLCJzcmMvZGFzaGJvYXJkL0Rhc2hib2FyZC50cyIsInNyYy9kcmFnZ2FibGUvRHJhZ2dhYmxlLnRzIiwic3JjL2RyYWdnYWJsZS9EcmFnZ2FibGVUaWxlU2VydmljZS50cyIsInNyYy9kcmFnZ2FibGUvaW5kZXgudHMiLCJzcmMvZXZlbnRfdGlsZS9FdmVudFRpbGUudHMiLCJzcmMvaW5kZXgudHMiLCJzcmMvbWVudV90aWxlL01lbnVUaWxlRGlyZWN0aXZlLnRzIiwic3JjL21lbnVfdGlsZS9NZW51VGlsZVNlcnZpY2UudHMiLCJzcmMvbWVudV90aWxlL2luZGV4LnRzIiwic3JjL25vdGVfdGlsZS9Ob3RlVGlsZS50cyIsInNyYy9waWN0dXJlX3NsaWRlcl90aWxlL1BpY3R1cmVTbGlkZXJUaWxlLnRzIiwic3JjL3Bvc2l0aW9uX3RpbGUvUG9zaXRpb25UaWxlLnRzIiwic3JjL3N0YXRpc3RpY3NfdGlsZS9TdGF0aXN0aWNzVGlsZS50cyIsInNyYy90aWxlX2dyb3VwL1RpbGVHcm91cERpcmVjdGl2ZS50cyIsInNyYy90aWxlX2dyb3VwL1RpbGVHcm91cFNlcnZpY2UudHMiLCJzcmMvdGlsZV9ncm91cC9pbmRleC50cyIsInNyYy91dGlsaXR5L1RpbGVUZW1wbGF0ZVV0aWxpdHkudHMiLCJ0ZW1wL3BpcC13ZWJ1aS1kYXNoYm9hcmQtaHRtbC5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7SUFBQTtJQUtBLENBQUM7SUFBRCxvQkFBQztBQUFELENBTEEsQUFLQyxJQUFBO0FBTFksc0NBQWE7QUFPMUI7SUFLSSxpQ0FDSSxNQUFXLEVBQ0osZ0JBQXdCLEVBQy9CLFVBQTZCLEVBQ3RCLFNBQTBDO1FBRjFDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUTtRQUV4QixjQUFTLEdBQVQsU0FBUyxDQUFpQztRQU45QyxlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBUTFCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0scUNBQUcsR0FBVjtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2hCLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ2pDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtTQUM3QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQUEsQ0FBQztJQUVLLHdDQUFNLEdBQWI7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFBQSxDQUFDO0lBRUssMENBQVEsR0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGNsYXNzIEFkZFRpbGVEaWFsb2cge1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIGljb246IHN0cmluZztcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGFtb3VudDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQWRkVGlsZURpYWxvZ0NvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciB7XHJcbiAgICBwdWJsaWMgZGVmYXVsdFRpbGVzOiBbQWRkVGlsZURpYWxvZ1tdXTtcclxuICAgIHB1YmxpYyBncm91cHM6IGFueTtcclxuICAgIHB1YmxpYyB0b3RhbFRpbGVzOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGdyb3VwczogYW55LFxyXG4gICAgICAgIHB1YmxpYyBhY3RpdmVHcm91cEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgd2lkZ2V0TGlzdDogW0FkZFRpbGVEaWFsb2dbXV0sXHJcbiAgICAgICAgcHVibGljICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVHcm91cEluZGV4ID0gXy5pc051bWJlcihhY3RpdmVHcm91cEluZGV4KSA/IGFjdGl2ZUdyb3VwSW5kZXggOiAtMTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRUaWxlcyA9IF8uY2xvbmVEZWVwKHdpZGdldExpc3QpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gXy5tYXAoZ3JvdXBzLCBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwWyd0aXRsZSddO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IHRoaXMuYWN0aXZlR3JvdXBJbmRleCxcclxuICAgICAgICAgICAgd2lkZ2V0czogdGhpcy5kZWZhdWx0VGlsZXNcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGNhbmNlbCgpIHtcclxuICAgICAgICB0aGlzLiRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGVuY3JlYXNlKGdyb3VwSW5kZXg6IG51bWJlciwgd2lkZ2V0SW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IHdpZGdldCA9IHRoaXMuZGVmYXVsdFRpbGVzW2dyb3VwSW5kZXhdW3dpZGdldEluZGV4XTtcclxuICAgICAgICB3aWRnZXQuYW1vdW50Kys7XHJcbiAgICAgICAgdGhpcy50b3RhbFRpbGVzKys7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBkZWNyZWFzZShncm91cEluZGV4OiBudW1iZXIsIHdpZGdldEluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB3aWRnZXQgPSB0aGlzLmRlZmF1bHRUaWxlc1tncm91cEluZGV4XVt3aWRnZXRJbmRleF07XHJcbiAgICAgICAgd2lkZ2V0LmFtb3VudCA9IHdpZGdldC5hbW91bnQgPyB3aWRnZXQuYW1vdW50IC0gMSA6IDA7XHJcbiAgICAgICAgdGhpcy50b3RhbFRpbGVzID0gdGhpcy50b3RhbFRpbGVzID8gdGhpcy50b3RhbFRpbGVzIC0gMSA6IDA7XHJcbiAgICB9O1xyXG59IiwiaW1wb3J0IHtcclxuICBBZGRUaWxlRGlhbG9nLFxyXG4gIEFkZFRpbGVEaWFsb2dDb250cm9sbGVyXHJcbn0gZnJvbSAnLi9BZGRUaWxlRGlhbG9nQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBZGRUaWxlRGlhbG9nU2VydmljZSB7XHJcbiAgc2hvdyhncm91cHMsIGFjdGl2ZUdyb3VwSW5kZXgpOiBhbmd1bGFyLklQcm9taXNlIDwgYW55ID4gO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBZGRUaWxlRGlhbG9ncHJvdmlkZXIge1xyXG4gIGNvbmZpZ1dpZGdldExpc3QobGlzdDogW0FkZFRpbGVEaWFsb2dbXV0pOiB2b2lkO1xyXG59XHJcblxyXG57XHJcbiAgY29uc3Qgc2V0VHJhbnNsYXRpb25zID0gZnVuY3Rpb24oJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgIGNvbnN0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGVQcm92aWRlcicpIDogbnVsbDtcclxuICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgKDxhbnk+cGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgIERBU0hCT0FSRF9BRERfVElMRV9ESUFMT0dfVElUTEU6ICdBZGQgY29tcG9uZW50JyxcclxuICAgICAgICBEQVNIQk9BUkRfQUREX1RJTEVfRElBTE9HX1VTRV9IT1RfS0VZUzogJ1VzZSBcIkVudGVyXCIgb3IgXCIrXCIgYnV0dG9ucyBvbiBrZXlib2FyZCB0byBlbmNyZWFzZSBhbmQgXCJEZWxldGVcIiBvciBcIi1cIiB0byBkZWNyZWFzZSB0aWxlcyBhbW91bnQnLFxyXG4gICAgICAgIERBU0hCT0FSRF9BRERfVElMRV9ESUFMT0dfQ1JFQVRFX05FV19HUk9VUDogJ0NyZWF0ZSBuZXcgZ3JvdXAnXHJcbiAgICAgIH0pO1xyXG4gICAgICAoPGFueT5waXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9USUxFX0RJQUxPR19USVRMRTogJ9CU0L7QsdCw0LLQuNGC0Ywg0LrQvtC80L/QvtC90LXQvdGCJyxcclxuICAgICAgICBEQVNIQk9BUkRfQUREX1RJTEVfRElBTE9HX1VTRV9IT1RfS0VZUzogJ9CY0YHQv9C+0LvRjNC30YPQudGC0LUgXCJFbnRlclwiINC40LvQuCBcIitcIiDQutC70LDQstC40YjQuCDQvdCwINC60LvQsNCy0LjQsNGC0YPRgNC1INGH0YLQvtCx0Ysg0YPQstC10LvQuNGH0LjRgtGMINC4IFwiRGVsZXRlXCIgb3IgXCItXCIg0YfRgtC+0LHRiyDRg9C80LXQvdGI0LjRgtGMINC60L7Qu9C40YfQtdGB0YLQstC+INGC0LDQudC70L7QsicsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9USUxFX0RJQUxPR19DUkVBVEVfTkVXX0dST1VQOiAn0KHQvtC30LTQsNGC0Ywg0L3QvtCy0YPRjiDQs9GA0YPQv9C/0YMnXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xhc3MgQWRkVGlsZURpYWxvZ1NlcnZpY2UgaW1wbGVtZW50cyBJQWRkVGlsZURpYWxvZ1NlcnZpY2Uge1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIHdpZGdldExpc3Q6IFtBZGRUaWxlRGlhbG9nW11dLFxyXG4gICAgICBwcml2YXRlICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgKSB7fVxyXG5cclxuICAgIHB1YmxpYyBzaG93KGdyb3VwcywgYWN0aXZlR3JvdXBJbmRleCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kbWREaWFsb2dcclxuICAgICAgICAuc2hvdyh7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FkZF90aWxlX2RpYWxvZy9BZGRUaWxlLmh0bWwnLFxyXG4gICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAgIGNvbnRyb2xsZXI6IEFkZFRpbGVEaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgICAgY29udHJvbGxlckFzOiAnZGlhbG9nQ3RybCcsXHJcbiAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICBncm91cHM6ICgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhY3RpdmVHcm91cEluZGV4OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUdyb3VwSW5kZXg7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHdpZGdldExpc3Q6ICgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy53aWRnZXRMaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNsYXNzIEFkZFRpbGVEaWFsb2dQcm92aWRlciBpbXBsZW1lbnRzIElBZGRUaWxlRGlhbG9ncHJvdmlkZXIge1xyXG4gICAgcHJpdmF0ZSBfc2VydmljZTogQWRkVGlsZURpYWxvZ1NlcnZpY2U7XHJcbiAgICBwcml2YXRlIF93aWRnZXRMaXN0OiBbQWRkVGlsZURpYWxvZ1tdXSA9IG51bGw7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIHB1YmxpYyBjb25maWdXaWRnZXRMaXN0ID0gZnVuY3Rpb24gKGxpc3Q6IFtBZGRUaWxlRGlhbG9nW11dKSB7XHJcbiAgICAgIHRoaXMuX3dpZGdldExpc3QgPSBsaXN0O1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgJGdldCgkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UpIHtcclxuICAgICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX3NlcnZpY2UgPT0gbnVsbClcclxuICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IEFkZFRpbGVEaWFsb2dTZXJ2aWNlKHRoaXMuX3dpZGdldExpc3QsICRtZERpYWxvZyk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5fc2VydmljZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcEFkZERhc2hib2FyZFRpbGVEaWFsb2cnKVxyXG4gICAgLmNvbmZpZyhzZXRUcmFuc2xhdGlvbnMpXHJcbiAgICAucHJvdmlkZXIoJ3BpcEFkZFRpbGVEaWFsb2cnLCBBZGRUaWxlRGlhbG9nUHJvdmlkZXIpO1xyXG59IiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwQWRkRGFzaGJvYXJkVGlsZURpYWxvZycsIFsnbmdNYXRlcmlhbCddKTtcclxuXHJcbmltcG9ydCAnLi9BZGRUaWxlRGlhbG9nQ29udHJvbGxlcic7XHJcbmltcG9ydCAnLi9BZGRUaWxlUHJvdmlkZXInOyIsImltcG9ydCB7XHJcbiAgTWVudVRpbGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudV90aWxlL01lbnVUaWxlU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVRpbGVDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNsYXNzIENhbGVuZGFyVGlsZUNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51VGlsZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgcGlwVGlsZUNvbmZpZ0RpYWxvZ1NlcnZpY2U6IElUaWxlQ29uZmlnU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpcy5vcHRpb25zLm1lbnUgPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpIDogdGhpcy5tZW51O1xyXG4gICAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSB0aGlzLm9wdGlvbnMuZGF0ZSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLm9wdGlvbnMuY29sb3IgfHwgJ2JsdWUnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLnBpcFRpbGVDb25maWdEaWFsb2dTZXJ2aWNlLnNob3coe1xyXG4gICAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLWNhbGVuZGFyLWNvbmZpZycsXHJcbiAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgZGF0ZTogdGhpcy5vcHRpb25zLmRhdGUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBleHRlbnNpb25Vcmw6ICdjYWxlbmRhcl90aWxlL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuZGF0ZSA9IHJlc3VsdC5kYXRlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb25zdCBDYWxlbmRhclRpbGU6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJyxcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBDYWxlbmRhclRpbGVDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhcl90aWxlL0NhbGVuZGFyVGlsZS5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb21wb25lbnQoJ3BpcENhbGVuZGFyVGlsZScsIENhbGVuZGFyVGlsZSk7XHJcblxyXG59IiwiZXhwb3J0IGludGVyZmFjZSBJRGFzaGJvYXJkVGlsZSB7XHJcbiAgICBvcHRpb25zOiBhbnk7XHJcbiAgICBjb2xvcjogc3RyaW5nO1xyXG4gICAgc2l6ZTogT2JqZWN0IHwgc3RyaW5nIHwgbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRGFzaGJvYXJkVGlsZSBpbXBsZW1lbnRzIElEYXNoYm9hcmRUaWxlIHtcclxuICAgIHB1YmxpYyBvcHRpb25zOiBhbnk7XHJcbiAgICBwdWJsaWMgY29sb3I6IHN0cmluZztcclxuICAgIHB1YmxpYyBzaXplOiBPYmplY3QgfCBzdHJpbmcgfCBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7IH1cclxufSIsIlxyXG5jbGFzcyBUaWxlQ29sb3JzIHtcclxuICAgIHN0YXRpYyBhbGw6IHN0cmluZ1tdID0gWydwdXJwbGUnLCAnZ3JlZW4nLCAnZ3JheScsICdvcmFuZ2UnLCAnYmx1ZSddO1xyXG59XHJcblxyXG5jbGFzcyBUaWxlU2l6ZXMge1xyXG4gICAgc3RhdGljIGFsbDogYW55ID0gW3tcclxuICAgICAgICAgICAgbmFtZTogJ0RBU0hCT0FSRF9USUxFX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTCcsXHJcbiAgICAgICAgICAgIGlkOiAnMTEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfVElMRV9DT05GSUdfRElBTE9HX1NJWkVfV0lERScsXHJcbiAgICAgICAgICAgIGlkOiAnMjEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfVElMRV9DT05GSUdfRElBTE9HX1NJWkVfTEFSR0UnLFxyXG4gICAgICAgICAgICBpZDogJzIyJ1xyXG4gICAgICAgIH1cclxuICAgIF07XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUaWxlQ29uZmlnRGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICBwdWJsaWMgY29sb3JzOiBzdHJpbmdbXSA9IFRpbGVDb2xvcnMuYWxsO1xyXG4gICAgcHVibGljIHNpemVzOiBhbnkgPSBUaWxlU2l6ZXMuYWxsO1xyXG4gICAgcHVibGljIHNpemVJZDogc3RyaW5nID0gVGlsZVNpemVzLmFsbFswXS5pZDtcclxuICAgIHB1YmxpYyBvbkNhbmNlbDogRnVuY3Rpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIHBhcmFtcyxcclxuICAgICAgICBwdWJsaWMgZXh0ZW5zaW9uVXJsLFxyXG4gICAgICAgIHB1YmxpYyAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgdGhpcy5wYXJhbXMpO1xyXG4gICAgICAgIHRoaXMuc2l6ZUlkID0gJycgKyB0aGlzLnBhcmFtcy5zaXplLmNvbFNwYW4gKyB0aGlzLnBhcmFtcy5zaXplLnJvd1NwYW47XHJcblxyXG4gICAgICAgIHRoaXMub25DYW5jZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25BcHBseSh1cGRhdGVkRGF0YSkge1xyXG4gICAgICAgIHRoaXNbJ3NpemUnXS5zaXplWCA9IE51bWJlcih0aGlzLnNpemVJZC5zdWJzdHIoMCwgMSkpO1xyXG4gICAgICAgIHRoaXNbJ3NpemUnXS5zaXplWSA9IE51bWJlcih0aGlzLnNpemVJZC5zdWJzdHIoMSwgMSkpO1xyXG4gICAgICAgIHRoaXMuJG1kRGlhbG9nLmhpZGUodXBkYXRlZERhdGEpO1xyXG4gICAgfVxyXG59IiwieyAgICBcclxuICAgIGludGVyZmFjZSBJVGlsZUNvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogYW55O1xyXG4gICAgICAgIHBpcERpYWxvZ1Njb3BlOiBhbnk7XHJcbiAgICAgICAgcGlwQXBwbHk6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3M6IElUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3MgPSB7XHJcbiAgICAgICAgcGlwRXh0ZW5zaW9uVXJsOiAnPCcsXHJcbiAgICAgICAgcGlwRGlhbG9nU2NvcGU6ICc8JyxcclxuICAgICAgICBwaXBBcHBseTogJyYnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgVGlsZUNvbmZpZ0V4dGVuZENvbXBvbmVudENoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJVGlsZUNvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBuZy5JQ2hhbmdlc09iamVjdDxhbnk+O1xyXG5cclxuICAgICAgICBwaXBFeHRlbnNpb25Vcmw6IG5nLklDaGFuZ2VzT2JqZWN0PHN0cmluZz47XHJcbiAgICAgICAgcGlwRGlhbG9nU2NvcGU6IG5nLklDaGFuZ2VzT2JqZWN0PG5nLklTY29wZT47XHJcblxyXG4gICAgICAgIHBpcEFwcGx5OiBuZy5JQ2hhbmdlc09iamVjdDwoe3VwZGF0ZWREYXRhOiBhbnl9KSA9PiBuZy5JUHJvbWlzZTx2b2lkPj47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIElUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50QXR0cmlidXRlcyBleHRlbmRzIG5nLklBdHRyaWJ1dGVzIHtcclxuICAgICAgICBwaXBFeHRlbnNpb25Vcmw6IHN0cmluZ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFRpbGVDb25maWdFeHRlbmRDb21wb25lbnRDb250cm9sbGVyIGltcGxlbWVudHMgSVRpbGVDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHBpcEV4dGVuc2lvblVybDogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBwaXBEaWFsb2dTY29wZTogbmcuSVNjb3BlO1xyXG4gICAgICAgIHB1YmxpYyBwaXBBcHBseTogKHBhcmFtOiB7dXBkYXRlZERhdGE6IGFueX0pID0+IG5nLklQcm9taXNlPHZvaWQ+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkdGVtcGxhdGVSZXF1ZXN0OiBhbmd1bGFyLklUZW1wbGF0ZVJlcXVlc3RTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBcclxuICAgICAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LCBcclxuICAgICAgICAgICAgcHJpdmF0ZSAkYXR0cnM6IElUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50QXR0cmlidXRlc1xyXG4gICAgICAgICkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IFRpbGVDb25maWdFeHRlbmRDb21wb25lbnRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBpcERpYWxvZ1Njb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgY2hhbmdlcy5waXBEaWFsb2dTY29wZS5jdXJyZW50VmFsdWVbJyRzY29wZSddO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgY2hhbmdlcy5waXBEaWFsb2dTY29wZS5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBpcEV4dGVuc2lvblVybCAmJiBjaGFuZ2VzLnBpcEV4dGVuc2lvblVybC5jdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRlbXBsYXRlUmVxdWVzdChjaGFuZ2VzLnBpcEV4dGVuc2lvblVybC5jdXJyZW50VmFsdWUsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdwaXAtZXh0ZW5zaW9uLXBvaW50JykucmVwbGFjZVdpdGgodGhpcy4kY29tcGlsZShodG1sKSh0aGlzLiRzY29wZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbkFwcGx5KCkge1xyXG4gICAgICAgICAgICB0aGlzLnBpcEFwcGx5KHt1cGRhdGVkRGF0YTogdGhpc30pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwaXBUaWxlQ29uZmlnQ29tcG9uZW50OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2NvbmZpZ190aWxlX2RpYWxvZy9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogVGlsZUNvbmZpZ0V4dGVuZENvbXBvbmVudENvbnRyb2xsZXIsXHJcbiAgICAgICAgYmluZGluZ3M6IFRpbGVDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5nc1xyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBDb25maWdEYXNoYm9hcmRUaWxlRGlhbG9nJylcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50JywgcGlwVGlsZUNvbmZpZ0NvbXBvbmVudCk7XHJcbn0iLCJpbXBvcnQgeyBUaWxlQ29uZmlnRGlhbG9nQ29udHJvbGxlciB9IGZyb20gJy4vQ29uZmlnRGlhbG9nQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUaWxlQ29uZmlnU2VydmljZSB7XHJcbiAgICBzaG93KHBhcmFtczogSVRpbGVDb25maWdEaWFsb2dPcHRpb25zLCBzdWNjZXNzQ2FsbGJhY2sgPyA6IChrZXkpID0+IHZvaWQsIGNhbmNlbENhbGxiYWNrID8gOiAoKSA9PiB2b2lkKTogYW55O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUaWxlQ29uZmlnRGlhbG9nT3B0aW9ucyBleHRlbmRzIGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ09wdGlvbnMge1xyXG4gICAgZGlhbG9nQ2xhc3M/OiBzdHJpbmc7XHJcbiAgICBleHRlbnNpb25Vcmw/OiBzdHJpbmc7XHJcbiAgICBldmVudD86IGFueTtcclxufVxyXG5cclxue1xyXG4gICAgY29uc3Qgc2V0VHJhbnNsYXRpb25zID0gZnVuY3Rpb24oJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgICAgICBjb25zdCBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGVQcm92aWRlcicpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA6IG51bGw7XHJcbiAgICAgICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19USVRMRTogJ0VkaXQgdGlsZScsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfVElMRV9DT05GSUdfRElBTE9HX1NJWkVfU01BTEw6ICdTbWFsbCcsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfVElMRV9DT05GSUdfRElBTE9HX1NJWkVfV0lERTogJ1dpZGUnLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFOiAnTGFyZ2UnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19USVRMRTogJ9CY0LfQvNC10L3QuNGC0Ywg0LLQuNC00LbQtdGCJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9USUxFX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTDogJ9Cc0LDQu9C10L0uJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9USUxFX0NPTkZJR19ESUFMT0dfU0laRV9XSURFOiAn0KjQuNGA0L7QutC40LknLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFOiAn0JHQvtC70YzRiNC+0LknXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBUaWxlQ29uZmlnRGlhbG9nU2VydmljZSB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwdWJsaWMgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICAgICAgKSB7fVxyXG5cclxuICAgICAgICBwdWJsaWMgc2hvdyhwYXJhbXM6IElUaWxlQ29uZmlnRGlhbG9nT3B0aW9ucywgc3VjY2Vzc0NhbGxiYWNrID8gOiAoa2V5KSA9PiB2b2lkLCBjYW5jZWxDYWxsYmFjayA/IDogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudDogcGFyYW1zLmV2ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBwYXJhbXMudGVtcGxhdGVVcmwgfHwgJ2RpYWxvZ3MvdGlsZV9jb25maWcvQ29uZmlnRGlhbG9nLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFRpbGVDb25maWdEaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25Vcmw6IHBhcmFtcy5leHRlbnNpb25VcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLmxvY2Fsc1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3VjY2Vzc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhrZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcENvbmZpZ0Rhc2hib2FyZFRpbGVEaWFsb2cnKVxyXG4gICAgICAgIC5jb25maWcoc2V0VHJhbnNsYXRpb25zKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdwaXBUaWxlQ29uZmlnRGlhbG9nU2VydmljZScsIFRpbGVDb25maWdEaWFsb2dTZXJ2aWNlKTtcclxufSIsIlxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBDb25maWdEYXNoYm9hcmRUaWxlRGlhbG9nJywgWyduZ01hdGVyaWFsJ10pO1xyXG5cclxuaW1wb3J0ICcuL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcbmltcG9ydCAnLi9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQnOyIsImltcG9ydCB7XHJcbiAgSVRpbGVUZW1wbGF0ZVNlcnZpY2VcclxufSBmcm9tICcuLi91dGlsaXR5L1RpbGVUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQge1xyXG4gIElBZGRUaWxlRGlhbG9nU2VydmljZSxcclxuICBJQWRkVGlsZURpYWxvZ3Byb3ZpZGVyXHJcbn0gZnJvbSAnLi4vYWRkX3RpbGVfZGlhbG9nL0FkZFRpbGVQcm92aWRlcidcclxuXHJcbntcclxuICBjb25zdCBzZXRUcmFuc2xhdGlvbnMgPSBmdW5jdGlvbiAoJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgIGNvbnN0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGVQcm92aWRlcicpIDogbnVsbDtcclxuICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICBEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVA6ICdEcm9wIGhlcmUgdG8gY3JlYXRlIG5ldyBncm91cCcsXHJcbiAgICAgIH0pO1xyXG4gICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgIERST1BfVE9fQ1JFQVRFX05FV19HUk9VUDogJ9Cf0LXRgNC10YLQsNGJ0LjRgtC1INGB0Y7QtNCwINC00LvRjyDRgdC+0LfQtNCw0L3QuNGPINC90L7QstC+0Lkg0LPRgNGD0L/Qv9GLJ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGNvbmZpZ3VyZUF2YWlsYWJsZVdpZGdldHMgPSBmdW5jdGlvbiAocGlwQWRkVGlsZURpYWxvZ1Byb3ZpZGVyOiBJQWRkVGlsZURpYWxvZ3Byb3ZpZGVyKSB7XHJcbiAgICBwaXBBZGRUaWxlRGlhbG9nUHJvdmlkZXIuY29uZmlnV2lkZ2V0TGlzdChbXHJcbiAgICAgIFt7XHJcbiAgICAgICAgICB0aXRsZTogJ0V2ZW50JyxcclxuICAgICAgICAgIGljb246ICdkb2N1bWVudCcsXHJcbiAgICAgICAgICBuYW1lOiAnZXZlbnQnLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aXRsZTogJ1Bvc2l0aW9uJyxcclxuICAgICAgICAgIGljb246ICdsb2NhdGlvbicsXHJcbiAgICAgICAgICBuYW1lOiAncG9zaXRpb24nLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbe1xyXG4gICAgICAgICAgdGl0bGU6ICdDYWxlbmRhcicsXHJcbiAgICAgICAgICBpY29uOiAnZGF0ZScsXHJcbiAgICAgICAgICBuYW1lOiAnY2FsZW5kYXInLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aXRsZTogJ1N0aWNreSBOb3RlcycsXHJcbiAgICAgICAgICBpY29uOiAnbm90ZS10YWtlJyxcclxuICAgICAgICAgIG5hbWU6ICdub3RlcycsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnU3RhdGlzdGljcycsXHJcbiAgICAgICAgICBpY29uOiAndHItc3RhdGlzdGljcycsXHJcbiAgICAgICAgICBuYW1lOiAnc3RhdGlzdGljcycsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIF0pO1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgZHJhZ2dhYmxlT3B0aW9ucyB7XHJcbiAgICB0aWxlV2lkdGg6IG51bWJlcjtcclxuICAgIHRpbGVIZWlnaHQ6IG51bWJlcjtcclxuICAgIGd1dHRlcjogbnVtYmVyO1xyXG4gICAgaW5saW5lOiBib29sZWFuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgREVGQVVMVF9HUklEX09QVElPTlM6IGRyYWdnYWJsZU9wdGlvbnMgPSB7XHJcbiAgICB0aWxlV2lkdGg6IDE1MCwgLy8gJ3B4J1xyXG4gICAgdGlsZUhlaWdodDogMTUwLCAvLyAncHgnXHJcbiAgICBndXR0ZXI6IDEwLCAvLyAncHgnXHJcbiAgICBpbmxpbmU6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgaW50ZXJmYWNlIERhc2hib2FyZEJpbmRpbmdzIHtcclxuICAgICAgZ3JpZE9wdGlvbnM6IGFueTtcclxuICAgICAgZ3JvdXBBZGRpdGlvbmFsQWN0aW9uczogYW55O1xyXG4gICAgICBncm91cGVkV2lkZ2V0czogYW55O1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgRGFzaGJvYXJkQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBEYXNoYm9hcmRCaW5kaW5ncyB7XHJcbiAgICBwcml2YXRlIGRlZmF1bHRHcm91cE1lbnVBY3Rpb25zOiBhbnkgPSBbe1xyXG4gICAgICAgIHRpdGxlOiAnQWRkIENvbXBvbmVudCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudChncm91cEluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1JlbW92ZScsXHJcbiAgICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUdyb3VwKGdyb3VwSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNhbGxiYWNrOiAoZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2NvbmZpZ3VyYXRlIGdyb3VwIHdpdGggaW5kZXg6JywgZ3JvdXBJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gICAgcHJpdmF0ZSBfaW5jbHVkZVRwbDogc3RyaW5nID0gJzxwaXAte3sgdHlwZSB9fS13aWRnZXQgZ3JvdXA9XCJncm91cEluZGV4XCIgaW5kZXg9XCJpbmRleFwiJyArXHJcbiAgICAgICdwaXAtb3B0aW9ucz1cIiRwYXJlbnQuJGN0cmwuZ3JvdXBlZFdpZGdldHNbZ3JvdXBJbmRleF1bXFwnc291cmNlXFwnXVtpbmRleF0ub3B0c1wiPicgK1xyXG4gICAgICAnPC9waXAte3sgdHlwZSB9fS13aWRnZXQ+JztcclxuXHJcbiAgICBwdWJsaWMgZ3JvdXBlZFdpZGdldHM6IGFueTtcclxuICAgIHB1YmxpYyBkcmFnZ2FibGVHcmlkT3B0aW9uczogZHJhZ2dhYmxlT3B0aW9ucztcclxuICAgIHB1YmxpYyB3aWRnZXRzVGVtcGxhdGVzOiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JvdXBNZW51QWN0aW9uczogYW55ID0gdGhpcy5kZWZhdWx0R3JvdXBNZW51QWN0aW9ucztcclxuICAgIHB1YmxpYyB3aWRnZXRzQ29udGV4dDogYW55O1xyXG4gICAgcHVibGljIGdyaWRPcHRpb25zOiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JvdXBBZGRpdGlvbmFsQWN0aW9uczogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGF0dHJzOiBhbnksXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFueSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGludGVycG9sYXRlOiBhbmd1bGFyLklJbnRlcnBvbGF0ZVNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgcGlwQWRkVGlsZURpYWxvZzogSUFkZFRpbGVEaWFsb2dTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcFRpbGVUZW1wbGF0ZTogSVRpbGVUZW1wbGF0ZVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAvLyBBZGQgY2xhc3MgdG8gc3R5bGUgc2Nyb2xsIGJhclxyXG4gICAgICAkZWxlbWVudC5hZGRDbGFzcygncGlwLXNjcm9sbCcpO1xyXG5cclxuICAgICAgLy8gU2V0IHRpbGVzIGdyaWQgb3B0aW9uc1xyXG4gICAgICB0aGlzLmRyYWdnYWJsZUdyaWRPcHRpb25zID0gdGhpcy5ncmlkT3B0aW9ucyB8fCBERUZBVUxUX0dSSURfT1BUSU9OUztcclxuXHJcbiAgICAgIC8vIFN3aXRjaCBpbmxpbmUgZGlzcGxheWluZ1xyXG4gICAgICBpZiAodGhpcy5kcmFnZ2FibGVHcmlkT3B0aW9ucy5pbmxpbmUgPT09IHRydWUpIHtcclxuICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygnaW5saW5lLWdyaWQnKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBFeHRlbmQgZ3JvdXAncyBtZW51IGFjdGlvbnNcclxuICAgICAgaWYgKHRoaXMuZ3JvdXBBZGRpdGlvbmFsQWN0aW9ucykgYW5ndWxhci5leHRlbmQodGhpcy5ncm91cE1lbnVBY3Rpb25zLCB0aGlzLmdyb3VwQWRkaXRpb25hbEFjdGlvbnMpO1xyXG5cclxuICAgICAgLy8gQ29tcGlsZSB3aWRnZXRzXHJcbiAgICAgIHRoaXMud2lkZ2V0c0NvbnRleHQgPSAkc2NvcGU7XHJcbiAgICAgIHRoaXMuY29tcGlsZVdpZGdldHMoKTtcclxuXHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3Zpc2libGUnKTtcclxuICAgICAgfSwgNzAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbXBpbGVXaWRnZXRzKCkge1xyXG4gICAgICBfLmVhY2godGhpcy5ncm91cGVkV2lkZ2V0cywgKGdyb3VwLCBncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgZ3JvdXAucmVtb3ZlZFdpZGdldHMgPSBncm91cC5yZW1vdmVkV2lkZ2V0cyB8fCBbXSxcclxuICAgICAgICAgIGdyb3VwLnNvdXJjZSA9IGdyb3VwLnNvdXJjZS5tYXAoKHdpZGdldCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgLy8gRXN0YWJsaXNoIGRlZmF1bHQgcHJvcHNcclxuICAgICAgICAgICAgd2lkZ2V0LnNpemUgPSB3aWRnZXQuc2l6ZSB8fCB7XHJcbiAgICAgICAgICAgICAgY29sU3BhbjogMSxcclxuICAgICAgICAgICAgICByb3dTcGFuOiAxXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdpZGdldC5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICB3aWRnZXQuZ3JvdXBJbmRleCA9IGdyb3VwSW5kZXg7XHJcbiAgICAgICAgICAgIHdpZGdldC5tZW51ID0gd2lkZ2V0Lm1lbnUgfHwge307XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHdpZGdldC5tZW51LCBbe1xyXG4gICAgICAgICAgICAgIHRpdGxlOiAnUmVtb3ZlJyxcclxuICAgICAgICAgICAgICBjbGljazogKGl0ZW0sIHBhcmFtcywgb2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVdpZGdldChpdGVtLCBwYXJhbXMsIG9iamVjdCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIG9wdHM6IHdpZGdldCxcclxuICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5waXBUaWxlVGVtcGxhdGUuZ2V0VGVtcGxhdGUod2lkZ2V0LCB0aGlzLl9pbmNsdWRlVHBsKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZENvbXBvbmVudChncm91cEluZGV4KSB7XHJcbiAgICAgIHRoaXMucGlwQWRkVGlsZURpYWxvZ1xyXG4gICAgICAgIC5zaG93KHRoaXMuZ3JvdXBlZFdpZGdldHMsIGdyb3VwSW5kZXgpXHJcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgIHZhciBhY3RpdmVHcm91cDtcclxuXHJcbiAgICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZUdyb3VwID0gdGhpcy5ncm91cGVkV2lkZ2V0c1tkYXRhLmdyb3VwSW5kZXhdO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYWN0aXZlR3JvdXAgPSB7XHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdOZXcgZ3JvdXAnLFxyXG4gICAgICAgICAgICAgIHNvdXJjZTogW11cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmFkZFdpZGdldHMoYWN0aXZlR3JvdXAuc291cmNlLCBkYXRhLndpZGdldHMpO1xyXG5cclxuICAgICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHMucHVzaChhY3RpdmVHcm91cCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5jb21waWxlV2lkZ2V0cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlR3JvdXAgPSAoZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygncmVtb3ZlR3JvdXAnLCBncm91cEluZGV4KTtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0cy5zcGxpY2UoZ3JvdXBJbmRleCwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRXaWRnZXRzKGdyb3VwLCB3aWRnZXRzKSB7XHJcbiAgICAgIHdpZGdldHMuZm9yRWFjaCgod2lkZ2V0R3JvdXApID0+IHtcclxuICAgICAgICB3aWRnZXRHcm91cC5mb3JFYWNoKCh3aWRnZXQpID0+IHtcclxuICAgICAgICAgIGlmICh3aWRnZXQuYW1vdW50KSB7XHJcbiAgICAgICAgICAgIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHdpZGdldC5hbW91bnQpKS5mb3JFYWNoKCgpID0+IHtcclxuICAgICAgICAgICAgICBncm91cC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IHdpZGdldC5uYW1lXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbW92ZVdpZGdldChpdGVtLCBwYXJhbXMsIG9iamVjdCkge1xyXG4gICAgICB0aGlzLmdyb3VwZWRXaWRnZXRzW3BhcmFtcy5vcHRpb25zLmdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzID0gW107XHJcbiAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMucHVzaChwYXJhbXMub3B0aW9ucy5pbmRleCk7XHJcbiAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0uc291cmNlLnNwbGljZShwYXJhbXMub3B0aW9ucy5pbmRleCwgMSk7XHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMgPSBbXTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgY29uc3QgRGFzaGJvYXJkOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIGdyaWRPcHRpb25zOiAnPXBpcEdyaWRPcHRpb25zJyxcclxuICAgICAgZ3JvdXBBZGRpdGlvbmFsQWN0aW9uczogJz1waXBHcm91cEFjdGlvbnMnLFxyXG4gICAgICBncm91cGVkV2lkZ2V0czogJz1waXBHcm91cHMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogRGFzaGJvYXJkQ29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnZGFzaGJvYXJkL0Rhc2hib2FyZC5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb25maWcoY29uZmlndXJlQXZhaWxhYmxlV2lkZ2V0cylcclxuICAgIC5jb25maWcoc2V0VHJhbnNsYXRpb25zKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRGFzaGJvYXJkJywgRGFzaGJvYXJkKTtcclxuXHJcbn0iLCJkZWNsYXJlIHZhciBpbnRlcmFjdDtcclxuXHJcbmltcG9ydCB7XHJcbiAgRHJhZ1RpbGVTZXJ2aWNlLFxyXG4gIElEcmFnVGlsZVNlcnZpY2UsXHJcbiAgSURyYWdUaWxlQ29uc3RydWN0b3JcclxufSBmcm9tICcuL0RyYWdnYWJsZVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBUaWxlc0dyaWRTZXJ2aWNlLFxyXG4gIElUaWxlc0dyaWRTZXJ2aWNlLFxyXG4gIElUaWxlc0dyaWRDb25zdHJ1Y3RvclxyXG59IGZyb20gJy4uL3RpbGVfZ3JvdXAvVGlsZUdyb3VwU2VydmljZSc7XHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9USUxFX1dJRFRIOiBudW1iZXIgPSAxNTA7XHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1RJTEVfSEVJR0hUOiBudW1iZXIgPSAxNTA7XHJcbmV4cG9ydCBjb25zdCBVUERBVEVfR1JPVVBTX0VWRU5UID0gXCJwaXBVcGRhdGVEYXNoYm9hcmRHcm91cHNDb25maWdcIjtcclxuXHJcbmNvbnN0IFNJTVBMRV9MQVlPVVRfQ09MVU1OU19DT1VOVDogbnVtYmVyID0gMjtcclxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xyXG4gIHRpbGVXaWR0aDogREVGQVVMVF9USUxFX1dJRFRILCAvLyAncHgnXHJcbiAgdGlsZUhlaWdodDogREVGQVVMVF9USUxFX0hFSUdIVCwgLy8gJ3B4J1xyXG4gIGd1dHRlcjogMjAsIC8vICdweCdcclxuICBjb250YWluZXI6ICdwaXAtZHJhZ2dhYmxlLWdyaWQ6Zmlyc3Qtb2YtdHlwZScsXHJcbiAgLy9tb2JpbGVCcmVha3BvaW50ICAgICAgIDogWFhYLCAgIC8vIEdldCBmcm9tIHBpcE1lZGlhIFNlcnZpY2UgaW4gdGhlIGNvbnN0cnVjdG9yXHJcbiAgYWN0aXZlRHJvcHpvbmVDbGFzczogJ2Ryb3B6b25lLWFjdGl2ZScsXHJcbiAgZ3JvdXBDb250YW5pbmVyU2VsZWN0b3I6ICcucGlwLWRyYWdnYWJsZS1ncm91cDpub3QoLmZpY3QtZ3JvdXApJyxcclxufTtcclxuXHJcbntcclxuICBpbnRlcmZhY2UgSURyYWdnYWJsZUJpbmRpbmdzIHtcclxuICAgICAgdGlsZXNUZW1wbGF0ZXM6IGFueTtcclxuICAgICAgdGlsZXNDb250ZXh0OiBhbnk7XHJcbiAgICAgIG9wdGlvbnM6IGFueTtcclxuICAgICAgZ3JvdXBNZW51QWN0aW9uczogYW55O1xyXG4gICAgICAkY29udGFpbmVyOiBKUXVlcnk7XHJcbiAgfVxyXG5cclxuICBpbnRlcmZhY2UgSURyYWdnYWJsZUNvbnRyb2xsZXJTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICAkY29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICB0aWxlc1RlbXBsYXRlczogYW55O1xyXG4gICAgb3B0aW9uczogYW55O1xyXG4gIH1cclxuXHJcbiAgaW50ZXJmYWNlIElUaWxlU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgaW5kZXg6IG51bWJlciB8IHN0cmluZztcclxuICAgIGdyb3VwSW5kZXg6IG51bWJlciB8IHN0cmluZztcclxuICB9XHJcblxyXG4gIGNsYXNzIERyYWdnYWJsZUNvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29tcG9uZW50Q29udHJvbGxlciwgSURyYWdnYWJsZUJpbmRpbmdzIHtcclxuICAgIHB1YmxpYyBvcHRzOiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JvdXBzOiBhbnk7XHJcbiAgICBwdWJsaWMgc291cmNlRHJvcFpvbmVFbGVtOiBhbnkgPSBudWxsO1xyXG4gICAgcHVibGljIGlzU2FtZURyb3B6b25lOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyB0aWxlR3JvdXBzOiBhbnkgPSBudWxsO1xyXG4gICAgcHVibGljIGF2YWlsYWJsZVdpZHRoOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgYXZhaWxhYmxlQ29sdW1uczogbnVtYmVyO1xyXG4gICAgcHVibGljIGdyb3Vwc0NvbnRhaW5lcnM6IGFueTtcclxuICAgIHB1YmxpYyBjb250YWluZXI6IGFueTtcclxuICAgIHB1YmxpYyBhY3RpdmVEcmFnZ2VkR3JvdXA6IGFueTtcclxuICAgIHB1YmxpYyBkcmFnZ2VkVGlsZTogYW55O1xyXG4gICAgcHVibGljIGNvbnRhaW5lck9mZnNldDogYW55O1xyXG4gICAgcHVibGljIHRpbGVzVGVtcGxhdGVzOiBhbnk7XHJcbiAgICBwdWJsaWMgdGlsZXNDb250ZXh0OiBhbnk7XHJcbiAgICBwdWJsaWMgb3B0aW9uczogYW55O1xyXG4gICAgcHVibGljIGdyb3VwTWVudUFjdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyAkY29udGFpbmVyOiBKUXVlcnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgJHNjb3BlOiBJRHJhZ2dhYmxlQ29udHJvbGxlclNjb3BlLFxyXG4gICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICBwaXBEcmFnVGlsZTogSURyYWdUaWxlU2VydmljZSxcclxuICAgICAgcGlwVGlsZXNHcmlkOiBJVGlsZXNHcmlkU2VydmljZSxcclxuICAgICAgcGlwTWVkaWE6IHBpcC5sYXlvdXRzLklNZWRpYVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICB0aGlzLm9wdHMgPSBfLm1lcmdlKHtcclxuICAgICAgICBtb2JpbGVCcmVha3BvaW50OiBwaXBNZWRpYS5icmVha3BvaW50cy54c1xyXG4gICAgICB9LCBERUZBVUxUX09QVElPTlMsIHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmdyb3VwcyA9IHRoaXMudGlsZXNUZW1wbGF0ZXMubWFwKChncm91cCwgZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0aXRsZTogZ3JvdXAudGl0bGUsXHJcbiAgICAgICAgICBlZGl0aW5nTmFtZTogZmFsc2UsXHJcbiAgICAgICAgICBpbmRleDogZ3JvdXBJbmRleCxcclxuICAgICAgICAgIHNvdXJjZTogZ3JvdXAuc291cmNlLm1hcCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0aWxlU2NvcGUgPSB0aGlzLmNyZWF0ZVRpbGVTY29wZSh0aWxlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBJRHJhZ1RpbGVDb25zdHJ1Y3RvcihEcmFnVGlsZVNlcnZpY2UsIHtcclxuICAgICAgICAgICAgICB0cGw6ICRjb21waWxlKHRpbGUudGVtcGxhdGUpKHRpbGVTY29wZSksXHJcbiAgICAgICAgICAgICAgb3B0aW9uczogdGlsZS5vcHRzLFxyXG4gICAgICAgICAgICAgIHNpemU6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEFkZCB0ZW1wbGF0ZXMgd2F0Y2hlclxyXG4gICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC50aWxlc1RlbXBsYXRlcycsIChuZXdWYWwpID0+IHtcclxuICAgICAgICB0aGlzLndhdGNoKG5ld1ZhbCk7XHJcbiAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGl6ZSBkYXRhXHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG5cclxuICAgICAgLy8gUmVzaXplIGhhbmRsZXIgVE9ETzogcmVwbGFjZSBieSBwaXAgcmVzaXplIHdhdGNoZXJzXHJcbiAgICAgICQod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZSgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVXaWR0aCA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkdGgoKTtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZUNvbHVtbnMgPSB0aGlzLmdldEF2YWlsYWJsZUNvbHVtbnModGhpcy5hdmFpbGFibGVXaWR0aCk7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgICAgZ3JvdXBcclxuICAgICAgICAgICAgLnNldEF2YWlsYWJsZUNvbHVtbnModGhpcy5hdmFpbGFibGVDb2x1bW5zKVxyXG4gICAgICAgICAgICAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKVxyXG4gICAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKClcclxuICAgICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSwgNTApKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQb3N0IGxpbmsgZnVuY3Rpb25cclxuICAgIHB1YmxpYyAkcG9zdExpbmsoKSB7XHJcbiAgICAgIHRoaXMuJGNvbnRhaW5lciA9IHRoaXMuJGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2F0Y2ggaGFuZGxlclxyXG4gICAgcHJpdmF0ZSB3YXRjaChuZXdWYWwpIHtcclxuICAgICAgY29uc3QgcHJldlZhbCA9IHRoaXMuZ3JvdXBzO1xyXG4gICAgICBsZXQgY2hhbmdlZEdyb3VwSW5kZXggPSBudWxsO1xyXG5cclxuICAgICAgaWYgKG5ld1ZhbC5sZW5ndGggPiBwcmV2VmFsLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuYWRkR3JvdXAobmV3VmFsW25ld1ZhbC5sZW5ndGggLSAxXSk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbC5sZW5ndGggPCBwcmV2VmFsLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlR3JvdXBzKG5ld1ZhbCk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdWYWwubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBncm91cFdpZGdldERpZmYgPSBwcmV2VmFsW2ldLnNvdXJjZS5sZW5ndGggLSBuZXdWYWxbaV0uc291cmNlLmxlbmd0aDtcclxuICAgICAgICBpZiAoZ3JvdXBXaWRnZXREaWZmIHx8IChuZXdWYWxbaV0ucmVtb3ZlZFdpZGdldHMgJiYgbmV3VmFsW2ldLnJlbW92ZWRXaWRnZXRzLmxlbmd0aCA+IDApKSB7XHJcbiAgICAgICAgICBjaGFuZ2VkR3JvdXBJbmRleCA9IGk7XHJcblxyXG4gICAgICAgICAgaWYgKGdyb3VwV2lkZ2V0RGlmZiA8IDApIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3VGlsZXMgPSBuZXdWYWxbY2hhbmdlZEdyb3VwSW5kZXhdLnNvdXJjZS5zbGljZShncm91cFdpZGdldERpZmYpO1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKG5ld1RpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aWxlJywgdGlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRUaWxlc0ludG9Hcm91cChuZXdUaWxlcywgdGhpcy50aWxlR3JvdXBzW2NoYW5nZWRHcm91cEluZGV4XSwgdGhpcy5ncm91cHNDb250YWluZXJzW2NoYW5nZWRHcm91cEluZGV4XSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVUaWxlcyh0aGlzLnRpbGVHcm91cHNbY2hhbmdlZEdyb3VwSW5kZXhdLCBuZXdWYWxbY2hhbmdlZEdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzLCB0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbY2hhbmdlZEdyb3VwSW5kZXhdKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUaWxlc09wdGlvbnMobmV3VmFsKTtcclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobmV3VmFsICYmIHRoaXMudGlsZUdyb3Vwcykge1xyXG4gICAgICAgIHRoaXMudXBkYXRlVGlsZXNPcHRpb25zKG5ld1ZhbCk7XHJcbiAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJbmxpbmUgZWRpdCBncm91cCBoYW5kbGVyc1xyXG4gICAgcHVibGljIG9uVGl0bGVDbGljayhncm91cCwgZXZlbnQpIHtcclxuICAgICAgaWYgKCFncm91cC5lZGl0aW5nTmFtZSkge1xyXG4gICAgICAgIGdyb3VwLm9sZFRpdGxlID0gXy5jbG9uZShncm91cC50aXRsZSk7XHJcbiAgICAgICAgZ3JvdXAuZWRpdGluZ05hbWUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0LmNoaWxkcmVuWzBdKS5mb2N1cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNhbmNlbEVkaXRpbmcoZ3JvdXApIHtcclxuICAgICAgZ3JvdXAudGl0bGUgPSBncm91cC5vbGRUaXRsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25CbHVyVGl0bGVJbnB1dChncm91cCkge1xyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICBncm91cC5lZGl0aW5nTmFtZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFVQREFURV9HUk9VUFNfRVZFTlQsIHRoaXMuZ3JvdXBzKTtcclxuICAgICAgICAvLyBVcGRhdGUgdGl0bGUgaW4gb3V0ZXIgc2NvcGVcclxuICAgICAgICB0aGlzLnRpbGVzVGVtcGxhdGVzW2dyb3VwLmluZGV4XS50aXRsZSA9IGdyb3VwLnRpdGxlO1xyXG4gICAgICB9LCAxMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkt5ZXByZXNzVGl0bGVJbnB1dChncm91cCwgZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgdGhpcy5vbkJsdXJUaXRsZUlucHV0KGdyb3VwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBvdXRlciBzY29wZSBmdW5jdGlvbnNcclxuICAgIHByaXZhdGUgdXBkYXRlVGlsZXNUZW1wbGF0ZXModXBkYXRlVHlwZTogc3RyaW5nLCBzb3VyY2UgPyA6IGFueSkge1xyXG4gICAgICBzd2l0Y2ggKHVwZGF0ZVR5cGUpIHtcclxuICAgICAgICBjYXNlICdhZGRHcm91cCc6XHJcbiAgICAgICAgICBpZiAodGhpcy5ncm91cHMubGVuZ3RoICE9PSB0aGlzLnRpbGVzVGVtcGxhdGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVzVGVtcGxhdGVzLnB1c2goc291cmNlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ21vdmVUaWxlJzpcclxuICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgZnJvbUluZGV4LFxyXG4gICAgICAgICAgICB0b0luZGV4LFxyXG4gICAgICAgICAgICB0aWxlT3B0aW9ucyxcclxuICAgICAgICAgICAgZnJvbVRpbGVJbmRleFxyXG4gICAgICAgICAgfSA9IHtcclxuICAgICAgICAgICAgZnJvbUluZGV4OiBzb3VyY2UuZnJvbS5lbGVtLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSxcclxuICAgICAgICAgICAgdG9JbmRleDogc291cmNlLnRvLmVsZW0uYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlLFxyXG4gICAgICAgICAgICB0aWxlT3B0aW9uczogc291cmNlLnRpbGUub3B0cy5vcHRpb25zLFxyXG4gICAgICAgICAgICBmcm9tVGlsZUluZGV4OiBzb3VyY2UudGlsZS5vcHRzLm9wdGlvbnMuaW5kZXhcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMudGlsZXNUZW1wbGF0ZXNbZnJvbUluZGV4XS5zb3VyY2Uuc3BsaWNlKGZyb21UaWxlSW5kZXgsIDEpO1xyXG4gICAgICAgICAgdGhpcy50aWxlc1RlbXBsYXRlc1t0b0luZGV4XS5zb3VyY2UucHVzaCh7XHJcbiAgICAgICAgICAgIG9wdHM6IHRpbGVPcHRpb25zXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICB0aGlzLnJlSW5kZXhUaWxlcyhzb3VyY2UuZnJvbS5lbGVtKTtcclxuICAgICAgICAgIHRoaXMucmVJbmRleFRpbGVzKHNvdXJjZS50by5lbGVtKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWFuYWdlIHRpbGVzIGZ1bmN0aW9uc1xyXG4gICAgcHJpdmF0ZSBjcmVhdGVUaWxlU2NvcGUodGlsZTogYW55KTogSVRpbGVTY29wZSB7XHJcbiAgICAgIGNvbnN0IHRpbGVTY29wZSA9IDwgSVRpbGVTY29wZSA+IHRoaXMuJHJvb3RTY29wZS4kbmV3KGZhbHNlLCB0aGlzLnRpbGVzQ29udGV4dCk7XHJcbiAgICAgIHRpbGVTY29wZS5pbmRleCA9IHRpbGUub3B0cy5pbmRleCA9PSB1bmRlZmluZWQgPyB0aWxlLm9wdHMub3B0aW9ucy5pbmRleCA6IHRpbGUub3B0cy5pbmRleDtcclxuICAgICAgdGlsZVNjb3BlLmdyb3VwSW5kZXggPSB0aWxlLm9wdHMuZ3JvdXBJbmRleCA9PSB1bmRlZmluZWQgPyB0aWxlLm9wdHMub3B0aW9ucy5ncm91cEluZGV4IDogdGlsZS5vcHRzLmdyb3VwSW5kZXg7XHJcblxyXG4gICAgICByZXR1cm4gdGlsZVNjb3BlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlVGlsZXMoZ3JvdXAsIGluZGV4ZXMsIGNvbnRhaW5lcikge1xyXG4gICAgICBjb25zdCB0aWxlcyA9ICQoY29udGFpbmVyKS5maW5kKCcucGlwLWRyYWdnYWJsZS10aWxlJyk7XHJcblxyXG4gICAgICBfLmVhY2goaW5kZXhlcywgKGluZGV4KSA9PiB7XHJcbiAgICAgICAgZ3JvdXAudGlsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB0aWxlc1tpbmRleF0ucmVtb3ZlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZUluZGV4VGlsZXMoY29udGFpbmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlSW5kZXhUaWxlcyhjb250YWluZXIsIGdJbmRleCA/ICkge1xyXG4gICAgICBjb25zdCB0aWxlcyA9ICQoY29udGFpbmVyKS5maW5kKCcucGlwLWRyYWdnYWJsZS10aWxlJyksXHJcbiAgICAgICAgZ3JvdXBJbmRleCA9IGdJbmRleCA9PT0gdW5kZWZpbmVkID8gY29udGFpbmVyLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSA6IGdJbmRleDtcclxuXHJcbiAgICAgIF8uZWFjaCh0aWxlcywgKHRpbGUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSAkKHRpbGUpLmNoaWxkcmVuKClbMF07XHJcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KGNoaWxkKS5zY29wZSgpWydpbmRleCddID0gaW5kZXg7XHJcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KGNoaWxkKS5zY29wZSgpWydncm91cEluZGV4J10gPSBncm91cEluZGV4O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbW92ZUdyb3VwcyhuZXdHcm91cHMpIHtcclxuICAgICAgY29uc3QgcmVtb3ZlSW5kZXhlcyA9IFtdLFxyXG4gICAgICAgIHJlbWFpbiA9IFtdLFxyXG4gICAgICAgIGNvbnRhaW5lcnMgPSBbXTtcclxuXHJcblxyXG4gICAgICBfLmVhY2godGhpcy5ncm91cHMsIChncm91cCwgaW5kZXgpID0+IHtcclxuICAgICAgICBpZiAoXy5maW5kSW5kZXgobmV3R3JvdXBzLCAoZykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gZ1sndGl0bGUnXSA9PT0gZ3JvdXAudGl0bGVcclxuICAgICAgICAgIH0pIDwgMCkge1xyXG4gICAgICAgICAgcmVtb3ZlSW5kZXhlcy5wdXNoKGluZGV4KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVtYWluLnB1c2goaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBfLmVhY2gocmVtb3ZlSW5kZXhlcy5yZXZlcnNlKCksIChpbmRleCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgXy5lYWNoKHJlbWFpbiwgKGluZGV4KSA9PiB7XHJcbiAgICAgICAgY29udGFpbmVycy5wdXNoKHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tpbmRleF0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZ3JvdXBzQ29udGFpbmVycyA9IGNvbnRhaW5lcnM7XHJcblxyXG4gICAgICBfLmVhY2godGhpcy5ncm91cHNDb250YWluZXJzLCAoY29udGFpbmVyLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVJbmRleFRpbGVzKGNvbnRhaW5lciwgaW5kZXgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZEdyb3VwKHNvdXJjZUdyb3VwKSB7XHJcbiAgICAgIGNvbnN0IGdyb3VwID0ge1xyXG4gICAgICAgIHRpdGxlOiBzb3VyY2VHcm91cC50aXRsZSxcclxuICAgICAgICBzb3VyY2U6IHNvdXJjZUdyb3VwLnNvdXJjZS5tYXAoKHRpbGUpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHRpbGVTY29wZSA9IHRoaXMuY3JlYXRlVGlsZVNjb3BlKHRpbGUpO1xyXG5cclxuICAgICAgICAgIHJldHVybiBJRHJhZ1RpbGVDb25zdHJ1Y3RvcihEcmFnVGlsZVNlcnZpY2UsIHtcclxuICAgICAgICAgICAgdHBsOiB0aGlzLiRjb21waWxlKHRpbGUudGVtcGxhdGUpKHRpbGVTY29wZSksXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgICAgc2l6ZTogdGlsZS5vcHRzLnNpemVcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLmdyb3Vwcy5wdXNoKGdyb3VwKTtcclxuICAgICAgaWYgKCF0aGlzLiRzY29wZS4kJHBoYXNlKSB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuXHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzQ29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5vcHRzLmdyb3VwQ29udGFuaW5lclNlbGVjdG9yKTtcclxuICAgICAgICB0aGlzLnRpbGVHcm91cHMucHVzaChcclxuICAgICAgICAgIElUaWxlc0dyaWRDb25zdHJ1Y3RvcihUaWxlc0dyaWRTZXJ2aWNlLCBncm91cC5zb3VyY2UsIHRoaXMub3B0cywgdGhpcy5hdmFpbGFibGVDb2x1bW5zLCB0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbdGhpcy5ncm91cHNDb250YWluZXJzLmxlbmd0aCAtIDFdKVxyXG4gICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnMoKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVUaWxlc1RlbXBsYXRlcygnYWRkR3JvdXAnLCBzb3VyY2VHcm91cCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRUaWxlc0ludG9Hcm91cChuZXdUaWxlcywgZ3JvdXAsIGdyb3VwQ29udGFpbmVyKSB7XHJcbiAgICAgIG5ld1RpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICBjb25zdCB0aWxlU2NvcGUgPSB0aGlzLmNyZWF0ZVRpbGVTY29wZSh0aWxlKTtcclxuXHJcbiAgICAgICAgY29uc3QgbmV3VGlsZSA9IElEcmFnVGlsZUNvbnN0cnVjdG9yKERyYWdUaWxlU2VydmljZSwge1xyXG4gICAgICAgICAgdHBsOiB0aGlzLiRjb21waWxlKHRpbGUudGVtcGxhdGUpKHRpbGVTY29wZSksXHJcbiAgICAgICAgICBvcHRpb25zOiB0aWxlLm9wdHMsXHJcbiAgICAgICAgICBzaXplOiB0aWxlLm9wdHMuc2l6ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBncm91cC5hZGRUaWxlKG5ld1RpbGUpO1xyXG5cclxuICAgICAgICAkKCc8ZGl2PicpXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ3BpcC1kcmFnZ2FibGUtdGlsZScpXHJcbiAgICAgICAgICAuYXBwZW5kKG5ld1RpbGUuZ2V0Q29tcGlsZWRUZW1wbGF0ZSgpKVxyXG4gICAgICAgICAgLmFwcGVuZFRvKGdyb3VwQ29udGFpbmVyKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc09wdGlvbnMob3B0aW9uc0dyb3VwKSB7XHJcbiAgICAgIG9wdGlvbnNHcm91cC5mb3JFYWNoKChvcHRpb25Hcm91cCkgPT4ge1xyXG4gICAgICAgIG9wdGlvbkdyb3VwLnNvdXJjZS5mb3JFYWNoKCh0aWxlT3B0aW9ucykgPT4ge1xyXG4gICAgICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgICAgIGdyb3VwLnVwZGF0ZVRpbGVPcHRpb25zKHRpbGVPcHRpb25zLm9wdHMpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdFRpbGVzR3JvdXBzKHRpbGVHcm91cHMsIG9wdHMsIGdyb3Vwc0NvbnRhaW5lcnMpIHtcclxuICAgICAgcmV0dXJuIHRpbGVHcm91cHMubWFwKChncm91cCwgaW5kZXgpID0+IHtcclxuICAgICAgICByZXR1cm4gSVRpbGVzR3JpZENvbnN0cnVjdG9yKFRpbGVzR3JpZFNlcnZpY2UsIGdyb3VwLnNvdXJjZSwgb3B0cywgdGhpcy5hdmFpbGFibGVDb2x1bW5zLCBncm91cHNDb250YWluZXJzW2luZGV4XSlcclxuICAgICAgICAgIC5nZW5lcmF0ZUdyaWQodGhpcy5nZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUodGhpcy5hdmFpbGFibGVXaWR0aCkpXHJcbiAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKClcclxuICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlVGlsZXNHcm91cHMob25seVBvc2l0aW9uID8gLCBkcmFnZ2VkVGlsZSA/ICkge1xyXG4gICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgZ3JvdXAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdyb3VwXHJcbiAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKG9ubHlQb3NpdGlvbiwgZHJhZ2dlZFRpbGUpXHJcbiAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldENvbnRhaW5lcldpZHRoKCk6IGFueSB7XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuJGNvbnRhaW5lciB8fCAkKCdib2R5Jyk7XHJcbiAgICAgIHJldHVybiBjb250YWluZXIud2lkdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEF2YWlsYWJsZUNvbHVtbnMoYXZhaWxhYmxlV2lkdGgpOiBhbnkge1xyXG4gICAgICByZXR1cm4gdGhpcy5vcHRzLm1vYmlsZUJyZWFrcG9pbnQgPiBhdmFpbGFibGVXaWR0aCA/IFNJTVBMRV9MQVlPVVRfQ09MVU1OU19DT1VOVCA6XHJcbiAgICAgICAgTWF0aC5mbG9vcihhdmFpbGFibGVXaWR0aCAvICh0aGlzLm9wdHMudGlsZVdpZHRoICsgdGhpcy5vcHRzLmd1dHRlcikpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QWN0aXZlR3JvdXBBbmRUaWxlKGVsZW0pOiBhbnkge1xyXG4gICAgICBjb25zdCBhY3RpdmUgPSB7fTtcclxuXHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZvdW5kVGlsZSA9IGdyb3VwLmdldFRpbGVCeU5vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIGlmIChmb3VuZFRpbGUpIHtcclxuICAgICAgICAgIGFjdGl2ZVsnZ3JvdXAnXSA9IGdyb3VwO1xyXG4gICAgICAgICAgYWN0aXZlWyd0aWxlJ10gPSBmb3VuZFRpbGU7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBhY3RpdmU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUoYXZhaWxhYmxlV2lkdGgpOiBhbnkge1xyXG4gICAgICByZXR1cm4gdGhpcy5vcHRzLm1vYmlsZUJyZWFrcG9pbnQgPiBhdmFpbGFibGVXaWR0aCA/IGF2YWlsYWJsZVdpZHRoIC8gMiAtIHRoaXMub3B0cy5ndXR0ZXIgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnU3RhcnRMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBjb25zdCBhY3RpdmVFbnRpdGllcyA9IHRoaXMuZ2V0QWN0aXZlR3JvdXBBbmRUaWxlKGV2ZW50LnRhcmdldCk7XHJcblxyXG4gICAgICB0aGlzLmNvbnRhaW5lciA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoJy5waXAtZHJhZ2dhYmxlLWdyb3VwJykuZ2V0KDApO1xyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlID0gYWN0aXZlRW50aXRpZXNbJ3RpbGUnXTtcclxuICAgICAgdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAgPSBhY3RpdmVFbnRpdGllc1snZ3JvdXAnXTtcclxuXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2RyYWctdHJhbnNmZXInKTtcclxuXHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUuc3RhcnREcmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICBjb25zdCB4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LnN0eWxlLmxlZnQpIHx8IDApICsgZXZlbnQuZHg7XHJcbiAgICAgIGNvbnN0IHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuc3R5bGUudG9wKSB8fCAwKSArIGV2ZW50LmR5O1xyXG5cclxuICAgICAgdGhpcy5jb250YWluZXJPZmZzZXQgPSB0aGlzLmdldENvbnRhaW5lck9mZnNldCgpO1xyXG5cclxuICAgICAgdGFyZ2V0LnN0eWxlLmxlZnQgPSB4ICsgJ3B4JzsgLy8gVE9ETyBbYXBpZGhpcm55aV0gRXh0cmFjdCB1bml0cyBpbnRvIG9wdGlvbnMgc2VjdGlvblxyXG4gICAgICB0YXJnZXQuc3R5bGUudG9wID0geSArICdweCc7XHJcblxyXG4gICAgICBjb25zdCBiZWxvd0VsZW1lbnQgPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cC5nZXRUaWxlQnlDb29yZGluYXRlcyh7XHJcbiAgICAgICAgbGVmdDogZXZlbnQucGFnZVggLSB0aGlzLmNvbnRhaW5lck9mZnNldC5sZWZ0LFxyXG4gICAgICAgIHRvcDogZXZlbnQucGFnZVkgLSB0aGlzLmNvbnRhaW5lck9mZnNldC50b3BcclxuICAgICAgfSwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcblxyXG4gICAgICBpZiAoYmVsb3dFbGVtZW50KSB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dlZFRpbGVJbmRleCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVJbmRleCh0aGlzLmRyYWdnZWRUaWxlKTtcclxuICAgICAgICBjb25zdCBiZWxvd0VsZW1JbmRleCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVJbmRleChiZWxvd0VsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGRyYWdnZWRUaWxlSW5kZXggKyAxKSA9PT0gYmVsb3dFbGVtSW5kZXgpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwXHJcbiAgICAgICAgICAuc3dhcFRpbGVzKHRoaXMuZHJhZ2dlZFRpbGUsIGJlbG93RWxlbWVudClcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnModHJ1ZSwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zZXRHcm91cENvbnRhaW5lcnNIZWlnaHQoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnRW5kTGlzdGVuZXIoKSB7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUuc3RvcERyYWcodGhpcy5pc1NhbWVEcm9wem9uZSk7XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdkcmFnLXRyYW5zZmVyJyk7XHJcbiAgICAgIHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwID0gbnVsbDtcclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDb250YWluZXJPZmZzZXQoKSB7XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5lclJlY3QgPSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbGVmdDogY29udGFpbmVyUmVjdC5sZWZ0LFxyXG4gICAgICAgIHRvcDogY29udGFpbmVyUmVjdC50b3BcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEdyb3VwQ29udGFpbmVyc0hlaWdodCgpIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKHRpbGVHcm91cCkgPT4ge1xyXG4gICAgICAgIHRpbGVHcm91cC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW92ZVRpbGUoZnJvbSwgdG8sIHRpbGUpIHtcclxuICAgICAgbGV0IGVsZW07XHJcbiAgICAgIGNvbnN0IG1vdmVkVGlsZSA9IGZyb20ucmVtb3ZlVGlsZSh0aWxlKTtcclxuICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAkKHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tfLmZpbmRJbmRleCh0aGlzLnRpbGVHcm91cHMsIGZyb20pXSlcclxuICAgICAgICAuZmluZChtb3ZlZFRpbGUuZ2V0RWxlbSgpKVxyXG4gICAgICAgIC5yZW1vdmUoKTtcclxuXHJcbiAgICAgIGlmICh0byAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRvLmFkZFRpbGUobW92ZWRUaWxlKTtcclxuXHJcbiAgICAgICAgZWxlbSA9IHRoaXMuJGNvbXBpbGUobW92ZWRUaWxlLmdldEVsZW0oKSkodGlsZVNjb3BlKTtcclxuXHJcbiAgICAgICAgJCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbXy5maW5kSW5kZXgodGhpcy50aWxlR3JvdXBzLCB0byldKVxyXG4gICAgICAgICAgLmFwcGVuZChlbGVtKTtcclxuXHJcbiAgICAgICAgdGhpcy4kdGltZW91dCh0by5zZXRUaWxlc0RpbWVuc2lvbnMuYmluZCh0bywgdHJ1ZSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzVGVtcGxhdGVzKCdtb3ZlVGlsZScsIHtcclxuICAgICAgICBmcm9tOiBmcm9tLFxyXG4gICAgICAgIHRvOiB0byxcclxuICAgICAgICB0aWxlOiBtb3ZlZFRpbGVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyb3BMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBjb25zdCBkcm9wcGVkR3JvdXBJbmRleCA9IGV2ZW50LnRhcmdldC5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWU7XHJcbiAgICAgIGNvbnN0IGRyb3BwZWRHcm91cCA9IHRoaXMudGlsZUdyb3Vwc1tkcm9wcGVkR3JvdXBJbmRleF07XHJcblxyXG4gICAgICBpZiAodGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAgIT09IGRyb3BwZWRHcm91cCkge1xyXG4gICAgICAgIHRoaXMubW92ZVRpbGUodGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAsIGRyb3BwZWRHcm91cCwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHModHJ1ZSk7XHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcFRvRmljdEdyb3VwTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZnJvbSA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwO1xyXG4gICAgICBjb25zdCB0aWxlID0gdGhpcy5kcmFnZ2VkVGlsZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkR3JvdXAoe1xyXG4gICAgICAgIHRpdGxlOiAnTmV3IGdyb3VwJyxcclxuICAgICAgICBzb3VyY2U6IFtdXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLm1vdmVUaWxlKGZyb20sIHRoaXMudGlsZUdyb3Vwc1t0aGlzLnRpbGVHcm91cHMubGVuZ3RoIC0gMV0sIHRpbGUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHModHJ1ZSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBpZiAoIXRoaXMuc291cmNlRHJvcFpvbmVFbGVtKSB7XHJcbiAgICAgICAgdGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gPSBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gIT09IGV2ZW50LmRyYWdFdmVudC5kcmFnRW50ZXIpIHtcclxuICAgICAgICBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyLmNsYXNzTGlzdC5hZGQoJ2Ryb3B6b25lLWFjdGl2ZScpO1xyXG4gICAgICAgICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICdjb3B5Jyk7XHJcbiAgICAgICAgdGhpcy5pc1NhbWVEcm9wem9uZSA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICcnKTtcclxuICAgICAgICB0aGlzLmlzU2FtZURyb3B6b25lID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGlmICh0aGlzLnNvdXJjZURyb3Bab25lRWxlbSAhPT0gZXZlbnQudGFyZ2V0KSB7XHJcbiAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5vcHRzLmFjdGl2ZURyb3B6b25lQ2xhc3MpO1xyXG4gICAgICAgICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICcnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wTGVhdmVMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLm9wdHMuYWN0aXZlRHJvcHpvbmVDbGFzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplKCkge1xyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZVdpZHRoID0gdGhpcy5nZXRDb250YWluZXJXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlQ29sdW1ucyA9IHRoaXMuZ2V0QXZhaWxhYmxlQ29sdW1ucyh0aGlzLmF2YWlsYWJsZVdpZHRoKTtcclxuICAgICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0cy5ncm91cENvbnRhbmluZXJTZWxlY3Rvcik7XHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzID0gdGhpcy5pbml0VGlsZXNHcm91cHModGhpcy5ncm91cHMsIHRoaXMub3B0cywgdGhpcy5ncm91cHNDb250YWluZXJzKTtcclxuXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKVxyXG4gICAgICAgICAgLmRyYWdnYWJsZSh7XHJcbiAgICAgICAgICAgIGF1dG9TY3JvbGw6IHtcclxuICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgIGNvbnRhaW5lcjogJCgnI2NvbnRlbnQnKS5nZXQoMCksXHJcbiAgICAgICAgICAgICAgc3BlZWQ6IDUwMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbnN0YXJ0OiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0TGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9ubW92ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZW5kOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0VuZExpc3RlbmVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS1ncm91cC5maWN0LWdyb3VwJylcclxuICAgICAgICAgIC5kcm9wem9uZSh7XHJcbiAgICAgICAgICAgIG9uZHJvcDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BUb0ZpY3RHcm91cExpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyYWdlbnRlcjogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BFbnRlckxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyb3BkZWFjdGl2YXRlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnbGVhdmU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wTGVhdmVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS1ncm91cCcpXHJcbiAgICAgICAgICAuZHJvcHpvbmUoe1xyXG4gICAgICAgICAgICBvbmRyb3A6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJhZ2VudGVyOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcEVudGVyTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJvcGRlYWN0aXZhdGU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyYWdsZWF2ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BMZWF2ZUxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy4kY29udGFpbmVyXHJcbiAgICAgICAgICAub24oJ21vdXNlZG93biB0b3VjaHN0YXJ0JywgJ21kLW1lbnUgLm1kLWljb24tYnV0dG9uJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBpbnRlcmFjdCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpLmRyYWdnYWJsZShmYWxzZSk7XHJcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlcignY2xpY2snKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAub24oJ21vdXNldXAgdG91Y2hlbmQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJykuZHJhZ2dhYmxlKHRydWUpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBEcmFnQ29tcG9uZW50OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIHRpbGVzVGVtcGxhdGVzOiAnPXBpcFRpbGVzVGVtcGxhdGVzJyxcclxuICAgICAgdGlsZXNDb250ZXh0OiAnPXBpcFRpbGVzQ29udGV4dCcsXHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwRHJhZ2dhYmxlR3JpZCcsXHJcbiAgICAgIGdyb3VwTWVudUFjdGlvbnM6ICc9cGlwR3JvdXBNZW51QWN0aW9ucydcclxuICAgIH0sXHJcbiAgICAvL2NvbnRyb2xsZXJBczogJ0RyYWdnZWRDdHJsJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnZHJhZ2dhYmxlL0RyYWdnYWJsZS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IERyYWdnYWJsZUNvbnRyb2xsZXJcclxuICB9XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdwaXBEcmFnZ2FibGVUaWxlcycpXHJcbiAgICAuY29tcG9uZW50KCdwaXBEcmFnZ2FibGVHcmlkJywgRHJhZ0NvbXBvbmVudCk7XHJcbn0iLCJleHBvcnQgaW50ZXJmYWNlIERyYWdUaWxlQ29uc3RydWN0b3Ige1xyXG4gIG5ldyAob3B0aW9uczogYW55KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIElEcmFnVGlsZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBEcmFnVGlsZUNvbnN0cnVjdG9yLCBvcHRpb25zOiBhbnkpOiBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHRwbDogYW55O1xyXG4gIG9wdHM6IGFueTtcclxuICBzaXplOiBhbnk7XHJcbiAgZWxlbTogYW55O1xyXG4gIHByZXZpZXc6IGFueTtcclxuICBnZXRTaXplKCk6IGFueTtcclxuICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnk7XHJcbiAgc2V0UG9zaXRpb24obGVmdCwgdG9wKTogYW55O1xyXG4gIGdldENvbXBpbGVkVGVtcGxhdGUoKTogYW55O1xyXG4gIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55O1xyXG4gIGdldEVsZW0oKTogYW55O1xyXG4gIHN0YXJ0RHJhZygpOiBhbnk7XHJcbiAgc3RvcERyYWcoaXNBbmltYXRlKTogYW55O1xyXG4gIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpOiB2b2lkO1xyXG4gIGdldE9wdGlvbnMoKTogYW55O1xyXG4gIHNldE9wdGlvbnMob3B0aW9ucyk6IGFueTtcclxufVxyXG5cclxubGV0IERFRkFVTFRfVElMRV9TSVpFID0ge1xyXG4gIGNvbFNwYW46IDEsXHJcbiAgcm93U3BhbjogMVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIERyYWdUaWxlU2VydmljZSBpbXBsZW1lbnRzIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHB1YmxpYyB0cGw6IGFueTtcclxuICBwdWJsaWMgb3B0czogYW55O1xyXG4gIHB1YmxpYyBzaXplOiBhbnk7XHJcbiAgcHVibGljIGVsZW06IGFueTtcclxuICBwdWJsaWMgcHJldmlldzogYW55O1xyXG5cclxuICBjb25zdHJ1Y3RvciAob3B0aW9uczogYW55KSB7XHJcbiAgICB0aGlzLnRwbCA9IG9wdGlvbnMudHBsLmdldCgwKTtcclxuICAgIHRoaXMub3B0cyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLnNpemUgPSBfLm1lcmdlKHt9LCBERUZBVUxUX1RJTEVfU0laRSwgb3B0aW9ucy5zaXplKTtcclxuICAgIHRoaXMuZWxlbSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2l6ZSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2l6ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnkge1xyXG4gICAgdGhpcy5zaXplLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLnNpemUuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFBvc2l0aW9uKGxlZnQsIHRvcCk6IGFueSB7XHJcbiAgICB0aGlzLnNpemUubGVmdCA9IGxlZnQ7XHJcbiAgICB0aGlzLnNpemUudG9wID0gdG9wO1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICB0b3A6IHRvcFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDb21waWxlZFRlbXBsYXRlKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy50cGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55IHtcclxuICAgIHRoaXMuZWxlbSA9ICQodGhpcy50cGwpLnBhcmVudChwYXJlbnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtLmdldCgwKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCk6IGFueSB7XHJcbiAgICB0aGlzLnByZXZpZXcgPSAkKCc8ZGl2PicpXHJcbiAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnZWQtcHJldmlldycpXHJcbiAgICAgIC5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMuZWxlbS5jc3MoJ2xlZnQnKSxcclxuICAgICAgICB0b3A6IHRoaXMuZWxlbS5jc3MoJ3RvcCcpLFxyXG4gICAgICAgIHdpZHRoOiB0aGlzLmVsZW0uY3NzKCd3aWR0aCcpLFxyXG4gICAgICAgIGhlaWdodDogdGhpcy5lbGVtLmNzcygnaGVpZ2h0JylcclxuICAgICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtXHJcbiAgICAgIC5hZGRDbGFzcygnbm8tYW5pbWF0aW9uJylcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgekluZGV4OiAnOTk5OSdcclxuICAgICAgfSlcclxuICAgICAgLmFmdGVyKHRoaXMucHJldmlldyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0b3BEcmFnKGlzQW5pbWF0ZSk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgaWYgKGlzQW5pbWF0ZSkge1xyXG4gICAgICB0aGlzLmVsZW1cclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ25vLWFuaW1hdGlvbicpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiB0aGlzLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHRoaXMucHJldmlldy5jc3MoJ3RvcCcpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub24oJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiBzZWxmLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHNlbGYucHJldmlldy5jc3MoJ3RvcCcpLFxyXG4gICAgICAgICAgekluZGV4OiAnJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCduby1hbmltYXRpb24nKTtcclxuXHJcbiAgICAgIHNlbGYucHJldmlldy5yZW1vdmUoKTtcclxuICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICBmdW5jdGlvbiBvblRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICAgIGlmIChzZWxmLnByZXZpZXcpIHtcclxuICAgICAgICBzZWxmLnByZXZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcygnekluZGV4JywgJycpXHJcbiAgICAgICAgLm9mZigndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpIHtcclxuICAgIHRoaXMucHJldmlldy5jc3MoY29vcmRzKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0T3B0aW9ucygpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0cy5vcHRpb25zO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRPcHRpb25zKG9wdGlvbnMpOiBhbnkge1xyXG4gICAgXy5tZXJnZSh0aGlzLm9wdHMub3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICBfLm1lcmdlKHRoaXMuc2l6ZSwgb3B0aW9ucy5zaXplKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dhYmxlVGlsZXMnKVxyXG4gIC5zZXJ2aWNlKCdwaXBEcmFnVGlsZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICBsZXQgbmV3VGlsZSA9IG5ldyBEcmFnVGlsZVNlcnZpY2Uob3B0aW9ucyk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3VGlsZTtcclxuICAgIH1cclxuICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgncGlwRHJhZ2dhYmxlVGlsZXMnLCBbXSk7XHJcblxyXG5pbXBvcnQgJy4vRHJhZ2dhYmxlVGlsZVNlcnZpY2UnO1xyXG5pbXBvcnQgJy4vRHJhZ2dhYmxlJzsiLCJpbXBvcnQge1xyXG4gIE1lbnVUaWxlU2VydmljZVxyXG59IGZyb20gJy4uL21lbnVfdGlsZS9NZW51VGlsZVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElUaWxlQ29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uL2NvbmZpZ190aWxlX2RpYWxvZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxue1xyXG4gIGNsYXNzIEV2ZW50VGlsZUNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51VGlsZVNlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBfb2xkT3BhY2l0eTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBvcGFjaXR5OiBudW1iZXIgPSAwLjU3O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBUaWxlQ29uZmlnRGlhbG9nU2VydmljZTogSVRpbGVDb25maWdTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1lbnUpIHRoaXMubWVudSA9IF8udW5pb24odGhpcy5tZW51LCB0aGlzLm9wdGlvbnMubWVudSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICB0aXRsZTogJ0NvbmZpZ3VyYXRlJyxcclxuICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5jb2xvciA9IHRoaXMub3B0aW9ucy5jb2xvciB8fCAnZ3JheSc7XHJcbiAgICAgIHRoaXMub3BhY2l0eSA9IHRoaXMub3B0aW9ucy5vcGFjaXR5IHx8IHRoaXMub3BhY2l0eTtcclxuXHJcbiAgICAgIHRoaXMuZHJhd0ltYWdlKCk7XHJcblxyXG4gICAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgICAkc2NvcGUuJHdhdGNoKCgpID0+IHtcclxuICAgICAgICByZXR1cm4gJGVsZW1lbnQuaXMoJzp2aXNpYmxlJyk7XHJcbiAgICAgIH0sIChuZXdWYWwpID0+IHtcclxuICAgICAgICB0aGlzLmRyYXdJbWFnZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRyYXdJbWFnZSgpIHtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbWFnZSkge1xyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkltYWdlTG9hZCh0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLl9vbGRPcGFjaXR5ID0gXy5jbG9uZSh0aGlzLm9wYWNpdHkpO1xyXG4gICAgICB0aGlzLnBpcFRpbGVDb25maWdEaWFsb2dTZXJ2aWNlLnNob3coe1xyXG4gICAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLWNhbGVuZGFyLWNvbmZpZycsXHJcbiAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplIHx8IHtcclxuICAgICAgICAgICAgY29sU3BhbjogMSxcclxuICAgICAgICAgICAgcm93U3BhbjogMVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGRhdGU6IHRoaXMub3B0aW9ucy5kYXRlLFxyXG4gICAgICAgICAgdGl0bGU6IHRoaXMub3B0aW9ucy50aXRsZSxcclxuICAgICAgICAgIHRleHQ6IHRoaXMub3B0aW9ucy50ZXh0LFxyXG4gICAgICAgICAgb3BhY2l0eTogdGhpcy5vcGFjaXR5LFxyXG4gICAgICAgICAgb25PcGFjaXR5dGVzdDogKG9wYWNpdHkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ2V2ZW50X3RpbGUvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnRpdGxlID0gcmVzdWx0LnRpdGxlO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50ZXh0ID0gcmVzdWx0LnRleHQ7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9wYWNpdHkgPSByZXN1bHQub3BhY2l0eTtcclxuICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMub3BhY2l0eSA9IHRoaXMuX29sZE9wYWNpdHk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25JbWFnZUxvYWQoaW1hZ2UpIHtcclxuICAgICAgdGhpcy5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLiRlbGVtZW50LnBhcmVudCgpLCBpbWFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmltYWdlKSB7XHJcbiAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuJGVsZW1lbnQucGFyZW50KCksIHRoaXMuJGVsZW1lbnQuZmluZCgnaW1nJykpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBMYXRlciByZXBsYWNlIGJ5IHBpcEltYWdlVXRpbHMgc2V2aWNlJ3MgZnVuY3Rpb25cclxuICAgIHByaXZhdGUgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKSB7XHJcbiAgICAgIGxldFxyXG4gICAgICAgIGNvbnRhaW5lcldpZHRoID0gJGVsZW1lbnQud2lkdGggPyAkZWxlbWVudC53aWR0aCgpIDogJGVsZW1lbnQuY2xpZW50V2lkdGgsIC8vIHx8IDgwLFxyXG4gICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRlbGVtZW50LmhlaWdodCA/ICRlbGVtZW50LmhlaWdodCgpIDogJGVsZW1lbnQuY2xpZW50SGVpZ2h0LCAvLyB8fCA4MCxcclxuICAgICAgICBpbWFnZVdpZHRoID0gaW1hZ2VbMF0ubmF0dXJhbFdpZHRoIHx8IGltYWdlLndpZHRoLFxyXG4gICAgICAgIGltYWdlSGVpZ2h0ID0gaW1hZ2VbMF0ubmF0dXJhbEhlaWdodCB8fCBpbWFnZS5oZWlnaHQsXHJcbiAgICAgICAgbWFyZ2luID0gMCxcclxuICAgICAgICBjc3NQYXJhbXMgPSB7fTtcclxuXHJcbiAgICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgICBtYXJnaW4gPSAtKChpbWFnZVdpZHRoIC8gaW1hZ2VIZWlnaHQgKiBjb250YWluZXJIZWlnaHQgLSBjb250YWluZXJXaWR0aCkgLyAyKTtcclxuICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi1sZWZ0J10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgY3NzUGFyYW1zWyd3aWR0aCddID0gJycgKyBpbWFnZVdpZHRoICogY29udGFpbmVySGVpZ2h0IC8gaW1hZ2VIZWlnaHQgKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi10b3AnXSA9ICcnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1hcmdpbiA9IC0oKGltYWdlSGVpZ2h0IC8gaW1hZ2VXaWR0aCAqIGNvbnRhaW5lcldpZHRoIC0gY29udGFpbmVySGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snaGVpZ2h0J10gPSAnJyArIGltYWdlSGVpZ2h0ICogY29udGFpbmVyV2lkdGggLyBpbWFnZVdpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgY3NzUGFyYW1zWyd3aWR0aCddID0gJycgKyBjb250YWluZXJXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpbWFnZS5jc3MoY3NzUGFyYW1zKTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICBjb25zdCBFdmVudFRpbGU6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IEV2ZW50VGlsZUNvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2V2ZW50X3RpbGUvRXZlbnRUaWxlLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEYXNoYm9hcmQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRXZlbnRUaWxlJywgRXZlbnRUaWxlKTtcclxufSIsIi8vIEltcG9ydCBzZXJ2aWNlc1xyXG5pbXBvcnQgJy4vdGlsZV9ncm91cC9pbmRleCc7XHJcbmltcG9ydCAnLi9kcmFnZ2FibGUnO1xyXG5cclxuLy8gSW1wb3J0IHRpbGUgc2VydmljZXNcclxuaW1wb3J0ICcuL21lbnVfdGlsZSc7XHJcblxyXG4vLyBJbXBvcnQgZGlhbG9nc1xyXG5pbXBvcnQgJy4vYWRkX3RpbGVfZGlhbG9nJztcclxuaW1wb3J0ICcuL2NvbmZpZ190aWxlX2RpYWxvZyc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkJywgW1xyXG4gIC8vIFNlcnZpY2VzXHJcbiAgJ3BpcERyYWdnYWJsZVRpbGVzJyxcclxuICAncGlwRHJhZ2dhYmxlVGlsZXNHcm91cCcsXHJcbiAgLy8gVGlsZSBzZXJ2aWNlc1xyXG4gICdwaXBNZW51VGlsZScsXHJcbiAgLy8gRGlhbG9nc1xyXG4gICdwaXBDb25maWdEYXNoYm9hcmRUaWxlRGlhbG9nJyxcclxuICAncGlwQWRkRGFzaGJvYXJkVGlsZURpYWxvZycsXHJcbiAgLy9UZW1wbGF0ZXNcclxuICAncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsXHJcbiAgLy8gRXh0ZXJuYWwgcGlwIG1vZHVsZXNcclxuICAncGlwTGF5b3V0JyxcclxuICAncGlwTG9jYXRpb25zJyxcclxuICAncGlwRGF0ZVRpbWUnLFxyXG4gICdwaXBDaGFydHMnLFxyXG4gICdwaXBUcmFuc2xhdGUnLFxyXG4gICdwaXBDb250cm9scycsXHJcbiAgJ3BpcEJ1dHRvbnMnXHJcbl0pO1xyXG5cclxuLy8gSW1wb3J0IHV0aWxpdHkgXHJcbmltcG9ydCAnLi91dGlsaXR5L1RpbGVUZW1wbGF0ZVV0aWxpdHknO1xyXG4vLyBJbXBvcnQgdGlsZXNcclxuaW1wb3J0ICcuL2NvbW1vbl90aWxlL1RpbGUnO1xyXG5pbXBvcnQgJy4vY2FsZW5kYXJfdGlsZS9DYWxlbmRhclRpbGUnO1xyXG5pbXBvcnQgJy4vZXZlbnRfdGlsZS9FdmVudFRpbGUnO1xyXG5pbXBvcnQgJy4vbm90ZV90aWxlL05vdGVUaWxlJztcclxuaW1wb3J0ICcuL3BpY3R1cmVfc2xpZGVyX3RpbGUvUGljdHVyZVNsaWRlclRpbGUnO1xyXG5pbXBvcnQgJy4vcG9zaXRpb25fdGlsZS9Qb3NpdGlvblRpbGUnO1xyXG5pbXBvcnQgJy4vc3RhdGlzdGljc190aWxlL1N0YXRpc3RpY3NUaWxlJztcclxuLy8gSW1wb3J0IGNvbW1vbiBjb21wb25lbnRcclxuaW1wb3J0ICcuL2Rhc2hib2FyZC9EYXNoYm9hcmQnO1xyXG4iLCJ7XHJcbiAgY29uc3QgTWVudVRpbGUgPSAoKTpuZy5JRGlyZWN0aXZlID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ21lbnVfdGlsZS9NZW51VGlsZS5odG1sJ1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcE1lbnVUaWxlJylcclxuICAgIC5kaXJlY3RpdmUoJ3BpcE1lbnVUaWxlJywgTWVudVRpbGUpO1xyXG59IiwiaW1wb3J0IHsgRGFzaGJvYXJkVGlsZSB9IGZyb20gJy4uL2NvbW1vbl90aWxlL1RpbGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1lbnVUaWxlU2VydmljZSBleHRlbmRzIERhc2hib2FyZFRpbGUge1xyXG4gIHB1YmxpYyBtZW51OiBhbnkgPSBbe1xyXG4gICAgdGl0bGU6ICdDaGFuZ2UgU2l6ZScsXHJcbiAgICBhY3Rpb246IGFuZ3VsYXIubm9vcCxcclxuICAgIHN1Ym1lbnU6IFt7XHJcbiAgICAgICAgdGl0bGU6ICcxIHggMScsXHJcbiAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICBzaXplWDogMSxcclxuICAgICAgICAgIHNpemVZOiAxXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICcyIHggMScsXHJcbiAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICBzaXplWDogMixcclxuICAgICAgICAgIHNpemVZOiAxXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICcyIHggMicsXHJcbiAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICBzaXplWDogMixcclxuICAgICAgICAgIHNpemVZOiAyXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfV07XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FsbEFjdGlvbihhY3Rpb25OYW1lLCBwYXJhbXMsIGl0ZW0pIHtcclxuICAgIGlmICh0aGlzW2FjdGlvbk5hbWVdKSB7XHJcbiAgICAgIHRoaXNbYWN0aW9uTmFtZV0uY2FsbCh0aGlzLCBwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpdGVtWydjbGljayddKSB7XHJcbiAgICAgIGl0ZW1bJ2NsaWNrJ10uY2FsbChpdGVtLCBwYXJhbXMsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgIHRoaXMub3B0aW9ucy5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcbiAgfTtcclxufVxyXG5cclxue1xyXG4gIGNsYXNzIE1lbnVUaWxlUHJvdmlkZXIge1xyXG4gICAgcHJpdmF0ZSBfc2VydmljZTogTWVudVRpbGVTZXJ2aWNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBwdWJsaWMgJGdldCgpIHtcclxuICAgICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX3NlcnZpY2UgPT0gbnVsbClcclxuICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE1lbnVUaWxlU2VydmljZSgpO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuX3NlcnZpY2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBNZW51VGlsZScpXHJcbiAgICAucHJvdmlkZXIoJ3BpcE1lbnVUaWxlJywgTWVudVRpbGVQcm92aWRlcik7XHJcbn0iLCJhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBNZW51VGlsZScsIFtdKTtcclxuXHJcbmltcG9ydCAnLi9NZW51VGlsZURpcmVjdGl2ZSc7XHJcbmltcG9ydCAnLi9NZW51VGlsZVNlcnZpY2UnO1xyXG5cclxuZXhwb3J0ICogZnJvbSAnLi9NZW51VGlsZVNlcnZpY2UnOyIsImltcG9ydCB7XHJcbiAgTWVudVRpbGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudV90aWxlL01lbnVUaWxlU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVRpbGVDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNsYXNzIE5vdGVUaWxlQ29udHJvbGxlciBleHRlbmRzIE1lbnVUaWxlU2VydmljZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgcGlwVGlsZUNvbmZpZ0RpYWxvZ1NlcnZpY2U6IElUaWxlQ29uZmlnU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpcy5vcHRpb25zLm1lbnUgPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpIDogdGhpcy5tZW51O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLm1lbnUucHVzaCh7XHJcbiAgICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub25Db25maWdDbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuY29sb3IgPSB0aGlzLm9wdGlvbnMuY29sb3IgfHwgJ29yYW5nZSc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLnBpcFRpbGVDb25maWdEaWFsb2dTZXJ2aWNlLnNob3coe1xyXG4gICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgICAgICBzaXplOiB0aGlzLm9wdGlvbnMuc2l6ZSxcclxuICAgICAgICAgIHRpdGxlOiB0aGlzLm9wdGlvbnMudGl0bGUsXHJcbiAgICAgICAgICB0ZXh0OiB0aGlzLm9wdGlvbnMudGV4dCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ25vdGVfdGlsZS9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTaXplKHJlc3VsdC5zaXplKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudGV4dCA9IHJlc3VsdC50ZXh0O1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50aXRsZSA9IHJlc3VsdC50aXRsZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBOb3RlVGlsZTogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogTm90ZVRpbGVDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdub3RlX3RpbGUvTm90ZVRpbGUuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBOb3RlVGlsZScsIE5vdGVUaWxlKTtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7XHJcbiAgTWVudVRpbGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudV90aWxlL01lbnVUaWxlU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVRpbGVDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElUaWxlVGVtcGxhdGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vdXRpbGl0eS9UaWxlVGVtcGxhdGVVdGlsaXR5JztcclxuXHJcbntcclxuICBjbGFzcyBQaWN0dXJlU2xpZGVyQ29udHJvbGxlciBleHRlbmRzIE1lbnVUaWxlU2VydmljZSB7XHJcbiAgICBwdWJsaWMgYW5pbWF0aW9uVHlwZTogc3RyaW5nID0gJ2ZhZGluZyc7XHJcbiAgICBwdWJsaWMgYW5pbWF0aW9uSW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW55LFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBUaWxlVGVtcGxhdGU6IElUaWxlVGVtcGxhdGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvblR5cGUgPSB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uVHlwZSB8fCB0aGlzLmFuaW1hdGlvblR5cGU7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25JbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5hbmltYXRpb25JbnRlcnZhbCB8fCB0aGlzLmFuaW1hdGlvbkludGVydmFsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uSW1hZ2VMb2FkKCRldmVudCkge1xyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnBpcFRpbGVUZW1wbGF0ZS5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLiRlbGVtZW50LnBhcmVudCgpLCAkZXZlbnQudGFyZ2V0KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcblxyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICBfLmVhY2godGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKSwgKGltYWdlKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBpcFRpbGVUZW1wbGF0ZS5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLiRlbGVtZW50LnBhcmVudCgpLCBpbWFnZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBQaWN0dXJlU2xpZGVyVGlsZTogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogUGljdHVyZVNsaWRlckNvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3BpY3R1cmVfc2xpZGVyX3RpbGUvUGljdHVyZVNsaWRlclRpbGUuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBQaWN0dXJlU2xpZGVyVGlsZScsIFBpY3R1cmVTbGlkZXJUaWxlKTtcclxufSIsImltcG9ydCB7XHJcbiAgTWVudVRpbGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudV90aWxlL01lbnVUaWxlU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVRpbGVDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNsYXNzIFBvc2l0aW9uVGlsZUNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51VGlsZVNlcnZpY2Uge1xyXG4gICAgcHVibGljIHNob3dQb3NpdGlvbjogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlICRlbGVtZW50OiBhbnksXHJcbiAgICAgIHByaXZhdGUgcGlwVGlsZUNvbmZpZ0RpYWxvZ1NlcnZpY2U6IElUaWxlQ29uZmlnU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBMb2NhdGlvbkVkaXREaWFsb2c6IGFueSxcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWVudSkgdGhpcy5tZW51ID0gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLm1lbnUucHVzaCh7XHJcbiAgICAgICAgdGl0bGU6ICdDaGFuZ2UgbG9jYXRpb24nLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9wZW5Mb2NhdGlvbkVkaXREaWFsb2coKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uID0gdGhpcy5vcHRpb25zLmxvY2F0aW9uIHx8IHRoaXMub3B0aW9ucy5wb3NpdGlvbjtcclxuXHJcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLm9wdGlvbnMubG9jYXRpb24nLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZURyYXdQb3NpdGlvbigpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFRPRE8gaXQgZG9lc24ndCB3b3JrXHJcbiAgICAgICRzY29wZS4kd2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTtcclxuICAgICAgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICAgIGlmIChuZXdWYWwgPT0gdHJ1ZSkgdGhpcy5yZURyYXdQb3NpdGlvbigpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICAgIHRoaXMucGlwVGlsZUNvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtcG9zaXRpb24tY29uZmlnJyxcclxuICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgbG9jYXRpb25OYW1lOiB0aGlzLm9wdGlvbnMubG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgaGlkZUNvbG9yczogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ3Bvc2l0aW9uX3RpbGUvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uTmFtZSA9IHJlc3VsdC5sb2NhdGlvbk5hbWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgICAgdGhpcy5yZURyYXdQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcGVuTG9jYXRpb25FZGl0RGlhbG9nKCkge1xyXG4gICAgICB0aGlzLnBpcExvY2F0aW9uRWRpdERpYWxvZy5zaG93KHtcclxuICAgICAgICBsb2NhdGlvbk5hbWU6IHRoaXMub3B0aW9ucy5sb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgbG9jYXRpb25Qb3M6IHRoaXMub3B0aW9ucy5sb2NhdGlvblxyXG4gICAgICB9LCAobmV3UG9zaXRpb24pID0+IHtcclxuICAgICAgICBpZiAobmV3UG9zaXRpb24pIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5sb2NhdGlvbiA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9uO1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uTmFtZSA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9OYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZURyYXdQb3NpdGlvbigpIHtcclxuICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSBmYWxzZTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSB0cnVlO1xyXG4gICAgICB9LCA1MCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgY29uc3QgUG9zaXRpb25UaWxlOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBQb3NpdGlvblRpbGVDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdwb3NpdGlvbl90aWxlL1Bvc2l0aW9uVGlsZS5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb21wb25lbnQoJ3BpcFBvc2l0aW9uVGlsZScsIFBvc2l0aW9uVGlsZSk7XHJcbn0iLCJpbXBvcnQge1xyXG4gIE1lbnVUaWxlU2VydmljZVxyXG59IGZyb20gJy4uL21lbnVfdGlsZS9NZW51VGlsZVNlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNvbnN0IFNNQUxMX0NIQVJUOiBudW1iZXIgPSA3MDtcclxuICBjb25zdCBCSUdfQ0hBUlQ6IG51bWJlciA9IDI1MDtcclxuXHJcbiAgY2xhc3MgU3RhdGlzdGljc1RpbGVDb250cm9sbGVyIGV4dGVuZHMgTWVudVRpbGVTZXJ2aWNlIHtcclxuICAgIHByaXZhdGUgXyRzY29wZTogYW5ndWxhci5JU2NvcGU7XHJcbiAgICBwcml2YXRlIF8kdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2U7XHJcblxyXG4gICAgcHVibGljIHJlc2V0OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgY2hhcnRTaXplOiBudW1iZXIgPSBTTUFMTF9DSEFSVDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcGlwVGlsZU1lbnU6IGFueSxcclxuICAgICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMubWVudSA9IHRoaXMub3B0aW9ucy5tZW51ID8gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KSA6IHRoaXMubWVudTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zZXRDaGFydFNpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICAgIHRoaXMucmVzZXQgPSB0cnVlO1xyXG4gICAgICB0aGlzLnNldENoYXJ0U2l6ZSgpO1xyXG4gICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZXNldCA9IGZhbHNlO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Q2hhcnRTaXplKCkge1xyXG4gICAgICB0aGlzLmNoYXJ0U2l6ZSA9IHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgPyBCSUdfQ0hBUlQgOiBTTUFMTF9DSEFSVDtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICBjb25zdCBTdGF0aXN0aWNzVGlsZTogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogU3RhdGlzdGljc1RpbGVDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdzdGF0aXN0aWNzX3RpbGUvU3RhdGlzdGljc1RpbGUuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBTdGF0aXN0aWNzVGlsZScsIFN0YXRpc3RpY3NUaWxlKTtcclxufSIsIntcclxuICBpbnRlcmZhY2UgRHJhZ2dhYmxlVGlsZUF0dHJpYnV0ZXMgZXh0ZW5kcyBuZy5JQXR0cmlidXRlcyB7XHJcbiAgICBwaXBEcmFnZ2FibGVUaWxlczogYW55O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gRHJhZ2dhYmxlVGlsZUxpbmsoXHJcbiAgICAkc2NvcGU6IG5nLklTY29wZSxcclxuICAgICRlbGVtOiBKUXVlcnksXHJcbiAgICAkYXR0cjogRHJhZ2dhYmxlVGlsZUF0dHJpYnV0ZXNcclxuICApIHtcclxuICAgIGNvbnN0IGRvY0ZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXHJcbiAgICAgIGdyb3VwID0gJHNjb3BlLiRldmFsKCRhdHRyLnBpcERyYWdnYWJsZVRpbGVzKTtcclxuXHJcbiAgICBncm91cC5mb3JFYWNoKGZ1bmN0aW9uICh0aWxlKSB7XHJcbiAgICAgIGNvbnN0IHRwbCA9IHdyYXBDb21wb25lbnQodGlsZS5nZXRDb21waWxlZFRlbXBsYXRlKCkpO1xyXG4gICAgICBkb2NGcmFnLmFwcGVuZENoaWxkKHRwbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkZWxlbS5hcHBlbmQoZG9jRnJhZyk7XHJcblxyXG4gICAgZnVuY3Rpb24gd3JhcENvbXBvbmVudChlbGVtKSB7XHJcbiAgICAgIHJldHVybiAkKCc8ZGl2PicpXHJcbiAgICAgICAgLmFkZENsYXNzKCdwaXAtZHJhZ2dhYmxlLXRpbGUnKVxyXG4gICAgICAgIC5hcHBlbmQoZWxlbSlcclxuICAgICAgICAuZ2V0KDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gRHJhZ2dhYmxlVGlsZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgIGxpbms6IERyYWdnYWJsZVRpbGVMaW5rXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbmNvbnNvbGUubG9nKCdoZXJlIDMnKTtcclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRHJhZ2dhYmxlVGlsZXNHcm91cCcpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBEcmFnZ2FibGVUaWxlcycsIERyYWdnYWJsZVRpbGUpO1xyXG59IiwiZXhwb3J0IGludGVyZmFjZSBUaWxlc0dyaWRDb25zdHJ1Y3RvciB7XHJcbiAgbmV3KHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIElUaWxlc0dyaWRDb25zdHJ1Y3Rvcihjb25zdHJ1Y3RvcjogVGlsZXNHcmlkQ29uc3RydWN0b3IsIHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTogSVRpbGVzR3JpZFNlcnZpY2Uge1xyXG4gIHJldHVybiBuZXcgY29uc3RydWN0b3IodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUaWxlc0dyaWRTZXJ2aWNlIHtcclxuICB0aWxlczogYW55O1xyXG4gIG9wdHM6IGFueTtcclxuICBjb2x1bW5zOiBhbnk7XHJcbiAgZWxlbTogYW55O1xyXG4gIGdyaWRDZWxsczogYW55O1xyXG4gIGlubGluZTogYm9vbGVhbjtcclxuICBpc01vYmlsZUxheW91dDogYm9vbGVhbjtcclxuXHJcbiAgYWRkVGlsZSh0aWxlKTogYW55O1xyXG4gIGdldENlbGxCeVBvc2l0aW9uKHJvdywgY29sKTogYW55O1xyXG4gIGdldENlbGxzKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55O1xyXG4gIGdldEF2YWlsYWJsZUNlbGxzRGVza3RvcChwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRDZWxsKHNyYywgYmFzaWNSb3csIGJhc2ljQ29sLCBjb2x1bW5zKTogYW55O1xyXG4gIGdldEF2YWlsYWJsZUNlbGxzTW9iaWxlKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55O1xyXG4gIGdldEJhc2ljUm93KHByZXZDZWxsKTogYW55O1xyXG4gIGlzQ2VsbEZyZWUocm93LCBjb2wpOiBhbnk7XHJcbiAgZ2V0Q2VsbEluZGV4KHNyY0NlbGwpOiBhbnk7XHJcbiAgcmVzZXJ2ZUNlbGxzKHN0YXJ0LCBlbmQsIGVsZW0pOiB2b2lkO1xyXG4gIGNsZWFyRWxlbWVudHMoKTogdm9pZDtcclxuICBzZXRBdmFpbGFibGVDb2x1bW5zKGNvbHVtbnMpOiBhbnk7XHJcbiAgZ2VuZXJhdGVHcmlkKHNpbmdsZVRpbGVXaWR0aCA/ICk6IGFueTtcclxuICBzZXRUaWxlc0RpbWVuc2lvbnMob25seVBvc2l0aW9uLCBkcmFnZ2VkVGlsZSk6IGFueTtcclxuICBjYWxjQ29udGFpbmVySGVpZ2h0KCk6IGFueTtcclxuICBnZXRUaWxlQnlOb2RlKG5vZGUpOiBhbnk7XHJcbiAgZ2V0VGlsZUJ5Q29vcmRpbmF0ZXMoY29vcmRzLCBkcmFnZ2VkVGlsZSk6IGFueTtcclxuICBnZXRUaWxlSW5kZXgodGlsZSk6IGFueTtcclxuICBzd2FwVGlsZXMobW92ZWRUaWxlLCBiZWZvcmVUaWxlKTogYW55O1xyXG4gIHJlbW92ZVRpbGUocmVtb3ZlVGlsZSk6IGFueTtcclxuICB1cGRhdGVUaWxlT3B0aW9ucyhvcHRzKTogYW55O1xyXG59XHJcblxyXG5jb25zdCBNT0JJTEVfTEFZT1VUX0NPTFVNTlMgPSAyO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRpbGVzR3JpZFNlcnZpY2UgaW1wbGVtZW50cyBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgcHVibGljIHRpbGVzOiBhbnk7XHJcbiAgcHVibGljIG9wdHM6IGFueTtcclxuICBwdWJsaWMgY29sdW1uczogYW55O1xyXG4gIHB1YmxpYyBlbGVtOiBhbnk7XHJcbiAgcHVibGljIGdyaWRDZWxsczogYW55ID0gW107XHJcbiAgcHVibGljIGlubGluZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc01vYmlsZUxheW91dDogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pIHtcclxuICAgIHRoaXMudGlsZXMgPSB0aWxlcztcclxuICAgIHRoaXMub3B0cyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLmNvbHVtbnMgPSBjb2x1bW5zIHx8IDA7IC8vIGF2YWlsYWJsZSBjb2x1bW5zIGluIGEgcm93XHJcbiAgICB0aGlzLmVsZW0gPSBlbGVtO1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMgPSBbXTtcclxuICAgIHRoaXMuaW5saW5lID0gb3B0aW9ucy5pbmxpbmUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmlzTW9iaWxlTGF5b3V0ID0gY29sdW1ucyA9PT0gTU9CSUxFX0xBWU9VVF9DT0xVTU5TO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZFRpbGUodGlsZSk6IGFueSB7XHJcbiAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XHJcbiAgICBpZiAodGhpcy50aWxlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdGhpcy5nZW5lcmF0ZUdyaWQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbEJ5UG9zaXRpb24ocm93LCBjb2wpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZENlbGxzW3Jvd11bY29sXTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbHMocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnkge1xyXG4gICAgaWYgKHRoaXMuaXNNb2JpbGVMYXlvdXQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXZhaWxhYmxlQ2VsbHNNb2JpbGUocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55IHtcclxuICAgIGxldCBsZWZ0Q29ybmVyQ2VsbDtcclxuICAgIGxldCByaWdodENvcm5lckNlbGw7XHJcbiAgICBjb25zdCBiYXNpY0NvbCA9IHByZXZDZWxsICYmIHByZXZDZWxsLmNvbCB8fCAwO1xyXG4gICAgY29uc3QgYmFzaWNSb3cgPSB0aGlzLmdldEJhc2ljUm93KHByZXZDZWxsKTtcclxuXHJcbiAgICAvLyBTbWFsbCB0aWxlXHJcbiAgICBpZiAoY29sU3BhbiA9PT0gMSAmJiByb3dTcGFuID09PSAxKSB7XHJcbiAgICAgIGNvbnN0IGdyaWRDb3B5ID0gdGhpcy5ncmlkQ2VsbHMuc2xpY2UoKTtcclxuXHJcbiAgICAgIGlmICghcHJldkNlbGwpIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IGdyaWRDb3B5WzBdWzBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdywgYmFzaWNDb2wsIHRoaXMuY29sdW1ucyk7XHJcblxyXG4gICAgICAgIGlmICghbGVmdENvcm5lckNlbGwpIHtcclxuICAgICAgICAgIGNvbnN0IHJvd1NoaWZ0ID0gdGhpcy5pc01vYmlsZUxheW91dCA/IDEgOiAyO1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93ICsgcm93U2hpZnQsIDAsIHRoaXMuY29sdW1ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWVkaXVtIHRpbGVcclxuICAgIGlmIChjb2xTcGFuID09PSAyICYmIHJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgY29uc3QgcHJldlRpbGVTaXplID0gcHJldkNlbGwgJiYgcHJldkNlbGwuZWxlbS5zaXplIHx8IG51bGw7XHJcblxyXG4gICAgICBpZiAoIXByZXZUaWxlU2l6ZSkge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wpO1xyXG4gICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgIH0gZWxzZSBpZiAocHJldlRpbGVTaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldlRpbGVTaXplLnJvd1NwYW4gPT09IDIpIHtcclxuICAgICAgICBpZiAodGhpcy5jb2x1bW5zIC0gYmFzaWNDb2wgLSAyID4gMCkge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHByZXZUaWxlU2l6ZS5jb2xTcGFuID09PSAyICYmIHByZXZUaWxlU2l6ZS5yb3dTcGFuID09PSAxKSB7XHJcbiAgICAgICAgaWYgKHByZXZDZWxsLnJvdyAlIDIgPT09IDApIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sIC0gMSk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5jb2x1bW5zIC0gYmFzaWNDb2wgLSAzID49IDApIHtcclxuICAgICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpO1xyXG4gICAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAocHJldlRpbGVTaXplLmNvbFNwYW4gPT09IDEgJiYgcHJldlRpbGVTaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAodGhpcy5jb2x1bW5zIC0gYmFzaWNDb2wgLSAzID49IDApIHtcclxuICAgICAgICAgIGlmICh0aGlzLmlzQ2VsbEZyZWUoYmFzaWNSb3csIGJhc2ljQ29sICsgMSkpIHtcclxuICAgICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpO1xyXG4gICAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBCaWcgdGlsZVxyXG4gICAgaWYgKCFwcmV2Q2VsbCAmJiByb3dTcGFuID09PSAyICYmIGNvbFNwYW4gPT09IDIpIHtcclxuICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCk7XHJcbiAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCArIDEpO1xyXG4gICAgfSBlbHNlIGlmIChyb3dTcGFuID09PSAyICYmIGNvbFNwYW4gPT09IDIpIHtcclxuICAgICAgaWYgKHRoaXMuY29sdW1ucyAtIGJhc2ljQ29sIC0gMiA+IDApIHtcclxuICAgICAgICBpZiAodGhpcy5pc0NlbGxGcmVlKGJhc2ljUm93LCBiYXNpY0NvbCArIDEpKSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgKyAyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sICsgMyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAzLCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXJ0OiBsZWZ0Q29ybmVyQ2VsbCxcclxuICAgICAgZW5kOiByaWdodENvcm5lckNlbGxcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldENlbGwoc3JjLCBiYXNpY1JvdywgYmFzaWNDb2wsIGNvbHVtbnMpOiBhbnkge1xyXG4gICAgbGV0IGNlbGwsIGNvbCwgcm93O1xyXG5cclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIC8vIG1vYmlsZSBsYXlvdXRcclxuICAgICAgZm9yIChjb2wgPSBiYXNpY0NvbDsgY29sIDwgY29sdW1uczsgY29sKyspIHtcclxuICAgICAgICBpZiAoIXNyY1tiYXNpY1Jvd11bY29sXS5lbGVtKSB7XHJcbiAgICAgICAgICBjZWxsID0gc3JjW2Jhc2ljUm93XVtjb2xdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gY2VsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZXNrdG9wXHJcbiAgICBmb3IgKGNvbCA9IGJhc2ljQ29sOyBjb2wgPCBjb2x1bW5zOyBjb2wrKykge1xyXG4gICAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IDI7IHJvdysrKSB7XHJcbiAgICAgICAgaWYgKCFzcmNbcm93ICsgYmFzaWNSb3ddW2NvbF0uZWxlbSkge1xyXG4gICAgICAgICAgY2VsbCA9IHNyY1tyb3cgKyBiYXNpY1Jvd11bY29sXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNlbGwpIHtcclxuICAgICAgICByZXR1cm4gY2VsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueSB7XHJcbiAgICBsZXQgbGVmdENvcm5lckNlbGw7XHJcbiAgICBsZXQgcmlnaHRDb3JuZXJDZWxsO1xyXG4gICAgY29uc3QgYmFzaWNSb3cgPSB0aGlzLmdldEJhc2ljUm93KHByZXZDZWxsKTtcclxuICAgIGNvbnN0IGJhc2ljQ29sID0gcHJldkNlbGwgJiYgcHJldkNlbGwuY29sIHx8IDA7XHJcblxyXG5cclxuICAgIGlmIChjb2xTcGFuID09PSAxICYmIHJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgY29uc3QgZ3JpZENvcHkgPSB0aGlzLmdyaWRDZWxscy5zbGljZSgpO1xyXG5cclxuICAgICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gZ3JpZENvcHlbMF1bMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93LCBiYXNpY0NvbCwgdGhpcy5jb2x1bW5zKTtcclxuXHJcbiAgICAgICAgaWYgKCFsZWZ0Q29ybmVyQ2VsbCkge1xyXG4gICAgICAgICAgY29uc3Qgcm93U2hpZnQgPSB0aGlzLmlzTW9iaWxlTGF5b3V0ID8gMSA6IDI7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3cgKyByb3dTaGlmdCwgMCwgdGhpcy5jb2x1bW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXByZXZDZWxsKSB7XHJcbiAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgMCk7XHJcbiAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyByb3dTcGFuIC0gMSwgMSk7XHJcbiAgICB9IGVsc2UgaWYgKGNvbFNwYW4gPT09IDIpIHtcclxuICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgMCk7XHJcbiAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyByb3dTcGFuLCAxKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGFydDogbGVmdENvcm5lckNlbGwsXHJcbiAgICAgIGVuZDogcmlnaHRDb3JuZXJDZWxsXHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRCYXNpY1JvdyhwcmV2Q2VsbCk6IGFueSB7XHJcbiAgICBsZXQgYmFzaWNSb3c7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNNb2JpbGVMYXlvdXQpIHtcclxuICAgICAgaWYgKHByZXZDZWxsKSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5yb3cgfHwgMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBiYXNpY1JvdyA9IDA7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChwcmV2Q2VsbCkge1xyXG4gICAgICAgIGJhc2ljUm93ID0gcHJldkNlbGwucm93ICUgMiA9PT0gMCA/IHByZXZDZWxsLnJvdyA6IHByZXZDZWxsLnJvdyAtIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJhc2ljUm93O1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBpc0NlbGxGcmVlKHJvdywgY29sKTogYW55IHtcclxuICAgIHJldHVybiAhdGhpcy5ncmlkQ2VsbHNbcm93XVtjb2xdLmVsZW07XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldENlbGxJbmRleChzcmNDZWxsKTogYW55IHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgbGV0IGluZGV4O1xyXG5cclxuICAgIHRoaXMuZ3JpZENlbGxzLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcclxuICAgICAgaW5kZXggPSBfLmZpbmRJbmRleChzZWxmLmdyaWRDZWxsc1tyb3dJbmRleF0sIChjZWxsKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGwgPT09IHNyY0NlbGw7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGluZGV4ICE9PSAtMSA/IGluZGV4IDogMDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgcmVzZXJ2ZUNlbGxzKHN0YXJ0LCBlbmQsIGVsZW0pIHtcclxuICAgIHRoaXMuZ3JpZENlbGxzLmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgICByb3cuZm9yRWFjaCgoY2VsbCkgPT4ge1xyXG4gICAgICAgIGlmIChjZWxsLnJvdyA+PSBzdGFydC5yb3cgJiYgY2VsbC5yb3cgPD0gZW5kLnJvdyAmJlxyXG4gICAgICAgICAgY2VsbC5jb2wgPj0gc3RhcnQuY29sICYmIGNlbGwuY29sIDw9IGVuZC5jb2wpIHtcclxuICAgICAgICAgIGNlbGwuZWxlbSA9IGVsZW07XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjbGVhckVsZW1lbnRzKCkge1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgIHJvdy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgdGlsZS5lbGVtID0gbnVsbDtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc2V0QXZhaWxhYmxlQ29sdW1ucyhjb2x1bW5zKTogYW55IHtcclxuICAgIHRoaXMuaXNNb2JpbGVMYXlvdXQgPSBjb2x1bW5zID09PSBNT0JJTEVfTEFZT1VUX0NPTFVNTlM7XHJcbiAgICB0aGlzLmNvbHVtbnMgPSBjb2x1bW5zO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZW5lcmF0ZUdyaWQoc2luZ2xlVGlsZVdpZHRoID8gKTogYW55IHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzLFxyXG4gICAgICB0aWxlV2lkdGggPSBzaW5nbGVUaWxlV2lkdGggfHwgdGhpcy5vcHRzLnRpbGVXaWR0aCxcclxuICAgICAgb2Zmc2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBpcC1kcmFnZ2FibGUtZ3JvdXAtdGl0bGUnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGxldCBjb2xzSW5Sb3cgPSAwLFxyXG4gICAgICByb3dzID0gMCxcclxuICAgICAgZ3JpZEluUm93ID0gW107XHJcblxyXG4gICAgdGhpcy5ncmlkQ2VsbHMgPSBbXTtcclxuXHJcbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUsIGluZGV4LCBzcmNUaWxlcykgPT4ge1xyXG4gICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGUuZ2V0U2l6ZSgpO1xyXG5cclxuICAgICAgZ2VuZXJhdGVDZWxscyh0aWxlU2l6ZS5jb2xTcGFuKTtcclxuXHJcbiAgICAgIGlmIChzcmNUaWxlcy5sZW5ndGggPT09IGluZGV4ICsgMSkge1xyXG4gICAgICAgIGlmIChjb2xzSW5Sb3cgPCBzZWxmLmNvbHVtbnMpIHtcclxuICAgICAgICAgIGdlbmVyYXRlQ2VsbHMoc2VsZi5jb2x1bW5zIC0gY29sc0luUm93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIG1vcmUgY2VsbHMgZm9yIGV4dGVuZHMgdGlsZSBzaXplIHRvIGJpZ1xyXG4gICAgICAgIGlmIChzZWxmLnRpbGVzLmxlbmd0aCAqIDIgPiBzZWxmLmdyaWRDZWxscy5sZW5ndGgpIHtcclxuICAgICAgICAgIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHNlbGYudGlsZXMubGVuZ3RoICogMiAtIHNlbGYuZ3JpZENlbGxzLmxlbmd0aCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgICBnZW5lcmF0ZUNlbGxzKHNlbGYuY29sdW1ucyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlQ2VsbHMobmV3Q2VsbENvdW50KSB7XHJcbiAgICAgIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KG5ld0NlbGxDb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgIGlmIChzZWxmLmNvbHVtbnMgPCBjb2xzSW5Sb3cgKyAxKSB7XHJcbiAgICAgICAgICByb3dzKys7XHJcbiAgICAgICAgICBjb2xzSW5Sb3cgPSAwO1xyXG5cclxuICAgICAgICAgIHNlbGYuZ3JpZENlbGxzLnB1c2goZ3JpZEluUm93KTtcclxuICAgICAgICAgIGdyaWRJblJvdyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRvcCA9IHJvd3MgKiBzZWxmLm9wdHMudGlsZUhlaWdodCArIChyb3dzID8gcm93cyAqIHNlbGYub3B0cy5ndXR0ZXIgOiAwKSArIG9mZnNldC5oZWlnaHQ7XHJcbiAgICAgICAgbGV0IGxlZnQgPSBjb2xzSW5Sb3cgKiB0aWxlV2lkdGggKyAoY29sc0luUm93ID8gY29sc0luUm93ICogc2VsZi5vcHRzLmd1dHRlciA6IDApO1xyXG5cclxuICAgICAgICAvLyBEZXNjcmliZSBncmlkIGNlbGwgc2l6ZSB0aHJvdWdoIGJsb2NrIGNvcm5lcnMgY29vcmRpbmF0ZXNcclxuICAgICAgICBncmlkSW5Sb3cucHVzaCh7XHJcbiAgICAgICAgICB0b3A6IHRvcCxcclxuICAgICAgICAgIGxlZnQ6IGxlZnQsXHJcbiAgICAgICAgICBib3R0b206IHRvcCArIHNlbGYub3B0cy50aWxlSGVpZ2h0LFxyXG4gICAgICAgICAgcmlnaHQ6IGxlZnQgKyB0aWxlV2lkdGgsXHJcbiAgICAgICAgICByb3c6IHJvd3MsXHJcbiAgICAgICAgICBjb2w6IGNvbHNJblJvd1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb2xzSW5Sb3crKztcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKTogYW55IHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgbGV0IGN1cnJJbmRleCA9IDA7XHJcbiAgICBsZXQgcHJldkNlbGw7XHJcblxyXG4gICAgaWYgKG9ubHlQb3NpdGlvbikge1xyXG4gICAgICBzZWxmLmNsZWFyRWxlbWVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgY29uc3QgdGlsZVNpemUgPSB0aWxlLmdldFNpemUoKTtcclxuICAgICAgbGV0IHN0YXJ0Q2VsbDtcclxuICAgICAgbGV0IHdpZHRoO1xyXG4gICAgICBsZXQgaGVpZ2h0O1xyXG4gICAgICBsZXQgY2VsbHM7XHJcblxyXG4gICAgICB0aWxlLnVwZGF0ZUVsZW0oJy5waXAtZHJhZ2dhYmxlLXRpbGUnKTtcclxuICAgICAgaWYgKHRpbGVTaXplLmNvbFNwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAocHJldkNlbGwgJiYgcHJldkNlbGwuZWxlbS5zaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldkNlbGwuZWxlbS5zaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICAgIHN0YXJ0Q2VsbCA9IHNlbGYuZ2V0Q2VsbHMoc2VsZi5nZXRDZWxsQnlQb3NpdGlvbihwcmV2Q2VsbC5yb3csIHByZXZDZWxsLmNvbCAtIDEpLCAxLCAxKS5zdGFydDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhcnRDZWxsID0gc2VsZi5nZXRDZWxscyhwcmV2Q2VsbCwgMSwgMSkuc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIHdpZHRoID0gc3RhcnRDZWxsLnJpZ2h0IC0gc3RhcnRDZWxsLmxlZnQ7XHJcbiAgICAgICAgICBoZWlnaHQgPSBzdGFydENlbGwuYm90dG9tIC0gc3RhcnRDZWxsLnRvcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZXZDZWxsID0gc3RhcnRDZWxsO1xyXG5cclxuICAgICAgICBzZWxmLnJlc2VydmVDZWxscyhzdGFydENlbGwsIHN0YXJ0Q2VsbCwgdGlsZSk7XHJcblxyXG4gICAgICAgIGN1cnJJbmRleCsrO1xyXG4gICAgICB9IGVsc2UgaWYgKHRpbGVTaXplLmNvbFNwYW4gPT09IDIpIHtcclxuICAgICAgICBjZWxscyA9IHNlbGYuZ2V0Q2VsbHMocHJldkNlbGwsIHRpbGVTaXplLnJvd1NwYW4sIHRpbGVTaXplLmNvbFNwYW4pO1xyXG4gICAgICAgIHN0YXJ0Q2VsbCA9IGNlbGxzLnN0YXJ0O1xyXG5cclxuICAgICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgd2lkdGggPSBjZWxscy5lbmQucmlnaHQgLSBjZWxscy5zdGFydC5sZWZ0O1xyXG4gICAgICAgICAgaGVpZ2h0ID0gY2VsbHMuZW5kLmJvdHRvbSAtIGNlbGxzLnN0YXJ0LnRvcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZXZDZWxsID0gY2VsbHMuZW5kO1xyXG5cclxuICAgICAgICBzZWxmLnJlc2VydmVDZWxscyhjZWxscy5zdGFydCwgY2VsbHMuZW5kLCB0aWxlKTtcclxuXHJcbiAgICAgICAgY3VyckluZGV4ICs9IDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbmRlciBwcmV2aWV3XHJcbiAgICAgIC8vIHdoaWxlIHRpbGVzIGZyb20gZ3JvdXAgaXMgZHJhZ2dlZFxyXG4gICAgICBpZiAoZHJhZ2dlZFRpbGUgPT09IHRpbGUpIHtcclxuICAgICAgICB0aWxlLnNldFByZXZpZXdQb3NpdGlvbih7XHJcbiAgICAgICAgICBsZWZ0OiBzdGFydENlbGwubGVmdCxcclxuICAgICAgICAgIHRvcDogc3RhcnRDZWxsLnRvcFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgdGlsZS5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aWxlLnNldFBvc2l0aW9uKHN0YXJ0Q2VsbC5sZWZ0LCBzdGFydENlbGwudG9wKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjYWxjQ29udGFpbmVySGVpZ2h0KCk6IGFueSB7XHJcbiAgICBsZXQgbWF4SGVpZ2h0U2l6ZSwgbWF4V2lkdGhTaXplO1xyXG5cclxuICAgIGlmICghdGhpcy50aWxlcy5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgbWF4SGVpZ2h0U2l6ZSA9IF8ubWF4QnkodGhpcy50aWxlcywgKHRpbGUpID0+IHtcclxuICAgICAgY29uc3QgdGlsZVNpemUgPSB0aWxlWydnZXRTaXplJ10oKTtcclxuICAgICAgcmV0dXJuIHRpbGVTaXplLnRvcCArIHRpbGVTaXplLmhlaWdodDtcclxuICAgIH0pWydnZXRTaXplJ10oKTtcclxuXHJcbiAgICB0aGlzLmVsZW0uc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0U2l6ZS50b3AgKyBtYXhIZWlnaHRTaXplLmhlaWdodCArICdweCc7XHJcblxyXG4gICAgaWYgKHRoaXMuaW5saW5lKSB7XHJcbiAgICAgIG1heFdpZHRoU2l6ZSA9IF8ubWF4QnkodGhpcy50aWxlcywgKHRpbGUpID0+IHtcclxuICAgICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGVbJ2dldFNpemUnXSgpO1xyXG4gICAgICAgIHJldHVybiB0aWxlU2l6ZS5sZWZ0ICsgdGlsZVNpemUud2lkdGg7XHJcbiAgICAgIH0pWydnZXRTaXplJ10oKTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbS5zdHlsZS53aWR0aCA9IG1heFdpZHRoU2l6ZS5sZWZ0ICsgbWF4V2lkdGhTaXplLndpZHRoICsgJ3B4JztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0VGlsZUJ5Tm9kZShub2RlKTogYW55IHtcclxuICAgIGNvbnN0IGZvdW5kVGlsZSA9IHRoaXMudGlsZXMuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgIHJldHVybiBub2RlID09PSB0aWxlLmdldEVsZW0oKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBmb3VuZFRpbGUubGVuZ3RoID8gZm91bmRUaWxlWzBdIDogbnVsbDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0VGlsZUJ5Q29vcmRpbmF0ZXMoY29vcmRzLCBkcmFnZ2VkVGlsZSk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy50aWxlc1xyXG4gICAgICAuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGlsZVNpemUgPSB0aWxlLmdldFNpemUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRpbGUgIT09IGRyYWdnZWRUaWxlICYmXHJcbiAgICAgICAgICB0aWxlU2l6ZS5sZWZ0IDw9IGNvb3Jkcy5sZWZ0ICYmIGNvb3Jkcy5sZWZ0IDw9ICh0aWxlU2l6ZS5sZWZ0ICsgdGlsZVNpemUud2lkdGgpICYmXHJcbiAgICAgICAgICB0aWxlU2l6ZS50b3AgPD0gY29vcmRzLnRvcCAmJiBjb29yZHMudG9wIDw9ICh0aWxlU2l6ZS50b3AgKyB0aWxlU2l6ZS5oZWlnaHQpO1xyXG4gICAgICB9KVswXSB8fCBudWxsO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlSW5kZXgodGlsZSk6IGFueSB7XHJcbiAgICByZXR1cm4gXy5maW5kSW5kZXgodGhpcy50aWxlcywgdGlsZSk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN3YXBUaWxlcyhtb3ZlZFRpbGUsIGJlZm9yZVRpbGUpOiBhbnkge1xyXG4gICAgY29uc3QgbW92ZWRUaWxlSW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCBtb3ZlZFRpbGUpO1xyXG4gICAgY29uc3QgYmVmb3JlVGlsZUluZGV4ID0gXy5maW5kSW5kZXgodGhpcy50aWxlcywgYmVmb3JlVGlsZSk7XHJcblxyXG4gICAgdGhpcy50aWxlcy5zcGxpY2UobW92ZWRUaWxlSW5kZXgsIDEpO1xyXG4gICAgdGhpcy50aWxlcy5zcGxpY2UoYmVmb3JlVGlsZUluZGV4LCAwLCBtb3ZlZFRpbGUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyByZW1vdmVUaWxlKHJlbW92ZVRpbGUpOiBhbnkge1xyXG4gICAgbGV0IGRyb3BwZWRUaWxlO1xyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSwgaW5kZXgsIHRpbGVzKSA9PiB7XHJcbiAgICAgIGlmICh0aWxlID09PSByZW1vdmVUaWxlKSB7XHJcbiAgICAgICAgZHJvcHBlZFRpbGUgPSB0aWxlcy5zcGxpY2UoaW5kZXgsIDEpWzBdO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGRyb3BwZWRUaWxlO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVUaWxlT3B0aW9ucyhvcHRzKTogYW55IHtcclxuICAgIGNvbnN0IGluZGV4ID0gXy5maW5kSW5kZXgodGhpcy50aWxlcywgKHRpbGUpID0+IHtcclxuICAgICAgcmV0dXJuIHRpbGVbJ2dldE9wdGlvbnMnXSgpID09PSBvcHRzO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICB0aGlzLnRpbGVzW2luZGV4XS5zZXRPcHRpb25zKG9wdHMpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfTtcclxufVxyXG5cclxue1xyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERyYWdnYWJsZVRpbGVzR3JvdXAnLCBbXSlcclxuICAgIC5zZXJ2aWNlKCdwaXBUaWxlc0dyaWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pIHtcclxuICAgICAgICBjb25zdCBuZXdHcmlkID0gbmV3IFRpbGVzR3JpZFNlcnZpY2UodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3R3JpZDtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbn0iLCJcclxuY29uc29sZS5sb2coJ2hlcmUgMScpO1xyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEcmFnZ2FibGVUaWxlc0dyb3VwJywgW10pO1xyXG5cclxuY29uc29sZS5sb2coJ3BpcERyYWdnYWJsZVRpbGVzR3JvdXAgZGVmaW5lZCcpO1xyXG5cclxuaW1wb3J0ICcuL1RpbGVHcm91cERpcmVjdGl2ZSc7XHJcbmltcG9ydCAnLi9UaWxlR3JvdXBTZXJ2aWNlJzsiLCJleHBvcnQgaW50ZXJmYWNlIElUaWxlVGVtcGxhdGVTZXJ2aWNlIHtcclxuICAgIGdldFRlbXBsYXRlKHNvdXJjZSwgdHBsID8gLCB0aWxlU2NvcGUgPyAsIHN0cmljdENvbXBpbGUgPyApOiBhbnk7XHJcbiAgICBzZXRJbWFnZU1hcmdpbkNTUygkZWxlbWVudCwgaW1hZ2UpOiB2b2lkO1xyXG59IFxyXG5cclxue1xyXG4gICAgY2xhc3MgdGlsZVRlbXBsYXRlU2VydmljZSBpbXBsZW1lbnRzIElUaWxlVGVtcGxhdGVTZXJ2aWNlIHtcclxuICAgICAgICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICAgICAgICBwcml2YXRlIF8kY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XHJcbiAgICAgICAgcHJpdmF0ZSBfJHRlbXBsYXRlUmVxdWVzdDogYW5ndWxhci5JVGVtcGxhdGVSZXF1ZXN0U2VydmljZTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgICRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXHJcbiAgICAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5fJGludGVycG9sYXRlID0gJGludGVycG9sYXRlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgICAgICAgICB0aGlzLl8kdGVtcGxhdGVSZXF1ZXN0ID0gJHRlbXBsYXRlUmVxdWVzdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55IHtcclxuICAgICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgICAgIHR5cGVcclxuICAgICAgICAgICAgfSA9IHNvdXJjZTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnBvbGF0ZWQgPSB0cGwgPyB0aGlzLl8kaW50ZXJwb2xhdGUodHBsKShzb3VyY2UpIDogdGhpcy5fJGludGVycG9sYXRlKHRlbXBsYXRlKShzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmljdENvbXBpbGUgPT0gdHJ1ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkpIDpcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKHRlbXBsYXRlKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVVcmwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyR0ZW1wbGF0ZVJlcXVlc3QodGVtcGxhdGVVcmwsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaHRtbCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGh0bWwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGxldFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGggPSAkZWxlbWVudC53aWR0aCA/ICRlbGVtZW50LndpZHRoKCkgOiAkZWxlbWVudC5jbGllbnRXaWR0aCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRlbGVtZW50LmhlaWdodCA/ICRlbGVtZW50LmhlaWdodCgpIDogJGVsZW1lbnQuY2xpZW50SGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxXaWR0aCA6IGltYWdlLm5hdHVyYWxXaWR0aCkgfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBpbWFnZUhlaWdodCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlV2lkdGggLyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lckhlaWdodCAtIGNvbnRhaW5lcldpZHRoKSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGltYWdlV2lkdGggKiBjb250YWluZXJIZWlnaHQgLyBpbWFnZUhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlSGVpZ2h0IC8gaW1hZ2VXaWR0aCAqIGNvbnRhaW5lcldpZHRoIC0gY29udGFpbmVySGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWyd3aWR0aCddID0gJycgKyBjb250YWluZXJXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQoaW1hZ2UpLmNzcyhjc3NQYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbWFnZSBsb2FkIGRpcmVjdGl2ZSBUT0RPOiByZW1vdmUgdG8gcGlwSW1hZ2VVdGlsc1xyXG4gICAgY29uc3QgSW1hZ2VMb2FkID0gZnVuY3Rpb24gSW1hZ2VMb2FkKCRwYXJzZTogbmcuSVBhcnNlU2VydmljZSk6IG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnBpcEltYWdlTG9hZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdsb2FkJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcGUsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAgICAgLnNlcnZpY2UoJ3BpcFRpbGVUZW1wbGF0ZScsIHRpbGVUZW1wbGF0ZVNlcnZpY2UpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgncGlwSW1hZ2VMb2FkJywgSW1hZ2VMb2FkKTtcclxufSIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdhZGRfdGlsZV9kaWFsb2cvQWRkVGlsZS5odG1sJyxcbiAgICAnPG1kLWRpYWxvZyBjbGFzcz1cInBpcC1kaWFsb2cgcGlwLWFkZC1jb21wb25lbnQtZGlhbG9nXCI+PG1kLWRpYWxvZy1jb250ZW50IGNsYXNzPVwibGF5b3V0LWNvbHVtblwiPjxkaXYgY2xhc3M9XCJ0aGVtZS1kaXZpZGVyIHAxNiBmbGV4LWF1dG9cIj48aDMgY2xhc3M9XCJoaWRlLXhzIG0wIGJtMTYgdGhlbWUtdGV4dC1wcmltYXJ5XCIgaGlkZS14cz1cIlwiPnt7IFxcJ0RBU0hCT0FSRF9BRERfVElMRV9ESUFMT0dfVElUTEVcXCcgfCB0cmFuc2xhdGUgfX08bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwibGF5b3V0LXJvdyBmbGV4LWF1dG8gbTAgdG0xNlwiPjxtZC1zZWxlY3QgY2xhc3M9XCJmbGV4LWF1dG8gbTAgdGhlbWUtdGV4dC1wcmltYXJ5XCIgbmctbW9kZWw9XCJkaWFsb2dDdHJsLmFjdGl2ZUdyb3VwSW5kZXhcIiBwbGFjZWhvbGRlcj1cInt7IFxcJ0RBU0hCT0FSRF9BRERfVElMRV9ESUFMT0dfQ1JFQVRFX05FV19HUk9VUFxcJyB8IHRyYW5zbGF0ZSB9fVwiIGFyaWEtbGFiZWw9XCJHcm91cFwiPjxtZC1vcHRpb24gbmctdmFsdWU9XCIkaW5kZXhcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiBkaWFsb2dDdHJsLmdyb3Vwc1wiPnt7IGdyb3VwIH19PC9tZC1vcHRpb24+PC9tZC1zZWxlY3Q+PC9tZC1pbnB1dC1jb250YWluZXI+PC9oMz48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWJvZHkgcGlwLXNjcm9sbCBwMCBmbGV4LWF1dG9cIj48cCBjbGFzcz1cIm1kLWJvZHktMSB0aGVtZS10ZXh0LXNlY29uZGFyeSBtMCBscDE2IHJwMTZcIj57eyBcXCdEQVNIQk9BUkRfQUREX1RJTEVfRElBTE9HX1VTRV9IT1RfS0VZU1xcJyB8IHRyYW5zbGF0ZSB9fTwvcD48bWQtbGlzdCBuZy1pbml0PVwiZ3JvdXBJbmRleCA9ICRpbmRleFwiIG5nLXJlcGVhdD1cImdyb3VwIGluIGRpYWxvZ0N0cmwuZGVmYXVsdFdpZGdldHNcIj48bWQtbGlzdC1pdGVtIGNsYXNzPVwibGF5b3V0LXJvdyBwaXAtbGlzdC1pdGVtIGxwMTYgcnAxNlwiIG5nLXJlcGVhdD1cIml0ZW0gaW4gZ3JvdXBcIj48ZGl2IGNsYXNzPVwiaWNvbi1ob2xkZXIgZmxleC1ub25lXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp7ezo6IGl0ZW0uaWNvbiB9fVwiPjwvbWQtaWNvbj48ZGl2IGNsYXNzPVwicGlwLWJhZGdlIHRoZW1lLWJhZGdlIG1kLXdhcm5cIiBuZy1pZj1cIml0ZW0uYW1vdW50XCI+PHNwYW4+e3sgaXRlbS5hbW91bnQgfX08L3NwYW4+PC9kaXY+PC9kaXY+PHNwYW4gY2xhc3M9XCJmbGV4LWF1dG8gbG0yNCB0aGVtZS10ZXh0LXByaW1hcnlcIj57ezo6IGl0ZW0udGl0bGUgfX08L3NwYW4+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5lbmNyZWFzZShncm91cEluZGV4LCAkaW5kZXgpXCIgYXJpYS1sYWJlbD1cIkVuY3JlYXNlXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzLWNpcmNsZVwiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lXCIgbmctY2xpY2s9XCJkaWFsb2dDdHJsLmRlY3JlYXNlKGdyb3VwSW5kZXgsICRpbmRleClcIiBhcmlhLWxhYmVsPVwiRGVjcmVhc2VcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOm1pbnVzLWNpcmNsZVwiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48L21kLWxpc3QtaXRlbT48bWQtZGl2aWRlciBjbGFzcz1cImxtNzIgdG04IGJtOFwiIG5nLWlmPVwiZ3JvdXBJbmRleCAhPT0gKGRpYWxvZ0N0cmwuZGVmYXVsdFdpZGdldHMubGVuZ3RoIC0gMSlcIj48L21kLWRpdmlkZXI+PC9tZC1saXN0PjwvZGl2PjwvbWQtZGlhbG9nLWNvbnRlbnQ+PG1kLWRpYWxvZy1hY3Rpb25zIGNsYXNzPVwiZmxleC1ub25lIGxheW91dC1hbGlnbi1lbmQtY2VudGVyIHRoZW1lLWRpdmlkZXIgZGl2aWRlci10b3AgdGhlbWUtdGV4dC1wcmltYXJ5XCI+PG1kLWJ1dHRvbiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuY2FuY2VsKClcIiBhcmlhLWxhYmVsPVwiQ2FuY2VsXCI+e3sgXFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuYWRkKClcIiBuZy1kaXNhYmxlZD1cImRpYWxvZ0N0cmwudG90YWxXaWRnZXRzID09PSAwXCIgYXJpYWwtbGFiZWw9XCJBZGRcIj57eyBcXCdBRERcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj48L21kLWRpYWxvZy1hY3Rpb25zPjwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2NhbGVuZGFyX3RpbGUvQ2FsZW5kYXJUaWxlLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtY2FsZW5kYXItd2lkZ2V0IHt7ICRjdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGwgdHAwXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIG1lZGl1bTogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCI+PGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXIgZmxleC1ub25lXCI+PHBpcC1tZW51LXdpZGdldD48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPjxzcGFuIGNsYXNzPVwiZGF0ZSBsbTI0IHJtMTJcIj57eyAkY3RybC5vcHRpb25zLmRhdGUuZ2V0RGF0ZSgpIH19PC9zcGFuPjxkaXYgY2xhc3M9XCJmbGV4LWF1dG8gbGF5b3V0LWNvbHVtblwiPjxzcGFuIGNsYXNzPVwid2Vla2RheSBtZC1oZWFkbGluZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwibW9udGgteWVhciBtZC1oZWFkbGluZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdNb250aCB9fSB7eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRZZWFyIH19PC9zcGFuPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3BhY2UtYXJvdW5kLWNlbnRlclwiIG5nLWhpZGU9XCIkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDFcIj48c3BhbiBjbGFzcz1cIndlZWtkYXkgbWQtaGVhZGxpbmVcIiBuZy1oaWRlPVwiJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJ3ZWVrZGF5XCIgbmctc2hvdz1cIiRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwiZGF0ZSBsbTEyIHJtMTJcIj57eyAkY3RybC5vcHRpb25zLmRhdGUuZ2V0RGF0ZSgpIH19PC9zcGFuPiA8c3BhbiBjbGFzcz1cIm1vbnRoLXllYXIgbWQtaGVhZGxpbmVcIj57eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRMb25nTW9udGggfX0ge3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0WWVhciB9fTwvc3Bhbj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdjYWxlbmRhcl90aWxlL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaCBibTE2XCI+RGF0ZTo8bWQtZGF0ZXBpY2tlciBuZy1tb2RlbD1cIiRjdHJsLmRhdGVcIiBjbGFzcz1cInctc3RyZXRjaFwiPjwvbWQtZGF0ZXBpY2tlcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdjb25maWdfdGlsZV9kaWFsb2cvQ29uZmlnRGlhbG9nLmh0bWwnLFxuICAgICc8bWQtZGlhbG9nIGNsYXNzPVwicGlwLWRpYWxvZyBwaXAtdGlsZS1jb25maWctZGlhbG9nIHt7IHZtLnBhcmFtcy5kaWFsb2dDbGFzcyB9fVwiIHdpZHRoPVwiNDAwXCIgbWQtdGhlbWU9XCJ7e3ZtLnRoZW1lfX1cIj48cGlwLXRpbGUtY29uZmlnLWV4dGVuZC1jb21wb25lbnQgY2xhc3M9XCJsYXlvdXQtY29sdW1uXCIgcGlwLWRpYWxvZy1zY29wZT1cInZtXCIgcGlwLWV4dGVuc2lvbi11cmw9XCJ2bS5leHRlbnNpb25VcmxcIiBwaXAtYXBwbHk9XCJ2bS5vbkFwcGx5KHVwZGF0ZWREYXRhKVwiPjwvcGlwLXRpbGUtY29uZmlnLWV4dGVuZC1jb21wb25lbnQ+PC9tZC1kaWFsb2c+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudC5odG1sJyxcbiAgICAnPGgzIGNsYXNzPVwidG0wIGZsZXgtbm9uZVwiPnt7IFxcJ0RBU0hCT0FSRF9USUxFX0NPTkZJR19ESUFMT0dfVElUTEVcXCcgfCB0cmFuc2xhdGUgfX08L2gzPjxkaXYgY2xhc3M9XCJwaXAtYm9keSBwaXAtc2Nyb2xsIHAxNiBicDAgZmxleC1hdXRvXCI+PHBpcC1leHRlbnNpb24tcG9pbnQ+PC9waXAtZXh0ZW5zaW9uLXBvaW50PjxwaXAtdG9nZ2xlLWJ1dHRvbnMgY2xhc3M9XCJibTE2XCIgbmctaWY9XCIhJGN0cmwuaGlkZVNpemVzXCIgcGlwLWJ1dHRvbnM9XCIkY3RybC5zaXplc1wiIG5nLW1vZGVsPVwiJGN0cmwuc2l6ZUlkXCI+PC9waXAtdG9nZ2xlLWJ1dHRvbnM+PHBpcC1jb2xvci1waWNrZXIgbmctaWY9XCIhJGN0cmwuaGlkZUNvbG9yc1wiIHBpcC1jb2xvcnM9XCIkY3RybC5jb2xvcnNcIiBuZy1tb2RlbD1cIiRjdHJsLmNvbG9yXCI+PC9waXAtY29sb3ItcGlja2VyPjwvZGl2PjxkaXYgY2xhc3M9XCJwaXAtZm9vdGVyIGZsZXgtbm9uZVwiPjxkaXY+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25DYW5jZWwoKVwiPnt7IFxcJ0NBTkNFTFxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uQXBwbHkoKVwiPnt7IFxcJ0FQUExZXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZGFzaGJvYXJkL0Rhc2hib2FyZC5odG1sJyxcbiAgICAnPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudCBtZC1yYWlzZWQgbWQtZmFiIGxheW91dC1jb2x1bW4gbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBhcmlhLWxhYmVsPVwiQWRkIGNvbXBvbmVudFwiIG5nLWNsaWNrPVwiJGN0cmwuYWRkQ29tcG9uZW50KClcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXNcIiBjbGFzcz1cIm1kLWhlYWRsaW5lIGNlbnRlcmVkLWFkZC1pY29uXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWdyaWQtaG9sZGVyXCI+PHBpcC1kcmFnZ2FibGUtZ3JpZCBwaXAtdGlsZXMtdGVtcGxhdGVzPVwiJGN0cmwuZ3JvdXBlZFdpZGdldHNcIiBwaXAtdGlsZXMtY29udGV4dD1cIiRjdHJsLndpZGdldHNDb250ZXh0XCIgcGlwLWRyYWdnYWJsZS1ncmlkPVwiJGN0cmwuZHJhZ2dhYmxlR3JpZE9wdGlvbnNcIiBwaXAtZ3JvdXAtbWVudS1hY3Rpb25zPVwiJGN0cmwuZ3JvdXBNZW51QWN0aW9uc1wiPjwvcGlwLWRyYWdnYWJsZS1ncmlkPjxtZC1wcm9ncmVzcy1jaXJjdWxhciBtZC1tb2RlPVwiaW5kZXRlcm1pbmF0ZVwiIGNsYXNzPVwicHJvZ3Jlc3MtcmluZ1wiPjwvbWQtcHJvZ3Jlc3MtY2lyY3VsYXI+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZHJhZ2dhYmxlL0RyYWdnYWJsZS5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtaG9sZGVyXCI+PGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXBcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiAkY3RybC5ncm91cHNcIiBkYXRhLWdyb3VwLWlkPVwie3sgJGluZGV4IH19XCIgcGlwLWRyYWdnYWJsZS10aWxlcz1cImdyb3VwLnNvdXJjZVwiPjxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWdyb3VwLXRpdGxlIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlclwiPjxkaXYgY2xhc3M9XCJ0aXRsZS1pbnB1dC1jb250YWluZXJcIiBuZy1jbGljaz1cIiRjdHJsLm9uVGl0bGVDbGljayhncm91cCwgJGV2ZW50KVwiPjxpbnB1dCBuZy1pZj1cImdyb3VwLmVkaXRpbmdOYW1lXCIgbmctYmx1cj1cIiRjdHJsLm9uQmx1clRpdGxlSW5wdXQoZ3JvdXApXCIgbmcta2V5cHJlc3M9XCIkY3RybC5vbkt5ZXByZXNzVGl0bGVJbnB1dChncm91cCwgJGV2ZW50KVwiIG5nLW1vZGVsPVwiZ3JvdXAudGl0bGVcIj48ZGl2IGNsYXNzPVwidGV4dC1vdmVyZmxvdyBmbGV4LW5vbmVcIiBuZy1pZj1cIiFncm91cC5lZGl0aW5nTmFtZVwiPnt7IGdyb3VwLnRpdGxlIH19PC9kaXY+PC9kaXY+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLXNob3c9XCJncm91cC5lZGl0aW5nTmFtZVwiIG5nLWNsaWNrPVwiJGN0cmwuY2FuY2VsRWRpdGluZyhncm91cClcIiBhcmlhLWxhYmVsPVwiQ2FuY2VsXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpjcm9zc1wiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtbWVudSBjbGFzcz1cImZsZXgtbm9uZSBsYXlvdXQtY29sdW1uXCIgbWQtcG9zaXRpb24tbW9kZT1cInRhcmdldC1yaWdodCB0YXJnZXRcIiBuZy1zaG93PVwiIWdyb3VwLmVkaXRpbmdOYW1lXCI+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLWNsaWNrPVwiJG1kT3Blbk1lbnUoKTsgZ3JvdXBJZCA9ICRpbmRleFwiIGFyaWEtbGFiZWw9XCJNZW51XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpkb3RzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1tZW51LWNvbnRlbnQgd2lkdGg9XCI0XCI+PG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJhY3Rpb24gaW4gJGN0cmwuZ3JvdXBNZW51QWN0aW9uc1wiPjxtZC1idXR0b24gbmctY2xpY2s9XCJhY3Rpb24uY2FsbGJhY2soZ3JvdXBJZClcIj57eyBhY3Rpb24udGl0bGUgfX08L21kLWJ1dHRvbj48L21kLW1lbnUtaXRlbT48L21kLW1lbnUtY29udGVudD48L21kLW1lbnU+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXAgZmljdC1ncm91cCBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlciBsYXlvdXQtY29sdW1uIHRtMTZcIj48ZGl2IGNsYXNzPVwiZmljdC1ncm91cC10ZXh0LWNvbnRhaW5lclwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1c1wiPjwvbWQtaWNvbj57eyBcXCdEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVBcXCcgfCB0cmFuc2xhdGUgfX08L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdldmVudF90aWxlL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+PGxhYmVsPlRpdGxlOjwvbGFiZWw+IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGl0bGVcIj48L21kLWlucHV0LWNvbnRhaW5lcj5EYXRlOjxtZC1kYXRlcGlja2VyIG5nLW1vZGVsPVwiJGN0cmwuZGF0ZVwiIGNsYXNzPVwidy1zdHJldGNoIGJtOFwiPjwvbWQtZGF0ZXBpY2tlcj48bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoXCI+PGxhYmVsPkRlc2NyaXB0aW9uOjwvbGFiZWw+IDx0ZXh0YXJlYSB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGV4dFwiPlxcbicgK1xuICAgICcgICAgPC90ZXh0YXJlYT48L21kLWlucHV0LWNvbnRhaW5lcj5CYWNrZHJvcFxcJ3Mgb3BhY2l0eTo8bWQtc2xpZGVyIGFyaWEtbGFiZWw9XCJvcGFjaXR5XCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIjAuMVwiIG1heD1cIjAuOVwiIHN0ZXA9XCIwLjAxXCIgbmctbW9kZWw9XCIkY3RybC5vcGFjaXR5XCIgbmctY2hhbmdlPVwiJGN0cmwub25PcGFjaXR5dGVzdCgkY3RybC5vcGFjaXR5KVwiPjwvbWQtc2xpZGVyPjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2V2ZW50X3RpbGUvRXZlbnRUaWxlLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtZXZlbnQtd2lkZ2V0IHt7ICRjdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIiBuZy1jbGFzcz1cInsgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIGJpZzogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIj48aW1nIG5nLWlmPVwiJGN0cmwub3B0aW9ucy5pbWFnZVwiIG5nLXNyYz1cInt7JGN0cmwub3B0aW9ucy5pbWFnZX19XCIgYWx0PVwie3skY3RybC5vcHRpb25zLnRpdGxlIHx8ICRjdHJsLm9wdGlvbnMubmFtZX19XCI+PGRpdiBjbGFzcz1cInRleHQtYmFja2Ryb3BcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwge3sgJGN0cmwub3BhY2l0eSB9fSlcIj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiPjxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgJGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWUgfX08L3NwYW4+PHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+PC9kaXY+PGRpdiBjbGFzcz1cInRleHQtY29udGFpbmVyIGZsZXgtYXV0byBwaXAtc2Nyb2xsXCI+PHAgY2xhc3M9XCJkYXRlIGZsZXgtbm9uZVwiIG5nLWlmPVwiJGN0cmwub3B0aW9ucy5kYXRlXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0U2hvcnREYXRlIH19PC9wPjxwIGNsYXNzPVwidGV4dCBmbGV4LWF1dG9cIj57eyAkY3RybC5vcHRpb25zLnRleHQgfHwgJGN0cmwub3B0aW9ucy5kZXNjcmlwdGlvbiB9fTwvcD48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdtZW51X3RpbGUvTWVudVRpbGUuaHRtbCcsXG4gICAgJzxtZC1tZW51IGNsYXNzPVwid2lkZ2V0LW1lbnVcIiBtZC1wb3NpdGlvbi1tb2RlPVwidGFyZ2V0LXJpZ2h0IHRhcmdldFwiPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmVcIiBuZy1jbGljaz1cIiRtZE9wZW5NZW51KClcIiBhcmlhLWxhYmVsPVwiTWVudVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6dmRvdHNcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLW1lbnUtY29udGVudCB3aWR0aD1cIjRcIj48bWQtbWVudS1pdGVtIG5nLXJlcGVhdD1cIml0ZW0gaW4gJGN0cmwubWVudVwiPjxtZC1idXR0b24gbmctaWY9XCIhaXRlbS5zdWJtZW51XCIgbmctY2xpY2s9XCIkY3RybC5jYWxsQWN0aW9uKGl0ZW0uYWN0aW9uLCBpdGVtLnBhcmFtcywgaXRlbSlcIj57ezo6IGl0ZW0udGl0bGUgfX08L21kLWJ1dHRvbj48bWQtbWVudSBuZy1pZj1cIml0ZW0uc3VibWVudVwiPjxtZC1idXR0b24gbmctY2xpY2s9XCIkY3RybC5jYWxsQWN0aW9uKGl0ZW0uYWN0aW9uKVwiPnt7OjogaXRlbS50aXRsZSB9fTwvbWQtYnV0dG9uPjxtZC1tZW51LWNvbnRlbnQ+PG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJzdWJpdGVtIGluIGl0ZW0uc3VibWVudVwiPjxtZC1idXR0b24gbmctY2xpY2s9XCIkY3RybC5jYWxsQWN0aW9uKHN1Yml0ZW0uYWN0aW9uLCBzdWJpdGVtLnBhcmFtcywgc3ViaXRlbSlcIj57ezo6IHN1Yml0ZW0udGl0bGUgfX08L21kLWJ1dHRvbj48L21kLW1lbnUtaXRlbT48L21kLW1lbnUtY29udGVudD48L21kLW1lbnU+PC9tZC1tZW51LWl0ZW0+PC9tZC1tZW51LWNvbnRlbnQ+PC9tZC1tZW51PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ25vdGVfdGlsZS9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2hcIj48bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIGJtMFwiPjxsYWJlbD5UaXRsZTo8L2xhYmVsPiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLnRpdGxlXCI+PC9tZC1pbnB1dC1jb250YWluZXI+PG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCB0bTBcIj48bGFiZWw+VGV4dDo8L2xhYmVsPiA8dGV4dGFyZWEgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLnRleHRcIj5cXG4nICtcbiAgICAnICAgIDwvdGV4dGFyZWE+PC9tZC1pbnB1dC1jb250YWluZXI+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbm90ZV90aWxlL05vdGVUaWxlLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtbm90ZXMtd2lkZ2V0IHt7ICRjdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW5cIj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiIG5nLWlmPVwiJGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWVcIj48c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPjwvZGl2PjxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PjxkaXYgY2xhc3M9XCJ0ZXh0LWNvbnRhaW5lciBmbGV4LWF1dG8gcGlwLXNjcm9sbFwiPjxwPnt7ICRjdHJsLm9wdGlvbnMudGV4dCB9fTwvcD48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdwb3NpdGlvbl90aWxlL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+PGxhYmVsPkxvY2F0aW9uIG5hbWU6PC9sYWJlbD4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC5sb2NhdGlvbk5hbWVcIj48L21kLWlucHV0LWNvbnRhaW5lcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdwb3NpdGlvbl90aWxlL1Bvc2l0aW9uVGlsZS5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1wb3NpdGlvbi13aWRnZXQgd2lkZ2V0LWJveCBwMCBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIG1lZGl1bTogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCIgaW5kZXg9XCJ7eyAkY3RybC5pbmRleCB9fVwiIGdyb3VwPVwie3sgJGN0cmwuZ3JvdXAgfX1cIj48ZGl2IGNsYXNzPVwicG9zaXRpb24tYWJzb2x1dGUtcmlnaHQtdG9wXCIgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5sb2NhdGlvbk5hbWVcIj48cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbHAxNiBycDggbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lXCI+PHNwYW4gY2xhc3M9XCJmbGV4IHRleHQtb3ZlcmZsb3dcIj57eyAkY3RybC5vcHRpb25zLmxvY2F0aW9uTmFtZSB9fTwvc3Bhbj48cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48cGlwLWxvY2F0aW9uLW1hcCBjbGFzcz1cImZsZXhcIiBuZy1pZj1cIiRjdHJsLnNob3dQb3NpdGlvblwiIHBpcC1zdHJldGNoPVwidHJ1ZVwiIHBpcC1yZWJpbmQ9XCJ0cnVlXCIgcGlwLWxvY2F0aW9uLXBvcz1cIiRjdHJsLm9wdGlvbnMubG9jYXRpb25cIj48L3BpcC1sb2NhdGlvbi1tYXA+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgncGljdHVyZV9zbGlkZXJfdGlsZS9QaWN0dXJlU2xpZGVyVGlsZS5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLXBpY3R1cmUtc2xpZGVyLXdpZGdldCB7eyAkY3RybC5jb2xvciB9fSBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIG1lZGl1bTogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCIgaW5kZXg9XCJ7eyAkY3RybC5pbmRleCB9fVwiIGdyb3VwPVwie3sgJGN0cmwuZ3JvdXAgfX1cIj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbHAxNiBycDggbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIj48c3BhbiBjbGFzcz1cImZsZXggdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfX08L3NwYW4+PHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+PC9kaXY+PGRpdiBjbGFzcz1cInNsaWRlci1jb250YWluZXJcIj48ZGl2IHBpcC1pbWFnZS1zbGlkZXI9XCJcIiBwaXAtYW5pbWF0aW9uLXR5cGU9XCJcXCdmYWRpbmdcXCdcIiBwaXAtYW5pbWF0aW9uLWludGVydmFsPVwiJGN0cmwuYW5pbWF0aW9uSW50ZXJ2YWxcIiBuZy1pZj1cIiRjdHJsLmFuaW1hdGlvblR5cGUgPT0gXFwnZmFkaW5nXFwnXCI+PGRpdiBjbGFzcz1cInBpcC1hbmltYXRpb24tYmxvY2tcIiBuZy1yZXBlYXQ9XCJzbGlkZSBpbiAkY3RybC5vcHRpb25zLnNsaWRlc1wiPjxpbWcgbmctc3JjPVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBhbHQ9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIHBpcC1pbWFnZS1sb2FkPVwiJGN0cmwub25JbWFnZUxvYWQoJGV2ZW50KVwiPjxwIGNsYXNzPVwic2xpZGUtdGV4dFwiIG5nLWlmPVwic2xpZGUudGV4dFwiPnt7IHNsaWRlLnRleHQgfX08L3A+PC9kaXY+PC9kaXY+PGRpdiBwaXAtaW1hZ2Utc2xpZGVyPVwiXCIgcGlwLWFuaW1hdGlvbi10eXBlPVwiXFwnY2Fyb3VzZWxcXCdcIiBwaXAtYW5pbWF0aW9uLWludGVydmFsPVwiJGN0cmwuYW5pbWF0aW9uSW50ZXJ2YWxcIiBuZy1pZj1cIiRjdHJsLmFuaW1hdGlvblR5cGUgPT0gXFwnY2Fyb3VzZWxcXCdcIj48ZGl2IGNsYXNzPVwicGlwLWFuaW1hdGlvbi1ibG9ja1wiIG5nLXJlcGVhdD1cInNsaWRlIGluICRjdHJsLm9wdGlvbnMuc2xpZGVzXCI+PGltZyBuZy1zcmM9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIGFsdD1cInt7IHNsaWRlLmltYWdlIH19XCIgcGlwLWltYWdlLWxvYWQ9XCIkY3RybC5vbkltYWdlTG9hZCgkZXZlbnQpXCI+PHAgY2xhc3M9XCJzbGlkZS10ZXh0XCIgbmctaWY9XCJzbGlkZS50ZXh0XCI+e3sgc2xpZGUudGV4dCB9fTwvcD48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdzdGF0aXN0aWNzX3RpbGUvU3RhdGlzdGljc1RpbGUuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1zdGF0aXN0aWNzLXdpZGdldCBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIG1lZGl1bTogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCI+PGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBmbGV4LW5vbmVcIj48c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPjxwaXAtbWVudS13aWRnZXQ+PC9waXAtbWVudS13aWRnZXQ+PC9kaXY+PGRpdiBjbGFzcz1cIndpZGdldC1jb250ZW50IGZsZXgtYXV0byBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgbmctaWY9XCIkY3RybC5vcHRpb25zLnNlcmllcyAmJiAhJGN0cmwucmVzZXRcIj48cGlwLXBpZS1jaGFydCBwaXAtc2VyaWVzPVwiJGN0cmwub3B0aW9ucy5zZXJpZXNcIiBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmNoYXJ0VHlwZSB8fCAkY3RybC5vcHRpb25zLmNoYXJ0VHlwZSA9PSBcXCdwaWVcXCdcIiBwaXAtZG9udXQ9XCJ0cnVlXCIgcGlwLXBpZS1zaXplPVwiJGN0cmwuY2hhcnRTaXplXCIgcGlwLXNob3ctdG90YWw9XCJ0cnVlXCIgcGlwLWNlbnRlcmVkPVwidHJ1ZVwiPjwvcGlwLXBpZS1jaGFydD48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1kYXNoYm9hcmQtaHRtbC5taW4uanMubWFwXG4iXX0=