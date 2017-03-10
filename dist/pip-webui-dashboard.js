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
},{}],7:[function(require,module,exports){
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
})();
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRGFzaGJvYXJkLnRzIiwic3JjL0Rhc2hib2FyZENvbXBvbmVudC50cyIsInNyYy9kaWFsb2dzL2FkZF9jb21wb25lbnQvQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlci50cyIsInNyYy9kaWFsb2dzL2FkZF9jb21wb25lbnQvQWRkQ29tcG9uZW50UHJvdmlkZXIudHMiLCJzcmMvZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXIudHMiLCJzcmMvZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudC50cyIsInNyYy9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZS50cyIsInNyYy9kcmFnZ2FibGUvRHJhZ2dhYmxlLnRzIiwic3JjL2RyYWdnYWJsZS9EcmFnZ2FibGVDb21wb25lbnQudHMiLCJzcmMvZHJhZ2dhYmxlL0RyYWdnYWJsZVRpbGVTZXJ2aWNlLnRzIiwic3JjL2RyYWdnYWJsZS9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cERpcmVjdGl2ZS50cyIsInNyYy9kcmFnZ2FibGUvZHJhZ2dhYmxlX2dyb3VwL0RyYWdnYWJsZVRpbGVzR3JvdXBTZXJ2aWNlLnRzIiwic3JjL3V0aWxpdHkvV2lkZ2V0VGVtcGxhdGVVdGlsaXR5LnRzIiwic3JjL3dpZGdldHMvV2lkZ2V0Q2xhc3MudHMiLCJzcmMvd2lkZ2V0cy9XaWRnZXRzLnRzIiwic3JjL3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIudHMiLCJzcmMvd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudURpcmVjdGl2ZS50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UudHMiLCJzcmMvd2lkZ2V0cy9ub3Rlcy9XaWRnZXROb3Rlcy50cyIsInNyYy93aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIudHMiLCJzcmMvd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi50cyIsInNyYy93aWRnZXRzL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcy50cyIsInRlbXAvcGlwLXdlYnVpLWRhc2hib2FyZC1odG1sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLDZCQUEyQjtBQUMzQixpQ0FBK0I7QUFFL0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7SUFDN0IsV0FBVztJQUNYLFlBQVk7SUFDWix1QkFBdUI7SUFDdkIsZ0NBQWdDO0lBQ2hDLHdCQUF3QjtJQUd4QixXQUFXO0lBQ1gsY0FBYztJQUNkLGFBQWE7SUFDYixXQUFXO0lBQ1gsY0FBYztJQUNkLGFBQWE7Q0FDZCxDQUFDLENBQUM7QUFFSCwyQ0FBeUM7QUFDekMsMERBQXdEO0FBQ3hELGdFQUE4RDtBQUM5RCxnQ0FBOEI7OztBQ2Q5QixDQUFDO0lBQ0MsSUFBTSxlQUFlLEdBQUcsVUFBVSxTQUFtQztRQUNuRSxJQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUMxRyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ1AsWUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVDLHdCQUF3QixFQUFFLCtCQUErQjthQUMxRCxDQUFDLENBQUM7WUFDTyxZQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRTtnQkFDNUMsd0JBQXdCLEVBQUUsMkNBQTJDO2FBQ3RFLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDLENBQUE7SUFFRCxJQUFNLHlCQUF5QixHQUFHLFVBQVUsNkJBQTBEO1FBQ3BHLDZCQUE2QixDQUFDLGdCQUFnQixDQUFDO1lBQzdDLENB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgJy4vd2lkZ2V0cy9XaWRnZXRzJztcclxuaW1wb3J0ICcuL2RyYWdnYWJsZS9EcmFnZ2FibGUnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZCcsIFtcclxuICAncGlwV2lkZ2V0JyxcclxuICAncGlwRHJhZ2dlZCcsXHJcbiAgJ3BpcFdpZGdldENvbmZpZ0RpYWxvZycsXHJcbiAgJ3BpcEFkZERhc2hib2FyZENvbXBvbmVudERpYWxvZycsXHJcbiAgJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLFxyXG5cclxuICAvLyBFeHRlcm5hbCBwaXAgbW9kdWxlc1xyXG4gICdwaXBMYXlvdXQnLFxyXG4gICdwaXBMb2NhdGlvbnMnLFxyXG4gICdwaXBEYXRlVGltZScsXHJcbiAgJ3BpcENoYXJ0cycsXHJcbiAgJ3BpcFRyYW5zbGF0ZScsXHJcbiAgJ3BpcENvbnRyb2xzJ1xyXG5dKTtcclxuXHJcbmltcG9ydCAnLi91dGlsaXR5L1dpZGdldFRlbXBsYXRlVXRpbGl0eSc7XHJcbmltcG9ydCAnLi9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nQ29udHJvbGxlcic7XHJcbmltcG9ydCAnLi9kaWFsb2dzL2FkZF9jb21wb25lbnQvQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlcic7XHJcbmltcG9ydCAnLi9EYXNoYm9hcmRDb21wb25lbnQnO1xyXG4iLCJpbXBvcnQge1xyXG4gIElXaWRnZXRUZW1wbGF0ZVNlcnZpY2VcclxufSBmcm9tICcuL3V0aWxpdHkvV2lkZ2V0VGVtcGxhdGVVdGlsaXR5JztcclxuaW1wb3J0IHtcclxuICBJQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSxcclxuICBJQWRkQ29tcG9uZW50RGlhbG9ncHJvdmlkZXJcclxufSBmcm9tICcuL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnRQcm92aWRlcidcclxuXHJcbntcclxuICBjb25zdCBzZXRUcmFuc2xhdGlvbnMgPSBmdW5jdGlvbiAoJGluamVjdG9yOiBuZy5hdXRvLklJbmplY3RvclNlcnZpY2UpIHtcclxuICAgIGNvbnN0IHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgPyAkaW5qZWN0b3IuZ2V0KCdwaXBUcmFuc2xhdGVQcm92aWRlcicpIDogbnVsbDtcclxuICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICBEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVA6ICdEcm9wIGhlcmUgdG8gY3JlYXRlIG5ldyBncm91cCcsXHJcbiAgICAgIH0pO1xyXG4gICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgIERST1BfVE9fQ1JFQVRFX05FV19HUk9VUDogJ9Cf0LXRgNC10YLQsNGJ0LjRgtC1INGB0Y7QtNCwINC00LvRjyDRgdC+0LfQtNCw0L3QuNGPINC90L7QstC+0Lkg0LPRgNGD0L/Qv9GLJ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGNvbmZpZ3VyZUF2YWlsYWJsZVdpZGdldHMgPSBmdW5jdGlvbiAocGlwQWRkQ29tcG9uZW50RGlhbG9nUHJvdmlkZXI6IElBZGRDb21wb25lbnREaWFsb2dwcm92aWRlcikge1xyXG4gICAgcGlwQWRkQ29tcG9uZW50RGlhbG9nUHJvdmlkZXIuY29uZmlnV2lkZ2V0TGlzdChbXHJcbiAgICAgIFt7XHJcbiAgICAgICAgICB0aXRsZTogJ0V2ZW50JyxcclxuICAgICAgICAgIGljb246ICdkb2N1bWVudCcsXHJcbiAgICAgICAgICBuYW1lOiAnZXZlbnQnLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aXRsZTogJ1Bvc2l0aW9uJyxcclxuICAgICAgICAgIGljb246ICdsb2NhdGlvbicsXHJcbiAgICAgICAgICBuYW1lOiAncG9zaXRpb24nLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbe1xyXG4gICAgICAgICAgdGl0bGU6ICdDYWxlbmRhcicsXHJcbiAgICAgICAgICBpY29uOiAnZGF0ZScsXHJcbiAgICAgICAgICBuYW1lOiAnY2FsZW5kYXInLFxyXG4gICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aXRsZTogJ1N0aWNreSBOb3RlcycsXHJcbiAgICAgICAgICBpY29uOiAnbm90ZS10YWtlJyxcclxuICAgICAgICAgIG5hbWU6ICdub3RlcycsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnU3RhdGlzdGljcycsXHJcbiAgICAgICAgICBpY29uOiAndHItc3RhdGlzdGljcycsXHJcbiAgICAgICAgICBuYW1lOiAnc3RhdGlzdGljcycsXHJcbiAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIF0pO1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgZHJhZ2dhYmxlT3B0aW9ucyB7XHJcbiAgICB0aWxlV2lkdGg6IG51bWJlcjtcclxuICAgIHRpbGVIZWlnaHQ6IG51bWJlcjtcclxuICAgIGd1dHRlcjogbnVtYmVyO1xyXG4gICAgaW5saW5lOiBib29sZWFuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgREVGQVVMVF9HUklEX09QVElPTlM6IGRyYWdnYWJsZU9wdGlvbnMgPSB7XHJcbiAgICB0aWxlV2lkdGg6IDE1MCwgLy8gJ3B4J1xyXG4gICAgdGlsZUhlaWdodDogMTUwLCAvLyAncHgnXHJcbiAgICBndXR0ZXI6IDEwLCAvLyAncHgnXHJcbiAgICBpbmxpbmU6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgaW50ZXJmYWNlIERhc2hib2FyZEJpbmRpbmdzIHtcclxuICAgICAgZ3JpZE9wdGlvbnM6IGFueTtcclxuICAgICAgZ3JvdXBBZGRpdGlvbmFsQWN0aW9uczogYW55O1xyXG4gICAgICBncm91cGVkV2lkZ2V0czogYW55O1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgRGFzaGJvYXJkQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBEYXNoYm9hcmRCaW5kaW5ncyB7XHJcbiAgICBwcml2YXRlIGRlZmF1bHRHcm91cE1lbnVBY3Rpb25zOiBhbnkgPSBbe1xyXG4gICAgICAgIHRpdGxlOiAnQWRkIENvbXBvbmVudCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudChncm91cEluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1JlbW92ZScsXHJcbiAgICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUdyb3VwKGdyb3VwSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNhbGxiYWNrOiAoZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2NvbmZpZ3VyYXRlIGdyb3VwIHdpdGggaW5kZXg6JywgZ3JvdXBJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gICAgcHJpdmF0ZSBfaW5jbHVkZVRwbDogc3RyaW5nID0gJzxwaXAte3sgdHlwZSB9fS13aWRnZXQgZ3JvdXA9XCJncm91cEluZGV4XCIgaW5kZXg9XCJpbmRleFwiJyArXHJcbiAgICAgICdwaXAtb3B0aW9ucz1cIiRwYXJlbnQuJGN0cmwuZ3JvdXBlZFdpZGdldHNbZ3JvdXBJbmRleF1bXFwnc291cmNlXFwnXVtpbmRleF0ub3B0c1wiPicgK1xyXG4gICAgICAnPC9waXAte3sgdHlwZSB9fS13aWRnZXQ+JztcclxuXHJcbiAgICBwdWJsaWMgZ3JvdXBlZFdpZGdldHM6IGFueTtcclxuICAgIHB1YmxpYyBkcmFnZ2FibGVHcmlkT3B0aW9uczogZHJhZ2dhYmxlT3B0aW9ucztcclxuICAgIHB1YmxpYyB3aWRnZXRzVGVtcGxhdGVzOiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JvdXBNZW51QWN0aW9uczogYW55ID0gdGhpcy5kZWZhdWx0R3JvdXBNZW51QWN0aW9ucztcclxuICAgIHB1YmxpYyB3aWRnZXRzQ29udGV4dDogYW55O1xyXG4gICAgcHVibGljIGdyaWRPcHRpb25zOiBhbnk7XHJcbiAgICBwdWJsaWMgZ3JvdXBBZGRpdGlvbmFsQWN0aW9uczogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGF0dHJzOiBhbnksXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFueSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGludGVycG9sYXRlOiBhbmd1bGFyLklJbnRlcnBvbGF0ZVNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgcGlwQWRkQ29tcG9uZW50RGlhbG9nOiBJQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSBwaXBXaWRnZXRUZW1wbGF0ZTogSVdpZGdldFRlbXBsYXRlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIC8vIEFkZCBjbGFzcyB0byBzdHlsZSBzY3JvbGwgYmFyXHJcbiAgICAgICRlbGVtZW50LmFkZENsYXNzKCdwaXAtc2Nyb2xsJyk7XHJcblxyXG4gICAgICAvLyBTZXQgdGlsZXMgZ3JpZCBvcHRpb25zXHJcbiAgICAgIHRoaXMuZHJhZ2dhYmxlR3JpZE9wdGlvbnMgPSB0aGlzLmdyaWRPcHRpb25zIHx8IERFRkFVTFRfR1JJRF9PUFRJT05TO1xyXG5cclxuICAgICAgLy8gU3dpdGNoIGlubGluZSBkaXNwbGF5aW5nXHJcbiAgICAgIGlmICh0aGlzLmRyYWdnYWJsZUdyaWRPcHRpb25zLmlubGluZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdpbmxpbmUtZ3JpZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEV4dGVuZCBncm91cCdzIG1lbnUgYWN0aW9uc1xyXG4gICAgICBpZiAodGhpcy5ncm91cEFkZGl0aW9uYWxBY3Rpb25zKSBhbmd1bGFyLmV4dGVuZCh0aGlzLmdyb3VwTWVudUFjdGlvbnMsIHRoaXMuZ3JvdXBBZGRpdGlvbmFsQWN0aW9ucyk7XHJcblxyXG4gICAgICAvLyBDb21waWxlIHdpZGdldHNcclxuICAgICAgdGhpcy53aWRnZXRzQ29udGV4dCA9ICRzY29wZTtcclxuICAgICAgdGhpcy5jb21waWxlV2lkZ2V0cygpO1xyXG5cclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygndmlzaWJsZScpO1xyXG4gICAgICB9LCA3MDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29tcGlsZVdpZGdldHMoKSB7XHJcbiAgICAgIF8uZWFjaCh0aGlzLmdyb3VwZWRXaWRnZXRzLCAoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICBncm91cC5yZW1vdmVkV2lkZ2V0cyA9IGdyb3VwLnJlbW92ZWRXaWRnZXRzIHx8IFtdLFxyXG4gICAgICAgICAgZ3JvdXAuc291cmNlID0gZ3JvdXAuc291cmNlLm1hcCgod2lkZ2V0LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBFc3RhYmxpc2ggZGVmYXVsdCBwcm9wc1xyXG4gICAgICAgICAgICB3aWRnZXQuc2l6ZSA9IHdpZGdldC5zaXplIHx8IHtcclxuICAgICAgICAgICAgICBjb2xTcGFuOiAxLFxyXG4gICAgICAgICAgICAgIHJvd1NwYW46IDFcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2lkZ2V0LmluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgIHdpZGdldC5ncm91cEluZGV4ID0gZ3JvdXBJbmRleDtcclxuICAgICAgICAgICAgd2lkZ2V0Lm1lbnUgPSB3aWRnZXQubWVudSB8fCB7fTtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQod2lkZ2V0Lm1lbnUsIFt7XHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdSZW1vdmUnLFxyXG4gICAgICAgICAgICAgIGNsaWNrOiAoaXRlbSwgcGFyYW1zLCBvYmplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlV2lkZ2V0KGl0ZW0sIHBhcmFtcywgb2JqZWN0KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1dKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgb3B0czogd2lkZ2V0LFxyXG4gICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLnBpcFdpZGdldFRlbXBsYXRlLmdldFRlbXBsYXRlKHdpZGdldCwgdGhpcy5faW5jbHVkZVRwbClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRDb21wb25lbnQoZ3JvdXBJbmRleCkge1xyXG4gICAgICB0aGlzLnBpcEFkZENvbXBvbmVudERpYWxvZ1xyXG4gICAgICAgIC5zaG93KHRoaXMuZ3JvdXBlZFdpZGdldHMsIGdyb3VwSW5kZXgpXHJcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgIHZhciBhY3RpdmVHcm91cDtcclxuXHJcbiAgICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZUdyb3VwID0gdGhpcy5ncm91cGVkV2lkZ2V0c1tkYXRhLmdyb3VwSW5kZXhdO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYWN0aXZlR3JvdXAgPSB7XHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdOZXcgZ3JvdXAnLFxyXG4gICAgICAgICAgICAgIHNvdXJjZTogW11cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmFkZFdpZGdldHMoYWN0aXZlR3JvdXAuc291cmNlLCBkYXRhLndpZGdldHMpO1xyXG5cclxuICAgICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHMucHVzaChhY3RpdmVHcm91cCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5jb21waWxlV2lkZ2V0cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlR3JvdXAgPSAoZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygncmVtb3ZlR3JvdXAnLCBncm91cEluZGV4KTtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0cy5zcGxpY2UoZ3JvdXBJbmRleCwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRXaWRnZXRzKGdyb3VwLCB3aWRnZXRzKSB7XHJcbiAgICAgIHdpZGdldHMuZm9yRWFjaCgod2lkZ2V0R3JvdXApID0+IHtcclxuICAgICAgICB3aWRnZXRHcm91cC5mb3JFYWNoKCh3aWRnZXQpID0+IHtcclxuICAgICAgICAgIGlmICh3aWRnZXQuYW1vdW50KSB7XHJcbiAgICAgICAgICAgIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHdpZGdldC5hbW91bnQpKS5mb3JFYWNoKCgpID0+IHtcclxuICAgICAgICAgICAgICBncm91cC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IHdpZGdldC5uYW1lXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbW92ZVdpZGdldChpdGVtLCBwYXJhbXMsIG9iamVjdCkge1xyXG4gICAgICB0aGlzLmdyb3VwZWRXaWRnZXRzW3BhcmFtcy5vcHRpb25zLmdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzID0gW107XHJcbiAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMucHVzaChwYXJhbXMub3B0aW9ucy5pbmRleCk7XHJcbiAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0uc291cmNlLnNwbGljZShwYXJhbXMub3B0aW9ucy5pbmRleCwgMSk7XHJcbiAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBlZFdpZGdldHNbcGFyYW1zLm9wdGlvbnMuZ3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMgPSBbXTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgY29uc3QgcGlwRGFzaGJvYXJkOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIGdyaWRPcHRpb25zOiAnPXBpcEdyaWRPcHRpb25zJyxcclxuICAgICAgZ3JvdXBBZGRpdGlvbmFsQWN0aW9uczogJz1waXBHcm91cEFjdGlvbnMnLFxyXG4gICAgICBncm91cGVkV2lkZ2V0czogJz1waXBHcm91cHMnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogRGFzaGJvYXJkQ29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnRGFzaGJvYXJkLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEYXNoYm9hcmQnKVxyXG4gICAgLmNvbmZpZyhjb25maWd1cmVBdmFpbGFibGVXaWRnZXRzKVxyXG4gICAgLmNvbmZpZyhzZXRUcmFuc2xhdGlvbnMpXHJcbiAgICAuY29tcG9uZW50KCdwaXBEYXNoYm9hcmQnLCBwaXBEYXNoYm9hcmQpO1xyXG5cclxufSIsImV4cG9ydCBjbGFzcyBBZGRDb21wb25lbnREaWFsb2dXaWRnZXQge1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIGljb246IHN0cmluZztcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGFtb3VudDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyIHtcclxuICAgIHB1YmxpYyBkZWZhdWx0V2lkZ2V0czogW0FkZENvbXBvbmVudERpYWxvZ1dpZGdldFtdXTtcclxuICAgIHB1YmxpYyBncm91cHM6IGFueTtcclxuICAgIHB1YmxpYyB0b3RhbFdpZGdldHM6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgZ3JvdXBzLCAvLyBMYXRlciBtYXkgYmUgZ3JvdXAgdHlwZVxyXG4gICAgICAgIHB1YmxpYyBhY3RpdmVHcm91cEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgd2lkZ2V0TGlzdDogW0FkZENvbXBvbmVudERpYWxvZ1dpZGdldFtdXSxcclxuICAgICAgICBwdWJsaWMgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUdyb3VwSW5kZXggPSBfLmlzTnVtYmVyKGFjdGl2ZUdyb3VwSW5kZXgpID8gYWN0aXZlR3JvdXBJbmRleCA6IC0xO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdFdpZGdldHMgPSBfLmNsb25lRGVlcCh3aWRnZXRMaXN0KTtcclxuICAgICAgICB0aGlzLmdyb3VwcyA9IF8ubWFwKGdyb3VwcywgZnVuY3Rpb24gKGdyb3VwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBncm91cFsndGl0bGUnXTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkKCkge1xyXG4gICAgICAgIHRoaXMuJG1kRGlhbG9nLmhpZGUoe1xyXG4gICAgICAgICAgICBncm91cEluZGV4OiB0aGlzLmFjdGl2ZUdyb3VwSW5kZXgsXHJcbiAgICAgICAgICAgIHdpZGdldHM6IHRoaXMuZGVmYXVsdFdpZGdldHNcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGNhbmNlbCgpIHtcclxuICAgICAgICB0aGlzLiRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGVuY3JlYXNlKGdyb3VwSW5kZXg6IG51bWJlciwgd2lkZ2V0SW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IHdpZGdldCA9IHRoaXMuZGVmYXVsdFdpZGdldHNbZ3JvdXBJbmRleF1bd2lkZ2V0SW5kZXhdO1xyXG4gICAgICAgIHdpZGdldC5hbW91bnQrKztcclxuICAgICAgICB0aGlzLnRvdGFsV2lkZ2V0cysrO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgZGVjcmVhc2UoZ3JvdXBJbmRleDogbnVtYmVyLCB3aWRnZXRJbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3Qgd2lkZ2V0ID0gdGhpcy5kZWZhdWx0V2lkZ2V0c1tncm91cEluZGV4XVt3aWRnZXRJbmRleF07XHJcbiAgICAgICAgd2lkZ2V0LmFtb3VudCA9IHdpZGdldC5hbW91bnQgPyB3aWRnZXQuYW1vdW50IC0gMSA6IDA7XHJcbiAgICAgICAgdGhpcy50b3RhbFdpZGdldHMgPSB0aGlzLnRvdGFsV2lkZ2V0cyA/IHRoaXMudG90YWxXaWRnZXRzIC0gMSA6IDA7XHJcbiAgICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2cnLCBbJ25nTWF0ZXJpYWwnXSk7XHJcblxyXG5pbXBvcnQgJy4vQWRkQ29tcG9uZW50UHJvdmlkZXInOyIsImltcG9ydCB7XHJcbiAgQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0LFxyXG4gIEFkZENvbXBvbmVudERpYWxvZ0NvbnRyb2xsZXJcclxufSBmcm9tICcuL0FkZENvbXBvbmVudERpYWxvZ0NvbnRyb2xsZXInO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSB7XHJcbiAgc2hvdyhncm91cHMsIGFjdGl2ZUdyb3VwSW5kZXgpOiBhbmd1bGFyLklQcm9taXNlIDwgYW55ID4gO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBZGRDb21wb25lbnREaWFsb2dwcm92aWRlciB7XHJcbiAgY29uZmlnV2lkZ2V0TGlzdChsaXN0OiBbQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0W11dKTogdm9pZDtcclxufVxyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGZ1bmN0aW9uIHNldFRyYW5zbGF0aW9ucygkaW5qZWN0b3I6IG5nLmF1dG8uSUluamVjdG9yU2VydmljZSkge1xyXG4gICAgY29uc3QgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgOiBudWxsO1xyXG4gICAgaWYgKHBpcFRyYW5zbGF0ZSkge1xyXG4gICAgICAoPGFueT5waXBUcmFuc2xhdGUpLnNldFRyYW5zbGF0aW9ucygnZW4nLCB7XHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1RJVExFOiAnQWRkIGNvbXBvbmVudCcsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1VTRV9IT1RfS0VZUzogJ1VzZSBcIkVudGVyXCIgb3IgXCIrXCIgYnV0dG9ucyBvbiBrZXlib2FyZCB0byBlbmNyZWFzZSBhbmQgXCJEZWxldGVcIiBvciBcIi1cIiB0byBkZWNyZWFzZSB0aWxlcyBhbW91bnQnLFxyXG4gICAgICAgIERBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19DUkVBVEVfTkVXX0dST1VQOiAnQ3JlYXRlIG5ldyBncm91cCdcclxuICAgICAgfSk7XHJcbiAgICAgICg8YW55PnBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdydScsIHtcclxuICAgICAgICBEQVNIQk9BUkRfQUREX0NPTVBPTkVOVF9ESUFMT0dfVElUTEU6ICfQlNC+0LHQsNCy0LjRgtGMINC60L7QvNC/0L7QvdC10L3RgicsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1VTRV9IT1RfS0VZUzogJ9CY0YHQv9C+0LvRjNC30YPQudGC0LUgXCJFbnRlclwiINC40LvQuCBcIitcIiDQutC70LDQstC40YjQuCDQvdCwINC60LvQsNCy0LjQsNGC0YPRgNC1INGH0YLQvtCx0Ysg0YPQstC10LvQuNGH0LjRgtGMINC4IFwiRGVsZXRlXCIgb3IgXCItXCIg0YfRgtC+0LHRiyDRg9C80LXQvdGI0LjRgtGMINC60L7Qu9C40YfQtdGB0YLQstC+INGC0LDQudC70L7QsicsXHJcbiAgICAgICAgREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX0NSRUFURV9ORVdfR1JPVVA6ICfQodC+0LfQtNCw0YLRjCDQvdC+0LLRg9GOINCz0YDRg9C/0L/RgydcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlIGltcGxlbWVudHMgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2Uge1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSB3aWRnZXRMaXN0OiBbQWRkQ29tcG9uZW50RGlhbG9nV2lkZ2V0W11dLFxyXG4gICAgICBwcml2YXRlICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgKSB7fVxyXG5cclxuICAgIHB1YmxpYyBzaG93KGdyb3VwcywgYWN0aXZlR3JvdXBJbmRleCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kbWREaWFsb2dcclxuICAgICAgICAuc2hvdyh7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXHJcbiAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgY29udHJvbGxlcjogQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlcixcclxuICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2RpYWxvZ0N0cmwnLFxyXG4gICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZSxcclxuICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgZ3JvdXBzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGdyb3VwcztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWN0aXZlR3JvdXBJbmRleDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBhY3RpdmVHcm91cEluZGV4O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3aWRnZXRMaXN0OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICg8YW55PnRoaXMud2lkZ2V0TGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjbGFzcyBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlciBpbXBsZW1lbnRzIElBZGRDb21wb25lbnREaWFsb2dwcm92aWRlciB7XHJcbiAgICBwcml2YXRlIF9zZXJ2aWNlOiBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlO1xyXG4gICAgcHJpdmF0ZSBfd2lkZ2V0TGlzdDogW0FkZENvbXBvbmVudERpYWxvZ1dpZGdldFtdXSA9IG51bGw7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIHB1YmxpYyBjb25maWdXaWRnZXRMaXN0ID0gZnVuY3Rpb24gKGxpc3Q6IFtBZGRDb21wb25lbnREaWFsb2dXaWRnZXRbXV0pIHtcclxuICAgICAgdGhpcy5fd2lkZ2V0TGlzdCA9IGxpc3Q7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyAkZ2V0KCRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZSkge1xyXG4gICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICBpZiAodGhpcy5fc2VydmljZSA9PSBudWxsKVxyXG4gICAgICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSh0aGlzLl93aWRnZXRMaXN0LCAkbWREaWFsb2cpO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuX3NlcnZpY2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEYXNoYm9hcmQnKVxyXG4gICAgLmNvbmZpZyhzZXRUcmFuc2xhdGlvbnMpXHJcbiAgICAucHJvdmlkZXIoJ3BpcEFkZENvbXBvbmVudERpYWxvZycsIEFkZENvbXBvbmVudERpYWxvZ1Byb3ZpZGVyKTtcclxufSkoKTsiLCJcclxuY2xhc3MgVGlsZUNvbG9ycyB7XHJcbiAgICBzdGF0aWMgYWxsOiBzdHJpbmdbXSA9IFsncHVycGxlJywgJ2dyZWVuJywgJ2dyYXknLCAnb3JhbmdlJywgJ2JsdWUnXTtcclxufVxyXG5cclxuY2xhc3MgVGlsZVNpemVzIHtcclxuICAgIHN0YXRpYyBhbGw6IGFueSA9IFt7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTCcsXHJcbiAgICAgICAgICAgIGlkOiAnMTEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9XSURFJyxcclxuICAgICAgICAgICAgaWQ6ICcyMSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ0RBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFJyxcclxuICAgICAgICAgICAgaWQ6ICcyMidcclxuICAgICAgICB9XHJcbiAgICBdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV2lkZ2V0Q29uZmlnRGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICBwdWJsaWMgY29sb3JzOiBzdHJpbmdbXSA9IFRpbGVDb2xvcnMuYWxsO1xyXG4gICAgcHVibGljIHNpemVzOiBhbnkgPSBUaWxlU2l6ZXMuYWxsO1xyXG4gICAgcHVibGljIHNpemVJZDogc3RyaW5nID0gVGlsZVNpemVzLmFsbFswXS5pZDtcclxuICAgIHB1YmxpYyBvbkNhbmNlbDogRnVuY3Rpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIHBhcmFtcyxcclxuICAgICAgICBwdWJsaWMgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHRoaXMucGFyYW1zKTtcclxuICAgICAgICB0aGlzLnNpemVJZCA9ICcnICsgdGhpcy5wYXJhbXMuc2l6ZS5jb2xTcGFuICsgdGhpcy5wYXJhbXMuc2l6ZS5yb3dTcGFuO1xyXG5cclxuICAgICAgICB0aGlzLm9uQ2FuY2VsID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5jYW5jZWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQXBwbHkodXBkYXRlZERhdGEpIHtcclxuICAgICAgICB0aGlzWydzaXplJ10uc2l6ZVggPSBOdW1iZXIodGhpcy5zaXplSWQuc3Vic3RyKDAsIDEpKTtcclxuICAgICAgICB0aGlzWydzaXplJ10uc2l6ZVkgPSBOdW1iZXIodGhpcy5zaXplSWQuc3Vic3RyKDEsIDEpKTtcclxuICAgICAgICB0aGlzLiRtZERpYWxvZy5oaWRlKHVwZGF0ZWREYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nJywgWyduZ01hdGVyaWFsJ10pO1xyXG5cclxuaW1wb3J0ICcuL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5pbXBvcnQgJy4vQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50JzsiLCJcclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICBpbnRlcmZhY2UgSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcblxyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogYW55O1xyXG4gICAgICAgIHBpcERpYWxvZ1Njb3BlOiBhbnk7XHJcbiAgICAgICAgcGlwQXBwbHk6IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRCaW5kaW5nczogSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzID0ge1xyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogJzwnLFxyXG4gICAgICAgIHBpcERpYWxvZ1Njb3BlOiAnPCcsXHJcbiAgICAgICAgcGlwQXBwbHk6ICcmJ1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudENoYW5nZXMgaW1wbGVtZW50cyBuZy5JT25DaGFuZ2VzT2JqZWN0LCBJV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IG5nLklDaGFuZ2VzT2JqZWN0PGFueT47XHJcblxyXG4gICAgICAgIHBpcEV4dGVuc2lvblVybDogbmcuSUNoYW5nZXNPYmplY3Q8c3RyaW5nPjtcclxuICAgICAgICBwaXBEaWFsb2dTY29wZTogbmcuSUNoYW5nZXNPYmplY3Q8bmcuSVNjb3BlPjtcclxuXHJcbiAgICAgICAgcGlwQXBwbHk6IG5nLklDaGFuZ2VzT2JqZWN0PCh7dXBkYXRlZERhdGE6IGFueX0pID0+IG5nLklQcm9taXNlPHZvaWQ+PjtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEF0dHJpYnV0ZXMgZXh0ZW5kcyBuZy5JQXR0cmlidXRlcyB7XHJcbiAgICAgICAgcGlwRXh0ZW5zaW9uVXJsOiBzdHJpbmdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRDb250cm9sbGVyIGltcGxlbWVudHMgSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEJpbmRpbmdzIHtcclxuICAgICAgICBwdWJsaWMgcGlwRXh0ZW5zaW9uVXJsOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIHBpcERpYWxvZ1Njb3BlOiBuZy5JU2NvcGU7XHJcbiAgICAgICAgcHVibGljIHBpcEFwcGx5OiAocGFyYW06IHt1cGRhdGVkRGF0YTogYW55fSkgPT4gbmcuSVByb21pc2U8dm9pZD47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsIFxyXG4gICAgICAgICAgICBwcml2YXRlICRlbGVtZW50OiBKUXVlcnksIFxyXG4gICAgICAgICAgICBwcml2YXRlICRhdHRyczogSVdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudEF0dHJpYnV0ZXNcclxuICAgICAgICApIHsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBpcERpYWxvZ1Njb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCBjaGFuZ2VzLnBpcERpYWxvZ1Njb3BlLmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNoYW5nZXMucGlwRXh0ZW5zaW9uVXJsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0ZW1wbGF0ZVJlcXVlc3QoY2hhbmdlcy5waXBFeHRlbnNpb25VcmwuY3VycmVudFZhbHVlLCBmYWxzZSkudGhlbigoaHRtbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgncGlwLWV4dGVuc2lvbi1wb2ludCcpLnJlcGxhY2VXaXRoKHRoaXMuJGNvbXBpbGUoaHRtbCkodGhpcy4kc2NvcGUpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb25BcHBseSgpIHtcclxuICAgICAgICAgICAgdGhpcy5waXBBcHBseSh7dXBkYXRlZERhdGE6IHRoaXN9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGlwV2lkZ2V0Q29uZmlnQ29tcG9uZW50OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50Q29udHJvbGxlcixcclxuICAgICAgICBiaW5kaW5nczogV2lkZ2V0Q29uZmlnRXh0ZW5kQ29tcG9uZW50QmluZGluZ3NcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nJylcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBXaWRnZXRDb25maWdFeHRlbmRDb21wb25lbnQnLCBwaXBXaWRnZXRDb25maWdDb21wb25lbnQpO1xyXG59KSgpOyIsImltcG9ydCB7IFdpZGdldENvbmZpZ0RpYWxvZ0NvbnRyb2xsZXIgfSBmcm9tICcuL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJV2lkZ2V0Q29uZmlnU2VydmljZSB7XHJcbiAgICBzaG93KHBhcmFtczogSVdpZGdldENvbmZpZ0RpYWxvZ09wdGlvbnMsIHN1Y2Nlc3NDYWxsYmFjayA/IDogKGtleSkgPT4gdm9pZCwgY2FuY2VsQ2FsbGJhY2sgPyA6ICgpID0+IHZvaWQpOiBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldENvbmZpZ0RpYWxvZ09wdGlvbnMgZXh0ZW5kcyBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dPcHRpb25zIHtcclxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nO1xyXG4gICAgZXh0ZW5zaW9uVXJsPzogc3RyaW5nO1xyXG4gICAgZXZlbnQ/OiBhbnk7XHJcbn1cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0VHJhbnNsYXRpb25zKCRpbmplY3RvcjogbmcuYXV0by5JSW5qZWN0b3JTZXJ2aWNlKSB7XHJcbiAgICAgICAgY29uc3QgcGlwVHJhbnNsYXRlID0gJGluamVjdG9yLmhhcygncGlwVHJhbnNsYXRlUHJvdmlkZXInKSA/ICRpbmplY3Rvci5nZXQoJ3BpcFRyYW5zbGF0ZVByb3ZpZGVyJykgOiBudWxsO1xyXG4gICAgICAgIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgICAgICAgICAgKCA8IGFueSA+IHBpcFRyYW5zbGF0ZSkuc2V0VHJhbnNsYXRpb25zKCdlbicsIHtcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19USVRMRTogJ0VkaXQgdGlsZScsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9TTUFMTDogJ1NtYWxsJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX1dJREU6ICdXaWRlJyxcclxuICAgICAgICAgICAgICAgIERBU0hCT0FSRF9XSURHRVRfQ09ORklHX0RJQUxPR19TSVpFX0xBUkdFOiAnTGFyZ2UnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAoIDwgYW55ID4gcGlwVHJhbnNsYXRlKS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1RJVExFOiAn0JjQt9C80LXQvdC40YLRjCDQstC40LTQttC10YInLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfU01BTEw6ICfQnNCw0LvQtdC9LicsXHJcbiAgICAgICAgICAgICAgICBEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfU0laRV9XSURFOiAn0KjQuNGA0L7QutC40LknLFxyXG4gICAgICAgICAgICAgICAgREFTSEJPQVJEX1dJREdFVF9DT05GSUdfRElBTE9HX1NJWkVfTEFSR0U6ICfQkdC+0LvRjNGI0L7QuSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uge1xyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHVibGljICRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZVxyXG4gICAgICAgICkge31cclxuXHJcbiAgICAgICAgcHVibGljIHNob3cocGFyYW1zOiBJV2lkZ2V0Q29uZmlnRGlhbG9nT3B0aW9ucywgc3VjY2Vzc0NhbGxiYWNrID8gOiAoa2V5KSA9PiB2b2lkLCBjYW5jZWxDYWxsYmFjayA/IDogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgICAgICB0aGlzLiRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudDogcGFyYW1zLmV2ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBwYXJhbXMudGVtcGxhdGVVcmwgfHwgJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2cuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogV2lkZ2V0Q29uZmlnRGlhbG9nQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMubG9jYWxzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYW5jZWxDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nJylcclxuICAgICAgICAuY29uZmlnKHNldFRyYW5zbGF0aW9ucylcclxuICAgICAgICAuc2VydmljZSgncGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZScsIFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2UpO1xyXG5cclxufSkoKTsiLCJhbmd1bGFyLm1vZHVsZSgncGlwRHJhZ2dlZCcsIFtdKTtcclxuXHJcbmltcG9ydCAnLi9EcmFnZ2FibGVUaWxlU2VydmljZSc7XHJcbmltcG9ydCAnLi9EcmFnZ2FibGVDb21wb25lbnQnO1xyXG5pbXBvcnQgJy4vZHJhZ2dhYmxlX2dyb3VwL0RyYWdnYWJsZVRpbGVzR3JvdXBTZXJ2aWNlJ1xyXG5pbXBvcnQgJy4vZHJhZ2dhYmxlX2dyb3VwL0RyYWdnYWJsZVRpbGVzR3JvdXBEaXJlY3RpdmUnIiwiZGVjbGFyZSB2YXIgaW50ZXJhY3Q7XHJcblxyXG5pbXBvcnQge1xyXG4gIERyYWdUaWxlU2VydmljZSxcclxuICBJRHJhZ1RpbGVTZXJ2aWNlLFxyXG4gIElEcmFnVGlsZUNvbnN0cnVjdG9yXHJcbn0gZnJvbSAnLi9EcmFnZ2FibGVUaWxlU2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgVGlsZXNHcmlkU2VydmljZSxcclxuICBJVGlsZXNHcmlkU2VydmljZSxcclxuICBJVGlsZXNHcmlkQ29uc3RydWN0b3JcclxufSBmcm9tICcuL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwU2VydmljZSc7XHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9USUxFX1dJRFRIOiBudW1iZXIgPSAxNTA7XHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1RJTEVfSEVJR0hUOiBudW1iZXIgPSAxNTA7XHJcbmV4cG9ydCBjb25zdCBVUERBVEVfR1JPVVBTX0VWRU5UID0gXCJwaXBVcGRhdGVEYXNoYm9hcmRHcm91cHNDb25maWdcIjtcclxuXHJcbmNvbnN0IFNJTVBMRV9MQVlPVVRfQ09MVU1OU19DT1VOVDogbnVtYmVyID0gMjtcclxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xyXG4gIHRpbGVXaWR0aDogREVGQVVMVF9USUxFX1dJRFRILCAvLyAncHgnXHJcbiAgdGlsZUhlaWdodDogREVGQVVMVF9USUxFX0hFSUdIVCwgLy8gJ3B4J1xyXG4gIGd1dHRlcjogMjAsIC8vICdweCdcclxuICBjb250YWluZXI6ICdwaXAtZHJhZ2dhYmxlLWdyaWQ6Zmlyc3Qtb2YtdHlwZScsXHJcbiAgLy9tb2JpbGVCcmVha3BvaW50ICAgICAgIDogWFhYLCAgIC8vIEdldCBmcm9tIHBpcE1lZGlhIFNlcnZpY2UgaW4gdGhlIGNvbnN0cnVjdG9yXHJcbiAgYWN0aXZlRHJvcHpvbmVDbGFzczogJ2Ryb3B6b25lLWFjdGl2ZScsXHJcbiAgZ3JvdXBDb250YW5pbmVyU2VsZWN0b3I6ICcucGlwLWRyYWdnYWJsZS1ncm91cDpub3QoLmZpY3QtZ3JvdXApJyxcclxufTtcclxuXHJcbntcclxuXHJcbiAgaW50ZXJmYWNlIElEcmFnZ2FibGVCaW5kaW5ncyB7XHJcbiAgICAgIHRpbGVzVGVtcGxhdGVzOiBhbnk7XHJcbiAgICAgIHRpbGVzQ29udGV4dDogYW55O1xyXG4gICAgICBvcHRpb25zOiBhbnk7XHJcbiAgICAgIGdyb3VwTWVudUFjdGlvbnM6IGFueTtcclxuICAgICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gIH1cclxuXHJcbiAgaW50ZXJmYWNlIElEcmFnZ2FibGVDb250cm9sbGVyU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgdGlsZXNUZW1wbGF0ZXM6IGFueTtcclxuICAgIG9wdGlvbnM6IGFueTtcclxuICB9XHJcblxyXG4gIGludGVyZmFjZSBJVGlsZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgIGluZGV4OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgICBncm91cEluZGV4OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgfVxyXG5cclxuICBjbGFzcyBEcmFnZ2FibGVDb250cm9sbGVyIGltcGxlbWVudHMgbmcuSUNvbXBvbmVudENvbnRyb2xsZXIsIElEcmFnZ2FibGVCaW5kaW5ncyB7XHJcbiAgICBwdWJsaWMgb3B0czogYW55O1xyXG4gICAgcHVibGljIGdyb3VwczogYW55O1xyXG4gICAgcHVibGljIHNvdXJjZURyb3Bab25lRWxlbTogYW55ID0gbnVsbDtcclxuICAgIHB1YmxpYyBpc1NhbWVEcm9wem9uZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgdGlsZUdyb3VwczogYW55ID0gbnVsbDtcclxuICAgIHB1YmxpYyBhdmFpbGFibGVXaWR0aDogbnVtYmVyO1xyXG4gICAgcHVibGljIGF2YWlsYWJsZUNvbHVtbnM6IG51bWJlcjtcclxuICAgIHB1YmxpYyBncm91cHNDb250YWluZXJzOiBhbnk7XHJcbiAgICBwdWJsaWMgY29udGFpbmVyOiBhbnk7XHJcbiAgICBwdWJsaWMgYWN0aXZlRHJhZ2dlZEdyb3VwOiBhbnk7XHJcbiAgICBwdWJsaWMgZHJhZ2dlZFRpbGU6IGFueTtcclxuICAgIHB1YmxpYyBjb250YWluZXJPZmZzZXQ6IGFueTtcclxuICAgIHB1YmxpYyB0aWxlc1RlbXBsYXRlczogYW55O1xyXG4gICAgcHVibGljIHRpbGVzQ29udGV4dDogYW55O1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cE1lbnVBY3Rpb25zOiBhbnk7XHJcbiAgICBwdWJsaWMgJGNvbnRhaW5lcjogSlF1ZXJ5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlICRzY29wZTogSURyYWdnYWJsZUNvbnRyb2xsZXJTY29wZSxcclxuICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgcGlwRHJhZ1RpbGU6IElEcmFnVGlsZVNlcnZpY2UsXHJcbiAgICAgIHBpcFRpbGVzR3JpZDogSVRpbGVzR3JpZFNlcnZpY2UsXHJcbiAgICAgIHBpcE1lZGlhOiBwaXAubGF5b3V0cy5JTWVkaWFTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgdGhpcy5vcHRzID0gXy5tZXJnZSh7XHJcbiAgICAgICAgbW9iaWxlQnJlYWtwb2ludDogcGlwTWVkaWEuYnJlYWtwb2ludHMueHNcclxuICAgICAgfSwgREVGQVVMVF9PUFRJT05TLCB0aGlzLm9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMgPSB0aGlzLnRpbGVzVGVtcGxhdGVzLm1hcCgoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdGl0bGU6IGdyb3VwLnRpdGxlLFxyXG4gICAgICAgICAgZWRpdGluZ05hbWU6IGZhbHNlLFxyXG4gICAgICAgICAgaW5kZXg6IGdyb3VwSW5kZXgsXHJcbiAgICAgICAgICBzb3VyY2U6IGdyb3VwLnNvdXJjZS5tYXAoKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICAgICAgdHBsOiAkY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgICAgICBzaXplOiB0aWxlLm9wdHMuc2l6ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBZGQgdGVtcGxhdGVzIHdhdGNoZXJcclxuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwudGlsZXNUZW1wbGF0ZXMnLCAobmV3VmFsKSA9PiB7XHJcbiAgICAgICAgdGhpcy53YXRjaChuZXdWYWwpO1xyXG4gICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgZGF0YVxyXG4gICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICAgIC8vIFJlc2l6ZSBoYW5kbGVyIFRPRE86IHJlcGxhY2UgYnkgcGlwIHJlc2l6ZSB3YXRjaGVyc1xyXG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlV2lkdGggPSB0aGlzLmdldENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVDb2x1bW5zID0gdGhpcy5nZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlV2lkdGgpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgIGdyb3VwXHJcbiAgICAgICAgICAgIC5zZXRBdmFpbGFibGVDb2x1bW5zKHRoaXMuYXZhaWxhYmxlQ29sdW1ucylcclxuICAgICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sIDUwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUG9zdCBsaW5rIGZ1bmN0aW9uXHJcbiAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdhdGNoIGhhbmRsZXJcclxuICAgIHByaXZhdGUgd2F0Y2gobmV3VmFsKSB7XHJcbiAgICAgIGNvbnN0IHByZXZWYWwgPSB0aGlzLmdyb3VwcztcclxuICAgICAgbGV0IGNoYW5nZWRHcm91cEluZGV4ID0gbnVsbDtcclxuXHJcbiAgICAgIGlmIChuZXdWYWwubGVuZ3RoID4gcHJldlZhbC5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmFkZEdyb3VwKG5ld1ZhbFtuZXdWYWwubGVuZ3RoIC0gMV0pO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuZXdWYWwubGVuZ3RoIDwgcHJldlZhbC5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdyb3VwcyhuZXdWYWwpO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3VmFsLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBXaWRnZXREaWZmID0gcHJldlZhbFtpXS5zb3VyY2UubGVuZ3RoIC0gbmV3VmFsW2ldLnNvdXJjZS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGdyb3VwV2lkZ2V0RGlmZiB8fCAobmV3VmFsW2ldLnJlbW92ZWRXaWRnZXRzICYmIG5ld1ZhbFtpXS5yZW1vdmVkV2lkZ2V0cy5sZW5ndGggPiAwKSkge1xyXG4gICAgICAgICAgY2hhbmdlZEdyb3VwSW5kZXggPSBpO1xyXG5cclxuICAgICAgICAgIGlmIChncm91cFdpZGdldERpZmYgPCAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1RpbGVzID0gbmV3VmFsW2NoYW5nZWRHcm91cEluZGV4XS5zb3VyY2Uuc2xpY2UoZ3JvdXBXaWRnZXREaWZmKTtcclxuXHJcbiAgICAgICAgICAgIF8uZWFjaChuZXdUaWxlcywgKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGlsZScsIHRpbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRkVGlsZXNJbnRvR3JvdXAobmV3VGlsZXMsIHRoaXMudGlsZUdyb3Vwc1tjaGFuZ2VkR3JvdXBJbmRleF0sIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tjaGFuZ2VkR3JvdXBJbmRleF0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZXModGhpcy50aWxlR3JvdXBzW2NoYW5nZWRHcm91cEluZGV4XSwgbmV3VmFsW2NoYW5nZWRHcm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cywgdGhpcy5ncm91cHNDb250YWluZXJzW2NoYW5nZWRHcm91cEluZGV4XSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNPcHRpb25zKG5ld1ZhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbCAmJiB0aGlzLnRpbGVHcm91cHMpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSW5saW5lIGVkaXQgZ3JvdXAgaGFuZGxlcnNcclxuICAgIHB1YmxpYyBvblRpdGxlQ2xpY2soZ3JvdXAsIGV2ZW50KSB7XHJcbiAgICAgIGlmICghZ3JvdXAuZWRpdGluZ05hbWUpIHtcclxuICAgICAgICBncm91cC5vbGRUaXRsZSA9IF8uY2xvbmUoZ3JvdXAudGl0bGUpO1xyXG4gICAgICAgIGdyb3VwLmVkaXRpbmdOYW1lID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldC5jaGlsZHJlblswXSkuZm9jdXMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5jZWxFZGl0aW5nKGdyb3VwKSB7XHJcbiAgICAgIGdyb3VwLnRpdGxlID0gZ3JvdXAub2xkVGl0bGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQmx1clRpdGxlSW5wdXQoZ3JvdXApIHtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ3JvdXAuZWRpdGluZ05hbWUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChVUERBVEVfR1JPVVBTX0VWRU5ULCB0aGlzLmdyb3Vwcyk7XHJcbiAgICAgICAgLy8gVXBkYXRlIHRpdGxlIGluIG91dGVyIHNjb3BlXHJcbiAgICAgICAgdGhpcy50aWxlc1RlbXBsYXRlc1tncm91cC5pbmRleF0udGl0bGUgPSBncm91cC50aXRsZTtcclxuICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25LeWVwcmVzc1RpdGxlSW5wdXQoZ3JvdXAsIGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgIHRoaXMub25CbHVyVGl0bGVJbnB1dChncm91cCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgb3V0ZXIgc2NvcGUgZnVuY3Rpb25zXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzVGVtcGxhdGVzKHVwZGF0ZVR5cGU6IHN0cmluZywgc291cmNlID8gOiBhbnkpIHtcclxuICAgICAgc3dpdGNoICh1cGRhdGVUeXBlKSB7XHJcbiAgICAgICAgY2FzZSAnYWRkR3JvdXAnOlxyXG4gICAgICAgICAgaWYgKHRoaXMuZ3JvdXBzLmxlbmd0aCAhPT0gdGhpcy50aWxlc1RlbXBsYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy50aWxlc1RlbXBsYXRlcy5wdXNoKHNvdXJjZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtb3ZlVGlsZSc6XHJcbiAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIGZyb21JbmRleCxcclxuICAgICAgICAgICAgdG9JbmRleCxcclxuICAgICAgICAgICAgdGlsZU9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyb21UaWxlSW5kZXhcclxuICAgICAgICAgIH0gPSB7XHJcbiAgICAgICAgICAgIGZyb21JbmRleDogc291cmNlLmZyb20uZWxlbS5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWUsXHJcbiAgICAgICAgICAgIHRvSW5kZXg6IHNvdXJjZS50by5lbGVtLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSxcclxuICAgICAgICAgICAgdGlsZU9wdGlvbnM6IHNvdXJjZS50aWxlLm9wdHMub3B0aW9ucyxcclxuICAgICAgICAgICAgZnJvbVRpbGVJbmRleDogc291cmNlLnRpbGUub3B0cy5vcHRpb25zLmluZGV4XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnRpbGVzVGVtcGxhdGVzW2Zyb21JbmRleF0uc291cmNlLnNwbGljZShmcm9tVGlsZUluZGV4LCAxKTtcclxuICAgICAgICAgIHRoaXMudGlsZXNUZW1wbGF0ZXNbdG9JbmRleF0uc291cmNlLnB1c2goe1xyXG4gICAgICAgICAgICBvcHRzOiB0aWxlT3B0aW9uc1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoc291cmNlLmZyb20uZWxlbSk7XHJcbiAgICAgICAgICB0aGlzLnJlSW5kZXhUaWxlcyhzb3VyY2UudG8uZWxlbSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1hbmFnZSB0aWxlcyBmdW5jdGlvbnNcclxuICAgIHByaXZhdGUgY3JlYXRlVGlsZVNjb3BlKHRpbGU6IGFueSk6IElUaWxlU2NvcGUge1xyXG4gICAgICBjb25zdCB0aWxlU2NvcGUgPSA8IElUaWxlU2NvcGUgPiB0aGlzLiRyb290U2NvcGUuJG5ldyhmYWxzZSwgdGhpcy50aWxlc0NvbnRleHQpO1xyXG4gICAgICB0aWxlU2NvcGUuaW5kZXggPSB0aWxlLm9wdHMuaW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuaW5kZXggOiB0aWxlLm9wdHMuaW5kZXg7XHJcbiAgICAgIHRpbGVTY29wZS5ncm91cEluZGV4ID0gdGlsZS5vcHRzLmdyb3VwSW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuZ3JvdXBJbmRleCA6IHRpbGUub3B0cy5ncm91cEluZGV4O1xyXG5cclxuICAgICAgcmV0dXJuIHRpbGVTY29wZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbW92ZVRpbGVzKGdyb3VwLCBpbmRleGVzLCBjb250YWluZXIpIHtcclxuICAgICAgY29uc3QgdGlsZXMgPSAkKGNvbnRhaW5lcikuZmluZCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpO1xyXG5cclxuICAgICAgXy5lYWNoKGluZGV4ZXMsIChpbmRleCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgdGlsZXNbaW5kZXhdLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVJbmRleFRpbGVzKGNvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZUluZGV4VGlsZXMoY29udGFpbmVyLCBnSW5kZXggPyApIHtcclxuICAgICAgY29uc3QgdGlsZXMgPSAkKGNvbnRhaW5lcikuZmluZCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpLFxyXG4gICAgICAgIGdyb3VwSW5kZXggPSBnSW5kZXggPT09IHVuZGVmaW5lZCA/IGNvbnRhaW5lci5hdHRyaWJ1dGVzWydkYXRhLWdyb3VwLWlkJ10udmFsdWUgOiBnSW5kZXg7XHJcblxyXG4gICAgICBfLmVhY2godGlsZXMsICh0aWxlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gJCh0aWxlKS5jaGlsZHJlbigpWzBdO1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnaW5kZXgnXSA9IGluZGV4O1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnZ3JvdXBJbmRleCddID0gZ3JvdXBJbmRleDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVHcm91cHMobmV3R3JvdXBzKSB7XHJcbiAgICAgIGNvbnN0IHJlbW92ZUluZGV4ZXMgPSBbXSxcclxuICAgICAgICByZW1haW4gPSBbXSxcclxuICAgICAgICBjb250YWluZXJzID0gW107XHJcblxyXG5cclxuICAgICAgXy5lYWNoKHRoaXMuZ3JvdXBzLCAoZ3JvdXAsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKF8uZmluZEluZGV4KG5ld0dyb3VwcywgKGcpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGdbJ3RpdGxlJ10gPT09IGdyb3VwLnRpdGxlXHJcbiAgICAgICAgICB9KSA8IDApIHtcclxuICAgICAgICAgIHJlbW92ZUluZGV4ZXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlbWFpbi5wdXNoKGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgXy5lYWNoKHJlbW92ZUluZGV4ZXMucmV2ZXJzZSgpLCAoaW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLmdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIF8uZWFjaChyZW1haW4sIChpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnRhaW5lcnMucHVzaCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbaW5kZXhdKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBjb250YWluZXJzO1xyXG5cclxuICAgICAgXy5lYWNoKHRoaXMuZ3JvdXBzQ29udGFpbmVycywgKGNvbnRhaW5lciwgaW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLnJlSW5kZXhUaWxlcyhjb250YWluZXIsIGluZGV4KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRHcm91cChzb3VyY2VHcm91cCkge1xyXG4gICAgICBjb25zdCBncm91cCA9IHtcclxuICAgICAgICB0aXRsZTogc291cmNlR3JvdXAudGl0bGUsXHJcbiAgICAgICAgc291cmNlOiBzb3VyY2VHcm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB0aWxlU2NvcGUgPSB0aGlzLmNyZWF0ZVRpbGVTY29wZSh0aWxlKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICAgIHRwbDogdGhpcy4kY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB0aWxlLm9wdHMsXHJcbiAgICAgICAgICAgIHNpemU6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMucHVzaChncm91cCk7XHJcbiAgICAgIGlmICghdGhpcy4kc2NvcGUuJCRwaGFzZSkgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcblxyXG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0cy5ncm91cENvbnRhbmluZXJTZWxlY3Rvcik7XHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzLnB1c2goXHJcbiAgICAgICAgICBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCB0aGlzLm9wdHMsIHRoaXMuYXZhaWxhYmxlQ29sdW1ucywgdGhpcy5ncm91cHNDb250YWluZXJzW3RoaXMuZ3JvdXBzQ29udGFpbmVycy5sZW5ndGggLSAxXSlcclxuICAgICAgICAgIC5nZW5lcmF0ZUdyaWQodGhpcy5nZXRTaW5nbGVUaWxlV2lkdGhGb3JNb2JpbGUodGhpcy5hdmFpbGFibGVXaWR0aCkpXHJcbiAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKClcclxuICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KClcclxuICAgICAgICApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNUZW1wbGF0ZXMoJ2FkZEdyb3VwJywgc291cmNlR3JvdXApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkVGlsZXNJbnRvR3JvdXAobmV3VGlsZXMsIGdyb3VwLCBncm91cENvbnRhaW5lcikge1xyXG4gICAgICBuZXdUaWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5jcmVhdGVUaWxlU2NvcGUodGlsZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld1RpbGUgPSBJRHJhZ1RpbGVDb25zdHJ1Y3RvcihEcmFnVGlsZVNlcnZpY2UsIHtcclxuICAgICAgICAgIHRwbDogdGhpcy4kY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgb3B0aW9uczogdGlsZS5vcHRzLFxyXG4gICAgICAgICAgc2l6ZTogdGlsZS5vcHRzLnNpemVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JvdXAuYWRkVGlsZShuZXdUaWxlKTtcclxuXHJcbiAgICAgICAgJCgnPGRpdj4nKVxyXG4gICAgICAgICAgLmFkZENsYXNzKCdwaXAtZHJhZ2dhYmxlLXRpbGUnKVxyXG4gICAgICAgICAgLmFwcGVuZChuZXdUaWxlLmdldENvbXBpbGVkVGVtcGxhdGUoKSlcclxuICAgICAgICAgIC5hcHBlbmRUbyhncm91cENvbnRhaW5lcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlVGlsZXNPcHRpb25zKG9wdGlvbnNHcm91cCkge1xyXG4gICAgICBvcHRpb25zR3JvdXAuZm9yRWFjaCgob3B0aW9uR3JvdXApID0+IHtcclxuICAgICAgICBvcHRpb25Hcm91cC5zb3VyY2UuZm9yRWFjaCgodGlsZU9wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgICAgICBncm91cC51cGRhdGVUaWxlT3B0aW9ucyh0aWxlT3B0aW9ucy5vcHRzKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRUaWxlc0dyb3Vwcyh0aWxlR3JvdXBzLCBvcHRzLCBncm91cHNDb250YWluZXJzKSB7XHJcbiAgICAgIHJldHVybiB0aWxlR3JvdXBzLm1hcCgoZ3JvdXAsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIElUaWxlc0dyaWRDb25zdHJ1Y3RvcihUaWxlc0dyaWRTZXJ2aWNlLCBncm91cC5zb3VyY2UsIG9wdHMsIHRoaXMuYXZhaWxhYmxlQ29sdW1ucywgZ3JvdXBzQ29udGFpbmVyc1tpbmRleF0pXHJcbiAgICAgICAgICAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzR3JvdXBzKG9ubHlQb3NpdGlvbiA/ICwgZHJhZ2dlZFRpbGUgPyApIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIGdyb3VwLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBncm91cFxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDb250YWluZXJXaWR0aCgpOiBhbnkge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLiRjb250YWluZXIgfHwgJCgnYm9keScpO1xyXG4gICAgICByZXR1cm4gY29udGFpbmVyLndpZHRoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBdmFpbGFibGVDb2x1bW5zKGF2YWlsYWJsZVdpZHRoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0cy5tb2JpbGVCcmVha3BvaW50ID4gYXZhaWxhYmxlV2lkdGggPyBTSU1QTEVfTEFZT1VUX0NPTFVNTlNfQ09VTlQgOlxyXG4gICAgICAgIE1hdGguZmxvb3IoYXZhaWxhYmxlV2lkdGggLyAodGhpcy5vcHRzLnRpbGVXaWR0aCArIHRoaXMub3B0cy5ndXR0ZXIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEFjdGl2ZUdyb3VwQW5kVGlsZShlbGVtKTogYW55IHtcclxuICAgICAgY29uc3QgYWN0aXZlID0ge307XHJcblxyXG4gICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICBjb25zdCBmb3VuZFRpbGUgPSBncm91cC5nZXRUaWxlQnlOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICBpZiAoZm91bmRUaWxlKSB7XHJcbiAgICAgICAgICBhY3RpdmVbJ2dyb3VwJ10gPSBncm91cDtcclxuICAgICAgICAgIGFjdGl2ZVsndGlsZSddID0gZm91bmRUaWxlO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gYWN0aXZlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKGF2YWlsYWJsZVdpZHRoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0cy5tb2JpbGVCcmVha3BvaW50ID4gYXZhaWxhYmxlV2lkdGggPyBhdmFpbGFibGVXaWR0aCAvIDIgLSB0aGlzLm9wdHMuZ3V0dGVyIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ1N0YXJ0TGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgYWN0aXZlRW50aXRpZXMgPSB0aGlzLmdldEFjdGl2ZUdyb3VwQW5kVGlsZShldmVudC50YXJnZXQpO1xyXG5cclxuICAgICAgdGhpcy5jb250YWluZXIgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50KCcucGlwLWRyYWdnYWJsZS1ncm91cCcpLmdldCgwKTtcclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZSA9IGFjdGl2ZUVudGl0aWVzWyd0aWxlJ107XHJcbiAgICAgIHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwID0gYWN0aXZlRW50aXRpZXNbJ2dyb3VwJ107XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdkcmFnLXRyYW5zZmVyJyk7XHJcblxyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlLnN0YXJ0RHJhZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnTW92ZUxpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgY29uc3QgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5zdHlsZS5sZWZ0KSB8fCAwKSArIGV2ZW50LmR4O1xyXG4gICAgICBjb25zdCB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LnN0eWxlLnRvcCkgfHwgMCkgKyBldmVudC5keTtcclxuXHJcbiAgICAgIHRoaXMuY29udGFpbmVyT2Zmc2V0ID0gdGhpcy5nZXRDb250YWluZXJPZmZzZXQoKTtcclxuXHJcbiAgICAgIHRhcmdldC5zdHlsZS5sZWZ0ID0geCArICdweCc7IC8vIFRPRE8gW2FwaWRoaXJueWldIEV4dHJhY3QgdW5pdHMgaW50byBvcHRpb25zIHNlY3Rpb25cclxuICAgICAgdGFyZ2V0LnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG5cclxuICAgICAgY29uc3QgYmVsb3dFbGVtZW50ID0gdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAuZ2V0VGlsZUJ5Q29vcmRpbmF0ZXMoe1xyXG4gICAgICAgIGxlZnQ6IGV2ZW50LnBhZ2VYIC0gdGhpcy5jb250YWluZXJPZmZzZXQubGVmdCxcclxuICAgICAgICB0b3A6IGV2ZW50LnBhZ2VZIC0gdGhpcy5jb250YWluZXJPZmZzZXQudG9wXHJcbiAgICAgIH0sIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG5cclxuICAgICAgaWYgKGJlbG93RWxlbWVudCkge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnZWRUaWxlSW5kZXggPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cC5nZXRUaWxlSW5kZXgodGhpcy5kcmFnZ2VkVGlsZSk7XHJcbiAgICAgICAgY29uc3QgYmVsb3dFbGVtSW5kZXggPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cC5nZXRUaWxlSW5kZXgoYmVsb3dFbGVtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKChkcmFnZ2VkVGlsZUluZGV4ICsgMSkgPT09IGJlbG93RWxlbUluZGV4KSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cFxyXG4gICAgICAgICAgLnN3YXBUaWxlcyh0aGlzLmRyYWdnZWRUaWxlLCBiZWxvd0VsZW1lbnQpXHJcbiAgICAgICAgICAuc2V0VGlsZXNEaW1lbnNpb25zKHRydWUsIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG5cclxuICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2V0R3JvdXBDb250YWluZXJzSGVpZ2h0KCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ0VuZExpc3RlbmVyKCkge1xyXG4gICAgICB0aGlzLmRyYWdnZWRUaWxlLnN0b3BEcmFnKHRoaXMuaXNTYW1lRHJvcHpvbmUpO1xyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnZHJhZy10cmFuc2ZlcicpO1xyXG4gICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCA9IG51bGw7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q29udGFpbmVyT2Zmc2V0KCkge1xyXG4gICAgICBjb25zdCBjb250YWluZXJSZWN0ID0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGxlZnQ6IGNvbnRhaW5lclJlY3QubGVmdCxcclxuICAgICAgICB0b3A6IGNvbnRhaW5lclJlY3QudG9wXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRHcm91cENvbnRhaW5lcnNIZWlnaHQoKSB7XHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKCh0aWxlR3JvdXApID0+IHtcclxuICAgICAgICB0aWxlR3JvdXAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1vdmVUaWxlKGZyb20sIHRvLCB0aWxlKSB7XHJcbiAgICAgIGxldCBlbGVtO1xyXG4gICAgICBjb25zdCBtb3ZlZFRpbGUgPSBmcm9tLnJlbW92ZVRpbGUodGlsZSk7XHJcbiAgICAgIGNvbnN0IHRpbGVTY29wZSA9IHRoaXMuY3JlYXRlVGlsZVNjb3BlKHRpbGUpO1xyXG5cclxuICAgICAgJCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbXy5maW5kSW5kZXgodGhpcy50aWxlR3JvdXBzLCBmcm9tKV0pXHJcbiAgICAgICAgLmZpbmQobW92ZWRUaWxlLmdldEVsZW0oKSlcclxuICAgICAgICAucmVtb3ZlKCk7XHJcblxyXG4gICAgICBpZiAodG8gIT09IG51bGwpIHtcclxuICAgICAgICB0by5hZGRUaWxlKG1vdmVkVGlsZSk7XHJcblxyXG4gICAgICAgIGVsZW0gPSB0aGlzLiRjb21waWxlKG1vdmVkVGlsZS5nZXRFbGVtKCkpKHRpbGVTY29wZSk7XHJcblxyXG4gICAgICAgICQodGhpcy5ncm91cHNDb250YWluZXJzW18uZmluZEluZGV4KHRoaXMudGlsZUdyb3VwcywgdG8pXSlcclxuICAgICAgICAgIC5hcHBlbmQoZWxlbSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQodG8uc2V0VGlsZXNEaW1lbnNpb25zLmJpbmQodG8sIHRydWUpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy51cGRhdGVUaWxlc1RlbXBsYXRlcygnbW92ZVRpbGUnLCB7XHJcbiAgICAgICAgZnJvbTogZnJvbSxcclxuICAgICAgICB0bzogdG8sXHJcbiAgICAgICAgdGlsZTogbW92ZWRUaWxlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZHJvcHBlZEdyb3VwSW5kZXggPSBldmVudC50YXJnZXQuYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlO1xyXG4gICAgICBjb25zdCBkcm9wcGVkR3JvdXAgPSB0aGlzLnRpbGVHcm91cHNbZHJvcHBlZEdyb3VwSW5kZXhdO1xyXG5cclxuICAgICAgaWYgKHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwICE9PSBkcm9wcGVkR3JvdXApIHtcclxuICAgICAgICB0aGlzLm1vdmVUaWxlKHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLCBkcm9wcGVkR3JvdXAsIHRoaXMuZHJhZ2dlZFRpbGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKHRydWUpO1xyXG4gICAgICB0aGlzLnNvdXJjZURyb3Bab25lRWxlbSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyb3BUb0ZpY3RHcm91cExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cDtcclxuICAgICAgY29uc3QgdGlsZSA9IHRoaXMuZHJhZ2dlZFRpbGU7XHJcblxyXG4gICAgICB0aGlzLmFkZEdyb3VwKHtcclxuICAgICAgICB0aXRsZTogJ05ldyBncm91cCcsXHJcbiAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVGlsZShmcm9tLCB0aGlzLnRpbGVHcm91cHNbdGhpcy50aWxlR3JvdXBzLmxlbmd0aCAtIDFdLCB0aWxlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKHRydWUpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcEVudGVyTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgaWYgKCF0aGlzLnNvdXJjZURyb3Bab25lRWxlbSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc291cmNlRHJvcFpvbmVFbGVtICE9PSBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyKSB7XHJcbiAgICAgICAgZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlci5jbGFzc0xpc3QuYWRkKCdkcm9wem9uZS1hY3RpdmUnKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnY29weScpO1xyXG4gICAgICAgIHRoaXMuaXNTYW1lRHJvcHpvbmUgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgICAgdGhpcy5pc1NhbWVEcm9wem9uZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBpZiAodGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gIT09IGV2ZW50LnRhcmdldCkge1xyXG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMub3B0cy5hY3RpdmVEcm9wem9uZUNsYXNzKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5vcHRzLmFjdGl2ZURyb3B6b25lQ2xhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVXaWR0aCA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkdGgoKTtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZUNvbHVtbnMgPSB0aGlzLmdldEF2YWlsYWJsZUNvbHVtbnModGhpcy5hdmFpbGFibGVXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdHMuZ3JvdXBDb250YW5pbmVyU2VsZWN0b3IpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3VwcyA9IHRoaXMuaW5pdFRpbGVzR3JvdXBzKHRoaXMuZ3JvdXBzLCB0aGlzLm9wdHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVycyk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5kcmFnZ2FibGUoe1xyXG4gICAgICAgICAgICAvLyBlbmFibGUgYXV0b1Njcm9sbFxyXG4gICAgICAgICAgICBhdXRvU2Nyb2xsOiB0cnVlLFxyXG4gICAgICAgICAgICBvbnN0YXJ0OiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0TGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9ubW92ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZW5kOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0VuZExpc3RlbmVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS1ncm91cC5maWN0LWdyb3VwJylcclxuICAgICAgICAgIC5kcm9wem9uZSh7XHJcbiAgICAgICAgICAgIG9uZHJvcDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BUb0ZpY3RHcm91cExpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyYWdlbnRlcjogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BFbnRlckxpc3RlbmVyKGV2ZW50KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmRyb3BkZWFjdGl2YXRlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnbGVhdmU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wTGVhdmVMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLWdyb3VwJylcclxuICAgICAgICAgIC5kcm9wem9uZSh7XHJcbiAgICAgICAgICAgIG9uZHJvcDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcmFnZW50ZXI6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vbkRyb3BEZWFjdGl2YXRlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZHJhZ2xlYXZlOiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRjb250YWluZXJcclxuICAgICAgICAgIC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAnbWQtbWVudSAubWQtaWNvbi1idXR0b24nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJykuZHJhZ2dhYmxlKGZhbHNlKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5vbignbW91c2V1cCB0b3VjaGVuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKS5kcmFnZ2FibGUodHJ1ZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgY29uc3QgRHJhZ0NvbXBvbmVudDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICB0aWxlc1RlbXBsYXRlczogJz1waXBUaWxlc1RlbXBsYXRlcycsXHJcbiAgICAgIHRpbGVzQ29udGV4dDogJz1waXBUaWxlc0NvbnRleHQnLFxyXG4gICAgICBvcHRpb25zOiAnPXBpcERyYWdnYWJsZUdyaWQnLFxyXG4gICAgICBncm91cE1lbnVBY3Rpb25zOiAnPXBpcEdyb3VwTWVudUFjdGlvbnMnXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICdkcmFnZ2FibGUvRHJhZ2dhYmxlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogRHJhZ2dhYmxlQ29udHJvbGxlclxyXG4gIH1cclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ3BpcERyYWdnZWQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRHJhZ2dhYmxlR3JpZCcsIERyYWdDb21wb25lbnQpO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEcmFnVGlsZUNvbnN0cnVjdG9yIHtcclxuICBuZXcgKG9wdGlvbnM6IGFueSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBJRHJhZ1RpbGVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3RvcjogRHJhZ1RpbGVDb25zdHJ1Y3Rvciwgb3B0aW9uczogYW55KTogSURyYWdUaWxlU2VydmljZSB7XHJcbiAgcmV0dXJuIG5ldyBjb25zdHJ1Y3RvcihvcHRpb25zKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICB0cGw6IGFueTtcclxuICBvcHRzOiBhbnk7XHJcbiAgc2l6ZTogYW55O1xyXG4gIGVsZW06IGFueTtcclxuICBwcmV2aWV3OiBhbnk7XHJcbiAgZ2V0U2l6ZSgpOiBhbnk7XHJcbiAgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTogYW55O1xyXG4gIHNldFBvc2l0aW9uKGxlZnQsIHRvcCk6IGFueTtcclxuICBnZXRDb21waWxlZFRlbXBsYXRlKCk6IGFueTtcclxuICB1cGRhdGVFbGVtKHBhcmVudCk6IGFueTtcclxuICBnZXRFbGVtKCk6IGFueTtcclxuICBzdGFydERyYWcoKTogYW55O1xyXG4gIHN0b3BEcmFnKGlzQW5pbWF0ZSk6IGFueTtcclxuICBzZXRQcmV2aWV3UG9zaXRpb24oY29vcmRzKTogdm9pZDtcclxuICBnZXRPcHRpb25zKCk6IGFueTtcclxuICBzZXRPcHRpb25zKG9wdGlvbnMpOiBhbnk7XHJcbn1cclxuXHJcbmxldCBERUZBVUxUX1RJTEVfU0laRSA9IHtcclxuICBjb2xTcGFuOiAxLFxyXG4gIHJvd1NwYW46IDFcclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBEcmFnVGlsZVNlcnZpY2UgaW1wbGVtZW50cyBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICBwdWJsaWMgdHBsOiBhbnk7XHJcbiAgcHVibGljIG9wdHM6IGFueTtcclxuICBwdWJsaWMgc2l6ZTogYW55O1xyXG4gIHB1YmxpYyBlbGVtOiBhbnk7XHJcbiAgcHVibGljIHByZXZpZXc6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnM6IGFueSkge1xyXG4gICAgdGhpcy50cGwgPSBvcHRpb25zLnRwbC5nZXQoMCk7XHJcbiAgICB0aGlzLm9wdHMgPSBvcHRpb25zO1xyXG4gICAgdGhpcy5zaXplID0gXy5tZXJnZSh7fSwgREVGQVVMVF9USUxFX1NJWkUsIG9wdGlvbnMuc2l6ZSk7XHJcbiAgICB0aGlzLmVsZW0gPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFNpemUoKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnNpemU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTogYW55IHtcclxuICAgIHRoaXMuc2l6ZS53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5zaXplLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICBpZiAodGhpcy5lbGVtKSB7XHJcbiAgICAgIHRoaXMuZWxlbS5jc3Moe1xyXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcclxuICAgICAgICBoZWlnaHQ6IGhlaWdodFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRQb3NpdGlvbihsZWZ0LCB0b3ApOiBhbnkge1xyXG4gICAgdGhpcy5zaXplLmxlZnQgPSBsZWZ0O1xyXG4gICAgdGhpcy5zaXplLnRvcCA9IHRvcDtcclxuXHJcbiAgICBpZiAodGhpcy5lbGVtKSB7XHJcbiAgICAgIHRoaXMuZWxlbS5jc3Moe1xyXG4gICAgICAgIGxlZnQ6IGxlZnQsXHJcbiAgICAgICAgdG9wOiB0b3BcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q29tcGlsZWRUZW1wbGF0ZSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMudHBsO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVFbGVtKHBhcmVudCk6IGFueSB7XHJcbiAgICB0aGlzLmVsZW0gPSAkKHRoaXMudHBsKS5wYXJlbnQocGFyZW50KTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0RWxlbSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbS5nZXQoMCk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhZygpOiBhbnkge1xyXG4gICAgdGhpcy5wcmV2aWV3ID0gJCgnPGRpdj4nKVxyXG4gICAgICAuYWRkQ2xhc3MoJ3BpcC1kcmFnZ2VkLXByZXZpZXcnKVxyXG4gICAgICAuY3NzKHtcclxuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICBsZWZ0OiB0aGlzLmVsZW0uY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgdG9wOiB0aGlzLmVsZW0uY3NzKCd0b3AnKSxcclxuICAgICAgICB3aWR0aDogdGhpcy5lbGVtLmNzcygnd2lkdGgnKSxcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuZWxlbS5jc3MoJ2hlaWdodCcpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbVxyXG4gICAgICAuYWRkQ2xhc3MoJ25vLWFuaW1hdGlvbicpXHJcbiAgICAgIC5jc3Moe1xyXG4gICAgICAgIHpJbmRleDogJzk5OTknXHJcbiAgICAgIH0pXHJcbiAgICAgIC5hZnRlcih0aGlzLnByZXZpZXcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzdG9wRHJhZyhpc0FuaW1hdGUpOiBhbnkge1xyXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgIGlmIChpc0FuaW1hdGUpIHtcclxuICAgICAgdGhpcy5lbGVtXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCduby1hbmltYXRpb24nKVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgbGVmdDogdGhpcy5wcmV2aWV3LmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgdG9wOiB0aGlzLnByZXZpZXcuY3NzKCd0b3AnKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm9uKCd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuZWxlbVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgbGVmdDogc2VsZi5wcmV2aWV3LmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgdG9wOiBzZWxmLnByZXZpZXcuY3NzKCd0b3AnKSxcclxuICAgICAgICAgIHpJbmRleDogJydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnbm8tYW5pbWF0aW9uJyk7XHJcblxyXG4gICAgICBzZWxmLnByZXZpZXcucmVtb3ZlKCk7XHJcbiAgICAgIHNlbGYucHJldmlldyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgZnVuY3Rpb24gb25UcmFuc2l0aW9uRW5kKCkge1xyXG4gICAgICBpZiAoc2VsZi5wcmV2aWV3KSB7XHJcbiAgICAgICAgc2VsZi5wcmV2aWV3LnJlbW92ZSgpO1xyXG4gICAgICAgIHNlbGYucHJldmlldyA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYuZWxlbVxyXG4gICAgICAgIC5jc3MoJ3pJbmRleCcsICcnKVxyXG4gICAgICAgIC5vZmYoJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRQcmV2aWV3UG9zaXRpb24oY29vcmRzKSB7XHJcbiAgICB0aGlzLnByZXZpZXcuY3NzKGNvb3Jkcyk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldE9wdGlvbnMoKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLm9wdHMub3B0aW9ucztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc2V0T3B0aW9ucyhvcHRpb25zKTogYW55IHtcclxuICAgIF8ubWVyZ2UodGhpcy5vcHRzLm9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgXy5tZXJnZSh0aGlzLnNpemUsIG9wdGlvbnMuc2l6ZSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcERyYWdnZWQnKVxyXG4gIC5zZXJ2aWNlKCdwaXBEcmFnVGlsZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICBsZXQgbmV3VGlsZSA9IG5ldyBEcmFnVGlsZVNlcnZpY2Uob3B0aW9ucyk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3VGlsZTtcclxuICAgIH1cclxuICB9KTsiLCJ7XHJcbiAgaW50ZXJmYWNlIERyYWdnYWJsZVRpbGVBdHRyaWJ1dGVzIGV4dGVuZHMgbmcuSUF0dHJpYnV0ZXMge1xyXG4gICAgcGlwRHJhZ2dhYmxlVGlsZXM6IGFueTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIERyYWdnYWJsZVRpbGVMaW5rKFxyXG4gICAgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAkZWxlbTogSlF1ZXJ5LFxyXG4gICAgJGF0dHI6IERyYWdnYWJsZVRpbGVBdHRyaWJ1dGVzXHJcbiAgKSB7XHJcbiAgICBjb25zdCBkb2NGcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxyXG4gICAgICBncm91cCA9ICRzY29wZS4kZXZhbCgkYXR0ci5waXBEcmFnZ2FibGVUaWxlcyk7XHJcblxyXG4gICAgZ3JvdXAuZm9yRWFjaChmdW5jdGlvbiAodGlsZSkge1xyXG4gICAgICBjb25zdCB0cGwgPSB3cmFwQ29tcG9uZW50KHRpbGUuZ2V0Q29tcGlsZWRUZW1wbGF0ZSgpKTtcclxuICAgICAgZG9jRnJhZy5hcHBlbmRDaGlsZCh0cGwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJGVsZW0uYXBwZW5kKGRvY0ZyYWcpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHdyYXBDb21wb25lbnQoZWxlbSkge1xyXG4gICAgICByZXR1cm4gJCgnPGRpdj4nKVxyXG4gICAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAuYXBwZW5kKGVsZW0pXHJcbiAgICAgICAgLmdldCgwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIERyYWdnYWJsZVRpbGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICBsaW5rOiBEcmFnZ2FibGVUaWxlTGlua1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERyYWdnZWQnKVxyXG4gICAgLmRpcmVjdGl2ZSgncGlwRHJhZ2dhYmxlVGlsZXMnLCBEcmFnZ2FibGVUaWxlKTtcclxuXHJcbn0iLCJleHBvcnQgaW50ZXJmYWNlIFRpbGVzR3JpZENvbnN0cnVjdG9yIHtcclxuICBuZXcodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSVRpbGVzR3JpZENvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBUaWxlc0dyaWRDb25zdHJ1Y3RvciwgdGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pOiBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgcmV0dXJuIG5ldyBjb25zdHJ1Y3Rvcih0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVRpbGVzR3JpZFNlcnZpY2Uge1xyXG4gIHRpbGVzOiBhbnk7XHJcbiAgb3B0czogYW55O1xyXG4gIGNvbHVtbnM6IGFueTtcclxuICBlbGVtOiBhbnk7XHJcbiAgZ3JpZENlbGxzOiBhbnk7XHJcbiAgaW5saW5lOiBib29sZWFuO1xyXG4gIGlzTW9iaWxlTGF5b3V0OiBib29sZWFuO1xyXG5cclxuICBhZGRUaWxlKHRpbGUpOiBhbnk7XHJcbiAgZ2V0Q2VsbEJ5UG9zaXRpb24ocm93LCBjb2wpOiBhbnk7XHJcbiAgZ2V0Q2VsbHMocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55O1xyXG4gIGdldENlbGwoc3JjLCBiYXNpY1JvdywgYmFzaWNDb2wsIGNvbHVtbnMpOiBhbnk7XHJcbiAgZ2V0QXZhaWxhYmxlQ2VsbHNNb2JpbGUocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0QmFzaWNSb3cocHJldkNlbGwpOiBhbnk7XHJcbiAgaXNDZWxsRnJlZShyb3csIGNvbCk6IGFueTtcclxuICBnZXRDZWxsSW5kZXgoc3JjQ2VsbCk6IGFueTtcclxuICByZXNlcnZlQ2VsbHMoc3RhcnQsIGVuZCwgZWxlbSk6IHZvaWQ7XHJcbiAgY2xlYXJFbGVtZW50cygpOiB2b2lkO1xyXG4gIHNldEF2YWlsYWJsZUNvbHVtbnMoY29sdW1ucyk6IGFueTtcclxuICBnZW5lcmF0ZUdyaWQoc2luZ2xlVGlsZVdpZHRoID8gKTogYW55O1xyXG4gIHNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGNhbGNDb250YWluZXJIZWlnaHQoKTogYW55O1xyXG4gIGdldFRpbGVCeU5vZGUobm9kZSk6IGFueTtcclxuICBnZXRUaWxlQnlDb29yZGluYXRlcyhjb29yZHMsIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGdldFRpbGVJbmRleCh0aWxlKTogYW55O1xyXG4gIHN3YXBUaWxlcyhtb3ZlZFRpbGUsIGJlZm9yZVRpbGUpOiBhbnk7XHJcbiAgcmVtb3ZlVGlsZShyZW1vdmVUaWxlKTogYW55O1xyXG4gIHVwZGF0ZVRpbGVPcHRpb25zKG9wdHMpOiBhbnk7XHJcbn1cclxuXHJcbmNvbnN0IE1PQklMRV9MQVlPVVRfQ09MVU1OUyA9IDI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGlsZXNHcmlkU2VydmljZSBpbXBsZW1lbnRzIElUaWxlc0dyaWRTZXJ2aWNlIHtcclxuICBwdWJsaWMgdGlsZXM6IGFueTtcclxuICBwdWJsaWMgb3B0czogYW55O1xyXG4gIHB1YmxpYyBjb2x1bW5zOiBhbnk7XHJcbiAgcHVibGljIGVsZW06IGFueTtcclxuICBwdWJsaWMgZ3JpZENlbGxzOiBhbnkgPSBbXTtcclxuICBwdWJsaWMgaW5saW5lOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzTW9iaWxlTGF5b3V0OiBib29sZWFuO1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSkge1xyXG4gICAgdGhpcy50aWxlcyA9IHRpbGVzO1xyXG4gICAgdGhpcy5vcHRzID0gb3B0aW9ucztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnMgfHwgMDsgLy8gYXZhaWxhYmxlIGNvbHVtbnMgaW4gYSByb3dcclxuICAgIHRoaXMuZWxlbSA9IGVsZW07XHJcbiAgICB0aGlzLmdyaWRDZWxscyA9IFtdO1xyXG4gICAgdGhpcy5pbmxpbmUgPSBvcHRpb25zLmlubGluZSB8fCBmYWxzZTtcclxuICAgIHRoaXMuaXNNb2JpbGVMYXlvdXQgPSBjb2x1bW5zID09PSBNT0JJTEVfTEFZT1VUX0NPTFVNTlM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkVGlsZSh0aWxlKTogYW55IHtcclxuICAgIHRoaXMudGlsZXMucHVzaCh0aWxlKTtcclxuICAgIGlmICh0aGlzLnRpbGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICB0aGlzLmdlbmVyYXRlR3JpZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsQnlQb3NpdGlvbihyb3csIGNvbCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkQ2VsbHNbcm93XVtjb2xdO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxscyhwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueSB7XHJcbiAgICBpZiAodGhpcy5pc01vYmlsZUxheW91dCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnkge1xyXG4gICAgbGV0IGxlZnRDb3JuZXJDZWxsO1xyXG4gICAgbGV0IHJpZ2h0Q29ybmVyQ2VsbDtcclxuICAgIGNvbnN0IGJhc2ljQ29sID0gcHJldkNlbGwgJiYgcHJldkNlbGwuY29sIHx8IDA7XHJcbiAgICBjb25zdCBiYXNpY1JvdyA9IHRoaXMuZ2V0QmFzaWNSb3cocHJldkNlbGwpO1xyXG5cclxuICAgIC8vIFNtYWxsIHRpbGVcclxuICAgIGlmIChjb2xTcGFuID09PSAxICYmIHJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgY29uc3QgZ3JpZENvcHkgPSB0aGlzLmdyaWRDZWxscy5zbGljZSgpO1xyXG5cclxuICAgICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gZ3JpZENvcHlbMF1bMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93LCBiYXNpY0NvbCwgdGhpcy5jb2x1bW5zKTtcclxuXHJcbiAgICAgICAgaWYgKCFsZWZ0Q29ybmVyQ2VsbCkge1xyXG4gICAgICAgICAgY29uc3Qgcm93U2hpZnQgPSB0aGlzLmlzTW9iaWxlTGF5b3V0ID8gMSA6IDI7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3cgKyByb3dTaGlmdCwgMCwgdGhpcy5jb2x1bW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNZWRpdW0gdGlsZVxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDIgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBjb25zdCBwcmV2VGlsZVNpemUgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5lbGVtLnNpemUgfHwgbnVsbDtcclxuXHJcbiAgICAgIGlmICghcHJldlRpbGVTaXplKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMikge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDIgPiAwKSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAocHJldlRpbGVTaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldlRpbGVTaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAocHJldkNlbGwucm93ICUgMiA9PT0gMCkge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgLSAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMSAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuaXNDZWxsRnJlZShiYXNpY1JvdywgYmFzaWNDb2wgKyAxKSkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJpZyB0aWxlXHJcbiAgICBpZiAoIXByZXZDZWxsICYmIHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sICsgMSk7XHJcbiAgICB9IGVsc2UgaWYgKHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBpZiAodGhpcy5jb2x1bW5zIC0gYmFzaWNDb2wgLSAyID4gMCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ2VsbEZyZWUoYmFzaWNSb3csIGJhc2ljQ29sICsgMSkpIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgKyAzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDMsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueSB7XHJcbiAgICBsZXQgY2VsbCwgY29sLCByb3c7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNNb2JpbGVMYXlvdXQpIHtcclxuICAgICAgLy8gbW9iaWxlIGxheW91dFxyXG4gICAgICBmb3IgKGNvbCA9IGJhc2ljQ29sOyBjb2wgPCBjb2x1bW5zOyBjb2wrKykge1xyXG4gICAgICAgIGlmICghc3JjW2Jhc2ljUm93XVtjb2xdLmVsZW0pIHtcclxuICAgICAgICAgIGNlbGwgPSBzcmNbYmFzaWNSb3ddW2NvbF07XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjZWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlc2t0b3BcclxuICAgIGZvciAoY29sID0gYmFzaWNDb2w7IGNvbCA8IGNvbHVtbnM7IGNvbCsrKSB7XHJcbiAgICAgIGZvciAocm93ID0gMDsgcm93IDwgMjsgcm93KyspIHtcclxuICAgICAgICBpZiAoIXNyY1tyb3cgKyBiYXNpY1Jvd11bY29sXS5lbGVtKSB7XHJcbiAgICAgICAgICBjZWxsID0gc3JjW3JvdyArIGJhc2ljUm93XVtjb2xdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2VsbCkge1xyXG4gICAgICAgIHJldHVybiBjZWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEF2YWlsYWJsZUNlbGxzTW9iaWxlKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55IHtcclxuICAgIGxldCBsZWZ0Q29ybmVyQ2VsbDtcclxuICAgIGxldCByaWdodENvcm5lckNlbGw7XHJcbiAgICBjb25zdCBiYXNpY1JvdyA9IHRoaXMuZ2V0QmFzaWNSb3cocHJldkNlbGwpO1xyXG4gICAgY29uc3QgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuXHJcblxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDEgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBjb25zdCBncmlkQ29weSA9IHRoaXMuZ3JpZENlbGxzLnNsaWNlKCk7XHJcblxyXG4gICAgICBpZiAoIXByZXZDZWxsKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSBncmlkQ29weVswXVswXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbChncmlkQ29weSwgYmFzaWNSb3csIGJhc2ljQ29sLCB0aGlzLmNvbHVtbnMpO1xyXG5cclxuICAgICAgICBpZiAoIWxlZnRDb3JuZXJDZWxsKSB7XHJcbiAgICAgICAgICBjb25zdCByb3dTaGlmdCA9IHRoaXMuaXNNb2JpbGVMYXlvdXQgPyAxIDogMjtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdyArIHJvd1NoaWZ0LCAwLCB0aGlzLmNvbHVtbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghcHJldkNlbGwpIHtcclxuICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCAwKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIHJvd1NwYW4gLSAxLCAxKTtcclxuICAgIH0gZWxzZSBpZiAoY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCAwKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIHJvd1NwYW4sIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXJ0OiBsZWZ0Q29ybmVyQ2VsbCxcclxuICAgICAgZW5kOiByaWdodENvcm5lckNlbGxcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldEJhc2ljUm93KHByZXZDZWxsKTogYW55IHtcclxuICAgIGxldCBiYXNpY1JvdztcclxuXHJcbiAgICBpZiAodGhpcy5pc01vYmlsZUxheW91dCkge1xyXG4gICAgICBpZiAocHJldkNlbGwpIHtcclxuICAgICAgICBiYXNpY1JvdyA9IHByZXZDZWxsICYmIHByZXZDZWxsLnJvdyB8fCAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2ljUm93ID0gMDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHByZXZDZWxsKSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSBwcmV2Q2VsbC5yb3cgJSAyID09PSAwID8gcHJldkNlbGwucm93IDogcHJldkNlbGwucm93IC0gMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBiYXNpY1JvdyA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYmFzaWNSb3c7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGlzQ2VsbEZyZWUocm93LCBjb2wpOiBhbnkge1xyXG4gICAgcmV0dXJuICF0aGlzLmdyaWRDZWxsc1tyb3ddW2NvbF0uZWxlbTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbEluZGV4KHNyY0NlbGwpOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgaW5kZXg7XHJcblxyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xyXG4gICAgICBpbmRleCA9IF8uZmluZEluZGV4KHNlbGYuZ3JpZENlbGxzW3Jvd0luZGV4XSwgKGNlbGwpID0+IHtcclxuICAgICAgICByZXR1cm4gY2VsbCA9PT0gc3JjQ2VsbDtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gaW5kZXggIT09IC0xID8gaW5kZXggOiAwO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyByZXNlcnZlQ2VsbHMoc3RhcnQsIGVuZCwgZWxlbSkge1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgIHJvdy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgaWYgKGNlbGwucm93ID49IHN0YXJ0LnJvdyAmJiBjZWxsLnJvdyA8PSBlbmQucm93ICYmXHJcbiAgICAgICAgICBjZWxsLmNvbCA+PSBzdGFydC5jb2wgJiYgY2VsbC5jb2wgPD0gZW5kLmNvbCkge1xyXG4gICAgICAgICAgY2VsbC5lbGVtID0gZWxlbTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNsZWFyRWxlbWVudHMoKSB7XHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgcm93LmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICB0aWxlLmVsZW0gPSBudWxsO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRBdmFpbGFibGVDb2x1bW5zKGNvbHVtbnMpOiBhbnkge1xyXG4gICAgdGhpcy5pc01vYmlsZUxheW91dCA9IGNvbHVtbnMgPT09IE1PQklMRV9MQVlPVVRfQ09MVU1OUztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnM7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGggPyApOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICB0aWxlV2lkdGggPSBzaW5nbGVUaWxlV2lkdGggfHwgdGhpcy5vcHRzLnRpbGVXaWR0aCxcclxuICAgICAgICAgIG9mZnNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5waXAtZHJhZ2dhYmxlLWdyb3VwLXRpdGxlJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgICBjb2xzSW5Sb3cgPSAwLFxyXG4gICAgICAgICAgcm93cyA9IDAsXHJcbiAgICAgICAgICBncmlkSW5Sb3cgPSBbXTtcclxuXHJcbiAgICB0aGlzLmdyaWRDZWxscyA9IFtdO1xyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSwgaW5kZXgsIHNyY1RpbGVzKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcblxyXG4gICAgICBnZW5lcmF0ZUNlbGxzKHRpbGVTaXplLmNvbFNwYW4pO1xyXG5cclxuICAgICAgaWYgKHNyY1RpbGVzLmxlbmd0aCA9PT0gaW5kZXggKyAxKSB7XHJcbiAgICAgICAgaWYgKGNvbHNJblJvdyA8IHNlbGYuY29sdW1ucykge1xyXG4gICAgICAgICAgZ2VuZXJhdGVDZWxscyhzZWxmLmNvbHVtbnMgLSBjb2xzSW5Sb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgbW9yZSBjZWxscyBmb3IgZXh0ZW5kcyB0aWxlIHNpemUgdG8gYmlnXHJcbiAgICAgICAgaWYgKHNlbGYudGlsZXMubGVuZ3RoICogMiA+IHNlbGYuZ3JpZENlbGxzLmxlbmd0aCkge1xyXG4gICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkoc2VsZi50aWxlcy5sZW5ndGggKiAyIC0gc2VsZi5ncmlkQ2VsbHMubGVuZ3RoKSkuZm9yRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGdlbmVyYXRlQ2VsbHMoc2VsZi5jb2x1bW5zKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDZWxscyhuZXdDZWxsQ291bnQpIHtcclxuICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkobmV3Q2VsbENvdW50KSkuZm9yRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHNlbGYuY29sdW1ucyA8IGNvbHNJblJvdyArIDEpIHtcclxuICAgICAgICAgIHJvd3MrKztcclxuICAgICAgICAgIGNvbHNJblJvdyA9IDA7XHJcblxyXG4gICAgICAgICAgc2VsZi5ncmlkQ2VsbHMucHVzaChncmlkSW5Sb3cpO1xyXG4gICAgICAgICAgZ3JpZEluUm93ID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdG9wID0gcm93cyAqIHNlbGYub3B0cy50aWxlSGVpZ2h0ICsgKHJvd3MgPyByb3dzICogc2VsZi5vcHRzLmd1dHRlciA6IDApICsgb2Zmc2V0LmhlaWdodDtcclxuICAgICAgICBsZXQgbGVmdCA9IGNvbHNJblJvdyAqIHRpbGVXaWR0aCArIChjb2xzSW5Sb3cgPyBjb2xzSW5Sb3cgKiBzZWxmLm9wdHMuZ3V0dGVyIDogMCk7XHJcblxyXG4gICAgICAgIC8vIERlc2NyaWJlIGdyaWQgY2VsbCBzaXplIHRocm91Z2ggYmxvY2sgY29ybmVycyBjb29yZGluYXRlc1xyXG4gICAgICAgIGdyaWRJblJvdy5wdXNoKHtcclxuICAgICAgICAgIHRvcDogdG9wLFxyXG4gICAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICAgIGJvdHRvbTogdG9wICsgc2VsZi5vcHRzLnRpbGVIZWlnaHQsXHJcbiAgICAgICAgICByaWdodDogbGVmdCArIHRpbGVXaWR0aCxcclxuICAgICAgICAgIHJvdzogcm93cyxcclxuICAgICAgICAgIGNvbDogY29sc0luUm93XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbHNJblJvdysrO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc2V0VGlsZXNEaW1lbnNpb25zKG9ubHlQb3NpdGlvbiwgZHJhZ2dlZFRpbGUpOiBhbnkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgY3VyckluZGV4ID0gMDtcclxuICAgIGxldCBwcmV2Q2VsbDtcclxuXHJcbiAgICBpZiAob25seVBvc2l0aW9uKSB7XHJcbiAgICAgIHNlbGYuY2xlYXJFbGVtZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGUuZ2V0U2l6ZSgpO1xyXG4gICAgICBsZXQgc3RhcnRDZWxsO1xyXG4gICAgICBsZXQgd2lkdGg7XHJcbiAgICAgIGxldCBoZWlnaHQ7XHJcbiAgICAgIGxldCBjZWxscztcclxuXHJcbiAgICAgIHRpbGUudXBkYXRlRWxlbSgnLnBpcC1kcmFnZ2FibGUtdGlsZScpO1xyXG4gICAgICBpZiAodGlsZVNpemUuY29sU3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmIChwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5lbGVtLnNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2Q2VsbC5lbGVtLnNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgICAgc3RhcnRDZWxsID0gc2VsZi5nZXRDZWxscyhzZWxmLmdldENlbGxCeVBvc2l0aW9uKHByZXZDZWxsLnJvdywgcHJldkNlbGwuY29sIC0gMSksIDEsIDEpLnN0YXJ0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzdGFydENlbGwgPSBzZWxmLmdldENlbGxzKHByZXZDZWxsLCAxLCAxKS5zdGFydDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgd2lkdGggPSBzdGFydENlbGwucmlnaHQgLSBzdGFydENlbGwubGVmdDtcclxuICAgICAgICAgIGhlaWdodCA9IHN0YXJ0Q2VsbC5ib3R0b20gLSBzdGFydENlbGwudG9wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldkNlbGwgPSBzdGFydENlbGw7XHJcblxyXG4gICAgICAgIHNlbGYucmVzZXJ2ZUNlbGxzKHN0YXJ0Q2VsbCwgc3RhcnRDZWxsLCB0aWxlKTtcclxuXHJcbiAgICAgICAgY3VyckluZGV4Kys7XHJcbiAgICAgIH0gZWxzZSBpZiAodGlsZVNpemUuY29sU3BhbiA9PT0gMikge1xyXG4gICAgICAgIGNlbGxzID0gc2VsZi5nZXRDZWxscyhwcmV2Q2VsbCwgdGlsZVNpemUucm93U3BhbiwgdGlsZVNpemUuY29sU3Bhbik7XHJcbiAgICAgICAgc3RhcnRDZWxsID0gY2VsbHMuc3RhcnQ7XHJcblxyXG4gICAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgICB3aWR0aCA9IGNlbGxzLmVuZC5yaWdodCAtIGNlbGxzLnN0YXJ0LmxlZnQ7XHJcbiAgICAgICAgICBoZWlnaHQgPSBjZWxscy5lbmQuYm90dG9tIC0gY2VsbHMuc3RhcnQudG9wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldkNlbGwgPSBjZWxscy5lbmQ7XHJcblxyXG4gICAgICAgIHNlbGYucmVzZXJ2ZUNlbGxzKGNlbGxzLnN0YXJ0LCBjZWxscy5lbmQsIHRpbGUpO1xyXG5cclxuICAgICAgICBjdXJySW5kZXggKz0gMjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVuZGVyIHByZXZpZXdcclxuICAgICAgLy8gd2hpbGUgdGlsZXMgZnJvbSBncm91cCBpcyBkcmFnZ2VkXHJcbiAgICAgIGlmIChkcmFnZ2VkVGlsZSA9PT0gdGlsZSkge1xyXG4gICAgICAgIHRpbGUuc2V0UHJldmlld1Bvc2l0aW9uKHtcclxuICAgICAgICAgIGxlZnQ6IHN0YXJ0Q2VsbC5sZWZ0LFxyXG4gICAgICAgICAgdG9wOiBzdGFydENlbGwudG9wXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICB0aWxlLnNldFNpemUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRpbGUuc2V0UG9zaXRpb24oc3RhcnRDZWxsLmxlZnQsIHN0YXJ0Q2VsbC50b3ApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNhbGNDb250YWluZXJIZWlnaHQoKTogYW55IHtcclxuICAgIGxldCBtYXhIZWlnaHRTaXplLCBtYXhXaWR0aFNpemU7XHJcblxyXG4gICAgaWYgKCF0aGlzLnRpbGVzLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBtYXhIZWlnaHRTaXplID0gXy5tYXhCeSh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGVbJ2dldFNpemUnXSgpO1xyXG4gICAgICByZXR1cm4gdGlsZVNpemUudG9wICsgdGlsZVNpemUuaGVpZ2h0O1xyXG4gICAgfSlbJ2dldFNpemUnXSgpO1xyXG5cclxuICAgIHRoaXMuZWxlbS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHRTaXplLnRvcCArIG1heEhlaWdodFNpemUuaGVpZ2h0ICsgJ3B4JztcclxuXHJcbiAgICBpZiAodGhpcy5pbmxpbmUpIHtcclxuICAgICAgbWF4V2lkdGhTaXplID0gXy5tYXhCeSh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgICAgcmV0dXJuIHRpbGVTaXplLmxlZnQgKyB0aWxlU2l6ZS53aWR0aDtcclxuICAgICAgfSlbJ2dldFNpemUnXSgpO1xyXG5cclxuICAgICAgdGhpcy5lbGVtLnN0eWxlLndpZHRoID0gbWF4V2lkdGhTaXplLmxlZnQgKyBtYXhXaWR0aFNpemUud2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlQnlOb2RlKG5vZGUpOiBhbnkge1xyXG4gICAgY29uc3QgZm91bmRUaWxlID0gdGhpcy50aWxlcy5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgcmV0dXJuIG5vZGUgPT09IHRpbGUuZ2V0RWxlbSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGZvdW5kVGlsZS5sZW5ndGggPyBmb3VuZFRpbGVbMF0gOiBudWxsO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlQnlDb29yZGluYXRlcyhjb29yZHMsIGRyYWdnZWRUaWxlKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnRpbGVzXHJcbiAgICAgIC5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgICBjb25zdCB0aWxlU2l6ZSA9IHRpbGUuZ2V0U2l6ZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGlsZSAhPT0gZHJhZ2dlZFRpbGUgJiZcclxuICAgICAgICAgIHRpbGVTaXplLmxlZnQgPD0gY29vcmRzLmxlZnQgJiYgY29vcmRzLmxlZnQgPD0gKHRpbGVTaXplLmxlZnQgKyB0aWxlU2l6ZS53aWR0aCkgJiZcclxuICAgICAgICAgIHRpbGVTaXplLnRvcCA8PSBjb29yZHMudG9wICYmIGNvb3Jkcy50b3AgPD0gKHRpbGVTaXplLnRvcCArIHRpbGVTaXplLmhlaWdodCk7XHJcbiAgICAgIH0pWzBdIHx8IG51bGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdldFRpbGVJbmRleCh0aWxlKTogYW55IHtcclxuICAgIHJldHVybiBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCB0aWxlKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3dhcFRpbGVzKG1vdmVkVGlsZSwgYmVmb3JlVGlsZSk6IGFueSB7XHJcbiAgICBjb25zdCBtb3ZlZFRpbGVJbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsIG1vdmVkVGlsZSk7XHJcbiAgICBjb25zdCBiZWZvcmVUaWxlSW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCBiZWZvcmVUaWxlKTtcclxuXHJcbiAgICB0aGlzLnRpbGVzLnNwbGljZShtb3ZlZFRpbGVJbmRleCwgMSk7XHJcbiAgICB0aGlzLnRpbGVzLnNwbGljZShiZWZvcmVUaWxlSW5kZXgsIDAsIG1vdmVkVGlsZSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHJlbW92ZVRpbGUocmVtb3ZlVGlsZSk6IGFueSB7XHJcbiAgICBsZXQgZHJvcHBlZFRpbGU7XHJcblxyXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlLCBpbmRleCwgdGlsZXMpID0+IHtcclxuICAgICAgaWYgKHRpbGUgPT09IHJlbW92ZVRpbGUpIHtcclxuICAgICAgICBkcm9wcGVkVGlsZSA9IHRpbGVzLnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZHJvcHBlZFRpbGU7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHVwZGF0ZVRpbGVPcHRpb25zKG9wdHMpOiBhbnkge1xyXG4gICAgY29uc3QgaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLnRpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICByZXR1cm4gdGlsZVsnZ2V0T3B0aW9ucyddKCkgPT09IG9wdHM7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgIHRoaXMudGlsZXNbaW5kZXhdLnNldE9wdGlvbnMob3B0cyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgLnNlcnZpY2UoJ3BpcFRpbGVzR3JpZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pIHtcclxuICAgICAgbGV0IG5ld0dyaWQgPSBuZXcgVGlsZXNHcmlkU2VydmljZSh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3R3JpZDtcclxuICAgIH1cclxuICB9KTsiLCJleHBvcnQgaW50ZXJmYWNlIElXaWRnZXRUZW1wbGF0ZVNlcnZpY2Uge1xyXG4gICAgZ2V0VGVtcGxhdGUoc291cmNlLCB0cGwgPyAsIHRpbGVTY29wZSA/ICwgc3RyaWN0Q29tcGlsZSA/ICk6IGFueTtcclxuICAgIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSk6IHZvaWQ7XHJcbn0gXHJcblxyXG57XHJcbiAgICBjbGFzcyB3aWRnZXRUZW1wbGF0ZVNlcnZpY2UgaW1wbGVtZW50cyBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlIHtcclxuICAgICAgICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICAgICAgICBwcml2YXRlIF8kY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XHJcbiAgICAgICAgcHJpdmF0ZSBfJHRlbXBsYXRlUmVxdWVzdDogYW5ndWxhci5JVGVtcGxhdGVSZXF1ZXN0U2VydmljZTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgICRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXHJcbiAgICAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2VcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhpcy5fJGludGVycG9sYXRlID0gJGludGVycG9sYXRlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgICAgICAgICB0aGlzLl8kdGVtcGxhdGVSZXF1ZXN0ID0gJHRlbXBsYXRlUmVxdWVzdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55IHtcclxuICAgICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgICAgIHR5cGVcclxuICAgICAgICAgICAgfSA9IHNvdXJjZTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnBvbGF0ZWQgPSB0cGwgPyB0aGlzLl8kaW50ZXJwb2xhdGUodHBsKShzb3VyY2UpIDogdGhpcy5fJGludGVycG9sYXRlKHRlbXBsYXRlKShzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmljdENvbXBpbGUgPT0gdHJ1ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGludGVycG9sYXRlZCkpIDpcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbGVTY29wZSA/IHRoaXMuXyRjb21waWxlKHRlbXBsYXRlKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVVcmwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyR0ZW1wbGF0ZVJlcXVlc3QodGVtcGxhdGVVcmwsIGZhbHNlKS50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaHRtbCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGh0bWwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGxldFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGggPSAkZWxlbWVudC53aWR0aCA/ICRlbGVtZW50LndpZHRoKCkgOiAkZWxlbWVudC5jbGllbnRXaWR0aCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRlbGVtZW50LmhlaWdodCA/ICRlbGVtZW50LmhlaWdodCgpIDogJGVsZW1lbnQuY2xpZW50SGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxXaWR0aCA6IGltYWdlLm5hdHVyYWxXaWR0aCkgfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBpbWFnZUhlaWdodCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlV2lkdGggLyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lckhlaWdodCAtIGNvbnRhaW5lcldpZHRoKSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGltYWdlV2lkdGggKiBjb250YWluZXJIZWlnaHQgLyBpbWFnZUhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IC0oKGltYWdlSGVpZ2h0IC8gaW1hZ2VXaWR0aCAqIGNvbnRhaW5lcldpZHRoIC0gY29udGFpbmVySGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgICAgICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWyd3aWR0aCddID0gJycgKyBjb250YWluZXJXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQoaW1hZ2UpLmNzcyhjc3NQYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbWFnZSBsb2FkIGRpcmVjdGl2ZSBUT0RPOiByZW1vdmUgdG8gcGlwSW1hZ2VVdGlsc1xyXG4gICAgY29uc3QgSW1hZ2VMb2FkID0gZnVuY3Rpb24gSW1hZ2VMb2FkKCRwYXJzZTogbmcuSVBhcnNlU2VydmljZSk6IG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnBpcEltYWdlTG9hZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdsb2FkJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcGUsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAgICAgLnNlcnZpY2UoJ3BpcFdpZGdldFRlbXBsYXRlJywgd2lkZ2V0VGVtcGxhdGVTZXJ2aWNlKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3BpcEltYWdlTG9hZCcsIEltYWdlTG9hZCk7XHJcbn0iLCJleHBvcnQgaW50ZXJmYWNlIElEYXNoYm9hcmRXaWRnZXQge1xyXG4gICAgb3B0aW9uczogYW55O1xyXG4gICAgY29sb3I6IHN0cmluZztcclxuICAgIHNpemU6IE9iamVjdCB8IHN0cmluZyB8IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIERhc2hib2FyZFdpZGdldCBpbXBsZW1lbnRzIElEYXNoYm9hcmRXaWRnZXQge1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuICAgIHB1YmxpYyBjb2xvcjogc3RyaW5nO1xyXG4gICAgcHVibGljIHNpemU6IE9iamVjdCB8IHN0cmluZyB8IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG59IiwiYW5ndWxhci5tb2R1bGUoJ3BpcFdpZGdldCcsIFtdKTtcclxuXHJcbmltcG9ydCAnLi9jYWxlbmRhci9XaWRnZXRDYWxlbmRhcic7XHJcbmltcG9ydCAnLi9ldmVudC9XaWRnZXRFdmVudCc7XHJcbmltcG9ydCAnLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0ICcuL21lbnUvV2lkZ2V0TWVudURpcmVjdGl2ZSc7XHJcbmltcG9ydCAnLi9ub3Rlcy9XaWRnZXROb3Rlcyc7XHJcbmltcG9ydCAnLi9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbic7XHJcbmltcG9ydCAnLi9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MnO1xyXG5pbXBvcnQgJy4vcGljdHVyZV9zbGlkZXIvV2lkZ2V0UGljdHVyZVNsaWRlcic7XHJcbiIsImltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbntcclxuICBjbGFzcyBDYWxlbmRhcldpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpcy5vcHRpb25zLm1lbnUgPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpIDogdGhpcy5tZW51O1xyXG4gICAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRhdGUgPSB0aGlzLm9wdGlvbnMuZGF0ZSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLm9wdGlvbnMuY29sb3IgfHwgJ2JsdWUnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLnBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICAgICAgc2l6ZTogdGhpcy5vcHRpb25zLnNpemUsXHJcbiAgICAgICAgICBkYXRlOiB0aGlzLm9wdGlvbnMuZGF0ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvY2FsZW5kYXIvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGNvbnN0IENhbGVuZGFyV2lkZ2V0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucycsXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogQ2FsZW5kYXJXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL2NhbGVuZGFyL1dpZGdldENhbGVuZGFyLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwQ2FsZW5kYXJXaWRnZXQnLCBDYWxlbmRhcldpZGdldCk7XHJcblxyXG59IiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnOyBcclxue1xyXG4gIGNsYXNzIEV2ZW50V2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICAgIHByaXZhdGUgX29sZE9wYWNpdHk6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgb3BhY2l0eTogbnVtYmVyID0gMC41NztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgJHNjb3BlOiBuZy5JU2NvcGUsXHJcbiAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgIHByaXZhdGUgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWVudSkgdGhpcy5tZW51ID0gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICAgIHRpdGxlOiAnQ29uZmlndXJhdGUnLFxyXG4gICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmNvbG9yID0gdGhpcy5vcHRpb25zLmNvbG9yIHx8ICdncmF5JztcclxuICAgICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5vcHRpb25zLm9wYWNpdHkgfHwgdGhpcy5vcGFjaXR5O1xyXG5cclxuICAgICAgdGhpcy5kcmF3SW1hZ2UoKTtcclxuXHJcbiAgICAgIC8vIFRPRE8gaXQgZG9lc24ndCB3b3JrXHJcbiAgICAgICRzY29wZS4kd2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTtcclxuICAgICAgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZHJhd0ltYWdlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhd0ltYWdlKCkge1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmltYWdlKSB7XHJcbiAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uSW1hZ2VMb2FkKHRoaXMuJGVsZW1lbnQuZmluZCgnaW1nJykpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICAgIHRoaXMuX29sZE9wYWNpdHkgPSBfLmNsb25lKHRoaXMub3BhY2l0eSk7XHJcbiAgICAgIHRoaXMucGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZS5zaG93KHtcclxuICAgICAgICBkaWFsb2dDbGFzczogJ3BpcC1jYWxlbmRhci1jb25maWcnLFxyXG4gICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgICAgICBzaXplOiB0aGlzLm9wdGlvbnMuc2l6ZSB8fCB7XHJcbiAgICAgICAgICAgIGNvbFNwYW46IDEsXHJcbiAgICAgICAgICAgIHJvd1NwYW46IDFcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkYXRlOiB0aGlzLm9wdGlvbnMuZGF0ZSxcclxuICAgICAgICAgIHRpdGxlOiB0aGlzLm9wdGlvbnMudGl0bGUsXHJcbiAgICAgICAgICB0ZXh0OiB0aGlzLm9wdGlvbnMudGV4dCxcclxuICAgICAgICAgIG9wYWNpdHk6IHRoaXMub3BhY2l0eSxcclxuICAgICAgICAgIG9uT3BhY2l0eXRlc3Q6IChvcGFjaXR5KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBleHRlbnNpb25Vcmw6ICd3aWRnZXRzL2V2ZW50L0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuZGF0ZSA9IHJlc3VsdC5kYXRlO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50aXRsZSA9IHJlc3VsdC50aXRsZTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudGV4dCA9IHJlc3VsdC50ZXh0O1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vcGFjaXR5ID0gcmVzdWx0Lm9wYWNpdHk7XHJcbiAgICAgIH0sICgpID0+IHtcclxuICAgICAgICB0aGlzLm9wYWNpdHkgPSB0aGlzLl9vbGRPcGFjaXR5O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uSW1hZ2VMb2FkKGltYWdlKSB7XHJcbiAgICAgIHRoaXMuc2V0SW1hZ2VNYXJnaW5DU1ModGhpcy4kZWxlbWVudC5wYXJlbnQoKSwgaW1hZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbWFnZSkge1xyXG4gICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLiRlbGVtZW50LnBhcmVudCgpLCB0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGF0ZXIgcmVwbGFjZSBieSBwaXBJbWFnZVV0aWxzIHNldmljZSdzIGZ1bmN0aW9uXHJcbiAgICBwcml2YXRlIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSkge1xyXG4gICAgICBsZXRcclxuICAgICAgICBjb250YWluZXJXaWR0aCA9ICRlbGVtZW50LndpZHRoID8gJGVsZW1lbnQud2lkdGgoKSA6ICRlbGVtZW50LmNsaWVudFdpZHRoLCAvLyB8fCA4MCxcclxuICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkZWxlbWVudC5oZWlnaHQgPyAkZWxlbWVudC5oZWlnaHQoKSA6ICRlbGVtZW50LmNsaWVudEhlaWdodCwgLy8gfHwgODAsXHJcbiAgICAgICAgaW1hZ2VXaWR0aCA9IGltYWdlWzBdLm5hdHVyYWxXaWR0aCB8fCBpbWFnZS53aWR0aCxcclxuICAgICAgICBpbWFnZUhlaWdodCA9IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgfHwgaW1hZ2UuaGVpZ2h0LFxyXG4gICAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgICAgY3NzUGFyYW1zID0ge307XHJcblxyXG4gICAgICBpZiAoKGltYWdlV2lkdGggLyBjb250YWluZXJXaWR0aCkgPiAoaW1hZ2VIZWlnaHQgLyBjb250YWluZXJIZWlnaHQpKSB7XHJcbiAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VXaWR0aCAvIGltYWdlSGVpZ2h0ICogY29udGFpbmVySGVpZ2h0IC0gY29udGFpbmVyV2lkdGgpIC8gMik7XHJcbiAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snaGVpZ2h0J10gPSAnJyArIGNvbnRhaW5lckhlaWdodCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgaW1hZ2VXaWR0aCAqIGNvbnRhaW5lckhlaWdodCAvIGltYWdlSGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtYXJnaW4gPSAtKChpbWFnZUhlaWdodCAvIGltYWdlV2lkdGggKiBjb250YWluZXJXaWR0aCAtIGNvbnRhaW5lckhlaWdodCkgLyAyKTtcclxuICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi10b3AnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgY29udGFpbmVyV2lkdGggKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgICBjc3NQYXJhbXNbJ21hcmdpbi1sZWZ0J10gPSAnJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaW1hZ2UuY3NzKGNzc1BhcmFtcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgY29uc3QgRXZlbnRXaWRnZXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IEV2ZW50V2lkZ2V0Q29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5jb21wb25lbnQoJ3BpcEV2ZW50V2lkZ2V0JywgRXZlbnRXaWRnZXQpO1xyXG5cclxufSIsIigoKSA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmRpcmVjdGl2ZSgncGlwTWVudVdpZGdldCcsIHBpcE1lbnVXaWRnZXQpO1xyXG5cclxuICBmdW5jdGlvbiBwaXBNZW51V2lkZ2V0KCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3QgICAgICAgIDogJ0VBJyxcclxuICAgICAgdGVtcGxhdGVVcmwgICAgIDogJ3dpZGdldHMvbWVudS9XaWRnZXRNZW51Lmh0bWwnXHJcbiAgICB9O1xyXG4gIH1cclxufSkoKTtcclxuIiwiaW1wb3J0IHsgRGFzaGJvYXJkV2lkZ2V0IH0gZnJvbSAnLi4vV2lkZ2V0Q2xhc3MnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1lbnVXaWRnZXRTZXJ2aWNlIGV4dGVuZHMgRGFzaGJvYXJkV2lkZ2V0IHtcclxuICBwdWJsaWMgbWVudTogYW55ID0gW3tcclxuICAgIHRpdGxlOiAnQ2hhbmdlIFNpemUnLFxyXG4gICAgYWN0aW9uOiBhbmd1bGFyLm5vb3AsXHJcbiAgICBzdWJtZW51OiBbe1xyXG4gICAgICAgIHRpdGxlOiAnMSB4IDEnLFxyXG4gICAgICAgIGFjdGlvbjogJ2NoYW5nZVNpemUnLFxyXG4gICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgc2l6ZVg6IDEsXHJcbiAgICAgICAgICBzaXplWTogMVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRpdGxlOiAnMiB4IDEnLFxyXG4gICAgICAgIGFjdGlvbjogJ2NoYW5nZVNpemUnLFxyXG4gICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgc2l6ZVg6IDIsXHJcbiAgICAgICAgICBzaXplWTogMVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRpdGxlOiAnMiB4IDInLFxyXG4gICAgICAgIGFjdGlvbjogJ2NoYW5nZVNpemUnLFxyXG4gICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgc2l6ZVg6IDIsXHJcbiAgICAgICAgICBzaXplWTogMlxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH1dO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICBzdXBlcigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNhbGxBY3Rpb24oYWN0aW9uTmFtZSwgcGFyYW1zLCBpdGVtKSB7XHJcbiAgICBpZiAodGhpc1thY3Rpb25OYW1lXSkge1xyXG4gICAgICB0aGlzW2FjdGlvbk5hbWVdLmNhbGwodGhpcywgcGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXRlbVsnY2xpY2snXSkge1xyXG4gICAgICBpdGVtWydjbGljayddLmNhbGwoaXRlbSwgcGFyYW1zLCB0aGlzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgIHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG4gIH07XHJcbn1cclxuXHJcbntcclxuICBjbGFzcyBNZW51V2lkZ2V0UHJvdmlkZXIge1xyXG4gICAgcHJpdmF0ZSBfc2VydmljZTogTWVudVdpZGdldFNlcnZpY2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIHB1YmxpYyAkZ2V0KCkge1xyXG4gICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICBpZiAodGhpcy5fc2VydmljZSA9PSBudWxsKVxyXG4gICAgICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgTWVudVdpZGdldFNlcnZpY2UoKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5wcm92aWRlcigncGlwV2lkZ2V0TWVudScsIE1lbnVXaWRnZXRQcm92aWRlcik7XHJcbn0iLCJpbXBvcnQge1xyXG4gIE1lbnVXaWRnZXRTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vbWVudS9XaWRnZXRNZW51U2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgSVdpZGdldENvbmZpZ1NlcnZpY2VcclxufSBmcm9tICcuLi8uLi9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcblxyXG57XHJcbiAgY2xhc3MgTm90ZXNXaWRnZXRDb250cm9sbGVyIGV4dGVuZHMgTWVudVdpZGdldFNlcnZpY2Uge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm1lbnUgPSB0aGlzLm9wdGlvbnMubWVudSA/IF8udW5pb24odGhpcy5tZW51LCB0aGlzLm9wdGlvbnMubWVudSkgOiB0aGlzLm1lbnU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICB0aXRsZTogJ0NvbmZpZ3VyYXRlJyxcclxuICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5jb2xvciA9IHRoaXMub3B0aW9ucy5jb2xvciB8fCAnb3JhbmdlJztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICAgIHRoaXMucGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZS5zaG93KHtcclxuICAgICAgICBkaWFsb2dDbGFzczogJ3BpcC1jYWxlbmRhci1jb25maWcnLFxyXG4gICAgICAgIGxvY2Fsczoge1xyXG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgICAgICBzaXplOiB0aGlzLm9wdGlvbnMuc2l6ZSxcclxuICAgICAgICAgIHRpdGxlOiB0aGlzLm9wdGlvbnMudGl0bGUsXHJcbiAgICAgICAgICB0ZXh0OiB0aGlzLm9wdGlvbnMudGV4dCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvbm90ZXMvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnRleHQgPSByZXN1bHQudGV4dDtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudGl0bGUgPSByZXN1bHQudGl0bGU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgTm90ZXNXaWRnZXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IE5vdGVzV2lkZ2V0Q29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnd2lkZ2V0cy9ub3Rlcy9XaWRnZXROb3Rlcy5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5jb21wb25lbnQoJ3BpcE5vdGVzV2lkZ2V0JywgTm90ZXNXaWRnZXQpO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRUZW1wbGF0ZVNlcnZpY2VcclxufSBmcm9tICcuLi8uLi91dGlsaXR5L1dpZGdldFRlbXBsYXRlVXRpbGl0eSc7XHJcblxyXG5jbGFzcyBQaWN0dXJlU2xpZGVyQ29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwdWJsaWMgYW5pbWF0aW9uVHlwZTogc3RyaW5nID0gJ2ZhZGluZyc7XHJcbiAgcHVibGljIGFuaW1hdGlvbkludGVydmFsOiBudW1iZXIgPSA1MDAwO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFueSxcclxuICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZSxcclxuICAgIHByaXZhdGUgcGlwV2lkZ2V0VGVtcGxhdGU6IElXaWRnZXRUZW1wbGF0ZVNlcnZpY2VcclxuICApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblR5cGUgPSB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uVHlwZSB8fCB0aGlzLmFuaW1hdGlvblR5cGU7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uSW50ZXJ2YWwgfHwgdGhpcy5hbmltYXRpb25JbnRlcnZhbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkltYWdlTG9hZCgkZXZlbnQpIHtcclxuICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLnBpcFdpZGdldFRlbXBsYXRlLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuJGVsZW1lbnQucGFyZW50KCksICRldmVudC50YXJnZXQpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgIHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBfLmVhY2godGhpcy4kZWxlbWVudC5maW5kKCdpbWcnKSwgKGltYWdlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5waXBXaWRnZXRUZW1wbGF0ZS5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLiRlbGVtZW50LnBhcmVudCgpLCBpbWFnZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSwgNTAwKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IFBpY3R1cmVTbGlkZXJXaWRnZXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gIGJpbmRpbmdzOiB7XHJcbiAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnXHJcbiAgfSxcclxuICBjb250cm9sbGVyOiBQaWN0dXJlU2xpZGVyQ29udHJvbGxlcixcclxuICB0ZW1wbGF0ZVVybDogJ3dpZGdldHMvcGljdHVyZV9zbGlkZXIvV2lkZ2V0UGljdHVyZVNsaWRlci5odG1sJ1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAuY29tcG9uZW50KCdwaXBQaWN0dXJlU2xpZGVyV2lkZ2V0JywgUGljdHVyZVNsaWRlcldpZGdldCk7IiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ1NlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNsYXNzIFBvc2l0aW9uV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICAgIHB1YmxpYyBzaG93UG9zaXRpb246IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW55LFxyXG4gICAgICBwcml2YXRlIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlLFxyXG4gICAgICBwcml2YXRlIHBpcExvY2F0aW9uRWRpdERpYWxvZzogYW55LFxyXG4gICAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tZW51KSB0aGlzLm1lbnUgPSBfLnVuaW9uKHRoaXMubWVudSwgdGhpcy5vcHRpb25zLm1lbnUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLm1lbnUucHVzaCh7XHJcbiAgICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub25Db25maWdDbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgICB0aXRsZTogJ0NoYW5nZSBsb2NhdGlvbicsXHJcbiAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub3BlbkxvY2F0aW9uRWRpdERpYWxvZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLm9wdGlvbnMubG9jYXRpb24gPSB0aGlzLm9wdGlvbnMubG9jYXRpb24gfHwgdGhpcy5vcHRpb25zLnBvc2l0aW9uO1xyXG5cclxuICAgICAgJHNjb3BlLiR3YXRjaCgnd2lkZ2V0Q3RybC5vcHRpb25zLmxvY2F0aW9uJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgICAkc2NvcGUuJHdhdGNoKCgpID0+IHtcclxuICAgICAgICByZXR1cm4gJGVsZW1lbnQuaXMoJzp2aXNpYmxlJyk7XHJcbiAgICAgIH0sIChuZXdWYWwpID0+IHtcclxuICAgICAgICBpZiAobmV3VmFsID09IHRydWUpIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgICB0aGlzLnBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2Uuc2hvdyh7XHJcbiAgICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtcG9zaXRpb24tY29uZmlnJyxcclxuICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgIHNpemU6IHRoaXMub3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgbG9jYXRpb25OYW1lOiB0aGlzLm9wdGlvbnMubG9jYXRpb25OYW1lLFxyXG4gICAgICAgICAgaGlkZUNvbG9yczogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvcG9zaXRpb24vQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uTmFtZSA9IHJlc3VsdC5sb2NhdGlvbk5hbWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgICB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgICAgdGhpcy5yZURyYXdQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcGVuTG9jYXRpb25FZGl0RGlhbG9nKCkge1xyXG4gICAgICB0aGlzLnBpcExvY2F0aW9uRWRpdERpYWxvZy5zaG93KHtcclxuICAgICAgICBsb2NhdGlvbk5hbWU6IHRoaXMub3B0aW9ucy5sb2NhdGlvbk5hbWUsXHJcbiAgICAgICAgbG9jYXRpb25Qb3M6IHRoaXMub3B0aW9ucy5sb2NhdGlvblxyXG4gICAgICB9LCAobmV3UG9zaXRpb24pID0+IHtcclxuICAgICAgICBpZiAobmV3UG9zaXRpb24pIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5sb2NhdGlvbiA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9uO1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uTmFtZSA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9OYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZURyYXdQb3NpdGlvbigpIHtcclxuICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSBmYWxzZTtcclxuICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSB0cnVlO1xyXG4gICAgICB9LCA1MCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgY29uc3QgUG9zaXRpb25XaWRnZXQ6IG5nLklDb21wb25lbnRPcHRpb25zID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJyxcclxuICAgICAgaW5kZXg6ICc9JyxcclxuICAgICAgZ3JvdXA6ICc9J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IFBvc2l0aW9uV2lkZ2V0Q29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi5odG1sJ1xyXG4gIH1cclxuXHJcbiAgYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwV2lkZ2V0JylcclxuICAgIC5jb21wb25lbnQoJ3BpcFBvc2l0aW9uV2lkZ2V0JywgUG9zaXRpb25XaWRnZXQpO1xyXG59IiwiaW1wb3J0IHtcclxuICBNZW51V2lkZ2V0U2VydmljZVxyXG59IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5cclxue1xyXG4gIGNvbnN0IFNNQUxMX0NIQVJUOiBudW1iZXIgPSA3MDtcclxuICBjb25zdCBCSUdfQ0hBUlQ6IG51bWJlciA9IDI1MDtcclxuXHJcbiAgY2xhc3MgU3RhdGlzdGljc1dpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gICAgcHJpdmF0ZSBfJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlO1xyXG5cclxuICAgIHB1YmxpYyByZXNldDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGNoYXJ0U2l6ZTogbnVtYmVyID0gU01BTExfQ0hBUlQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIHBpcFdpZGdldE1lbnU6IGFueSxcclxuICAgICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMubWVudSA9IHRoaXMub3B0aW9ucy5tZW51ID8gXy51bmlvbih0aGlzLm1lbnUsIHRoaXMub3B0aW9ucy5tZW51KSA6IHRoaXMubWVudTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zZXRDaGFydFNpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgICAgdGhpcy5vcHRpb25zLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICAgIHRoaXMucmVzZXQgPSB0cnVlO1xyXG4gICAgICB0aGlzLnNldENoYXJ0U2l6ZSgpO1xyXG4gICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZXNldCA9IGZhbHNlO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Q2hhcnRTaXplKCkge1xyXG4gICAgICB0aGlzLmNoYXJ0U2l6ZSA9IHRoaXMub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB0aGlzLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgPyBCSUdfQ0hBUlQgOiBTTUFMTF9DSEFSVDtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICBjb25zdCBTdGF0aXN0aWNzV2lkZ2V0OiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBTdGF0aXN0aWNzV2lkZ2V0Q29udHJvbGxlcixcclxuICAgIHRlbXBsYXRlVXJsOiAnd2lkZ2V0cy9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBTdGF0aXN0aWNzV2lkZ2V0JywgU3RhdGlzdGljc1dpZGdldCk7XHJcbn0iLCIoZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnRGFzaGJvYXJkLmh0bWwnLFxuICAgICc8bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50IG1kLXJhaXNlZCBtZC1mYWIgbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIGFyaWEtbGFiZWw9XCJBZGQgY29tcG9uZW50XCJcXG4nICtcbiAgICAnICAgICAgICAgICBuZy1jbGljaz1cIiRjdHJsLmFkZENvbXBvbmVudCgpXCI+XFxuJyArXG4gICAgJyAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXNcIiBjbGFzcz1cIm1kLWhlYWRsaW5lIGNlbnRlcmVkLWFkZC1pY29uXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICc8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWdyaWQtaG9sZGVyXCI+XFxuJyArXG4gICAgJyAgPHBpcC1kcmFnZ2FibGUtZ3JpZCBwaXAtdGlsZXMtdGVtcGxhdGVzPVwiJGN0cmwuZ3JvdXBlZFdpZGdldHNcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICAgcGlwLXRpbGVzLWNvbnRleHQ9XCIkY3RybC53aWRnZXRzQ29udGV4dFwiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgICBwaXAtZHJhZ2dhYmxlLWdyaWQ9XCIkY3RybC5kcmFnZ2FibGVHcmlkT3B0aW9uc1wiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgICBwaXAtZ3JvdXAtbWVudS1hY3Rpb25zPVwiJGN0cmwuZ3JvdXBNZW51QWN0aW9uc1wiPlxcbicgK1xuICAgICcgIDwvcGlwLWRyYWdnYWJsZS1ncmlkPlxcbicgK1xuICAgICcgIFxcbicgK1xuICAgICcgIDxtZC1wcm9ncmVzcy1jaXJjdWxhciBtZC1tb2RlPVwiaW5kZXRlcm1pbmF0ZVwiIGNsYXNzPVwicHJvZ3Jlc3MtcmluZ1wiPjwvbWQtcHJvZ3Jlc3MtY2lyY3VsYXI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnJyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZHJhZ2dhYmxlL0RyYWdnYWJsZS5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtaG9sZGVyXCI+XFxuJyArXG4gICAgJyAgPGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXBcIiBcXG4nICtcbiAgICAnICAgICAgIG5nLXJlcGVhdD1cImdyb3VwIGluICRjdHJsLmdyb3Vwc1wiIFxcbicgK1xuICAgICcgICAgICAgZGF0YS1ncm91cC1pZD1cInt7ICRpbmRleCB9fVwiIFxcbicgK1xuICAgICcgICAgICAgcGlwLWRyYWdnYWJsZS10aWxlcz1cImdyb3VwLnNvdXJjZVwiPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXAtdGl0bGUgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyXCI+XFxuJyArXG4gICAgJyAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZS1pbnB1dC1jb250YWluZXJcIiBuZy1jbGljaz1cIiRjdHJsLm9uVGl0bGVDbGljayhncm91cCwgJGV2ZW50KVwiPlxcbicgK1xuICAgICcgICAgICAgIDxpbnB1dCBuZy1pZj1cImdyb3VwLmVkaXRpbmdOYW1lXCIgbmctYmx1cj1cIiRjdHJsLm9uQmx1clRpdGxlSW5wdXQoZ3JvdXApXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgIG5nLWtleXByZXNzPVwiJGN0cmwub25LeWVwcmVzc1RpdGxlSW5wdXQoZ3JvdXAsICRldmVudClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICBuZy1tb2RlbD1cImdyb3VwLnRpdGxlXCI+XFxuJyArXG4gICAgJyAgICAgICAgPC9pbnB1dD5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1vdmVyZmxvdyBmbGV4LW5vbmVcIiBuZy1pZj1cIiFncm91cC5lZGl0aW5nTmFtZVwiPnt7IGdyb3VwLnRpdGxlIH19PC9kaXY+XFxuJyArXG4gICAgJyAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgXFxuJyArXG4gICAgJyAgICAgICAgbmctc2hvdz1cImdyb3VwLmVkaXRpbmdOYW1lXCIgbmctY2xpY2s9XCIkY3RybC5jYW5jZWxFZGl0aW5nKGdyb3VwKVwiXFxuJyArXG4gICAgJyAgICAgICAgYXJpYS1sYWJlbD1cIkNhbmNlbFwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6Y3Jvc3NcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICA8bWQtbWVudSBjbGFzcz1cImZsZXgtbm9uZSBsYXlvdXQtY29sdW1uXCIgbWQtcG9zaXRpb24tbW9kZT1cInRhcmdldC1yaWdodCB0YXJnZXRcIiBuZy1zaG93PVwiIWdyb3VwLmVkaXRpbmdOYW1lXCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLWNsaWNrPVwiJG1kT3Blbk1lbnUoKTsgZ3JvdXBJZCA9ICRpbmRleFwiIGFyaWEtbGFiZWw9XCJNZW51XCI+XFxuJyArXG4gICAgJyAgICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOmRvdHNcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLW1lbnUtY29udGVudCB3aWR0aD1cIjRcIj5cXG4nICtcbiAgICAnICAgICAgICAgIDxtZC1tZW51LWl0ZW0gbmctcmVwZWF0PVwiYWN0aW9uIGluICRjdHJsLmdyb3VwTWVudUFjdGlvbnNcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWJ1dHRvbiBuZy1jbGljaz1cImFjdGlvbi5jYWxsYmFjayhncm91cElkKVwiPnt7IGFjdGlvbi50aXRsZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgICAgPC9tZC1tZW51LWl0ZW0+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1tZW51LWNvbnRlbnQ+XFxuJyArXG4gICAgJyAgICAgIDwvbWQtbWVudT5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICA8ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cCBmaWN0LWdyb3VwIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyIGxheW91dC1jb2x1bW4gdG0xNlwiID5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJmaWN0LWdyb3VwLXRleHQtY29udGFpbmVyXCI+XFxuJyArXG4gICAgJyAgICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXNcIj48L21kLWljb24+e3sgXFwnRFJPUF9UT19DUkVBVEVfTkVXX0dST1VQXFwnIHwgdHJhbnNsYXRlIH19XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICA8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZy5odG1sJyxcbiAgICAnPG1kLWRpYWxvZyBjbGFzcz1cInBpcC1kaWFsb2cgcGlwLXdpZGdldC1jb25maWctZGlhbG9nIHt7IHZtLnBhcmFtcy5kaWFsb2dDbGFzcyB9fVwiIHdpZHRoPVwiNDAwXCIgbWQtdGhlbWU9XCJ7e3ZtLnRoZW1lfX1cIj5cXG4nICtcbiAgICAnICAgIDxwaXAtd2lkZ2V0LWNvbmZpZy1leHRlbmQtY29tcG9uZW50IGNsYXNzPVwibGF5b3V0LWNvbHVtblwiIHBpcC1kaWFsb2ctc2NvcGU9XCJ2bVwiIHBpcC1leHRlbnNpb24tdXJsPVwidm0ucGFyYW1zLmV4dGVuc2lvblVybFwiIFxcbicgK1xuICAgICcgICAgICAgIHBpcC1hcHBseT1cInZtLm9uQXBwbHkodXBkYXRlZERhdGEpXCI+XFxuJyArXG4gICAgJyAgICA8L3BpcC13aWRnZXQtY29uZmlnLWV4dGVuZC1jb21wb25lbnQ+XFxuJyArXG4gICAgJzwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dFeHRlbmRDb21wb25lbnQuaHRtbCcsXG4gICAgJzxoMyBjbGFzcz1cInRtMCBmbGV4LW5vbmVcIj57eyBcXCdEQVNIQk9BUkRfV0lER0VUX0NPTkZJR19ESUFMT0dfVElUTEVcXCcgfCB0cmFuc2xhdGUgfX08L2gzPlxcbicgK1xuICAgICc8ZGl2IGNsYXNzPVwicGlwLWJvZHkgcGlwLXNjcm9sbCBwMTYgYnAwIGZsZXgtYXV0b1wiPlxcbicgK1xuICAgICcgICAgPHBpcC1leHRlbnNpb24tcG9pbnQ+PC9waXAtZXh0ZW5zaW9uLXBvaW50PlxcbicgK1xuICAgICcgICAgPHBpcC10b2dnbGUtYnV0dG9ucyBjbGFzcz1cImJtMTZcIiBuZy1pZj1cIiEkY3RybC5oaWRlU2l6ZXNcIiBwaXAtYnV0dG9ucz1cIiRjdHJsLnNpemVzXCIgbmctbW9kZWw9XCIkY3RybC5zaXplSWRcIj5cXG4nICtcbiAgICAnICAgIDwvcGlwLXRvZ2dsZS1idXR0b25zPlxcbicgK1xuICAgICcgICAgPHBpcC1jb2xvci1waWNrZXIgbmctaWY9XCIhJGN0cmwuaGlkZUNvbG9yc1wiIHBpcC1jb2xvcnM9XCIkY3RybC5jb2xvcnNcIiBuZy1tb2RlbD1cIiRjdHJsLmNvbG9yXCI+XFxuJyArXG4gICAgJyAgICA8L3BpcC1jb2xvci1waWNrZXI+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnPGRpdiBjbGFzcz1cInBpcC1mb290ZXIgZmxleC1ub25lXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2PlxcbicgK1xuICAgICcgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cIiRjdHJsLm9uQ2FuY2VsKClcIj57eyBcXCdDQU5DRUxcXCcgfCB0cmFuc2xhdGUgfX08L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50XCIgbmctY2xpY2s9XCIkY3RybC5vbkFwcGx5KClcIj57eyBcXCdBUFBMWVxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC1hZGQtY29tcG9uZW50LWRpYWxvZ1wiPlxcbicgK1xuICAgICcgIDxtZC1kaWFsb2ctY29udGVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0aGVtZS1kaXZpZGVyIHAxNiBmbGV4LWF1dG9cIj5cXG4nICtcbiAgICAnICAgICAgPGgzIGNsYXNzPVwiaGlkZS14cyBtMCBibTE2IHRoZW1lLXRleHQtcHJpbWFyeVwiIGhpZGUteHM+e3sgXFwnREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX1RJVExFXFwnIHwgdHJhbnNsYXRlIH19PC9oND5cXG4nICtcbiAgICAnICAgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cImxheW91dC1yb3cgZmxleC1hdXRvIG0wIHRtMTZcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtc2VsZWN0IGNsYXNzPVwiZmxleC1hdXRvIG0wIHRoZW1lLXRleHQtcHJpbWFyeVwiIG5nLW1vZGVsPVwiZGlhbG9nQ3RybC5hY3RpdmVHcm91cEluZGV4XCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwie3sgXFwnREFTSEJPQVJEX0FERF9DT01QT05FTlRfRElBTE9HX0NSRUFURV9ORVdfR1JPVVBcXCcgfCB0cmFuc2xhdGUgfX1cIlxcbicgK1xuICAgICcgICAgICAgICAgICBhcmlhLWxhYmVsPVwiR3JvdXBcIj5cXG4nICtcbiAgICAnICAgICAgICAgIDxtZC1vcHRpb24gbmctdmFsdWU9XCIkaW5kZXhcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiBkaWFsb2dDdHJsLmdyb3Vwc1wiPnt7IGdyb3VwIH19PC9tZC1vcHRpb24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1zZWxlY3Q+XFxuJyArXG4gICAgJyAgICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwicGlwLWJvZHkgcGlwLXNjcm9sbCBwMCBmbGV4LWF1dG9cIj5cXG4nICtcbiAgICAnICAgICAgPHAgY2xhc3M9XCJtZC1ib2R5LTEgdGhlbWUtdGV4dC1zZWNvbmRhcnkgbTAgbHAxNiBycDE2XCIgPlxcbicgK1xuICAgICcgICAgICAgIHt7IFxcJ0RBU0hCT0FSRF9BRERfQ09NUE9ORU5UX0RJQUxPR19VU0VfSE9UX0tFWVNcXCcgfCB0cmFuc2xhdGUgfX1cXG4nICtcbiAgICAnICAgICAgPC9wPlxcbicgK1xuICAgICcgICAgICA8bWQtbGlzdCBuZy1pbml0PVwiZ3JvdXBJbmRleCA9ICRpbmRleFwiIG5nLXJlcGVhdD1cImdyb3VwIGluIGRpYWxvZ0N0cmwuZGVmYXVsdFdpZGdldHNcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtbGlzdC1pdGVtIGNsYXNzPVwibGF5b3V0LXJvdyBwaXAtbGlzdC1pdGVtIGxwMTYgcnAxNlwiIG5nLXJlcGVhdD1cIml0ZW0gaW4gZ3JvdXBcIj5cXG4nICtcbiAgICAnICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uLWhvbGRlciBmbGV4LW5vbmVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp7ezo6IGl0ZW0uaWNvbiB9fVwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1iYWRnZSB0aGVtZS1iYWRnZSBtZC13YXJuXCIgbmctaWY9XCJpdGVtLmFtb3VudFwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgIDxzcGFuPnt7IGl0ZW0uYW1vdW50IH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGV4LWF1dG8gbG0yNCB0aGVtZS10ZXh0LXByaW1hcnlcIj57ezo6IGl0ZW0udGl0bGUgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lXCIgbmctY2xpY2s9XCJkaWFsb2dDdHJsLmVuY3JlYXNlKGdyb3VwSW5kZXgsICRpbmRleClcIiBhcmlhLWxhYmVsPVwiRW5jcmVhc2VcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzLWNpcmNsZVwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5kZWNyZWFzZShncm91cEluZGV4LCAkaW5kZXgpXCIgYXJpYS1sYWJlbD1cIkRlY3JlYXNlXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bWludXMtY2lyY2xlXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgPC9tZC1saXN0LWl0ZW0+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWRpdmlkZXIgY2xhc3M9XCJsbTcyIHRtOCBibThcIiBuZy1pZj1cImdyb3VwSW5kZXggIT09IChkaWFsb2dDdHJsLmRlZmF1bHRXaWRnZXRzLmxlbmd0aCAtIDEpXCI+PC9tZC1kaXZpZGVyPlxcbicgK1xuICAgICcgICAgICA8L21kLWxpc3Q+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICA8L21kLWRpYWxvZy1jb250ZW50PlxcbicgK1xuICAgICcgIDxtZC1kaWFsb2ctYWN0aW9ucyBjbGFzcz1cImZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciB0aGVtZS1kaXZpZGVyIGRpdmlkZXItdG9wIHRoZW1lLXRleHQtcHJpbWFyeVwiPlxcbicgK1xuICAgICcgICAgPG1kLWJ1dHRvbiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuY2FuY2VsKClcIiBhcmlhLWxhYmVsPVwiQ2FuY2VsXCI+e3sgXFwnQ0FOQ0VMXFwnIHwgdHJhbnNsYXRlIH19PC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICA8bWQtYnV0dG9uIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5hZGQoKVwiIG5nLWRpc2FibGVkPVwiZGlhbG9nQ3RybC50b3RhbFdpZGdldHMgPT09IDBcIiBhcmlhbC1sYWJlbD1cIkFkZFwiPnt7IFxcJ0FERFxcJyB8IHRyYW5zbGF0ZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgIDwvbWQtZGlhbG9nLWFjdGlvbnM+XFxuJyArXG4gICAgJzwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvZXZlbnQvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoXCI+XFxuJyArXG4gICAgJyAgICA8bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIGJtMFwiPlxcbicgK1xuICAgICcgICAgICAgIDxsYWJlbD5UaXRsZTo8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGl0bGVcIi8+XFxuJyArXG4gICAgJyAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICBEYXRlOlxcbicgK1xuICAgICcgICAgPG1kLWRhdGVwaWNrZXIgbmctbW9kZWw9XCIkY3RybC5kYXRlXCIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm04XCI+XFxuJyArXG4gICAgJyAgICA8L21kLWRhdGVwaWNrZXI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaFwiPlxcbicgK1xuICAgICcgICAgICAgIDxsYWJlbD5EZXNjcmlwdGlvbjo8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDx0ZXh0YXJlYSB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwudGV4dFwiLz5cXG4nICtcbiAgICAnICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIEJhY2tkcm9wXFwncyBvcGFjaXR5OlxcbicgK1xuICAgICcgICAgPG1kLXNsaWRlciBhcmlhLWxhYmVsPVwib3BhY2l0eVwiICB0eXBlPVwibnVtYmVyXCIgbWluPVwiMC4xXCIgbWF4PVwiMC45XCIgc3RlcD1cIjAuMDFcIiBcXG4nICtcbiAgICAnICAgICAgICBuZy1tb2RlbD1cIiRjdHJsLm9wYWNpdHlcIiBuZy1jaGFuZ2U9XCIkY3RybC5vbk9wYWNpdHl0ZXN0KCRjdHJsLm9wYWNpdHkpXCI+XFxuJyArXG4gICAgJyAgICA8L21kLXNsaWRlcj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLWV2ZW50LXdpZGdldCB7eyAkY3RybC5jb2xvciB9fSBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsXCIgbmctY2xhc3M9XCJ7XFxuJyArXG4gICAgJyAgICAgICAgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBtZWRpdW06ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCIgPlxcbicgK1xuICAgICcgICAgPGltZyBuZy1pZj1cIiRjdHJsLm9wdGlvbnMuaW1hZ2VcIiBuZy1zcmM9XCJ7eyRjdHJsLm9wdGlvbnMuaW1hZ2V9fVwiIGFsdD1cInt7JGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWV9fVwiXFxuJyArXG4gICAgJyAgICAvPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInRleHQtYmFja2Ryb3BcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwge3sgJGN0cmwub3BhY2l0eSB9fSlcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICA8cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jb250YWluZXIgZmxleC1hdXRvIHBpcC1zY3JvbGxcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHAgY2xhc3M9XCJkYXRlIGZsZXgtbm9uZVwiIG5nLWlmPVwiJGN0cmwub3B0aW9ucy5kYXRlXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICB7eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRTaG9ydERhdGUgfX1cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9wPlxcbicgK1xuICAgICcgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQgZmxleC1hdXRvXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICB7eyAkY3RybC5vcHRpb25zLnRleHQgfHwgJGN0cmwub3B0aW9ucy5kZXNjcmlwdGlvbiB9fVxcbicgK1xuICAgICcgICAgICAgICAgICA8L3A+XFxuJyArXG4gICAgJyAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9jYWxlbmRhci9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0xNlwiPlxcbicgK1xuICAgICcgICAgRGF0ZTpcXG4nICtcbiAgICAnICAgIDxtZC1kYXRlcGlja2VyIG5nLW1vZGVsPVwiJGN0cmwuZGF0ZVwiIGNsYXNzPVwidy1zdHJldGNoIFwiPlxcbicgK1xuICAgICcgICAgPC9tZC1kYXRlcGlja2VyPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL2NhbGVuZGFyL1dpZGdldENhbGVuZGFyLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtY2FsZW5kYXItd2lkZ2V0IHt7ICRjdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGwgdHAwXCJcXG4nICtcbiAgICAnICAgICBuZy1jbGFzcz1cInsgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBtZWRpdW06ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCI+XFxuJyArXG4gICAgJyAgPGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXIgZmxleC1ub25lXCI+XFxuJyArXG4gICAgJyAgICA8cGlwLW1lbnUtd2lkZ2V0PjwvcGlwLW1lbnUtd2lkZ2V0PlxcbicgK1xuICAgICcgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIlxcbicgK1xuICAgICcgICAgICAgbmctaWY9XCIkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDFcIj5cXG4nICtcbiAgICAnICAgIDxzcGFuIGNsYXNzPVwiZGF0ZSBsbTI0IHJtMTJcIj57eyAkY3RybC5vcHRpb25zLmRhdGUuZ2V0RGF0ZSgpIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImZsZXgtYXV0byBsYXlvdXQtY29sdW1uXCI+XFxuJyArXG4gICAgJyAgICAgIDxzcGFuIGNsYXNzPVwid2Vla2RheSBtZC1oZWFkbGluZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICAgIDxzcGFuIGNsYXNzPVwibW9udGgteWVhciBtZC1oZWFkbGluZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdNb250aCB9fSB7eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRZZWFyIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LWNvbHVtbiBsYXlvdXQtYWxpZ24tc3BhY2UtYXJvdW5kLWNlbnRlclwiXFxuJyArXG4gICAgJyAgICAgICBuZy1oaWRlPVwiJGN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiAkY3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+XFxuJyArXG4gICAgJyAgICA8c3BhbiBjbGFzcz1cIndlZWtkYXkgbWQtaGVhZGxpbmVcIlxcbicgK1xuICAgICcgICAgICAgICAgbmctaGlkZT1cIiRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICA8c3BhbiBjbGFzcz1cIndlZWtkYXlcIlxcbicgK1xuICAgICcgICAgICAgICAgbmctc2hvdz1cIiRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICA8c3BhbiBjbGFzcz1cImRhdGUgbG0xMiBybTEyXCI+e3sgJGN0cmwub3B0aW9ucy5kYXRlLmdldERhdGUoKSB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgIDxzcGFuIGNsYXNzPVwibW9udGgteWVhciBtZC1oZWFkbGluZVwiPnt7ICRjdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdNb250aCB9fSB7eyAkY3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRZZWFyIH19PC9zcGFuPlxcbicgK1xuICAgICcgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnJyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9tZW51L1dpZGdldE1lbnUuaHRtbCcsXG4gICAgJzxtZC1tZW51IGNsYXNzPVwid2lkZ2V0LW1lbnVcIiBtZC1wb3NpdGlvbi1tb2RlPVwidGFyZ2V0LXJpZ2h0IHRhcmdldFwiPlxcbicgK1xuICAgICcgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiJG1kT3Blbk1lbnUoKVwiIGFyaWEtbGFiZWw9XCJNZW51XCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp2ZG90c1wiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxtZC1tZW51LWNvbnRlbnQgd2lkdGg9XCI0XCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJpdGVtIGluICRjdHJsLm1lbnVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLWJ1dHRvbiBuZy1pZj1cIiFpdGVtLnN1Ym1lbnVcIiBuZy1jbGljaz1cIiRjdHJsLmNhbGxBY3Rpb24oaXRlbS5hY3Rpb24sIGl0ZW0ucGFyYW1zLCBpdGVtKVwiPnt7OjogaXRlbS50aXRsZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLW1lbnUgbmctaWY9XCJpdGVtLnN1Ym1lbnVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCIkY3RybC5jYWxsQWN0aW9uKGl0ZW0uYWN0aW9uKVwiPnt7OjogaXRlbS50aXRsZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxtZC1tZW51LWNvbnRlbnQ+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJzdWJpdGVtIGluIGl0ZW0uc3VibWVudVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICAgICA8bWQtYnV0dG9uIG5nLWNsaWNrPVwiJGN0cmwuY2FsbEFjdGlvbihzdWJpdGVtLmFjdGlvbiwgc3ViaXRlbS5wYXJhbXMsIHN1Yml0ZW0pXCI+e3s6OiBzdWJpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPC9tZC1tZW51LWl0ZW0+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICA8L21kLW1lbnUtY29udGVudD5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9tZC1tZW51PlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtbWVudS1pdGVtPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDwvbWQtbWVudS1jb250ZW50PlxcbicgK1xuICAgICc8L21kLW1lbnU+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9ub3Rlcy9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2hcIj5cXG4nICtcbiAgICAnICAgIDxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGxhYmVsPlRpdGxlOjwvbGFiZWw+XFxuJyArXG4gICAgJyAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCIkY3RybC50aXRsZVwiLz5cXG4nICtcbiAgICAnICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggdG0wXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGxhYmVsPlRleHQ6PC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8dGV4dGFyZWEgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLnRleHRcIi8+XFxuJyArXG4gICAgJyAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9ub3Rlcy9XaWRnZXROb3Rlcy5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLW5vdGVzLXdpZGdldCB7eyAkY3RybC5jb2xvciB9fSBsYXlvdXQtY29sdW1uXCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiIG5nLWlmPVwiJGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWVcIj5cXG4nICtcbiAgICAnICAgICAgICA8c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMudGl0bGUgfHwgJGN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD5cXG4nICtcbiAgICAnICAgIFxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInRleHQtY29udGFpbmVyIGZsZXgtYXV0byBwaXAtc2Nyb2xsXCI+XFxuJyArXG4gICAgJyAgICAgICAgPHA+e3sgJGN0cmwub3B0aW9ucy50ZXh0IH19PC9wPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1waWN0dXJlLXNsaWRlci13aWRnZXQge3sgJGN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwie1xcbicgK1xuICAgICcgICAgICAgIHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgYmlnOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiIFxcbicgK1xuICAgICcgICAgICAgIGluZGV4PVxcJ3t7ICRjdHJsLmluZGV4IH19XFwnIGdyb3VwPVxcJ3t7ICRjdHJsLmdyb3VwIH19XFwnPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbHAxNiBycDggbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGV4IHRleHQtb3ZlcmZsb3dcIj57eyAkY3RybC5vcHRpb25zLnRpdGxlIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICA8cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInNsaWRlci1jb250YWluZXJcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPGRpdiBwaXAtaW1hZ2Utc2xpZGVyIHBpcC1hbmltYXRpb24tdHlwZT1cIlxcJ2ZhZGluZ1xcJ1wiIHBpcC1hbmltYXRpb24taW50ZXJ2YWw9XCIkY3RybC5hbmltYXRpb25JbnRlcnZhbFwiIFxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgbmctaWY9XCIkY3RybC5hbmltYXRpb25UeXBlID09IFxcJ2ZhZGluZ1xcJ1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1hbmltYXRpb24tYmxvY2tcIiBuZy1yZXBlYXQ9XCJzbGlkZSBpbiAkY3RybC5vcHRpb25zLnNsaWRlc1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDxpbWcgbmctc3JjPVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBhbHQ9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIHBpcC1pbWFnZS1sb2FkPVwiJGN0cmwub25JbWFnZUxvYWQoJGV2ZW50KVwiLz5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInNsaWRlLXRleHRcIiBuZy1pZj1cInNsaWRlLnRleHRcIj57eyBzbGlkZS50ZXh0IH19PC9wPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICAgICAgPGRpdiBwaXAtaW1hZ2Utc2xpZGVyIHBpcC1hbmltYXRpb24tdHlwZT1cIlxcJ2Nhcm91c2VsXFwnXCIgcGlwLWFuaW1hdGlvbi1pbnRlcnZhbD1cIiRjdHJsLmFuaW1hdGlvbkludGVydmFsXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICBuZy1pZj1cIiRjdHJsLmFuaW1hdGlvblR5cGUgPT0gXFwnY2Fyb3VzZWxcXCdcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwaXAtYW5pbWF0aW9uLWJsb2NrXCIgbmctcmVwZWF0PVwic2xpZGUgaW4gJGN0cmwub3B0aW9ucy5zbGlkZXNcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICA8aW1nIG5nLXNyYz1cInt7IHNsaWRlLmltYWdlIH19XCIgYWx0PVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBwaXAtaW1hZ2UtbG9hZD1cIiRjdHJsLm9uSW1hZ2VMb2FkKCRldmVudClcIi8+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJzbGlkZS10ZXh0XCIgbmctaWY9XCJzbGlkZS50ZXh0XCI+e3sgc2xpZGUudGV4dCB9fTwvcD5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9wb3NpdGlvbi9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2hcIj5cXG4nICtcbiAgICAnICAgIDxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGxhYmVsPkxvY2F0aW9uIG5hbWU6PC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cIiRjdHJsLmxvY2F0aW9uTmFtZVwiLz5cXG4nICtcbiAgICAnICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGlwLXBvc2l0aW9uLXdpZGdldCB3aWRnZXQtYm94IHAwIGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIlxcbicgK1xuICAgICcgICAgIG5nLWNsYXNzPVwie1xcbicgK1xuICAgICcgICAgICAgIHNtYWxsOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgbWVkaXVtOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgYmlnOiAkY3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmICRjdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiXFxuJyArXG4gICAgJyAgICAgICAgaW5kZXg9XFwne3sgJGN0cmwuaW5kZXggfX1cXCcgZ3JvdXA9XFwne3sgJGN0cmwuZ3JvdXAgfX1cXCc+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwicG9zaXRpb24tYWJzb2x1dGUtcmlnaHQtdG9wXCIgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5sb2NhdGlvbk5hbWVcIj5cXG4nICtcbiAgICAnICAgICAgICA8cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiISRjdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBscDE2IHJwOCBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiIG5nLWlmPVwiJGN0cmwub3B0aW9ucy5sb2NhdGlvbk5hbWVcIj5cXG4nICtcbiAgICAnICAgICAgICA8c3BhbiBjbGFzcz1cImZsZXggdGV4dC1vdmVyZmxvd1wiPnt7ICRjdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgIDxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhJGN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPHBpcC1sb2NhdGlvbi1tYXAgY2xhc3M9XCJmbGV4XCIgbmctaWY9XCIkY3RybC5zaG93UG9zaXRpb25cIiBwaXAtc3RyZXRjaD1cInRydWVcIiBwaXAtcmViaW5kPVwidHJ1ZVwiXFxuJyArXG4gICAgJyAgICAgICAgcGlwLWxvY2F0aW9uLXBvcz1cIiRjdHJsLm9wdGlvbnMubG9jYXRpb25cIj48L3BpcC1sb2NhdGlvbj5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJycpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvc3RhdGlzdGljcy9XaWRnZXRTdGF0aXN0aWNzLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtc3RhdGlzdGljcy13aWRnZXQgbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiXFxuJyArXG4gICAgJyAgICAgbmctY2xhc3M9XCJ7XFxuJyArXG4gICAgJyAgICAgICAgc21hbGw6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBtZWRpdW06ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBiaWc6ICRjdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgJGN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiPlxcbicgK1xuICAgICcgICAgICAgIDxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgJGN0cmwub3B0aW9ucy50aXRsZSB8fCAkY3RybC5vcHRpb25zLm5hbWUgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICAgICAgPHBpcC1tZW51LXdpZGdldD48L3BpcC1tZW51LXdpZGdldD5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cIndpZGdldC1jb250ZW50IGZsZXgtYXV0byBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgbmctaWY9XCIkY3RybC5vcHRpb25zLnNlcmllcyAmJiAhJGN0cmwucmVzZXRcIj5cXG4nICtcbiAgICAnICAgICAgICA8cGlwLXBpZS1jaGFydCBwaXAtc2VyaWVzPVwiJGN0cmwub3B0aW9ucy5zZXJpZXNcIiBuZy1pZj1cIiEkY3RybC5vcHRpb25zLmNoYXJ0VHlwZSB8fCAkY3RybC5vcHRpb25zLmNoYXJ0VHlwZSA9PSBcXCdwaWVcXCdcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIHBpcC1kb251dD1cInRydWVcIiBcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICBwaXAtcGllLXNpemU9XCIkY3RybC5jaGFydFNpemVcIiBcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICBwaXAtc2hvdy10b3RhbD1cInRydWVcIiBcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICBwaXAtY2VudGVyZWQ9XCJ0cnVlXCI+XFxuJyArXG4gICAgJyAgICAgICAgPC9waXAtcGllLWNoYXJ0PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBpcC13ZWJ1aS1kYXNoYm9hcmQtaHRtbC5qcy5tYXBcbiJdfQ==