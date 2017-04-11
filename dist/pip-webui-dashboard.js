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
            this._includeTpl = '<pip-{{ type }}-tile group="groupIndex" index="index"' +
                'pip-options="$parent.$ctrl.groupedWidgets[groupIndex][\'source\'][index].opts">' +
                '</pip-{{ type }}-tile>';
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
    var TileMenu = function () {
        return {
            restrict: 'EA',
            templateUrl: 'menu_tile/MenuTile.html'
        };
    };
    angular
        .module('pipMenuTile')
        .directive('pipTileMenu', TileMenu);
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
        function StatisticsTileController($scope, $timeout) {
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
    function DraggableTiles() {
        return {
            restrict: 'A',
            link: function ($scope, $elem, $attr) {
                new DraggableTileLink($scope, $elem, $attr);
            }
        };
    }
    angular
        .module('pipDraggableTilesGroup')
        .directive('pipDraggableTiles', DraggableTiles);
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
angular
    .module('pipDraggableTilesGroup')
    .service('pipTilesGrid', function () {
    return function (tiles, options, columns, elem) {
        var newGrid = new TilesGridService(tiles, options, columns, elem);
        return newGrid;
    };
});
},{}],25:[function(require,module,exports){
"use strict";
angular
    .module('pipDraggableTilesGroup', []);
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
  $templateCache.put('calendar_tile/CalendarTile.html',
    '<div class="widget-box pip-calendar-widget {{ $ctrl.color }} layout-column layout-fill tp0" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }"><div class="widget-heading layout-row layout-align-end-center flex-none"><pip-tile-menu></pip-tile-menu></div><div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="$ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1"><span class="date lm24 rm12">{{ $ctrl.options.date.getDate() }}</span><div class="flex-auto layout-column"><span class="weekday md-headline">{{ $ctrl.options.date | formatLongDayOfWeek }}</span> <span class="month-year md-headline">{{ $ctrl.options.date | formatLongMonth }} {{ $ctrl.options.date | formatYear }}</span></div></div><div class="widget-content flex-auto layout-column layout-align-space-around-center" ng-hide="$ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1"><span class="weekday md-headline" ng-hide="$ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1">{{ $ctrl.options.date | formatLongDayOfWeek }}</span> <span class="weekday" ng-show="$ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1">{{ $ctrl.options.date | formatLongDayOfWeek }}</span> <span class="date lm12 rm12">{{ $ctrl.options.date.getDate() }}</span> <span class="month-year md-headline">{{ $ctrl.options.date | formatLongMonth }} {{ $ctrl.options.date | formatYear }}</span></div></div>');
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
    '<div class="widget-box pip-event-widget {{ $ctrl.color }} layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }"><img ng-if="$ctrl.options.image" ng-src="{{$ctrl.options.image}}" alt="{{$ctrl.options.title || $ctrl.options.name}}"><div class="text-backdrop" style="background-color: rgba(0, 0, 0, {{ $ctrl.opacity }})"><div class="widget-heading layout-row layout-align-start-center flex-none"><span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span><pip-tile-menu ng-if="!$ctrl.options.hideMenu"></pip-tile-menu></div><div class="text-container flex-auto pip-scroll"><p class="date flex-none" ng-if="$ctrl.options.date">{{ $ctrl.options.date | formatShortDate }}</p><p class="text flex-auto">{{ $ctrl.options.text || $ctrl.options.description }}</p></div></div></div>');
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
    '<div class="widget-box pip-notes-widget {{ $ctrl.color }} layout-column"><div class="widget-heading layout-row layout-align-start-center flex-none" ng-if="$ctrl.options.title || $ctrl.options.name"><span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span></div><pip-tile-menu ng-if="!$ctrl.options.hideMenu"></pip-tile-menu><div class="text-container flex-auto pip-scroll"><p>{{ $ctrl.options.text }}</p></div></div>');
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
  $templateCache.put('picture_slider_tile/PictureSliderTile.html',
    '<div class="widget-box pip-picture-slider-widget {{ $ctrl.color }} layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }" index="{{ $ctrl.index }}" group="{{ $ctrl.group }}"><div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none"><span class="flex text-overflow">{{ $ctrl.options.title }}</span><pip-tile-menu ng-if="!$ctrl.options.hideMenu"></pip-tile-menu></div><div class="slider-container"><div pip-image-slider="" pip-animation-type="\'fading\'" pip-animation-interval="$ctrl.animationInterval" ng-if="$ctrl.animationType == \'fading\'"><div class="pip-animation-block" ng-repeat="slide in $ctrl.options.slides"><img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="$ctrl.onImageLoad($event)"><p class="slide-text" ng-if="slide.text">{{ slide.text }}</p></div></div><div pip-image-slider="" pip-animation-type="\'carousel\'" pip-animation-interval="$ctrl.animationInterval" ng-if="$ctrl.animationType == \'carousel\'"><div class="pip-animation-block" ng-repeat="slide in $ctrl.options.slides"><img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="$ctrl.onImageLoad($event)"><p class="slide-text" ng-if="slide.text">{{ slide.text }}</p></div></div></div></div>');
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
    '<div class="pip-position-widget widget-box p0 layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }" index="{{ $ctrl.index }}" group="{{ $ctrl.group }}"><div class="position-absolute-right-top" ng-if="!$ctrl.options.locationName"><pip-tile-menu ng-if="!$ctrl.options.hideMenu"></pip-tile-menu></div><div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none" ng-if="$ctrl.options.locationName"><span class="flex text-overflow">{{ $ctrl.options.locationName }}</span><pip-tile-menu ng-if="!$ctrl.options.hideMenu"></pip-tile-menu></div><pip-location-map class="flex" ng-if="$ctrl.showPosition" pip-stretch="true" pip-rebind="true" pip-location-pos="$ctrl.options.location"></pip-location-map></div>');
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
    '<div class="widget-box pip-statistics-widget layout-column layout-fill" ng-class="{ small: $ctrl.options.size.colSpan == 1 && $ctrl.options.size.rowSpan == 1, medium: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 1, big: $ctrl.options.size.colSpan == 2 && $ctrl.options.size.rowSpan == 2 }"><div class="widget-heading layout-row layout-align-start-center flex-none"><span class="widget-title flex-auto text-overflow">{{ $ctrl.options.title || $ctrl.options.name }}</span><pip-tile-menu></pip-tile-menu></div><div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="$ctrl.options.series && !$ctrl.reset"><pip-pie-chart pip-series="$ctrl.options.series" ng-if="!$ctrl.options.chartType || $ctrl.options.chartType == \'pie\'" pip-donut="true" pip-pie-size="$ctrl.chartSize" pip-show-total="true" pip-centered="true"></pip-pie-chart></div></div>');
}]);
})();



},{}]},{},[15,27])(27)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRkX3RpbGVfZGlhbG9nL0FkZFRpbGVEaWFsb2dDb250cm9sbGVyLnRzIiwic3JjL2FkZF90aWxlX2RpYWxvZy9BZGRUaWxlUHJvdmlkZXIudHMiLCJzcmMvYWRkX3RpbGVfZGlhbG9nL2luZGV4LnRzIiwic3JjL2NhbGVuZGFyX3RpbGUvQ2FsZW5kYXJUaWxlLnRzIiwic3JjL2NvbW1vbl90aWxlL1RpbGUudHMiLCJzcmMvY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXIudHMiLCJzcmMvY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudC50cyIsInNyYy9jb25maWdfdGlsZV9kaWFsb2cvQ29uZmlnRGlhbG9nU2VydmljZS50cyIsInNyYy9jb25maWdfdGlsZV9kaWFsb2cvaW5kZXgudHMiLCJzcmMvZGFzaGJvYXJkL0Rhc2hib2FyZC50cyIsInNyYy9kcmFnZ2FibGUvRHJhZ2dhYmxlLnRzIiwic3JjL2RyYWdnYWJsZS9EcmFnZ2FibGVUaWxlU2VydmljZS50cyIsInNyYy9kcmFnZ2FibGUvaW5kZXgudHMiLCJzcmMvZXZlbnRfdGlsZS9FdmVudFRpbGUudHMiLCJzcmMvaW5kZXgudHMiLCJzcmMvbWVudV90aWxlL01lbnVUaWxlRGlyZWN0aXZlLnRzIiwic3JjL21lbnVfdGlsZS9NZW51VGlsZVNlcnZpY2UudHMiLCJzcmMvbWVudV90aWxlL2luZGV4LnRzIiwic3JjL25vdGVfdGlsZS9Ob3RlVGlsZS50cyIsInNyYy9waWN0dXJlX3NsaWRlcl90aWxlL1BpY3R1cmVTbGlkZXJUaWxlLnRzIiwic3JjL3Bvc2l0aW9uX3RpbGUvUG9zaXRpb25UaWxlLnRzIiwic3JjL3N0YXRpc3RpY3NfdGlsZS9TdGF0aXN0aWNzVGlsZS50cyIsInNyYy90aWxlX2dyb3VwL1RpbGVHcm91cERpcmVjdGl2ZS50cyIsInNyYy90aWxlX2dyb3VwL1RpbGVHcm91cFNlcnZpY2UudHMiLCJzcmMvdGlsZV9ncm91cC9pbmRleC50cyIsInNyYy91dGlsaXR5L1RpbGVUZW1wbGF0ZVV0aWxpdHkudHMiLCJ0ZW1wL3BpcC13ZWJ1aS1kYXNoYm9hcmQtaHRtbC5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7SUFBQTtJQUtBLENBQUM7SUFBRCxvQkFBQztBQUFELENBTEEsQUFLQyxJQUFBO0FBTFksc0NBQWE7QUFPMUI7SUFLSSxpQ0FDSSxNQUFXLEVBQ0osZ0JBQXdCLEVBQy9CLFVBQTZCLEVBQ3RCLFNBQTBDO1FBRjFDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUTtRQUV4QixjQUFTLEdBQVQsU0FBUyxDQUFpQztRQU45QyxlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBUTFCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0scUNBQUcsR0FBVjtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2hCLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ2pDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtTQUM3QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQUEsQ0FBQztJQUVLLHdDQUFNLEdBQWI7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFBQSxDQUFDO0lBRUssMENBQVEsR0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGNsYXNzIEFkZFRpbGVEaWFsb2cge1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIGljb246IHN0cmluZztcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGFtb3VudDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQWRkVGlsZURpYWxvZ0NvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciB7XHJcbiAgICBwdWJsaWMgZGVmYXVsdFRpbGVzOiBbQWRkVGlsZURpYWxvZ1tdXTtcclxuICAgIHB1YmxpYyBncm91cHM6IGFueTtcclxuICAgIHB1YmxpYyB0b3RhbFRpbGVzOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGdyb3VwczogYW55LFxyXG4gICAgICAgIHB1YmxpYyBhY3RpdmVHcm91cEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgd2lkZ2V0TGlzdDogW0FkZFRpbGVEaWFsb2dbXV0sXHJcbiAgICAgICAgcHVibGljICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVHcm91cEluZGV4ID0gXy5pc051bWJlcihhY3RpdmVHcm91cEluZGV4KSA/IGFjdGl2ZUdyb3VwSW5kZXggOiAtMTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRUaWxlcyA9IF8uY2xvbmVEZWVwKHdpZGdldExpc3QpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gXy5tYXAoZ3JvdXBzLCBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwWyd0aXRsZSddO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh7XHJcbiAgICAgICAgICAgIGdyb3VwSW5kZXg6IHRoaXMuYWN0aXZlR3JvdXBJbmRleCxcclxuICAgICAgICAgICAgd2lkZ2V0czogdGhpcy5kZWZhdWx0VGlsZXNcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGNhbmNlbCgpIHtcclxuICAgICAgICB0aGlzLiRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGVuY3JlYXNlKGdyb3VwSW5kZXg6IG51bWJlciwgd2lkZ2V0SW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IHdpZGdldCA9IHRoaXMuZGVmYXVsdFRpbGVzW2dyb3VwSW5kZXhdW3dpZGdldEluZGV4XTtcclxuICAgICAgICB3aWRnZXQuYW1vdW50Kys7XHJcbiAgICAgICAgdGhpcy50b3RhbFRpbGVzKys7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBkZWNyZWFzZShncm91cEluZGV4OiBudW1iZXIsIHdpZGdldEluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB3aWRnZXQgPSB0aGlzLmRlZmF1bHRUaWxlc1tncm91cEluZGV4XVt3aWRnZXRJbmRleF07XHJcbiAgICAgICAgd2lkZ2V0LmFtb3VudCA9IHdpZGdldC5hbW91bnQgPyB3aWRnZXQuYW1vdW50IC0gMSA6IDA7XHJcbiAgICAgICAgdGhpcy50b3RhbFRpbGVzID0gdGhpcy50b3RhbFRpbGVzID8gdGhpcy50b3RhbFRpbGVzIC0gMSA6IDA7XHJcbiAgICB9O1xyXG59IiwiaW1wb3J0IHtcclxuICBBZGRUaWxlRGlhbG9nLFxyXG4gIEFkZFRpbGVEaWFsb2dDb250cm9sbGVyXHJcbn0gZnJvbSAnLi9BZGRUaWxlRGlhbG9nQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBZGRUaWxlRGlhbG9nU2VydmljZSB7XHJcbiAgc2hvdyhncm91cHMsIGFjdGl2ZUdyb3VwSW5kZXgpOiBhbmd1bGFyLklQcm9taXNlIDwgYW55ID4gO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBZGRUaWxlRGlhbG9ncHJvdmlkZXIge1xyXG4gIGNvbmZpZ1dpZGdldExpc3QobGlzdDogW0FkZFRpbGVEaWFsb2dbXV0pOiB2b2lkO1xyXG59XHJcblxyXG57XHJcbiAgY29uc3Qgc2V0VHJhbnNsYXRpb25zID0gZnVuY3Rpb24oJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgIGNvbnN0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGVQcm92aWRlcicpIDogbnVsbDtcclxuICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgKDxhbnk+cGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgIERBU0hCT0FSRF9BRERfVElMRV9ESUFMT0dfVElUTEU6ICdBZGQgY29tcG9uZW50JyxcclxuICAgICAgICBEQVNIQk9BUkRfQUREX1RJTEVfRElBTE9HX1VTRV9IT1RfS0VZUzogJ1VzZSBcIkVudGVyXCIgb3IgXCIrXCIgYnV0dG9ucyBvbiBrZXlib2FyZCB0byBlbmNyZWFzZSBhbmQgXCJEZWxldGVcIiBvciBcIi1cIiB0byBkZWNyZWFzZSB0aWxlcyBhbW91bnQnLFxyXG4gICAgICAgIERBU0hCT0FSRF9BRERfVElMRV9ESUFMT0dfQ1JFQVRFX05FV19HUk9VUDogJ0NyZWF0ZSBuZXcgZ3JvdXAnXHJcbiAgICAgIH0pO1xyXG4gICAgICAoPGFueT5waXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygncnUnLCB7XHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9USUxFX0RJQUxPR19USVRMRTogJ9CU0L7QsdCw0LLQuNGC0Ywg0LrQvtC80L/QvtC90LXQvdGCJyxcclxuICAgICAgICBEQVNIQk9BUkRfQUREX1RJTEVfRElBTE9HX1VTRV9IT1RfS0VZUzogJ9CY0YHQv9C+0LvRjNC30YPQudGC0LUgXCJFbnRlclwiINC40LvQuCBcIitcIiDQutC70LDQstC40YjQuCDQvdCwINC60LvQsNCy0LjQsNGC0YPRgNC1INGH0YLQvtCx0Ysg0YPQstC10LvQuNGH0LjRgtGMINC4IFwiRGVsZXRlXCIgb3IgXCItXCIg0YfRgtC+0LHRiyDRg9C80LXQvdGI0LjRgtGMINC60L7Qu9C40YfQtdGB0YLQstC+INGC0LDQudC70L7QsicsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9USUxFX0RJQUxPR19DUkVBVEVfTkVXX0dST1VQOiAn0KHQvtC30LTQsNGC0Ywg0L3QvtCy0YPRjiDQs9GA0YPQv9C/0YMnXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xhc3MgQWRkVGlsZURpYWxvZ1NlcnZpY2UgaW1wbGVtZW50cyBJQWRkVGlsZURpYWxvZ1NlcnZpY2Uge1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIHdpZGdldExpc3Q6IFtBZGRUaWxlRGlhbG9nW11dLFxyXG4gICAgICBwcml2YXRlICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgKSB7fVxyXG5cclxuICAgIHB1YmxpYyBzaG93KGdyb3VwcywgYWN0aXZlR3JvdXBJbmRleCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kbWREaWFsb2dcclxuICAgICAgICAuc2hvdyh7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FkZF90aWxlX2RpYWxvZy9BZGRUaWxlLmh0bWwnLFxyXG4gICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAgIGNvbnRyb2xsZXI6IEFkZFRpbGVEaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgICAgY29udHJvbGxlckFzOiAnZGlhbG9nQ3RybCcsXHJcbiAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICBncm91cHM6ICgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhY3RpdmVHcm91cEluZGV4OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUdyb3VwSW5kZXg7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHdpZGdldExpc3Q6ICgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy53aWRnZXRMaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNsYXNzIEFkZFRpbGVEaWFsb2dQcm92aWRlciBpbXBsZW1lbnRzIElBZGRUaWxlRGlhbG9ncHJvdmlkZXIge1xyXG4gICAgcHJpdmF0ZSBfc2VydmljZTogQWRkVGlsZURpYWxvZ1NlcnZpY2U7XHJcbiAgICBwcml2YXRlIF93aWRnZXRMaXN0OiBbQWRkVGlsZURpYWxvZ1tdXSA9IG51bGw7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIHB1YmxpYyBjb25maWdXaWRnZXRMaXN0ID0gZnVuY3Rpb24gKGxpc3Q6IFtBZGRUaWxlRGlhbG9nW11dKSB7XHJcbiAgICAgIHRoaXMuX3dpZGdldExpc3QgPSBsaXN0O1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgJGdldCgkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UpIHtcclxuICAgICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX3NlcnZpY2UgPT0gbnVsbClcclxuICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IEFkZFRpbGVEaWFsb2dTZXJ2aWNlKHRoaXMuX3dpZGdldExpc3QsICRtZERpYWxvZyk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5fc2VydmljZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcEFkZERhc2hib2FyZFRpbGVEaWFsb2cnKVxyXG4gICAgLmNvbmZpZyhzZXRUcmFuc2xhdGlvbnMpXHJcbiAgICAucHJvdmlkZXIoJ3BpcEFkZFRpbGVEaWFsb2cnLCBBZGRUaWxlRGlhbG9nUHJvdmlkZXIpO1xyXG59IiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwQWRkRGFzaGJvYXJkVGlsZURpYWxvZycsIFsnbmdNYXRlcmlhbCddKTtcclxuXHJcbmltcG9ydCAnLi9BZGRUaWxlRGlhbG9nQ29udHJvbGxlcic7XHJcbmltcG9ydCAnLi9BZGRUaWxlUHJvdmlkZXInOyIsImltcG9ydCB7XHJcbiAgTWVudVRpbGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudV90aWxlL01lbnVUaWxlU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVRpbGVDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNsYXNzIENhbGVuZGFyVGlsZUNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51VGlsZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByaXZhdGUgcGlwVGlsZUNvbmZpZ0RpYWxvZ1NlcnZpY2U6IElUaWxlQ29uZmlnU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpcy5vcHRpb25zLm1lbnUgPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpIDogdGhpcy5tZW51O1xyXG4gICAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSB0aGlzLm9wdGlvbnMuZGF0ZSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLm9wdGlvbnMuY29sb3IgfHwgJ2JsdWUnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLnBpcFRpbGVDb25maWdEaWFsb2dTZXJ2aWNlLnNob3coe1xyXG4gICAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLWNhbGVuZGFyLWNvbmZpZycsXHJcbiAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgZGF0ZTogdGhpcy5vcHRpb25zLmRhdGUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBleHRlbnNpb25Vcmw6ICdjYWxlbmRhcl90aWxlL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuZGF0ZSA9IHJlc3VsdC5kYXRlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb25zdCBDYWxlbmRhclRpbGU6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJyxcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBDYWxlbmRhclRpbGVDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhcl90aWxlL0NhbGVuZGFyVGlsZS5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb21wb25lbnQoJ3BpcENhbGVuZGFyVGlsZScsIENhbGVuZGFyVGlsZSk7XHJcblxyXG59IiwiZXhwb3J0IGludGVyZmFjZSBJRGFzaGJvYXJkVGlsZSB7XHJcbiAgICBvcHRpb25zOiBhbnk7XHJcbiAgICBjb2xvcjogc3RyaW5nO1xyXG4gICAgc2l6ZTogT2JqZWN0IHwgc3RyaW5nIHwgbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRGFzaGJvYXJkVGlsZSBpbXBsZW1lbnRzIElEYXNoYm9hcmRUaWxlIHtcclxuICAgIHB1YmxpYyBvcHRpb25zOiBhbnk7XHJcbiAgICBwdWJsaWMgY29sb3I6IHN0cmluZztcclxuICAgIHB1YmxpYyBzaXplOiBPYmplY3QgfCBzdHJpbmcgfCBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7IH1cclxufSIsIlxyXG5jbGFzcyBUaWxlQ29sb3JzIHtcclxuICAgIHN0YXRpYyBhbGw6IHN0cmluZ1tdID0gWydwdXJwbGUnLCAnZ3JlZW4nLCAnZ3JheScsICdvcmFuZ2UnLCAnYmx1ZSddO1xyXG59XHJcblxyXG5jbGFzcyBUaWxlU2l6ZXMge1xyXG4gICAgc3RhdGljIGFsbDogYW55ID0gW3tcclxuICAgICAgICAgICAgbmFtZTogJ0RBU0hCT0FSRF9USUxFX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTCcsXHJcbiAgICAgICAgICAgIGlkOiAnMTEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfVElMRV9DT05GSUdfRElBTE9HX1NJWkVfV0lERScsXHJcbiAgICAgICAgICAgIGlkOiAnMjEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfVElMRV9DT05GSUdfRElBTE9HX1NJWkVfTEFSR0UnLFxyXG4gICAgICAgICAgICBpZDogJzIyJ1xyXG4gICAgICAgIH1cclxuICAgIF07XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUaWxlQ29uZmlnRGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICBwdWJsaWMgY29sb3JzOiBzdHJpbmdbXSA9IFRpbGVDb2xvcnMuYWxsO1xyXG4gICAgcHVibGljIHNpemVzOiBhbnkgPSBUaWxlU2l6ZXMuYWxsO1xyXG4gICAgcHVibGljIHNpemVJZDogc3RyaW5nID0gVGlsZVNpemVzLmFsbFswXS5pZDtcclxuICAgIHB1YmxpYyBvbkNhbmNlbDogRnVuY3Rpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIHBhcmFtcyxcclxuICAgICAgICBwdWJsaWMgZXh0ZW5zaW9uVXJsLFxyXG4gICAgICAgIHB1YmxpYyAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgdGhpcy5wYXJhbXMpO1xyXG4gICAgICAgIHRoaXMuc2l6ZUlkID0gJycgKyB0aGlzLnBhcmFtcy5zaXplLmNvbFNwYW4gKyB0aGlzLnBhcmFtcy5zaXplLnJvd1NwYW47XHJcblxyXG4gICAgICAgIHRoaXMub25DYW5jZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1kRGlhbG9nLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25BcHBseSh1cGRhdGVkRGF0YSkge1xyXG4gICAgICAgIHRoaXNbJ3NpemUnXS5zaXplWCA9IE51bWJlcih0aGlzLnNpemVJZC5zdWJzdHIoMCwgMSkpO1xyXG4gICAgICAgIHRoaXNbJ3NpemUnXS5zaXplWSA9IE51bWJlcih0aGlzLnNpemVJZC5zdWJzdHIoMSwgMSkpO1xyXG4gICAgICAgIHRoaXMuJG1kRGlhbG9nLmhpZGUodXBkYXRlZERhdGEpO1xyXG4gICAgfVxyXG59IiwieyAgICBcclxuICAgIGludGVyZmFjZSBJVGlsZUNvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogYW55O1xyXG4gICAgICAgIHBpcERpYWxvZ1Njb3BlOiBhbnk7XHJcbiAgICAgICAgcGlwQXBwbHk6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3M6IElUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3MgPSB7XHJcbiAgICAgICAgcGlwRXh0ZW5zaW9uVXJsOiAnPCcsXHJcbiAgICAgICAgcGlwRGlhbG9nU2NvcGU6ICc8JyxcclxuICAgICAgICBwaXBBcHBseTogJyYnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgVGlsZUNvbmZpZ0V4dGVuZENvbXBvbmVudENoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJVGlsZUNvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBuZy5JQ2hhbmdlc09iamVjdDxhbnk+O1xyXG5cclxuICAgICAgICBwaXBFeHRlbnNpb25Vcmw6IG5nLklDaGFuZ2VzT2JqZWN0PHN0cmluZz47XHJcbiAgICAgICAgcGlwRGlhbG9nU2NvcGU6IG5nLklDaGFuZ2VzT2JqZWN0PG5nLklTY29wZT47XHJcblxyXG4gICAgICAgIHBpcEFwcGx5OiBuZy5JQ2hhbmdlc09iamVjdDwoe3VwZGF0ZWREYXRhOiBhbnl9KSA9PiBuZy5JUHJvbWlzZTx2b2lkPj47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIElUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50QXR0cmlidXRlcyBleHRlbmRzIG5nLklBdHRyaWJ1dGVzIHtcclxuICAgICAgICBwaXBFeHRlbnNpb25Vcmw6IHN0cmluZ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFRpbGVDb25maWdFeHRlbmRDb21wb25lbnRDb250cm9sbGVyIGltcGxlbWVudHMgSVRpbGVDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5ncyB7XHJcbiAgICAgICAgcHVibGljIHBpcEV4dGVuc2lvblVybDogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBwaXBEaWFsb2dTY29wZTogbmcuSVNjb3BlO1xyXG4gICAgICAgIHB1YmxpYyBwaXBBcHBseTogKHBhcmFtOiB7dXBkYXRlZERhdGE6IGFueX0pID0+IG5nLklQcm9taXNlPHZvaWQ+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkdGVtcGxhdGVSZXF1ZXN0OiBhbmd1bGFyLklUZW1wbGF0ZVJlcXVlc3RTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBcclxuICAgICAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogSlF1ZXJ5LCBcclxuICAgICAgICAgICAgcHJpdmF0ZSAkYXR0cnM6IElUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50QXR0cmlidXRlc1xyXG4gICAgICAgICkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IFRpbGVDb25maWdFeHRlbmRDb21wb25lbnRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBpcERpYWxvZ1Njb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgY2hhbmdlcy5waXBEaWFsb2dTY29wZS5jdXJyZW50VmFsdWVbJyRzY29wZSddO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgY2hhbmdlcy5waXBEaWFsb2dTY29wZS5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBpcEV4dGVuc2lvblVybCAmJiBjaGFuZ2VzLnBpcEV4dGVuc2lvblVybC5jdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRlbXBsYXRlUmVxdWVzdChjaGFuZ2VzLnBpcEV4dGVuc2lvblVybC5jdXJyZW50VmFsdWUsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdwaXAtZXh0ZW5zaW9uLXBvaW50JykucmVwbGFjZVdpdGgodGhpcy4kY29tcGlsZShodG1sKSh0aGlzLiRzY29wZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvbkFwcGx5KCkge1xyXG4gICAgICAgICAgICB0aGlzLnBpcEFwcGx5KHt1cGRhdGVkRGF0YTogdGhpc30pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwaXBUaWxlQ29uZmlnQ29tcG9uZW50OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2NvbmZpZ190aWxlX2RpYWxvZy9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogVGlsZUNvbmZpZ0V4dGVuZENvbXBvbmVudENvbnRyb2xsZXIsXHJcbiAgICAgICAgYmluZGluZ3M6IFRpbGVDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5nc1xyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBDb25maWdEYXNoYm9hcmRUaWxlRGlhbG9nJylcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBUaWxlQ29uZmlnRXh0ZW5kQ29tcG9uZW50JywgcGlwVGlsZUNvbmZpZ0NvbXBvbmVudCk7XHJcbn0iLCJpbXBvcnQgeyBUaWxlQ29uZmlnRGlhbG9nQ29udHJvbGxlciB9IGZyb20gJy4vQ29uZmlnRGlhbG9nQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUaWxlQ29uZmlnU2VydmljZSB7XHJcbiAgICBzaG93KHBhcmFtczogSVRpbGVDb25maWdEaWFsb2dPcHRpb25zLCBzdWNjZXNzQ2FsbGJhY2sgPyA6IChrZXkpID0+IHZvaWQsIGNhbmNlbENhbGxiYWNrID8gOiAoKSA9PiB2b2lkKTogYW55O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUaWxlQ29uZmlnRGlhbG9nT3B0aW9ucyBleHRlbmRzIGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ09wdGlvbnMge1xyXG4gICAgZGlhbG9nQ2xhc3M/OiBzdHJpbmc7XHJcbiAgICBleHRlbnNpb25Vcmw/OiBzdHJpbmc7XHJcbiAgICBldmVudD86IGFueTtcclxufVxyXG5cclxue1xyXG4gICAgY29uc3Qgc2V0VHJhbnNsYXRpb25zID0gZnVuY3Rpb24oJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgICAgICBjb25zdCBwaXBUcmFuc2xhdGUgPSAkaW5qZWN0b3IuaGFzKCdwaXBUcmFuc2xhdGVQcm92aWRlcicpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA6IG51bGw7XHJcbiAgICAgICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19USVRMRTogJ0VkaXQgdGlsZScsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfVElMRV9DT05GSUdfRElBTE9HX1NJWkVfU01BTEw6ICdTbWFsbCcsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfVElMRV9DT05GSUdfRElBTE9HX1NJWkVfV0lERTogJ1dpZGUnLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFOiAnTGFyZ2UnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19USVRMRTogJ9CY0LfQvNC10L3QuNGC0Ywg0LLQuNC00LbQtdGCJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9USUxFX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTDogJ9Cc0LDQu9C10L0uJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9USUxFX0NPTkZJR19ESUFMT0dfU0laRV9XSURFOiAn0KjQuNGA0L7QutC40LknLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFOiAn0JHQvtC70YzRiNC+0LknXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBUaWxlQ29uZmlnRGlhbG9nU2VydmljZSB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwdWJsaWMgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICAgICAgKSB7fVxyXG5cclxuICAgICAgICBwdWJsaWMgc2hvdyhwYXJhbXM6IElUaWxlQ29uZmlnRGlhbG9nT3B0aW9ucywgc3VjY2Vzc0NhbGxiYWNrID8gOiAoa2V5KSA9PiB2b2lkLCBjYW5jZWxDYWxsYmFjayA/IDogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudDogcGFyYW1zLmV2ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBwYXJhbXMudGVtcGxhdGVVcmwgfHwgJ2RpYWxvZ3MvdGlsZV9jb25maWcvQ29uZmlnRGlhbG9nLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFRpbGVDb25maWdEaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25Vcmw6IHBhcmFtcy5leHRlbnNpb25VcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLmxvY2Fsc1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3VjY2Vzc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhrZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcENvbmZpZ0Rhc2hib2FyZFRpbGVEaWFsb2cnKVxyXG4gICAgICAgIC5jb25maWcoc2V0VHJhbnNsYXRpb25zKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdwaXBUaWxlQ29uZmlnRGlhbG9nU2VydmljZScsIFRpbGVDb25maWdEaWFsb2dTZXJ2aWNlKTtcclxufSIsIlxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBDb25maWdEYXNoYm9hcmRUaWxlRGlhbG9nJywgWyduZ01hdGVyaWFsJ10pO1xyXG5cclxuaW1wb3J0ICcuL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcbmltcG9ydCAnLi9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQnOyIsImltcG9ydCB7XHJcbiAgSVRpbGVUZW1wbGF0ZVNlcnZpY2VcclxufSBmcm9tICcuLi91dGlsaXR5L1RpbGVUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQge1xyXG4gIElBZGRUaWxlRGlhbG9nU2VydmljZSxcclxuICBJQWRkVGlsZURpYWxvZ3Byb3ZpZGVyXHJcbn0gZnJvbSAnLi4vYWRkX3RpbGVfZGlhbG9nL0FkZFRpbGVQcm92aWRlcidcclxuXHJcbntcclxuICBjb25zdCBzZXRUcmFuc2xhdGlvbnMgPSBmdW5jdGlvbiAoJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgIGNvbnN0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGVQcm92aWRlcicpIDogbnVsbDtcclxuICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICBEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVA6ICdEcm9wIGhlcmUgdG8gY3JlYXRlIG5ldyBncm91cCcsXHJcbiAgICAgIH0pO1xyXG4gICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgIERST1BfVE9fQ1JFQVRFX05FV19HUk9VUDogJ9Cf0LXRgNC10YLQsNGJ0LjRgtC1INGB0Y7QtNCwINC00LvRjyDRgdC+0LfQtNCw0L3QuNGPINC90L7QstC+0Lkg0LPRgNGD0L/Qv9GLJ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGNvbmZpZ3VyZUF2YWlsYWJsZVdpZGdldHMgPSBmdW5jdGlvbiAocGlwQWRkVGlsZURpYWxvZ1Byb3ZpZGVyOiBJQWRkVGlsZURpYWxvZ3Byb3ZpZGVyKSB7XHJcbiAgICBwaXBBZGRUaWxlRGlhbG9nUHJvdmlkZXIuY29uZmlnV2lkZ2V0TGlzdChbXHJcbiAgICAgIFt7XHJcbiAgICAgICAgICB0aXRsZTogJ0V2ZW50JyxcclxuICAgICAgICAgIGljb246ICdkb2N1bWVudCcsXHJcbiAgICAgICAgICBuYW1lOiAnZXZlbnQnLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aXRsZTogJ1Bvc2l0aW9uJyxcclxuICAgICAgICAgIGljb246ICdsb2NhdGlvbicsXHJcbiAgICAgICAgICBuYW1lOiAncG9zaXRpb24nLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbe1xyXG4gICAgICAgICAgdGl0bGU6ICdDYWxlbmRhcicsXHJcbiAgICAgICAgICBpY29uOiAnZGF0ZScsXHJcbiAgICAgICAgICBuYW1lOiAnY2FsZW5kYXInLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aXRsZTogJ1N0aWNreSBOb3RlcycsXHJcbiAgICAgICAgICBpY29uOiAnbm90ZS10YWtlJyxcclxuICAgICAgICAgIG5hbWU6ICdub3RlcycsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnU3RhdGlzdGljcycsXHJcbiAgICAgICAgICBpY29uOiAndHItc3RhdGlzdGljcycsXHJcbiAgICAgICAgICBuYW1lOiAnc3RhdGlzdGljcycsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIF0pO1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgZHJhZ2dhYmxlT3B0aW9ucyB7XHJcbiAgICB0aWxlV2lkdGg6IG51bWJlcjtcclxuICAgIHRpbGVIZWlnaHQ6IG51bWJlcjtcclxuICAgIGd1dHRlcjogbnVtYmVyO1xyXG4gICAgaW5saW5lOiBib29sZWFuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgREVGQVVMVF9HUklEX09QVElPTlM6IGRyYWdnYWJsZU9wdGlvbnMgPSB7XHJcbiAgICB0aWxlV2lkdGg6IDE1MCwgLy8gJ3B4J1xyXG4gICAgdGlsZUhlaWdodDogMTUwLCAvLyAncHgnXHJcbiAgICBndXR0ZXI6IDEwLCAvLyAncHgnXHJcbiAgICBpbmxpbmU6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgaW50ZXJmYWNlIERhc2hib2FyZEJpbmRpbmdzIHtcclxuICAgICAgZ3JpZE9wdGlvbnM6IGFueTtcclxuICAgICAgZ3JvdXBBZGRpdGlvbmFsQWN0aW9uczogYW55O1xyXG4gICAgICBncm91cGVkV2lkZ2V0czogYW55O1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgRGFzaGJvYXJkQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBEYXNoYm9hcmRCaW5kaW5ncyB7XHJcbiAgICBwcml2YXRlIGRlZmF1bHRHcm91cE1lbnVBY3Rpb25zOiBhbnkgPSBbe1xyXG4gICAgICAgIHRpdGxlOiAnQWRkIENvbXBvbmVudCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudChncm91cEluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1JlbW92ZScsXHJcbiAgICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUdyb3VwKGdyb3VwSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNhbGxiYWNrOiAoZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2NvbmZpZ3VyYXRlIGdyb3VwIHdpdGggaW5kZXg6JywgZ3JvdXBJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gICAgcHJpdmF0ZSBfaW5jbHVkZVRwbDogc3RyaW5nID0gJzxwaXAte3sgdHlwZSB9fS10aWxlIGdyb3VwPVwiZ3JvdXBJbmRleFwiIGluZGV4PVwiaW5kZXhcIicgK1xyXG4gICAgICAncGlwLW9wdGlvbnM9XCIkcGFyZW50LiRjdHJsLmdyb3VwZWRXaWRnZXRzW2dyb3VwSW5kZXhdW1xcJ3NvdXJjZVxcJ11baW5kZXhdLm9wdHNcIj4nICtcclxuICAgICAgJzwvcGlwLXt7IHR5cGUgfX0tdGlsZT4nO1xyXG5cclxuICAgIHB1YmxpYyBncm91cGVkV2lkZ2V0czogYW55O1xyXG4gICAgcHVibGljIGRyYWdnYWJsZUdyaWRPcHRpb25zOiBkcmFnZ2FibGVPcHRpb25zO1xyXG4gICAgcHVibGljIHdpZGdldHNUZW1wbGF0ZXM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cE1lbnVBY3Rpb25zOiBhbnkgPSB0aGlzLmRlZmF1bHRHcm91cE1lbnVBY3Rpb25zO1xyXG4gICAgcHVibGljIHdpZGdldHNDb250ZXh0OiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JpZE9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkYXR0cnM6IGFueSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW55LFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBBZGRUaWxlRGlhbG9nOiBJQWRkVGlsZURpYWxvZ1NlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgcGlwVGlsZVRlbXBsYXRlOiBJVGlsZVRlbXBsYXRlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIC8vIEFkZCBjbGFzcyB0byBzdHlsZSBzY3JvbGwgYmFyXHJcbiAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtc2Nyb2xsJyk7XHJcblxyXG4gICAgICAvLyBTZXQgdGlsZXMgZ3JpZCBvcHRpb25zXHJcbiAgICAgIHRoaXMuZHJhZ2dhYmxlR3JpZE9wdGlvbnMgPSB0aGlzLmdyaWRPcHRpb25zIHx8IERFRkFVTFRfR1JJRF9PUFRJT05TO1xyXG5cclxuICAgICAgLy8gU3dpdGNoIGlubGluZSBkaXNwbGF5aW5nXHJcbiAgICAgIGlmICh0aGlzLmRyYWdnYWJsZUdyaWRPcHRpb25zLmlubGluZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdpbmxpbmUtZ3JpZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEV4dGVuZCBncm91cCdzIG1lbnUgYWN0aW9uc1xyXG4gICAgICBpZiAodGhpcy5ncm91cEFkZGl0aW9uYWxBY3Rpb25zKSBhbmd1bGFyLmV4dGVuZCh0aGlzLmdyb3VwTWVudUFjdGlvbnMsIHRoaXMuZ3JvdXBBZGRpdGlvbmFsQWN0aW9ucyk7XHJcblxyXG4gICAgICAvLyBDb21waWxlIHdpZGdldHNcclxuICAgICAgdGhpcy53aWRnZXRzQ29udGV4dCA9ICRzY29wZTtcclxuICAgICAgdGhpcy5jb21waWxlV2lkZ2V0cygpO1xyXG5cclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygndmlzaWJsZScpO1xyXG4gICAgICB9LCA3MDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29tcGlsZVdpZGdldHMoKSB7XHJcbiAgICAgIF8uZWFjaCh0aGlzLmdyb3VwZWRXaWRnZXRzLCAoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICBncm91cC5yZW1vdmVkV2lkZ2V0cyA9IGdyb3VwLnJlbW92ZWRXaWRnZXRzIHx8IFtdLFxyXG4gICAgICAgICAgZ3JvdXAuc291cmNlID0gZ3JvdXAuc291cmNlLm1hcCgod2lkZ2V0LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBFc3RhYmxpc2ggZGVmYXVsdCBwcm9wc1xyXG4gICAgICAgICAgICB3aWRnZXQuc2l6ZSA9IHdpZGdldC5zaXplIHx8IHtcclxuICAgICAgICAgICAgICBjb2xTcGFuOiAxLFxyXG4gICAgICAgICAgICAgIHJvd1NwYW46IDFcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2lkZ2V0LmluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgIHdpZGdldC5ncm91cEluZGV4ID0gZ3JvdXBJbmRleDtcclxuICAgICAgICAgICAgd2lkZ2V0Lm1lbnUgPSB3aWRnZXQubWVudSB8fCB7fTtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQod2lkZ2V0Lm1lbnUsIFt7XHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdSZW1vdmUnLFxyXG4gICAgICAgICAgICAgIGNsaWNrOiAoaXRlbSwgcGFyYW1zLCBvYmplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlV2lkZ2V0KGl0ZW0sIHBhcmFtcywgb2JqZWN0KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1dKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgb3B0czogd2lkZ2V0LFxyXG4gICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLnBpcFRpbGVUZW1wbGF0ZS5nZXRUZW1wbGF0ZSh3aWRnZXQsIHRoaXMuX2luY2x1ZGVUcGwpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkQ29tcG9uZW50KGdyb3VwSW5kZXgpIHtcclxuICAgICAgdGhpcy5waXBBZGRUaWxlRGlhbG9nXHJcbiAgICAgICAgLnNob3codGhpcy5ncm91cGVkV2lkZ2V0cywgZ3JvdXBJbmRleClcclxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgdmFyIGFjdGl2ZUdyb3VwO1xyXG5cclxuICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGRhdGEuZ3JvdXBJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgYWN0aXZlR3JvdXAgPSB0aGlzLmdyb3VwZWRXaWRnZXRzW2RhdGEuZ3JvdXBJbmRleF07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhY3RpdmVHcm91cCA9IHtcclxuICAgICAgICAgICAgICB0aXRsZTogJ05ldyBncm91cCcsXHJcbiAgICAgICAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuYWRkV2lkZ2V0cyhhY3RpdmVHcm91cC5zb3VyY2UsIGRhdGEud2lkZ2V0cyk7XHJcblxyXG4gICAgICAgICAgaWYgKGRhdGEuZ3JvdXBJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0cy5wdXNoKGFjdGl2ZUdyb3VwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmNvbXBpbGVXaWRnZXRzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyByZW1vdmVHcm91cCA9IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmVHcm91cCcsIGdyb3VwSW5kZXgpO1xyXG4gICAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnNwbGljZShncm91cEluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZFdpZGdldHMoZ3JvdXAsIHdpZGdldHMpIHtcclxuICAgICAgd2lkZ2V0cy5mb3JFYWNoKCh3aWRnZXRHcm91cCkgPT4ge1xyXG4gICAgICAgIHdpZGdldEdyb3VwLmZvckVhY2goKHdpZGdldCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHdpZGdldC5hbW91bnQpIHtcclxuICAgICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkod2lkZ2V0LmFtb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGdyb3VwLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0Lm5hbWVcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlV2lkZ2V0KGl0ZW0sIHBhcmFtcywgb2JqZWN0KSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMgPSBbXTtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cy5wdXNoKHBhcmFtcy5vcHRpb25zLmluZGV4KTtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5zb3VyY2Uuc3BsaWNlKHBhcmFtcy5vcHRpb25zLmluZGV4LCAxKTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cyA9IFtdO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb25zdCBEYXNoYm9hcmQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgZ3JpZE9wdGlvbnM6ICc9cGlwR3JpZE9wdGlvbnMnLFxyXG4gICAgICBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiAnPXBpcEdyb3VwQWN0aW9ucycsXHJcbiAgICAgIGdyb3VwZWRXaWRnZXRzOiAnPXBpcEdyb3VwcydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBEYXNoYm9hcmRDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdkYXNoYm9hcmQvRGFzaGJvYXJkLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEYXNoYm9hcmQnKVxyXG4gICAgLmNvbmZpZyhjb25maWd1cmVBdmFpbGFibGVXaWRnZXRzKVxyXG4gICAgLmNvbmZpZyhzZXRUcmFuc2xhdGlvbnMpXHJcbiAgICAuY29tcG9uZW50KCdwaXBEYXNoYm9hcmQnLCBEYXNoYm9hcmQpO1xyXG5cclxufSIsImRlY2xhcmUgdmFyIGludGVyYWN0O1xyXG5cclxuaW1wb3J0IHtcclxuICBEcmFnVGlsZVNlcnZpY2UsXHJcbiAgSURyYWdUaWxlU2VydmljZSxcclxuICBJRHJhZ1RpbGVDb25zdHJ1Y3RvclxyXG59IGZyb20gJy4vRHJhZ2dhYmxlVGlsZVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIFRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgSVRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgSVRpbGVzR3JpZENvbnN0cnVjdG9yXHJcbn0gZnJvbSAnLi4vdGlsZV9ncm91cC9UaWxlR3JvdXBTZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1RJTEVfV0lEVEg6IG51bWJlciA9IDE1MDtcclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVElMRV9IRUlHSFQ6IG51bWJlciA9IDE1MDtcclxuZXhwb3J0IGNvbnN0IFVQREFURV9HUk9VUFNfRVZFTlQgPSBcInBpcFVwZGF0ZURhc2hib2FyZEdyb3Vwc0NvbmZpZ1wiO1xyXG5cclxuY29uc3QgU0lNUExFX0xBWU9VVF9DT0xVTU5TX0NPVU5UOiBudW1iZXIgPSAyO1xyXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgdGlsZVdpZHRoOiBERUZBVUxUX1RJTEVfV0lEVEgsIC8vICdweCdcclxuICB0aWxlSGVpZ2h0OiBERUZBVUxUX1RJTEVfSEVJR0hULCAvLyAncHgnXHJcbiAgZ3V0dGVyOiAyMCwgLy8gJ3B4J1xyXG4gIGNvbnRhaW5lcjogJ3BpcC1kcmFnZ2FibGUtZ3JpZDpmaXJzdC1vZi10eXBlJyxcclxuICAvL21vYmlsZUJyZWFrcG9pbnQgICAgICAgOiBYWFgsICAgLy8gR2V0IGZyb20gcGlwTWVkaWEgU2VydmljZSBpbiB0aGUgY29uc3RydWN0b3JcclxuICBhY3RpdmVEcm9wem9uZUNsYXNzOiAnZHJvcHpvbmUtYWN0aXZlJyxcclxuICBncm91cENvbnRhbmluZXJTZWxlY3RvcjogJy5waXAtZHJhZ2dhYmxlLWdyb3VwOm5vdCguZmljdC1ncm91cCknLFxyXG59O1xyXG5cclxue1xyXG4gIGludGVyZmFjZSBJRHJhZ2dhYmxlQmluZGluZ3Mge1xyXG4gICAgICB0aWxlc1RlbXBsYXRlczogYW55O1xyXG4gICAgICB0aWxlc0NvbnRleHQ6IGFueTtcclxuICAgICAgb3B0aW9uczogYW55O1xyXG4gICAgICBncm91cE1lbnVBY3Rpb25zOiBhbnk7XHJcbiAgICAgICRjb250YWluZXI6IEpRdWVyeTtcclxuICB9XHJcblxyXG4gIGludGVyZmFjZSBJRHJhZ2dhYmxlQ29udHJvbGxlclNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgICRjb250YWluZXI6IEpRdWVyeTtcclxuICAgIHRpbGVzVGVtcGxhdGVzOiBhbnk7XHJcbiAgICBvcHRpb25zOiBhbnk7XHJcbiAgfVxyXG5cclxuICBpbnRlcmZhY2UgSVRpbGVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICBpbmRleDogbnVtYmVyIHwgc3RyaW5nO1xyXG4gICAgZ3JvdXBJbmRleDogbnVtYmVyIHwgc3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgRHJhZ2dhYmxlQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb21wb25lbnRDb250cm9sbGVyLCBJRHJhZ2dhYmxlQmluZGluZ3Mge1xyXG4gICAgcHVibGljIG9wdHM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cHM6IGFueTtcclxuICAgIHB1YmxpYyBzb3VyY2VEcm9wWm9uZUVsZW06IGFueSA9IG51bGw7XHJcbiAgICBwdWJsaWMgaXNTYW1lRHJvcHpvbmU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIHRpbGVHcm91cHM6IGFueSA9IG51bGw7XHJcbiAgICBwdWJsaWMgYXZhaWxhYmxlV2lkdGg6IG51bWJlcjtcclxuICAgIHB1YmxpYyBhdmFpbGFibGVDb2x1bW5zOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgZ3JvdXBzQ29udGFpbmVyczogYW55O1xyXG4gICAgcHVibGljIGNvbnRhaW5lcjogYW55O1xyXG4gICAgcHVibGljIGFjdGl2ZURyYWdnZWRHcm91cDogYW55O1xyXG4gICAgcHVibGljIGRyYWdnZWRUaWxlOiBhbnk7XHJcbiAgICBwdWJsaWMgY29udGFpbmVyT2Zmc2V0OiBhbnk7XHJcbiAgICBwdWJsaWMgdGlsZXNUZW1wbGF0ZXM6IGFueTtcclxuICAgIHB1YmxpYyB0aWxlc0NvbnRleHQ6IGFueTtcclxuICAgIHB1YmxpYyBvcHRpb25zOiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JvdXBNZW51QWN0aW9uczogYW55O1xyXG4gICAgcHVibGljICRjb250YWluZXI6IEpRdWVyeTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSAkc2NvcGU6IElEcmFnZ2FibGVDb250cm9sbGVyU2NvcGUsXHJcbiAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgIHBpcERyYWdUaWxlOiBJRHJhZ1RpbGVTZXJ2aWNlLFxyXG4gICAgICBwaXBUaWxlc0dyaWQ6IElUaWxlc0dyaWRTZXJ2aWNlLFxyXG4gICAgICBwaXBNZWRpYTogcGlwLmxheW91dHMuSU1lZGlhU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMub3B0cyA9IF8ubWVyZ2Uoe1xyXG4gICAgICAgIG1vYmlsZUJyZWFrcG9pbnQ6IHBpcE1lZGlhLmJyZWFrcG9pbnRzLnhzXHJcbiAgICAgIH0sIERFRkFVTFRfT1BUSU9OUywgdGhpcy5vcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZ3JvdXBzID0gdGhpcy50aWxlc1RlbXBsYXRlcy5tYXAoKGdyb3VwLCBncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRpdGxlOiBncm91cC50aXRsZSxcclxuICAgICAgICAgIGVkaXRpbmdOYW1lOiBmYWxzZSxcclxuICAgICAgICAgIGluZGV4OiBncm91cEluZGV4LFxyXG4gICAgICAgICAgc291cmNlOiBncm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpbGVTY29wZSA9IHRoaXMuY3JlYXRlVGlsZVNjb3BlKHRpbGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIElEcmFnVGlsZUNvbnN0cnVjdG9yKERyYWdUaWxlU2VydmljZSwge1xyXG4gICAgICAgICAgICAgIHRwbDogJGNvbXBpbGUodGlsZS50ZW1wbGF0ZSkodGlsZVNjb3BlKSxcclxuICAgICAgICAgICAgICBvcHRpb25zOiB0aWxlLm9wdHMsXHJcbiAgICAgICAgICAgICAgc2l6ZTogdGlsZS5vcHRzLnNpemVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQWRkIHRlbXBsYXRlcyB3YXRjaGVyXHJcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLnRpbGVzVGVtcGxhdGVzJywgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICAgIHRoaXMud2F0Y2gobmV3VmFsKTtcclxuICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAvLyBJbml0aWFsaXplIGRhdGFcclxuICAgICAgdGhpcy5pbml0aWFsaXplKCk7XHJcblxyXG4gICAgICAvLyBSZXNpemUgaGFuZGxlciBUT0RPOiByZXBsYWNlIGJ5IHBpcCByZXNpemUgd2F0Y2hlcnNcclxuICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKCgpID0+IHtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZVdpZHRoID0gdGhpcy5nZXRDb250YWluZXJXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlQ29sdW1ucyA9IHRoaXMuZ2V0QXZhaWxhYmxlQ29sdW1ucyh0aGlzLmF2YWlsYWJsZVdpZHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgICBncm91cFxyXG4gICAgICAgICAgICAuc2V0QXZhaWxhYmxlQ29sdW1ucyh0aGlzLmF2YWlsYWJsZUNvbHVtbnMpXHJcbiAgICAgICAgICAgIC5nZW5lcmF0ZUdyaWQodGhpcy5nZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUodGhpcy5hdmFpbGFibGVXaWR0aCkpXHJcbiAgICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnMoKVxyXG4gICAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LCA1MCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBvc3QgbGluayBmdW5jdGlvblxyXG4gICAgcHVibGljICRwb3N0TGluaygpIHtcclxuICAgICAgdGhpcy4kY29udGFpbmVyID0gdGhpcy4kZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXYXRjaCBoYW5kbGVyXHJcbiAgICBwcml2YXRlIHdhdGNoKG5ld1ZhbCkge1xyXG4gICAgICBjb25zdCBwcmV2VmFsID0gdGhpcy5ncm91cHM7XHJcbiAgICAgIGxldCBjaGFuZ2VkR3JvdXBJbmRleCA9IG51bGw7XHJcblxyXG4gICAgICBpZiAobmV3VmFsLmxlbmd0aCA+IHByZXZWYWwubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5hZGRHcm91cChuZXdWYWxbbmV3VmFsLmxlbmd0aCAtIDFdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobmV3VmFsLmxlbmd0aCA8IHByZXZWYWwubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVHcm91cHMobmV3VmFsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld1ZhbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwV2lkZ2V0RGlmZiA9IHByZXZWYWxbaV0uc291cmNlLmxlbmd0aCAtIG5ld1ZhbFtpXS5zb3VyY2UubGVuZ3RoO1xyXG4gICAgICAgIGlmIChncm91cFdpZGdldERpZmYgfHwgKG5ld1ZhbFtpXS5yZW1vdmVkV2lkZ2V0cyAmJiBuZXdWYWxbaV0ucmVtb3ZlZFdpZGdldHMubGVuZ3RoID4gMCkpIHtcclxuICAgICAgICAgIGNoYW5nZWRHcm91cEluZGV4ID0gaTtcclxuXHJcbiAgICAgICAgICBpZiAoZ3JvdXBXaWRnZXREaWZmIDwgMCkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdUaWxlcyA9IG5ld1ZhbFtjaGFuZ2VkR3JvdXBJbmRleF0uc291cmNlLnNsaWNlKGdyb3VwV2lkZ2V0RGlmZik7XHJcblxyXG4gICAgICAgICAgICBfLmVhY2gobmV3VGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbGUnLCB0aWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZFRpbGVzSW50b0dyb3VwKG5ld1RpbGVzLCB0aGlzLnRpbGVHcm91cHNbY2hhbmdlZEdyb3VwSW5kZXhdLCB0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbY2hhbmdlZEdyb3VwSW5kZXhdKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKHRoaXMudGlsZUdyb3Vwc1tjaGFuZ2VkR3JvdXBJbmRleF0sIG5ld1ZhbFtjaGFuZ2VkR3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tjaGFuZ2VkR3JvdXBJbmRleF0pO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuZXdWYWwgJiYgdGhpcy50aWxlR3JvdXBzKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUaWxlc09wdGlvbnMobmV3VmFsKTtcclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElubGluZSBlZGl0IGdyb3VwIGhhbmRsZXJzXHJcbiAgICBwdWJsaWMgb25UaXRsZUNsaWNrKGdyb3VwLCBldmVudCkge1xyXG4gICAgICBpZiAoIWdyb3VwLmVkaXRpbmdOYW1lKSB7XHJcbiAgICAgICAgZ3JvdXAub2xkVGl0bGUgPSBfLmNsb25lKGdyb3VwLnRpdGxlKTtcclxuICAgICAgICBncm91cC5lZGl0aW5nTmFtZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQuY2hpbGRyZW5bMF0pLmZvY3VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2FuY2VsRWRpdGluZyhncm91cCkge1xyXG4gICAgICBncm91cC50aXRsZSA9IGdyb3VwLm9sZFRpdGxlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkJsdXJUaXRsZUlucHV0KGdyb3VwKSB7XHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLmVkaXRpbmdOYW1lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoVVBEQVRFX0dST1VQU19FVkVOVCwgdGhpcy5ncm91cHMpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSB0aXRsZSBpbiBvdXRlciBzY29wZVxyXG4gICAgICAgIHRoaXMudGlsZXNUZW1wbGF0ZXNbZ3JvdXAuaW5kZXhdLnRpdGxlID0gZ3JvdXAudGl0bGU7XHJcbiAgICAgIH0sIDEwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uS3llcHJlc3NUaXRsZUlucHV0KGdyb3VwLCBldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICB0aGlzLm9uQmx1clRpdGxlSW5wdXQoZ3JvdXApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIG91dGVyIHNjb3BlIGZ1bmN0aW9uc1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc1RlbXBsYXRlcyh1cGRhdGVUeXBlOiBzdHJpbmcsIHNvdXJjZSA/IDogYW55KSB7XHJcbiAgICAgIHN3aXRjaCAodXBkYXRlVHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ2FkZEdyb3VwJzpcclxuICAgICAgICAgIGlmICh0aGlzLmdyb3Vwcy5sZW5ndGggIT09IHRoaXMudGlsZXNUZW1wbGF0ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGlsZXNUZW1wbGF0ZXMucHVzaChzb3VyY2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbW92ZVRpbGUnOlxyXG4gICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICBmcm9tSW5kZXgsXHJcbiAgICAgICAgICAgIHRvSW5kZXgsXHJcbiAgICAgICAgICAgIHRpbGVPcHRpb25zLFxyXG4gICAgICAgICAgICBmcm9tVGlsZUluZGV4XHJcbiAgICAgICAgICB9ID0ge1xyXG4gICAgICAgICAgICBmcm9tSW5kZXg6IHNvdXJjZS5mcm9tLmVsZW0uYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlLFxyXG4gICAgICAgICAgICB0b0luZGV4OiBzb3VyY2UudG8uZWxlbS5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWUsXHJcbiAgICAgICAgICAgIHRpbGVPcHRpb25zOiBzb3VyY2UudGlsZS5vcHRzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyb21UaWxlSW5kZXg6IHNvdXJjZS50aWxlLm9wdHMub3B0aW9ucy5pbmRleFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy50aWxlc1RlbXBsYXRlc1tmcm9tSW5kZXhdLnNvdXJjZS5zcGxpY2UoZnJvbVRpbGVJbmRleCwgMSk7XHJcbiAgICAgICAgICB0aGlzLnRpbGVzVGVtcGxhdGVzW3RvSW5kZXhdLnNvdXJjZS5wdXNoKHtcclxuICAgICAgICAgICAgb3B0czogdGlsZU9wdGlvbnNcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHRoaXMucmVJbmRleFRpbGVzKHNvdXJjZS5mcm9tLmVsZW0pO1xyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoc291cmNlLnRvLmVsZW0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNYW5hZ2UgdGlsZXMgZnVuY3Rpb25zXHJcbiAgICBwcml2YXRlIGNyZWF0ZVRpbGVTY29wZSh0aWxlOiBhbnkpOiBJVGlsZVNjb3BlIHtcclxuICAgICAgY29uc3QgdGlsZVNjb3BlID0gPCBJVGlsZVNjb3BlID4gdGhpcy4kcm9vdFNjb3BlLiRuZXcoZmFsc2UsIHRoaXMudGlsZXNDb250ZXh0KTtcclxuICAgICAgdGlsZVNjb3BlLmluZGV4ID0gdGlsZS5vcHRzLmluZGV4ID09IHVuZGVmaW5lZCA/IHRpbGUub3B0cy5vcHRpb25zLmluZGV4IDogdGlsZS5vcHRzLmluZGV4O1xyXG4gICAgICB0aWxlU2NvcGUuZ3JvdXBJbmRleCA9IHRpbGUub3B0cy5ncm91cEluZGV4ID09IHVuZGVmaW5lZCA/IHRpbGUub3B0cy5vcHRpb25zLmdyb3VwSW5kZXggOiB0aWxlLm9wdHMuZ3JvdXBJbmRleDtcclxuXHJcbiAgICAgIHJldHVybiB0aWxlU2NvcGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVUaWxlcyhncm91cCwgaW5kZXhlcywgY29udGFpbmVyKSB7XHJcbiAgICAgIGNvbnN0IHRpbGVzID0gJChjb250YWluZXIpLmZpbmQoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKTtcclxuXHJcbiAgICAgIF8uZWFjaChpbmRleGVzLCAoaW5kZXgpID0+IHtcclxuICAgICAgICBncm91cC50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHRpbGVzW2luZGV4XS5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlSW5kZXhUaWxlcyhjb250YWluZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVJbmRleFRpbGVzKGNvbnRhaW5lciwgZ0luZGV4ID8gKSB7XHJcbiAgICAgIGNvbnN0IHRpbGVzID0gJChjb250YWluZXIpLmZpbmQoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKSxcclxuICAgICAgICBncm91cEluZGV4ID0gZ0luZGV4ID09PSB1bmRlZmluZWQgPyBjb250YWluZXIuYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlIDogZ0luZGV4O1xyXG5cclxuICAgICAgXy5lYWNoKHRpbGVzLCAodGlsZSwgaW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBjaGlsZCA9ICQodGlsZSkuY2hpbGRyZW4oKVswXTtcclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY2hpbGQpLnNjb3BlKClbJ2luZGV4J10gPSBpbmRleDtcclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY2hpbGQpLnNjb3BlKClbJ2dyb3VwSW5kZXgnXSA9IGdyb3VwSW5kZXg7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlR3JvdXBzKG5ld0dyb3Vwcykge1xyXG4gICAgICBjb25zdCByZW1vdmVJbmRleGVzID0gW10sXHJcbiAgICAgICAgcmVtYWluID0gW10sXHJcbiAgICAgICAgY29udGFpbmVycyA9IFtdO1xyXG5cclxuXHJcbiAgICAgIF8uZWFjaCh0aGlzLmdyb3VwcywgKGdyb3VwLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChfLmZpbmRJbmRleChuZXdHcm91cHMsIChnKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBnWyd0aXRsZSddID09PSBncm91cC50aXRsZVxyXG4gICAgICAgICAgfSkgPCAwKSB7XHJcbiAgICAgICAgICByZW1vdmVJbmRleGVzLnB1c2goaW5kZXgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZW1haW4ucHVzaChpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIF8uZWFjaChyZW1vdmVJbmRleGVzLnJldmVyc2UoKSwgKGluZGV4KSA9PiB7XHJcbiAgICAgICAgdGhpcy5ncm91cHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB0aGlzLnRpbGVHcm91cHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBfLmVhY2gocmVtYWluLCAoaW5kZXgpID0+IHtcclxuICAgICAgICBjb250YWluZXJzLnB1c2godGhpcy5ncm91cHNDb250YWluZXJzW2luZGV4XSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gY29udGFpbmVycztcclxuXHJcbiAgICAgIF8uZWFjaCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnMsIChjb250YWluZXIsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoY29udGFpbmVyLCBpbmRleCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkR3JvdXAoc291cmNlR3JvdXApIHtcclxuICAgICAgY29uc3QgZ3JvdXAgPSB7XHJcbiAgICAgICAgdGl0bGU6IHNvdXJjZUdyb3VwLnRpdGxlLFxyXG4gICAgICAgIHNvdXJjZTogc291cmNlR3JvdXAuc291cmNlLm1hcCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIElEcmFnVGlsZUNvbnN0cnVjdG9yKERyYWdUaWxlU2VydmljZSwge1xyXG4gICAgICAgICAgICB0cGw6IHRoaXMuJGNvbXBpbGUodGlsZS50ZW1wbGF0ZSkodGlsZVNjb3BlKSxcclxuICAgICAgICAgICAgb3B0aW9uczogdGlsZS5vcHRzLFxyXG4gICAgICAgICAgICBzaXplOiB0aWxlLm9wdHMuc2l6ZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMuZ3JvdXBzLnB1c2goZ3JvdXApO1xyXG4gICAgICBpZiAoIXRoaXMuJHNjb3BlLiQkcGhhc2UpIHRoaXMuJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdHMuZ3JvdXBDb250YW5pbmVyU2VsZWN0b3IpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3Vwcy5wdXNoKFxyXG4gICAgICAgICAgSVRpbGVzR3JpZENvbnN0cnVjdG9yKFRpbGVzR3JpZFNlcnZpY2UsIGdyb3VwLnNvdXJjZSwgdGhpcy5vcHRzLCB0aGlzLmF2YWlsYWJsZUNvbHVtbnMsIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1t0aGlzLmdyb3Vwc0NvbnRhaW5lcnMubGVuZ3RoIC0gMV0pXHJcbiAgICAgICAgICAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpXHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzVGVtcGxhdGVzKCdhZGRHcm91cCcsIHNvdXJjZUdyb3VwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZFRpbGVzSW50b0dyb3VwKG5ld1RpbGVzLCBncm91cCwgZ3JvdXBDb250YWluZXIpIHtcclxuICAgICAgbmV3VGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRpbGVTY29wZSA9IHRoaXMuY3JlYXRlVGlsZVNjb3BlKHRpbGUpO1xyXG5cclxuICAgICAgICBjb25zdCBuZXdUaWxlID0gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICB0cGw6IHRoaXMuJGNvbXBpbGUodGlsZS50ZW1wbGF0ZSkodGlsZVNjb3BlKSxcclxuICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgIHNpemU6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZFRpbGUobmV3VGlsZSk7XHJcblxyXG4gICAgICAgICQoJzxkaXY+JylcclxuICAgICAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5hcHBlbmQobmV3VGlsZS5nZXRDb21waWxlZFRlbXBsYXRlKCkpXHJcbiAgICAgICAgICAuYXBwZW5kVG8oZ3JvdXBDb250YWluZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzT3B0aW9ucyhvcHRpb25zR3JvdXApIHtcclxuICAgICAgb3B0aW9uc0dyb3VwLmZvckVhY2goKG9wdGlvbkdyb3VwKSA9PiB7XHJcbiAgICAgICAgb3B0aW9uR3JvdXAuc291cmNlLmZvckVhY2goKHRpbGVPcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgICAgZ3JvdXAudXBkYXRlVGlsZU9wdGlvbnModGlsZU9wdGlvbnMub3B0cyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0VGlsZXNHcm91cHModGlsZUdyb3Vwcywgb3B0cywgZ3JvdXBzQ29udGFpbmVycykge1xyXG4gICAgICByZXR1cm4gdGlsZUdyb3Vwcy5tYXAoKGdyb3VwLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCBvcHRzLCB0aGlzLmF2YWlsYWJsZUNvbHVtbnMsIGdyb3Vwc0NvbnRhaW5lcnNbaW5kZXhdKVxyXG4gICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnMoKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc0dyb3Vwcyhvbmx5UG9zaXRpb24gPyAsIGRyYWdnZWRUaWxlID8gKSB7XHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgICBncm91cC5nZW5lcmF0ZUdyaWQodGhpcy5nZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUodGhpcy5hdmFpbGFibGVXaWR0aCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ3JvdXBcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnMob25seVBvc2l0aW9uLCBkcmFnZ2VkVGlsZSlcclxuICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q29udGFpbmVyV2lkdGgoKTogYW55IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy4kY29udGFpbmVyIHx8ICQoJ2JvZHknKTtcclxuICAgICAgcmV0dXJuIGNvbnRhaW5lci53aWR0aCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QXZhaWxhYmxlQ29sdW1ucyhhdmFpbGFibGVXaWR0aCk6IGFueSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm9wdHMubW9iaWxlQnJlYWtwb2ludCA+IGF2YWlsYWJsZVdpZHRoID8gU0lNUExFX0xBWU9VVF9DT0xVTU5TX0NPVU5UIDpcclxuICAgICAgICBNYXRoLmZsb29yKGF2YWlsYWJsZVdpZHRoIC8gKHRoaXMub3B0cy50aWxlV2lkdGggKyB0aGlzLm9wdHMuZ3V0dGVyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBY3RpdmVHcm91cEFuZFRpbGUoZWxlbSk6IGFueSB7XHJcbiAgICAgIGNvbnN0IGFjdGl2ZSA9IHt9O1xyXG5cclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZm91bmRUaWxlID0gZ3JvdXAuZ2V0VGlsZUJ5Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgaWYgKGZvdW5kVGlsZSkge1xyXG4gICAgICAgICAgYWN0aXZlWydncm91cCddID0gZ3JvdXA7XHJcbiAgICAgICAgICBhY3RpdmVbJ3RpbGUnXSA9IGZvdW5kVGlsZTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIGFjdGl2ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZShhdmFpbGFibGVXaWR0aCk6IGFueSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm9wdHMubW9iaWxlQnJlYWtwb2ludCA+IGF2YWlsYWJsZVdpZHRoID8gYXZhaWxhYmxlV2lkdGggLyAyIC0gdGhpcy5vcHRzLmd1dHRlciA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyYWdTdGFydExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGNvbnN0IGFjdGl2ZUVudGl0aWVzID0gdGhpcy5nZXRBY3RpdmVHcm91cEFuZFRpbGUoZXZlbnQudGFyZ2V0KTtcclxuXHJcbiAgICAgIHRoaXMuY29udGFpbmVyID0gJChldmVudC50YXJnZXQpLnBhcmVudCgnLnBpcC1kcmFnZ2FibGUtZ3JvdXAnKS5nZXQoMCk7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUgPSBhY3RpdmVFbnRpdGllc1sndGlsZSddO1xyXG4gICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCA9IGFjdGl2ZUVudGl0aWVzWydncm91cCddO1xyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnZHJhZy10cmFuc2ZlcicpO1xyXG5cclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZS5zdGFydERyYWcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ01vdmVMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgIGNvbnN0IHggPSAocGFyc2VGbG9hdCh0YXJnZXQuc3R5bGUubGVmdCkgfHwgMCkgKyBldmVudC5keDtcclxuICAgICAgY29uc3QgeSA9IChwYXJzZUZsb2F0KHRhcmdldC5zdHlsZS50b3ApIHx8IDApICsgZXZlbnQuZHk7XHJcblxyXG4gICAgICB0aGlzLmNvbnRhaW5lck9mZnNldCA9IHRoaXMuZ2V0Q29udGFpbmVyT2Zmc2V0KCk7XHJcblxyXG4gICAgICB0YXJnZXQuc3R5bGUubGVmdCA9IHggKyAncHgnOyAvLyBUT0RPIFthcGlkaGlybnlpXSBFeHRyYWN0IHVuaXRzIGludG8gb3B0aW9ucyBzZWN0aW9uXHJcbiAgICAgIHRhcmdldC5zdHlsZS50b3AgPSB5ICsgJ3B4JztcclxuXHJcbiAgICAgIGNvbnN0IGJlbG93RWxlbWVudCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVCeUNvb3JkaW5hdGVzKHtcclxuICAgICAgICBsZWZ0OiBldmVudC5wYWdlWCAtIHRoaXMuY29udGFpbmVyT2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgdG9wOiBldmVudC5wYWdlWSAtIHRoaXMuY29udGFpbmVyT2Zmc2V0LnRvcFxyXG4gICAgICB9LCB0aGlzLmRyYWdnZWRUaWxlKTtcclxuXHJcbiAgICAgIGlmIChiZWxvd0VsZW1lbnQpIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2VkVGlsZUluZGV4ID0gdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAuZ2V0VGlsZUluZGV4KHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG4gICAgICAgIGNvbnN0IGJlbG93RWxlbUluZGV4ID0gdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAuZ2V0VGlsZUluZGV4KGJlbG93RWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICgoZHJhZ2dlZFRpbGVJbmRleCArIDEpID09PSBiZWxvd0VsZW1JbmRleCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXBcclxuICAgICAgICAgIC5zd2FwVGlsZXModGhpcy5kcmFnZ2VkVGlsZSwgYmVsb3dFbGVtZW50KVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucyh0cnVlLCB0aGlzLmRyYWdnZWRUaWxlKTtcclxuXHJcbiAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNldEdyb3VwQ29udGFpbmVyc0hlaWdodCgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyYWdFbmRMaXN0ZW5lcigpIHtcclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZS5zdG9wRHJhZyh0aGlzLmlzU2FtZURyb3B6b25lKTtcclxuXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2RyYWctdHJhbnNmZXInKTtcclxuICAgICAgdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAgPSBudWxsO1xyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldENvbnRhaW5lck9mZnNldCgpIHtcclxuICAgICAgY29uc3QgY29udGFpbmVyUmVjdCA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBsZWZ0OiBjb250YWluZXJSZWN0LmxlZnQsXHJcbiAgICAgICAgdG9wOiBjb250YWluZXJSZWN0LnRvcFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0R3JvdXBDb250YWluZXJzSGVpZ2h0KCkge1xyXG4gICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgodGlsZUdyb3VwKSA9PiB7XHJcbiAgICAgICAgdGlsZUdyb3VwLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtb3ZlVGlsZShmcm9tLCB0bywgdGlsZSkge1xyXG4gICAgICBsZXQgZWxlbTtcclxuICAgICAgY29uc3QgbW92ZWRUaWxlID0gZnJvbS5yZW1vdmVUaWxlKHRpbGUpO1xyXG4gICAgICBjb25zdCB0aWxlU2NvcGUgPSB0aGlzLmNyZWF0ZVRpbGVTY29wZSh0aWxlKTtcclxuXHJcbiAgICAgICQodGhpcy5ncm91cHNDb250YWluZXJzW18uZmluZEluZGV4KHRoaXMudGlsZUdyb3VwcywgZnJvbSldKVxyXG4gICAgICAgIC5maW5kKG1vdmVkVGlsZS5nZXRFbGVtKCkpXHJcbiAgICAgICAgLnJlbW92ZSgpO1xyXG5cclxuICAgICAgaWYgKHRvICE9PSBudWxsKSB7XHJcbiAgICAgICAgdG8uYWRkVGlsZShtb3ZlZFRpbGUpO1xyXG5cclxuICAgICAgICBlbGVtID0gdGhpcy4kY29tcGlsZShtb3ZlZFRpbGUuZ2V0RWxlbSgpKSh0aWxlU2NvcGUpO1xyXG5cclxuICAgICAgICAkKHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tfLmZpbmRJbmRleCh0aGlzLnRpbGVHcm91cHMsIHRvKV0pXHJcbiAgICAgICAgICAuYXBwZW5kKGVsZW0pO1xyXG5cclxuICAgICAgICB0aGlzLiR0aW1lb3V0KHRvLnNldFRpbGVzRGltZW5zaW9ucy5iaW5kKHRvLCB0cnVlKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNUZW1wbGF0ZXMoJ21vdmVUaWxlJywge1xyXG4gICAgICAgIGZyb206IGZyb20sXHJcbiAgICAgICAgdG86IHRvLFxyXG4gICAgICAgIHRpbGU6IG1vdmVkVGlsZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGNvbnN0IGRyb3BwZWRHcm91cEluZGV4ID0gZXZlbnQudGFyZ2V0LmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZTtcclxuICAgICAgY29uc3QgZHJvcHBlZEdyb3VwID0gdGhpcy50aWxlR3JvdXBzW2Ryb3BwZWRHcm91cEluZGV4XTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCAhPT0gZHJvcHBlZEdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVGlsZSh0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCwgZHJvcHBlZEdyb3VwLCB0aGlzLmRyYWdnZWRUaWxlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3Vwcyh0cnVlKTtcclxuICAgICAgdGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wVG9GaWN0R3JvdXBMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBjb25zdCBmcm9tID0gdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXA7XHJcbiAgICAgIGNvbnN0IHRpbGUgPSB0aGlzLmRyYWdnZWRUaWxlO1xyXG5cclxuICAgICAgdGhpcy5hZGRHcm91cCh7XHJcbiAgICAgICAgdGl0bGU6ICdOZXcgZ3JvdXAnLFxyXG4gICAgICAgIHNvdXJjZTogW11cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubW92ZVRpbGUoZnJvbSwgdGhpcy50aWxlR3JvdXBzW3RoaXMudGlsZUdyb3Vwcy5sZW5ndGggLSAxXSwgdGlsZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3Vwcyh0cnVlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvdXJjZURyb3Bab25lRWxlbSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyb3BFbnRlckxpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGlmICghdGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0pIHtcclxuICAgICAgICB0aGlzLnNvdXJjZURyb3Bab25lRWxlbSA9IGV2ZW50LmRyYWdFdmVudC5kcmFnRW50ZXI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLnNvdXJjZURyb3Bab25lRWxlbSAhPT0gZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlcikge1xyXG4gICAgICAgIGV2ZW50LmRyYWdFdmVudC5kcmFnRW50ZXIuY2xhc3NMaXN0LmFkZCgnZHJvcHpvbmUtYWN0aXZlJyk7XHJcbiAgICAgICAgJCgnYm9keScpLmNzcygnY3Vyc29yJywgJ2NvcHknKTtcclxuICAgICAgICB0aGlzLmlzU2FtZURyb3B6b25lID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJCgnYm9keScpLmNzcygnY3Vyc29yJywgJycpO1xyXG4gICAgICAgIHRoaXMuaXNTYW1lRHJvcHpvbmUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyb3BEZWFjdGl2YXRlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgaWYgKHRoaXMuc291cmNlRHJvcFpvbmVFbGVtICE9PSBldmVudC50YXJnZXQpIHtcclxuICAgICAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLm9wdHMuYWN0aXZlRHJvcHpvbmVDbGFzcyk7XHJcbiAgICAgICAgJCgnYm9keScpLmNzcygnY3Vyc29yJywgJycpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyb3BMZWF2ZUxpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMub3B0cy5hY3RpdmVEcm9wem9uZUNsYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemUoKSB7XHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlV2lkdGggPSB0aGlzLmdldENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVDb2x1bW5zID0gdGhpcy5nZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlV2lkdGgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzQ29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5vcHRzLmdyb3VwQ29udGFuaW5lclNlbGVjdG9yKTtcclxuICAgICAgICB0aGlzLnRpbGVHcm91cHMgPSB0aGlzLmluaXRUaWxlc0dyb3Vwcyh0aGlzLmdyb3VwcywgdGhpcy5vcHRzLCB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMpO1xyXG5cclxuICAgICAgICBpbnRlcmFjdCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpXHJcbiAgICAgICAgICAuZHJhZ2dhYmxlKHtcclxuICAgICAgICAgICAgYXV0b1Njcm9sbDoge1xyXG4gICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgY29udGFpbmVyOiAkKCcjY29udGVudCcpLmdldCgwKSxcclxuICAgICAgICAgICAgICBzcGVlZDogNTAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uc3RhcnQ6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25EcmFnU3RhcnRMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25tb3ZlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJhZ01vdmVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25lbmQ6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25EcmFnRW5kTGlzdGVuZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLWdyb3VwLmZpY3QtZ3JvdXAnKVxyXG4gICAgICAgICAgLmRyb3B6b25lKHtcclxuICAgICAgICAgICAgb25kcm9wOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcFRvRmljdEdyb3VwTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJhZ2VudGVyOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcEVudGVyTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJvcGRlYWN0aXZhdGU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyYWdsZWF2ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BMZWF2ZUxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLWdyb3VwJylcclxuICAgICAgICAgIC5kcm9wem9uZSh7XHJcbiAgICAgICAgICAgIG9uZHJvcDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnZW50ZXI6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BEZWFjdGl2YXRlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJhZ2xlYXZlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRjb250YWluZXJcclxuICAgICAgICAgIC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAnbWQtbWVudSAubWQtaWNvbi1idXR0b24nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJykuZHJhZ2dhYmxlKGZhbHNlKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5vbignbW91c2V1cCB0b3VjaGVuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKS5kcmFnZ2FibGUodHJ1ZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIFxyXG4gICAgICB9LCAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IERyYWdDb21wb25lbnQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgdGlsZXNUZW1wbGF0ZXM6ICc9cGlwVGlsZXNUZW1wbGF0ZXMnLFxyXG4gICAgICB0aWxlc0NvbnRleHQ6ICc9cGlwVGlsZXNDb250ZXh0JyxcclxuICAgICAgb3B0aW9uczogJz1waXBEcmFnZ2FibGVHcmlkJyxcclxuICAgICAgZ3JvdXBNZW51QWN0aW9uczogJz1waXBHcm91cE1lbnVBY3Rpb25zJ1xyXG4gICAgfSxcclxuICAgIC8vY29udHJvbGxlckFzOiAnRHJhZ2dlZEN0cmwnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdkcmFnZ2FibGUvRHJhZ2dhYmxlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogRHJhZ2dhYmxlQ29udHJvbGxlclxyXG4gIH1cclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ3BpcERyYWdnYWJsZVRpbGVzJylcclxuICAgIC5jb21wb25lbnQoJ3BpcERyYWdnYWJsZUdyaWQnLCBEcmFnQ29tcG9uZW50KTtcclxufSIsImV4cG9ydCBpbnRlcmZhY2UgRHJhZ1RpbGVDb25zdHJ1Y3RvciB7XHJcbiAgbmV3IChvcHRpb25zOiBhbnkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSURyYWdUaWxlQ29uc3RydWN0b3IoY29uc3RydWN0b3I6IERyYWdUaWxlQ29uc3RydWN0b3IsIG9wdGlvbnM6IGFueSk6IElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHJldHVybiBuZXcgY29uc3RydWN0b3Iob3B0aW9ucyk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSURyYWdUaWxlU2VydmljZSB7XHJcbiAgdHBsOiBhbnk7XHJcbiAgb3B0czogYW55O1xyXG4gIHNpemU6IGFueTtcclxuICBlbGVtOiBhbnk7XHJcbiAgcHJldmlldzogYW55O1xyXG4gIGdldFNpemUoKTogYW55O1xyXG4gIHNldFNpemUod2lkdGgsIGhlaWdodCk6IGFueTtcclxuICBzZXRQb3NpdGlvbihsZWZ0LCB0b3ApOiBhbnk7XHJcbiAgZ2V0Q29tcGlsZWRUZW1wbGF0ZSgpOiBhbnk7XHJcbiAgdXBkYXRlRWxlbShwYXJlbnQpOiBhbnk7XHJcbiAgZ2V0RWxlbSgpOiBhbnk7XHJcbiAgc3RhcnREcmFnKCk6IGFueTtcclxuICBzdG9wRHJhZyhpc0FuaW1hdGUpOiBhbnk7XHJcbiAgc2V0UHJldmlld1Bvc2l0aW9uKGNvb3Jkcyk6IHZvaWQ7XHJcbiAgZ2V0T3B0aW9ucygpOiBhbnk7XHJcbiAgc2V0T3B0aW9ucyhvcHRpb25zKTogYW55O1xyXG59XHJcblxyXG5sZXQgREVGQVVMVF9USUxFX1NJWkUgPSB7XHJcbiAgY29sU3BhbjogMSxcclxuICByb3dTcGFuOiAxXHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgRHJhZ1RpbGVTZXJ2aWNlIGltcGxlbWVudHMgSURyYWdUaWxlU2VydmljZSB7XHJcbiAgcHVibGljIHRwbDogYW55O1xyXG4gIHB1YmxpYyBvcHRzOiBhbnk7XHJcbiAgcHVibGljIHNpemU6IGFueTtcclxuICBwdWJsaWMgZWxlbTogYW55O1xyXG4gIHB1YmxpYyBwcmV2aWV3OiBhbnk7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zOiBhbnkpIHtcclxuICAgIHRoaXMudHBsID0gb3B0aW9ucy50cGwuZ2V0KDApO1xyXG4gICAgdGhpcy5vcHRzID0gb3B0aW9ucztcclxuICAgIHRoaXMuc2l6ZSA9IF8ubWVyZ2Uoe30sIERFRkFVTFRfVElMRV9TSVpFLCBvcHRpb25zLnNpemUpO1xyXG4gICAgdGhpcy5lbGVtID0gbnVsbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRTaXplKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5zaXplO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFNpemUod2lkdGgsIGhlaWdodCk6IGFueSB7XHJcbiAgICB0aGlzLnNpemUud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuc2l6ZS5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgaWYgKHRoaXMuZWxlbSkge1xyXG4gICAgICB0aGlzLmVsZW0uY3NzKHtcclxuICAgICAgICB3aWR0aDogd2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0UG9zaXRpb24obGVmdCwgdG9wKTogYW55IHtcclxuICAgIHRoaXMuc2l6ZS5sZWZ0ID0gbGVmdDtcclxuICAgIHRoaXMuc2l6ZS50b3AgPSB0b3A7XHJcblxyXG4gICAgaWYgKHRoaXMuZWxlbSkge1xyXG4gICAgICB0aGlzLmVsZW0uY3NzKHtcclxuICAgICAgICBsZWZ0OiBsZWZ0LFxyXG4gICAgICAgIHRvcDogdG9wXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldENvbXBpbGVkVGVtcGxhdGUoKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnRwbDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgdXBkYXRlRWxlbShwYXJlbnQpOiBhbnkge1xyXG4gICAgdGhpcy5lbGVtID0gJCh0aGlzLnRwbCkucGFyZW50KHBhcmVudCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEVsZW0oKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLmVsZW0uZ2V0KDApO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKTogYW55IHtcclxuICAgIHRoaXMucHJldmlldyA9ICQoJzxkaXY+JylcclxuICAgICAgLmFkZENsYXNzKCdwaXAtZHJhZ2dlZC1wcmV2aWV3JylcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgbGVmdDogdGhpcy5lbGVtLmNzcygnbGVmdCcpLFxyXG4gICAgICAgIHRvcDogdGhpcy5lbGVtLmNzcygndG9wJyksXHJcbiAgICAgICAgd2lkdGg6IHRoaXMuZWxlbS5jc3MoJ3dpZHRoJyksXHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmVsZW0uY3NzKCdoZWlnaHQnKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVsZW1cclxuICAgICAgLmFkZENsYXNzKCduby1hbmltYXRpb24nKVxyXG4gICAgICAuY3NzKHtcclxuICAgICAgICB6SW5kZXg6ICc5OTk5J1xyXG4gICAgICB9KVxyXG4gICAgICAuYWZ0ZXIodGhpcy5wcmV2aWV3KTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3RvcERyYWcoaXNBbmltYXRlKTogYW55IHtcclxuICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICBpZiAoaXNBbmltYXRlKSB7XHJcbiAgICAgIHRoaXMuZWxlbVxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnbm8tYW5pbWF0aW9uJylcclxuICAgICAgICAuY3NzKHtcclxuICAgICAgICAgIGxlZnQ6IHRoaXMucHJldmlldy5jc3MoJ2xlZnQnKSxcclxuICAgICAgICAgIHRvcDogdGhpcy5wcmV2aWV3LmNzcygndG9wJylcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5vbigndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmVsZW1cclxuICAgICAgICAuY3NzKHtcclxuICAgICAgICAgIGxlZnQ6IHNlbGYucHJldmlldy5jc3MoJ2xlZnQnKSxcclxuICAgICAgICAgIHRvcDogc2VsZi5wcmV2aWV3LmNzcygndG9wJyksXHJcbiAgICAgICAgICB6SW5kZXg6ICcnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ25vLWFuaW1hdGlvbicpO1xyXG5cclxuICAgICAgc2VsZi5wcmV2aWV3LnJlbW92ZSgpO1xyXG4gICAgICBzZWxmLnByZXZpZXcgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIGZ1bmN0aW9uIG9uVHJhbnNpdGlvbkVuZCgpIHtcclxuICAgICAgaWYgKHNlbGYucHJldmlldykge1xyXG4gICAgICAgIHNlbGYucHJldmlldy5yZW1vdmUoKTtcclxuICAgICAgICBzZWxmLnByZXZpZXcgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZWxmLmVsZW1cclxuICAgICAgICAuY3NzKCd6SW5kZXgnLCAnJylcclxuICAgICAgICAub2ZmKCd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBwdWJsaWMgc2V0UHJldmlld1Bvc2l0aW9uKGNvb3Jkcykge1xyXG4gICAgdGhpcy5wcmV2aWV3LmNzcyhjb29yZHMpO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRPcHRpb25zKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5vcHRzLm9wdGlvbnM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldE9wdGlvbnMob3B0aW9ucyk6IGFueSB7XHJcbiAgICBfLm1lcmdlKHRoaXMub3B0cy5vcHRpb25zLCBvcHRpb25zKTtcclxuICAgIF8ubWVyZ2UodGhpcy5zaXplLCBvcHRpb25zLnNpemUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBEcmFnZ2FibGVUaWxlcycpXHJcbiAgLnNlcnZpY2UoJ3BpcERyYWdUaWxlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgIGxldCBuZXdUaWxlID0gbmV3IERyYWdUaWxlU2VydmljZShvcHRpb25zKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdUaWxlO1xyXG4gICAgfVxyXG4gIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdwaXBEcmFnZ2FibGVUaWxlcycsIFtdKTtcclxuXHJcbmltcG9ydCAnLi9EcmFnZ2FibGVUaWxlU2VydmljZSc7XHJcbmltcG9ydCAnLi9EcmFnZ2FibGUnOyIsImltcG9ydCB7XHJcbiAgTWVudVRpbGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudV90aWxlL01lbnVUaWxlU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVRpbGVDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vY29uZmlnX3RpbGVfZGlhbG9nL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG57XHJcbiAgY2xhc3MgRXZlbnRUaWxlQ29udHJvbGxlciBleHRlbmRzIE1lbnVUaWxlU2VydmljZSB7XHJcbiAgICBwcml2YXRlIF9vbGRPcGFjaXR5OiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIG9wYWNpdHk6IG51bWJlciA9IDAuNTc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICRzY29wZTogbmcuSVNjb3BlLFxyXG4gICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcFRpbGVDb25maWdEaWFsb2dTZXJ2aWNlOiBJVGlsZUNvbmZpZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWVudSkgdGhpcy5tZW51ID0gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmNvbG9yID0gdGhpcy5vcHRpb25zLmNvbG9yIHx8ICdncmF5JztcclxuICAgICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5vcHRpb25zLm9wYWNpdHkgfHwgdGhpcy5vcGFjaXR5O1xyXG5cclxuICAgICAgdGhpcy5kcmF3SW1hZ2UoKTtcclxuXHJcbiAgICAgIC8vIFRPRE8gaXQgZG9lc24ndCB3b3JrXHJcbiAgICAgICRzY29wZS4kd2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTtcclxuICAgICAgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZHJhd0ltYWdlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhd0ltYWdlKCkge1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmltYWdlKSB7XHJcbiAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uSW1hZ2VMb2FkKHRoaXMuJGVsZW1lbnQuZmluZCgnaW1nJykpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICAgIHRoaXMuX29sZE9wYWNpdHkgPSBfLmNsb25lKHRoaXMub3BhY2l0eSk7XHJcbiAgICAgIHRoaXMucGlwVGlsZUNvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICAgICAgc2l6ZTogdGhpcy5vcHRpb25zLnNpemUgfHwge1xyXG4gICAgICAgICAgICBjb2xTcGFuOiAxLFxyXG4gICAgICAgICAgICByb3dTcGFuOiAxXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGF0ZTogdGhpcy5vcHRpb25zLmRhdGUsXHJcbiAgICAgICAgICB0aXRsZTogdGhpcy5vcHRpb25zLnRpdGxlLFxyXG4gICAgICAgICAgdGV4dDogdGhpcy5vcHRpb25zLnRleHQsXHJcbiAgICAgICAgICBvcGFjaXR5OiB0aGlzLm9wYWNpdHksXHJcbiAgICAgICAgICBvbk9wYWNpdHl0ZXN0OiAob3BhY2l0eSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXh0ZW5zaW9uVXJsOiAnZXZlbnRfdGlsZS9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTaXplKHJlc3VsdC5zaXplKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSByZXN1bHQuZGF0ZTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudGl0bGUgPSByZXN1bHQudGl0bGU7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnRleHQgPSByZXN1bHQudGV4dDtcclxuICAgICAgICB0aGlzLm9wdGlvbnMub3BhY2l0eSA9IHJlc3VsdC5vcGFjaXR5O1xyXG4gICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5fb2xkT3BhY2l0eTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkltYWdlTG9hZChpbWFnZSkge1xyXG4gICAgICB0aGlzLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuJGVsZW1lbnQucGFyZW50KCksIGltYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW1hZ2UpIHtcclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2V0SW1hZ2VNYXJnaW5DU1ModGhpcy4kZWxlbWVudC5wYXJlbnQoKSwgdGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKSk7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIExhdGVyIHJlcGxhY2UgYnkgcGlwSW1hZ2VVdGlscyBzZXZpY2UncyBmdW5jdGlvblxyXG4gICAgcHJpdmF0ZSBzZXRJbWFnZU1hcmdpbkNTUygkZWxlbWVudCwgaW1hZ2UpIHtcclxuICAgICAgbGV0XHJcbiAgICAgICAgY29udGFpbmVyV2lkdGggPSAkZWxlbWVudC53aWR0aCA/ICRlbGVtZW50LndpZHRoKCkgOiAkZWxlbWVudC5jbGllbnRXaWR0aCwgLy8gfHwgODAsXHJcbiAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGVsZW1lbnQuaGVpZ2h0ID8gJGVsZW1lbnQuaGVpZ2h0KCkgOiAkZWxlbWVudC5jbGllbnRIZWlnaHQsIC8vIHx8IDgwLFxyXG4gICAgICAgIGltYWdlV2lkdGggPSBpbWFnZVswXS5uYXR1cmFsV2lkdGggfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgaW1hZ2VIZWlnaHQgPSBpbWFnZVswXS5uYXR1cmFsSGVpZ2h0IHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICBtYXJnaW4gPSAwLFxyXG4gICAgICAgIGNzc1BhcmFtcyA9IHt9O1xyXG5cclxuICAgICAgaWYgKChpbWFnZVdpZHRoIC8gY29udGFpbmVyV2lkdGgpID4gKGltYWdlSGVpZ2h0IC8gY29udGFpbmVySGVpZ2h0KSkge1xyXG4gICAgICAgIG1hcmdpbiA9IC0oKGltYWdlV2lkdGggLyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lckhlaWdodCAtIGNvbnRhaW5lcldpZHRoKSAvIDIpO1xyXG4gICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBjb250YWluZXJIZWlnaHQgKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGltYWdlV2lkdGggKiBjb250YWluZXJIZWlnaHQgLyBpbWFnZUhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VIZWlnaHQgLyBpbWFnZVdpZHRoICogY29udGFpbmVyV2lkdGggLSBjb250YWluZXJIZWlnaHQpIC8gMik7XHJcbiAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgaW1hZ2VIZWlnaHQgKiBjb250YWluZXJXaWR0aCAvIGltYWdlV2lkdGggKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGNvbnRhaW5lcldpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGltYWdlLmNzcyhjc3NQYXJhbXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIGNvbnN0IEV2ZW50VGlsZTogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogRXZlbnRUaWxlQ29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnZXZlbnRfdGlsZS9FdmVudFRpbGUuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBFdmVudFRpbGUnLCBFdmVudFRpbGUpO1xyXG59IiwiLy8gSW1wb3J0IHNlcnZpY2VzXHJcbmltcG9ydCAnLi90aWxlX2dyb3VwL2luZGV4JztcclxuaW1wb3J0ICcuL2RyYWdnYWJsZSc7XHJcblxyXG4vLyBJbXBvcnQgdGlsZSBzZXJ2aWNlc1xyXG5pbXBvcnQgJy4vbWVudV90aWxlJztcclxuXHJcbi8vIEltcG9ydCBkaWFsb2dzXHJcbmltcG9ydCAnLi9hZGRfdGlsZV9kaWFsb2cnO1xyXG5pbXBvcnQgJy4vY29uZmlnX3RpbGVfZGlhbG9nJztcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQnLCBbXHJcbiAgLy8gU2VydmljZXNcclxuICAncGlwRHJhZ2dhYmxlVGlsZXMnLFxyXG4gICdwaXBEcmFnZ2FibGVUaWxlc0dyb3VwJyxcclxuICAvLyBUaWxlIHNlcnZpY2VzXHJcbiAgJ3BpcE1lbnVUaWxlJyxcclxuICAvLyBEaWFsb2dzXHJcbiAgJ3BpcENvbmZpZ0Rhc2hib2FyZFRpbGVEaWFsb2cnLFxyXG4gICdwaXBBZGREYXNoYm9hcmRUaWxlRGlhbG9nJyxcclxuICAvL1RlbXBsYXRlc1xyXG4gICdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyxcclxuICAvLyBFeHRlcm5hbCBwaXAgbW9kdWxlc1xyXG4gICdwaXBMYXlvdXQnLFxyXG4gICdwaXBMb2NhdGlvbnMnLFxyXG4gICdwaXBEYXRlVGltZScsXHJcbiAgJ3BpcENoYXJ0cycsXHJcbiAgJ3BpcFRyYW5zbGF0ZScsXHJcbiAgJ3BpcENvbnRyb2xzJyxcclxuICAncGlwQnV0dG9ucydcclxuXSk7XHJcblxyXG4vLyBJbXBvcnQgdXRpbGl0eSBcclxuaW1wb3J0ICcuL3V0aWxpdHkvVGlsZVRlbXBsYXRlVXRpbGl0eSc7XHJcbi8vIEltcG9ydCB0aWxlc1xyXG5pbXBvcnQgJy4vY29tbW9uX3RpbGUvVGlsZSc7XHJcbmltcG9ydCAnLi9jYWxlbmRhcl90aWxlL0NhbGVuZGFyVGlsZSc7XHJcbmltcG9ydCAnLi9ldmVudF90aWxlL0V2ZW50VGlsZSc7XHJcbmltcG9ydCAnLi9ub3RlX3RpbGUvTm90ZVRpbGUnO1xyXG5pbXBvcnQgJy4vcGljdHVyZV9zbGlkZXJfdGlsZS9QaWN0dXJlU2xpZGVyVGlsZSc7XHJcbmltcG9ydCAnLi9wb3NpdGlvbl90aWxlL1Bvc2l0aW9uVGlsZSc7XHJcbmltcG9ydCAnLi9zdGF0aXN0aWNzX3RpbGUvU3RhdGlzdGljc1RpbGUnO1xyXG4vLyBJbXBvcnQgY29tbW9uIGNvbXBvbmVudFxyXG5pbXBvcnQgJy4vZGFzaGJvYXJkL0Rhc2hib2FyZCc7XHJcbiIsIntcclxuICBjb25zdCBUaWxlTWVudSA9ICgpOm5nLklEaXJlY3RpdmUgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnbWVudV90aWxlL01lbnVUaWxlLmh0bWwnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwTWVudVRpbGUnKVxyXG4gICAgLmRpcmVjdGl2ZSgncGlwVGlsZU1lbnUnLCBUaWxlTWVudSk7XHJcbn0iLCJpbXBvcnQgeyBEYXNoYm9hcmRUaWxlIH0gZnJvbSAnLi4vY29tbW9uX3RpbGUvVGlsZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgTWVudVRpbGVTZXJ2aWNlIGV4dGVuZHMgRGFzaGJvYXJkVGlsZSB7XHJcbiAgcHVibGljIG1lbnU6IGFueSA9IFt7XHJcbiAgICB0aXRsZTogJ0NoYW5nZSBTaXplJyxcclxuICAgIGFjdGlvbjogYW5ndWxhci5ub29wLFxyXG4gICAgc3VibWVudTogW3tcclxuICAgICAgICB0aXRsZTogJzEgeCAxJyxcclxuICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgIHNpemVYOiAxLFxyXG4gICAgICAgICAgc2l6ZVk6IDFcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJzIgeCAxJyxcclxuICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgIHNpemVYOiAyLFxyXG4gICAgICAgICAgc2l6ZVk6IDFcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJzIgeCAyJyxcclxuICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgIHNpemVYOiAyLFxyXG4gICAgICAgICAgc2l6ZVk6IDJcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9XTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjYWxsQWN0aW9uKGFjdGlvbk5hbWUsIHBhcmFtcywgaXRlbSkge1xyXG4gICAgaWYgKHRoaXNbYWN0aW9uTmFtZV0pIHtcclxuICAgICAgdGhpc1thY3Rpb25OYW1lXS5jYWxsKHRoaXMsIHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGl0ZW1bJ2NsaWNrJ10pIHtcclxuICAgICAgaXRlbVsnY2xpY2snXS5jYWxsKGl0ZW0sIHBhcmFtcywgdGhpcyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuICB9O1xyXG59XHJcblxyXG57XHJcbiAgY2xhc3MgTWVudVRpbGVQcm92aWRlciB7XHJcbiAgICBwcml2YXRlIF9zZXJ2aWNlOiBNZW51VGlsZVNlcnZpY2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIHB1YmxpYyAkZ2V0KCkge1xyXG4gICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICBpZiAodGhpcy5fc2VydmljZSA9PSBudWxsKVxyXG4gICAgICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgTWVudVRpbGVTZXJ2aWNlKCk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5fc2VydmljZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcE1lbnVUaWxlJylcclxuICAgIC5wcm92aWRlcigncGlwTWVudVRpbGUnLCBNZW51VGlsZVByb3ZpZGVyKTtcclxufSIsImFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcE1lbnVUaWxlJywgW10pO1xyXG5cclxuaW1wb3J0ICcuL01lbnVUaWxlRGlyZWN0aXZlJztcclxuaW1wb3J0ICcuL01lbnVUaWxlU2VydmljZSc7XHJcblxyXG5leHBvcnQgKiBmcm9tICcuL01lbnVUaWxlU2VydmljZSc7IiwiaW1wb3J0IHtcclxuICBNZW51VGlsZVNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51X3RpbGUvTWVudVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJVGlsZUNvbmZpZ1NlcnZpY2VcclxufSBmcm9tICcuLi9jb25maWdfdGlsZV9kaWFsb2cvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcblxyXG57XHJcbiAgY2xhc3MgTm90ZVRpbGVDb250cm9sbGVyIGV4dGVuZHMgTWVudVRpbGVTZXJ2aWNlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSBwaXBUaWxlQ29uZmlnRGlhbG9nU2VydmljZTogSVRpbGVDb25maWdTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm1lbnUgPSB0aGlzLm9wdGlvbnMubWVudSA/IF8udW5pb24odGhpcy5tZW51LCB0aGlzLm9wdGlvbnMubWVudSkgOiB0aGlzLm1lbnU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICB0aXRsZTogJ0NvbmZpZ3VyYXRlJyxcclxuICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5jb2xvciA9IHRoaXMub3B0aW9ucy5jb2xvciB8fCAnb3JhbmdlJztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICAgIHRoaXMucGlwVGlsZUNvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgbG9jYWxzOiB7XHJcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgdGl0bGU6IHRoaXMub3B0aW9ucy50aXRsZSxcclxuICAgICAgICAgIHRleHQ6IHRoaXMub3B0aW9ucy50ZXh0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXh0ZW5zaW9uVXJsOiAnbm90ZV90aWxlL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50ZXh0ID0gcmVzdWx0LnRleHQ7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnRpdGxlID0gcmVzdWx0LnRpdGxlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IE5vdGVUaWxlOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBOb3RlVGlsZUNvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ25vdGVfdGlsZS9Ob3RlVGlsZS5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb21wb25lbnQoJ3BpcE5vdGVUaWxlJywgTm90ZVRpbGUpO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHtcclxuICBNZW51VGlsZVNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51X3RpbGUvTWVudVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJVGlsZUNvbmZpZ1NlcnZpY2VcclxufSBmcm9tICcuLi9jb25maWdfdGlsZV9kaWFsb2cvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVRpbGVUZW1wbGF0ZVNlcnZpY2VcclxufSBmcm9tICcuLi91dGlsaXR5L1RpbGVUZW1wbGF0ZVV0aWxpdHknO1xyXG5cclxue1xyXG4gIGNsYXNzIFBpY3R1cmVTbGlkZXJDb250cm9sbGVyIGV4dGVuZHMgTWVudVRpbGVTZXJ2aWNlIHtcclxuICAgIHB1YmxpYyBhbmltYXRpb25UeXBlOiBzdHJpbmcgPSAnZmFkaW5nJztcclxuICAgIHB1YmxpYyBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyID0gNTAwMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICBwcml2YXRlICRlbGVtZW50OiBhbnksXHJcbiAgICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcFRpbGVUZW1wbGF0ZTogSVRpbGVUZW1wbGF0ZVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uVHlwZSA9IHRoaXMub3B0aW9ucy5hbmltYXRpb25UeXBlIHx8IHRoaXMuYW5pbWF0aW9uVHlwZTtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbkludGVydmFsID0gdGhpcy5vcHRpb25zLmFuaW1hdGlvbkludGVydmFsIHx8IHRoaXMuYW5pbWF0aW9uSW50ZXJ2YWw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25JbWFnZUxvYWQoJGV2ZW50KSB7XHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucGlwVGlsZVRlbXBsYXRlLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuJGVsZW1lbnQucGFyZW50KCksICRldmVudC50YXJnZXQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpLCAoaW1hZ2UpID0+IHtcclxuICAgICAgICAgIHRoaXMucGlwVGlsZVRlbXBsYXRlLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuJGVsZW1lbnQucGFyZW50KCksIGltYWdlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IFBpY3R1cmVTbGlkZXJUaWxlOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBQaWN0dXJlU2xpZGVyQ29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAncGljdHVyZV9zbGlkZXJfdGlsZS9QaWN0dXJlU2xpZGVyVGlsZS5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb21wb25lbnQoJ3BpcFBpY3R1cmVTbGlkZXJUaWxlJywgUGljdHVyZVNsaWRlclRpbGUpO1xyXG59IiwiaW1wb3J0IHtcclxuICBNZW51VGlsZVNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51X3RpbGUvTWVudVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJVGlsZUNvbmZpZ1NlcnZpY2VcclxufSBmcm9tICcuLi9jb25maWdfdGlsZV9kaWFsb2cvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcblxyXG57XHJcbiAgY2xhc3MgUG9zaXRpb25UaWxlQ29udHJvbGxlciBleHRlbmRzIE1lbnVUaWxlU2VydmljZSB7XHJcbiAgICBwdWJsaWMgc2hvd1Bvc2l0aW9uOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFueSxcclxuICAgICAgcHJpdmF0ZSBwaXBUaWxlQ29uZmlnRGlhbG9nU2VydmljZTogSVRpbGVDb25maWdTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcExvY2F0aW9uRWRpdERpYWxvZzogYW55LFxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tZW51KSB0aGlzLm1lbnUgPSBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLm1lbnUucHVzaCh7XHJcbiAgICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub25Db25maWdDbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICB0aXRsZTogJ0NoYW5nZSBsb2NhdGlvbicsXHJcbiAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub3BlbkxvY2F0aW9uRWRpdERpYWxvZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLm9wdGlvbnMubG9jYXRpb24gPSB0aGlzLm9wdGlvbnMubG9jYXRpb24gfHwgdGhpcy5vcHRpb25zLnBvc2l0aW9uO1xyXG5cclxuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwub3B0aW9ucy5sb2NhdGlvbicsICgpID0+IHtcclxuICAgICAgICB0aGlzLnJlRHJhd1Bvc2l0aW9uKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gVE9ETyBpdCBkb2Vzbid0IHdvcmtcclxuICAgICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICRlbGVtZW50LmlzKCc6dmlzaWJsZScpO1xyXG4gICAgICB9LCAobmV3VmFsKSA9PiB7XHJcbiAgICAgICAgaWYgKG5ld1ZhbCA9PSB0cnVlKSB0aGlzLnJlRHJhd1Bvc2l0aW9uKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Db25maWdDbGljaygpIHtcclxuICAgICAgdGhpcy5waXBUaWxlQ29uZmlnRGlhbG9nU2VydmljZS5zaG93KHtcclxuICAgICAgICBkaWFsb2dDbGFzczogJ3BpcC1wb3NpdGlvbi1jb25maWcnLFxyXG4gICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgc2l6ZTogdGhpcy5vcHRpb25zLnNpemUsXHJcbiAgICAgICAgICBsb2NhdGlvbk5hbWU6IHRoaXMub3B0aW9ucy5sb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgICBoaWRlQ29sb3JzOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXh0ZW5zaW9uVXJsOiAncG9zaXRpb25fdGlsZS9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTaXplKHJlc3VsdC5zaXplKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMubG9jYXRpb25OYW1lID0gcmVzdWx0LmxvY2F0aW9uTmFtZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcblxyXG4gICAgICB0aGlzLnJlRHJhd1Bvc2l0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wZW5Mb2NhdGlvbkVkaXREaWFsb2coKSB7XHJcbiAgICAgIHRoaXMucGlwTG9jYXRpb25FZGl0RGlhbG9nLnNob3coe1xyXG4gICAgICAgIGxvY2F0aW9uTmFtZTogdGhpcy5vcHRpb25zLmxvY2F0aW9uTmFtZSxcclxuICAgICAgICBsb2NhdGlvblBvczogdGhpcy5vcHRpb25zLmxvY2F0aW9uXHJcbiAgICAgIH0sIChuZXdQb3NpdGlvbikgPT4ge1xyXG4gICAgICAgIGlmIChuZXdQb3NpdGlvbikge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uID0gbmV3UG9zaXRpb24ubG9jYXRpb247XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMubG9jYXRpb25OYW1lID0gbmV3UG9zaXRpb24ubG9jYXRpb05hbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlRHJhd1Bvc2l0aW9uKCkge1xyXG4gICAgICB0aGlzLnNob3dQb3NpdGlvbiA9IGZhbHNlO1xyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnNob3dQb3NpdGlvbiA9IHRydWU7XHJcbiAgICAgIH0sIDUwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICBjb25zdCBQb3NpdGlvblRpbGU6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IFBvc2l0aW9uVGlsZUNvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3Bvc2l0aW9uX3RpbGUvUG9zaXRpb25UaWxlLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEYXNoYm9hcmQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwUG9zaXRpb25UaWxlJywgUG9zaXRpb25UaWxlKTtcclxufSIsImltcG9ydCB7XHJcbiAgTWVudVRpbGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudV90aWxlL01lbnVUaWxlU2VydmljZSc7XHJcblxyXG57XHJcbiAgY29uc3QgU01BTExfQ0hBUlQ6IG51bWJlciA9IDcwO1xyXG4gIGNvbnN0IEJJR19DSEFSVDogbnVtYmVyID0gMjUwO1xyXG5cclxuICBjbGFzcyBTdGF0aXN0aWNzVGlsZUNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51VGlsZVNlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICAgIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuXHJcbiAgICBwdWJsaWMgcmVzZXQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBjaGFydFNpemU6IG51bWJlciA9IFNNQUxMX0NIQVJUO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0ID0gJHRpbWVvdXQ7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpcy5vcHRpb25zLm1lbnUgPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpIDogdGhpcy5tZW51O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldENoYXJ0U2l6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgICAgdGhpcy5yZXNldCA9IHRydWU7XHJcbiAgICAgIHRoaXMuc2V0Q2hhcnRTaXplKCk7XHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnJlc2V0ID0gZmFsc2U7XHJcbiAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRDaGFydFNpemUoKSB7XHJcbiAgICAgIHRoaXMuY2hhcnRTaXplID0gdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHRoaXMub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiA/IEJJR19DSEFSVCA6IFNNQUxMX0NIQVJUO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIGNvbnN0IFN0YXRpc3RpY3NUaWxlOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBTdGF0aXN0aWNzVGlsZUNvbnRyb2xsZXIsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3N0YXRpc3RpY3NfdGlsZS9TdGF0aXN0aWNzVGlsZS5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5jb21wb25lbnQoJ3BpcFN0YXRpc3RpY3NUaWxlJywgU3RhdGlzdGljc1RpbGUpO1xyXG59Iiwie1xyXG4gIGludGVyZmFjZSBEcmFnZ2FibGVUaWxlQXR0cmlidXRlcyBleHRlbmRzIG5nLklBdHRyaWJ1dGVzIHtcclxuICAgIHBpcERyYWdnYWJsZVRpbGVzOiBhbnk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBEcmFnZ2FibGVUaWxlTGluayhcclxuICAgICRzY29wZTogbmcuSVNjb3BlLFxyXG4gICAgJGVsZW06IEpRdWVyeSxcclxuICAgICRhdHRyOiBEcmFnZ2FibGVUaWxlQXR0cmlidXRlc1xyXG4gICkge1xyXG4gICAgY29uc3QgZG9jRnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxcclxuICAgICAgZ3JvdXAgPSAkc2NvcGUuJGV2YWwoJGF0dHIucGlwRHJhZ2dhYmxlVGlsZXMpO1xyXG5cclxuICAgIGdyb3VwLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcclxuICAgICAgY29uc3QgdHBsID0gd3JhcENvbXBvbmVudCh0aWxlLmdldENvbXBpbGVkVGVtcGxhdGUoKSk7XHJcbiAgICAgIGRvY0ZyYWcuYXBwZW5kQ2hpbGQodHBsKTtcclxuICAgIH0pO1xyXG5cclxuICAgICRlbGVtLmFwcGVuZChkb2NGcmFnKTtcclxuXHJcbiAgICBmdW5jdGlvbiB3cmFwQ29tcG9uZW50KGVsZW0pIHtcclxuICAgICAgcmV0dXJuICQoJzxkaXY+JylcclxuICAgICAgICAuYWRkQ2xhc3MoJ3BpcC1kcmFnZ2FibGUtdGlsZScpXHJcbiAgICAgICAgLmFwcGVuZChlbGVtKVxyXG4gICAgICAgIC5nZXQoMCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBEcmFnZ2FibGVUaWxlcygpOiBuZy5JRGlyZWN0aXZlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uKFxyXG4gICAgICAgICRzY29wZTogbmcuSVNjb3BlLFxyXG4gICAgICAgICRlbGVtOiBKUXVlcnksXHJcbiAgICAgICAgJGF0dHI6IERyYWdnYWJsZVRpbGVBdHRyaWJ1dGVzXHJcbiAgICAgICkge1xyXG4gICAgICAgICAgbmV3IERyYWdnYWJsZVRpbGVMaW5rKCRzY29wZSwgJGVsZW0sICRhdHRyKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERyYWdnYWJsZVRpbGVzR3JvdXAnKVxyXG4gICAgLmRpcmVjdGl2ZSgncGlwRHJhZ2dhYmxlVGlsZXMnLCBEcmFnZ2FibGVUaWxlcyk7XHJcbn0iLCJleHBvcnQgaW50ZXJmYWNlIFRpbGVzR3JpZENvbnN0cnVjdG9yIHtcclxuICBuZXcodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSVRpbGVzR3JpZENvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBUaWxlc0dyaWRDb25zdHJ1Y3RvciwgdGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pOiBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgcmV0dXJuIG5ldyBjb25zdHJ1Y3Rvcih0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVRpbGVzR3JpZFNlcnZpY2Uge1xyXG4gIHRpbGVzOiBhbnk7XHJcbiAgb3B0czogYW55O1xyXG4gIGNvbHVtbnM6IGFueTtcclxuICBlbGVtOiBhbnk7XHJcbiAgZ3JpZENlbGxzOiBhbnk7XHJcbiAgaW5saW5lOiBib29sZWFuO1xyXG4gIGlzTW9iaWxlTGF5b3V0OiBib29sZWFuO1xyXG5cclxuICBhZGRUaWxlKHRpbGUpOiBhbnk7XHJcbiAgZ2V0Q2VsbEJ5UG9zaXRpb24ocm93LCBjb2wpOiBhbnk7XHJcbiAgZ2V0Q2VsbHMocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55O1xyXG4gIGdldENlbGwoc3JjLCBiYXNpY1JvdywgYmFzaWNDb2wsIGNvbHVtbnMpOiBhbnk7XHJcbiAgZ2V0QXZhaWxhYmxlQ2VsbHNNb2JpbGUocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0QmFzaWNSb3cocHJldkNlbGwpOiBhbnk7XHJcbiAgaXNDZWxsRnJlZShyb3csIGNvbCk6IGFueTtcclxuICBnZXRDZWxsSW5kZXgoc3JjQ2VsbCk6IGFueTtcclxuICByZXNlcnZlQ2VsbHMoc3RhcnQsIGVuZCwgZWxlbSk6IHZvaWQ7XHJcbiAgY2xlYXJFbGVtZW50cygpOiB2b2lkO1xyXG4gIHNldEF2YWlsYWJsZUNvbHVtbnMoY29sdW1ucyk6IGFueTtcclxuICBnZW5lcmF0ZUdyaWQoc2luZ2xlVGlsZVdpZHRoID8gKTogYW55O1xyXG4gIHNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGNhbGNDb250YWluZXJIZWlnaHQoKTogYW55O1xyXG4gIGdldFRpbGVCeU5vZGUobm9kZSk6IGFueTtcclxuICBnZXRUaWxlQnlDb29yZGluYXRlcyhjb29yZHMsIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGdldFRpbGVJbmRleCh0aWxlKTogYW55O1xyXG4gIHN3YXBUaWxlcyhtb3ZlZFRpbGUsIGJlZm9yZVRpbGUpOiBhbnk7XHJcbiAgcmVtb3ZlVGlsZShyZW1vdmVUaWxlKTogYW55O1xyXG4gIHVwZGF0ZVRpbGVPcHRpb25zKG9wdHMpOiBhbnk7XHJcbn1cclxuXHJcbmNvbnN0IE1PQklMRV9MQVlPVVRfQ09MVU1OUyA9IDI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGlsZXNHcmlkU2VydmljZSBpbXBsZW1lbnRzIElUaWxlc0dyaWRTZXJ2aWNlIHtcclxuICBwdWJsaWMgdGlsZXM6IGFueTtcclxuICBwdWJsaWMgb3B0czogYW55O1xyXG4gIHB1YmxpYyBjb2x1bW5zOiBhbnk7XHJcbiAgcHVibGljIGVsZW06IGFueTtcclxuICBwdWJsaWMgZ3JpZENlbGxzOiBhbnkgPSBbXTtcclxuICBwdWJsaWMgaW5saW5lOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzTW9iaWxlTGF5b3V0OiBib29sZWFuO1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSkge1xyXG4gICAgdGhpcy50aWxlcyA9IHRpbGVzO1xyXG4gICAgdGhpcy5vcHRzID0gb3B0aW9ucztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnMgfHwgMDsgLy8gYXZhaWxhYmxlIGNvbHVtbnMgaW4gYSByb3dcclxuICAgIHRoaXMuZWxlbSA9IGVsZW07XHJcbiAgICB0aGlzLmdyaWRDZWxscyA9IFtdO1xyXG4gICAgdGhpcy5pbmxpbmUgPSBvcHRpb25zLmlubGluZSB8fCBmYWxzZTtcclxuICAgIHRoaXMuaXNNb2JpbGVMYXlvdXQgPSBjb2x1bW5zID09PSBNT0JJTEVfTEFZT1VUX0NPTFVNTlM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkVGlsZSh0aWxlKTogYW55IHtcclxuICAgIHRoaXMudGlsZXMucHVzaCh0aWxlKTtcclxuICAgIGlmICh0aGlzLnRpbGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICB0aGlzLmdlbmVyYXRlR3JpZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsQnlQb3NpdGlvbihyb3csIGNvbCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkQ2VsbHNbcm93XVtjb2xdO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxscyhwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueSB7XHJcbiAgICBpZiAodGhpcy5pc01vYmlsZUxheW91dCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnkge1xyXG4gICAgbGV0IGxlZnRDb3JuZXJDZWxsO1xyXG4gICAgbGV0IHJpZ2h0Q29ybmVyQ2VsbDtcclxuICAgIGNvbnN0IGJhc2ljQ29sID0gcHJldkNlbGwgJiYgcHJldkNlbGwuY29sIHx8IDA7XHJcbiAgICBjb25zdCBiYXNpY1JvdyA9IHRoaXMuZ2V0QmFzaWNSb3cocHJldkNlbGwpO1xyXG5cclxuICAgIC8vIFNtYWxsIHRpbGVcclxuICAgIGlmIChjb2xTcGFuID09PSAxICYmIHJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgY29uc3QgZ3JpZENvcHkgPSB0aGlzLmdyaWRDZWxscy5zbGljZSgpO1xyXG5cclxuICAgICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gZ3JpZENvcHlbMF1bMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93LCBiYXNpY0NvbCwgdGhpcy5jb2x1bW5zKTtcclxuXHJcbiAgICAgICAgaWYgKCFsZWZ0Q29ybmVyQ2VsbCkge1xyXG4gICAgICAgICAgY29uc3Qgcm93U2hpZnQgPSB0aGlzLmlzTW9iaWxlTGF5b3V0ID8gMSA6IDI7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3cgKyByb3dTaGlmdCwgMCwgdGhpcy5jb2x1bW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNZWRpdW0gdGlsZVxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDIgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBjb25zdCBwcmV2VGlsZVNpemUgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5lbGVtLnNpemUgfHwgbnVsbDtcclxuXHJcbiAgICAgIGlmICghcHJldlRpbGVTaXplKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMikge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDIgPiAwKSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAocHJldlRpbGVTaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldlRpbGVTaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAocHJldkNlbGwucm93ICUgMiA9PT0gMCkge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgLSAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMSAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuaXNDZWxsRnJlZShiYXNpY1JvdywgYmFzaWNDb2wgKyAxKSkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJpZyB0aWxlXHJcbiAgICBpZiAoIXByZXZDZWxsICYmIHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sICsgMSk7XHJcbiAgICB9IGVsc2UgaWYgKHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBpZiAodGhpcy5jb2x1bW5zIC0gYmFzaWNDb2wgLSAyID4gMCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ2VsbEZyZWUoYmFzaWNSb3csIGJhc2ljQ29sICsgMSkpIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgKyAzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDMsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueSB7XHJcbiAgICBsZXQgY2VsbCwgY29sLCByb3c7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNNb2JpbGVMYXlvdXQpIHtcclxuICAgICAgLy8gbW9iaWxlIGxheW91dFxyXG4gICAgICBmb3IgKGNvbCA9IGJhc2ljQ29sOyBjb2wgPCBjb2x1bW5zOyBjb2wrKykge1xyXG4gICAgICAgIGlmICghc3JjW2Jhc2ljUm93XVtjb2xdLmVsZW0pIHtcclxuICAgICAgICAgIGNlbGwgPSBzcmNbYmFzaWNSb3ddW2NvbF07XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjZWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlc2t0b3BcclxuICAgIGZvciAoY29sID0gYmFzaWNDb2w7IGNvbCA8IGNvbHVtbnM7IGNvbCsrKSB7XHJcbiAgICAgIGZvciAocm93ID0gMDsgcm93IDwgMjsgcm93KyspIHtcclxuICAgICAgICBpZiAoIXNyY1tyb3cgKyBiYXNpY1Jvd11bY29sXS5lbGVtKSB7XHJcbiAgICAgICAgICBjZWxsID0gc3JjW3JvdyArIGJhc2ljUm93XVtjb2xdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2VsbCkge1xyXG4gICAgICAgIHJldHVybiBjZWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEF2YWlsYWJsZUNlbGxzTW9iaWxlKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55IHtcclxuICAgIGxldCBsZWZ0Q29ybmVyQ2VsbDtcclxuICAgIGxldCByaWdodENvcm5lckNlbGw7XHJcbiAgICBjb25zdCBiYXNpY1JvdyA9IHRoaXMuZ2V0QmFzaWNSb3cocHJldkNlbGwpO1xyXG4gICAgY29uc3QgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuXHJcblxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDEgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBjb25zdCBncmlkQ29weSA9IHRoaXMuZ3JpZENlbGxzLnNsaWNlKCk7XHJcblxyXG4gICAgICBpZiAoIXByZXZDZWxsKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSBncmlkQ29weVswXVswXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3csIGJhc2ljQ29sLCB0aGlzLmNvbHVtbnMpO1xyXG5cclxuICAgICAgICBpZiAoIWxlZnRDb3JuZXJDZWxsKSB7XHJcbiAgICAgICAgICBjb25zdCByb3dTaGlmdCA9IHRoaXMuaXNNb2JpbGVMYXlvdXQgPyAxIDogMjtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdyArIHJvd1NoaWZ0LCAwLCB0aGlzLmNvbHVtbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghcHJldkNlbGwpIHtcclxuICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCAwKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIHJvd1NwYW4gLSAxLCAxKTtcclxuICAgIH0gZWxzZSBpZiAoY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCAwKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIHJvd1NwYW4sIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXJ0OiBsZWZ0Q29ybmVyQ2VsbCxcclxuICAgICAgZW5kOiByaWdodENvcm5lckNlbGxcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEJhc2ljUm93KHByZXZDZWxsKTogYW55IHtcclxuICAgIGxldCBiYXNpY1JvdztcclxuXHJcbiAgICBpZiAodGhpcy5pc01vYmlsZUxheW91dCkge1xyXG4gICAgICBpZiAocHJldkNlbGwpIHtcclxuICAgICAgICBiYXNpY1JvdyA9IHByZXZDZWxsICYmIHByZXZDZWxsLnJvdyB8fCAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2ljUm93ID0gMDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHByZXZDZWxsKSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSBwcmV2Q2VsbC5yb3cgJSAyID09PSAwID8gcHJldkNlbGwucm93IDogcHJldkNlbGwucm93IC0gMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBiYXNpY1JvdyA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYmFzaWNSb3c7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGlzQ2VsbEZyZWUocm93LCBjb2wpOiBhbnkge1xyXG4gICAgcmV0dXJuICF0aGlzLmdyaWRDZWxsc1tyb3ddW2NvbF0uZWxlbTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbEluZGV4KHNyY0NlbGwpOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgaW5kZXg7XHJcblxyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xyXG4gICAgICBpbmRleCA9IF8uZmluZEluZGV4KHNlbGYuZ3JpZENlbGxzW3Jvd0luZGV4XSwgKGNlbGwpID0+IHtcclxuICAgICAgICByZXR1cm4gY2VsbCA9PT0gc3JjQ2VsbDtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gaW5kZXggIT09IC0xID8gaW5kZXggOiAwO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyByZXNlcnZlQ2VsbHMoc3RhcnQsIGVuZCwgZWxlbSkge1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgIHJvdy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgaWYgKGNlbGwucm93ID49IHN0YXJ0LnJvdyAmJiBjZWxsLnJvdyA8PSBlbmQucm93ICYmXHJcbiAgICAgICAgICBjZWxsLmNvbCA+PSBzdGFydC5jb2wgJiYgY2VsbC5jb2wgPD0gZW5kLmNvbCkge1xyXG4gICAgICAgICAgY2VsbC5lbGVtID0gZWxlbTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNsZWFyRWxlbWVudHMoKSB7XHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgcm93LmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICB0aWxlLmVsZW0gPSBudWxsO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRBdmFpbGFibGVDb2x1bW5zKGNvbHVtbnMpOiBhbnkge1xyXG4gICAgdGhpcy5pc01vYmlsZUxheW91dCA9IGNvbHVtbnMgPT09IE1PQklMRV9MQVlPVVRfQ09MVU1OUztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnM7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGggPyApOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXMsXHJcbiAgICAgIHRpbGVXaWR0aCA9IHNpbmdsZVRpbGVXaWR0aCB8fCB0aGlzLm9wdHMudGlsZVdpZHRoLFxyXG4gICAgICBvZmZzZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGlwLWRyYWdnYWJsZS1ncm91cC10aXRsZScpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgbGV0IGNvbHNJblJvdyA9IDAsXHJcbiAgICAgIHJvd3MgPSAwLFxyXG4gICAgICBncmlkSW5Sb3cgPSBbXTtcclxuXHJcbiAgICB0aGlzLmdyaWRDZWxscyA9IFtdO1xyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSwgaW5kZXgsIHNyY1RpbGVzKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcblxyXG4gICAgICBnZW5lcmF0ZUNlbGxzKHRpbGVTaXplLmNvbFNwYW4pO1xyXG5cclxuICAgICAgaWYgKHNyY1RpbGVzLmxlbmd0aCA9PT0gaW5kZXggKyAxKSB7XHJcbiAgICAgICAgaWYgKGNvbHNJblJvdyA8IHNlbGYuY29sdW1ucykge1xyXG4gICAgICAgICAgZ2VuZXJhdGVDZWxscyhzZWxmLmNvbHVtbnMgLSBjb2xzSW5Sb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgbW9yZSBjZWxscyBmb3IgZXh0ZW5kcyB0aWxlIHNpemUgdG8gYmlnXHJcbiAgICAgICAgaWYgKHNlbGYudGlsZXMubGVuZ3RoICogMiA+IHNlbGYuZ3JpZENlbGxzLmxlbmd0aCkge1xyXG4gICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkoc2VsZi50aWxlcy5sZW5ndGggKiAyIC0gc2VsZi5ncmlkQ2VsbHMubGVuZ3RoKSkuZm9yRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGdlbmVyYXRlQ2VsbHMoc2VsZi5jb2x1bW5zKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDZWxscyhuZXdDZWxsQ291bnQpIHtcclxuICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkobmV3Q2VsbENvdW50KSkuZm9yRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHNlbGYuY29sdW1ucyA8IGNvbHNJblJvdyArIDEpIHtcclxuICAgICAgICAgIHJvd3MrKztcclxuICAgICAgICAgIGNvbHNJblJvdyA9IDA7XHJcblxyXG4gICAgICAgICAgc2VsZi5ncmlkQ2VsbHMucHVzaChncmlkSW5Sb3cpO1xyXG4gICAgICAgICAgZ3JpZEluUm93ID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdG9wID0gcm93cyAqIHNlbGYub3B0cy50aWxlSGVpZ2h0ICsgKHJvd3MgPyByb3dzICogc2VsZi5vcHRzLmd1dHRlciA6IDApICsgb2Zmc2V0LmhlaWdodDtcclxuICAgICAgICBsZXQgbGVmdCA9IGNvbHNJblJvdyAqIHRpbGVXaWR0aCArIChjb2xzSW5Sb3cgPyBjb2xzSW5Sb3cgKiBzZWxmLm9wdHMuZ3V0dGVyIDogMCk7XHJcblxyXG4gICAgICAgIC8vIERlc2NyaWJlIGdyaWQgY2VsbCBzaXplIHRocm91Z2ggYmxvY2sgY29ybmVycyBjb29yZGluYXRlc1xyXG4gICAgICAgIGdyaWRJblJvdy5wdXNoKHtcclxuICAgICAgICAgIHRvcDogdG9wLFxyXG4gICAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICAgIGJvdHRvbTogdG9wICsgc2VsZi5vcHRzLnRpbGVIZWlnaHQsXHJcbiAgICAgICAgICByaWdodDogbGVmdCArIHRpbGVXaWR0aCxcclxuICAgICAgICAgIHJvdzogcm93cyxcclxuICAgICAgICAgIGNvbDogY29sc0luUm93XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbHNJblJvdysrO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc2V0VGlsZXNEaW1lbnNpb25zKG9ubHlQb3NpdGlvbiwgZHJhZ2dlZFRpbGUpOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgY3VyckluZGV4ID0gMDtcclxuICAgIGxldCBwcmV2Q2VsbDtcclxuXHJcbiAgICBpZiAob25seVBvc2l0aW9uKSB7XHJcbiAgICAgIHNlbGYuY2xlYXJFbGVtZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGUuZ2V0U2l6ZSgpO1xyXG4gICAgICBsZXQgc3RhcnRDZWxsO1xyXG4gICAgICBsZXQgd2lkdGg7XHJcbiAgICAgIGxldCBoZWlnaHQ7XHJcbiAgICAgIGxldCBjZWxscztcclxuXHJcbiAgICAgIHRpbGUudXBkYXRlRWxlbSgnLnBpcC1kcmFnZ2FibGUtdGlsZScpO1xyXG4gICAgICBpZiAodGlsZVNpemUuY29sU3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmIChwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5lbGVtLnNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2Q2VsbC5lbGVtLnNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgICAgc3RhcnRDZWxsID0gc2VsZi5nZXRDZWxscyhzZWxmLmdldENlbGxCeVBvc2l0aW9uKHByZXZDZWxsLnJvdywgcHJldkNlbGwuY29sIC0gMSksIDEsIDEpLnN0YXJ0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzdGFydENlbGwgPSBzZWxmLmdldENlbGxzKHByZXZDZWxsLCAxLCAxKS5zdGFydDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgd2lkdGggPSBzdGFydENlbGwucmlnaHQgLSBzdGFydENlbGwubGVmdDtcclxuICAgICAgICAgIGhlaWdodCA9IHN0YXJ0Q2VsbC5ib3R0b20gLSBzdGFydENlbGwudG9wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldkNlbGwgPSBzdGFydENlbGw7XHJcblxyXG4gICAgICAgIHNlbGYucmVzZXJ2ZUNlbGxzKHN0YXJ0Q2VsbCwgc3RhcnRDZWxsLCB0aWxlKTtcclxuXHJcbiAgICAgICAgY3VyckluZGV4Kys7XHJcbiAgICAgIH0gZWxzZSBpZiAodGlsZVNpemUuY29sU3BhbiA9PT0gMikge1xyXG4gICAgICAgIGNlbGxzID0gc2VsZi5nZXRDZWxscyhwcmV2Q2VsbCwgdGlsZVNpemUucm93U3BhbiwgdGlsZVNpemUuY29sU3Bhbik7XHJcbiAgICAgICAgc3RhcnRDZWxsID0gY2VsbHMuc3RhcnQ7XHJcblxyXG4gICAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgICB3aWR0aCA9IGNlbGxzLmVuZC5yaWdodCAtIGNlbGxzLnN0YXJ0LmxlZnQ7XHJcbiAgICAgICAgICBoZWlnaHQgPSBjZWxscy5lbmQuYm90dG9tIC0gY2VsbHMuc3RhcnQudG9wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldkNlbGwgPSBjZWxscy5lbmQ7XHJcblxyXG4gICAgICAgIHNlbGYucmVzZXJ2ZUNlbGxzKGNlbGxzLnN0YXJ0LCBjZWxscy5lbmQsIHRpbGUpO1xyXG5cclxuICAgICAgICBjdXJySW5kZXggKz0gMjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVuZGVyIHByZXZpZXdcclxuICAgICAgLy8gd2hpbGUgdGlsZXMgZnJvbSBncm91cCBpcyBkcmFnZ2VkXHJcbiAgICAgIGlmIChkcmFnZ2VkVGlsZSA9PT0gdGlsZSkge1xyXG4gICAgICAgIHRpbGUuc2V0UHJldmlld1Bvc2l0aW9uKHtcclxuICAgICAgICAgIGxlZnQ6IHN0YXJ0Q2VsbC5sZWZ0LFxyXG4gICAgICAgICAgdG9wOiBzdGFydENlbGwudG9wXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICB0aWxlLnNldFNpemUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRpbGUuc2V0UG9zaXRpb24oc3RhcnRDZWxsLmxlZnQsIHN0YXJ0Q2VsbC50b3ApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNhbGNDb250YWluZXJIZWlnaHQoKTogYW55IHtcclxuICAgIGxldCBtYXhIZWlnaHRTaXplLCBtYXhXaWR0aFNpemU7XHJcblxyXG4gICAgaWYgKCF0aGlzLnRpbGVzLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBtYXhIZWlnaHRTaXplID0gXy5tYXhCeSh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGVbJ2dldFNpemUnXSgpO1xyXG4gICAgICByZXR1cm4gdGlsZVNpemUudG9wICsgdGlsZVNpemUuaGVpZ2h0O1xyXG4gICAgfSlbJ2dldFNpemUnXSgpO1xyXG5cclxuICAgIHRoaXMuZWxlbS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHRTaXplLnRvcCArIG1heEhlaWdodFNpemUuaGVpZ2h0ICsgJ3B4JztcclxuXHJcbiAgICBpZiAodGhpcy5pbmxpbmUpIHtcclxuICAgICAgbWF4V2lkdGhTaXplID0gXy5tYXhCeSh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgICAgcmV0dXJuIHRpbGVTaXplLmxlZnQgKyB0aWxlU2l6ZS53aWR0aDtcclxuICAgICAgfSlbJ2dldFNpemUnXSgpO1xyXG5cclxuICAgICAgdGhpcy5lbGVtLnN0eWxlLndpZHRoID0gbWF4V2lkdGhTaXplLmxlZnQgKyBtYXhXaWR0aFNpemUud2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlQnlOb2RlKG5vZGUpOiBhbnkge1xyXG4gICAgY29uc3QgZm91bmRUaWxlID0gdGhpcy50aWxlcy5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgcmV0dXJuIG5vZGUgPT09IHRpbGUuZ2V0RWxlbSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGZvdW5kVGlsZS5sZW5ndGggPyBmb3VuZFRpbGVbMF0gOiBudWxsO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlQnlDb29yZGluYXRlcyhjb29yZHMsIGRyYWdnZWRUaWxlKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnRpbGVzXHJcbiAgICAgIC5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGUuZ2V0U2l6ZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGlsZSAhPT0gZHJhZ2dlZFRpbGUgJiZcclxuICAgICAgICAgIHRpbGVTaXplLmxlZnQgPD0gY29vcmRzLmxlZnQgJiYgY29vcmRzLmxlZnQgPD0gKHRpbGVTaXplLmxlZnQgKyB0aWxlU2l6ZS53aWR0aCkgJiZcclxuICAgICAgICAgIHRpbGVTaXplLnRvcCA8PSBjb29yZHMudG9wICYmIGNvb3Jkcy50b3AgPD0gKHRpbGVTaXplLnRvcCArIHRpbGVTaXplLmhlaWdodCk7XHJcbiAgICAgIH0pWzBdIHx8IG51bGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldFRpbGVJbmRleCh0aWxlKTogYW55IHtcclxuICAgIHJldHVybiBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCB0aWxlKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3dhcFRpbGVzKG1vdmVkVGlsZSwgYmVmb3JlVGlsZSk6IGFueSB7XHJcbiAgICBjb25zdCBtb3ZlZFRpbGVJbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsIG1vdmVkVGlsZSk7XHJcbiAgICBjb25zdCBiZWZvcmVUaWxlSW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCBiZWZvcmVUaWxlKTtcclxuXHJcbiAgICB0aGlzLnRpbGVzLnNwbGljZShtb3ZlZFRpbGVJbmRleCwgMSk7XHJcbiAgICB0aGlzLnRpbGVzLnNwbGljZShiZWZvcmVUaWxlSW5kZXgsIDAsIG1vdmVkVGlsZSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHJlbW92ZVRpbGUocmVtb3ZlVGlsZSk6IGFueSB7XHJcbiAgICBsZXQgZHJvcHBlZFRpbGU7XHJcblxyXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlLCBpbmRleCwgdGlsZXMpID0+IHtcclxuICAgICAgaWYgKHRpbGUgPT09IHJlbW92ZVRpbGUpIHtcclxuICAgICAgICBkcm9wcGVkVGlsZSA9IHRpbGVzLnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZHJvcHBlZFRpbGU7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHVwZGF0ZVRpbGVPcHRpb25zKG9wdHMpOiBhbnkge1xyXG4gICAgY29uc3QgaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICByZXR1cm4gdGlsZVsnZ2V0T3B0aW9ucyddKCkgPT09IG9wdHM7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgIHRoaXMudGlsZXNbaW5kZXhdLnNldE9wdGlvbnMob3B0cyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9O1xyXG59XHJcblxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcERyYWdnYWJsZVRpbGVzR3JvdXAnKVxyXG4gIC5zZXJ2aWNlKCdwaXBUaWxlc0dyaWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKSB7XHJcbiAgICAgIGNvbnN0IG5ld0dyaWQgPSBuZXcgVGlsZXNHcmlkU2VydmljZSh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3R3JpZDtcclxuICAgIH1cclxuICB9KTsiLCJhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEcmFnZ2FibGVUaWxlc0dyb3VwJywgW10pO1xyXG5cclxuaW1wb3J0ICcuL1RpbGVHcm91cERpcmVjdGl2ZSc7XHJcbmltcG9ydCAnLi9UaWxlR3JvdXBTZXJ2aWNlJzsiLCJleHBvcnQgaW50ZXJmYWNlIElUaWxlVGVtcGxhdGVTZXJ2aWNlIHtcclxuICAgIGdldFRlbXBsYXRlKHNvdXJjZSwgdHBsID8gLCB0aWxlU2NvcGUgPyAsIHN0cmljdENvbXBpbGUgPyApOiBhbnk7XHJcbiAgICBzZXRJbWFnZU1hcmdpbkNTUygkZWxlbWVudCwgaW1hZ2UpOiB2b2lkO1xyXG59IFxyXG5cclxue1xyXG4gICAgY2xhc3MgdGlsZVRlbXBsYXRlU2VydmljZSBpbXBsZW1lbnRzIElUaWxlVGVtcGxhdGVTZXJ2aWNlIHtcclxuICAgICAgICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICAgICAgICBwcml2YXRlIF8kY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XHJcbiAgICAgICAgcHJpdmF0ZSBfJHRlbXBsYXRlUmVxdWVzdDogYW5ndWxhci5JVGVtcGxhdGVSZXF1ZXN0U2VydmljZTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgICRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXHJcbiAgICAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5fJGludGVycG9sYXRlID0gJGludGVycG9sYXRlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgICAgICAgICB0aGlzLl8kdGVtcGxhdGVSZXF1ZXN0ID0gJHRlbXBsYXRlUmVxdWVzdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55IHtcclxuICAgICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgICAgIHR5cGVcclxuICAgICAgICAgICAgfSA9IHNvdXJjZTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnBvbGF0ZWQgPSB0cGwgPyB0aGlzLl8kaW50ZXJwb2xhdGUodHBsKShzb3VyY2UpIDogdGhpcy5fJGludGVycG9sYXRlKHRlbXBsYXRlKShzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmljdENvbXBpbGUgPT0gdHJ1ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkpIDpcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKHRlbXBsYXRlKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVVcmwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyR0ZW1wbGF0ZVJlcXVlc3QodGVtcGxhdGVVcmwsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaHRtbCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGh0bWwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGxldFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGggPSAkZWxlbWVudC53aWR0aCA/ICRlbGVtZW50LndpZHRoKCkgOiAkZWxlbWVudC5jbGllbnRXaWR0aCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRlbGVtZW50LmhlaWdodCA/ICRlbGVtZW50LmhlaWdodCgpIDogJGVsZW1lbnQuY2xpZW50SGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxXaWR0aCA6IGltYWdlLm5hdHVyYWxXaWR0aCkgfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBpbWFnZUhlaWdodCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlV2lkdGggLyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lckhlaWdodCAtIGNvbnRhaW5lcldpZHRoKSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGltYWdlV2lkdGggKiBjb250YWluZXJIZWlnaHQgLyBpbWFnZUhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlSGVpZ2h0IC8gaW1hZ2VXaWR0aCAqIGNvbnRhaW5lcldpZHRoIC0gY29udGFpbmVySGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWyd3aWR0aCddID0gJycgKyBjb250YWluZXJXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQoaW1hZ2UpLmNzcyhjc3NQYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbWFnZSBsb2FkIGRpcmVjdGl2ZSBUT0RPOiByZW1vdmUgdG8gcGlwSW1hZ2VVdGlsc1xyXG4gICAgY29uc3QgSW1hZ2VMb2FkID0gZnVuY3Rpb24gSW1hZ2VMb2FkKCRwYXJzZTogbmcuSVBhcnNlU2VydmljZSk6IG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnBpcEltYWdlTG9hZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdsb2FkJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcGUsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAgICAgLnNlcnZpY2UoJ3BpcFRpbGVUZW1wbGF0ZScsIHRpbGVUZW1wbGF0ZVNlcnZpY2UpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgncGlwSW1hZ2VMb2FkJywgSW1hZ2VMb2FkKTtcclxufSIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdjYWxlbmRhcl90aWxlL0NhbGVuZGFyVGlsZS5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLWNhbGVuZGFyLXdpZGdldCB7eyAkY3RybC5jb2xvciB9fSBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsIHRwMFwiIG5nLWNsYXNzPVwieyBzbWFsbDogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBtZWRpdW06ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgYmlnOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiPjxwaXAtdGlsZS1tZW51PjwvcGlwLXRpbGUtbWVudT48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPjxzcGFuIGNsYXNzPVwiZGF0ZSBsbTI0IHJtMTJcIj57eyAkY3RybC5vcHRpb25zLmRhdGUuZ2V0RGF0ZSgpIH19PC9zcGFuPjxkaXYgY2xhc3M9XCJmbGV4LWF1dG8gbGF5b3V0LWNvbHVtblwiPjxzcGFuIGNsYXNzPVwid2Vla2RheSBtZC1oZWFkbGluZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwibW9udGgteWVhciBtZC1oZWFkbGluZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdNb250aCB9fSB7eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRZZWFyIH19PC9zcGFuPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3BhY2UtYXJvdW5kLWNlbnRlclwiIG5nLWhpZGU9XCIkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDFcIj48c3BhbiBjbGFzcz1cIndlZWtkYXkgbWQtaGVhZGxpbmVcIiBuZy1oaWRlPVwiJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJ3ZWVrZGF5XCIgbmctc2hvdz1cIiRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwiZGF0ZSBsbTEyIHJtMTJcIj57eyAkY3RybC5vcHRpb25zLmRhdGUuZ2V0RGF0ZSgpIH19PC9zcGFuPiA8c3BhbiBjbGFzcz1cIm1vbnRoLXllYXIgbWQtaGVhZGxpbmVcIj57eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRMb25nTW9udGggfX0ge3sgJGN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0WWVhciB9fTwvc3Bhbj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdjYWxlbmRhcl90aWxlL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaCBibTE2XCI+RGF0ZTo8bWQtZGF0ZXBpY2tlciBuZy1tb2RlbD1cIiRjdHJsLmRhdGVcIiBjbGFzcz1cInctc3RyZXRjaFwiPjwvbWQtZGF0ZXBpY2tlcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdhZGRfdGlsZV9kaWFsb2cvQWRkVGlsZS5odG1sJyxcbiAgICAnPG1kLWRpYWxvZyBjbGFzcz1cInBpcC1kaWFsb2cgcGlwLWFkZC1jb21wb25lbnQtZGlhbG9nXCI+PG1kLWRpYWxvZy1jb250ZW50IGNsYXNzPVwibGF5b3V0LWNvbHVtblwiPjxkaXYgY2xhc3M9XCJ0aGVtZS1kaXZpZGVyIHAxNiBmbGV4LWF1dG9cIj48aDMgY2xhc3M9XCJoaWRlLXhzIG0wIGJtMTYgdGhlbWUtdGV4dC1wcmltYXJ5XCIgaGlkZS14cz1cIlwiPnt7IFxcJ0RBU0hCT0FSRF9BRERfVElMRV9ESUFMT0dfVElUTEVcXCcgfCB0cmFuc2xhdGUgfX08bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwibGF5b3V0LXJvdyBmbGV4LWF1dG8gbTAgdG0xNlwiPjxtZC1zZWxlY3QgY2xhc3M9XCJmbGV4LWF1dG8gbTAgdGhlbWUtdGV4dC1wcmltYXJ5XCIgbmctbW9kZWw9XCJkaWFsb2dDdHJsLmFjdGl2ZUdyb3VwSW5kZXhcIiBwbGFjZWhvbGRlcj1cInt7IFxcJ0RBU0hCT0FSRF9BRERfVElMRV9ESUFMT0dfQ1JFQVRFX05FV19HUk9VUFxcJyB8IHRyYW5zbGF0ZSB9fVwiIGFyaWEtbGFiZWw9XCJHcm91cFwiPjxtZC1vcHRpb24gbmctdmFsdWU9XCIkaW5kZXhcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiBkaWFsb2dDdHJsLmdyb3Vwc1wiPnt7IGdyb3VwIH19PC9tZC1vcHRpb24+PC9tZC1zZWxlY3Q+PC9tZC1pbnB1dC1jb250YWluZXI+PC9oMz48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWJvZHkgcGlwLXNjcm9sbCBwMCBmbGV4LWF1dG9cIj48cCBjbGFzcz1cIm1kLWJvZHktMSB0aGVtZS10ZXh0LXNlY29uZGFyeSBtMCBscDE2IHJwMTZcIj57eyBcXCdEQVNIQk9BUkRfQUREX1RJTEVfRElBTE9HX1VTRV9IT1RfS0VZU1xcJyB8IHRyYW5zbGF0ZSB9fTwvcD48bWQtbGlzdCBuZy1pbml0PVwiZ3JvdXBJbmRleCA9ICRpbmRleFwiIG5nLXJlcGVhdD1cImdyb3VwIGluIGRpYWxvZ0N0cmwuZGVmYXVsdFdpZGdldHNcIj48bWQtbGlzdC1pdGVtIGNsYXNzPVwibGF5b3V0LXJvdyBwaXAtbGlzdC1pdGVtIGxwMTYgcnAxNlwiIG5nLXJlcGVhdD1cIml0ZW0gaW4gZ3JvdXBcIj48ZGl2IGNsYXNzPVwiaWNvbi1ob2xkZXIgZmxleC1ub25lXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp7ezo6IGl0ZW0uaWNvbiB9fVwiPjwvbWQtaWNvbj48ZGl2IGNsYXNzPVwicGlwLWJhZGdlIHRoZW1lLWJhZGdlIG1kLXdhcm5cIiBuZy1pZj1cIml0ZW0uYW1vdW50XCI+PHNwYW4+e3sgaXRlbS5hbW91bnQgfX08L3NwYW4+PC9kaXY+PC9kaXY+PHNwYW4gY2xhc3M9XCJmbGV4LWF1dG8gbG0yNCB0aGVtZS10ZXh0LXByaW1hcnlcIj57ezo6IGl0ZW0udGl0bGUgfX08L3NwYW4+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5lbmNyZWFzZShncm91cEluZGV4LCAkaW5kZXgpXCIgYXJpYS1sYWJlbD1cIkVuY3JlYXNlXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzLWNpcmNsZVwiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lXCIgbmctY2xpY2s9XCJkaWFsb2dDdHJsLmRlY3JlYXNlKGdyb3VwSW5kZXgsICRpbmRleClcIiBhcmlhLWxhYmVsPVwiRGVjcmVhc2VcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOm1pbnVzLWNpcmNsZVwiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48L21kLWxpc3QtaXRlbT48bWQtZGl2aWRlciBjbGFzcz1cImxtNzIgdG04IGJtOFwiIG5nLWlmPVwiZ3JvdXBJbmRleCAhPT0gKGRpYWxvZ0N0cmwuZGVmYXVsdFdpZGdldHMubGVuZ3RoIC0gMSlcIj48L21kLWRpdmlkZXI+PC9tZC1saXN0PjwvZGl2PjwvbWQtZGlhbG9nLWNvbnRlbnQ+PG1kLWRpYWxvZy1hY3Rpb25zIGNsYXNzPVwiZmxleC1ub25lIGxheW91dC1hbGlnbi1lbmQtY2VudGVyIHRoZW1lLWRpdmlkZXIgZGl2aWRlci10b3AgdGhlbWUtdGV4dC1wcmltYXJ5XCI+PG1kLWJ1dHRvbiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuY2FuY2VsKClcIiBhcmlhLWxhYmVsPVwiQ2FuY2VsXCI+e3sgXFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuYWRkKClcIiBuZy1kaXNhYmxlZD1cImRpYWxvZ0N0cmwudG90YWxXaWRnZXRzID09PSAwXCIgYXJpYWwtbGFiZWw9XCJBZGRcIj57eyBcXCdBRERcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj48L21kLWRpYWxvZy1hY3Rpb25zPjwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2NvbmZpZ190aWxlX2RpYWxvZy9Db25maWdEaWFsb2cuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC10aWxlLWNvbmZpZy1kaWFsb2cge3sgdm0ucGFyYW1zLmRpYWxvZ0NsYXNzIH19XCIgd2lkdGg9XCI0MDBcIiBtZC10aGVtZT1cInt7dm0udGhlbWV9fVwiPjxwaXAtdGlsZS1jb25maWctZXh0ZW5kLWNvbXBvbmVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIiBwaXAtZGlhbG9nLXNjb3BlPVwidm1cIiBwaXAtZXh0ZW5zaW9uLXVybD1cInZtLmV4dGVuc2lvblVybFwiIHBpcC1hcHBseT1cInZtLm9uQXBwbHkodXBkYXRlZERhdGEpXCI+PC9waXAtdGlsZS1jb25maWctZXh0ZW5kLWNvbXBvbmVudD48L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdjb25maWdfdGlsZV9kaWFsb2cvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50Lmh0bWwnLFxuICAgICc8aDMgY2xhc3M9XCJ0bTAgZmxleC1ub25lXCI+e3sgXFwnREFTSEJPQVJEX1RJTEVfQ09ORklHX0RJQUxPR19USVRMRVxcJyB8IHRyYW5zbGF0ZSB9fTwvaDM+PGRpdiBjbGFzcz1cInBpcC1ib2R5IHBpcC1zY3JvbGwgcDE2IGJwMCBmbGV4LWF1dG9cIj48cGlwLWV4dGVuc2lvbi1wb2ludD48L3BpcC1leHRlbnNpb24tcG9pbnQ+PHBpcC10b2dnbGUtYnV0dG9ucyBjbGFzcz1cImJtMTZcIiBuZy1pZj1cIiEkY3RybC5oaWRlU2l6ZXNcIiBwaXAtYnV0dG9ucz1cIiRjdHJsLnNpemVzXCIgbmctbW9kZWw9XCIkY3RybC5zaXplSWRcIj48L3BpcC10b2dnbGUtYnV0dG9ucz48cGlwLWNvbG9yLXBpY2tlciBuZy1pZj1cIiEkY3RybC5oaWRlQ29sb3JzXCIgcGlwLWNvbG9ycz1cIiRjdHJsLmNvbG9yc1wiIG5nLW1vZGVsPVwiJGN0cmwuY29sb3JcIj48L3BpcC1jb2xvci1waWNrZXI+PC9kaXY+PGRpdiBjbGFzcz1cInBpcC1mb290ZXIgZmxleC1ub25lXCI+PGRpdj48bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50XCIgbmctY2xpY2s9XCIkY3RybC5vbkNhbmNlbCgpXCI+e3sgXFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwiJGN0cmwub25BcHBseSgpXCI+e3sgXFwnQVBQTFlcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkYXNoYm9hcmQvRGFzaGJvYXJkLmh0bWwnLFxuICAgICc8bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50IG1kLXJhaXNlZCBtZC1mYWIgbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIGFyaWEtbGFiZWw9XCJBZGQgY29tcG9uZW50XCIgbmctY2xpY2s9XCIkY3RybC5hZGRDb21wb25lbnQoKVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1c1wiIGNsYXNzPVwibWQtaGVhZGxpbmUgY2VudGVyZWQtYWRkLWljb25cIj48L21kLWljb24+PC9tZC1idXR0b24+PGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JpZC1ob2xkZXJcIj48cGlwLWRyYWdnYWJsZS1ncmlkIHBpcC10aWxlcy10ZW1wbGF0ZXM9XCIkY3RybC5ncm91cGVkV2lkZ2V0c1wiIHBpcC10aWxlcy1jb250ZXh0PVwiJGN0cmwud2lkZ2V0c0NvbnRleHRcIiBwaXAtZHJhZ2dhYmxlLWdyaWQ9XCIkY3RybC5kcmFnZ2FibGVHcmlkT3B0aW9uc1wiIHBpcC1ncm91cC1tZW51LWFjdGlvbnM9XCIkY3RybC5ncm91cE1lbnVBY3Rpb25zXCI+PC9waXAtZHJhZ2dhYmxlLWdyaWQ+PG1kLXByb2dyZXNzLWNpcmN1bGFyIG1kLW1vZGU9XCJpbmRldGVybWluYXRlXCIgY2xhc3M9XCJwcm9ncmVzcy1yaW5nXCI+PC9tZC1wcm9ncmVzcy1jaXJjdWxhcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkcmFnZ2FibGUvRHJhZ2dhYmxlLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ob2xkZXJcIj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cFwiIG5nLXJlcGVhdD1cImdyb3VwIGluICRjdHJsLmdyb3Vwc1wiIGRhdGEtZ3JvdXAtaWQ9XCJ7eyAkaW5kZXggfX1cIiBwaXAtZHJhZ2dhYmxlLXRpbGVzPVwiZ3JvdXAuc291cmNlXCI+PGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXAtdGl0bGUgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyXCI+PGRpdiBjbGFzcz1cInRpdGxlLWlucHV0LWNvbnRhaW5lclwiIG5nLWNsaWNrPVwiJGN0cmwub25UaXRsZUNsaWNrKGdyb3VwLCAkZXZlbnQpXCI+PGlucHV0IG5nLWlmPVwiZ3JvdXAuZWRpdGluZ05hbWVcIiBuZy1ibHVyPVwiJGN0cmwub25CbHVyVGl0bGVJbnB1dChncm91cClcIiBuZy1rZXlwcmVzcz1cIiRjdHJsLm9uS3llcHJlc3NUaXRsZUlucHV0KGdyb3VwLCAkZXZlbnQpXCIgbmctbW9kZWw9XCJncm91cC50aXRsZVwiPjxkaXYgY2xhc3M9XCJ0ZXh0LW92ZXJmbG93IGZsZXgtbm9uZVwiIG5nLWlmPVwiIWdyb3VwLmVkaXRpbmdOYW1lXCI+e3sgZ3JvdXAudGl0bGUgfX08L2Rpdj48L2Rpdj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgbmctc2hvdz1cImdyb3VwLmVkaXRpbmdOYW1lXCIgbmctY2xpY2s9XCIkY3RybC5jYW5jZWxFZGl0aW5nKGdyb3VwKVwiIGFyaWEtbGFiZWw9XCJDYW5jZWxcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmNyb3NzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1tZW51IGNsYXNzPVwiZmxleC1ub25lIGxheW91dC1jb2x1bW5cIiBtZC1wb3NpdGlvbi1tb2RlPVwidGFyZ2V0LXJpZ2h0IHRhcmdldFwiIG5nLXNob3c9XCIhZ3JvdXAuZWRpdGluZ05hbWVcIj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgbmctY2xpY2s9XCIkbWRPcGVuTWVudSgpOyBncm91cElkID0gJGluZGV4XCIgYXJpYS1sYWJlbD1cIk1lbnVcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmRvdHNcIj48L21kLWljb24+PC9tZC1idXR0b24+PG1kLW1lbnUtY29udGVudCB3aWR0aD1cIjRcIj48bWQtbWVudS1pdGVtIG5nLXJlcGVhdD1cImFjdGlvbiBpbiAkY3RybC5ncm91cE1lbnVBY3Rpb25zXCI+PG1kLWJ1dHRvbiBuZy1jbGljaz1cImFjdGlvbi5jYWxsYmFjayhncm91cElkKVwiPnt7IGFjdGlvbi50aXRsZSB9fTwvbWQtYnV0dG9uPjwvbWQtbWVudS1pdGVtPjwvbWQtbWVudS1jb250ZW50PjwvbWQtbWVudT48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cCBmaWN0LWdyb3VwIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyIGxheW91dC1jb2x1bW4gdG0xNlwiPjxkaXYgY2xhc3M9XCJmaWN0LWdyb3VwLXRleHQtY29udGFpbmVyXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPnt7IFxcJ0RST1BfVE9fQ1JFQVRFX05FV19HUk9VUFxcJyB8IHRyYW5zbGF0ZSB9fTwvZGl2PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2V2ZW50X3RpbGUvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoXCI+PG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCBibTBcIj48bGFiZWw+VGl0bGU6PC9sYWJlbD4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC50aXRsZVwiPjwvbWQtaW5wdXQtY29udGFpbmVyPkRhdGU6PG1kLWRhdGVwaWNrZXIgbmctbW9kZWw9XCIkY3RybC5kYXRlXCIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm04XCI+PC9tZC1kYXRlcGlja2VyPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2hcIj48bGFiZWw+RGVzY3JpcHRpb246PC9sYWJlbD4gPHRleHRhcmVhIHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC50ZXh0XCI+XFxuJyArXG4gICAgJyAgICA8L3RleHRhcmVhPjwvbWQtaW5wdXQtY29udGFpbmVyPkJhY2tkcm9wXFwncyBvcGFjaXR5OjxtZC1zbGlkZXIgYXJpYS1sYWJlbD1cIm9wYWNpdHlcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiMC4xXCIgbWF4PVwiMC45XCIgc3RlcD1cIjAuMDFcIiBuZy1tb2RlbD1cIiRjdHJsLm9wYWNpdHlcIiBuZy1jaGFuZ2U9XCIkY3RybC5vbk9wYWNpdHl0ZXN0KCRjdHJsLm9wYWNpdHkpXCI+PC9tZC1zbGlkZXI+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZXZlbnRfdGlsZS9FdmVudFRpbGUuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1ldmVudC13aWRnZXQge3sgJGN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwieyBzbWFsbDogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBtZWRpdW06ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgYmlnOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiPjxpbWcgbmctaWY9XCIkY3RybC5vcHRpb25zLmltYWdlXCIgbmctc3JjPVwie3skY3RybC5vcHRpb25zLmltYWdlfX1cIiBhbHQ9XCJ7eyRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lfX1cIj48ZGl2IGNsYXNzPVwidGV4dC1iYWNrZHJvcFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCB7eyAkY3RybC5vcGFjaXR5IH19KVwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgZmxleC1ub25lXCI+PHNwYW4gY2xhc3M9XCJ3aWRnZXQtdGl0bGUgZmxleC1hdXRvIHRleHQtb3ZlcmZsb3dcIj57eyAkY3RybC5vcHRpb25zLnRpdGxlIHx8ICRjdHJsLm9wdGlvbnMubmFtZSB9fTwvc3Bhbj48cGlwLXRpbGUtbWVudSBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtdGlsZS1tZW51PjwvZGl2PjxkaXYgY2xhc3M9XCJ0ZXh0LWNvbnRhaW5lciBmbGV4LWF1dG8gcGlwLXNjcm9sbFwiPjxwIGNsYXNzPVwiZGF0ZSBmbGV4LW5vbmVcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMuZGF0ZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdFNob3J0RGF0ZSB9fTwvcD48cCBjbGFzcz1cInRleHQgZmxleC1hdXRvXCI+e3sgJGN0cmwub3B0aW9ucy50ZXh0IHx8ICRjdHJsLm9wdGlvbnMuZGVzY3JpcHRpb24gfX08L3A+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbm90ZV90aWxlL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+PGxhYmVsPlRpdGxlOjwvbGFiZWw+IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGl0bGVcIj48L21kLWlucHV0LWNvbnRhaW5lcj48bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIHRtMFwiPjxsYWJlbD5UZXh0OjwvbGFiZWw+IDx0ZXh0YXJlYSB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGV4dFwiPlxcbicgK1xuICAgICcgICAgPC90ZXh0YXJlYT48L21kLWlucHV0LWNvbnRhaW5lcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdub3RlX3RpbGUvTm90ZVRpbGUuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1ub3Rlcy13aWRnZXQge3sgJGN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtblwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgZmxleC1ub25lXCIgbmctaWY9XCIkY3RybC5vcHRpb25zLnRpdGxlIHx8ICRjdHJsLm9wdGlvbnMubmFtZVwiPjxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgJGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWUgfX08L3NwYW4+PC9kaXY+PHBpcC10aWxlLW1lbnUgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLXRpbGUtbWVudT48ZGl2IGNsYXNzPVwidGV4dC1jb250YWluZXIgZmxleC1hdXRvIHBpcC1zY3JvbGxcIj48cD57eyAkY3RybC5vcHRpb25zLnRleHQgfX08L3A+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbWVudV90aWxlL01lbnVUaWxlLmh0bWwnLFxuICAgICc8bWQtbWVudSBjbGFzcz1cIndpZGdldC1tZW51XCIgbWQtcG9zaXRpb24tbW9kZT1cInRhcmdldC1yaWdodCB0YXJnZXRcIj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lXCIgbmctY2xpY2s9XCIkbWRPcGVuTWVudSgpXCIgYXJpYS1sYWJlbD1cIk1lbnVcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnZkb3RzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1tZW51LWNvbnRlbnQgd2lkdGg9XCI0XCI+PG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJpdGVtIGluICRjdHJsLm1lbnVcIj48bWQtYnV0dG9uIG5nLWlmPVwiIWl0ZW0uc3VibWVudVwiIG5nLWNsaWNrPVwiJGN0cmwuY2FsbEFjdGlvbihpdGVtLmFjdGlvbiwgaXRlbS5wYXJhbXMsIGl0ZW0pXCI+e3s6OiBpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+PG1kLW1lbnUgbmctaWY9XCJpdGVtLnN1Ym1lbnVcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwiJGN0cmwuY2FsbEFjdGlvbihpdGVtLmFjdGlvbilcIj57ezo6IGl0ZW0udGl0bGUgfX08L21kLWJ1dHRvbj48bWQtbWVudS1jb250ZW50PjxtZC1tZW51LWl0ZW0gbmctcmVwZWF0PVwic3ViaXRlbSBpbiBpdGVtLnN1Ym1lbnVcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwiJGN0cmwuY2FsbEFjdGlvbihzdWJpdGVtLmFjdGlvbiwgc3ViaXRlbS5wYXJhbXMsIHN1Yml0ZW0pXCI+e3s6OiBzdWJpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+PC9tZC1tZW51LWl0ZW0+PC9tZC1tZW51LWNvbnRlbnQ+PC9tZC1tZW51PjwvbWQtbWVudS1pdGVtPjwvbWQtbWVudS1jb250ZW50PjwvbWQtbWVudT4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdwaWN0dXJlX3NsaWRlcl90aWxlL1BpY3R1cmVTbGlkZXJUaWxlLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtcGljdHVyZS1zbGlkZXItd2lkZ2V0IHt7ICRjdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIiBuZy1jbGFzcz1cInsgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIGJpZzogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIiBpbmRleD1cInt7ICRjdHJsLmluZGV4IH19XCIgZ3JvdXA9XCJ7eyAkY3RybC5ncm91cCB9fVwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBscDE2IHJwOCBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiPjxzcGFuIGNsYXNzPVwiZmxleCB0ZXh0LW92ZXJmbG93XCI+e3sgJGN0cmwub3B0aW9ucy50aXRsZSB9fTwvc3Bhbj48cGlwLXRpbGUtbWVudSBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtdGlsZS1tZW51PjwvZGl2PjxkaXYgY2xhc3M9XCJzbGlkZXItY29udGFpbmVyXCI+PGRpdiBwaXAtaW1hZ2Utc2xpZGVyPVwiXCIgcGlwLWFuaW1hdGlvbi10eXBlPVwiXFwnZmFkaW5nXFwnXCIgcGlwLWFuaW1hdGlvbi1pbnRlcnZhbD1cIiRjdHJsLmFuaW1hdGlvbkludGVydmFsXCIgbmctaWY9XCIkY3RybC5hbmltYXRpb25UeXBlID09IFxcJ2ZhZGluZ1xcJ1wiPjxkaXYgY2xhc3M9XCJwaXAtYW5pbWF0aW9uLWJsb2NrXCIgbmctcmVwZWF0PVwic2xpZGUgaW4gJGN0cmwub3B0aW9ucy5zbGlkZXNcIj48aW1nIG5nLXNyYz1cInt7IHNsaWRlLmltYWdlIH19XCIgYWx0PVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBwaXAtaW1hZ2UtbG9hZD1cIiRjdHJsLm9uSW1hZ2VMb2FkKCRldmVudClcIj48cCBjbGFzcz1cInNsaWRlLXRleHRcIiBuZy1pZj1cInNsaWRlLnRleHRcIj57eyBzbGlkZS50ZXh0IH19PC9wPjwvZGl2PjwvZGl2PjxkaXYgcGlwLWltYWdlLXNsaWRlcj1cIlwiIHBpcC1hbmltYXRpb24tdHlwZT1cIlxcJ2Nhcm91c2VsXFwnXCIgcGlwLWFuaW1hdGlvbi1pbnRlcnZhbD1cIiRjdHJsLmFuaW1hdGlvbkludGVydmFsXCIgbmctaWY9XCIkY3RybC5hbmltYXRpb25UeXBlID09IFxcJ2Nhcm91c2VsXFwnXCI+PGRpdiBjbGFzcz1cInBpcC1hbmltYXRpb24tYmxvY2tcIiBuZy1yZXBlYXQ9XCJzbGlkZSBpbiAkY3RybC5vcHRpb25zLnNsaWRlc1wiPjxpbWcgbmctc3JjPVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBhbHQ9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIHBpcC1pbWFnZS1sb2FkPVwiJGN0cmwub25JbWFnZUxvYWQoJGV2ZW50KVwiPjxwIGNsYXNzPVwic2xpZGUtdGV4dFwiIG5nLWlmPVwic2xpZGUudGV4dFwiPnt7IHNsaWRlLnRleHQgfX08L3A+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgncG9zaXRpb25fdGlsZS9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2hcIj48bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIGJtMFwiPjxsYWJlbD5Mb2NhdGlvbiBuYW1lOjwvbGFiZWw+IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwubG9jYXRpb25OYW1lXCI+PC9tZC1pbnB1dC1jb250YWluZXI+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgncG9zaXRpb25fdGlsZS9Qb3NpdGlvblRpbGUuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtcG9zaXRpb24td2lkZ2V0IHdpZGdldC1ib3ggcDAgbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwieyBzbWFsbDogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBtZWRpdW06ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgYmlnOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiIGluZGV4PVwie3sgJGN0cmwuaW5kZXggfX1cIiBncm91cD1cInt7ICRjdHJsLmdyb3VwIH19XCI+PGRpdiBjbGFzcz1cInBvc2l0aW9uLWFic29sdXRlLXJpZ2h0LXRvcFwiIG5nLWlmPVwiISRjdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lXCI+PHBpcC10aWxlLW1lbnUgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLXRpbGUtbWVudT48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbHAxNiBycDggbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lXCI+PHNwYW4gY2xhc3M9XCJmbGV4IHRleHQtb3ZlcmZsb3dcIj57eyAkY3RybC5vcHRpb25zLmxvY2F0aW9uTmFtZSB9fTwvc3Bhbj48cGlwLXRpbGUtbWVudSBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtdGlsZS1tZW51PjwvZGl2PjxwaXAtbG9jYXRpb24tbWFwIGNsYXNzPVwiZmxleFwiIG5nLWlmPVwiJGN0cmwuc2hvd1Bvc2l0aW9uXCIgcGlwLXN0cmV0Y2g9XCJ0cnVlXCIgcGlwLXJlYmluZD1cInRydWVcIiBwaXAtbG9jYXRpb24tcG9zPVwiJGN0cmwub3B0aW9ucy5sb2NhdGlvblwiPjwvcGlwLWxvY2F0aW9uLW1hcD48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdzdGF0aXN0aWNzX3RpbGUvU3RhdGlzdGljc1RpbGUuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1zdGF0aXN0aWNzLXdpZGdldCBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7IHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIG1lZGl1bTogJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCI+PGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBmbGV4LW5vbmVcIj48c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPjxwaXAtdGlsZS1tZW51PjwvcGlwLXRpbGUtbWVudT48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1pZj1cIiRjdHJsLm9wdGlvbnMuc2VyaWVzICYmICEkY3RybC5yZXNldFwiPjxwaXAtcGllLWNoYXJ0IHBpcC1zZXJpZXM9XCIkY3RybC5vcHRpb25zLnNlcmllc1wiIG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuY2hhcnRUeXBlIHx8ICRjdHJsLm9wdGlvbnMuY2hhcnRUeXBlID09IFxcJ3BpZVxcJ1wiIHBpcC1kb251dD1cInRydWVcIiBwaXAtcGllLXNpemU9XCIkY3RybC5jaGFydFNpemVcIiBwaXAtc2hvdy10b3RhbD1cInRydWVcIiBwaXAtY2VudGVyZWQ9XCJ0cnVlXCI+PC9waXAtcGllLWNoYXJ0PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWRhc2hib2FyZC1odG1sLm1pbi5qcy5tYXBcbiJdfQ==