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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
},{"../menu/WidgetMenuService":20}],22:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":20}],23:[function(require,module,exports){
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
},{"../menu/WidgetMenuService":20}],24:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRGFzaGJvYXJkLnRzIiwic3JjL0Rhc2hib2FyZENvbXBvbmVudC50cyIsInNyYy9EYXNoYm9hcmRDb250cm9sbGVyLnRzIiwic3JjL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyLnRzIiwic3JjL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnRQcm92aWRlci50cyIsInNyYy9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nQ29udHJvbGxlci50cyIsInNyYy9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50LnRzIiwic3JjL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlLnRzIiwic3JjL2RyYWdnYWJsZS9EcmFnZ2FibGUudHMiLCJzcmMvZHJhZ2dhYmxlL0RyYWdnYWJsZUNvbnRyb2xsZXIudHMiLCJzcmMvZHJhZ2dhYmxlL0RyYWdnYWJsZURpcmVjdGl2ZS50cyIsInNyYy9kcmFnZ2FibGUvRHJhZ2dhYmxlVGlsZVNlcnZpY2UudHMiLCJzcmMvZHJhZ2dhYmxlL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwRGlyZWN0aXZlLnRzIiwic3JjL2RyYWdnYWJsZS9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UudHMiLCJzcmMvdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHkudHMiLCJzcmMvd2lkZ2V0cy9XaWRnZXRzLnRzIiwic3JjL3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIudHMiLCJzcmMvd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudURpcmVjdGl2ZS50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UudHMiLCJzcmMvd2lkZ2V0cy9ub3Rlcy9XaWRnZXROb3Rlcy50cyIsInNyYy93aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIudHMiLCJzcmMvd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi50cyIsInNyYy93aWRnZXRzL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcy50cyIsInRlbXAvcGlwLXdlYnVpLWRhc2hib2FyZC1odG1sLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSw2QkFBMkI7QUFDM0IsaUNBQStCO0FBRS9CLENBQUM7SUFDQyxZQUFZLENBQUM7SUFFYixPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtRQUM3QixXQUFXO1FBQ1gsWUFBWTtRQUNaLHVCQUF1QjtRQUN2QixnQ0FBZ0M7UUFDaEMsd0JBQXdCO1FBR3hCLFdBQVc7UUFDWCxjQUFjO1FBQ2QsYUFBYTtRQUNiLFdBQVc7UUFDWCxjQUFjO1FBQ2QsYUFBYTtLQUNkLENBQUMsQ0FBQztBQUVMLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCwyQ0FBeUM7QUFDekMsMERBQXdEO0FBQ3hELGdFQUE4RDtBQUM5RCxpQ0FBK0I7QUFDL0IsZ0NBQThCOztBQzVCOUIsQ0FBQztJQUNDLFlBQVksQ0FBQztJQUViLElBQU0sWUFBWSxHQUFHO1FBQ25CLFFBQVEsRUFBRTtZQUNSLFdBQVcsRUFBRSxpQkFBaUI7WUFDOUIsc0JBQXNCLEVBQUUsa0JBQWtCO1lBQzFDLGNBQWMsRUFBRSxZQUFZO1NBQzdCO1FBQ0QsVUFBVSxFQUFFLGtCQUFrQjtRQUM5QixZQUFZLEVBQUUsZUFBZTtRQUM3QixXQUFXLEVBQUUsZ0JBQWdCO0tBQzlCLENBQUE7SUFFRCxPQUFPO1NBQ0osTUFBTSxDQUFDLGNBQWMsQ0FBQztTQUN0QixTQUFTLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzdDLENBQUMsQ0FBQyxFQUFFLENBQUM7O0FDakJMLFlBQVksQ0FBQztB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICcuL3dpZGdldHMvV2lkZ2V0cyc7XHJcbmltcG9ydCAnLi9kcmFnZ2FibGUvRHJhZ2dhYmxlJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkJywgW1xyXG4gICAgJ3BpcFdpZGdldCcsIFxyXG4gICAgJ3BpcERyYWdnZWQnLCBcclxuICAgICdwaXBXaWRnZXRDb25maWdEaWFsb2cnLCBcclxuICAgICdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2cnLFxyXG4gICAgJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLFxyXG5cclxuICAgIC8vIEV4dGVybmFsIHBpcCBtb2R1bGVzXHJcbiAgICAncGlwTGF5b3V0JyxcclxuICAgICdwaXBMb2NhdGlvbnMnLFxyXG4gICAgJ3BpcERhdGVUaW1lJyxcclxuICAgICdwaXBDaGFydHMnLFxyXG4gICAgJ3BpcFRyYW5zbGF0ZScsXHJcbiAgICAncGlwQ29udHJvbHMnXHJcbiAgXSk7XHJcbiAgXHJcbn0pKCk7XHJcblxyXG5pbXBvcnQgJy4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQgJy4vZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vZGlhbG9ncy9hZGRfY29tcG9uZW50L0FkZENvbXBvbmVudERpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vRGFzaGJvYXJkQ29udHJvbGxlcic7XHJcbmltcG9ydCAnLi9EYXNoYm9hcmRDb21wb25lbnQnO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgY29uc3QgcGlwRGFzaGJvYXJkID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgZ3JpZE9wdGlvbnM6ICc9cGlwR3JpZE9wdGlvbnMnLFxyXG4gICAgICBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiAnPXBpcEdyb3VwQWN0aW9ucycsXHJcbiAgICAgIGdyb3VwZWRXaWRnZXRzOiAnPXBpcEdyb3VwcydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiAncGlwRGFzaGJvYXJkQ3RybCcsXHJcbiAgICBjb250cm9sbGVyQXM6ICdkYXNoYm9hcmRDdHJsJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnRGFzaGJvYXJkLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEYXNoYm9hcmQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRGFzaGJvYXJkJywgcGlwRGFzaGJvYXJkKTtcclxufSkoKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlIH0gZnJvbSAnLi91dGlsaXR5L1dpZGdldFRlbXBsYXRlVXRpbGl0eSc7XHJcblxyXG5mdW5jdGlvbiBzZXRUcmFuc2xhdGlvbnMoJGluamVjdG9yKSB7XHJcbiAgdmFyIHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlJykgOiBudWxsO1xyXG4gIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgIHBpcFRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICBEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVA6ICdEcm9wIGhlcmUgdG8gY3JlYXRlIG5ldyBncm91cCcsXHJcbiAgICB9KTtcclxuICAgIHBpcFRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICBEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVA6ICfQn9C10YDQtdGC0LDRidC40YLQtSDRgdGO0LTQsCDQtNC70Y8g0YHQvtC30LTQsNC90LjRjyDQvdC+0LLQvtC5INCz0YDRg9C/0L/RiydcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29uZmlndXJlQXZhaWxhYmxlV2lkZ2V0cyhwaXBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlcikge1xyXG4gIHBpcEFkZENvbXBvbmVudERpYWxvZ1Byb3ZpZGVyLmNvbmZpZ1dpZGdldExpc3QoW1xyXG4gICAgW3tcclxuICAgICAgICB0aXRsZTogJ0V2ZW50JyxcclxuICAgICAgICBpY29uOiAnZG9jdW1lbnQnLFxyXG4gICAgICAgIG5hbWU6ICdldmVudCcsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1Bvc2l0aW9uJyxcclxuICAgICAgICBpY29uOiAnbG9jYXRpb24nLFxyXG4gICAgICAgIG5hbWU6ICdwb3NpdGlvbicsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBbe1xyXG4gICAgICAgIHRpdGxlOiAnQ2FsZW5kYXInLFxyXG4gICAgICAgIGljb246ICdkYXRlJyxcclxuICAgICAgICBuYW1lOiAnY2FsZW5kYXInLFxyXG4gICAgICAgIGFtb3VudDogMFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICdTdGlja3kgTm90ZXMnLFxyXG4gICAgICAgIGljb246ICdub3RlLXRha2UnLFxyXG4gICAgICAgIG5hbWU6ICdub3RlcycsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1N0YXRpc3RpY3MnLFxyXG4gICAgICAgIGljb246ICd0ci1zdGF0aXN0aWNzJyxcclxuICAgICAgICBuYW1lOiAnc3RhdGlzdGljcycsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH1cclxuICAgIF1cclxuICBdKTtcclxufVxyXG5cclxuaW1wb3J0IHsgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2UgfSBmcm9tICcuL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnRQcm92aWRlcidcclxuXHJcbmNsYXNzIGRyYWdnYWJsZU9wdGlvbnMge1xyXG4gIHRpbGVXaWR0aDogbnVtYmVyO1xyXG4gIHRpbGVIZWlnaHQ6IG51bWJlcjtcclxuICBndXR0ZXI6IG51bWJlcjtcclxuICBpbmxpbmU6IGJvb2xlYW47XHJcbn1cclxuXHJcbmxldCBERUZBVUxUX0dSSURfT1BUSU9OUzogZHJhZ2dhYmxlT3B0aW9ucyA9IHtcclxuICB0aWxlV2lkdGg6IDE1MCwgLy8gJ3B4J1xyXG4gIHRpbGVIZWlnaHQ6IDE1MCwgLy8gJ3B4J1xyXG4gIGd1dHRlcjogMTAsIC8vICdweCdcclxuICBpbmxpbmU6IGZhbHNlXHJcbn07XHJcblxyXG5jbGFzcyBEYXNoYm9hcmRDb250cm9sbGVyIHtcclxuICBwcml2YXRlIGRlZmF1bHRHcm91cE1lbnVBY3Rpb25zOiBhbnkgPSBbe1xyXG4gICAgICB0aXRsZTogJ0FkZCBDb21wb25lbnQnLFxyXG4gICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudChncm91cEluZGV4KTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdGl0bGU6ICdSZW1vdmUnLFxyXG4gICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdyb3VwKGdyb3VwSW5kZXgpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0aXRsZTogJ0NvbmZpZ3VyYXRlJyxcclxuICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2NvbmZpZ3VyYXRlIGdyb3VwIHdpdGggaW5kZXg6JywgZ3JvdXBJbmRleCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdO1xyXG4gIHByaXZhdGUgXyRzY29wZTogYW5ndWxhci5JU2NvcGU7XHJcbiAgcHJpdmF0ZSBfJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZTtcclxuICBwcml2YXRlIF8kYXR0cnM6IGFueTtcclxuICBwcml2YXRlIF8kZWxlbWVudDogYW55O1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICBwcml2YXRlIF9waXBBZGRDb21wb25lbnREaWFsb2c6IElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX3BpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX2luY2x1ZGVUcGw6IHN0cmluZyA9ICc8cGlwLXt7IHR5cGUgfX0td2lkZ2V0IGdyb3VwPVwiZ3JvdXBJbmRleFwiIGluZGV4PVwiaW5kZXhcIicgK1xyXG4gICAgJ3BpcC1vcHRpb25zPVwiJHBhcmVudC5kYXNoYm9hcmRDdHJsLmdyb3VwZWRXaWRnZXRzW2dyb3VwSW5kZXhdW1xcJ3NvdXJjZVxcJ11baW5kZXhdLm9wdHNcIj4nICtcclxuICAgICc8L3BpcC17eyB0eXBlIH19LXdpZGdldD4nO1xyXG5cclxuICBwdWJsaWMgZ3JvdXBlZFdpZGdldHM6IGFueTtcclxuICBwdWJsaWMgZHJhZ2dhYmxlR3JpZE9wdGlvbnM6IGRyYWdnYWJsZU9wdGlvbnM7XHJcbiAgcHVibGljIHdpZGdldHNUZW1wbGF0ZXM6IGFueTtcclxuICBwdWJsaWMgZ3JvdXBNZW51QWN0aW9uczogYW55ID0gdGhpcy5kZWZhdWx0R3JvdXBNZW51QWN0aW9ucztcclxuICBwdWJsaWMgd2lkZ2V0c0NvbnRleHQ6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICRhdHRyczogYW55LFxyXG4gICAgJGVsZW1lbnQ6IGFueSxcclxuICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlLFxyXG4gICAgcGlwQWRkQ29tcG9uZW50RGlhbG9nOiBJQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSxcclxuICAgIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLl8kcm9vdFNjb3BlID0gJHJvb3RTY29wZTtcclxuICAgIHRoaXMuXyRhdHRycyA9ICRhdHRycztcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fJGludGVycG9sYXRlID0gJGludGVycG9sYXRlO1xyXG4gICAgdGhpcy5fcGlwQWRkQ29tcG9uZW50RGlhbG9nID0gcGlwQWRkQ29tcG9uZW50RGlhbG9nO1xyXG4gICAgdGhpcy5fcGlwV2lkZ2V0VGVtcGxhdGUgPSBwaXBXaWRnZXRUZW1wbGF0ZTtcclxuXHJcbiAgICAvLyBBZGQgY2xhc3MgdG8gc3R5bGUgc2Nyb2xsIGJhclxyXG4gICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1zY3JvbGwnKTtcclxuXHJcbiAgICAvLyBTZXQgdGlsZXMgZ3JpZCBvcHRpb25zXHJcbiAgICB0aGlzLmRyYWdnYWJsZUdyaWRPcHRpb25zID0gJHNjb3BlWydncmlkT3B0aW9ucyddIHx8IERFRkFVTFRfR1JJRF9PUFRJT05TO1xyXG5cclxuICAgIC8vIFN3aXRjaCBpbmxpbmUgZGlzcGxheWluZ1xyXG4gICAgaWYgKHRoaXMuZHJhZ2dhYmxlR3JpZE9wdGlvbnMuaW5saW5lID09PSB0cnVlKSB7XHJcbiAgICAgICRlbGVtZW50LmFkZENsYXNzKCdpbmxpbmUtZ3JpZCcpO1xyXG4gICAgfVxyXG4gICAgLy8gRXh0ZW5kIGdyb3VwJ3MgbWVudSBhY3Rpb25zXHJcbiAgICBpZiAoJHNjb3BlWydncm91cEFkZGl0aW9uYWxBY3Rpb25zJ10pIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZ3JvdXBNZW51QWN0aW9ucywgJHNjb3BlWydncm91cEFkZGl0aW9uYWxBY3Rpb25zJ10pO1xyXG5cclxuICAgIC8vIENvbXBpbGUgd2lkZ2V0c1xyXG4gICAgdGhpcy53aWRnZXRzQ29udGV4dCA9ICRzY29wZTtcclxuICAgIHRoaXMuY29tcGlsZVdpZGdldHMoKTtcclxuXHJcbiAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuXyRlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICB9LCA3MDApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21waWxlV2lkZ2V0cygpIHtcclxuICAgIF8uZWFjaCh0aGlzLmdyb3VwZWRXaWRnZXRzLCAoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICBncm91cC5yZW1vdmVkV2lkZ2V0cyA9IGdyb3VwLnJlbW92ZWRXaWRnZXRzIHx8IFtdLFxyXG4gICAgICAgIGdyb3VwLnNvdXJjZSA9IGdyb3VwLnNvdXJjZS5tYXAoKHdpZGdldCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgIC8vIEVzdGFibGlzaCBkZWZhdWx0IHByb3BzXHJcbiAgICAgICAgICB3aWRnZXQuc2l6ZSA9IHdpZGdldC5zaXplIHx8IHtcclxuICAgICAgICAgICAgY29sU3BhbjogMSxcclxuICAgICAgICAgICAgcm93U3BhbjogMVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHdpZGdldC5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgd2lkZ2V0Lmdyb3VwSW5kZXggPSBncm91cEluZGV4O1xyXG4gICAgICAgICAgd2lkZ2V0Lm1lbnUgPSB3aWRnZXQubWVudSB8fCB7fTtcclxuICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHdpZGdldC5tZW51LCBbe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1JlbW92ZScsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoaXRlbSwgcGFyYW1zLCBvYmplY3QpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnJlbW92ZVdpZGdldChpdGVtLCBwYXJhbXMsIG9iamVjdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1dKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvcHRzOiB3aWRnZXQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLl9waXBXaWRnZXRUZW1wbGF0ZS5nZXRUZW1wbGF0ZSh3aWRnZXQsIHRoaXMuX2luY2x1ZGVUcGwpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRDb21wb25lbnQoZ3JvdXBJbmRleCkge1xyXG4gICAgdGhpcy5fcGlwQWRkQ29tcG9uZW50RGlhbG9nXHJcbiAgICAgIC5zaG93KHRoaXMuZ3JvdXBlZFdpZGdldHMsIGdyb3VwSW5kZXgpXHJcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdGl2ZUdyb3VwO1xyXG5cclxuICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICBhY3RpdmVHcm91cCA9IHRoaXMuZ3JvdXBlZFdpZGdldHNbZGF0YS5ncm91cEluZGV4XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYWN0aXZlR3JvdXAgPSB7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnTmV3IGdyb3VwJyxcclxuICAgICAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWRkV2lkZ2V0cyhhY3RpdmVHcm91cC5zb3VyY2UsIGRhdGEud2lkZ2V0cyk7XHJcblxyXG4gICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnB1c2goYWN0aXZlR3JvdXApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb21waWxlV2lkZ2V0cygpO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgcmVtb3ZlR3JvdXAgPSAoZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZUdyb3VwJywgZ3JvdXBJbmRleCk7XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnNwbGljZShncm91cEluZGV4LCAxKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkV2lkZ2V0cyhncm91cCwgd2lkZ2V0cykge1xyXG4gICAgd2lkZ2V0cy5mb3JFYWNoKCh3aWRnZXRHcm91cCkgPT4ge1xyXG4gICAgICB3aWRnZXRHcm91cC5mb3JFYWNoKCh3aWRnZXQpID0+IHtcclxuICAgICAgICBpZiAod2lkZ2V0LmFtb3VudCkge1xyXG4gICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkod2lkZ2V0LmFtb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgICBncm91cC5wdXNoKHtcclxuICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQubmFtZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVtb3ZlV2lkZ2V0KGl0ZW0sIHBhcmFtcywgb2JqZWN0KSB7XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzW3BhcmFtcy5vcHRpb25zLmdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzID0gW107XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzW3BhcmFtcy5vcHRpb25zLmdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzLnB1c2gocGFyYW1zLm9wdGlvbnMuaW5kZXgpO1xyXG4gICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5zb3VyY2Uuc3BsaWNlKHBhcmFtcy5vcHRpb25zLmluZGV4LCAxKTtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cyA9IFtdO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgLmNvbmZpZyhjb25maWd1cmVBdmFpbGFibGVXaWRnZXRzKVxyXG4gIC5ydW4oc2V0VHJhbnNsYXRpb25zKVxyXG4gIC5jb250cm9sbGVyKCdwaXBEYXNoYm9hcmRDdHJsJywgRGFzaGJvYXJkQ29udHJvbGxlcik7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFkZENvbXBvbmVudERpYWxvZ0NvbnRyb2xsZXIge1xyXG4gICAgcHVibGljIF9tZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZTtcclxuICAgIHB1YmxpYyBhY3RpdmVHcm91cEluZGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgZGVmYXVsdFdpZGdldHM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cHM6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBncm91cHMsIFxyXG4gICAgICAgIGFjdGl2ZUdyb3VwSW5kZXgsIFxyXG4gICAgICAgIHdpZGdldExpc3QsXHJcbiAgICAgICAgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUdyb3VwSW5kZXggPSBfLmlzTnVtYmVyKGFjdGl2ZUdyb3VwSW5kZXgpID8gYWN0aXZlR3JvdXBJbmRleCA6IC0xO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdFdpZGdldHMgICA9IF8uY2xvbmVEZWVwKHdpZGdldExpc3QpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gXy5tYXAoZ3JvdXBzLCBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICAgIHJldHVybiBncm91cFsndGl0bGUnXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tZERpYWxvZyA9ICRtZERpYWxvZztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkICgpIHtcclxuICAgICAgICAgIHRoaXMuX21kRGlhbG9nLmhpZGUoe1xyXG4gICAgICAgICAgICBncm91cEluZGV4OiB0aGlzLmFjdGl2ZUdyb3VwSW5kZXgsXHJcbiAgICAgICAgICAgIHdpZGdldHMgICA6IHRoaXMuZGVmYXVsdFdpZGdldHNcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgcHVibGljIGNhbmNlbCAoKSB7XHJcbiAgICAgICAgICB0aGlzLl9tZERpYWxvZy5jYW5jZWwoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBlbmNyZWFzZSAoZ3JvdXBJbmRleCwgd2lkZ2V0SW5kZXgpIHtcclxuICAgICAgICAgIHZhciB3aWRnZXQgPSB0aGlzLmRlZmF1bHRXaWRnZXRzW2dyb3VwSW5kZXhdW3dpZGdldEluZGV4XTtcclxuICAgICAgICAgIHdpZGdldC5hbW91bnQrKztcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGRlY3JlYXNlIChncm91cEluZGV4LCB3aWRnZXRJbmRleCkge1xyXG4gICAgICAgICAgdmFyIHdpZGdldCAgICA9IHRoaXMuZGVmYXVsdFdpZGdldHNbZ3JvdXBJbmRleF1bd2lkZ2V0SW5kZXhdO1xyXG4gICAgICAgICAgd2lkZ2V0LmFtb3VudCA9IHdpZGdldC5hbW91bnQgPyB3aWRnZXQuYW1vdW50IC0gMSA6IDA7XHJcbiAgICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2cnLCBbJ25nTWF0ZXJpYWwnXSlcclxuICAgIC5jb250cm9sbGVyKCdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2dDb250cm9sbGVyJywgQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlcik7XHJcblxyXG5pbXBvcnQgJy4vQWRkQ29tcG9uZW50UHJvdmlkZXInOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2Uge1xyXG4gIHNob3coZ3JvdXBzLCBhY3RpdmVHcm91cEluZGV4KTogYW55O1xyXG59XHJcblxyXG5jbGFzcyBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlIGltcGxlbWVudHMgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2Uge1xyXG4gICAgcHVibGljIF9tZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZTtcclxuICAgIHByaXZhdGUgX3dpZGdldExpc3Q6IGFueTtcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2lkZ2V0TGlzdDogYW55LCAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLl9tZERpYWxvZyA9ICRtZERpYWxvZztcclxuICAgICAgICB0aGlzLl93aWRnZXRMaXN0ID0gd2lkZ2V0TGlzdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdyhncm91cHMsIGFjdGl2ZUdyb3VwSW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWREaWFsb2dcclxuICAgICAgICAgIC5zaG93KHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmwgICAgIDogJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXIgICAgICA6ICdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2dDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzICAgIDogJ2RpYWxvZ0N0cmwnLFxyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgZ3JvdXBzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBzO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgYWN0aXZlR3JvdXBJbmRleDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUdyb3VwSW5kZXg7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB3aWRnZXRMaXN0OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd2lkZ2V0TGlzdDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbn1cclxuXHJcbmNsYXNzIEFkZENvbXBvbmVudERpYWxvZ1Byb3ZpZGVyIHtcclxuICBwcml2YXRlIF9zZXJ2aWNlOiBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX3dpZGdldExpc3Q6IGFueSA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbmZpZ1dpZGdldExpc3QgPSBmdW5jdGlvbiAobGlzdCkge1xyXG4gICAgICB0aGlzLl93aWRnZXRMaXN0ID0gbGlzdDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgJGdldCgkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UpIHtcclxuICAgICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9zZXJ2aWNlID09IG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSh0aGlzLl93aWRnZXRMaXN0LCAkbWREaWFsb2cpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5wcm92aWRlcigncGlwQWRkQ29tcG9uZW50RGlhbG9nJywgQWRkQ29tcG9uZW50RGlhbG9nUHJvdmlkZXIpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jbGFzcyBUaWxlQ29sb3JzIHtcclxuICAgIHN0YXRpYyBhbGw6IHN0cmluZ1tdID0gWydwdXJwbGUnLCAnZ3JlZW4nLCAnZ3JheScsICdvcmFuZ2UnLCAnYmx1ZSddO1xyXG59XHJcblxyXG5jbGFzcyBUaWxlU2l6ZXMge1xyXG4gICAgc3RhdGljIGFsbDogYW55ID0gW1xyXG4gICAgICAgIHtuYW1lOiAnU01BTEwnLCBpZDogJzExJ30sXHJcbiAgICAgICAge25hbWU6ICdXSURFJywgaWQ6ICcyMSd9LFxyXG4gICAgICAgIHtuYW1lOiAnTEFSR0UnLCBpZDogJzIyJ31cclxuICAgIF07XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXaWRnZXRDb25maWdEaWFsb2dDb250cm9sbGVyIHtcclxuICAgIHB1YmxpYyBkaWFsb2dUaXRsZTogc3RyaW5nID0gXCJFZGl0IHRpbGVcIjtcclxuICAgIHB1YmxpYyAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2U7XHJcbiAgICBwdWJsaWMgdHJhbnNjbHVkZTogYW55O1xyXG4gICAgcHVibGljIHBhcmFtczogYW55O1xyXG4gICAgcHVibGljIGNvbG9yczogc3RyaW5nW10gPSBUaWxlQ29sb3JzLmFsbDtcclxuICAgIHB1YmxpYyBzaXplczogYW55ID0gVGlsZVNpemVzLmFsbDtcclxuICAgIHB1YmxpYyBzaXplSWQ6IHN0cmluZyA9IFRpbGVTaXplcy5hbGxbMF0uaWQ7XHJcblxyXG4gICAgcHJpdmF0ZSBfJGVsZW1lbnQ6IGFueTtcclxuICAgIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwYXJhbXMsXHJcbiAgICAgICAgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlLFxyXG4gICAgICAgICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgICAgJGluamVjdG9yLFxyXG4gICAgICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cgPSAkbWREaWFsb2c7XHJcbiAgICAgICAgdGhpcy5fJHRpbWVvdXQgPSAkdGltZW91dDtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XHJcbiAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgdGhpcy5wYXJhbXMpO1xyXG4gICAgICAgIHRoaXMuc2l6ZUlkID0gJycgKyB0aGlzLnBhcmFtcy5zaXplLmNvbFNwYW4gKyB0aGlzLnBhcmFtcy5zaXplLnJvd1NwYW47XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQXBwbHkoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpc1snc2l6ZSddLnNpemVYID0gTnVtYmVyKHRoaXMuc2l6ZUlkLnN1YnN0cigwLCAxKSk7XHJcbiAgICAgICAgdGhpc1snc2l6ZSddLnNpemVZID0gTnVtYmVyKHRoaXMuc2l6ZUlkLnN1YnN0cigxLCAxKSk7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DYW5jZWwoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuY2FuY2VsKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldENvbmZpZ0RpYWxvZycsIFsnbmdNYXRlcmlhbCddKVxyXG4gICAgLmNvbnRyb2xsZXIoJ3BpcFdpZGdldENvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInLCBXaWRnZXRDb25maWdEaWFsb2dDb250cm9sbGVyKTtcclxuXHJcbmltcG9ydCAnLi9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuaW1wb3J0ICcuL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudCc7IiwiXHJcbigoKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHBpcFdpZGdldENvbmZpZ0NvbXBvbmVudChcclxuICAgICAgICAkdGVtcGxhdGVSZXF1ZXN0OiBhbmd1bGFyLklUZW1wbGF0ZVJlcXVlc3RTZXJ2aWNlLFxyXG4gICAgICAgICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdkaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50Lmh0bWwnLFxyXG4gICAgICAgICAgICBzY29wZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbms6ICgkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCAkZWxlbWVudDogYW55LCAkYXR0cnM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJHRlbXBsYXRlUmVxdWVzdCgkYXR0cnMucGlwRXh0ZW5zaW9uVXJsLCBmYWxzZSkudGhlbigoaHRtbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ3BpcC1leHRlbnNpb24tcG9pbnQnKS5yZXBsYWNlV2l0aCgkY29tcGlsZShodG1sKSgkc2NvcGUpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBXaWRnZXRDb25maWdEaWFsb2cnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3BpcFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudCcsIHBpcFdpZGdldENvbmZpZ0NvbXBvbmVudCk7XHJcblxyXG59KSgpOyIsImV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldENvbmZpZ1NlcnZpY2Uge1xyXG4gICAgc2hvdyhwYXJhbXM6IGFueSwgc3VjY2Vzc0NhbGxiYWNrPzogKGtleSkgPT4gdm9pZCwgY2FuY2VsQ2FsbGJhY2s/OiAoKSA9PiB2b2lkKTogYW55O1xyXG59XHJcblxyXG5jbGFzcyBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlIHtcclxuICBwdWJsaWMgX21kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlO1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuX21kRGlhbG9nID0gJG1kRGlhbG9nO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3cocGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2s/OiAoa2V5KSA9PiB2b2lkLCBjYW5jZWxDYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcclxuICAgICAgICAgdGhpcy5fbWREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgICAgIHRhcmdldEV2ZW50OiBwYXJhbXMuZXZlbnQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBwYXJhbXMudGVtcGxhdGVVcmwgfHwgJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2cuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBXaWRnZXRDb25maWdEaWFsb2dDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxyXG4gICAgICAgICAgICBsb2NhbHM6IHtwYXJhbXM6IHBhcmFtc30sXHJcbiAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcclxuICAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTsgICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuXHJcbigoKSA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXRDb25maWdEaWFsb2cnKVxyXG4gICAgLnNlcnZpY2UoJ3BpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2UnLCBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlKTtcclxuICBcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdwaXBEcmFnZ2VkJywgW10pO1xyXG59KSgpO1xyXG5cclxuaW1wb3J0ICcuL0RyYWdnYWJsZVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0ICcuL0RyYWdnYWJsZUNvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vRHJhZ2dhYmxlRGlyZWN0aXZlJztcclxuaW1wb3J0ICcuL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwU2VydmljZSdcclxuaW1wb3J0ICcuL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwRGlyZWN0aXZlJyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlY2xhcmUgdmFyIGludGVyYWN0O1xyXG5cclxuaW1wb3J0IHsgRHJhZ1RpbGVTZXJ2aWNlLCBJRHJhZ1RpbGVTZXJ2aWNlLCBJRHJhZ1RpbGVDb25zdHJ1Y3RvciB9IGZyb20gJy4vRHJhZ2dhYmxlVGlsZVNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUaWxlc0dyaWRTZXJ2aWNlLCBJVGlsZXNHcmlkU2VydmljZSwgSVRpbGVzR3JpZENvbnN0cnVjdG9yIH0gZnJvbSAnLi9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UnO1xyXG5cclxubGV0IFNJTVBMRV9MQVlPVVRfQ09MVU1OU19DT1VOVDogbnVtYmVyID0gMjtcclxuZXhwb3J0IGxldCBERUZBVUxUX1RJTEVfV0lEVEg6IG51bWJlciA9IDE1MDtcclxuZXhwb3J0IGxldCBERUZBVUxUX1RJTEVfSEVJR0hUOiBudW1iZXIgPSAxNTA7XHJcbmV4cG9ydCBsZXQgVVBEQVRFX0dST1VQU19FVkVOVCA9IFwicGlwVXBkYXRlRGFzaGJvYXJkR3JvdXBzQ29uZmlnXCI7XHJcblxyXG5sZXQgREVGQVVMVF9PUFRJT05TID0ge1xyXG4gICAgdGlsZVdpZHRoICAgICAgICAgICAgICA6IERFRkFVTFRfVElMRV9XSURUSCwgICAvLyAncHgnXHJcbiAgICB0aWxlSGVpZ2h0ICAgICAgICAgICAgIDogREVGQVVMVF9USUxFX0hFSUdIVCwgICAvLyAncHgnXHJcbiAgICBndXR0ZXIgICAgICAgICAgICAgICAgIDogMjAsICAgIC8vICdweCdcclxuICAgIGNvbnRhaW5lciAgICAgICAgICAgICAgOiAncGlwLWRyYWdnYWJsZS1ncmlkOmZpcnN0LW9mLXR5cGUnLFxyXG4gICAgLy9tb2JpbGVCcmVha3BvaW50ICAgICAgIDogWFhYLCAgIC8vIEdldCBmcm9tIHBpcE1lZGlhIFNlcnZpY2UgaW4gdGhlIGNvbnN0cnVjdG9yXHJcbiAgICBhY3RpdmVEcm9wem9uZUNsYXNzICAgIDogJ2Ryb3B6b25lLWFjdGl2ZScsXHJcbiAgICBncm91cENvbnRhbmluZXJTZWxlY3RvcjogJy5waXAtZHJhZ2dhYmxlLWdyb3VwOm5vdCguZmljdC1ncm91cCknLFxyXG59O1xyXG5cclxuY2xhc3MgRHJhZ2dhYmxlQ29udHJvbGxlciB7XHJcbiAgcHVibGljIG9wdHM6IGFueTtcclxuICBwdWJsaWMgZ3JvdXBzOiBhbnk7XHJcbiAgcHVibGljIHNvdXJjZURyb3Bab25lRWxlbTogYW55ID0gbnVsbDtcclxuICBwdWJsaWMgaXNTYW1lRHJvcHpvbmU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIHB1YmxpYyB0aWxlR3JvdXBzOiBhbnkgPSBudWxsO1xyXG4gIHB1YmxpYyBhdmFpbGFibGVXaWR0aDogYW55O1xyXG4gIHB1YmxpYyBhdmFpbGFibGVDb2x1bW5zOiBhbnk7XHJcbiAgcHVibGljIGdyb3Vwc0NvbnRhaW5lcnM6IGFueTtcclxuICBwdWJsaWMgY29udGFpbmVyOiBhbnk7XHJcbiAgcHVibGljIGFjdGl2ZURyYWdnZWRHcm91cDogYW55O1xyXG4gIHB1YmxpYyBkcmFnZ2VkVGlsZTogYW55O1xyXG4gIHB1YmxpYyBjb250YWluZXJPZmZzZXQ6IGFueTtcclxuXHJcbiAgcHJpdmF0ZSBfJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlO1xyXG4gIHByaXZhdGUgXyRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF8kY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBfJGVsZW1lbnQ6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBcclxuICAgICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsIFxyXG4gICAgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLCBcclxuICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICRlbGVtZW50OiBhbnksIFxyXG4gICAgcGlwRHJhZ1RpbGU6IElEcmFnVGlsZVNlcnZpY2UsIFxyXG4gICAgcGlwVGlsZXNHcmlkOiBJVGlsZXNHcmlkU2VydmljZSxcclxuICAgIHBpcE1lZGlhOiBwaXAubGF5b3V0cy5JTWVkaWFTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XHJcbiAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgdGhpcy5fJGVsZW1lbnQgPSAkZWxlbWVudDtcclxuXHJcbiAgICB0aGlzLm9wdHMgPSBfLm1lcmdlKHsgbW9iaWxlQnJlYWtwb2ludDogcGlwTWVkaWEuYnJlYWtwb2ludHMueHMgfSwgREVGQVVMVF9PUFRJT05TLCAkc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS5vcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLmdyb3VwcyA9ICRzY29wZVsnZHJhZ2dhYmxlQ3RybCddLnRpbGVzVGVtcGxhdGVzLm1hcCgoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0aXRsZSA6IGdyb3VwLnRpdGxlLFxyXG4gICAgICAgIGVkaXRpbmdOYW1lIDogZmFsc2UsXHJcbiAgICAgICAgaW5kZXg6IGdyb3VwSW5kZXgsXHJcbiAgICAgICAgc291cmNlOiBncm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICBsZXQgdGlsZVNjb3BlID0gJHJvb3RTY29wZS4kbmV3KGZhbHNlLCAkc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc0NvbnRleHQpO1xyXG4gICAgICAgICAgdGlsZVNjb3BlWydpbmRleCddID0gdGlsZS5vcHRzLmluZGV4O1xyXG4gICAgICAgICAgdGlsZVNjb3BlWydncm91cEluZGV4J10gPSB0aWxlLm9wdHMuZ3JvdXBJbmRleDtcclxuXHJcbiAgICAgICAgICByZXR1cm4gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICAgIHRwbCAgICA6ICRjb21waWxlKHRpbGUudGVtcGxhdGUpKHRpbGVTY29wZSksXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgICAgc2l6ZSAgIDogdGlsZS5vcHRzLnNpemVcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdGVtcGxhdGVzIHdhdGNoZXJcclxuICAgICRzY29wZS4kd2F0Y2goJ2RyYWdnYWJsZUN0cmwudGlsZXNUZW1wbGF0ZXMnLCAobmV3VmFsKSA9PiB7XHJcbiAgICAgIHRoaXMud2F0Y2gobmV3VmFsKTtcclxuICAgIH0sIHRydWUpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgZGF0YVxyXG4gICAgdGhpcy5pbml0aWFsaXplKCk7XHJcblxyXG4gICAgLy8gUmVzaXplIGhhbmRsZXIgVE9ETzogcmVwbGFjZSBieSBwaXAgcmVzaXplIHdhdGNoZXJzXHJcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgICB0aGlzLmF2YWlsYWJsZVdpZHRoICAgPSB0aGlzLmdldENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICAgIHRoaXMuYXZhaWxhYmxlQ29sdW1ucyA9IHRoaXMuZ2V0QXZhaWxhYmxlQ29sdW1ucyh0aGlzLmF2YWlsYWJsZVdpZHRoKTtcclxuXHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgIGdyb3VwXHJcbiAgICAgICAgICAuc2V0QXZhaWxhYmxlQ29sdW1ucyh0aGlzLmF2YWlsYWJsZUNvbHVtbnMpXHJcbiAgICAgICAgICAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH0sIDUwKSk7XHJcbiAgfVxyXG5cclxuICAvLyBXYXRjaCBoYW5kbGVyXHJcbiAgcHJpdmF0ZSB3YXRjaChuZXdWYWwpIHtcclxuICAgICAgY29uc3QgcHJldlZhbCA9IHRoaXMuZ3JvdXBzO1xyXG4gICAgICBsZXQgY2hhbmdlZEdyb3VwSW5kZXggPSBudWxsO1xyXG5cclxuICAgICAgaWYgKG5ld1ZhbC5sZW5ndGggPiBwcmV2VmFsLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuYWRkR3JvdXAobmV3VmFsW25ld1ZhbC5sZW5ndGggLSAxXSk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbC5sZW5ndGggPCBwcmV2VmFsLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlR3JvdXBzKG5ld1ZhbCk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdWYWwubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBncm91cFdpZGdldERpZmYgPSBwcmV2VmFsW2ldLnNvdXJjZS5sZW5ndGggLSBuZXdWYWxbaV0uc291cmNlLmxlbmd0aDtcclxuICAgICAgICBpZiAoZ3JvdXBXaWRnZXREaWZmIHx8IChuZXdWYWxbaV0ucmVtb3ZlZFdpZGdldHMgJiYgbmV3VmFsW2ldLnJlbW92ZWRXaWRnZXRzLmxlbmd0aCA+IDApKSB7XHJcbiAgICAgICAgICBjaGFuZ2VkR3JvdXBJbmRleCA9IGk7XHJcblxyXG4gICAgICAgICAgaWYgKGdyb3VwV2lkZ2V0RGlmZiA8IDApIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3VGlsZXMgPSBuZXdWYWxbY2hhbmdlZEdyb3VwSW5kZXhdLnNvdXJjZS5zbGljZShncm91cFdpZGdldERpZmYpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXy5lYWNoKG5ld1RpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aWxlJywgdGlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRUaWxlc0ludG9Hcm91cChuZXdUaWxlcywgdGhpcy50aWxlR3JvdXBzW2NoYW5nZWRHcm91cEluZGV4XSwgdGhpcy5ncm91cHNDb250YWluZXJzW2NoYW5nZWRHcm91cEluZGV4XSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTsgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKHRoaXMudGlsZUdyb3Vwc1tjaGFuZ2VkR3JvdXBJbmRleF0sIG5ld1ZhbFtjaGFuZ2VkR3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tjaGFuZ2VkR3JvdXBJbmRleF0pO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTsgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbCAmJiB0aGlzLnRpbGVHcm91cHMpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHsgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpOyB9KTtcclxuICAgICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gSW5saW5lIGVkaXQgZ3JvdXAgaGFuZGxlcnNcclxuICBwdWJsaWMgb25UaXRsZUNsaWNrKGdyb3VwLCBldmVudCkge1xyXG4gICAgICBpZiAoIWdyb3VwLmVkaXRpbmdOYW1lKSB7XHJcbiAgICAgICAgZ3JvdXAub2xkVGl0bGUgPSBfLmNsb25lKGdyb3VwLnRpdGxlKTtcclxuICAgICAgICBncm91cC5lZGl0aW5nTmFtZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0LmNoaWxkcmVuWzBdKS5mb2N1cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FuY2VsRWRpdGluZyAoZ3JvdXApIHtcclxuICAgICAgZ3JvdXAudGl0bGUgPSBncm91cC5vbGRUaXRsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25CbHVyVGl0bGVJbnB1dCAoZ3JvdXApIHtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLmVkaXRpbmdOYW1lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fJHJvb3RTY29wZS4kYnJvYWRjYXN0KFVQREFURV9HUk9VUFNfRVZFTlQsIHRoaXMuZ3JvdXBzKTtcclxuICAgICAgICAvLyBVcGRhdGUgdGl0bGUgaW4gb3V0ZXIgc2NvcGVcclxuICAgICAgICB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc1RlbXBsYXRlc1tncm91cC5pbmRleF0udGl0bGUgPSBncm91cC50aXRsZTtcclxuICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25LeWVwcmVzc1RpdGxlSW5wdXQgKGdyb3VwLCBldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICB0aGlzLm9uQmx1clRpdGxlSW5wdXQoZ3JvdXApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIG91dGVyIHNjb3BlIGZ1bmN0aW9uc1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc1RlbXBsYXRlcyh1cGRhdGVUeXBlOiBzdHJpbmcsIHNvdXJjZT86IGFueSkge1xyXG4gICAgICBzd2l0Y2godXBkYXRlVHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ2FkZEdyb3VwJzogXHJcbiAgICAgICAgICBpZiAodGhpcy5ncm91cHMubGVuZ3RoICE9PSB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc1RlbXBsYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc1RlbXBsYXRlcy5wdXNoKHNvdXJjZSk7XHJcbiAgICAgICAgICB9ICAgICAgICAgIFxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbW92ZVRpbGUnOiBcclxuICAgICAgICAgIGNvbnN0IHtmcm9tSW5kZXgsIHRvSW5kZXgsIHRpbGVPcHRpb25zLCBmcm9tVGlsZUluZGV4fSA9IHtcclxuICAgICAgICAgICAgZnJvbUluZGV4OiBzb3VyY2UuZnJvbS5lbGVtLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSxcclxuICAgICAgICAgICAgdG9JbmRleDogc291cmNlLnRvLmVsZW0uYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlLFxyXG4gICAgICAgICAgICB0aWxlT3B0aW9uczogc291cmNlLnRpbGUub3B0cy5vcHRpb25zLFxyXG4gICAgICAgICAgICBmcm9tVGlsZUluZGV4OiBzb3VyY2UudGlsZS5vcHRzLm9wdGlvbnMuaW5kZXhcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuXyRzY29wZVsnZHJhZ2dhYmxlQ3RybCddLnRpbGVzVGVtcGxhdGVzW2Zyb21JbmRleF0uc291cmNlLnNwbGljZShmcm9tVGlsZUluZGV4LCAxKTtcclxuICAgICAgICAgIHRoaXMuXyRzY29wZVsnZHJhZ2dhYmxlQ3RybCddLnRpbGVzVGVtcGxhdGVzW3RvSW5kZXhdLnNvdXJjZS5wdXNoKHtvcHRzOiB0aWxlT3B0aW9uc30pO1xyXG5cclxuICAgICAgICAgIHRoaXMucmVJbmRleFRpbGVzKHNvdXJjZS5mcm9tLmVsZW0pO1xyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoc291cmNlLnRvLmVsZW0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNYW5hZ2UgdGlsZXMgZnVuY3Rpb25zXHJcbiAgICBwcml2YXRlIHJlbW92ZVRpbGVzKGdyb3VwLCBpbmRleGVzLCBjb250YWluZXIpIHtcclxuICAgICAgY29uc3QgdGlsZXMgPSAkKGNvbnRhaW5lcikuZmluZCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpO1xyXG5cclxuICAgICAgXy5lYWNoKGluZGV4ZXMsIChpbmRleCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgdGlsZXNbaW5kZXhdLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVJbmRleFRpbGVzKGNvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZUluZGV4VGlsZXMoY29udGFpbmVyLCBnSW5kZXg/KSB7XHJcbiAgICAgIGNvbnN0IHRpbGVzID0gJChjb250YWluZXIpLmZpbmQoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKSxcclxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGdJbmRleCA9PT0gdW5kZWZpbmVkID8gY29udGFpbmVyLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSA6IGdJbmRleDtcclxuXHJcbiAgICAgIF8uZWFjaCh0aWxlcywgKHRpbGUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgbGV0IGNoaWxkID0gJCh0aWxlKS5jaGlsZHJlbigpWzBdO1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnaW5kZXgnXSA9IGluZGV4O1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnZ3JvdXBJbmRleCddID0gZ3JvdXBJbmRleDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVHcm91cHMobmV3R3JvdXBzKSB7XHJcbiAgICAgIGNvbnN0IHJlbW92ZUluZGV4ZXMgPSBbXSxcclxuICAgICAgICAgICAgcmVtYWluID0gW10sXHJcbiAgICAgICAgICAgIGNvbnRhaW5lcnMgPSBbXTtcclxuXHJcblxyXG4gICAgICBfLmVhY2godGhpcy5ncm91cHMsIChncm91cCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgIGlmIChfLmZpbmRJbmRleChuZXdHcm91cHMsIChnKSA9PiB7IHJldHVybiBnWyd0aXRsZSddID09PSBncm91cC50aXRsZX0pIDwgMCkge1xyXG4gICAgICAgICAgICByZW1vdmVJbmRleGVzLnB1c2goaW5kZXgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVtYWluLnB1c2goaW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIF8uZWFjaChyZW1vdmVJbmRleGVzLnJldmVyc2UoKSwgKGluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgdGhpcy50aWxlR3JvdXBzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgXy5lYWNoKHJlbWFpbiwgKGluZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb250YWluZXJzLnB1c2godGhpcy5ncm91cHNDb250YWluZXJzW2luZGV4XSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgIHRoaXMuZ3JvdXBzQ29udGFpbmVycyA9IGNvbnRhaW5lcnM7XHJcblxyXG4gICAgICBfLmVhY2godGhpcy5ncm91cHNDb250YWluZXJzLCAoY29udGFpbmVyLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoY29udGFpbmVyLCBpbmRleCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkR3JvdXAoc291cmNlR3JvdXApIHtcclxuICAgICAgbGV0IGdyb3VwID0ge1xyXG4gICAgICAgIHRpdGxlIDogc291cmNlR3JvdXAudGl0bGUsXHJcbiAgICAgICAgc291cmNlOiBzb3VyY2VHcm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICBsZXQgdGlsZVNjb3BlID0gdGhpcy5fJHJvb3RTY29wZS4kbmV3KGZhbHNlLCB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc0NvbnRleHQpO1xyXG4gICAgICAgICAgdGlsZVNjb3BlWydpbmRleCddID0gdGlsZS5vcHRzLmluZGV4ID09IHVuZGVmaW5lZCA/IHRpbGUub3B0cy5vcHRpb25zLmluZGV4IDogdGlsZS5vcHRzLmluZGV4IDtcclxuICAgICAgICAgIHRpbGVTY29wZVsnZ3JvdXBJbmRleCddID0gdGlsZS5vcHRzLmdyb3VwSW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuZ3JvdXBJbmRleCA6IHRpbGUub3B0cy5ncm91cEluZGV4O1xyXG4gICAgICAgICAgcmV0dXJuIElEcmFnVGlsZUNvbnN0cnVjdG9yKERyYWdUaWxlU2VydmljZSwge1xyXG4gICAgICAgICAgICB0cGwgICAgOiB0aGlzLl8kY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB0aWxlLm9wdHMsXHJcbiAgICAgICAgICAgIHNpemUgICA6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMucHVzaChncm91cCk7XHJcbiAgICAgIGlmICghdGhpcy5fJHNjb3BlLiQkcGhhc2UpIHRoaXMuXyRzY29wZS4kYXBwbHkoKTtcclxuXHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0cy5ncm91cENvbnRhbmluZXJTZWxlY3Rvcik7XHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzLnB1c2goXHJcbiAgICAgICAgICBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCB0aGlzLm9wdHMsIHRoaXMuYXZhaWxhYmxlQ29sdW1ucywgdGhpcy5ncm91cHNDb250YWluZXJzW3RoaXMuZ3JvdXBzQ29udGFpbmVycy5sZW5ndGggLSAxXSlcclxuICAgICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KClcclxuICAgICAgICApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNUZW1wbGF0ZXMoJ2FkZEdyb3VwJywgc291cmNlR3JvdXApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkVGlsZXNJbnRvR3JvdXAobmV3VGlsZXMsIGdyb3VwLCBncm91cENvbnRhaW5lcikge1xyXG4gICAgICBuZXdUaWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5fJHJvb3RTY29wZS4kbmV3KGZhbHNlLCB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc0NvbnRleHQpO1xyXG4gICAgICAgIHRpbGVTY29wZVsnaW5kZXgnXSA9IHRpbGUub3B0cy5pbmRleCA9PSB1bmRlZmluZWQgPyB0aWxlLm9wdHMub3B0aW9ucy5pbmRleCA6IHRpbGUub3B0cy5pbmRleCA7XHJcbiAgICAgICAgdGlsZVNjb3BlWydncm91cEluZGV4J10gPSB0aWxlLm9wdHMuZ3JvdXBJbmRleCA9PSB1bmRlZmluZWQgPyB0aWxlLm9wdHMub3B0aW9ucy5ncm91cEluZGV4IDogdGlsZS5vcHRzLmdyb3VwSW5kZXg7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld1RpbGUgPSBJRHJhZ1RpbGVDb25zdHJ1Y3RvcihEcmFnVGlsZVNlcnZpY2Use1xyXG4gICAgICAgICAgdHBsICAgIDogdGhpcy5fJGNvbXBpbGUodGlsZS50ZW1wbGF0ZSkodGlsZVNjb3BlKSxcclxuICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgIHNpemUgICA6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZFRpbGUobmV3VGlsZSk7XHJcblxyXG4gICAgICAgICQoJzxkaXY+JylcclxuICAgICAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5hcHBlbmQobmV3VGlsZS5nZXRDb21waWxlZFRlbXBsYXRlKCkpXHJcbiAgICAgICAgICAuYXBwZW5kVG8oZ3JvdXBDb250YWluZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzT3B0aW9ucyhvcHRpb25zR3JvdXApIHtcclxuICAgICAgb3B0aW9uc0dyb3VwLmZvckVhY2goKG9wdGlvbkdyb3VwKSA9PiB7XHJcbiAgICAgICAgb3B0aW9uR3JvdXAuc291cmNlLmZvckVhY2goKHRpbGVPcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgICAgZ3JvdXAudXBkYXRlVGlsZU9wdGlvbnModGlsZU9wdGlvbnMub3B0cyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0VGlsZXNHcm91cHModGlsZUdyb3Vwcywgb3B0cywgZ3JvdXBzQ29udGFpbmVycykge1xyXG4gICAgICByZXR1cm4gdGlsZUdyb3Vwcy5tYXAoKGdyb3VwLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCBvcHRzLCB0aGlzLmF2YWlsYWJsZUNvbHVtbnMsIGdyb3Vwc0NvbnRhaW5lcnNbaW5kZXhdKVxyXG4gICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnMoKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc0dyb3Vwcyhvbmx5UG9zaXRpb24/LCBkcmFnZ2VkVGlsZT8pIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIGdyb3VwLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBncm91cFxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDb250YWluZXJXaWR0aCgpOiBhbnkge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl8kc2NvcGVbJyRjb250YWluZXInXSB8fCAkKCdib2R5Jyk7XHJcbiAgICAgIHJldHVybiBjb250YWluZXIud2lkdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEF2YWlsYWJsZUNvbHVtbnMoYXZhaWxhYmxlV2lkdGgpOiBhbnkge1xyXG4gICAgICByZXR1cm4gdGhpcy5vcHRzLm1vYmlsZUJyZWFrcG9pbnQgPiBhdmFpbGFibGVXaWR0aCA/IFNJTVBMRV9MQVlPVVRfQ09MVU1OU19DT1VOVFxyXG4gICAgICAgIDogTWF0aC5mbG9vcihhdmFpbGFibGVXaWR0aCAvICh0aGlzLm9wdHMudGlsZVdpZHRoICsgdGhpcy5vcHRzLmd1dHRlcikpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QWN0aXZlR3JvdXBBbmRUaWxlKGVsZW0pOiBhbnkge1xyXG4gICAgICBjb25zdCBhY3RpdmUgPSB7fTtcclxuXHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZvdW5kVGlsZSA9IGdyb3VwLmdldFRpbGVCeU5vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIGlmIChmb3VuZFRpbGUpIHtcclxuICAgICAgICAgIGFjdGl2ZVsnZ3JvdXAnXSA9IGdyb3VwO1xyXG4gICAgICAgICAgYWN0aXZlWyd0aWxlJ10gID0gZm91bmRUaWxlO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gYWN0aXZlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKGF2YWlsYWJsZVdpZHRoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0cy5tb2JpbGVCcmVha3BvaW50ID4gYXZhaWxhYmxlV2lkdGggPyBhdmFpbGFibGVXaWR0aCAvIDIgLSB0aGlzLm9wdHMuZ3V0dGVyIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ1N0YXJ0TGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgYWN0aXZlRW50aXRpZXMgPSB0aGlzLmdldEFjdGl2ZUdyb3VwQW5kVGlsZShldmVudC50YXJnZXQpO1xyXG5cclxuICAgICAgdGhpcy5jb250YWluZXIgICAgICAgICAgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50KCcucGlwLWRyYWdnYWJsZS1ncm91cCcpLmdldCgwKTtcclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZSAgICAgICAgPSBhY3RpdmVFbnRpdGllc1sndGlsZSddO1xyXG4gICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCA9IGFjdGl2ZUVudGl0aWVzWydncm91cCddO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5fJGVsZW1lbnQuYWRkQ2xhc3MoJ2RyYWctdHJhbnNmZXInKTtcclxuXHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUuc3RhcnREcmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICBjb25zdCB4ICAgICAgPSAocGFyc2VGbG9hdCh0YXJnZXQuc3R5bGUubGVmdCkgfHwgMCkgKyBldmVudC5keDtcclxuICAgICAgY29uc3QgeSAgICAgID0gKHBhcnNlRmxvYXQodGFyZ2V0LnN0eWxlLnRvcCkgfHwgMCkgKyBldmVudC5keTtcclxuXHJcbiAgICAgIHRoaXMuY29udGFpbmVyT2Zmc2V0ID0gdGhpcy5nZXRDb250YWluZXJPZmZzZXQoKTtcclxuXHJcbiAgICAgIHRhcmdldC5zdHlsZS5sZWZ0ID0geCArICdweCc7IC8vIFRPRE8gW2FwaWRoaXJueWldIEV4dHJhY3QgdW5pdHMgaW50byBvcHRpb25zIHNlY3Rpb25cclxuICAgICAgdGFyZ2V0LnN0eWxlLnRvcCAgPSB5ICsgJ3B4JztcclxuXHJcbiAgICAgIGNvbnN0IGJlbG93RWxlbWVudCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVCeUNvb3JkaW5hdGVzKHtcclxuICAgICAgICBsZWZ0OiBldmVudC5wYWdlWCAtIHRoaXMuY29udGFpbmVyT2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgdG9wIDogZXZlbnQucGFnZVkgLSB0aGlzLmNvbnRhaW5lck9mZnNldC50b3BcclxuICAgICAgfSwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcblxyXG4gICAgICBpZiAoYmVsb3dFbGVtZW50KSB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dlZFRpbGVJbmRleCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVJbmRleCh0aGlzLmRyYWdnZWRUaWxlKTtcclxuICAgICAgICBjb25zdCBiZWxvd0VsZW1JbmRleCAgID0gdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAuZ2V0VGlsZUluZGV4KGJlbG93RWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICgoZHJhZ2dlZFRpbGVJbmRleCArIDEpID09PSBiZWxvd0VsZW1JbmRleCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXBcclxuICAgICAgICAgIC5zd2FwVGlsZXModGhpcy5kcmFnZ2VkVGlsZSwgYmVsb3dFbGVtZW50KVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucyh0cnVlLCB0aGlzLmRyYWdnZWRUaWxlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4geyB0aGlzLnNldEdyb3VwQ29udGFpbmVyc0hlaWdodCgpOyB9LCAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnRW5kTGlzdGVuZXIoKSB7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUuc3RvcERyYWcodGhpcy5pc1NhbWVEcm9wem9uZSk7XHJcblxyXG4gICAgICB0aGlzLl8kZWxlbWVudC5yZW1vdmVDbGFzcygnZHJhZy10cmFuc2ZlcicpO1xyXG4gICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCA9IG51bGw7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUgICAgICAgID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldENvbnRhaW5lck9mZnNldCgpIHtcclxuICAgICAgY29uc3QgY29udGFpbmVyUmVjdCA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBsZWZ0OiBjb250YWluZXJSZWN0LmxlZnQsXHJcbiAgICAgICAgdG9wIDogY29udGFpbmVyUmVjdC50b3BcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEdyb3VwQ29udGFpbmVyc0hlaWdodCgpIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKHRpbGVHcm91cCkgPT4ge1xyXG4gICAgICAgIHRpbGVHcm91cC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW92ZVRpbGUoZnJvbSwgdG8sIHRpbGUpIHtcclxuICAgICAgbGV0IGVsZW07XHJcbiAgICAgIGNvbnN0IG1vdmVkVGlsZSA9IGZyb20ucmVtb3ZlVGlsZSh0aWxlKTtcclxuICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5fJHJvb3RTY29wZS4kbmV3KGZhbHNlLCB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc0NvbnRleHQpO1xyXG4gICAgICAgICAgdGlsZVNjb3BlWydpbmRleCddID0gdGlsZS5vcHRzLmluZGV4ID09IHVuZGVmaW5lZCA/IHRpbGUub3B0cy5vcHRpb25zLmluZGV4IDogdGlsZS5vcHRzLmluZGV4IDtcclxuICAgICAgICAgIHRpbGVTY29wZVsnZ3JvdXBJbmRleCddID0gdGlsZS5vcHRzLmdyb3VwSW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuZ3JvdXBJbmRleCA6IHRpbGUub3B0cy5ncm91cEluZGV4O1xyXG5cclxuICAgICAgJCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbXy5maW5kSW5kZXgodGhpcy50aWxlR3JvdXBzLCBmcm9tKV0pXHJcbiAgICAgICAgLmZpbmQobW92ZWRUaWxlLmdldEVsZW0oKSlcclxuICAgICAgICAucmVtb3ZlKCk7XHJcblxyXG4gICAgICBpZiAodG8gIT09IG51bGwpIHtcclxuICAgICAgICB0by5hZGRUaWxlKG1vdmVkVGlsZSk7XHJcblxyXG4gICAgICAgIGVsZW0gPSB0aGlzLl8kY29tcGlsZShtb3ZlZFRpbGUuZ2V0RWxlbSgpKSh0aWxlU2NvcGUpO1xyXG5cclxuICAgICAgICAkKHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tfLmZpbmRJbmRleCh0aGlzLnRpbGVHcm91cHMsIHRvKV0pXHJcbiAgICAgICAgICAuYXBwZW5kKGVsZW0pO1xyXG5cclxuICAgICAgICB0aGlzLl8kdGltZW91dCh0by5zZXRUaWxlc0RpbWVuc2lvbnMuYmluZCh0bywgdHJ1ZSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzVGVtcGxhdGVzKCdtb3ZlVGlsZScsIHtmcm9tOiBmcm9tLCB0bzogdG8sIHRpbGU6IG1vdmVkVGlsZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZHJvcHBlZEdyb3VwSW5kZXggPSBldmVudC50YXJnZXQuYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlO1xyXG4gICAgICBjb25zdCBkcm9wcGVkR3JvdXAgICAgICA9IHRoaXMudGlsZUdyb3Vwc1tkcm9wcGVkR3JvdXBJbmRleF07XHJcblxyXG4gICAgICBpZiAodGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAgIT09IGRyb3BwZWRHcm91cCkge1xyXG4gICAgICAgIHRoaXMubW92ZVRpbGUodGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAsIGRyb3BwZWRHcm91cCwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHModHJ1ZSk7XHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcFRvRmljdEdyb3VwTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZnJvbSA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwO1xyXG4gICAgICBjb25zdCB0aWxlID0gdGhpcy5kcmFnZ2VkVGlsZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkR3JvdXAoe3RpdGxlOiAnTmV3IGdyb3VwJywgc291cmNlOiBbXX0pO1xyXG4gICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVGlsZShmcm9tLCB0aGlzLnRpbGVHcm91cHNbdGhpcy50aWxlR3JvdXBzLmxlbmd0aCAtIDFdLCB0aWxlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKHRydWUpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcEVudGVyTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgaWYgKCF0aGlzLnNvdXJjZURyb3Bab25lRWxlbSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc291cmNlRHJvcFpvbmVFbGVtICE9PSBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyKSB7XHJcbiAgICAgICAgZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlci5jbGFzc0xpc3QuYWRkKCdkcm9wem9uZS1hY3RpdmUnKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnY29weScpO1xyXG4gICAgICAgIHRoaXMuaXNTYW1lRHJvcHpvbmUgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgICAgdGhpcy5pc1NhbWVEcm9wem9uZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBpZiAodGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gIT09IGV2ZW50LnRhcmdldCkge1xyXG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMub3B0cy5hY3RpdmVEcm9wem9uZUNsYXNzKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5vcHRzLmFjdGl2ZURyb3B6b25lQ2xhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlV2lkdGggICA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkdGgoKTtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZUNvbHVtbnMgPSB0aGlzLmdldEF2YWlsYWJsZUNvbHVtbnModGhpcy5hdmFpbGFibGVXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdHMuZ3JvdXBDb250YW5pbmVyU2VsZWN0b3IpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3VwcyAgICAgICA9IHRoaXMuaW5pdFRpbGVzR3JvdXBzKHRoaXMuZ3JvdXBzLCB0aGlzLm9wdHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVycyk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5kcmFnZ2FibGUoe1xyXG4gICAgICAgICAgICAvLyBlbmFibGUgYXV0b1Njcm9sbFxyXG4gICAgICAgICAgICBhdXRvU2Nyb2xsOiB0cnVlLFxyXG4gICAgICAgICAgICBvbnN0YXJ0OiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyYWdTdGFydExpc3RlbmVyKGV2ZW50KSB9LFxyXG4gICAgICAgICAgICBvbm1vdmUgOiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIH0sXHJcbiAgICAgICAgICAgIG9uZW5kICA6IChldmVudCkgPT4geyB0aGlzLm9uRHJhZ0VuZExpc3RlbmVyKCkgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLWdyb3VwLmZpY3QtZ3JvdXAnKVxyXG4gICAgICAgICAgLmRyb3B6b25lKHtcclxuICAgICAgICAgICAgb25kcm9wOiAoZXZlbnQpID0+IHsgY29uc29sZS5sb2coJ2hlcmUnKTsgIHRoaXMub25Ecm9wVG9GaWN0R3JvdXBMaXN0ZW5lcihldmVudCkgfSxcclxuICAgICAgICAgICAgb25kcmFnZW50ZXIgICAgIDogKGV2ZW50KSA9PiB7IHRoaXMub25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudCkgfSxcclxuICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogKGV2ZW50KSA9PiB7IHRoaXMub25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KSB9LFxyXG4gICAgICAgICAgICBvbmRyYWdsZWF2ZSAgICAgOiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyb3BMZWF2ZUxpc3RlbmVyKGV2ZW50KSB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS1ncm91cCcpXHJcbiAgICAgICAgICAuZHJvcHpvbmUoe1xyXG4gICAgICAgICAgICBvbmRyb3AgICAgICAgICAgOiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyb3BMaXN0ZW5lcihldmVudCkgfSxcclxuICAgICAgICAgICAgb25kcmFnZW50ZXIgICAgIDogKGV2ZW50KSA9PiB7IHRoaXMub25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudCkgfSxcclxuICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogKGV2ZW50KSA9PiB7IHRoaXMub25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KSB9LFxyXG4gICAgICAgICAgICBvbmRyYWdsZWF2ZSAgICAgOiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyb3BMZWF2ZUxpc3RlbmVyKGV2ZW50KSB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fJHNjb3BlWyckY29udGFpbmVyJ11cclxuICAgICAgICAgIC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAnbWQtbWVudSAubWQtaWNvbi1idXR0b24nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJykuZHJhZ2dhYmxlKGZhbHNlKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5vbignbW91c2V1cCB0b3VjaGVuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKS5kcmFnZ2FibGUodHJ1ZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgICAuY29udHJvbGxlcigncGlwRHJhZ2dhYmxlQ3RybCcsIERyYWdnYWJsZUNvbnRyb2xsZXIpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgLmRpcmVjdGl2ZSgncGlwRHJhZ2dhYmxlR3JpZCcsIERyYWdEaXJlY3RpdmUpO1xyXG5cclxuZnVuY3Rpb24gRHJhZ0RpcmVjdGl2ZSgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHRpbGVzVGVtcGxhdGVzOiAnPXBpcFRpbGVzVGVtcGxhdGVzJyxcclxuICAgICAgdGlsZXNDb250ZXh0OiAnPXBpcFRpbGVzQ29udGV4dCcsXHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwRHJhZ2dhYmxlR3JpZCcsXHJcbiAgICAgIGdyb3VwTWVudUFjdGlvbnM6ICc9cGlwR3JvdXBNZW51QWN0aW9ucydcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2RyYWdnYWJsZS9EcmFnZ2FibGUuaHRtbCcsXHJcbiAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgY29udHJvbGxlckFzOiAnZHJhZ2dhYmxlQ3RybCcsXHJcbiAgICBjb250cm9sbGVyOiAncGlwRHJhZ2dhYmxlQ3RybCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbSkge1xyXG4gICAgICAkc2NvcGUuJGNvbnRhaW5lciA9ICRlbGVtO1xyXG4gICAgfVxyXG4gIH07XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERyYWdUaWxlQ29uc3RydWN0b3Ige1xyXG4gIG5ldyAob3B0aW9uczogYW55KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIElEcmFnVGlsZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBEcmFnVGlsZUNvbnN0cnVjdG9yLCBvcHRpb25zOiBhbnkpOiBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHRwbDogYW55O1xyXG4gIG9wdHM6IGFueTtcclxuICBzaXplOiBhbnk7XHJcbiAgZWxlbTogYW55O1xyXG4gIHByZXZpZXc6IGFueTtcclxuICBnZXRTaXplKCk6IGFueTtcclxuICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnk7XHJcbiAgc2V0UG9zaXRpb24obGVmdCwgdG9wKTogYW55O1xyXG4gIGdldENvbXBpbGVkVGVtcGxhdGUoKTogYW55O1xyXG4gIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55O1xyXG4gIGdldEVsZW0oKTogYW55O1xyXG4gIHN0YXJ0RHJhZygpOiBhbnk7XHJcbiAgc3RvcERyYWcoaXNBbmltYXRlKTogYW55O1xyXG4gIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpOiB2b2lkO1xyXG4gIGdldE9wdGlvbnMoKTogYW55O1xyXG4gIHNldE9wdGlvbnMob3B0aW9ucyk6IGFueTtcclxufVxyXG5cclxubGV0IERFRkFVTFRfVElMRV9TSVpFID0ge1xyXG4gIGNvbFNwYW46IDEsXHJcbiAgcm93U3BhbjogMVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIERyYWdUaWxlU2VydmljZSBpbXBsZW1lbnRzIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHB1YmxpYyB0cGw6IGFueTtcclxuICBwdWJsaWMgb3B0czogYW55O1xyXG4gIHB1YmxpYyBzaXplOiBhbnk7XHJcbiAgcHVibGljIGVsZW06IGFueTtcclxuICBwdWJsaWMgcHJldmlldzogYW55O1xyXG5cclxuICBjb25zdHJ1Y3RvciAob3B0aW9uczogYW55KSB7XHJcbiAgICB0aGlzLnRwbCA9IG9wdGlvbnMudHBsLmdldCgwKTtcclxuICAgIHRoaXMub3B0cyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLnNpemUgPSBfLm1lcmdlKHt9LCBERUZBVUxUX1RJTEVfU0laRSwgb3B0aW9ucy5zaXplKTtcclxuICAgIHRoaXMuZWxlbSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2l6ZSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2l6ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnkge1xyXG4gICAgdGhpcy5zaXplLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLnNpemUuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFBvc2l0aW9uKGxlZnQsIHRvcCk6IGFueSB7XHJcbiAgICB0aGlzLnNpemUubGVmdCA9IGxlZnQ7XHJcbiAgICB0aGlzLnNpemUudG9wID0gdG9wO1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICB0b3A6IHRvcFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDb21waWxlZFRlbXBsYXRlKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy50cGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55IHtcclxuICAgIHRoaXMuZWxlbSA9ICQodGhpcy50cGwpLnBhcmVudChwYXJlbnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtLmdldCgwKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCk6IGFueSB7XHJcbiAgICB0aGlzLnByZXZpZXcgPSAkKCc8ZGl2PicpXHJcbiAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnZWQtcHJldmlldycpXHJcbiAgICAgIC5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMuZWxlbS5jc3MoJ2xlZnQnKSxcclxuICAgICAgICB0b3A6IHRoaXMuZWxlbS5jc3MoJ3RvcCcpLFxyXG4gICAgICAgIHdpZHRoOiB0aGlzLmVsZW0uY3NzKCd3aWR0aCcpLFxyXG4gICAgICAgIGhlaWdodDogdGhpcy5lbGVtLmNzcygnaGVpZ2h0JylcclxuICAgICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtXHJcbiAgICAgIC5hZGRDbGFzcygnbm8tYW5pbWF0aW9uJylcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgekluZGV4OiAnOTk5OSdcclxuICAgICAgfSlcclxuICAgICAgLmFmdGVyKHRoaXMucHJldmlldyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0b3BEcmFnKGlzQW5pbWF0ZSk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgaWYgKGlzQW5pbWF0ZSkge1xyXG4gICAgICB0aGlzLmVsZW1cclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ25vLWFuaW1hdGlvbicpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiB0aGlzLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHRoaXMucHJldmlldy5jc3MoJ3RvcCcpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub24oJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiBzZWxmLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHNlbGYucHJldmlldy5jc3MoJ3RvcCcpLFxyXG4gICAgICAgICAgekluZGV4OiAnJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCduby1hbmltYXRpb24nKTtcclxuXHJcbiAgICAgIHNlbGYucHJldmlldy5yZW1vdmUoKTtcclxuICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICBmdW5jdGlvbiBvblRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICAgIGlmIChzZWxmLnByZXZpZXcpIHtcclxuICAgICAgICBzZWxmLnByZXZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcygnekluZGV4JywgJycpXHJcbiAgICAgICAgLm9mZigndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpIHtcclxuICAgIHRoaXMucHJldmlldy5jc3MoY29vcmRzKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0T3B0aW9ucygpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0cy5vcHRpb25zO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRPcHRpb25zKG9wdGlvbnMpOiBhbnkge1xyXG4gICAgXy5tZXJnZSh0aGlzLm9wdHMub3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICBfLm1lcmdlKHRoaXMuc2l6ZSwgb3B0aW9ucy5zaXplKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgLnNlcnZpY2UoJ3BpcERyYWdUaWxlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgIGxldCBuZXdUaWxlID0gbmV3IERyYWdUaWxlU2VydmljZShvcHRpb25zKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdUaWxlO1xyXG4gICAgfVxyXG4gIH0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBEcmFnZ2VkJylcclxuICAuZGlyZWN0aXZlKCdwaXBEcmFnZ2FibGVUaWxlcycsIERyYWdnYWJsZVRpbGUpO1xyXG5cclxuZnVuY3Rpb24gRHJhZ2dhYmxlVGlsZSgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtLCAkYXR0cikge1xyXG4gICAgICB2YXIgZG9jRnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgICAgdmFyIGdyb3VwID0gJHNjb3BlLiRldmFsKCRhdHRyLnBpcERyYWdnYWJsZVRpbGVzKTtcclxuXHJcbiAgICAgIGdyb3VwLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcclxuICAgICAgICB2YXIgdHBsID0gd3JhcENvbXBvbmVudCh0aWxlLmdldENvbXBpbGVkVGVtcGxhdGUoKSk7XHJcbiAgICAgICAgZG9jRnJhZy5hcHBlbmRDaGlsZCh0cGwpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICRlbGVtLmFwcGVuZChkb2NGcmFnKTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIHdyYXBDb21wb25lbnQoZWxlbSkge1xyXG4gICAgICAgIHJldHVybiAkKCc8ZGl2PicpXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ3BpcC1kcmFnZ2FibGUtdGlsZScpXHJcbiAgICAgICAgICAuYXBwZW5kKGVsZW0pXHJcbiAgICAgICAgICAuZ2V0KDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGlsZXNHcmlkQ29uc3RydWN0b3Ige1xyXG4gIG5ldyAodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSVRpbGVzR3JpZENvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBUaWxlc0dyaWRDb25zdHJ1Y3RvciwgdGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pOklUaWxlc0dyaWRTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgdGlsZXM6IGFueTtcclxuICBvcHRzOiBhbnk7XHJcbiAgY29sdW1uczogYW55O1xyXG4gIGVsZW06IGFueTtcclxuICBncmlkQ2VsbHM6IGFueTtcclxuICBpbmxpbmU6IGJvb2xlYW47XHJcbiAgaXNNb2JpbGVMYXlvdXQ6IGJvb2xlYW47XHJcblxyXG4gIGFkZFRpbGUodGlsZSk6IGFueTtcclxuICBnZXRDZWxsQnlQb3NpdGlvbihyb3csIGNvbCk6IGFueTtcclxuICBnZXRDZWxscyhwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueTtcclxuICBnZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRCYXNpY1JvdyhwcmV2Q2VsbCk6IGFueTtcclxuICBpc0NlbGxGcmVlKHJvdywgY29sKTogYW55O1xyXG4gIGdldENlbGxJbmRleChzcmNDZWxsKTogYW55O1xyXG4gIHJlc2VydmVDZWxscyhzdGFydCwgZW5kLCBlbGVtKTogdm9pZDtcclxuICBjbGVhckVsZW1lbnRzKCk6IHZvaWQ7XHJcbiAgc2V0QXZhaWxhYmxlQ29sdW1ucyhjb2x1bW5zKTogYW55O1xyXG4gIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGg/KTogYW55O1xyXG4gIHNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGNhbGNDb250YWluZXJIZWlnaHQoKTogYW55O1xyXG4gIGdldFRpbGVCeU5vZGUobm9kZSk6IGFueTtcclxuICBnZXRUaWxlQnlDb29yZGluYXRlcyhjb29yZHMsIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGdldFRpbGVJbmRleCh0aWxlKTogYW55O1xyXG4gIHN3YXBUaWxlcyhtb3ZlZFRpbGUsIGJlZm9yZVRpbGUpOiBhbnk7XHJcbiAgcmVtb3ZlVGlsZShyZW1vdmVUaWxlKTogYW55O1xyXG4gIHVwZGF0ZVRpbGVPcHRpb25zKG9wdHMpOiBhbnk7XHJcbn1cclxuXHJcbmxldCBNT0JJTEVfTEFZT1VUX0NPTFVNTlMgPSAyO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRpbGVzR3JpZFNlcnZpY2UgaW1wbGVtZW50cyBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgcHVibGljIHRpbGVzOiBhbnk7XHJcbiAgcHVibGljIG9wdHM6IGFueTtcclxuICBwdWJsaWMgY29sdW1uczogYW55O1xyXG4gIHB1YmxpYyBlbGVtOiBhbnk7XHJcbiAgcHVibGljIGdyaWRDZWxsczogYW55ID0gW107XHJcbiAgcHVibGljIGlubGluZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc01vYmlsZUxheW91dDogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pIHtcclxuICAgIHRoaXMudGlsZXMgPSB0aWxlcztcclxuICAgIHRoaXMub3B0cyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLmNvbHVtbnMgPSBjb2x1bW5zIHx8IDA7IC8vIGF2YWlsYWJsZSBjb2x1bW5zIGluIGEgcm93XHJcbiAgICB0aGlzLmVsZW0gPSBlbGVtO1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMgPSBbXTtcclxuICAgIHRoaXMuaW5saW5lID0gb3B0aW9ucy5pbmxpbmUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmlzTW9iaWxlTGF5b3V0ID0gY29sdW1ucyA9PT0gTU9CSUxFX0xBWU9VVF9DT0xVTU5TO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZFRpbGUodGlsZSk6IGFueSB7XHJcbiAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XHJcbiAgICBpZiAodGhpcy50aWxlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdGhpcy5nZW5lcmF0ZUdyaWQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbEJ5UG9zaXRpb24ocm93LCBjb2wpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZENlbGxzW3Jvd11bY29sXTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbHMocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnkge1xyXG4gICAgaWYgKHRoaXMuaXNNb2JpbGVMYXlvdXQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXZhaWxhYmxlQ2VsbHNNb2JpbGUocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55IHtcclxuICAgIGxldCBsZWZ0Q29ybmVyQ2VsbDtcclxuICAgIGxldCByaWdodENvcm5lckNlbGw7XHJcbiAgICBsZXQgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuICAgIGxldCBiYXNpY1JvdyA9IHRoaXMuZ2V0QmFzaWNSb3cocHJldkNlbGwpO1xyXG5cclxuICAgIC8vIFNtYWxsIHRpbGVcclxuICAgIGlmIChjb2xTcGFuID09PSAxICYmIHJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgbGV0IGdyaWRDb3B5ID0gdGhpcy5ncmlkQ2VsbHMuc2xpY2UoKTtcclxuXHJcbiAgICAgIGlmICghcHJldkNlbGwpIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IGdyaWRDb3B5WzBdWzBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdywgYmFzaWNDb2wsIHRoaXMuY29sdW1ucyk7XHJcblxyXG4gICAgICAgIGlmICghbGVmdENvcm5lckNlbGwpIHtcclxuICAgICAgICAgIGxldCByb3dTaGlmdCA9IHRoaXMuaXNNb2JpbGVMYXlvdXQgPyAxIDogMjtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdyArIHJvd1NoaWZ0LCAwLCB0aGlzLmNvbHVtbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1lZGl1bSB0aWxlXHJcbiAgICBpZiAoY29sU3BhbiA9PT0gMiAmJiByb3dTcGFuID09PSAxKSB7XHJcbiAgICAgIGxldCBwcmV2VGlsZVNpemUgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5lbGVtLnNpemUgfHwgbnVsbDtcclxuXHJcbiAgICAgIGlmICghcHJldlRpbGVTaXplKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMikge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDIgPiAwKSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAocHJldlRpbGVTaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldlRpbGVTaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAocHJldkNlbGwucm93ICUgMiA9PT0gMCkge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgLSAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMSAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuaXNDZWxsRnJlZShiYXNpY1JvdywgYmFzaWNDb2wgKyAxKSkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJpZyB0aWxlXHJcbiAgICBpZiAoIXByZXZDZWxsICYmIHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sICsgMSk7XHJcbiAgICB9IGVsc2UgaWYgKHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBpZiAodGhpcy5jb2x1bW5zIC0gYmFzaWNDb2wgLSAyID4gMCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ2VsbEZyZWUoYmFzaWNSb3csIGJhc2ljQ29sICsgMSkpIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgKyAzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDMsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueSB7XHJcbiAgICBsZXQgY2VsbDtcclxuICAgIGxldCBjb2w7XHJcbiAgICBsZXQgcm93O1xyXG5cclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIC8vIG1vYmlsZSBsYXlvdXRcclxuICAgICAgZm9yIChjb2wgPSBiYXNpY0NvbDsgY29sIDwgY29sdW1uczsgY29sKyspIHtcclxuICAgICAgICBpZiAoIXNyY1tiYXNpY1Jvd11bY29sXS5lbGVtKSB7XHJcbiAgICAgICAgICBjZWxsID0gc3JjW2Jhc2ljUm93XVtjb2xdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gY2VsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZXNrdG9wXHJcbiAgICBmb3IgKGNvbCA9IGJhc2ljQ29sOyBjb2wgPCBjb2x1bW5zOyBjb2wrKykge1xyXG4gICAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IDI7IHJvdysrKSB7XHJcbiAgICAgICAgaWYgKCFzcmNbcm93ICsgYmFzaWNSb3ddW2NvbF0uZWxlbSkge1xyXG4gICAgICAgICAgY2VsbCA9IHNyY1tyb3cgKyBiYXNpY1Jvd11bY29sXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNlbGwpIHtcclxuICAgICAgICByZXR1cm4gY2VsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueSB7XHJcbiAgICBsZXQgbGVmdENvcm5lckNlbGw7XHJcbiAgICBsZXQgcmlnaHRDb3JuZXJDZWxsO1xyXG4gICAgbGV0IGJhc2ljUm93ID0gdGhpcy5nZXRCYXNpY1JvdyhwcmV2Q2VsbCk7XHJcbiAgICBsZXQgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuXHJcblxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDEgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBsZXQgZ3JpZENvcHkgPSB0aGlzLmdyaWRDZWxscy5zbGljZSgpO1xyXG5cclxuICAgICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gZ3JpZENvcHlbMF1bMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93LCBiYXNpY0NvbCwgdGhpcy5jb2x1bW5zKTtcclxuXHJcbiAgICAgICAgaWYgKCFsZWZ0Q29ybmVyQ2VsbCkge1xyXG4gICAgICAgICAgbGV0IHJvd1NoaWZ0ID0gdGhpcy5pc01vYmlsZUxheW91dCA/IDEgOiAyO1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93ICsgcm93U2hpZnQsIDAsIHRoaXMuY29sdW1ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIDApO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgcm93U3BhbiAtIDEsIDEpO1xyXG4gICAgfSBlbHNlIGlmIChjb2xTcGFuID09PSAyKSB7XHJcbiAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIDApO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgcm93U3BhbiwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QmFzaWNSb3cocHJldkNlbGwpOiBhbnkge1xyXG4gICAgbGV0IGJhc2ljUm93O1xyXG5cclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIGlmIChwcmV2Q2VsbCkge1xyXG4gICAgICAgIGJhc2ljUm93ID0gcHJldkNlbGwgJiYgcHJldkNlbGwucm93IHx8IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocHJldkNlbGwpIHtcclxuICAgICAgICBiYXNpY1JvdyA9IHByZXZDZWxsLnJvdyAlIDIgPT09IDAgPyBwcmV2Q2VsbC5yb3cgOiBwcmV2Q2VsbC5yb3cgLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2ljUm93ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBiYXNpY1JvdztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgaXNDZWxsRnJlZShyb3csIGNvbCk6IGFueSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZ3JpZENlbGxzW3Jvd11bY29sXS5lbGVtO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsSW5kZXgoc3JjQ2VsbCk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgaW5kZXg7XHJcblxyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xyXG4gICAgICBpbmRleCA9IF8uZmluZEluZGV4KHNlbGYuZ3JpZENlbGxzW3Jvd0luZGV4XSwgKGNlbGwpID0+IHtcclxuICAgICAgICByZXR1cm4gY2VsbCA9PT0gc3JjQ2VsbDtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gaW5kZXggIT09IC0xID8gaW5kZXggOiAwO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyByZXNlcnZlQ2VsbHMoc3RhcnQsIGVuZCwgZWxlbSkge1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgIHJvdy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgaWYgKGNlbGwucm93ID49IHN0YXJ0LnJvdyAmJiBjZWxsLnJvdyA8PSBlbmQucm93ICYmXHJcbiAgICAgICAgICBjZWxsLmNvbCA+PSBzdGFydC5jb2wgJiYgY2VsbC5jb2wgPD0gZW5kLmNvbCkge1xyXG4gICAgICAgICAgY2VsbC5lbGVtID0gZWxlbTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNsZWFyRWxlbWVudHMoKSB7XHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgcm93LmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICB0aWxlLmVsZW0gPSBudWxsO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRBdmFpbGFibGVDb2x1bW5zKGNvbHVtbnMpOiBhbnkge1xyXG4gICAgdGhpcy5pc01vYmlsZUxheW91dCA9IGNvbHVtbnMgPT09IE1PQklMRV9MQVlPVVRfQ09MVU1OUztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnM7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGg/KTogYW55IHtcclxuICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgIGxldCBjb2xzSW5Sb3cgPSAwO1xyXG4gICAgbGV0IHJvd3MgPSAwO1xyXG4gICAgbGV0IHRpbGVXaWR0aCA9IHNpbmdsZVRpbGVXaWR0aCB8fCB0aGlzLm9wdHMudGlsZVdpZHRoO1xyXG4gICAgbGV0IG9mZnNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5waXAtZHJhZ2dhYmxlLWdyb3VwLXRpdGxlJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgZ3JpZEluUm93ID0gW107XHJcblxyXG4gICAgdGhpcy5ncmlkQ2VsbHMgPSBbXTtcclxuXHJcbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUsIGluZGV4LCBzcmNUaWxlcykgPT4ge1xyXG4gICAgICBsZXQgdGlsZVNpemUgPSB0aWxlLmdldFNpemUoKTtcclxuXHJcbiAgICAgIGdlbmVyYXRlQ2VsbHModGlsZVNpemUuY29sU3Bhbik7XHJcblxyXG4gICAgICBpZiAoc3JjVGlsZXMubGVuZ3RoID09PSBpbmRleCArIDEpIHtcclxuICAgICAgICBpZiAoY29sc0luUm93IDwgc2VsZi5jb2x1bW5zKSB7XHJcbiAgICAgICAgICBnZW5lcmF0ZUNlbGxzKHNlbGYuY29sdW1ucyAtIGNvbHNJblJvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBtb3JlIGNlbGxzIGZvciBleHRlbmRzIHRpbGUgc2l6ZSB0byBiaWdcclxuICAgICAgICBpZiAoc2VsZi50aWxlcy5sZW5ndGggKiAyID4gc2VsZi5ncmlkQ2VsbHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBBcnJheS5hcHBseShudWxsLCBBcnJheShzZWxmLnRpbGVzLmxlbmd0aCAqIDIgLSBzZWxmLmdyaWRDZWxscy5sZW5ndGgpKS5mb3JFYWNoKCgpID0+IHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVDZWxscyhzZWxmLmNvbHVtbnMpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNlbGxzKG5ld0NlbGxDb3VudCkge1xyXG4gICAgICAgIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KG5ld0NlbGxDb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHNlbGYuY29sdW1ucyA8IGNvbHNJblJvdyArIDEpIHtcclxuICAgICAgICAgICAgcm93cysrO1xyXG4gICAgICAgICAgICBjb2xzSW5Sb3cgPSAwO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5ncmlkQ2VsbHMucHVzaChncmlkSW5Sb3cpO1xyXG4gICAgICAgICAgICBncmlkSW5Sb3cgPSBbXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsZXQgdG9wID0gcm93cyAqIHNlbGYub3B0cy50aWxlSGVpZ2h0ICsgKHJvd3MgPyByb3dzICogc2VsZi5vcHRzLmd1dHRlciA6IDApICsgb2Zmc2V0LmhlaWdodDtcclxuICAgICAgICAgIGxldCBsZWZ0ID0gY29sc0luUm93ICogdGlsZVdpZHRoICsgKGNvbHNJblJvdyA/IGNvbHNJblJvdyAqIHNlbGYub3B0cy5ndXR0ZXIgOiAwKTtcclxuXHJcbiAgICAgICAgICAvLyBEZXNjcmliZSBncmlkIGNlbGwgc2l6ZSB0aHJvdWdoIGJsb2NrIGNvcm5lcnMgY29vcmRpbmF0ZXNcclxuICAgICAgICAgIGdyaWRJblJvdy5wdXNoKHtcclxuICAgICAgICAgICAgdG9wOiB0b3AsXHJcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXHJcbiAgICAgICAgICAgIGJvdHRvbTogdG9wICsgc2VsZi5vcHRzLnRpbGVIZWlnaHQsXHJcbiAgICAgICAgICAgIHJpZ2h0OiBsZWZ0ICsgdGlsZVdpZHRoLFxyXG4gICAgICAgICAgICByb3c6IHJvd3MsXHJcbiAgICAgICAgICAgIGNvbDogY29sc0luUm93XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBjb2xzSW5Sb3crKztcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRUaWxlc0RpbWVuc2lvbnMob25seVBvc2l0aW9uLCBkcmFnZ2VkVGlsZSk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgY3VyckluZGV4ID0gMDtcclxuICAgIGxldCBwcmV2Q2VsbDtcclxuXHJcbiAgICBpZiAob25seVBvc2l0aW9uKSB7XHJcbiAgICAgIHNlbGYuY2xlYXJFbGVtZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICBsZXQgdGlsZVNpemUgPSB0aWxlLmdldFNpemUoKTtcclxuICAgICAgbGV0IHN0YXJ0Q2VsbDtcclxuICAgICAgbGV0IHdpZHRoO1xyXG4gICAgICBsZXQgaGVpZ2h0O1xyXG4gICAgICBsZXQgY2VsbHM7XHJcblxyXG4gICAgICB0aWxlLnVwZGF0ZUVsZW0oJy5waXAtZHJhZ2dhYmxlLXRpbGUnKTtcclxuICAgICAgaWYgKHRpbGVTaXplLmNvbFNwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAocHJldkNlbGwgJiYgcHJldkNlbGwuZWxlbS5zaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldkNlbGwuZWxlbS5zaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICAgIHN0YXJ0Q2VsbCA9IHNlbGYuZ2V0Q2VsbHMoc2VsZi5nZXRDZWxsQnlQb3NpdGlvbihwcmV2Q2VsbC5yb3csIHByZXZDZWxsLmNvbCAtIDEpLCAxLCAxKS5zdGFydDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhcnRDZWxsID0gc2VsZi5nZXRDZWxscyhwcmV2Q2VsbCwgMSwgMSkuc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIHdpZHRoID0gc3RhcnRDZWxsLnJpZ2h0IC0gc3RhcnRDZWxsLmxlZnQ7XHJcbiAgICAgICAgICBoZWlnaHQgPSBzdGFydENlbGwuYm90dG9tIC0gc3RhcnRDZWxsLnRvcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZXZDZWxsID0gc3RhcnRDZWxsO1xyXG5cclxuICAgICAgICBzZWxmLnJlc2VydmVDZWxscyhzdGFydENlbGwsIHN0YXJ0Q2VsbCwgdGlsZSk7XHJcblxyXG4gICAgICAgIGN1cnJJbmRleCsrO1xyXG4gICAgICB9IGVsc2UgaWYgKHRpbGVTaXplLmNvbFNwYW4gPT09IDIpIHtcclxuICAgICAgICBjZWxscyA9IHNlbGYuZ2V0Q2VsbHMocHJldkNlbGwsIHRpbGVTaXplLnJvd1NwYW4sIHRpbGVTaXplLmNvbFNwYW4pO1xyXG4gICAgICAgIHN0YXJ0Q2VsbCA9IGNlbGxzLnN0YXJ0O1xyXG5cclxuICAgICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgd2lkdGggPSBjZWxscy5lbmQucmlnaHQgLSBjZWxscy5zdGFydC5sZWZ0O1xyXG4gICAgICAgICAgaGVpZ2h0ID0gY2VsbHMuZW5kLmJvdHRvbSAtIGNlbGxzLnN0YXJ0LnRvcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZXZDZWxsID0gY2VsbHMuZW5kO1xyXG5cclxuICAgICAgICBzZWxmLnJlc2VydmVDZWxscyhjZWxscy5zdGFydCwgY2VsbHMuZW5kLCB0aWxlKTtcclxuXHJcbiAgICAgICAgY3VyckluZGV4ICs9IDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbmRlciBwcmV2aWV3XHJcbiAgICAgIC8vIHdoaWxlIHRpbGVzIGZyb20gZ3JvdXAgaXMgZHJhZ2dlZFxyXG4gICAgICBpZiAoZHJhZ2dlZFRpbGUgPT09IHRpbGUpIHtcclxuICAgICAgICB0aWxlLnNldFByZXZpZXdQb3NpdGlvbih7XHJcbiAgICAgICAgICBsZWZ0OiBzdGFydENlbGwubGVmdCxcclxuICAgICAgICAgIHRvcDogc3RhcnRDZWxsLnRvcFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgdGlsZS5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aWxlLnNldFBvc2l0aW9uKHN0YXJ0Q2VsbC5sZWZ0LCBzdGFydENlbGwudG9wKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjYWxjQ29udGFpbmVySGVpZ2h0KCk6IGFueSB7XHJcbiAgICBsZXQgbWF4SGVpZ2h0U2l6ZSwgbWF4V2lkdGhTaXplO1xyXG5cclxuICAgIGlmICghdGhpcy50aWxlcy5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgbWF4SGVpZ2h0U2l6ZSA9IF8ubWF4QnkodGhpcy50aWxlcywgKHRpbGUpID0+IHtcclxuICAgICAgbGV0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgIHJldHVybiB0aWxlU2l6ZS50b3AgKyB0aWxlU2l6ZS5oZWlnaHQ7XHJcbiAgICB9KVsnZ2V0U2l6ZSddKCk7XHJcblxyXG4gICAgdGhpcy5lbGVtLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodFNpemUudG9wICsgbWF4SGVpZ2h0U2l6ZS5oZWlnaHQgKyAncHgnO1xyXG5cclxuICAgIGlmICh0aGlzLmlubGluZSkge1xyXG4gICAgICBtYXhXaWR0aFNpemUgPSBfLm1heEJ5KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgICAgbGV0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgICAgcmV0dXJuIHRpbGVTaXplLmxlZnQgKyB0aWxlU2l6ZS53aWR0aDtcclxuICAgICAgfSlbJ2dldFNpemUnXSgpO1xyXG5cclxuICAgICAgdGhpcy5lbGVtLnN0eWxlLndpZHRoID0gbWF4V2lkdGhTaXplLmxlZnQgKyBtYXhXaWR0aFNpemUud2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlQnlOb2RlKG5vZGUpOiBhbnkge1xyXG4gICAgbGV0IGZvdW5kVGlsZSA9IHRoaXMudGlsZXMuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgIHJldHVybiBub2RlID09PSB0aWxlLmdldEVsZW0oKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBmb3VuZFRpbGUubGVuZ3RoID8gZm91bmRUaWxlWzBdIDogbnVsbDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0VGlsZUJ5Q29vcmRpbmF0ZXMoY29vcmRzLCBkcmFnZ2VkVGlsZSk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy50aWxlc1xyXG4gICAgICAuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgbGV0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aWxlICE9PSBkcmFnZ2VkVGlsZSAmJlxyXG4gICAgICAgICAgdGlsZVNpemUubGVmdCA8PSBjb29yZHMubGVmdCAmJiBjb29yZHMubGVmdCA8PSAodGlsZVNpemUubGVmdCArIHRpbGVTaXplLndpZHRoKSAmJlxyXG4gICAgICAgICAgdGlsZVNpemUudG9wIDw9IGNvb3Jkcy50b3AgJiYgY29vcmRzLnRvcCA8PSAodGlsZVNpemUudG9wICsgdGlsZVNpemUuaGVpZ2h0KTtcclxuICAgICAgfSlbMF0gfHwgbnVsbDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0VGlsZUluZGV4KHRpbGUpOiBhbnkge1xyXG4gICAgcmV0dXJuIF8uZmluZEluZGV4KHRoaXMudGlsZXMsIHRpbGUpO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzd2FwVGlsZXMobW92ZWRUaWxlLCBiZWZvcmVUaWxlKTogYW55IHtcclxuICAgIGxldCBtb3ZlZFRpbGVJbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsIG1vdmVkVGlsZSk7XHJcbiAgICBsZXQgYmVmb3JlVGlsZUluZGV4ID0gXy5maW5kSW5kZXgodGhpcy50aWxlcywgYmVmb3JlVGlsZSk7XHJcblxyXG4gICAgdGhpcy50aWxlcy5zcGxpY2UobW92ZWRUaWxlSW5kZXgsIDEpO1xyXG4gICAgdGhpcy50aWxlcy5zcGxpY2UoYmVmb3JlVGlsZUluZGV4LCAwLCBtb3ZlZFRpbGUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyByZW1vdmVUaWxlKHJlbW92ZVRpbGUpOiBhbnkge1xyXG4gICAgbGV0IGRyb3BwZWRUaWxlO1xyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSwgaW5kZXgsIHRpbGVzKSA9PiB7XHJcbiAgICAgIGlmICh0aWxlID09PSByZW1vdmVUaWxlKSB7XHJcbiAgICAgICAgZHJvcHBlZFRpbGUgPSB0aWxlcy5zcGxpY2UoaW5kZXgsIDEpWzBdO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGRyb3BwZWRUaWxlO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVUaWxlT3B0aW9ucyhvcHRzKTogYW55IHtcclxuICAgIGxldCBpbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aWxlWydnZXRPcHRpb25zJ10oKSA9PT0gb3B0cztcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy50aWxlc1tpbmRleF0uc2V0T3B0aW9ucyhvcHRzKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH07XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBEcmFnZ2VkJylcclxuICAuc2VydmljZSgncGlwVGlsZXNHcmlkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSkge1xyXG4gICAgICBsZXQgbmV3R3JpZCA9IG5ldyBUaWxlc0dyaWRTZXJ2aWNlKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdHcmlkO1xyXG4gICAgfVxyXG4gIH0pOyIsImV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldFRlbXBsYXRlU2VydmljZSB7XHJcbiAgICBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55O1xyXG4gICAgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKTogdm9pZDtcclxufVxyXG5cclxuY2xhc3Mgd2lkZ2V0VGVtcGxhdGVTZXJ2aWNlIGltcGxlbWVudHMgSVdpZGdldFRlbXBsYXRlU2VydmljZSB7XHJcbiAgICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICAgIHByaXZhdGUgXyRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZTtcclxuICAgIHByaXZhdGUgXyR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgJGludGVycG9sYXRlOiBhbmd1bGFyLklJbnRlcnBvbGF0ZVNlcnZpY2UsXHJcbiAgICAgICAgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxyXG4gICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuXyRpbnRlcnBvbGF0ZSA9ICRpbnRlcnBvbGF0ZTtcclxuICAgICAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgICAgIHRoaXMuXyR0ZW1wbGF0ZVJlcXVlc3QgPSAkdGVtcGxhdGVSZXF1ZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55IHtcclxuICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgdHlwZVxyXG4gICAgICAgIH0gPSBzb3VyY2U7XHJcbiAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgaWYgKHR5cGUpIHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJwb2xhdGVkID0gdHBsID8gdGhpcy5fJGludGVycG9sYXRlKHRwbCkoc291cmNlKSA6IHRoaXMuXyRpbnRlcnBvbGF0ZSh0ZW1wbGF0ZSkoc291cmNlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmljdENvbXBpbGUgPT0gdHJ1ZSA/XHJcbiAgICAgICAgICAgICAgICAodGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaW50ZXJwb2xhdGVkKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUoaW50ZXJwb2xhdGVkKSkgOlxyXG4gICAgICAgICAgICAgICAgaW50ZXJwb2xhdGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aWxlU2NvcGUgPyB0aGlzLl8kY29tcGlsZSh0ZW1wbGF0ZSkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKHRlbXBsYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0ZW1wbGF0ZVVybCkge1xyXG4gICAgICAgICAgICB0aGlzLl8kdGVtcGxhdGVSZXF1ZXN0KHRlbXBsYXRlVXJsLCBmYWxzZSkudGhlbigoaHRtbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaHRtbCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGh0bWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSkge1xyXG4gICAgICAgIGxldFxyXG4gICAgICAgICAgICBjb250YWluZXJXaWR0aCA9ICRlbGVtZW50LndpZHRoID8gJGVsZW1lbnQud2lkdGgoKSA6ICRlbGVtZW50LmNsaWVudFdpZHRoLCBcclxuICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGVsZW1lbnQuaGVpZ2h0ID8gJGVsZW1lbnQuaGVpZ2h0KCkgOiAkZWxlbWVudC5jbGllbnRIZWlnaHQsXHJcbiAgICAgICAgICAgIGltYWdlV2lkdGggPSAoaW1hZ2VbMF0gPyBpbWFnZVswXS5uYXR1cmFsV2lkdGggOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLndpZHRoLFxyXG4gICAgICAgICAgICBpbWFnZUhlaWdodCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICAgICAgbWFyZ2luID0gMCxcclxuICAgICAgICAgICAgY3NzUGFyYW1zID0ge307XHJcblxyXG4gICAgICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VXaWR0aCAvIGltYWdlSGVpZ2h0ICogY29udGFpbmVySGVpZ2h0IC0gY29udGFpbmVyV2lkdGgpIC8gMik7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgaW1hZ2VXaWR0aCAqIGNvbnRhaW5lckhlaWdodCAvIGltYWdlSGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJyc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VIZWlnaHQgLyBpbWFnZVdpZHRoICogY29udGFpbmVyV2lkdGggLSBjb250YWluZXJIZWlnaHQpIC8gMik7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGNvbnRhaW5lcldpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJChpbWFnZSkuY3NzKGNzc1BhcmFtcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIGltYWdlIGxvYWQgZGlyZWN0aXZlIFRPRE86IHJlbW92ZSB0byBwaXBJbWFnZVV0aWxzXHJcbmZ1bmN0aW9uIEltYWdlTG9hZCgkcGFyc2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnBpcEltYWdlTG9hZCk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYmluZCgnbG9hZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcGUsIHskZXZlbnQ6IGV2ZW50fSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuc2VydmljZSgncGlwV2lkZ2V0VGVtcGxhdGUnLCB3aWRnZXRUZW1wbGF0ZVNlcnZpY2UpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBJbWFnZUxvYWQnLCBJbWFnZUxvYWQpOyIsIigoKSA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGlwV2lkZ2V0JywgW10pO1xyXG59KSgpO1xyXG5cclxuaW1wb3J0ICcuL2NhbGVuZGFyL1dpZGdldENhbGVuZGFyJztcclxuaW1wb3J0ICcuL2V2ZW50L1dpZGdldEV2ZW50JztcclxuaW1wb3J0ICcuL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQgJy4vbWVudS9XaWRnZXRNZW51RGlyZWN0aXZlJztcclxuaW1wb3J0ICcuL25vdGVzL1dpZGdldE5vdGVzJztcclxuaW1wb3J0ICcuL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uJztcclxuaW1wb3J0ICcuL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcyc7XHJcbmltcG9ydCAnLi9waWN0dXJlX3NsaWRlci9XaWRnZXRQaWN0dXJlU2xpZGVyJztcclxuIiwiaW1wb3J0IHsgTWVudVdpZGdldFNlcnZpY2UgfSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHsgSVdpZGdldENvbmZpZ1NlcnZpY2UgfSBmcm9tICcuLi8uLi9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcblxyXG5jbGFzcyBDYWxlbmRhcldpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG5cclxuICBwdWJsaWMgY29sb3I6IHN0cmluZyA9ICdibHVlJztcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwaXBXaWRnZXRNZW51OiBhbnksXHJcbiAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2VcclxuICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgICB0aGlzLl9jb25maWdEaWFsb2cgPSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlO1xyXG5cclxuICAgICAgaWYgKHRoaXNbJ29wdGlvbnMnXSkge1xyXG4gICAgICAgIHRoaXMubWVudSA9IHRoaXNbJ29wdGlvbnMnXVsnbWVudSddID8gXy51bmlvbih0aGlzLm1lbnUsIHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKSA6IHRoaXMubWVudTtcclxuICAgICAgICB0aGlzLm1lbnUucHVzaCh7IHRpdGxlOiAnQ29uZmlndXJhdGUnLCBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgfX0pO1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5kYXRlID0gdGhpc1snb3B0aW9ucyddLmRhdGUgfHwgbmV3IERhdGUoKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Db25maWdDbGljaygpIHtcclxuICAgIHRoaXMuX2NvbmZpZ0RpYWxvZy5zaG93KHtcclxuICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgIHNpemU6IHRoaXNbJ29wdGlvbnMnXS5zaXplLFxyXG4gICAgICBkYXRlOiB0aGlzWydvcHRpb25zJ10uZGF0ZSxcclxuICAgICAgZXh0ZW5zaW9uVXJsOiAnd2lkZ2V0cy9jYWxlbmRhci9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10uY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59XHJcblxyXG4oKCkgPT4ge1xyXG5cclxuICBsZXQgcGlwQ2FsZW5kYXJXaWRnZXQgPSB7XHJcbiAgICAgIGJpbmRpbmdzICAgICAgICA6IHtcclxuICAgICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnLFxyXG4gICAgICB9LFxyXG4gICAgICBjb250cm9sbGVyICAgICAgOiBDYWxlbmRhcldpZGdldENvbnRyb2xsZXIsXHJcbiAgICAgIGNvbnRyb2xsZXJBcyAgICA6ICd3aWRnZXRDdHJsJyxcclxuICAgICAgdGVtcGxhdGVVcmwgICAgIDogJ3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBDYWxlbmRhcldpZGdldCcsIHBpcENhbGVuZGFyV2lkZ2V0KTtcclxuXHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IE1lbnVXaWRnZXRTZXJ2aWNlfSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHsgSVdpZGdldENvbmZpZ1NlcnZpY2UgfSBmcm9tICcuLi8uLi9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcblxyXG5jbGFzcyBFdmVudFdpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF8kZWxlbWVudDogYW55O1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX29sZE9wYWNpdHk6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGNvbG9yOiBzdHJpbmcgPSAnZ3JheSc7XHJcbiAgcHVibGljIG9wYWNpdHk6IG51bWJlciA9IDAuNTc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICRlbGVtZW50OiBhbnksXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG4gICkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuXyRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuXHJcbiAgICBpZiAodGhpc1snb3B0aW9ucyddKSB7XHJcbiAgICAgIGlmICh0aGlzWydvcHRpb25zJ11bJ21lbnUnXSkgdGhpcy5tZW51ID0gXy51bmlvbih0aGlzLm1lbnUsIHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1lbnUucHVzaCh7IHRpdGxlOiAnQ29uZmlndXJhdGUnLCBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICB9fSk7XHJcbiAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgICB0aGlzLm9wYWNpdHkgPSB0aGlzWydvcHRpb25zJ10ub3BhY2l0eSB8fCB0aGlzLm9wYWNpdHk7XHJcblxyXG4gICAgdGhpcy5kcmF3SW1hZ2UoKTtcclxuXHJcbiAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB7IHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTsgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYXdJbWFnZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdJbWFnZSgpIHtcclxuICAgIGlmICh0aGlzWydvcHRpb25zJ10uaW1hZ2UpIHtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMub25JbWFnZUxvYWQodGhpcy5fJGVsZW1lbnQuZmluZCgnaW1nJykpO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgdGhpcy5fb2xkT3BhY2l0eSA9IF8uY2xvbmUodGhpcy5vcGFjaXR5KTtcclxuICAgIHRoaXMuX2NvbmZpZ0RpYWxvZy5zaG93KHtcclxuICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgIHNpemU6IHRoaXNbJ29wdGlvbnMnXS5zaXplIHx8IHtjb2xTcGFuOiAxLCByb3dTcGFuOiAxfSxcclxuICAgICAgZGF0ZTogdGhpc1snb3B0aW9ucyddLmRhdGUsXHJcbiAgICAgIHRpdGxlOiB0aGlzWydvcHRpb25zJ10udGl0bGUsXHJcbiAgICAgIHRleHQ6IHRoaXNbJ29wdGlvbnMnXS50ZXh0LFxyXG4gICAgICBvcGFjaXR5OiB0aGlzLm9wYWNpdHksXHJcbiAgICAgIG9uT3BhY2l0eXRlc3Q6IChvcGFjaXR5KSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgfSxcclxuICAgICAgZXh0ZW5zaW9uVXJsOiAnd2lkZ2V0cy9ldmVudC9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10uY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS50aXRsZSA9IHJlc3VsdC50aXRsZTtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLnRleHQgPSByZXN1bHQudGV4dDtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLm9wYWNpdHkgPSByZXN1bHQub3BhY2l0eTtcclxuICAgIH0sICgpID0+IHtcclxuICAgICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5fb2xkT3BhY2l0eTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkltYWdlTG9hZChpbWFnZSkge1xyXG4gICAgdGhpcy5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLl8kZWxlbWVudC5wYXJlbnQoKSwgaW1hZ2UpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICBpZiAodGhpc1snb3B0aW9ucyddLmltYWdlKSB7XHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuXyRlbGVtZW50LnBhcmVudCgpLCB0aGlzLl8kZWxlbWVudC5maW5kKCdpbWcnKSk7XHJcbiAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBMYXRlciByZXBsYWNlIGJ5IHBpcEltYWdlVXRpbHMgc2V2aWNlJ3MgZnVuY3Rpb25cclxuICBwcml2YXRlIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSkge1xyXG4gICAgbGV0XHJcbiAgICAgIGNvbnRhaW5lcldpZHRoID0gJGVsZW1lbnQud2lkdGggPyAkZWxlbWVudC53aWR0aCgpIDogJGVsZW1lbnQuY2xpZW50V2lkdGgsIC8vIHx8IDgwLFxyXG4gICAgICBjb250YWluZXJIZWlnaHQgPSAkZWxlbWVudC5oZWlnaHQgPyAkZWxlbWVudC5oZWlnaHQoKSA6ICRlbGVtZW50LmNsaWVudEhlaWdodCwgLy8gfHwgODAsXHJcbiAgICAgIGltYWdlV2lkdGggPSBpbWFnZVswXS5uYXR1cmFsV2lkdGggfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgIGltYWdlSGVpZ2h0ID0gaW1hZ2VbMF0ubmF0dXJhbEhlaWdodCB8fCBpbWFnZS5oZWlnaHQsXHJcbiAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgIGNzc1BhcmFtcyA9IHt9O1xyXG5cclxuICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgbWFyZ2luID0gLSgoaW1hZ2VXaWR0aCAvIGltYWdlSGVpZ2h0ICogY29udGFpbmVySGVpZ2h0IC0gY29udGFpbmVyV2lkdGgpIC8gMik7XHJcbiAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgaW1hZ2VXaWR0aCAqIGNvbnRhaW5lckhlaWdodCAvIGltYWdlSGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJyc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtYXJnaW4gPSAtKChpbWFnZUhlaWdodCAvIGltYWdlV2lkdGggKiBjb250YWluZXJXaWR0aCAtIGNvbnRhaW5lckhlaWdodCkgLyAyKTtcclxuICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgIGNzc1BhcmFtc1snaGVpZ2h0J10gPSAnJyArIGltYWdlSGVpZ2h0ICogY29udGFpbmVyV2lkdGggLyBpbWFnZVdpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgY29udGFpbmVyV2lkdGggKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgaW1hZ2UuY3NzKGNzc1BhcmFtcyk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuKCgpID0+IHtcclxuICBsZXQgcGlwRXZlbnRXaWRnZXQgPSAge1xyXG4gICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgICAgfSxcclxuICAgICAgY29udHJvbGxlcjogRXZlbnRXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgICBjb250cm9sbGVyQXM6ICd3aWRnZXRDdHJsJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL2V2ZW50L1dpZGdldEV2ZW50Lmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRXZlbnRXaWRnZXQnLCBwaXBFdmVudFdpZGdldCk7XHJcbn0pKCk7IiwiKCgpID0+IHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBNZW51V2lkZ2V0JywgcGlwTWVudVdpZGdldCk7XHJcblxyXG4gIGZ1bmN0aW9uIHBpcE1lbnVXaWRnZXQoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdCAgICAgICAgOiAnRUEnLFxyXG4gICAgICB0ZW1wbGF0ZVVybCAgICAgOiAnd2lkZ2V0cy9tZW51L1dpZGdldE1lbnUuaHRtbCdcclxuICAgIH07XHJcbiAgfVxyXG59KSgpO1xyXG4iLCJcclxuZXhwb3J0IGNsYXNzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwdWJsaWMgbWVudTogYW55ID0gW1xyXG4gICAge1xyXG4gICAgICB0aXRsZTogJ0NoYW5nZSBTaXplJyxcclxuICAgICAgYWN0aW9uOiBhbmd1bGFyLm5vb3AsXHJcbiAgICAgIHN1Ym1lbnU6IFt7XHJcbiAgICAgICAgICB0aXRsZTogJzEgeCAxJyxcclxuICAgICAgICAgIGFjdGlvbjogJ2NoYW5nZVNpemUnLFxyXG4gICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgIHNpemVYOiAxLFxyXG4gICAgICAgICAgICBzaXplWTogMVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGl0bGU6ICcyIHggMScsXHJcbiAgICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICBzaXplWDogMixcclxuICAgICAgICAgICAgc2l6ZVk6IDFcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnMiB4IDInLFxyXG4gICAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgc2l6ZVg6IDIsXHJcbiAgICAgICAgICAgIHNpemVZOiAyXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcIm5nSW5qZWN0XCI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FsbEFjdGlvbihhY3Rpb25OYW1lLCBwYXJhbXMsIGl0ZW0pIHtcclxuICAgIGlmICh0aGlzW2FjdGlvbk5hbWVdKSB7XHJcbiAgICAgIHRoaXNbYWN0aW9uTmFtZV0uY2FsbCh0aGlzLCBwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpdGVtWydjbGljayddKSB7XHJcbiAgICAgIGl0ZW1bJ2NsaWNrJ10uY2FsbChpdGVtLCBwYXJhbXMsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcbiAgfTtcclxufVxyXG5cclxuY2xhc3MgTWVudVdpZGdldFByb3ZpZGVyIHtcclxuICAgIHByaXZhdGUgX3NlcnZpY2U6IE1lbnVXaWRnZXRTZXJ2aWNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgfVxyXG5cclxuICAgcHVibGljICRnZXQoKSB7XHJcbiAgICAgICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fc2VydmljZSA9PSBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE1lbnVXaWRnZXRTZXJ2aWNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlcnZpY2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLnByb3ZpZGVyKCdwaXBXaWRnZXRNZW51JywgTWVudVdpZGdldFByb3ZpZGVyKTtcclxufSkoKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBNZW51V2lkZ2V0U2VydmljZSB9IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnU2VydmljZSB9IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbmNsYXNzIE5vdGVzV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgX2NvbmZpZ0RpYWxvZzogSVdpZGdldENvbmZpZ1NlcnZpY2U7XHJcblxyXG4gIHB1YmxpYyBjb2xvcjogc3RyaW5nID0gJ29yYW5nZSc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMuXyRzY29wZSA9ICRzY29wZTtcclxuICAgICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuXHJcbiAgICAgIGlmICh0aGlzWydvcHRpb25zJ10pIHtcclxuICAgICAgICB0aGlzLm1lbnUgPSB0aGlzWydvcHRpb25zJ11bJ21lbnUnXSA/IF8udW5pb24odGhpcy5tZW51LCB0aGlzWydvcHRpb25zJ11bJ21lbnUnXSkgOiB0aGlzLm1lbnU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHsgdGl0bGU6ICdDb25maWd1cmF0ZScsIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgfX0pO1xyXG4gICAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICB0aGlzLl9jb25maWdEaWFsb2cuc2hvdyh7XHJcbiAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLWNhbGVuZGFyLWNvbmZpZycsXHJcbiAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICBzaXplOiB0aGlzWydvcHRpb25zJ10uc2l6ZSxcclxuICAgICAgdGl0bGU6IHRoaXNbJ29wdGlvbnMnXS50aXRsZSxcclxuICAgICAgdGV4dDogdGhpc1snb3B0aW9ucyddLnRleHQsXHJcbiAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvbm90ZXMvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgdGhpcy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10udGV4dCA9IHJlc3VsdC50ZXh0O1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10udGl0bGUgPSByZXN1bHQudGl0bGU7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbiAgbGV0IHBpcE5vdGVzV2lkZ2V0ID0ge1xyXG4gICAgICBiaW5kaW5ncyAgICAgICAgICAgOiB7XHJcbiAgICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgICB9LFxyXG4gICAgICBjb250cm9sbGVyICAgICAgOiBOb3Rlc1dpZGdldENvbnRyb2xsZXIsXHJcbiAgICAgIGNvbnRyb2xsZXJBcyAgICA6ICd3aWRnZXRDdHJsJyxcclxuICAgICAgdGVtcGxhdGVVcmwgICAgIDogJ3dpZGdldHMvbm90ZXMvV2lkZ2V0Tm90ZXMuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBOb3Rlc1dpZGdldCcsIHBpcE5vdGVzV2lkZ2V0KTtcclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5cclxuY2xhc3MgUGljdHVyZVNsaWRlckNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX3dpZGdldFV0aWxpdHk6IElXaWRnZXRUZW1wbGF0ZVNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBfJGVsZW1lbnQ6IGFueTtcclxuICBwcml2YXRlIF8kdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2U7XHJcblxyXG4gIHB1YmxpYyBhbmltYXRpb25UeXBlOiBzdHJpbmcgPSAnZmFkaW5nJztcclxuICBwdWJsaWMgYW5pbWF0aW9uSW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICRlbGVtZW50OiBhbnksXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZSxcclxuICAgIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuICAgIHRoaXMuX3dpZGdldFV0aWxpdHkgPSBwaXBXaWRnZXRUZW1wbGF0ZTtcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgaWYgKHRoaXNbJ29wdGlvbnMnXSkge1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblR5cGUgPSB0aGlzWydvcHRpb25zJ10uYW5pbWF0aW9uVHlwZSB8fCB0aGlzLmFuaW1hdGlvblR5cGU7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uSW50ZXJ2YWwgPSB0aGlzWydvcHRpb25zJ10uYW5pbWF0aW9uSW50ZXJ2YWwgfHwgdGhpcy5hbmltYXRpb25JbnRlcnZhbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkltYWdlTG9hZCgkZXZlbnQpIHtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5fd2lkZ2V0VXRpbGl0eS5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLl8kZWxlbWVudC5wYXJlbnQoKSwgJGV2ZW50LnRhcmdldCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcblxyXG4gICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBfLmVhY2godGhpcy5fJGVsZW1lbnQuZmluZCgnaW1nJyksIChpbWFnZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuX3dpZGdldFV0aWxpdHkuc2V0SW1hZ2VNYXJnaW5DU1ModGhpcy5fJGVsZW1lbnQucGFyZW50KCksIGltYWdlKTtcclxuICAgICAgfSk7XHJcbiAgICB9LCA1MDApO1xyXG4gIH1cclxufVxyXG5cclxubGV0IHBpcFBpY3R1cmVTbGlkZXJXaWRnZXQgPSB7XHJcbiAgYmluZGluZ3M6IHtcclxuICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucycsXHJcbiAgICBpbmRleDogJz0nLFxyXG4gICAgZ3JvdXA6ICc9J1xyXG4gIH0sXHJcbiAgY29udHJvbGxlcjogUGljdHVyZVNsaWRlckNvbnRyb2xsZXIsXHJcbiAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIuaHRtbCcsXHJcbiAgY29udHJvbGxlckFzOiAnd2lkZ2V0Q3RybCdcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgLmNvbXBvbmVudCgncGlwUGljdHVyZVNsaWRlcldpZGdldCcsIHBpcFBpY3R1cmVTbGlkZXJXaWRnZXQpOyIsImltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbmNsYXNzIFBvc2l0aW9uV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX2xvY2F0aW9uRGlhbG9nOiBhbnk7XHJcblxyXG4gIHB1YmxpYyBzaG93UG9zaXRpb246IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHBpcFdpZGdldE1lbnU6IGFueSxcclxuICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAkZWxlbWVudDogYW55LFxyXG4gICAgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2UsXHJcbiAgICBwaXBMb2NhdGlvbkVkaXREaWFsb2c6IGFueSxcclxuICApIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuICAgIHRoaXMuX2xvY2F0aW9uRGlhbG9nID0gcGlwTG9jYXRpb25FZGl0RGlhbG9nO1xyXG5cclxuICAgIGlmICh0aGlzWydvcHRpb25zJ10pIHtcclxuICAgICAgaWYgKHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKSB0aGlzLm1lbnUgPSBfLnVuaW9uKHRoaXMubWVudSwgdGhpc1snb3B0aW9ucyddWydtZW51J10pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICB0aXRsZTogJ0NoYW5nZSBsb2NhdGlvbicsXHJcbiAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGVuTG9jYXRpb25FZGl0RGlhbG9nKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiA9IHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiB8fCB0aGlzWydvcHRpb25zJ10ucG9zaXRpb247XHJcblxyXG4gICAgJHNjb3BlLiR3YXRjaCgnd2lkZ2V0Q3RybC5vcHRpb25zLmxvY2F0aW9uJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlRHJhd1Bvc2l0aW9uKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB7IHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTsgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICBpZiAobmV3VmFsID09IHRydWUpIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nLnNob3coe1xyXG4gICAgICBkaWFsb2dDbGFzczogJ3BpcC1wb3NpdGlvbi1jb25maWcnLFxyXG4gICAgICBzaXplOiB0aGlzWydvcHRpb25zJ10uc2l6ZSxcclxuICAgICAgbG9jYXRpb25OYW1lOiB0aGlzWydvcHRpb25zJ10ubG9jYXRpb25OYW1lLFxyXG4gICAgICBoaWRlQ29sb3JzOiB0cnVlLFxyXG4gICAgICBleHRlbnNpb25Vcmw6ICd3aWRnZXRzL3Bvc2l0aW9uL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbk5hbWUgPSByZXN1bHQubG9jYXRpb25OYW1lO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvcGVuTG9jYXRpb25FZGl0RGlhbG9nKCkge1xyXG4gICAgdGhpcy5fbG9jYXRpb25EaWFsb2cuc2hvdyh7XHJcbiAgICAgIGxvY2F0aW9uTmFtZTogdGhpc1snb3B0aW9ucyddLmxvY2F0aW9uTmFtZSxcclxuICAgICAgbG9jYXRpb25Qb3M6IHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvblxyXG4gICAgfSwgKG5ld1Bvc2l0aW9uKSA9PiB7XHJcbiAgICAgIGlmIChuZXdQb3NpdGlvbikge1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9uO1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbk5hbWUgPSBuZXdQb3NpdGlvbi5sb2NhdGlvTmFtZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlRHJhd1Bvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5zaG93UG9zaXRpb24gPSBmYWxzZTtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSB0cnVlO1xyXG4gICAgfSwgNTApO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmxldCBwaXBQb3NpdGlvbldpZGdldCA9IHtcclxuICBiaW5kaW5nczoge1xyXG4gICAgb3B0aW9uczogJz1waXBPcHRpb25zJyxcclxuICAgIGluZGV4OiAnPScsXHJcbiAgICBncm91cDogJz0nXHJcbiAgfSxcclxuICBjb250cm9sbGVyOiBQb3NpdGlvbldpZGdldENvbnRyb2xsZXIsXHJcbiAgY29udHJvbGxlckFzOiAnd2lkZ2V0Q3RybCcsXHJcbiAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uLmh0bWwnXHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gIC5jb21wb25lbnQoJ3BpcFBvc2l0aW9uV2lkZ2V0JywgcGlwUG9zaXRpb25XaWRnZXQpOyIsImltcG9ydCB7IE1lbnVXaWRnZXRTZXJ2aWNlIH0gZnJvbSAnLi4vbWVudS9XaWRnZXRNZW51U2VydmljZSc7XHJcblxyXG5sZXQgU01BTExfQ0hBUlQ6IG51bWJlciA9IDcwO1xyXG5sZXQgQklHX0NIQVJUOiBudW1iZXIgPSAyNTA7XHJcblxyXG5jbGFzcyBTdGF0aXN0aWNzV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuXHJcbiAgcHVibGljIHJlc2V0OiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGNoYXJ0U2l6ZTogbnVtYmVyID0gU01BTExfQ0hBUlQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZVxyXG4gICkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0ID0gJHRpbWVvdXQ7XHJcblxyXG4gICAgICBpZiAodGhpc1snb3B0aW9ucyddKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpc1snb3B0aW9ucyddWydtZW51J10gPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpc1snb3B0aW9ucyddWydtZW51J10pIDogdGhpcy5tZW51O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldENoYXJ0U2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICB0aGlzLnJlc2V0ID0gdHJ1ZTtcclxuICAgIHRoaXMuc2V0Q2hhcnRTaXplKCk7XHJcbiAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzZXQgPSBmYWxzZTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldENoYXJ0U2l6ZSgpIHtcclxuICAgIHRoaXMuY2hhcnRTaXplID0gdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9PSAyICYmIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPT0gMiA/IEJJR19DSEFSVCA6IFNNQUxMX0NIQVJUO1xyXG4gIH1cclxufVxyXG5cclxuKCgpID0+IHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBwaXBTdGF0aXN0aWNzV2lkZ2V0ID0ge1xyXG4gICAgICBiaW5kaW5ncyAgICAgICAgICAgOiB7XHJcbiAgICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgICB9LFxyXG4gICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICBjb250cm9sbGVyICAgICAgOiBTdGF0aXN0aWNzV2lkZ2V0Q29udHJvbGxlcixcclxuICAgICAgY29udHJvbGxlckFzICAgIDogJ3dpZGdldEN0cmwnLFxyXG4gICAgICB0ZW1wbGF0ZVVybCAgICAgOiAnd2lkZ2V0cy9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBTdGF0aXN0aWNzV2lkZ2V0JywgcGlwU3RhdGlzdGljc1dpZGdldCk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdEYXNoYm9hcmQuaHRtbCcsXG4gICAgJzxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnQgbWQtcmFpc2VkIG1kLWZhYiBsYXlvdXQtY29sdW1uIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgYXJpYS1sYWJlbD1cIkFkZCBjb21wb25lbnRcIiBuZy1jbGljaz1cImRhc2hib2FyZEN0cmwuYWRkQ29tcG9uZW50KClcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXNcIiBjbGFzcz1cIm1kLWhlYWRsaW5lIGNlbnRlcmVkLWFkZC1pY29uXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWdyaWQtaG9sZGVyXCI+PHBpcC1kcmFnZ2FibGUtZ3JpZCBwaXAtdGlsZXMtdGVtcGxhdGVzPVwiZGFzaGJvYXJkQ3RybC5ncm91cGVkV2lkZ2V0c1wiIHBpcC10aWxlcy1jb250ZXh0PVwiZGFzaGJvYXJkQ3RybC53aWRnZXRzQ29udGV4dFwiIHBpcC1kcmFnZ2FibGUtZ3JpZD1cImRhc2hib2FyZEN0cmwuZHJhZ2dhYmxlR3JpZE9wdGlvbnNcIiBwaXAtZ3JvdXAtbWVudS1hY3Rpb25zPVwiZGFzaGJvYXJkQ3RybC5ncm91cE1lbnVBY3Rpb25zXCI+PC9waXAtZHJhZ2dhYmxlLWdyaWQ+PG1kLXByb2dyZXNzLWNpcmN1bGFyIG1kLW1vZGU9XCJpbmRldGVybWluYXRlXCIgY2xhc3M9XCJwcm9ncmVzcy1yaW5nXCI+PC9tZC1wcm9ncmVzcy1jaXJjdWxhcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkcmFnZ2FibGUvRHJhZ2dhYmxlLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ob2xkZXJcIj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cFwiIG5nLXJlcGVhdD1cImdyb3VwIGluIGRyYWdnYWJsZUN0cmwuZ3JvdXBzXCIgZGF0YS1ncm91cC1pZD1cInt7ICRpbmRleCB9fVwiIHBpcC1kcmFnZ2FibGUtdGlsZXM9XCJncm91cC5zb3VyY2VcIj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cC10aXRsZSBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXJcIj48ZGl2IGNsYXNzPVwidGl0bGUtaW5wdXQtY29udGFpbmVyXCIgbmctY2xpY2s9XCJkcmFnZ2FibGVDdHJsLm9uVGl0bGVDbGljayhncm91cCwgJGV2ZW50KVwiPjxpbnB1dCBuZy1pZj1cImdyb3VwLmVkaXRpbmdOYW1lXCIgbmctYmx1cj1cImRyYWdnYWJsZUN0cmwub25CbHVyVGl0bGVJbnB1dChncm91cClcIiBuZy1rZXlwcmVzcz1cImRyYWdnYWJsZUN0cmwub25LeWVwcmVzc1RpdGxlSW5wdXQoZ3JvdXAsICRldmVudClcIiBuZy1tb2RlbD1cImdyb3VwLnRpdGxlXCI+PGRpdiBjbGFzcz1cInRleHQtb3ZlcmZsb3cgZmxleC1ub25lXCIgbmctaWY9XCIhZ3JvdXAuZWRpdGluZ05hbWVcIj57eyBncm91cC50aXRsZSB9fTwvZGl2PjwvZGl2PjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmUgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1zaG93PVwiZ3JvdXAuZWRpdGluZ05hbWVcIiBuZy1jbGljaz1cImRyYWdnYWJsZUN0cmwuY2FuY2VsRWRpdGluZyhncm91cClcIiBhcmlhLWxhYmVsPVwiQ2FuY2VsXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpjcm9zc1wiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtbWVudSBjbGFzcz1cImZsZXgtbm9uZSBsYXlvdXQtY29sdW1uXCIgbWQtcG9zaXRpb24tbW9kZT1cInRhcmdldC1yaWdodCB0YXJnZXRcIiBuZy1zaG93PVwiIWdyb3VwLmVkaXRpbmdOYW1lXCI+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZSBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLWNsaWNrPVwiJG1kT3Blbk1lbnUoKTsgZ3JvdXBJZCA9ICRpbmRleFwiIGFyaWEtbGFiZWw9XCJNZW51XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpkb3RzXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1tZW51LWNvbnRlbnQgd2lkdGg9XCI0XCI+PG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJhY3Rpb24gaW4gZHJhZ2dhYmxlQ3RybC5ncm91cE1lbnVBY3Rpb25zXCI+PG1kLWJ1dHRvbiBuZy1jbGljaz1cImFjdGlvbi5jYWxsYmFjayhncm91cElkKVwiPnt7IGFjdGlvbi50aXRsZSB9fTwvbWQtYnV0dG9uPjwvbWQtbWVudS1pdGVtPjwvbWQtbWVudS1jb250ZW50PjwvbWQtbWVudT48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncm91cCBmaWN0LWdyb3VwIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyIGxheW91dC1jb2x1bW4gdG0xNlwiPjxkaXYgY2xhc3M9XCJmaWN0LWdyb3VwLXRleHQtY29udGFpbmVyXCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPnt7IFxcJ0RST1BfVE9fQ1JFQVRFX05FV19HUk9VUFxcJyB8IHRyYW5zbGF0ZSB9fTwvZGl2PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC1hZGQtY29tcG9uZW50LWRpYWxvZ1wiPjxtZC1kaWFsb2ctY29udGVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIj48ZGl2IGNsYXNzPVwidGhlbWUtZGl2aWRlciBwMTYgZmxleC1hdXRvXCI+PGgzIGNsYXNzPVwiaGlkZS14cyBtMCBibTE2IHRoZW1lLXRleHQtcHJpbWFyeVwiIGhpZGUteHM9XCJcIj5BZGQgY29tcG9uZW50PG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cImxheW91dC1yb3cgZmxleC1hdXRvIG0wXCI+PG1kLXNlbGVjdCBjbGFzcz1cImZsZXgtYXV0byBtMCB0aGVtZS10ZXh0LXByaW1hcnlcIiBuZy1tb2RlbD1cImRpYWxvZ0N0cmwuYWN0aXZlR3JvdXBJbmRleFwiIHBsYWNlaG9sZGVyPVwiQ3JlYXRlIE5ldyBHcm91cFwiIGFyaWEtbGFiZWw9XCJHcm91cFwiPjxtZC1vcHRpb24gbmctdmFsdWU9XCIkaW5kZXhcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiBkaWFsb2dDdHJsLmdyb3Vwc1wiPnt7IGdyb3VwIH19PC9tZC1vcHRpb24+PC9tZC1zZWxlY3Q+PC9tZC1pbnB1dC1jb250YWluZXI+PC9oMz48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWJvZHkgcGlwLXNjcm9sbCBwMCBmbGV4LWF1dG9cIj48cCBjbGFzcz1cIm1kLWJvZHktMSB0aGVtZS10ZXh0LXNlY29uZGFyeSBtMCBscDE2IHJwMTZcIj5Vc2UgXCJFbnRlclwiIG9yIFwiK1wiIGJ1dHRvbnMgb24ga2V5Ym9hcmQgdG8gZW5jcmVhc2UgYW5kIFwiRGVsZXRlXCIgb3IgXCItXCIgdG8gZGVjcmVhc2UgdGlsZXMgYW1vdW50PC9wPjxtZC1saXN0IG5nLWluaXQ9XCJncm91cEluZGV4ID0gJGluZGV4XCIgbmctcmVwZWF0PVwiZ3JvdXAgaW4gZGlhbG9nQ3RybC5kZWZhdWx0V2lkZ2V0c1wiPjxtZC1saXN0LWl0ZW0gY2xhc3M9XCJsYXlvdXQtcm93IHBpcC1saXN0LWl0ZW0gbHAxNiBycDE2XCIgbmctcmVwZWF0PVwiaXRlbSBpbiBncm91cFwiPjxkaXYgY2xhc3M9XCJpY29uLWhvbGRlciBmbGV4LW5vbmVcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnt7OjogaXRlbS5pY29uIH19XCI+PC9tZC1pY29uPjxkaXYgY2xhc3M9XCJwaXAtYmFkZ2UgdGhlbWUtYmFkZ2UgbWQtd2FyblwiIG5nLWlmPVwiaXRlbS5hbW91bnRcIj48c3Bhbj57eyBpdGVtLmFtb3VudCB9fTwvc3Bhbj48L2Rpdj48L2Rpdj48c3BhbiBjbGFzcz1cImZsZXgtYXV0byBsbTI0IHRoZW1lLXRleHQtcHJpbWFyeVwiPnt7OjogaXRlbS50aXRsZSB9fTwvc3Bhbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lXCIgbmctY2xpY2s9XCJkaWFsb2dDdHJsLmVuY3JlYXNlKGdyb3VwSW5kZXgsICRpbmRleClcIiBhcmlhLWxhYmVsPVwiRW5jcmVhc2VcIj48bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnBsdXMtY2lyY2xlXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmVcIiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuZGVjcmVhc2UoZ3JvdXBJbmRleCwgJGluZGV4KVwiIGFyaWEtbGFiZWw9XCJEZWNyZWFzZVwiPjxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6bWludXMtY2lyY2xlXCI+PC9tZC1pY29uPjwvbWQtYnV0dG9uPjwvbWQtbGlzdC1pdGVtPjxtZC1kaXZpZGVyIGNsYXNzPVwibG03MiB0bTggYm04XCIgbmctaWY9XCJncm91cEluZGV4ICE9PSAoZGlhbG9nQ3RybC5kZWZhdWx0V2lkZ2V0cy5sZW5ndGggLSAxKVwiPjwvbWQtZGl2aWRlcj48L21kLWxpc3Q+PC9kaXY+PC9tZC1kaWFsb2ctY29udGVudD48bWQtZGlhbG9nLWFjdGlvbnMgY2xhc3M9XCJmbGV4LW5vbmUgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXIgdGhlbWUtZGl2aWRlciBkaXZpZGVyLXRvcCB0aGVtZS10ZXh0LXByaW1hcnlcIj48bWQtYnV0dG9uIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5jYW5jZWwoKVwiIGFyaWEtbGFiZWw9XCJBZGRcIj5DYW5jZWw8L21kLWJ1dHRvbj48bWQtYnV0dG9uIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5hZGQoKVwiIGFyaWFsLWxhYmVsPVwiQ2FuY2VsXCI+QWRkPC9tZC1idXR0b24+PC9tZC1kaWFsb2ctYWN0aW9ucz48L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nLmh0bWwnLFxuICAgICc8bWQtZGlhbG9nIGNsYXNzPVwicGlwLWRpYWxvZyBwaXAtd2lkZ2V0LWNvbmZpZy1kaWFsb2cge3sgdm0ucGFyYW1zLmRpYWxvZ0NsYXNzIH19XCIgd2lkdGg9XCI0MDBcIiBtZC10aGVtZT1cInt7dm0udGhlbWV9fVwiPjxwaXAtd2lkZ2V0LWNvbmZpZy1leHRlbmQtY29tcG9uZW50IGNsYXNzPVwibGF5b3V0LWNvbHVtblwiIHBpcC1leHRlbnNpb24tdXJsPVwie3sgdm0ucGFyYW1zLmV4dGVuc2lvblVybCB9fVwiPjwvcGlwLXdpZGdldC1jb25maWctZXh0ZW5kLWNvbXBvbmVudD48L21kLWRpYWxvZz4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdkaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50Lmh0bWwnLFxuICAgICc8aDMgY2xhc3M9XCJ0bTAgZmxleC1ub25lXCI+e3t2bS5kaWFsb2dUaXRsZX19PC9oMz48ZGl2IGNsYXNzPVwicGlwLWJvZHkgcGlwLXNjcm9sbCBwMTYgYnAwIGZsZXgtYXV0b1wiPjxwaXAtZXh0ZW5zaW9uLXBvaW50PjwvcGlwLWV4dGVuc2lvbi1wb2ludD48cGlwLXRvZ2dsZS1idXR0b25zIGNsYXNzPVwiYm0xNlwiIG5nLWlmPVwiIXZtLmhpZGVTaXplc1wiIHBpcC1idXR0b25zPVwidm0uc2l6ZXNcIiBuZy1tb2RlbD1cInZtLnNpemVJZFwiPjwvcGlwLXRvZ2dsZS1idXR0b25zPjxwaXAtY29sb3ItcGlja2VyIG5nLWlmPVwiIXZtLmhpZGVDb2xvcnNcIiBwaXAtY29sb3JzPVwidm0uY29sb3JzXCIgbmctbW9kZWw9XCJ2bS5jb2xvclwiPjwvcGlwLWNvbG9yLXBpY2tlcj48L2Rpdj48ZGl2IGNsYXNzPVwicGlwLWZvb3RlciBmbGV4LW5vbmVcIj48ZGl2PjxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cInZtLm9uQ2FuY2VsKClcIj5DYW5jZWw8L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwibWQtYWNjZW50XCIgbmctY2xpY2s9XCJ2bS5vbkFwcGx5KClcIj5BcHBseTwvbWQtYnV0dG9uPjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvY2FsZW5kYXIvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoIGJtMTZcIj5EYXRlOjxtZC1kYXRlcGlja2VyIG5nLW1vZGVsPVwidm0uZGF0ZVwiIGNsYXNzPVwidy1zdHJldGNoXCI+PC9tZC1kYXRlcGlja2VyPjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3aWRnZXQtYm94IHBpcC1jYWxlbmRhci13aWRnZXQge3sgd2lkZ2V0Q3RybC5jb2xvciB9fSBsYXlvdXQtY29sdW1uIGxheW91dC1maWxsIHRwMFwiIG5nLWNsYXNzPVwieyBzbWFsbDogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiPjxwaXAtbWVudS13aWRnZXQ+PC9waXAtbWVudS13aWRnZXQ+PC9kaXY+PGRpdiBjbGFzcz1cIndpZGdldC1jb250ZW50IGZsZXgtYXV0byBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgbmctaWY9XCJ3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+PHNwYW4gY2xhc3M9XCJkYXRlIGxtMjQgcm0xMlwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlLmdldERhdGUoKSB9fTwvc3Bhbj48ZGl2IGNsYXNzPVwiZmxleC1hdXRvIGxheW91dC1jb2x1bW5cIj48c3BhbiBjbGFzcz1cIndlZWtkYXkgbWQtaGVhZGxpbmVcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwibW9udGgteWVhciBtZC1oZWFkbGluZVwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ01vbnRoIH19IHt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0WWVhciB9fTwvc3Bhbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1jb2x1bW4gbGF5b3V0LWFsaWduLXNwYWNlLWFyb3VuZC1jZW50ZXJcIiBuZy1oaWRlPVwid2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPjxzcGFuIGNsYXNzPVwid2Vla2RheSBtZC1oZWFkbGluZVwiIG5nLWhpZGU9XCJ3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxXCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRMb25nRGF5T2ZXZWVrIH19PC9zcGFuPiA8c3BhbiBjbGFzcz1cIndlZWtkYXlcIiBuZy1zaG93PVwid2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJkYXRlIGxtMTIgcm0xMlwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlLmdldERhdGUoKSB9fTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJtb250aC15ZWFyIG1kLWhlYWRsaW5lXCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRMb25nTW9udGggfX0ge3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRZZWFyIH19PC9zcGFuPjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvZXZlbnQvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoXCI+PG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCBibTBcIj48bGFiZWw+VGl0bGU6PC9sYWJlbD4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCJ2bS50aXRsZVwiPjwvbWQtaW5wdXQtY29udGFpbmVyPkRhdGU6PG1kLWRhdGVwaWNrZXIgbmctbW9kZWw9XCJ2bS5kYXRlXCIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm04XCI+PC9tZC1kYXRlcGlja2VyPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2hcIj48bGFiZWw+RGVzY3JpcHRpb246PC9sYWJlbD4gPHRleHRhcmVhIHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCJ2bS50ZXh0XCI+XFxuJyArXG4gICAgJyAgICA8L3RleHRhcmVhPjwvbWQtaW5wdXQtY29udGFpbmVyPkJhY2tkcm9wXFwncyBvcGFjaXR5OjxtZC1zbGlkZXIgYXJpYS1sYWJlbD1cIm9wYWNpdHlcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiMC4xXCIgbWF4PVwiMC45XCIgc3RlcD1cIjAuMDFcIiBuZy1tb2RlbD1cInZtLm9wYWNpdHlcIiBuZy1jaGFuZ2U9XCJ2bS5vbk9wYWNpdHl0ZXN0KHZtLm9wYWNpdHkpXCI+PC9tZC1zbGlkZXI+PC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLWV2ZW50LXdpZGdldCB7eyB3aWRnZXRDdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIiBuZy1jbGFzcz1cInsgc21hbGw6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIG1lZGl1bTogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgYmlnOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIj48aW1nIG5nLWlmPVwid2lkZ2V0Q3RybC5vcHRpb25zLmltYWdlXCIgbmctc3JjPVwie3t3aWRnZXRDdHJsLm9wdGlvbnMuaW1hZ2V9fVwiIGFsdD1cInt7d2lkZ2V0Q3RybC5vcHRpb25zLnRpdGxlIHx8IHdpZGdldEN0cmwub3B0aW9ucy5uYW1lfX1cIj48ZGl2IGNsYXNzPVwidGV4dC1iYWNrZHJvcFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCB7eyB3aWRnZXRDdHJsLm9wYWNpdHkgfX0pXCI+PGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBmbGV4LW5vbmVcIj48c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7IHdpZGdldEN0cmwub3B0aW9ucy50aXRsZSB8fCB3aWRnZXRDdHJsLm9wdGlvbnMubmFtZSB9fTwvc3Bhbj48cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PjwvZGl2PjxkaXYgY2xhc3M9XCJ0ZXh0LWNvbnRhaW5lciBmbGV4LWF1dG8gcGlwLXNjcm9sbFwiPjxwIGNsYXNzPVwiZGF0ZSBmbGV4LW5vbmVcIiBuZy1pZj1cIndpZGdldEN0cmwub3B0aW9ucy5kYXRlXCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLmRhdGUgfCBmb3JtYXRTaG9ydERhdGUgfX08L3A+PHAgY2xhc3M9XCJ0ZXh0IGZsZXgtYXV0b1wiPnt7IHdpZGdldEN0cmwub3B0aW9ucy50ZXh0IHx8IHdpZGdldEN0cmwub3B0aW9ucy5kZXNjcmlwdGlvbiB9fTwvcD48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL21lbnUvV2lkZ2V0TWVudS5odG1sJyxcbiAgICAnPG1kLW1lbnUgY2xhc3M9XCJ3aWRnZXQtbWVudVwiIG1kLXBvc2l0aW9uLW1vZGU9XCJ0YXJnZXQtcmlnaHQgdGFyZ2V0XCI+PG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiJG1kT3Blbk1lbnUoKVwiIGFyaWEtbGFiZWw9XCJNZW51XCI+PG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczp2ZG90c1wiPjwvbWQtaWNvbj48L21kLWJ1dHRvbj48bWQtbWVudS1jb250ZW50IHdpZHRoPVwiNFwiPjxtZC1tZW51LWl0ZW0gbmctcmVwZWF0PVwiaXRlbSBpbiB3aWRnZXRDdHJsLm1lbnVcIj48bWQtYnV0dG9uIG5nLWlmPVwiIWl0ZW0uc3VibWVudVwiIG5nLWNsaWNrPVwid2lkZ2V0Q3RybC5jYWxsQWN0aW9uKGl0ZW0uYWN0aW9uLCBpdGVtLnBhcmFtcywgaXRlbSlcIj57ezo6IGl0ZW0udGl0bGUgfX08L21kLWJ1dHRvbj48bWQtbWVudSBuZy1pZj1cIml0ZW0uc3VibWVudVwiPjxtZC1idXR0b24gbmctY2xpY2s9XCJ3aWRnZXRDdHJsLmNhbGxBY3Rpb24oaXRlbS5hY3Rpb24pXCI+e3s6OiBpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+PG1kLW1lbnUtY29udGVudD48bWQtbWVudS1pdGVtIG5nLXJlcGVhdD1cInN1Yml0ZW0gaW4gaXRlbS5zdWJtZW51XCI+PG1kLWJ1dHRvbiBuZy1jbGljaz1cIndpZGdldEN0cmwuY2FsbEFjdGlvbihzdWJpdGVtLmFjdGlvbiwgc3ViaXRlbS5wYXJhbXMsIHN1Yml0ZW0pXCI+e3s6OiBzdWJpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+PC9tZC1tZW51LWl0ZW0+PC9tZC1tZW51LWNvbnRlbnQ+PC9tZC1tZW51PjwvbWQtbWVudS1pdGVtPjwvbWQtbWVudS1jb250ZW50PjwvbWQtbWVudT4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL25vdGVzL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPjxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+PGxhYmVsPlRpdGxlOjwvbGFiZWw+IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwidm0udGl0bGVcIj48L21kLWlucHV0LWNvbnRhaW5lcj48bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIHRtMFwiPjxsYWJlbD5UZXh0OjwvbGFiZWw+IDx0ZXh0YXJlYSB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwidm0udGV4dFwiPlxcbicgK1xuICAgICcgICAgPC90ZXh0YXJlYT48L21kLWlucHV0LWNvbnRhaW5lcj48L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL25vdGVzL1dpZGdldE5vdGVzLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtbm90ZXMtd2lkZ2V0IHt7IHdpZGdldEN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtblwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgZmxleC1ub25lXCIgbmctaWY9XCJ3aWRnZXRDdHJsLm9wdGlvbnMudGl0bGUgfHwgd2lkZ2V0Q3RybC5vcHRpb25zLm5hbWVcIj48c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7IHdpZGdldEN0cmwub3B0aW9ucy50aXRsZSB8fCB3aWRnZXRDdHJsLm9wdGlvbnMubmFtZSB9fTwvc3Bhbj48L2Rpdj48cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PjxkaXYgY2xhc3M9XCJ0ZXh0LWNvbnRhaW5lciBmbGV4LWF1dG8gcGlwLXNjcm9sbFwiPjxwPnt7IHdpZGdldEN0cmwub3B0aW9ucy50ZXh0IH19PC9wPjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvcGljdHVyZV9zbGlkZXIvV2lkZ2V0UGljdHVyZVNsaWRlci5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLXBpY3R1cmUtc2xpZGVyLXdpZGdldCB7eyB3aWRnZXRDdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIiBuZy1jbGFzcz1cInsgc21hbGw6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsIG1lZGl1bTogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgYmlnOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIiBpbmRleD1cInt7IHdpZGdldEN0cmwuaW5kZXggfX1cIiBncm91cD1cInt7IHdpZGdldEN0cmwuZ3JvdXAgfX1cIj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbHAxNiBycDggbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIj48c3BhbiBjbGFzcz1cImZsZXggdGV4dC1vdmVyZmxvd1wiPnt7IHdpZGdldEN0cmwub3B0aW9ucy50aXRsZSB9fTwvc3Bhbj48cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PjwvZGl2PjxkaXYgY2xhc3M9XCJzbGlkZXItY29udGFpbmVyXCI+PGRpdiBwaXAtaW1hZ2Utc2xpZGVyPVwiXCIgcGlwLWFuaW1hdGlvbi10eXBlPVwiXFwnZmFkaW5nXFwnXCIgcGlwLWFuaW1hdGlvbi1pbnRlcnZhbD1cIndpZGdldEN0cmwuYW5pbWF0aW9uSW50ZXJ2YWxcIiBuZy1pZj1cIndpZGdldEN0cmwuYW5pbWF0aW9uVHlwZSA9PSBcXCdmYWRpbmdcXCdcIj48ZGl2IGNsYXNzPVwicGlwLWFuaW1hdGlvbi1ibG9ja1wiIG5nLXJlcGVhdD1cInNsaWRlIGluIHdpZGdldEN0cmwub3B0aW9ucy5zbGlkZXNcIj48aW1nIG5nLXNyYz1cInt7IHNsaWRlLmltYWdlIH19XCIgYWx0PVwie3sgc2xpZGUuaW1hZ2UgfX1cIiBwaXAtaW1hZ2UtbG9hZD1cIndpZGdldEN0cmwub25JbWFnZUxvYWQoJGV2ZW50KVwiPjxwIGNsYXNzPVwic2xpZGUtdGV4dFwiIG5nLWlmPVwic2xpZGUudGV4dFwiPnt7IHNsaWRlLnRleHQgfX08L3A+PC9kaXY+PC9kaXY+PGRpdiBwaXAtaW1hZ2Utc2xpZGVyPVwiXCIgcGlwLWFuaW1hdGlvbi10eXBlPVwiXFwnY2Fyb3VzZWxcXCdcIiBwaXAtYW5pbWF0aW9uLWludGVydmFsPVwid2lkZ2V0Q3RybC5hbmltYXRpb25JbnRlcnZhbFwiIG5nLWlmPVwid2lkZ2V0Q3RybC5hbmltYXRpb25UeXBlID09IFxcJ2Nhcm91c2VsXFwnXCI+PGRpdiBjbGFzcz1cInBpcC1hbmltYXRpb24tYmxvY2tcIiBuZy1yZXBlYXQ9XCJzbGlkZSBpbiB3aWRnZXRDdHJsLm9wdGlvbnMuc2xpZGVzXCI+PGltZyBuZy1zcmM9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIGFsdD1cInt7IHNsaWRlLmltYWdlIH19XCIgcGlwLWltYWdlLWxvYWQ9XCJ3aWRnZXRDdHJsLm9uSW1hZ2VMb2FkKCRldmVudClcIj48cCBjbGFzcz1cInNsaWRlLXRleHRcIiBuZy1pZj1cInNsaWRlLnRleHRcIj57eyBzbGlkZS50ZXh0IH19PC9wPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvcG9zaXRpb24vQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoXCI+PG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCBibTBcIj48bGFiZWw+TG9jYXRpb24gbmFtZTo8L2xhYmVsPiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cInZtLmxvY2F0aW9uTmFtZVwiPjwvbWQtaW5wdXQtY29udGFpbmVyPjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvcG9zaXRpb24vV2lkZ2V0UG9zaXRpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtcG9zaXRpb24td2lkZ2V0IHdpZGdldC1ib3ggcDAgbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwieyBzbWFsbDogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiIGluZGV4PVwie3sgd2lkZ2V0Q3RybC5pbmRleCB9fVwiIGdyb3VwPVwie3sgd2lkZ2V0Q3RybC5ncm91cCB9fVwiPjxkaXYgY2xhc3M9XCJwb3NpdGlvbi1hYnNvbHV0ZS1yaWdodC10b3BcIiBuZy1pZj1cIiF3aWRnZXRDdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lXCI+PHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiF3aWRnZXRDdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbHAxNiBycDggbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tZW5kLWNlbnRlciBmbGV4LW5vbmVcIiBuZy1pZj1cIndpZGdldEN0cmwub3B0aW9ucy5sb2NhdGlvbk5hbWVcIj48c3BhbiBjbGFzcz1cImZsZXggdGV4dC1vdmVyZmxvd1wiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5sb2NhdGlvbk5hbWUgfX08L3NwYW4+PHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiF3aWRnZXRDdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48cGlwLWxvY2F0aW9uLW1hcCBjbGFzcz1cImZsZXhcIiBuZy1pZj1cIndpZGdldEN0cmwuc2hvd1Bvc2l0aW9uXCIgcGlwLXN0cmV0Y2g9XCJ0cnVlXCIgcGlwLXJlYmluZD1cInRydWVcIiBwaXAtbG9jYXRpb24tcG9zPVwid2lkZ2V0Q3RybC5vcHRpb25zLmxvY2F0aW9uXCI+PC9waXAtbG9jYXRpb24tbWFwPjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvc3RhdGlzdGljcy9XaWRnZXRTdGF0aXN0aWNzLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtc3RhdGlzdGljcy13aWRnZXQgbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwieyBzbWFsbDogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSwgbWVkaXVtOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLCBiaWc6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiPjxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1zdGFydC1jZW50ZXIgZmxleC1ub25lXCI+PHNwYW4gY2xhc3M9XCJ3aWRnZXQtdGl0bGUgZmxleC1hdXRvIHRleHQtb3ZlcmZsb3dcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMudGl0bGUgfHwgd2lkZ2V0Q3RybC5vcHRpb25zLm5hbWUgfX08L3NwYW4+PHBpcC1tZW51LXdpZGdldD48L3BpcC1tZW51LXdpZGdldD48L2Rpdj48ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWNlbnRlci1jZW50ZXJcIiBuZy1pZj1cIndpZGdldEN0cmwub3B0aW9ucy5zZXJpZXMgJiYgIXdpZGdldEN0cmwucmVzZXRcIj48cGlwLXBpZS1jaGFydCBwaXAtc2VyaWVzPVwid2lkZ2V0Q3RybC5vcHRpb25zLnNlcmllc1wiIG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5jaGFydFR5cGUgfHwgd2lkZ2V0Q3RybC5vcHRpb25zLmNoYXJ0VHlwZSA9PSBcXCdwaWVcXCdcIiBwaXAtZG9udXQ9XCJ0cnVlXCIgcGlwLXBpZS1zaXplPVwid2lkZ2V0Q3RybC5jaGFydFNpemVcIiBwaXAtc2hvdy10b3RhbD1cInRydWVcIiBwaXAtY2VudGVyZWQ9XCJ0cnVlXCI+PC9waXAtcGllLWNoYXJ0PjwvZGl2PjwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwLXdlYnVpLWRhc2hib2FyZC1odG1sLm1pbi5qcy5tYXBcbiJdfQ==