(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).dashboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{"./DashboardComponent":2,"./DashboardController":3,"./dialogs/add_component/AddComponentDialogController":4,"./dialogs/widget_config/ConfigDialogController":6,"./draggable/Draggable":9,"./utility/WidgetTemplateUtility":15,"./widgets/Widgets":16}],2:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
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
    .run(setTranslations)
    .controller('pipDashboardCtrl', DashboardController);
},{}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var AddComponentDialogController = (function () {
    AddComponentDialogController.$inject = ['groups', 'activeGroupIndex', 'widgetList', '$mdDialog'];
    function AddComponentDialogController(groups, activeGroupIndex, widgetList, $mdDialog) {
        this.activeGroupIndex = _.isNumber(activeGroupIndex) ? activeGroupIndex : -1;
        this.defaultWidgets = _.cloneDeep(widgetList);
        this.groups = _.map(groups, function (group) {
            return group['title'];
        });
        this._mdDialog = $mdDialog;
    }
    AddComponentDialogController.prototype.add = function () {
        this._mdDialog.hide({
            groupIndex: this.activeGroupIndex,
            widgets: this.defaultWidgets
        });
    };
    ;
    AddComponentDialogController.prototype.cancel = function () {
        this._mdDialog.cancel();
    };
    ;
    AddComponentDialogController.prototype.encrease = function (groupIndex, widgetIndex) {
        var widget = this.defaultWidgets[groupIndex][widgetIndex];
        widget.amount++;
    };
    ;
    AddComponentDialogController.prototype.decrease = function (groupIndex, widgetIndex) {
        var widget = this.defaultWidgets[groupIndex][widgetIndex];
        widget.amount = widget.amount ? widget.amount - 1 : 0;
    };
    ;
    return AddComponentDialogController;
}());
exports.AddComponentDialogController = AddComponentDialogController;
angular
    .module('pipAddDashboardComponentDialog', ['ngMaterial'])
    .controller('pipAddDashboardComponentDialogController', AddComponentDialogController);
require("./AddComponentProvider");
},{"./AddComponentProvider":5}],5:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var AddComponentDialogService = (function () {
    function AddComponentDialogService(widgetList, $mdDialog) {
        this._mdDialog = $mdDialog;
        this._widgetList = widgetList;
    }
    AddComponentDialogService.prototype.show = function (groups, activeGroupIndex) {
        var _this = this;
        return this._mdDialog
            .show({
            templateUrl: 'dialogs/add_component/AddComponent.html',
            bindToController: true,
            controller: 'pipAddDashboardComponentDialogController',
            controllerAs: 'dialogCtrl',
            resolve: {
                groups: function () {
                    return groups;
                },
                activeGroupIndex: function () {
                    return activeGroupIndex;
                },
                widgetList: function () {
                    return _this._widgetList;
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
    .provider('pipAddComponentDialog', AddComponentDialogProvider);
},{}],6:[function(require,module,exports){
'use strict';
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
TileSizes.all = [
    { name: 'SMALL', id: '11' },
    { name: 'WIDE', id: '21' },
    { name: 'LARGE', id: '22' }
];
var WidgetConfigDialogController = (function () {
    WidgetConfigDialogController.$inject = ['params', '$mdDialog', '$compile', '$timeout', '$injector', '$scope', '$rootScope'];
    function WidgetConfigDialogController(params, $mdDialog, $compile, $timeout, $injector, $scope, $rootScope) {
        "ngInject";
        this.dialogTitle = "Edit tile";
        this.colors = TileColors.all;
        this.sizes = TileSizes.all;
        this.sizeId = TileSizes.all[0].id;
        this.$mdDialog = $mdDialog;
        this._$timeout = $timeout;
        this.params = params;
        angular.extend(this, this.params);
        this.sizeId = '' + this.params.size.colSpan + this.params.size.rowSpan;
    }
    WidgetConfigDialogController.prototype.onApply = function () {
        this['size'].sizeX = Number(this.sizeId.substr(0, 1));
        this['size'].sizeY = Number(this.sizeId.substr(1, 1));
        this.$mdDialog.hide(this);
    };
    WidgetConfigDialogController.prototype.onCancel = function () {
        this.$mdDialog.cancel();
    };
    return WidgetConfigDialogController;
}());
exports.WidgetConfigDialogController = WidgetConfigDialogController;
angular
    .module('pipWidgetConfigDialog', ['ngMaterial'])
    .controller('pipWidgetConfigDialogController', WidgetConfigDialogController);
require("./ConfigDialogService");
require("./ConfigDialogExtendComponent");
},{"./ConfigDialogExtendComponent":7,"./ConfigDialogService":8}],7:[function(require,module,exports){
(function () {
    'use strict';
    pipWidgetConfigComponent.$inject = ['$templateRequest', '$compile'];
    function pipWidgetConfigComponent($templateRequest, $compile) {
        return {
            restrict: 'E',
            templateUrl: 'dialogs/widget_config/ConfigDialogExtendComponent.html',
            scope: false,
            link: function ($scope, $element, $attrs) {
                $templateRequest($attrs.pipExtensionUrl, false).then(function (html) {
                    $element.find('pip-extension-point').replaceWith($compile(html)($scope));
                });
            }
        };
    }
    angular
        .module('pipWidgetConfigDialog')
        .directive('pipWidgetConfigExtendComponent', pipWidgetConfigComponent);
})();
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WidgetConfigDialogService = (function () {
    WidgetConfigDialogService.$inject = ['$mdDialog'];
    function WidgetConfigDialogService($mdDialog) {
        this._mdDialog = $mdDialog;
    }
    WidgetConfigDialogService.prototype.show = function (params, successCallback, cancelCallback) {
        this._mdDialog.show({
            targetEvent: params.event,
            templateUrl: params.templateUrl || 'dialogs/widget_config/ConfigDialog.html',
            controller: 'pipWidgetConfigDialogController',
            controllerAs: 'vm',
            locals: { params: params },
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
(function () {
    'use strict';
    angular
        .module('pipWidgetConfigDialog')
        .service('pipWidgetConfigDialogService', WidgetConfigDialogService);
})();
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    'use strict';
    angular.module('pipDragged', []);
})();
require("./DraggableTileService");
require("./DraggableController");
require("./DraggableDirective");
require("./draggable_group/DraggableTilesGroupService");
require("./draggable_group/DraggableTilesGroupDirective");
},{"./DraggableController":10,"./DraggableDirective":11,"./DraggableTileService":12,"./draggable_group/DraggableTilesGroupDirective":13,"./draggable_group/DraggableTilesGroupService":14}],10:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var DraggableTileService_1 = require("./DraggableTileService");
var DraggableTilesGroupService_1 = require("./draggable_group/DraggableTilesGroupService");
var SIMPLE_LAYOUT_COLUMNS_COUNT = 2;
exports.DEFAULT_TILE_WIDTH = 150;
exports.DEFAULT_TILE_HEIGHT = 150;
exports.UPDATE_GROUPS_EVENT = "pipUpdateDashboardGroupsConfig";
var DEFAULT_OPTIONS = {
    tileWidth: exports.DEFAULT_TILE_WIDTH,
    tileHeight: exports.DEFAULT_TILE_HEIGHT,
    gutter: 20,
    container: 'pip-draggable-grid:first-of-type',
    activeDropzoneClass: 'dropzone-active',
    groupContaninerSelector: '.pip-draggable-group:not(.fict-group)',
};
var DraggableController = (function () {
    DraggableController.$inject = ['$scope', '$rootScope', '$compile', '$timeout', '$element', 'pipDragTile', 'pipTilesGrid', 'pipMedia'];
    function DraggableController($scope, $rootScope, $compile, $timeout, $element, pipDragTile, pipTilesGrid, pipMedia) {
        var _this = this;
        this.sourceDropZoneElem = null;
        this.isSameDropzone = true;
        this.tileGroups = null;
        this._$timeout = $timeout;
        this._$rootScope = $rootScope;
        this._$scope = $scope;
        this._$compile = $compile;
        this._$element = $element;
        this.opts = _.merge({ mobileBreakpoint: pipMedia.breakpoints.xs }, DEFAULT_OPTIONS, $scope['draggableCtrl'].options);
        this.groups = $scope['draggableCtrl'].tilesTemplates.map(function (group, groupIndex) {
            return {
                title: group.title,
                editingName: false,
                index: groupIndex,
                source: group.source.map(function (tile) {
                    var tileScope = $rootScope.$new(false, $scope['draggableCtrl'].tilesContext);
                    tileScope['index'] = tile.opts.index;
                    tileScope['groupIndex'] = tile.opts.groupIndex;
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
                    this._$timeout(function () { _this.updateTilesGroups(); });
                }
                else {
                    this.removeTiles(this.tileGroups[changedGroupIndex], newVal[changedGroupIndex].removedWidgets, this.groupsContainers[changedGroupIndex]);
                    this.updateTilesOptions(newVal);
                    this._$timeout(function () { _this.updateTilesGroups(); });
                }
                return;
            }
        }
        if (newVal && this.tileGroups) {
            this.updateTilesOptions(newVal);
            this._$timeout(function () { _this.updateTilesGroups(); });
        }
    };
    DraggableController.prototype.onTitleClick = function (group, event) {
        if (!group.editingName) {
            group.oldTitle = _.clone(group.title);
            group.editingName = true;
            this._$timeout(function () {
                $(event.currentTarget.children[0]).focus();
            });
        }
    };
    DraggableController.prototype.cancelEditing = function (group) {
        group.title = group.oldTitle;
    };
    DraggableController.prototype.onBlurTitleInput = function (group) {
        var _this = this;
        this._$timeout(function () {
            group.editingName = false;
            _this._$rootScope.$broadcast(exports.UPDATE_GROUPS_EVENT, _this.groups);
            _this._$scope['draggableCtrl'].tilesTemplates[group.index].title = group.title;
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
                if (this.groups.length !== this._$scope['draggableCtrl'].tilesTemplates.length) {
                    this._$scope['draggableCtrl'].tilesTemplates.push(source);
                }
                break;
            case 'moveTile':
                var _a = {
                    fromIndex: source.from.elem.attributes['data-group-id'].value,
                    toIndex: source.to.elem.attributes['data-group-id'].value,
                    tileOptions: source.tile.opts.options,
                    fromTileIndex: source.tile.opts.options.index
                }, fromIndex = _a.fromIndex, toIndex = _a.toIndex, tileOptions = _a.tileOptions, fromTileIndex = _a.fromTileIndex;
                this._$scope['draggableCtrl'].tilesTemplates[fromIndex].source.splice(fromTileIndex, 1);
                this._$scope['draggableCtrl'].tilesTemplates[toIndex].source.push({ opts: tileOptions });
                this.reIndexTiles(source.from.elem);
                this.reIndexTiles(source.to.elem);
                break;
        }
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
            if (_.findIndex(newGroups, function (g) { return g['title'] === group.title; }) < 0) {
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
                var tileScope = _this._$rootScope.$new(false, _this._$scope['draggableCtrl'].tilesContext);
                tileScope['index'] = tile.opts.index == undefined ? tile.opts.options.index : tile.opts.index;
                tileScope['groupIndex'] = tile.opts.groupIndex == undefined ? tile.opts.options.groupIndex : tile.opts.groupIndex;
                return DraggableTileService_1.IDragTileConstructor(DraggableTileService_1.DragTileService, {
                    tpl: _this._$compile(tile.template)(tileScope),
                    options: tile.opts,
                    size: tile.opts.size
                });
            })
        };
        this.groups.push(group);
        if (!this._$scope.$$phase)
            this._$scope.$apply();
        this._$timeout(function () {
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
            var tileScope = _this._$rootScope.$new(false, _this._$scope['draggableCtrl'].tilesContext);
            tileScope['index'] = tile.opts.index == undefined ? tile.opts.options.index : tile.opts.index;
            tileScope['groupIndex'] = tile.opts.groupIndex == undefined ? tile.opts.options.groupIndex : tile.opts.groupIndex;
            var newTile = DraggableTileService_1.IDragTileConstructor(DraggableTileService_1.DragTileService, {
                tpl: _this._$compile(tile.template)(tileScope),
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
        var container = this._$scope['$container'] || $('body');
        return container.width();
    };
    DraggableController.prototype.getAvailableColumns = function (availableWidth) {
        return this.opts.mobileBreakpoint > availableWidth ? SIMPLE_LAYOUT_COLUMNS_COUNT
            : Math.floor(availableWidth / (this.opts.tileWidth + this.opts.gutter));
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
        this._$element.addClass('drag-transfer');
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
            this._$timeout(function () { _this.setGroupContainersHeight(); }, 0);
        }
    };
    DraggableController.prototype.onDragEndListener = function () {
        this.draggedTile.stopDrag(this.isSameDropzone);
        this._$element.removeClass('drag-transfer');
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
        var tileScope = this._$rootScope.$new(false, this._$scope['draggableCtrl'].tilesContext);
        tileScope['index'] = tile.opts.index == undefined ? tile.opts.options.index : tile.opts.index;
        tileScope['groupIndex'] = tile.opts.groupIndex == undefined ? tile.opts.options.groupIndex : tile.opts.groupIndex;
        $(this.groupsContainers[_.findIndex(this.tileGroups, from)])
            .find(movedTile.getElem())
            .remove();
        if (to !== null) {
            to.addTile(movedTile);
            elem = this._$compile(movedTile.getElem())(tileScope);
            $(this.groupsContainers[_.findIndex(this.tileGroups, to)])
                .append(elem);
            this._$timeout(to.setTilesDimensions.bind(to, true));
        }
        this.updateTilesTemplates('moveTile', { from: from, to: to, tile: movedTile });
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
        this.addGroup({ title: 'New group', source: [] });
        this._$timeout(function () {
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
        this._$timeout(function () {
            _this.availableWidth = _this.getContainerWidth();
            _this.availableColumns = _this.getAvailableColumns(_this.availableWidth);
            _this.groupsContainers = document.querySelectorAll(_this.opts.groupContaninerSelector);
            _this.tileGroups = _this.initTilesGroups(_this.groups, _this.opts, _this.groupsContainers);
            interact('.pip-draggable-tile')
                .draggable({
                autoScroll: true,
                onstart: function (event) { _this.onDragStartListener(event); },
                onmove: function (event) { _this.onDragMoveListener(event); },
                onend: function (event) { _this.onDragEndListener(); }
            });
            interact('.pip-draggable-group.fict-group')
                .dropzone({
                ondrop: function (event) { console.log('here'); _this.onDropToFictGroupListener(event); },
                ondragenter: function (event) { _this.onDropEnterListener(event); },
                ondropdeactivate: function (event) { _this.onDropDeactivateListener(event); },
                ondragleave: function (event) { _this.onDropLeaveListener(event); }
            });
            interact('.pip-draggable-group')
                .dropzone({
                ondrop: function (event) { _this.onDropListener(event); },
                ondragenter: function (event) { _this.onDropEnterListener(event); },
                ondropdeactivate: function (event) { _this.onDropDeactivateListener(event); },
                ondragleave: function (event) { _this.onDropLeaveListener(event); }
            });
            _this._$scope['$container']
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
angular
    .module('pipDragged')
    .controller('pipDraggableCtrl', DraggableController);
},{"./DraggableTileService":12,"./draggable_group/DraggableTilesGroupService":14}],11:[function(require,module,exports){
'use strict';
angular
    .module('pipDragged')
    .directive('pipDraggableGrid', DragDirective);
function DragDirective() {
    return {
        restrict: 'E',
        scope: {
            tilesTemplates: '=pipTilesTemplates',
            tilesContext: '=pipTilesContext',
            options: '=pipDraggableGrid',
            groupMenuActions: '=pipGroupMenuActions'
        },
        templateUrl: 'draggable/Draggable.html',
        bindToController: true,
        controllerAs: 'draggableCtrl',
        controller: 'pipDraggableCtrl',
        link: function ($scope, $elem) {
            $scope.$container = $elem;
        }
    };
}
},{}],12:[function(require,module,exports){
'use strict';
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
},{}],13:[function(require,module,exports){
'use strict';
angular
    .module('pipDragged')
    .directive('pipDraggableTiles', DraggableTile);
function DraggableTile() {
    return {
        restrict: 'A',
        link: function ($scope, $elem, $attr) {
            var docFrag = document.createDocumentFragment();
            var group = $scope.$eval($attr.pipDraggableTiles);
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
    };
}
},{}],14:[function(require,module,exports){
'use strict';
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
        var cell;
        var col;
        var row;
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
        var self = this;
        var colsInRow = 0;
        var rows = 0;
        var tileWidth = singleTileWidth || this.opts.tileWidth;
        var offset = document.querySelector('.pip-draggable-group-title').getBoundingClientRect();
        var gridInRow = [];
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
},{}],15:[function(require,module,exports){
"use strict";
ImageLoad.$inject = ['$parse'];
Object.defineProperty(exports, "__esModule", { value: true });
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
function ImageLoad($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var callback = $parse(attrs.pipImageLoad);
            element.bind('load', function (event) {
                callback(scope, { $event: event });
            });
        }
    };
}
angular
    .module('pipDashboard')
    .service('pipWidgetTemplate', widgetTemplateService)
    .directive('pipImageLoad', ImageLoad);
},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{"./calendar/WidgetCalendar":17,"./event/WidgetEvent":18,"./menu/WidgetMenuDirective":19,"./menu/WidgetMenuService":20,"./notes/WidgetNotes":21,"./picture_slider/WidgetPictureSlider":22,"./position/WidgetPosition":23,"./statistics/WidgetStatistics":24}],17:[function(require,module,exports){
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
var CalendarWidgetController = (function (_super) {
    __extends(CalendarWidgetController, _super);
    function CalendarWidgetController(pipWidgetMenu, $scope, pipWidgetConfigDialogService) {
        var _this = _super.call(this) || this;
        _this.color = 'blue';
        _this._$scope = $scope;
        _this._configDialog = pipWidgetConfigDialogService;
        if (_this['options']) {
            _this.menu = _this['options']['menu'] ? _.union(_this.menu, _this['options']['menu']) : _this.menu;
            _this.menu.push({ title: 'Configurate', click: function () {
                    _this.onConfigClick();
                } });
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
(function () {
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
})();
},{"../menu/WidgetMenuService":20}],18:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":20}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
},{}],21:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":20}],22:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":20}],23:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":20}],24:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":20}],25:[function(require,module,exports){
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
    '<md-dialog class="pip-dialog pip-add-component-dialog"><md-dialog-content class="layout-column"><div class="theme-divider p16 flex-auto"><h3 class="hide-xs m0 bm16 theme-text-primary" hide-xs="">Add component<md-input-container class="layout-row flex-auto m0"><md-select class="flex-auto m0 theme-text-primary" ng-model="dialogCtrl.activeGroupIndex" placeholder="Create New Group" aria-label="Group"><md-option ng-value="$index" ng-repeat="group in dialogCtrl.groups">{{ group }}</md-option></md-select></md-input-container></h3></div><div class="pip-body pip-scroll p0 flex-auto"><p class="md-body-1 theme-text-secondary m0 lp16 rp16">Use "Enter" or "+" buttons on keyboard to encrease and "Delete" or "-" to decrease tiles amount</p><md-list ng-init="groupIndex = $index" ng-repeat="group in dialogCtrl.defaultWidgets"><md-list-item class="layout-row pip-list-item lp16 rp16" ng-repeat="item in group"><div class="icon-holder flex-none"><md-icon md-svg-icon="icons:{{:: item.icon }}"></md-icon><div class="pip-badge theme-badge md-warn" ng-if="item.amount"><span>{{ item.amount }}</span></div></div><span class="flex-auto lm24 theme-text-primary">{{:: item.title }}</span><md-button class="md-icon-button flex-none" ng-click="dialogCtrl.encrease(groupIndex, $index)" aria-label="Encrease"><md-icon md-svg-icon="icons:plus-circle"></md-icon></md-button><md-button class="md-icon-button flex-none" ng-click="dialogCtrl.decrease(groupIndex, $index)" aria-label="Decrease"><md-icon md-svg-icon="icons:minus-circle"></md-icon></md-button></md-list-item><md-divider class="lm72 tm8 bm8" ng-if="groupIndex !== (dialogCtrl.defaultWidgets.length - 1)"></md-divider></md-list></div></md-dialog-content><md-dialog-actions class="flex-none layout-align-end-center theme-divider divider-top theme-text-primary"><md-button ng-click="dialogCtrl.cancel()" aria-label="Add">Cancel</md-button><md-button ng-click="dialogCtrl.add()" arial-label="Cancel">Add</md-button></md-dialog-actions></md-dialog>');
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
    '<md-dialog class="pip-dialog pip-widget-config-dialog {{ vm.params.dialogClass }}" width="400" md-theme="{{vm.theme}}"><pip-widget-config-extend-component class="layout-column" pip-extension-url="{{ vm.params.extensionUrl }}"></pip-widget-config-extend-component></md-dialog>');
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
    '<h3 class="tm0 flex-none">{{vm.dialogTitle}}</h3><div class="pip-body pip-scroll p16 bp0 flex-auto"><pip-extension-point></pip-extension-point><pip-toggle-buttons class="bm16" ng-if="!vm.hideSizes" pip-buttons="vm.sizes" ng-model="vm.sizeId"></pip-toggle-buttons><pip-color-picker ng-if="!vm.hideColors" pip-colors="vm.colors" ng-model="vm.color"></pip-color-picker></div><div class="pip-footer flex-none"><div><md-button class="md-accent" ng-click="vm.onCancel()">Cancel</md-button><md-button class="md-accent" ng-click="vm.onApply()">Apply</md-button></div></div>');
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
    '<div class="w-stretch bm16">Date:<md-datepicker ng-model="vm.date" class="w-stretch"></md-datepicker></div>');
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
    '<div class="w-stretch"><md-input-container class="w-stretch bm0"><label>Title:</label> <input type="text" ng-model="vm.title"></md-input-container>Date:<md-datepicker ng-model="vm.date" class="w-stretch bm8"></md-datepicker><md-input-container class="w-stretch"><label>Description:</label> <textarea type="text" ng-model="vm.text">\n' +
    '    </textarea></md-input-container>Backdrop\'s opacity:<md-slider aria-label="opacity" type="number" min="0.1" max="0.9" step="0.01" ng-model="vm.opacity" ng-change="vm.onOpacitytest(vm.opacity)"></md-slider></div>');
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
  $templateCache.put('widgets/notes/ConfigDialogExtension.html',
    '<div class="w-stretch"><md-input-container class="w-stretch bm0"><label>Title:</label> <input type="text" ng-model="vm.title"></md-input-container><md-input-container class="w-stretch tm0"><label>Text:</label> <textarea type="text" ng-model="vm.text">\n' +
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
    '<div class="w-stretch"><md-input-container class="w-stretch bm0"><label>Location name:</label> <input type="text" ng-model="vm.locationName"></md-input-container></div>');
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



},{}]},{},[25,1,2,3,4,5,6,7,8,13,14,9,10,11,12,15,17,18,19,20,21,22,23,24,16])(25)
});

//# sourceMappingURL=pip-webui-dashboard.js.map
