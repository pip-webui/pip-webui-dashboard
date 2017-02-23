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
    '<md-button class="md-accent md-raised md-fab layout-column layout-align-center-center" aria-label="Add component"\n' +
    '           ng-click="dashboardCtrl.addComponent()">\n' +
    '    <md-icon md-svg-icon="icons:plus" class="md-headline centered-add-icon"></md-icon>\n' +
    '</md-button>\n' +
    '\n' +
    '<div class="pip-draggable-grid-holder">\n' +
    '  <pip-draggable-grid pip-tiles-templates="dashboardCtrl.groupedWidgets"\n' +
    '                      pip-tiles-context="dashboardCtrl.widgetsContext"\n' +
    '                      pip-draggable-grid="dashboardCtrl.draggableGridOptions"\n' +
    '                      pip-group-menu-actions="dashboardCtrl.groupMenuActions">\n' +
    '  </pip-draggable-grid>\n' +
    '\n' +
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
    '       ng-repeat="group in draggableCtrl.groups" \n' +
    '       data-group-id="{{ $index }}" \n' +
    '       pip-draggable-tiles="group.source">\n' +
    '    <div class="pip-draggable-group-title layout-row layout-align-start-center">\n' +
    '      <div class="title-input-container" ng-click="draggableCtrl.onTitleClick(group, $event)">\n' +
    '        <input ng-if="group.editingName" ng-blur="draggableCtrl.onBlurTitleInput(group)" \n' +
    '               ng-keypress="draggableCtrl.onKyepressTitleInput(group, $event)"\n' +
    '               ng-model="group.title">\n' +
    '        </input>\n' +
    '        <div class="text-overflow flex-none" ng-if="!group.editingName">{{ group.title }}</div>\n' +
    '      </div>\n' +
    '      <md-button class="md-icon-button flex-none layout-align-center-center" \n' +
    '        ng-show="group.editingName" ng-click="draggableCtrl.cancelEditing(group)"\n' +
    '        aria-label="Cancel">\n' +
    '        <md-icon md-svg-icon="icons:cross"></md-icon>\n' +
    '      </md-button>\n' +
    '      <md-menu class="flex-none layout-column" md-position-mode="target-right target" ng-show="!group.editingName">\n' +
    '        <md-button class="md-icon-button flex-none layout-align-center-center" ng-click="$mdOpenMenu(); groupId = $index" aria-label="Menu">\n' +
    '          <md-icon md-svg-icon="icons:dots"></md-icon>\n' +
    '        </md-button>\n' +
    '        <md-menu-content width="4">\n' +
    '          <md-menu-item ng-repeat="action in draggableCtrl.groupMenuActions">\n' +
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
    '      <h3 class="hide-xs m0 bm16 theme-text-primary" hide-xs>Add component</h4>\n' +
    '      <md-input-container class="layout-row flex-auto m0">\n' +
    '        <md-select class="flex-auto m0 theme-text-primary" ng-model="dialogCtrl.activeGroupIndex" placeholder="Create New Group"\n' +
    '          aria-label="Group">\n' +
    '          <md-option ng-value="$index" ng-repeat="group in dialogCtrl.groups">{{ group }}</md-option>\n' +
    '        </md-select>\n' +
    '      </md-input-container>\n' +
    '    </div>\n' +
    '    <div class="pip-body pip-scroll p0 flex-auto">\n' +
    '      <p class="md-body-1 theme-text-secondary m0 lp16 rp16" >\n' +
    '        Use "Enter" or "+" buttons on keyboard to encrease and "Delete" or "-" to decrease tiles amount\n' +
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
    '    <md-button ng-click="dialogCtrl.cancel()" aria-label="Add">Cancel</md-button>\n' +
    '    <md-button ng-click="dialogCtrl.add()" arial-label="Cancel">Add</md-button>\n' +
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
    '    <pip-widget-config-extend-component class="layout-column" pip-extension-url="{{ vm.params.extensionUrl }}">\n' +
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
    '<h3 class="tm0 flex-none">{{vm.dialogTitle}}</h3>\n' +
    '<div class="pip-body pip-scroll p16 bp0 flex-auto">\n' +
    '    <pip-extension-point></pip-extension-point>\n' +
    '    <pip-toggle-buttons class="bm16" ng-if="!vm.hideSizes" pip-buttons="vm.sizes" ng-model="vm.sizeId">\n' +
    '    </pip-toggle-buttons>\n' +
    '    <pip-color-picker ng-if="!vm.hideColors" pip-colors="vm.colors" ng-model="vm.color">\n' +
    '    </pip-color-picker>\n' +
    '</div>\n' +
    '</div>\n' +
    '<div class="pip-footer flex-none">\n' +
    '    <div>\n' +
    '        <md-button class="md-accent" ng-click="vm.onCancel()">Cancel</md-button>\n' +
    '        <md-button class="md-accent" ng-click="vm.onApply()">Apply</md-button>\n' +
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
    '    <md-datepicker ng-model="vm.date" class="w-stretch ">\n' +
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
    '<div class="widget-box pip-calendar-widget {{ widgetCtrl.color }} layout-column layout-fill tp0"\n' +
    '     ng-class="{\n' +
    '        small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }">\n' +
    '  <div class="widget-heading layout-row layout-align-end-center flex-none">\n' +
    '    <pip-menu-widget></pip-menu-widget>\n' +
    '  </div>\n' +
    '\n' +
    '  <div class="widget-content flex-auto layout-row layout-align-center-center"\n' +
    '       ng-if="widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1">\n' +
    '    <span class="date lm24 rm12">{{ widgetCtrl.options.date.getDate() }}</span>\n' +
    '    <div class="flex-auto layout-column">\n' +
    '      <span class="weekday md-headline">{{ widgetCtrl.options.date | formatLongDayOfWeek }}</span>\n' +
    '      <span class="month-year md-headline">{{ widgetCtrl.options.date | formatLongMonth }} {{ widgetCtrl.options.date | formatYear }}</span>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '\n' +
    '  <div class="widget-content flex-auto layout-column layout-align-space-around-center"\n' +
    '       ng-hide="widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1">\n' +
    '    <span class="weekday md-headline"\n' +
    '          ng-hide="widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1">{{ widgetCtrl.options.date | formatLongDayOfWeek }}</span>\n' +
    '    <span class="weekday"\n' +
    '          ng-show="widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1">{{ widgetCtrl.options.date | formatLongDayOfWeek }}</span>\n' +
    '    <span class="date lm12 rm12">{{ widgetCtrl.options.date.getDate() }}</span>\n' +
    '    <span class="month-year md-headline">{{ widgetCtrl.options.date | formatLongMonth }} {{ widgetCtrl.options.date | formatYear }}</span>\n' +
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
    '        <md-menu-item ng-repeat="item in widgetCtrl.menu">\n' +
    '            <md-button ng-if="!item.submenu" ng-click="widgetCtrl.callAction(item.action, item.params, item)">{{:: item.title }}</md-button>\n' +
    '\n' +
    '            <md-menu ng-if="item.submenu">\n' +
    '                <md-button ng-click="widgetCtrl.callAction(item.action)">{{:: item.title }}</md-button>\n' +
    '\n' +
    '                <md-menu-content>\n' +
    '                    <md-menu-item ng-repeat="subitem in item.submenu">\n' +
    '                        <md-button ng-click="widgetCtrl.callAction(subitem.action, subitem.params, subitem)">{{:: subitem.title }}</md-button>\n' +
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
  $templateCache.put('widgets/event/ConfigDialogExtension.html',
    '<div class="w-stretch">\n' +
    '    <md-input-container class="w-stretch bm0">\n' +
    '        <label>Title:</label>\n' +
    '        <input type="text" ng-model="vm.title"/>\n' +
    '    </md-input-container>\n' +
    '\n' +
    '    Date:\n' +
    '    <md-datepicker ng-model="vm.date" class="w-stretch bm8">\n' +
    '    </md-datepicker>\n' +
    '\n' +
    '    <md-input-container class="w-stretch">\n' +
    '        <label>Description:</label>\n' +
    '        <textarea type="text" ng-model="vm.text"/>\n' +
    '    </md-input-container>\n' +
    '\n' +
    '    Backdrop\'s opacity:\n' +
    '    <md-slider aria-label="opacity"  type="number" min="0.1" max="0.9" step="0.01" \n' +
    '        ng-model="vm.opacity" ng-change="vm.onOpacitytest(vm.opacity)">\n' +
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
    '<div class="widget-box pip-event-widget {{ widgetCtrl.color }} layout-column layout-fill" ng-class="{\n' +
    '        small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }" >\n' +
    '    <img ng-if="widgetCtrl.options.image" ng-src="{{widgetCtrl.options.image}}" alt="{{widgetCtrl.options.title || widgetCtrl.options.name}}"\n' +
    '    />\n' +
    '    <div class="text-backdrop" style="background-color: rgba(0, 0, 0, {{ widgetCtrl.opacity }})">\n' +
    '        <div class="widget-heading layout-row layout-align-start-center flex-none">\n' +
    '            <span class="widget-title flex-auto text-overflow">{{ widgetCtrl.options.title || widgetCtrl.options.name }}</span>\n' +
    '            <pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget>\n' +
    '        </div>\n' +
    '        <div class="text-container flex-auto pip-scroll">\n' +
    '            <p class="date flex-none" ng-if="widgetCtrl.options.date">\n' +
    '                {{ widgetCtrl.options.date | formatShortDate }}\n' +
    '            </p>\n' +
    '            <p class="text flex-auto">\n' +
    '                {{ widgetCtrl.options.text || widgetCtrl.options.description }}\n' +
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
  $templateCache.put('widgets/notes/ConfigDialogExtension.html',
    '<div class="w-stretch">\n' +
    '    <md-input-container class="w-stretch bm0">\n' +
    '        <label>Title:</label>\n' +
    '        <input type="text" ng-model="vm.title"/>\n' +
    '    </md-input-container>\n' +
    '\n' +
    '    <md-input-container class="w-stretch tm0">\n' +
    '        <label>Text:</label>\n' +
    '        <textarea type="text" ng-model="vm.text"/>\n' +
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
    '<div class="widget-box pip-notes-widget {{ widgetCtrl.color }} layout-column">\n' +
    '    <div class="widget-heading layout-row layout-align-start-center flex-none" ng-if="widgetCtrl.options.title || widgetCtrl.options.name">\n' +
    '        <span class="widget-title flex-auto text-overflow">{{ widgetCtrl.options.title || widgetCtrl.options.name }}</span>\n' +
    '    </div>\n' +
    '    <pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget>\n' +
    '    \n' +
    '    <div class="text-container flex-auto pip-scroll">\n' +
    '        <p>{{ widgetCtrl.options.text }}</p>\n' +
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
    '<div class="widget-box pip-picture-slider-widget {{ widgetCtrl.color }} layout-column layout-fill" ng-class="{\n' +
    '        small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }" \n' +
    '        index=\'{{ widgetCtrl.index }}\' group=\'{{ widgetCtrl.group }}\'>\n' +
    '\n' +
    '        <div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none">\n' +
    '            <span class="flex text-overflow">{{ widgetCtrl.options.title }}</span>\n' +
    '            <pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget>\n' +
    '        </div>\n' +
    '\n' +
    '        <div class="slider-container">\n' +
    '            <div pip-image-slider pip-animation-type="\'fading\'" pip-animation-interval="widgetCtrl.animationInterval" \n' +
    '                ng-if="widgetCtrl.animationType == \'fading\'">\n' +
    '                <div class="pip-animation-block" ng-repeat="slide in widgetCtrl.options.slides">\n' +
    '                    <img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="widgetCtrl.onImageLoad($event)"/>\n' +
    '                    <p class="slide-text" ng-if="slide.text">{{ slide.text }}</p>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '\n' +
    '            <div pip-image-slider pip-animation-type="\'carousel\'" pip-animation-interval="widgetCtrl.animationInterval" \n' +
    '                ng-if="widgetCtrl.animationType == \'carousel\'">\n' +
    '                <div class="pip-animation-block" ng-repeat="slide in widgetCtrl.options.slides">\n' +
    '                    <img ng-src="{{ slide.image }}" alt="{{ slide.image }}" pip-image-load="widgetCtrl.onImageLoad($event)"/>\n' +
    '                    <p class="slide-text" ng-if="slide.text">{{ slide.text }}</p>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '        \n' +
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
    '        <input type="text" ng-model="vm.locationName"/>\n' +
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
    '        small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }"\n' +
    '        index=\'{{ widgetCtrl.index }}\' group=\'{{ widgetCtrl.group }}\'>\n' +
    '    <div class="position-absolute-right-top" ng-if="!widgetCtrl.options.locationName">\n' +
    '        <pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="widget-heading lp16 rp8 layout-row layout-align-end-center flex-none" ng-if="widgetCtrl.options.locationName">\n' +
    '        <span class="flex text-overflow">{{ widgetCtrl.options.locationName }}</span>\n' +
    '        <pip-menu-widget ng-if="!widgetCtrl.options.hideMenu"></pip-menu-widget>\n' +
    '    </div>\n' +
    '\n' +
    '    <pip-location-map class="flex" ng-if="widgetCtrl.showPosition" pip-stretch="true" pip-rebind="true"\n' +
    '        pip-location-pos="widgetCtrl.options.location"></pip-location>\n' +
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
    '        small: widgetCtrl.options.size.colSpan == 1 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        medium: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 1,\n' +
    '        big: widgetCtrl.options.size.colSpan == 2 && widgetCtrl.options.size.rowSpan == 2 }">\n' +
    '    <div class="widget-heading layout-row layout-align-start-center flex-none">\n' +
    '        <span class="widget-title flex-auto text-overflow">{{ widgetCtrl.options.title || widgetCtrl.options.name }}</span>\n' +
    '        <pip-menu-widget></pip-menu-widget>\n' +
    '    </div>\n' +
    '    <div class="widget-content flex-auto layout-row layout-align-center-center" ng-if="widgetCtrl.options.series && !widgetCtrl.reset">\n' +
    '        <pip-pie-chart pip-series="widgetCtrl.options.series" ng-if="!widgetCtrl.options.chartType || widgetCtrl.options.chartType == \'pie\'"\n' +
    '                    pip-donut="true" \n' +
    '                    pip-pie-size="widgetCtrl.chartSize" \n' +
    '                    pip-show-total="true" \n' +
    '                    pip-centered="true">\n' +
    '        </pip-pie-chart>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);
})();



},{}]},{},[25,1,2,3,4,5,6,7,8,13,14,9,10,11,12,15,17,18,19,20,21,22,23,24,16])(25)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRGFzaGJvYXJkLnRzIiwic3JjL0Rhc2hib2FyZENvbXBvbmVudC50cyIsInNyYy9EYXNoYm9hcmRDb250cm9sbGVyLnRzIiwic3JjL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnREaWFsb2dDb250cm9sbGVyLnRzIiwic3JjL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnRQcm92aWRlci50cyIsInNyYy9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nQ29udHJvbGxlci50cyIsInNyYy9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50LnRzIiwic3JjL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlLnRzIiwic3JjL2RyYWdnYWJsZS9EcmFnZ2FibGUudHMiLCJzcmMvZHJhZ2dhYmxlL0RyYWdnYWJsZUNvbnRyb2xsZXIudHMiLCJzcmMvZHJhZ2dhYmxlL0RyYWdnYWJsZURpcmVjdGl2ZS50cyIsInNyYy9kcmFnZ2FibGUvRHJhZ2dhYmxlVGlsZVNlcnZpY2UudHMiLCJzcmMvZHJhZ2dhYmxlL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwRGlyZWN0aXZlLnRzIiwic3JjL2RyYWdnYWJsZS9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UudHMiLCJzcmMvdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHkudHMiLCJzcmMvd2lkZ2V0cy9XaWRnZXRzLnRzIiwic3JjL3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIudHMiLCJzcmMvd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudURpcmVjdGl2ZS50cyIsInNyYy93aWRnZXRzL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UudHMiLCJzcmMvd2lkZ2V0cy9ub3Rlcy9XaWRnZXROb3Rlcy50cyIsInNyYy93aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIudHMiLCJzcmMvd2lkZ2V0cy9wb3NpdGlvbi9XaWRnZXRQb3NpdGlvbi50cyIsInNyYy93aWRnZXRzL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcy50cyIsInRlbXAvcGlwLXdlYnVpLWRhc2hib2FyZC1odG1sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLDZCQUEyQjtBQUMzQixpQ0FBK0I7QUFFL0IsQ0FBQztJQUNDLFlBQVksQ0FBQztJQUViLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1FBQzdCLFdBQVc7UUFDWCxZQUFZO1FBQ1osdUJBQXVCO1FBQ3ZCLGdDQUFnQztRQUNoQyx3QkFBd0I7UUFHeEIsV0FBVztRQUNYLGNBQWM7UUFDZCxhQUFhO1FBQ2IsV0FBVztRQUNYLGNBQWM7UUFDZCxhQUFhO0tBQ2QsQ0FBQyxDQUFDO0FBRUwsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUVMLDJDQUF5QztBQUN6QywwREFBd0Q7QUFDeEQsZ0VBQThEO0FBQzlELGlDQUErQjtBQUMvQixnQ0FBOEI7O0FDNUI5QixDQUFDO0lBQ0MsWUFBWSxDQUFDO0lBRWIsSUFBTSxZQUFZLEdBQUc7UUFDbkIsUUFBUSxFQUFFO1lBQ1IsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixzQkFBc0IsRUFBRSxrQkFBa0I7WUFDMUMsY0FBYyxFQUFFLFlBQVk7U0FDN0I7UUFDRCxVQUFVLEVBQUUsa0JBQWtCO1FBQzlCLFlBQVksRUFBRSxlQUFlO1FBQzdCLFdBQVcsRUFBRSxnQkFBZ0I7S0FDOUIsQ0FBQTtJQUVELE9BQU87U0FDSixNQUFNLENBQUMsY0FBYyxDQUFDO1NBQ3RCLFNBQVMsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDN0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUNqQkwsWUFBWSxDQUFDO0FBSWIs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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICcuL3dpZGdldHMvV2lkZ2V0cyc7XHJcbmltcG9ydCAnLi9kcmFnZ2FibGUvRHJhZ2dhYmxlJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkJywgW1xyXG4gICAgJ3BpcFdpZGdldCcsIFxyXG4gICAgJ3BpcERyYWdnZWQnLCBcclxuICAgICdwaXBXaWRnZXRDb25maWdEaWFsb2cnLCBcclxuICAgICdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2cnLFxyXG4gICAgJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLFxyXG5cclxuICAgIC8vIEV4dGVybmFsIHBpcCBtb2R1bGVzXHJcbiAgICAncGlwTGF5b3V0JyxcclxuICAgICdwaXBMb2NhdGlvbnMnLFxyXG4gICAgJ3BpcERhdGVUaW1lJyxcclxuICAgICdwaXBDaGFydHMnLFxyXG4gICAgJ3BpcFRyYW5zbGF0ZScsXHJcbiAgICAncGlwQ29udHJvbHMnXHJcbiAgXSk7XHJcbiAgXHJcbn0pKCk7XHJcblxyXG5pbXBvcnQgJy4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5pbXBvcnQgJy4vZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vZGlhbG9ncy9hZGRfY29tcG9uZW50L0FkZENvbXBvbmVudERpYWxvZ0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vRGFzaGJvYXJkQ29udHJvbGxlcic7XHJcbmltcG9ydCAnLi9EYXNoYm9hcmRDb21wb25lbnQnO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgY29uc3QgcGlwRGFzaGJvYXJkID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgZ3JpZE9wdGlvbnM6ICc9cGlwR3JpZE9wdGlvbnMnLFxyXG4gICAgICBncm91cEFkZGl0aW9uYWxBY3Rpb25zOiAnPXBpcEdyb3VwQWN0aW9ucycsXHJcbiAgICAgIGdyb3VwZWRXaWRnZXRzOiAnPXBpcEdyb3VwcydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiAncGlwRGFzaGJvYXJkQ3RybCcsXHJcbiAgICBjb250cm9sbGVyQXM6ICdkYXNoYm9hcmRDdHJsJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnRGFzaGJvYXJkLmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBEYXNoYm9hcmQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRGFzaGJvYXJkJywgcGlwRGFzaGJvYXJkKTtcclxufSkoKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlIH0gZnJvbSAnLi91dGlsaXR5L1dpZGdldFRlbXBsYXRlVXRpbGl0eSc7XHJcblxyXG5mdW5jdGlvbiBzZXRUcmFuc2xhdGlvbnMoJGluamVjdG9yKSB7XHJcbiAgdmFyIHBpcFRyYW5zbGF0ZSA9ICRpbmplY3Rvci5oYXMoJ3BpcFRyYW5zbGF0ZScpID8gJGluamVjdG9yLmdldCgncGlwVHJhbnNsYXRlJykgOiBudWxsO1xyXG4gIGlmIChwaXBUcmFuc2xhdGUpIHtcclxuICAgIHBpcFRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbnMoJ2VuJywge1xyXG4gICAgICBEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVA6ICdEcm9wIGhlcmUgdG8gY3JlYXRlIG5ldyBncm91cCcsXHJcbiAgICB9KTtcclxuICAgIHBpcFRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbnMoJ3J1Jywge1xyXG4gICAgICBEUk9QX1RPX0NSRUFURV9ORVdfR1JPVVA6ICfQn9C10YDQtdGC0LDRidC40YLQtSDRgdGO0LTQsCDQtNC70Y8g0YHQvtC30LTQsNC90LjRjyDQvdC+0LLQvtC5INCz0YDRg9C/0L/RiydcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29uZmlndXJlQXZhaWxhYmxlV2lkZ2V0cyhwaXBBZGRDb21wb25lbnREaWFsb2dQcm92aWRlcikge1xyXG4gIHBpcEFkZENvbXBvbmVudERpYWxvZ1Byb3ZpZGVyLmNvbmZpZ1dpZGdldExpc3QoW1xyXG4gICAgW3tcclxuICAgICAgICB0aXRsZTogJ0V2ZW50JyxcclxuICAgICAgICBpY29uOiAnZG9jdW1lbnQnLFxyXG4gICAgICAgIG5hbWU6ICdldmVudCcsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1Bvc2l0aW9uJyxcclxuICAgICAgICBpY29uOiAnbG9jYXRpb24nLFxyXG4gICAgICAgIG5hbWU6ICdwb3NpdGlvbicsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICBbe1xyXG4gICAgICAgIHRpdGxlOiAnQ2FsZW5kYXInLFxyXG4gICAgICAgIGljb246ICdkYXRlJyxcclxuICAgICAgICBuYW1lOiAnY2FsZW5kYXInLFxyXG4gICAgICAgIGFtb3VudDogMFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6ICdTdGlja3kgTm90ZXMnLFxyXG4gICAgICAgIGljb246ICdub3RlLXRha2UnLFxyXG4gICAgICAgIG5hbWU6ICdub3RlcycsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZTogJ1N0YXRpc3RpY3MnLFxyXG4gICAgICAgIGljb246ICd0ci1zdGF0aXN0aWNzJyxcclxuICAgICAgICBuYW1lOiAnc3RhdGlzdGljcycsXHJcbiAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgIH1cclxuICAgIF1cclxuICBdKTtcclxufVxyXG5cclxuaW1wb3J0IHsgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2UgfSBmcm9tICcuL2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnRQcm92aWRlcidcclxuXHJcbmNsYXNzIGRyYWdnYWJsZU9wdGlvbnMge1xyXG4gIHRpbGVXaWR0aDogbnVtYmVyO1xyXG4gIHRpbGVIZWlnaHQ6IG51bWJlcjtcclxuICBndXR0ZXI6IG51bWJlcjtcclxuICBpbmxpbmU6IGJvb2xlYW47XHJcbn1cclxuXHJcbmxldCBERUZBVUxUX0dSSURfT1BUSU9OUzogZHJhZ2dhYmxlT3B0aW9ucyA9IHtcclxuICB0aWxlV2lkdGg6IDE1MCwgLy8gJ3B4J1xyXG4gIHRpbGVIZWlnaHQ6IDE1MCwgLy8gJ3B4J1xyXG4gIGd1dHRlcjogMTAsIC8vICdweCdcclxuICBpbmxpbmU6IGZhbHNlXHJcbn07XHJcblxyXG5jbGFzcyBEYXNoYm9hcmRDb250cm9sbGVyIHtcclxuICBwcml2YXRlIGRlZmF1bHRHcm91cE1lbnVBY3Rpb25zOiBhbnkgPSBbe1xyXG4gICAgICB0aXRsZTogJ0FkZCBDb21wb25lbnQnLFxyXG4gICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudChncm91cEluZGV4KTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdGl0bGU6ICdSZW1vdmUnLFxyXG4gICAgICBjYWxsYmFjazogKGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdyb3VwKGdyb3VwSW5kZXgpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0aXRsZTogJ0NvbmZpZ3VyYXRlJyxcclxuICAgICAgY2FsbGJhY2s6IChncm91cEluZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2NvbmZpZ3VyYXRlIGdyb3VwIHdpdGggaW5kZXg6JywgZ3JvdXBJbmRleCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdO1xyXG4gIHByaXZhdGUgXyRzY29wZTogYW5ndWxhci5JU2NvcGU7XHJcbiAgcHJpdmF0ZSBfJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZTtcclxuICBwcml2YXRlIF8kYXR0cnM6IGFueTtcclxuICBwcml2YXRlIF8kZWxlbWVudDogYW55O1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICBwcml2YXRlIF9waXBBZGRDb21wb25lbnREaWFsb2c6IElBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX3BpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX2luY2x1ZGVUcGw6IHN0cmluZyA9ICc8cGlwLXt7IHR5cGUgfX0td2lkZ2V0IGdyb3VwPVwiZ3JvdXBJbmRleFwiIGluZGV4PVwiaW5kZXhcIicgK1xyXG4gICAgJ3BpcC1vcHRpb25zPVwiJHBhcmVudC5kYXNoYm9hcmRDdHJsLmdyb3VwZWRXaWRnZXRzW2dyb3VwSW5kZXhdW1xcJ3NvdXJjZVxcJ11baW5kZXhdLm9wdHNcIj4nICtcclxuICAgICc8L3BpcC17eyB0eXBlIH19LXdpZGdldD4nO1xyXG5cclxuICBwdWJsaWMgZ3JvdXBlZFdpZGdldHM6IGFueTtcclxuICBwdWJsaWMgZHJhZ2dhYmxlR3JpZE9wdGlvbnM6IGRyYWdnYWJsZU9wdGlvbnM7XHJcbiAgcHVibGljIHdpZGdldHNUZW1wbGF0ZXM6IGFueTtcclxuICBwdWJsaWMgZ3JvdXBNZW51QWN0aW9uczogYW55ID0gdGhpcy5kZWZhdWx0R3JvdXBNZW51QWN0aW9ucztcclxuICBwdWJsaWMgd2lkZ2V0c0NvbnRleHQ6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICRhdHRyczogYW55LFxyXG4gICAgJGVsZW1lbnQ6IGFueSxcclxuICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICRpbnRlcnBvbGF0ZTogYW5ndWxhci5JSW50ZXJwb2xhdGVTZXJ2aWNlLFxyXG4gICAgcGlwQWRkQ29tcG9uZW50RGlhbG9nOiBJQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSxcclxuICAgIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLl8kcm9vdFNjb3BlID0gJHJvb3RTY29wZTtcclxuICAgIHRoaXMuXyRhdHRycyA9ICRhdHRycztcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fJGludGVycG9sYXRlID0gJGludGVycG9sYXRlO1xyXG4gICAgdGhpcy5fcGlwQWRkQ29tcG9uZW50RGlhbG9nID0gcGlwQWRkQ29tcG9uZW50RGlhbG9nO1xyXG4gICAgdGhpcy5fcGlwV2lkZ2V0VGVtcGxhdGUgPSBwaXBXaWRnZXRUZW1wbGF0ZTtcclxuXHJcbiAgICAvLyBBZGQgY2xhc3MgdG8gc3R5bGUgc2Nyb2xsIGJhclxyXG4gICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3BpcC1zY3JvbGwnKTtcclxuXHJcbiAgICAvLyBTZXQgdGlsZXMgZ3JpZCBvcHRpb25zXHJcbiAgICB0aGlzLmRyYWdnYWJsZUdyaWRPcHRpb25zID0gJHNjb3BlWydncmlkT3B0aW9ucyddIHx8IERFRkFVTFRfR1JJRF9PUFRJT05TO1xyXG5cclxuICAgIC8vIFN3aXRjaCBpbmxpbmUgZGlzcGxheWluZ1xyXG4gICAgaWYgKHRoaXMuZHJhZ2dhYmxlR3JpZE9wdGlvbnMuaW5saW5lID09PSB0cnVlKSB7XHJcbiAgICAgICRlbGVtZW50LmFkZENsYXNzKCdpbmxpbmUtZ3JpZCcpO1xyXG4gICAgfVxyXG4gICAgLy8gRXh0ZW5kIGdyb3VwJ3MgbWVudSBhY3Rpb25zXHJcbiAgICBpZiAoJHNjb3BlWydncm91cEFkZGl0aW9uYWxBY3Rpb25zJ10pIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZ3JvdXBNZW51QWN0aW9ucywgJHNjb3BlWydncm91cEFkZGl0aW9uYWxBY3Rpb25zJ10pO1xyXG5cclxuICAgIC8vIENvbXBpbGUgd2lkZ2V0c1xyXG4gICAgdGhpcy53aWRnZXRzQ29udGV4dCA9ICRzY29wZTtcclxuICAgIHRoaXMuY29tcGlsZVdpZGdldHMoKTtcclxuXHJcbiAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuXyRlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICB9LCA3MDApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21waWxlV2lkZ2V0cygpIHtcclxuICAgIF8uZWFjaCh0aGlzLmdyb3VwZWRXaWRnZXRzLCAoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgICBncm91cC5yZW1vdmVkV2lkZ2V0cyA9IGdyb3VwLnJlbW92ZWRXaWRnZXRzIHx8IFtdLFxyXG4gICAgICAgIGdyb3VwLnNvdXJjZSA9IGdyb3VwLnNvdXJjZS5tYXAoKHdpZGdldCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgIC8vIEVzdGFibGlzaCBkZWZhdWx0IHByb3BzXHJcbiAgICAgICAgICB3aWRnZXQuc2l6ZSA9IHdpZGdldC5zaXplIHx8IHtcclxuICAgICAgICAgICAgY29sU3BhbjogMSxcclxuICAgICAgICAgICAgcm93U3BhbjogMVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHdpZGdldC5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgd2lkZ2V0Lmdyb3VwSW5kZXggPSBncm91cEluZGV4O1xyXG4gICAgICAgICAgd2lkZ2V0Lm1lbnUgPSB3aWRnZXQubWVudSB8fCB7fTtcclxuICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHdpZGdldC5tZW51LCBbe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1JlbW92ZScsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoaXRlbSwgcGFyYW1zLCBvYmplY3QpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnJlbW92ZVdpZGdldChpdGVtLCBwYXJhbXMsIG9iamVjdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1dKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvcHRzOiB3aWRnZXQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLl9waXBXaWRnZXRUZW1wbGF0ZS5nZXRUZW1wbGF0ZSh3aWRnZXQsIHRoaXMuX2luY2x1ZGVUcGwpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRDb21wb25lbnQoZ3JvdXBJbmRleCkge1xyXG4gICAgdGhpcy5fcGlwQWRkQ29tcG9uZW50RGlhbG9nXHJcbiAgICAgIC5zaG93KHRoaXMuZ3JvdXBlZFdpZGdldHMsIGdyb3VwSW5kZXgpXHJcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdGl2ZUdyb3VwO1xyXG5cclxuICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICBhY3RpdmVHcm91cCA9IHRoaXMuZ3JvdXBlZFdpZGdldHNbZGF0YS5ncm91cEluZGV4XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYWN0aXZlR3JvdXAgPSB7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnTmV3IGdyb3VwJyxcclxuICAgICAgICAgICAgc291cmNlOiBbXVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWRkV2lkZ2V0cyhhY3RpdmVHcm91cC5zb3VyY2UsIGRhdGEud2lkZ2V0cyk7XHJcblxyXG4gICAgICAgIGlmIChkYXRhLmdyb3VwSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnB1c2goYWN0aXZlR3JvdXApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb21waWxlV2lkZ2V0cygpO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgcmVtb3ZlR3JvdXAgPSAoZ3JvdXBJbmRleCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZUdyb3VwJywgZ3JvdXBJbmRleCk7XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzLnNwbGljZShncm91cEluZGV4LCAxKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkV2lkZ2V0cyhncm91cCwgd2lkZ2V0cykge1xyXG4gICAgd2lkZ2V0cy5mb3JFYWNoKCh3aWRnZXRHcm91cCkgPT4ge1xyXG4gICAgICB3aWRnZXRHcm91cC5mb3JFYWNoKCh3aWRnZXQpID0+IHtcclxuICAgICAgICBpZiAod2lkZ2V0LmFtb3VudCkge1xyXG4gICAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkod2lkZ2V0LmFtb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgICBncm91cC5wdXNoKHtcclxuICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQubmFtZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVtb3ZlV2lkZ2V0KGl0ZW0sIHBhcmFtcywgb2JqZWN0KSB7XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzW3BhcmFtcy5vcHRpb25zLmdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzID0gW107XHJcbiAgICB0aGlzLmdyb3VwZWRXaWRnZXRzW3BhcmFtcy5vcHRpb25zLmdyb3VwSW5kZXhdLnJlbW92ZWRXaWRnZXRzLnB1c2gocGFyYW1zLm9wdGlvbnMuaW5kZXgpO1xyXG4gICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5zb3VyY2Uuc3BsaWNlKHBhcmFtcy5vcHRpb25zLmluZGV4LCAxKTtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5ncm91cGVkV2lkZ2V0c1twYXJhbXMub3B0aW9ucy5ncm91cEluZGV4XS5yZW1vdmVkV2lkZ2V0cyA9IFtdO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgLmNvbmZpZyhjb25maWd1cmVBdmFpbGFibGVXaWRnZXRzKVxyXG4gIC5ydW4oc2V0VHJhbnNsYXRpb25zKVxyXG4gIC5jb250cm9sbGVyKCdwaXBEYXNoYm9hcmRDdHJsJywgRGFzaGJvYXJkQ29udHJvbGxlcik7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFkZENvbXBvbmVudERpYWxvZ0NvbnRyb2xsZXIge1xyXG4gICAgcHVibGljIF9tZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZTtcclxuICAgIHB1YmxpYyBhY3RpdmVHcm91cEluZGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgZGVmYXVsdFdpZGdldHM6IGFueTtcclxuICAgIHB1YmxpYyBncm91cHM6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBncm91cHMsIFxyXG4gICAgICAgIGFjdGl2ZUdyb3VwSW5kZXgsIFxyXG4gICAgICAgIHdpZGdldExpc3QsXHJcbiAgICAgICAgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUdyb3VwSW5kZXggPSBfLmlzTnVtYmVyKGFjdGl2ZUdyb3VwSW5kZXgpID8gYWN0aXZlR3JvdXBJbmRleCA6IC0xO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdFdpZGdldHMgICA9IF8uY2xvbmVEZWVwKHdpZGdldExpc3QpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gXy5tYXAoZ3JvdXBzLCBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICAgIHJldHVybiBncm91cFsndGl0bGUnXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tZERpYWxvZyA9ICRtZERpYWxvZztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkICgpIHtcclxuICAgICAgICAgIHRoaXMuX21kRGlhbG9nLmhpZGUoe1xyXG4gICAgICAgICAgICBncm91cEluZGV4OiB0aGlzLmFjdGl2ZUdyb3VwSW5kZXgsXHJcbiAgICAgICAgICAgIHdpZGdldHMgICA6IHRoaXMuZGVmYXVsdFdpZGdldHNcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgcHVibGljIGNhbmNlbCAoKSB7XHJcbiAgICAgICAgICB0aGlzLl9tZERpYWxvZy5jYW5jZWwoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBlbmNyZWFzZSAoZ3JvdXBJbmRleCwgd2lkZ2V0SW5kZXgpIHtcclxuICAgICAgICAgIHZhciB3aWRnZXQgPSB0aGlzLmRlZmF1bHRXaWRnZXRzW2dyb3VwSW5kZXhdW3dpZGdldEluZGV4XTtcclxuICAgICAgICAgIHdpZGdldC5hbW91bnQrKztcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGRlY3JlYXNlIChncm91cEluZGV4LCB3aWRnZXRJbmRleCkge1xyXG4gICAgICAgICAgdmFyIHdpZGdldCAgICA9IHRoaXMuZGVmYXVsdFdpZGdldHNbZ3JvdXBJbmRleF1bd2lkZ2V0SW5kZXhdO1xyXG4gICAgICAgICAgd2lkZ2V0LmFtb3VudCA9IHdpZGdldC5hbW91bnQgPyB3aWRnZXQuYW1vdW50IC0gMSA6IDA7XHJcbiAgICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2cnLCBbJ25nTWF0ZXJpYWwnXSlcclxuICAgIC5jb250cm9sbGVyKCdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2dDb250cm9sbGVyJywgQWRkQ29tcG9uZW50RGlhbG9nQ29udHJvbGxlcik7XHJcblxyXG5pbXBvcnQgJy4vQWRkQ29tcG9uZW50UHJvdmlkZXInOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2Uge1xyXG4gIHNob3coZ3JvdXBzLCBhY3RpdmVHcm91cEluZGV4KTogYW55O1xyXG59XHJcblxyXG5jbGFzcyBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlIGltcGxlbWVudHMgSUFkZENvbXBvbmVudERpYWxvZ1NlcnZpY2Uge1xyXG4gICAgcHVibGljIF9tZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZTtcclxuICAgIHByaXZhdGUgX3dpZGdldExpc3Q6IGFueTtcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2lkZ2V0TGlzdDogYW55LCAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLl9tZERpYWxvZyA9ICRtZERpYWxvZztcclxuICAgICAgICB0aGlzLl93aWRnZXRMaXN0ID0gd2lkZ2V0TGlzdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdyhncm91cHMsIGFjdGl2ZUdyb3VwSW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWREaWFsb2dcclxuICAgICAgICAgIC5zaG93KHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmwgICAgIDogJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXIgICAgICA6ICdwaXBBZGREYXNoYm9hcmRDb21wb25lbnREaWFsb2dDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzICAgIDogJ2RpYWxvZ0N0cmwnLFxyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgZ3JvdXBzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBzO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgYWN0aXZlR3JvdXBJbmRleDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUdyb3VwSW5kZXg7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB3aWRnZXRMaXN0OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd2lkZ2V0TGlzdDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbn1cclxuXHJcbmNsYXNzIEFkZENvbXBvbmVudERpYWxvZ1Byb3ZpZGVyIHtcclxuICBwcml2YXRlIF9zZXJ2aWNlOiBBZGRDb21wb25lbnREaWFsb2dTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX3dpZGdldExpc3Q6IGFueSA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbmZpZ1dpZGdldExpc3QgPSBmdW5jdGlvbiAobGlzdCkge1xyXG4gICAgICB0aGlzLl93aWRnZXRMaXN0ID0gbGlzdDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgJGdldCgkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2UpIHtcclxuICAgICAgICBcIm5nSW5qZWN0XCI7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9zZXJ2aWNlID09IG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgQWRkQ29tcG9uZW50RGlhbG9nU2VydmljZSh0aGlzLl93aWRnZXRMaXN0LCAkbWREaWFsb2cpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRGFzaGJvYXJkJylcclxuICAgIC5wcm92aWRlcigncGlwQWRkQ29tcG9uZW50RGlhbG9nJywgQWRkQ29tcG9uZW50RGlhbG9nUHJvdmlkZXIpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jbGFzcyBUaWxlQ29sb3JzIHtcclxuICAgIHN0YXRpYyBhbGw6IHN0cmluZ1tdID0gWydwdXJwbGUnLCAnZ3JlZW4nLCAnZ3JheScsICdvcmFuZ2UnLCAnYmx1ZSddO1xyXG59XHJcblxyXG5jbGFzcyBUaWxlU2l6ZXMge1xyXG4gICAgc3RhdGljIGFsbDogYW55ID0gW1xyXG4gICAgICAgIHtuYW1lOiAnU01BTEwnLCBpZDogJzExJ30sXHJcbiAgICAgICAge25hbWU6ICdXSURFJywgaWQ6ICcyMSd9LFxyXG4gICAgICAgIHtuYW1lOiAnTEFSR0UnLCBpZDogJzIyJ31cclxuICAgIF07XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXaWRnZXRDb25maWdEaWFsb2dDb250cm9sbGVyIHtcclxuICAgIHB1YmxpYyBkaWFsb2dUaXRsZTogc3RyaW5nID0gXCJFZGl0IHRpbGVcIjtcclxuICAgIHB1YmxpYyAkbWREaWFsb2c6IGFuZ3VsYXIubWF0ZXJpYWwuSURpYWxvZ1NlcnZpY2U7XHJcbiAgICBwdWJsaWMgdHJhbnNjbHVkZTogYW55O1xyXG4gICAgcHVibGljIHBhcmFtczogYW55O1xyXG4gICAgcHVibGljIGNvbG9yczogc3RyaW5nW10gPSBUaWxlQ29sb3JzLmFsbDtcclxuICAgIHB1YmxpYyBzaXplczogYW55ID0gVGlsZVNpemVzLmFsbDtcclxuICAgIHB1YmxpYyBzaXplSWQ6IHN0cmluZyA9IFRpbGVTaXplcy5hbGxbMF0uaWQ7XHJcblxyXG4gICAgcHJpdmF0ZSBfJGVsZW1lbnQ6IGFueTtcclxuICAgIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwYXJhbXMsXHJcbiAgICAgICAgJG1kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlLFxyXG4gICAgICAgICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcclxuICAgICAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAgICAgJGluamVjdG9yLFxyXG4gICAgICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIFwibmdJbmplY3RcIjtcclxuXHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cgPSAkbWREaWFsb2c7XHJcbiAgICAgICAgdGhpcy5fJHRpbWVvdXQgPSAkdGltZW91dDtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XHJcbiAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgdGhpcy5wYXJhbXMpO1xyXG4gICAgICAgIHRoaXMuc2l6ZUlkID0gJycgKyB0aGlzLnBhcmFtcy5zaXplLmNvbFNwYW4gKyB0aGlzLnBhcmFtcy5zaXplLnJvd1NwYW47XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQXBwbHkoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpc1snc2l6ZSddLnNpemVYID0gTnVtYmVyKHRoaXMuc2l6ZUlkLnN1YnN0cigwLCAxKSk7XHJcbiAgICAgICAgdGhpc1snc2l6ZSddLnNpemVZID0gTnVtYmVyKHRoaXMuc2l6ZUlkLnN1YnN0cigxLCAxKSk7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuaGlkZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DYW5jZWwoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy4kbWREaWFsb2cuY2FuY2VsKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldENvbmZpZ0RpYWxvZycsIFsnbmdNYXRlcmlhbCddKVxyXG4gICAgLmNvbnRyb2xsZXIoJ3BpcFdpZGdldENvbmZpZ0RpYWxvZ0NvbnRyb2xsZXInLCBXaWRnZXRDb25maWdEaWFsb2dDb250cm9sbGVyKTtcclxuXHJcbmltcG9ydCAnLi9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuaW1wb3J0ICcuL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudCc7IiwiXHJcbigoKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHBpcFdpZGdldENvbmZpZ0NvbXBvbmVudChcclxuICAgICAgICAkdGVtcGxhdGVSZXF1ZXN0OiBhbmd1bGFyLklUZW1wbGF0ZVJlcXVlc3RTZXJ2aWNlLFxyXG4gICAgICAgICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdkaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nRXh0ZW5kQ29tcG9uZW50Lmh0bWwnLFxyXG4gICAgICAgICAgICBzY29wZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbms6ICgkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCAkZWxlbWVudDogYW55LCAkYXR0cnM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJHRlbXBsYXRlUmVxdWVzdCgkYXR0cnMucGlwRXh0ZW5zaW9uVXJsLCBmYWxzZSkudGhlbigoaHRtbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ3BpcC1leHRlbnNpb24tcG9pbnQnKS5yZXBsYWNlV2l0aCgkY29tcGlsZShodG1sKSgkc2NvcGUpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwaXBXaWRnZXRDb25maWdEaWFsb2cnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3BpcFdpZGdldENvbmZpZ0V4dGVuZENvbXBvbmVudCcsIHBpcFdpZGdldENvbmZpZ0NvbXBvbmVudCk7XHJcblxyXG59KSgpOyIsImV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldENvbmZpZ1NlcnZpY2Uge1xyXG4gICAgc2hvdyhwYXJhbXM6IGFueSwgc3VjY2Vzc0NhbGxiYWNrPzogKGtleSkgPT4gdm9pZCwgY2FuY2VsQ2FsbGJhY2s/OiAoKSA9PiB2b2lkKTogYW55O1xyXG59XHJcblxyXG5jbGFzcyBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlIHtcclxuICBwdWJsaWMgX21kRGlhbG9nOiBhbmd1bGFyLm1hdGVyaWFsLklEaWFsb2dTZXJ2aWNlO1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCRtZERpYWxvZzogYW5ndWxhci5tYXRlcmlhbC5JRGlhbG9nU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuX21kRGlhbG9nID0gJG1kRGlhbG9nO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3cocGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2s/OiAoa2V5KSA9PiB2b2lkLCBjYW5jZWxDYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcclxuICAgICAgICAgdGhpcy5fbWREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgICAgIHRhcmdldEV2ZW50OiBwYXJhbXMuZXZlbnQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBwYXJhbXMudGVtcGxhdGVVcmwgfHwgJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2cuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdwaXBXaWRnZXRDb25maWdEaWFsb2dDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxyXG4gICAgICAgICAgICBsb2NhbHM6IHtwYXJhbXM6IHBhcmFtc30sXHJcbiAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcclxuICAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2FuY2VsQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTsgICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuXHJcbigoKSA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXRDb25maWdEaWFsb2cnKVxyXG4gICAgLnNlcnZpY2UoJ3BpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2UnLCBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlKTtcclxuICBcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdwaXBEcmFnZ2VkJywgW10pO1xyXG59KSgpO1xyXG5cclxuaW1wb3J0ICcuL0RyYWdnYWJsZVRpbGVTZXJ2aWNlJztcclxuaW1wb3J0ICcuL0RyYWdnYWJsZUNvbnRyb2xsZXInO1xyXG5pbXBvcnQgJy4vRHJhZ2dhYmxlRGlyZWN0aXZlJztcclxuaW1wb3J0ICcuL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwU2VydmljZSdcclxuaW1wb3J0ICcuL2RyYWdnYWJsZV9ncm91cC9EcmFnZ2FibGVUaWxlc0dyb3VwRGlyZWN0aXZlJyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlY2xhcmUgdmFyIGludGVyYWN0O1xyXG5cclxuaW1wb3J0IHsgRHJhZ1RpbGVTZXJ2aWNlLCBJRHJhZ1RpbGVTZXJ2aWNlLCBJRHJhZ1RpbGVDb25zdHJ1Y3RvciB9IGZyb20gJy4vRHJhZ2dhYmxlVGlsZVNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUaWxlc0dyaWRTZXJ2aWNlLCBJVGlsZXNHcmlkU2VydmljZSwgSVRpbGVzR3JpZENvbnN0cnVjdG9yIH0gZnJvbSAnLi9kcmFnZ2FibGVfZ3JvdXAvRHJhZ2dhYmxlVGlsZXNHcm91cFNlcnZpY2UnO1xyXG5cclxubGV0IFNJTVBMRV9MQVlPVVRfQ09MVU1OU19DT1VOVDogbnVtYmVyID0gMjtcclxuZXhwb3J0IGxldCBERUZBVUxUX1RJTEVfV0lEVEg6IG51bWJlciA9IDE1MDtcclxuZXhwb3J0IGxldCBERUZBVUxUX1RJTEVfSEVJR0hUOiBudW1iZXIgPSAxNTA7XHJcbmV4cG9ydCBsZXQgVVBEQVRFX0dST1VQU19FVkVOVCA9IFwicGlwVXBkYXRlRGFzaGJvYXJkR3JvdXBzQ29uZmlnXCI7XHJcblxyXG5sZXQgREVGQVVMVF9PUFRJT05TID0ge1xyXG4gICAgdGlsZVdpZHRoICAgICAgICAgICAgICA6IERFRkFVTFRfVElMRV9XSURUSCwgICAvLyAncHgnXHJcbiAgICB0aWxlSGVpZ2h0ICAgICAgICAgICAgIDogREVGQVVMVF9USUxFX0hFSUdIVCwgICAvLyAncHgnXHJcbiAgICBndXR0ZXIgICAgICAgICAgICAgICAgIDogMjAsICAgIC8vICdweCdcclxuICAgIGNvbnRhaW5lciAgICAgICAgICAgICAgOiAncGlwLWRyYWdnYWJsZS1ncmlkOmZpcnN0LW9mLXR5cGUnLFxyXG4gICAgLy9tb2JpbGVCcmVha3BvaW50ICAgICAgIDogWFhYLCAgIC8vIEdldCBmcm9tIHBpcE1lZGlhIFNlcnZpY2UgaW4gdGhlIGNvbnN0cnVjdG9yXHJcbiAgICBhY3RpdmVEcm9wem9uZUNsYXNzICAgIDogJ2Ryb3B6b25lLWFjdGl2ZScsXHJcbiAgICBncm91cENvbnRhbmluZXJTZWxlY3RvcjogJy5waXAtZHJhZ2dhYmxlLWdyb3VwOm5vdCguZmljdC1ncm91cCknLFxyXG59O1xyXG5cclxuY2xhc3MgRHJhZ2dhYmxlQ29udHJvbGxlciB7XHJcbiAgcHVibGljIG9wdHM6IGFueTtcclxuICBwdWJsaWMgZ3JvdXBzOiBhbnk7XHJcbiAgcHVibGljIHNvdXJjZURyb3Bab25lRWxlbTogYW55ID0gbnVsbDtcclxuICBwdWJsaWMgaXNTYW1lRHJvcHpvbmU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIHB1YmxpYyB0aWxlR3JvdXBzOiBhbnkgPSBudWxsO1xyXG4gIHB1YmxpYyBhdmFpbGFibGVXaWR0aDogYW55O1xyXG4gIHB1YmxpYyBhdmFpbGFibGVDb2x1bW5zOiBhbnk7XHJcbiAgcHVibGljIGdyb3Vwc0NvbnRhaW5lcnM6IGFueTtcclxuICBwdWJsaWMgY29udGFpbmVyOiBhbnk7XHJcbiAgcHVibGljIGFjdGl2ZURyYWdnZWRHcm91cDogYW55O1xyXG4gIHB1YmxpYyBkcmFnZ2VkVGlsZTogYW55O1xyXG4gIHB1YmxpYyBjb250YWluZXJPZmZzZXQ6IGFueTtcclxuXHJcbiAgcHJpdmF0ZSBfJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlO1xyXG4gIHByaXZhdGUgXyRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF8kY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBfJGVsZW1lbnQ6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBcclxuICAgICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsIFxyXG4gICAgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLCBcclxuICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgICRlbGVtZW50OiBhbnksIFxyXG4gICAgcGlwRHJhZ1RpbGU6IElEcmFnVGlsZVNlcnZpY2UsIFxyXG4gICAgcGlwVGlsZXNHcmlkOiBJVGlsZXNHcmlkU2VydmljZSxcclxuICAgIHBpcE1lZGlhOiBwaXAubGF5b3V0cy5JTWVkaWFTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XHJcbiAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgdGhpcy5fJGVsZW1lbnQgPSAkZWxlbWVudDtcclxuXHJcbiAgICB0aGlzLm9wdHMgPSBfLm1lcmdlKHsgbW9iaWxlQnJlYWtwb2ludDogcGlwTWVkaWEuYnJlYWtwb2ludHMueHMgfSwgREVGQVVMVF9PUFRJT05TLCAkc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS5vcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLmdyb3VwcyA9ICRzY29wZVsnZHJhZ2dhYmxlQ3RybCddLnRpbGVzVGVtcGxhdGVzLm1hcCgoZ3JvdXAsIGdyb3VwSW5kZXgpID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0aXRsZSA6IGdyb3VwLnRpdGxlLFxyXG4gICAgICAgIGVkaXRpbmdOYW1lIDogZmFsc2UsXHJcbiAgICAgICAgaW5kZXg6IGdyb3VwSW5kZXgsXHJcbiAgICAgICAgc291cmNlOiBncm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICBsZXQgdGlsZVNjb3BlID0gJHJvb3RTY29wZS4kbmV3KGZhbHNlLCAkc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc0NvbnRleHQpO1xyXG4gICAgICAgICAgdGlsZVNjb3BlWydpbmRleCddID0gdGlsZS5vcHRzLmluZGV4O1xyXG4gICAgICAgICAgdGlsZVNjb3BlWydncm91cEluZGV4J10gPSB0aWxlLm9wdHMuZ3JvdXBJbmRleDtcclxuXHJcbiAgICAgICAgICByZXR1cm4gSURyYWdUaWxlQ29uc3RydWN0b3IoRHJhZ1RpbGVTZXJ2aWNlLCB7XHJcbiAgICAgICAgICAgIHRwbCAgICA6ICRjb21waWxlKHRpbGUudGVtcGxhdGUpKHRpbGVTY29wZSksXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgICAgc2l6ZSAgIDogdGlsZS5vcHRzLnNpemVcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdGVtcGxhdGVzIHdhdGNoZXJcclxuICAgICRzY29wZS4kd2F0Y2goJ2RyYWdnYWJsZUN0cmwudGlsZXNUZW1wbGF0ZXMnLCAobmV3VmFsKSA9PiB7XHJcbiAgICAgIHRoaXMud2F0Y2gobmV3VmFsKTtcclxuICAgIH0sIHRydWUpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgZGF0YVxyXG4gICAgdGhpcy5pbml0aWFsaXplKCk7XHJcblxyXG4gICAgLy8gUmVzaXplIGhhbmRsZXIgVE9ETzogcmVwbGFjZSBieSBwaXAgcmVzaXplIHdhdGNoZXJzXHJcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgICB0aGlzLmF2YWlsYWJsZVdpZHRoICAgPSB0aGlzLmdldENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICAgIHRoaXMuYXZhaWxhYmxlQ29sdW1ucyA9IHRoaXMuZ2V0QXZhaWxhYmxlQ29sdW1ucyh0aGlzLmF2YWlsYWJsZVdpZHRoKTtcclxuXHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgIGdyb3VwXHJcbiAgICAgICAgICAuc2V0QXZhaWxhYmxlQ29sdW1ucyh0aGlzLmF2YWlsYWJsZUNvbHVtbnMpXHJcbiAgICAgICAgICAuZ2VuZXJhdGVHcmlkKHRoaXMuZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKHRoaXMuYXZhaWxhYmxlV2lkdGgpKVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAuY2FsY0NvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICB9KTtcclxuICAgIH0sIDUwKSk7XHJcbiAgfVxyXG5cclxuICAvLyBXYXRjaCBoYW5kbGVyXHJcbiAgcHJpdmF0ZSB3YXRjaChuZXdWYWwpIHtcclxuICAgICAgY29uc3QgcHJldlZhbCA9IHRoaXMuZ3JvdXBzO1xyXG4gICAgICBsZXQgY2hhbmdlZEdyb3VwSW5kZXggPSBudWxsO1xyXG5cclxuICAgICAgaWYgKG5ld1ZhbC5sZW5ndGggPiBwcmV2VmFsLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuYWRkR3JvdXAobmV3VmFsW25ld1ZhbC5sZW5ndGggLSAxXSk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbC5sZW5ndGggPCBwcmV2VmFsLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlR3JvdXBzKG5ld1ZhbCk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdWYWwubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBncm91cFdpZGdldERpZmYgPSBwcmV2VmFsW2ldLnNvdXJjZS5sZW5ndGggLSBuZXdWYWxbaV0uc291cmNlLmxlbmd0aDtcclxuICAgICAgICBpZiAoZ3JvdXBXaWRnZXREaWZmIHx8IChuZXdWYWxbaV0ucmVtb3ZlZFdpZGdldHMgJiYgbmV3VmFsW2ldLnJlbW92ZWRXaWRnZXRzLmxlbmd0aCA+IDApKSB7XHJcbiAgICAgICAgICBjaGFuZ2VkR3JvdXBJbmRleCA9IGk7XHJcblxyXG4gICAgICAgICAgaWYgKGdyb3VwV2lkZ2V0RGlmZiA8IDApIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3VGlsZXMgPSBuZXdWYWxbY2hhbmdlZEdyb3VwSW5kZXhdLnNvdXJjZS5zbGljZShncm91cFdpZGdldERpZmYpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXy5lYWNoKG5ld1RpbGVzLCAodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aWxlJywgdGlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRUaWxlc0ludG9Hcm91cChuZXdUaWxlcywgdGhpcy50aWxlR3JvdXBzW2NoYW5nZWRHcm91cEluZGV4XSwgdGhpcy5ncm91cHNDb250YWluZXJzW2NoYW5nZWRHcm91cEluZGV4XSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTsgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKHRoaXMudGlsZUdyb3Vwc1tjaGFuZ2VkR3JvdXBJbmRleF0sIG5ld1ZhbFtjaGFuZ2VkR3JvdXBJbmRleF0ucmVtb3ZlZFdpZGdldHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tjaGFuZ2VkR3JvdXBJbmRleF0pO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlVGlsZXNHcm91cHMoKTsgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbCAmJiB0aGlzLnRpbGVHcm91cHMpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzT3B0aW9ucyhuZXdWYWwpO1xyXG4gICAgICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHsgdGhpcy51cGRhdGVUaWxlc0dyb3VwcygpOyB9KTtcclxuICAgICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gSW5saW5lIGVkaXQgZ3JvdXAgaGFuZGxlcnNcclxuICBwdWJsaWMgb25UaXRsZUNsaWNrKGdyb3VwLCBldmVudCkge1xyXG4gICAgICBpZiAoIWdyb3VwLmVkaXRpbmdOYW1lKSB7XHJcbiAgICAgICAgZ3JvdXAub2xkVGl0bGUgPSBfLmNsb25lKGdyb3VwLnRpdGxlKTtcclxuICAgICAgICBncm91cC5lZGl0aW5nTmFtZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0LmNoaWxkcmVuWzBdKS5mb2N1cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FuY2VsRWRpdGluZyAoZ3JvdXApIHtcclxuICAgICAgZ3JvdXAudGl0bGUgPSBncm91cC5vbGRUaXRsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25CbHVyVGl0bGVJbnB1dCAoZ3JvdXApIHtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLmVkaXRpbmdOYW1lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fJHJvb3RTY29wZS4kYnJvYWRjYXN0KFVQREFURV9HUk9VUFNfRVZFTlQsIHRoaXMuZ3JvdXBzKTtcclxuICAgICAgICAvLyBVcGRhdGUgdGl0bGUgaW4gb3V0ZXIgc2NvcGVcclxuICAgICAgICB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc1RlbXBsYXRlc1tncm91cC5pbmRleF0udGl0bGUgPSBncm91cC50aXRsZTtcclxuICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25LeWVwcmVzc1RpdGxlSW5wdXQgKGdyb3VwLCBldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICB0aGlzLm9uQmx1clRpdGxlSW5wdXQoZ3JvdXApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIG91dGVyIHNjb3BlIGZ1bmN0aW9uc1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc1RlbXBsYXRlcyh1cGRhdGVUeXBlOiBzdHJpbmcsIHNvdXJjZT86IGFueSkge1xyXG4gICAgICBzd2l0Y2godXBkYXRlVHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ2FkZEdyb3VwJzogXHJcbiAgICAgICAgICBpZiAodGhpcy5ncm91cHMubGVuZ3RoICE9PSB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc1RlbXBsYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc1RlbXBsYXRlcy5wdXNoKHNvdXJjZSk7XHJcbiAgICAgICAgICB9ICAgICAgICAgIFxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbW92ZVRpbGUnOiBcclxuICAgICAgICAgIGNvbnN0IHtmcm9tSW5kZXgsIHRvSW5kZXgsIHRpbGVPcHRpb25zLCBmcm9tVGlsZUluZGV4fSA9IHtcclxuICAgICAgICAgICAgZnJvbUluZGV4OiBzb3VyY2UuZnJvbS5lbGVtLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSxcclxuICAgICAgICAgICAgdG9JbmRleDogc291cmNlLnRvLmVsZW0uYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlLFxyXG4gICAgICAgICAgICB0aWxlT3B0aW9uczogc291cmNlLnRpbGUub3B0cy5vcHRpb25zLFxyXG4gICAgICAgICAgICBmcm9tVGlsZUluZGV4OiBzb3VyY2UudGlsZS5vcHRzLm9wdGlvbnMuaW5kZXhcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuXyRzY29wZVsnZHJhZ2dhYmxlQ3RybCddLnRpbGVzVGVtcGxhdGVzW2Zyb21JbmRleF0uc291cmNlLnNwbGljZShmcm9tVGlsZUluZGV4LCAxKTtcclxuICAgICAgICAgIHRoaXMuXyRzY29wZVsnZHJhZ2dhYmxlQ3RybCddLnRpbGVzVGVtcGxhdGVzW3RvSW5kZXhdLnNvdXJjZS5wdXNoKHtvcHRzOiB0aWxlT3B0aW9uc30pO1xyXG5cclxuICAgICAgICAgIHRoaXMucmVJbmRleFRpbGVzKHNvdXJjZS5mcm9tLmVsZW0pO1xyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoc291cmNlLnRvLmVsZW0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNYW5hZ2UgdGlsZXMgZnVuY3Rpb25zXHJcbiAgICBwcml2YXRlIHJlbW92ZVRpbGVzKGdyb3VwLCBpbmRleGVzLCBjb250YWluZXIpIHtcclxuICAgICAgY29uc3QgdGlsZXMgPSAkKGNvbnRhaW5lcikuZmluZCgnLnBpcC1kcmFnZ2FibGUtdGlsZScpO1xyXG5cclxuICAgICAgXy5lYWNoKGluZGV4ZXMsIChpbmRleCkgPT4ge1xyXG4gICAgICAgIGdyb3VwLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgdGlsZXNbaW5kZXhdLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVJbmRleFRpbGVzKGNvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZUluZGV4VGlsZXMoY29udGFpbmVyLCBnSW5kZXg/KSB7XHJcbiAgICAgIGNvbnN0IHRpbGVzID0gJChjb250YWluZXIpLmZpbmQoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKSxcclxuICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGdJbmRleCA9PT0gdW5kZWZpbmVkID8gY29udGFpbmVyLmF0dHJpYnV0ZXNbJ2RhdGEtZ3JvdXAtaWQnXS52YWx1ZSA6IGdJbmRleDtcclxuXHJcbiAgICAgIF8uZWFjaCh0aWxlcywgKHRpbGUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgbGV0IGNoaWxkID0gJCh0aWxlKS5jaGlsZHJlbigpWzBdO1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnaW5kZXgnXSA9IGluZGV4O1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChjaGlsZCkuc2NvcGUoKVsnZ3JvdXBJbmRleCddID0gZ3JvdXBJbmRleDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVHcm91cHMobmV3R3JvdXBzKSB7XHJcbiAgICAgIGNvbnN0IHJlbW92ZUluZGV4ZXMgPSBbXSxcclxuICAgICAgICAgICAgcmVtYWluID0gW10sXHJcbiAgICAgICAgICAgIGNvbnRhaW5lcnMgPSBbXTtcclxuXHJcblxyXG4gICAgICBfLmVhY2godGhpcy5ncm91cHMsIChncm91cCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgIGlmIChfLmZpbmRJbmRleChuZXdHcm91cHMsIChnKSA9PiB7IHJldHVybiBnWyd0aXRsZSddID09PSBncm91cC50aXRsZX0pIDwgMCkge1xyXG4gICAgICAgICAgICByZW1vdmVJbmRleGVzLnB1c2goaW5kZXgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVtYWluLnB1c2goaW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIF8uZWFjaChyZW1vdmVJbmRleGVzLnJldmVyc2UoKSwgKGluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgdGhpcy50aWxlR3JvdXBzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgXy5lYWNoKHJlbWFpbiwgKGluZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb250YWluZXJzLnB1c2godGhpcy5ncm91cHNDb250YWluZXJzW2luZGV4XSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgIHRoaXMuZ3JvdXBzQ29udGFpbmVycyA9IGNvbnRhaW5lcnM7XHJcblxyXG4gICAgICBfLmVhY2godGhpcy5ncm91cHNDb250YWluZXJzLCAoY29udGFpbmVyLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5yZUluZGV4VGlsZXMoY29udGFpbmVyLCBpbmRleCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkR3JvdXAoc291cmNlR3JvdXApIHtcclxuICAgICAgbGV0IGdyb3VwID0ge1xyXG4gICAgICAgIHRpdGxlIDogc291cmNlR3JvdXAudGl0bGUsXHJcbiAgICAgICAgc291cmNlOiBzb3VyY2VHcm91cC5zb3VyY2UubWFwKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICBsZXQgdGlsZVNjb3BlID0gdGhpcy5fJHJvb3RTY29wZS4kbmV3KGZhbHNlLCB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc0NvbnRleHQpO1xyXG4gICAgICAgICAgdGlsZVNjb3BlWydpbmRleCddID0gdGlsZS5vcHRzLmluZGV4ID09IHVuZGVmaW5lZCA/IHRpbGUub3B0cy5vcHRpb25zLmluZGV4IDogdGlsZS5vcHRzLmluZGV4IDtcclxuICAgICAgICAgIHRpbGVTY29wZVsnZ3JvdXBJbmRleCddID0gdGlsZS5vcHRzLmdyb3VwSW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuZ3JvdXBJbmRleCA6IHRpbGUub3B0cy5ncm91cEluZGV4O1xyXG4gICAgICAgICAgcmV0dXJuIElEcmFnVGlsZUNvbnN0cnVjdG9yKERyYWdUaWxlU2VydmljZSwge1xyXG4gICAgICAgICAgICB0cGwgICAgOiB0aGlzLl8kY29tcGlsZSh0aWxlLnRlbXBsYXRlKSh0aWxlU2NvcGUpLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB0aWxlLm9wdHMsXHJcbiAgICAgICAgICAgIHNpemUgICA6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5ncm91cHMucHVzaChncm91cCk7XHJcbiAgICAgIGlmICghdGhpcy5fJHNjb3BlLiQkcGhhc2UpIHRoaXMuXyRzY29wZS4kYXBwbHkoKTtcclxuXHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmdyb3Vwc0NvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0cy5ncm91cENvbnRhbmluZXJTZWxlY3Rvcik7XHJcbiAgICAgICAgdGhpcy50aWxlR3JvdXBzLnB1c2goXHJcbiAgICAgICAgICBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCB0aGlzLm9wdHMsIHRoaXMuYXZhaWxhYmxlQ29sdW1ucywgdGhpcy5ncm91cHNDb250YWluZXJzW3RoaXMuZ3JvdXBzQ29udGFpbmVycy5sZW5ndGggLSAxXSlcclxuICAgICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucygpXHJcbiAgICAgICAgICAgIC5jYWxjQ29udGFpbmVySGVpZ2h0KClcclxuICAgICAgICApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNUZW1wbGF0ZXMoJ2FkZEdyb3VwJywgc291cmNlR3JvdXApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkVGlsZXNJbnRvR3JvdXAobmV3VGlsZXMsIGdyb3VwLCBncm91cENvbnRhaW5lcikge1xyXG4gICAgICBuZXdUaWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5fJHJvb3RTY29wZS4kbmV3KGZhbHNlLCB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc0NvbnRleHQpO1xyXG4gICAgICAgIHRpbGVTY29wZVsnaW5kZXgnXSA9IHRpbGUub3B0cy5pbmRleCA9PSB1bmRlZmluZWQgPyB0aWxlLm9wdHMub3B0aW9ucy5pbmRleCA6IHRpbGUub3B0cy5pbmRleCA7XHJcbiAgICAgICAgdGlsZVNjb3BlWydncm91cEluZGV4J10gPSB0aWxlLm9wdHMuZ3JvdXBJbmRleCA9PSB1bmRlZmluZWQgPyB0aWxlLm9wdHMub3B0aW9ucy5ncm91cEluZGV4IDogdGlsZS5vcHRzLmdyb3VwSW5kZXg7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld1RpbGUgPSBJRHJhZ1RpbGVDb25zdHJ1Y3RvcihEcmFnVGlsZVNlcnZpY2Use1xyXG4gICAgICAgICAgdHBsICAgIDogdGhpcy5fJGNvbXBpbGUodGlsZS50ZW1wbGF0ZSkodGlsZVNjb3BlKSxcclxuICAgICAgICAgIG9wdGlvbnM6IHRpbGUub3B0cyxcclxuICAgICAgICAgIHNpemUgICA6IHRpbGUub3B0cy5zaXplXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZFRpbGUobmV3VGlsZSk7XHJcblxyXG4gICAgICAgICQoJzxkaXY+JylcclxuICAgICAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5hcHBlbmQobmV3VGlsZS5nZXRDb21waWxlZFRlbXBsYXRlKCkpXHJcbiAgICAgICAgICAuYXBwZW5kVG8oZ3JvdXBDb250YWluZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbGVzT3B0aW9ucyhvcHRpb25zR3JvdXApIHtcclxuICAgICAgb3B0aW9uc0dyb3VwLmZvckVhY2goKG9wdGlvbkdyb3VwKSA9PiB7XHJcbiAgICAgICAgb3B0aW9uR3JvdXAuc291cmNlLmZvckVhY2goKHRpbGVPcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnRpbGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgICAgZ3JvdXAudXBkYXRlVGlsZU9wdGlvbnModGlsZU9wdGlvbnMub3B0cyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0VGlsZXNHcm91cHModGlsZUdyb3Vwcywgb3B0cywgZ3JvdXBzQ29udGFpbmVycykge1xyXG4gICAgICByZXR1cm4gdGlsZUdyb3Vwcy5tYXAoKGdyb3VwLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBJVGlsZXNHcmlkQ29uc3RydWN0b3IoVGlsZXNHcmlkU2VydmljZSwgZ3JvdXAuc291cmNlLCBvcHRzLCB0aGlzLmF2YWlsYWJsZUNvbHVtbnMsIGdyb3Vwc0NvbnRhaW5lcnNbaW5kZXhdKVxyXG4gICAgICAgICAgLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSlcclxuICAgICAgICAgIC5zZXRUaWxlc0RpbWVuc2lvbnMoKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVUaWxlc0dyb3Vwcyhvbmx5UG9zaXRpb24/LCBkcmFnZ2VkVGlsZT8pIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIGdyb3VwLmdlbmVyYXRlR3JpZCh0aGlzLmdldFNpbmdsZVRpbGVXaWR0aEZvck1vYmlsZSh0aGlzLmF2YWlsYWJsZVdpZHRoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBncm91cFxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKVxyXG4gICAgICAgICAgLmNhbGNDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDb250YWluZXJXaWR0aCgpOiBhbnkge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl8kc2NvcGVbJyRjb250YWluZXInXSB8fCAkKCdib2R5Jyk7XHJcbiAgICAgIHJldHVybiBjb250YWluZXIud2lkdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEF2YWlsYWJsZUNvbHVtbnMoYXZhaWxhYmxlV2lkdGgpOiBhbnkge1xyXG4gICAgICByZXR1cm4gdGhpcy5vcHRzLm1vYmlsZUJyZWFrcG9pbnQgPiBhdmFpbGFibGVXaWR0aCA/IFNJTVBMRV9MQVlPVVRfQ09MVU1OU19DT1VOVFxyXG4gICAgICAgIDogTWF0aC5mbG9vcihhdmFpbGFibGVXaWR0aCAvICh0aGlzLm9wdHMudGlsZVdpZHRoICsgdGhpcy5vcHRzLmd1dHRlcikpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QWN0aXZlR3JvdXBBbmRUaWxlKGVsZW0pOiBhbnkge1xyXG4gICAgICBjb25zdCBhY3RpdmUgPSB7fTtcclxuXHJcbiAgICAgIHRoaXMudGlsZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZvdW5kVGlsZSA9IGdyb3VwLmdldFRpbGVCeU5vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIGlmIChmb3VuZFRpbGUpIHtcclxuICAgICAgICAgIGFjdGl2ZVsnZ3JvdXAnXSA9IGdyb3VwO1xyXG4gICAgICAgICAgYWN0aXZlWyd0aWxlJ10gID0gZm91bmRUaWxlO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gYWN0aXZlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U2luZ2xlVGlsZVdpZHRoRm9yTW9iaWxlKGF2YWlsYWJsZVdpZHRoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0cy5tb2JpbGVCcmVha3BvaW50ID4gYXZhaWxhYmxlV2lkdGggPyBhdmFpbGFibGVXaWR0aCAvIDIgLSB0aGlzLm9wdHMuZ3V0dGVyIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJhZ1N0YXJ0TGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgYWN0aXZlRW50aXRpZXMgPSB0aGlzLmdldEFjdGl2ZUdyb3VwQW5kVGlsZShldmVudC50YXJnZXQpO1xyXG5cclxuICAgICAgdGhpcy5jb250YWluZXIgICAgICAgICAgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50KCcucGlwLWRyYWdnYWJsZS1ncm91cCcpLmdldCgwKTtcclxuICAgICAgdGhpcy5kcmFnZ2VkVGlsZSAgICAgICAgPSBhY3RpdmVFbnRpdGllc1sndGlsZSddO1xyXG4gICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCA9IGFjdGl2ZUVudGl0aWVzWydncm91cCddO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5fJGVsZW1lbnQuYWRkQ2xhc3MoJ2RyYWctdHJhbnNmZXInKTtcclxuXHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUuc3RhcnREcmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICBjb25zdCB4ICAgICAgPSAocGFyc2VGbG9hdCh0YXJnZXQuc3R5bGUubGVmdCkgfHwgMCkgKyBldmVudC5keDtcclxuICAgICAgY29uc3QgeSAgICAgID0gKHBhcnNlRmxvYXQodGFyZ2V0LnN0eWxlLnRvcCkgfHwgMCkgKyBldmVudC5keTtcclxuXHJcbiAgICAgIHRoaXMuY29udGFpbmVyT2Zmc2V0ID0gdGhpcy5nZXRDb250YWluZXJPZmZzZXQoKTtcclxuXHJcbiAgICAgIHRhcmdldC5zdHlsZS5sZWZ0ID0geCArICdweCc7IC8vIFRPRE8gW2FwaWRoaXJueWldIEV4dHJhY3QgdW5pdHMgaW50byBvcHRpb25zIHNlY3Rpb25cclxuICAgICAgdGFyZ2V0LnN0eWxlLnRvcCAgPSB5ICsgJ3B4JztcclxuXHJcbiAgICAgIGNvbnN0IGJlbG93RWxlbWVudCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVCeUNvb3JkaW5hdGVzKHtcclxuICAgICAgICBsZWZ0OiBldmVudC5wYWdlWCAtIHRoaXMuY29udGFpbmVyT2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgdG9wIDogZXZlbnQucGFnZVkgLSB0aGlzLmNvbnRhaW5lck9mZnNldC50b3BcclxuICAgICAgfSwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcblxyXG4gICAgICBpZiAoYmVsb3dFbGVtZW50KSB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dlZFRpbGVJbmRleCA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwLmdldFRpbGVJbmRleCh0aGlzLmRyYWdnZWRUaWxlKTtcclxuICAgICAgICBjb25zdCBiZWxvd0VsZW1JbmRleCAgID0gdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAuZ2V0VGlsZUluZGV4KGJlbG93RWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICgoZHJhZ2dlZFRpbGVJbmRleCArIDEpID09PSBiZWxvd0VsZW1JbmRleCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXBcclxuICAgICAgICAgIC5zd2FwVGlsZXModGhpcy5kcmFnZ2VkVGlsZSwgYmVsb3dFbGVtZW50KVxyXG4gICAgICAgICAgLnNldFRpbGVzRGltZW5zaW9ucyh0cnVlLCB0aGlzLmRyYWdnZWRUaWxlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4geyB0aGlzLnNldEdyb3VwQ29udGFpbmVyc0hlaWdodCgpOyB9LCAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnRW5kTGlzdGVuZXIoKSB7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUuc3RvcERyYWcodGhpcy5pc1NhbWVEcm9wem9uZSk7XHJcblxyXG4gICAgICB0aGlzLl8kZWxlbWVudC5yZW1vdmVDbGFzcygnZHJhZy10cmFuc2ZlcicpO1xyXG4gICAgICB0aGlzLmFjdGl2ZURyYWdnZWRHcm91cCA9IG51bGw7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZFRpbGUgICAgICAgID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldENvbnRhaW5lck9mZnNldCgpIHtcclxuICAgICAgY29uc3QgY29udGFpbmVyUmVjdCA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBsZWZ0OiBjb250YWluZXJSZWN0LmxlZnQsXHJcbiAgICAgICAgdG9wIDogY29udGFpbmVyUmVjdC50b3BcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEdyb3VwQ29udGFpbmVyc0hlaWdodCgpIHtcclxuICAgICAgdGhpcy50aWxlR3JvdXBzLmZvckVhY2goKHRpbGVHcm91cCkgPT4ge1xyXG4gICAgICAgIHRpbGVHcm91cC5jYWxjQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW92ZVRpbGUoZnJvbSwgdG8sIHRpbGUpIHtcclxuICAgICAgbGV0IGVsZW07XHJcbiAgICAgIGNvbnN0IG1vdmVkVGlsZSA9IGZyb20ucmVtb3ZlVGlsZSh0aWxlKTtcclxuICAgICAgY29uc3QgdGlsZVNjb3BlID0gdGhpcy5fJHJvb3RTY29wZS4kbmV3KGZhbHNlLCB0aGlzLl8kc2NvcGVbJ2RyYWdnYWJsZUN0cmwnXS50aWxlc0NvbnRleHQpO1xyXG4gICAgICAgICAgdGlsZVNjb3BlWydpbmRleCddID0gdGlsZS5vcHRzLmluZGV4ID09IHVuZGVmaW5lZCA/IHRpbGUub3B0cy5vcHRpb25zLmluZGV4IDogdGlsZS5vcHRzLmluZGV4IDtcclxuICAgICAgICAgIHRpbGVTY29wZVsnZ3JvdXBJbmRleCddID0gdGlsZS5vcHRzLmdyb3VwSW5kZXggPT0gdW5kZWZpbmVkID8gdGlsZS5vcHRzLm9wdGlvbnMuZ3JvdXBJbmRleCA6IHRpbGUub3B0cy5ncm91cEluZGV4O1xyXG5cclxuICAgICAgJCh0aGlzLmdyb3Vwc0NvbnRhaW5lcnNbXy5maW5kSW5kZXgodGhpcy50aWxlR3JvdXBzLCBmcm9tKV0pXHJcbiAgICAgICAgLmZpbmQobW92ZWRUaWxlLmdldEVsZW0oKSlcclxuICAgICAgICAucmVtb3ZlKCk7XHJcblxyXG4gICAgICBpZiAodG8gIT09IG51bGwpIHtcclxuICAgICAgICB0by5hZGRUaWxlKG1vdmVkVGlsZSk7XHJcblxyXG4gICAgICAgIGVsZW0gPSB0aGlzLl8kY29tcGlsZShtb3ZlZFRpbGUuZ2V0RWxlbSgpKSh0aWxlU2NvcGUpO1xyXG5cclxuICAgICAgICAkKHRoaXMuZ3JvdXBzQ29udGFpbmVyc1tfLmZpbmRJbmRleCh0aGlzLnRpbGVHcm91cHMsIHRvKV0pXHJcbiAgICAgICAgICAuYXBwZW5kKGVsZW0pO1xyXG5cclxuICAgICAgICB0aGlzLl8kdGltZW91dCh0by5zZXRUaWxlc0RpbWVuc2lvbnMuYmluZCh0bywgdHJ1ZSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRpbGVzVGVtcGxhdGVzKCdtb3ZlVGlsZScsIHtmcm9tOiBmcm9tLCB0bzogdG8sIHRpbGU6IG1vdmVkVGlsZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Ecm9wTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZHJvcHBlZEdyb3VwSW5kZXggPSBldmVudC50YXJnZXQuYXR0cmlidXRlc1snZGF0YS1ncm91cC1pZCddLnZhbHVlO1xyXG4gICAgICBjb25zdCBkcm9wcGVkR3JvdXAgICAgICA9IHRoaXMudGlsZUdyb3Vwc1tkcm9wcGVkR3JvdXBJbmRleF07XHJcblxyXG4gICAgICBpZiAodGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAgIT09IGRyb3BwZWRHcm91cCkge1xyXG4gICAgICAgIHRoaXMubW92ZVRpbGUodGhpcy5hY3RpdmVEcmFnZ2VkR3JvdXAsIGRyb3BwZWRHcm91cCwgdGhpcy5kcmFnZ2VkVGlsZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVGlsZXNHcm91cHModHJ1ZSk7XHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcFRvRmljdEdyb3VwTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgY29uc3QgZnJvbSA9IHRoaXMuYWN0aXZlRHJhZ2dlZEdyb3VwO1xyXG4gICAgICBjb25zdCB0aWxlID0gdGhpcy5kcmFnZ2VkVGlsZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkR3JvdXAoe3RpdGxlOiAnTmV3IGdyb3VwJywgc291cmNlOiBbXX0pO1xyXG4gICAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVGlsZShmcm9tLCB0aGlzLnRpbGVHcm91cHNbdGhpcy50aWxlR3JvdXBzLmxlbmd0aCAtIDFdLCB0aWxlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpbGVzR3JvdXBzKHRydWUpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcEVudGVyTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgaWYgKCF0aGlzLnNvdXJjZURyb3Bab25lRWxlbSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlRHJvcFpvbmVFbGVtID0gZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc291cmNlRHJvcFpvbmVFbGVtICE9PSBldmVudC5kcmFnRXZlbnQuZHJhZ0VudGVyKSB7XHJcbiAgICAgICAgZXZlbnQuZHJhZ0V2ZW50LmRyYWdFbnRlci5jbGFzc0xpc3QuYWRkKCdkcm9wem9uZS1hY3RpdmUnKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnY29weScpO1xyXG4gICAgICAgIHRoaXMuaXNTYW1lRHJvcHpvbmUgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgICAgdGhpcy5pc1NhbWVEcm9wem9uZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcERlYWN0aXZhdGVMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICBpZiAodGhpcy5zb3VyY2VEcm9wWm9uZUVsZW0gIT09IGV2ZW50LnRhcmdldCkge1xyXG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMub3B0cy5hY3RpdmVEcm9wem9uZUNsYXNzKTtcclxuICAgICAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uRHJvcExlYXZlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5vcHRzLmFjdGl2ZURyb3B6b25lQ2xhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlV2lkdGggICA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkdGgoKTtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZUNvbHVtbnMgPSB0aGlzLmdldEF2YWlsYWJsZUNvbHVtbnModGhpcy5hdmFpbGFibGVXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5ncm91cHNDb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdHMuZ3JvdXBDb250YW5pbmVyU2VsZWN0b3IpO1xyXG4gICAgICAgIHRoaXMudGlsZUdyb3VwcyAgICAgICA9IHRoaXMuaW5pdFRpbGVzR3JvdXBzKHRoaXMuZ3JvdXBzLCB0aGlzLm9wdHMsIHRoaXMuZ3JvdXBzQ29udGFpbmVycyk7XHJcblxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJylcclxuICAgICAgICAgIC5kcmFnZ2FibGUoe1xyXG4gICAgICAgICAgICAvLyBlbmFibGUgYXV0b1Njcm9sbFxyXG4gICAgICAgICAgICBhdXRvU2Nyb2xsOiB0cnVlLFxyXG4gICAgICAgICAgICBvbnN0YXJ0OiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyYWdTdGFydExpc3RlbmVyKGV2ZW50KSB9LFxyXG4gICAgICAgICAgICBvbm1vdmUgOiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIH0sXHJcbiAgICAgICAgICAgIG9uZW5kICA6IChldmVudCkgPT4geyB0aGlzLm9uRHJhZ0VuZExpc3RlbmVyKCkgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLWdyb3VwLmZpY3QtZ3JvdXAnKVxyXG4gICAgICAgICAgLmRyb3B6b25lKHtcclxuICAgICAgICAgICAgb25kcm9wOiAoZXZlbnQpID0+IHsgY29uc29sZS5sb2coJ2hlcmUnKTsgIHRoaXMub25Ecm9wVG9GaWN0R3JvdXBMaXN0ZW5lcihldmVudCkgfSxcclxuICAgICAgICAgICAgb25kcmFnZW50ZXIgICAgIDogKGV2ZW50KSA9PiB7IHRoaXMub25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudCkgfSxcclxuICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogKGV2ZW50KSA9PiB7IHRoaXMub25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KSB9LFxyXG4gICAgICAgICAgICBvbmRyYWdsZWF2ZSAgICAgOiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyb3BMZWF2ZUxpc3RlbmVyKGV2ZW50KSB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS1ncm91cCcpXHJcbiAgICAgICAgICAuZHJvcHpvbmUoe1xyXG4gICAgICAgICAgICBvbmRyb3AgICAgICAgICAgOiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyb3BMaXN0ZW5lcihldmVudCkgfSxcclxuICAgICAgICAgICAgb25kcmFnZW50ZXIgICAgIDogKGV2ZW50KSA9PiB7IHRoaXMub25Ecm9wRW50ZXJMaXN0ZW5lcihldmVudCkgfSxcclxuICAgICAgICAgICAgb25kcm9wZGVhY3RpdmF0ZTogKGV2ZW50KSA9PiB7IHRoaXMub25Ecm9wRGVhY3RpdmF0ZUxpc3RlbmVyKGV2ZW50KSB9LFxyXG4gICAgICAgICAgICBvbmRyYWdsZWF2ZSAgICAgOiAoZXZlbnQpID0+IHsgdGhpcy5vbkRyb3BMZWF2ZUxpc3RlbmVyKGV2ZW50KSB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fJHNjb3BlWyckY29udGFpbmVyJ11cclxuICAgICAgICAgIC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAnbWQtbWVudSAubWQtaWNvbi1idXR0b24nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGludGVyYWN0KCcucGlwLWRyYWdnYWJsZS10aWxlJykuZHJhZ2dhYmxlKGZhbHNlKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5vbignbW91c2V1cCB0b3VjaGVuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgaW50ZXJhY3QoJy5waXAtZHJhZ2dhYmxlLXRpbGUnKS5kcmFnZ2FibGUodHJ1ZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgICAuY29udHJvbGxlcigncGlwRHJhZ2dhYmxlQ3RybCcsIERyYWdnYWJsZUNvbnRyb2xsZXIpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgLmRpcmVjdGl2ZSgncGlwRHJhZ2dhYmxlR3JpZCcsIERyYWdEaXJlY3RpdmUpO1xyXG5cclxuZnVuY3Rpb24gRHJhZ0RpcmVjdGl2ZSgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHRpbGVzVGVtcGxhdGVzOiAnPXBpcFRpbGVzVGVtcGxhdGVzJyxcclxuICAgICAgdGlsZXNDb250ZXh0OiAnPXBpcFRpbGVzQ29udGV4dCcsXHJcbiAgICAgIG9wdGlvbnM6ICc9cGlwRHJhZ2dhYmxlR3JpZCcsXHJcbiAgICAgIGdyb3VwTWVudUFjdGlvbnM6ICc9cGlwR3JvdXBNZW51QWN0aW9ucydcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2RyYWdnYWJsZS9EcmFnZ2FibGUuaHRtbCcsXHJcbiAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgY29udHJvbGxlckFzOiAnZHJhZ2dhYmxlQ3RybCcsXHJcbiAgICBjb250cm9sbGVyOiAncGlwRHJhZ2dhYmxlQ3RybCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbSkge1xyXG4gICAgICAkc2NvcGUuJGNvbnRhaW5lciA9ICRlbGVtO1xyXG4gICAgfVxyXG4gIH07XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERyYWdUaWxlQ29uc3RydWN0b3Ige1xyXG4gIG5ldyAob3B0aW9uczogYW55KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIElEcmFnVGlsZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBEcmFnVGlsZUNvbnN0cnVjdG9yLCBvcHRpb25zOiBhbnkpOiBJRHJhZ1RpbGVTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHRwbDogYW55O1xyXG4gIG9wdHM6IGFueTtcclxuICBzaXplOiBhbnk7XHJcbiAgZWxlbTogYW55O1xyXG4gIHByZXZpZXc6IGFueTtcclxuICBnZXRTaXplKCk6IGFueTtcclxuICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnk7XHJcbiAgc2V0UG9zaXRpb24obGVmdCwgdG9wKTogYW55O1xyXG4gIGdldENvbXBpbGVkVGVtcGxhdGUoKTogYW55O1xyXG4gIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55O1xyXG4gIGdldEVsZW0oKTogYW55O1xyXG4gIHN0YXJ0RHJhZygpOiBhbnk7XHJcbiAgc3RvcERyYWcoaXNBbmltYXRlKTogYW55O1xyXG4gIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpOiB2b2lkO1xyXG4gIGdldE9wdGlvbnMoKTogYW55O1xyXG4gIHNldE9wdGlvbnMob3B0aW9ucyk6IGFueTtcclxufVxyXG5cclxubGV0IERFRkFVTFRfVElMRV9TSVpFID0ge1xyXG4gIGNvbFNwYW46IDEsXHJcbiAgcm93U3BhbjogMVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIERyYWdUaWxlU2VydmljZSBpbXBsZW1lbnRzIElEcmFnVGlsZVNlcnZpY2Uge1xyXG4gIHB1YmxpYyB0cGw6IGFueTtcclxuICBwdWJsaWMgb3B0czogYW55O1xyXG4gIHB1YmxpYyBzaXplOiBhbnk7XHJcbiAgcHVibGljIGVsZW06IGFueTtcclxuICBwdWJsaWMgcHJldmlldzogYW55O1xyXG5cclxuICBjb25zdHJ1Y3RvciAob3B0aW9uczogYW55KSB7XHJcbiAgICB0aGlzLnRwbCA9IG9wdGlvbnMudHBsLmdldCgwKTtcclxuICAgIHRoaXMub3B0cyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLnNpemUgPSBfLm1lcmdlKHt9LCBERUZBVUxUX1RJTEVfU0laRSwgb3B0aW9ucy5zaXplKTtcclxuICAgIHRoaXMuZWxlbSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2l6ZSgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2l6ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRTaXplKHdpZHRoLCBoZWlnaHQpOiBhbnkge1xyXG4gICAgdGhpcy5zaXplLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLnNpemUuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFBvc2l0aW9uKGxlZnQsIHRvcCk6IGFueSB7XHJcbiAgICB0aGlzLnNpemUubGVmdCA9IGxlZnQ7XHJcbiAgICB0aGlzLnNpemUudG9wID0gdG9wO1xyXG5cclxuICAgIGlmICh0aGlzLmVsZW0pIHtcclxuICAgICAgdGhpcy5lbGVtLmNzcyh7XHJcbiAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICB0b3A6IHRvcFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDb21waWxlZFRlbXBsYXRlKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy50cGw7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHVwZGF0ZUVsZW0ocGFyZW50KTogYW55IHtcclxuICAgIHRoaXMuZWxlbSA9ICQodGhpcy50cGwpLnBhcmVudChwYXJlbnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtLmdldCgwKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCk6IGFueSB7XHJcbiAgICB0aGlzLnByZXZpZXcgPSAkKCc8ZGl2PicpXHJcbiAgICAgIC5hZGRDbGFzcygncGlwLWRyYWdnZWQtcHJldmlldycpXHJcbiAgICAgIC5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMuZWxlbS5jc3MoJ2xlZnQnKSxcclxuICAgICAgICB0b3A6IHRoaXMuZWxlbS5jc3MoJ3RvcCcpLFxyXG4gICAgICAgIHdpZHRoOiB0aGlzLmVsZW0uY3NzKCd3aWR0aCcpLFxyXG4gICAgICAgIGhlaWdodDogdGhpcy5lbGVtLmNzcygnaGVpZ2h0JylcclxuICAgICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtXHJcbiAgICAgIC5hZGRDbGFzcygnbm8tYW5pbWF0aW9uJylcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgekluZGV4OiAnOTk5OSdcclxuICAgICAgfSlcclxuICAgICAgLmFmdGVyKHRoaXMucHJldmlldyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0b3BEcmFnKGlzQW5pbWF0ZSk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgaWYgKGlzQW5pbWF0ZSkge1xyXG4gICAgICB0aGlzLmVsZW1cclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ25vLWFuaW1hdGlvbicpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiB0aGlzLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHRoaXMucHJldmlldy5jc3MoJ3RvcCcpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub24oJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiBzZWxmLnByZXZpZXcuY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICB0b3A6IHNlbGYucHJldmlldy5jc3MoJ3RvcCcpLFxyXG4gICAgICAgICAgekluZGV4OiAnJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCduby1hbmltYXRpb24nKTtcclxuXHJcbiAgICAgIHNlbGYucHJldmlldy5yZW1vdmUoKTtcclxuICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICBmdW5jdGlvbiBvblRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICAgIGlmIChzZWxmLnByZXZpZXcpIHtcclxuICAgICAgICBzZWxmLnByZXZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgc2VsZi5wcmV2aWV3ID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5lbGVtXHJcbiAgICAgICAgLmNzcygnekluZGV4JywgJycpXHJcbiAgICAgICAgLm9mZigndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHNldFByZXZpZXdQb3NpdGlvbihjb29yZHMpIHtcclxuICAgIHRoaXMucHJldmlldy5jc3MoY29vcmRzKTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0T3B0aW9ucygpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0cy5vcHRpb25zO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRPcHRpb25zKG9wdGlvbnMpOiBhbnkge1xyXG4gICAgXy5tZXJnZSh0aGlzLm9wdHMub3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICBfLm1lcmdlKHRoaXMuc2l6ZSwgb3B0aW9ucy5zaXplKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgncGlwRHJhZ2dlZCcpXHJcbiAgLnNlcnZpY2UoJ3BpcERyYWdUaWxlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgIGxldCBuZXdUaWxlID0gbmV3IERyYWdUaWxlU2VydmljZShvcHRpb25zKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdUaWxlO1xyXG4gICAgfVxyXG4gIH0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBEcmFnZ2VkJylcclxuICAuZGlyZWN0aXZlKCdwaXBEcmFnZ2FibGVUaWxlcycsIERyYWdnYWJsZVRpbGUpO1xyXG5cclxuZnVuY3Rpb24gRHJhZ2dhYmxlVGlsZSgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtLCAkYXR0cikge1xyXG4gICAgICB2YXIgZG9jRnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgICAgdmFyIGdyb3VwID0gJHNjb3BlLiRldmFsKCRhdHRyLnBpcERyYWdnYWJsZVRpbGVzKTtcclxuXHJcbiAgICAgIGdyb3VwLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcclxuICAgICAgICB2YXIgdHBsID0gd3JhcENvbXBvbmVudCh0aWxlLmdldENvbXBpbGVkVGVtcGxhdGUoKSk7XHJcbiAgICAgICAgZG9jRnJhZy5hcHBlbmRDaGlsZCh0cGwpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICRlbGVtLmFwcGVuZChkb2NGcmFnKTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIHdyYXBDb21wb25lbnQoZWxlbSkge1xyXG4gICAgICAgIHJldHVybiAkKCc8ZGl2PicpXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ3BpcC1kcmFnZ2FibGUtdGlsZScpXHJcbiAgICAgICAgICAuYXBwZW5kKGVsZW0pXHJcbiAgICAgICAgICAuZ2V0KDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGlsZXNHcmlkQ29uc3RydWN0b3Ige1xyXG4gIG5ldyAodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSVRpbGVzR3JpZENvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiBUaWxlc0dyaWRDb25zdHJ1Y3RvciwgdGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pOklUaWxlc0dyaWRTZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgdGlsZXM6IGFueTtcclxuICBvcHRzOiBhbnk7XHJcbiAgY29sdW1uczogYW55O1xyXG4gIGVsZW06IGFueTtcclxuICBncmlkQ2VsbHM6IGFueTtcclxuICBpbmxpbmU6IGJvb2xlYW47XHJcbiAgaXNNb2JpbGVMYXlvdXQ6IGJvb2xlYW47XHJcblxyXG4gIGFkZFRpbGUodGlsZSk6IGFueTtcclxuICBnZXRDZWxsQnlQb3NpdGlvbihyb3csIGNvbCk6IGFueTtcclxuICBnZXRDZWxscyhwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRBdmFpbGFibGVDZWxsc0Rlc2t0b3AocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnk7XHJcbiAgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueTtcclxuICBnZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueTtcclxuICBnZXRCYXNpY1JvdyhwcmV2Q2VsbCk6IGFueTtcclxuICBpc0NlbGxGcmVlKHJvdywgY29sKTogYW55O1xyXG4gIGdldENlbGxJbmRleChzcmNDZWxsKTogYW55O1xyXG4gIHJlc2VydmVDZWxscyhzdGFydCwgZW5kLCBlbGVtKTogdm9pZDtcclxuICBjbGVhckVsZW1lbnRzKCk6IHZvaWQ7XHJcbiAgc2V0QXZhaWxhYmxlQ29sdW1ucyhjb2x1bW5zKTogYW55O1xyXG4gIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGg/KTogYW55O1xyXG4gIHNldFRpbGVzRGltZW5zaW9ucyhvbmx5UG9zaXRpb24sIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGNhbGNDb250YWluZXJIZWlnaHQoKTogYW55O1xyXG4gIGdldFRpbGVCeU5vZGUobm9kZSk6IGFueTtcclxuICBnZXRUaWxlQnlDb29yZGluYXRlcyhjb29yZHMsIGRyYWdnZWRUaWxlKTogYW55O1xyXG4gIGdldFRpbGVJbmRleCh0aWxlKTogYW55O1xyXG4gIHN3YXBUaWxlcyhtb3ZlZFRpbGUsIGJlZm9yZVRpbGUpOiBhbnk7XHJcbiAgcmVtb3ZlVGlsZShyZW1vdmVUaWxlKTogYW55O1xyXG4gIHVwZGF0ZVRpbGVPcHRpb25zKG9wdHMpOiBhbnk7XHJcbn1cclxuXHJcbmxldCBNT0JJTEVfTEFZT1VUX0NPTFVNTlMgPSAyO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRpbGVzR3JpZFNlcnZpY2UgaW1wbGVtZW50cyBJVGlsZXNHcmlkU2VydmljZSB7XHJcbiAgcHVibGljIHRpbGVzOiBhbnk7XHJcbiAgcHVibGljIG9wdHM6IGFueTtcclxuICBwdWJsaWMgY29sdW1uczogYW55O1xyXG4gIHB1YmxpYyBlbGVtOiBhbnk7XHJcbiAgcHVibGljIGdyaWRDZWxsczogYW55ID0gW107XHJcbiAgcHVibGljIGlubGluZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc01vYmlsZUxheW91dDogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IodGlsZXMsIG9wdGlvbnMsIGNvbHVtbnMsIGVsZW0pIHtcclxuICAgIHRoaXMudGlsZXMgPSB0aWxlcztcclxuICAgIHRoaXMub3B0cyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLmNvbHVtbnMgPSBjb2x1bW5zIHx8IDA7IC8vIGF2YWlsYWJsZSBjb2x1bW5zIGluIGEgcm93XHJcbiAgICB0aGlzLmVsZW0gPSBlbGVtO1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMgPSBbXTtcclxuICAgIHRoaXMuaW5saW5lID0gb3B0aW9ucy5pbmxpbmUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmlzTW9iaWxlTGF5b3V0ID0gY29sdW1ucyA9PT0gTU9CSUxFX0xBWU9VVF9DT0xVTU5TO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZFRpbGUodGlsZSk6IGFueSB7XHJcbiAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XHJcbiAgICBpZiAodGhpcy50aWxlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdGhpcy5nZW5lcmF0ZUdyaWQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbEJ5UG9zaXRpb24ocm93LCBjb2wpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZENlbGxzW3Jvd11bY29sXTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbHMocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pOiBhbnkge1xyXG4gICAgaWYgKHRoaXMuaXNNb2JpbGVMYXlvdXQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXZhaWxhYmxlQ2VsbHNNb2JpbGUocHJldkNlbGwsIHJvd1NwYW4sIGNvbFNwYW4pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QXZhaWxhYmxlQ2VsbHNEZXNrdG9wKHByZXZDZWxsLCByb3dTcGFuLCBjb2xTcGFuKTogYW55IHtcclxuICAgIGxldCBsZWZ0Q29ybmVyQ2VsbDtcclxuICAgIGxldCByaWdodENvcm5lckNlbGw7XHJcbiAgICBsZXQgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuICAgIGxldCBiYXNpY1JvdyA9IHRoaXMuZ2V0QmFzaWNSb3cocHJldkNlbGwpO1xyXG5cclxuICAgIC8vIFNtYWxsIHRpbGVcclxuICAgIGlmIChjb2xTcGFuID09PSAxICYmIHJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgbGV0IGdyaWRDb3B5ID0gdGhpcy5ncmlkQ2VsbHMuc2xpY2UoKTtcclxuXHJcbiAgICAgIGlmICghcHJldkNlbGwpIHtcclxuICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IGdyaWRDb3B5WzBdWzBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdywgYmFzaWNDb2wsIHRoaXMuY29sdW1ucyk7XHJcblxyXG4gICAgICAgIGlmICghbGVmdENvcm5lckNlbGwpIHtcclxuICAgICAgICAgIGxldCByb3dTaGlmdCA9IHRoaXMuaXNNb2JpbGVMYXlvdXQgPyAxIDogMjtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsKGdyaWRDb3B5LCBiYXNpY1JvdyArIHJvd1NoaWZ0LCAwLCB0aGlzLmNvbHVtbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1lZGl1bSB0aWxlXHJcbiAgICBpZiAoY29sU3BhbiA9PT0gMiAmJiByb3dTcGFuID09PSAxKSB7XHJcbiAgICAgIGxldCBwcmV2VGlsZVNpemUgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5lbGVtLnNpemUgfHwgbnVsbDtcclxuXHJcbiAgICAgIGlmICghcHJldlRpbGVTaXplKSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMiAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMikge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDIgPiAwKSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93LCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAocHJldlRpbGVTaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldlRpbGVTaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAocHJldkNlbGwucm93ICUgMiA9PT0gMCkge1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgLSAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAyLCAwKTtcclxuICAgICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChwcmV2VGlsZVNpemUuY29sU3BhbiA9PT0gMSAmJiBwcmV2VGlsZVNpemUucm93U3BhbiA9PT0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgLSBiYXNpY0NvbCAtIDMgPj0gMCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuaXNDZWxsRnJlZShiYXNpY1JvdywgYmFzaWNDb2wgKyAxKSkge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMSk7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDApO1xyXG4gICAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDIsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJpZyB0aWxlXHJcbiAgICBpZiAoIXByZXZDZWxsICYmIHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sKTtcclxuICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIGJhc2ljQ29sICsgMSk7XHJcbiAgICB9IGVsc2UgaWYgKHJvd1NwYW4gPT09IDIgJiYgY29sU3BhbiA9PT0gMikge1xyXG4gICAgICBpZiAodGhpcy5jb2x1bW5zIC0gYmFzaWNDb2wgLSAyID4gMCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ2VsbEZyZWUoYmFzaWNSb3csIGJhc2ljQ29sICsgMSkpIHtcclxuICAgICAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdywgYmFzaWNDb2wgKyAxKTtcclxuICAgICAgICAgIHJpZ2h0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3cgKyAxLCBiYXNpY0NvbCArIDIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIGJhc2ljQ29sICsgMik7XHJcbiAgICAgICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMSwgYmFzaWNDb2wgKyAzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgMiwgMCk7XHJcbiAgICAgICAgcmlnaHRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDMsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0Q2VsbChzcmMsIGJhc2ljUm93LCBiYXNpY0NvbCwgY29sdW1ucyk6IGFueSB7XHJcbiAgICBsZXQgY2VsbDtcclxuICAgIGxldCBjb2w7XHJcbiAgICBsZXQgcm93O1xyXG5cclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIC8vIG1vYmlsZSBsYXlvdXRcclxuICAgICAgZm9yIChjb2wgPSBiYXNpY0NvbDsgY29sIDwgY29sdW1uczsgY29sKyspIHtcclxuICAgICAgICBpZiAoIXNyY1tiYXNpY1Jvd11bY29sXS5lbGVtKSB7XHJcbiAgICAgICAgICBjZWxsID0gc3JjW2Jhc2ljUm93XVtjb2xdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gY2VsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZXNrdG9wXHJcbiAgICBmb3IgKGNvbCA9IGJhc2ljQ29sOyBjb2wgPCBjb2x1bW5zOyBjb2wrKykge1xyXG4gICAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IDI7IHJvdysrKSB7XHJcbiAgICAgICAgaWYgKCFzcmNbcm93ICsgYmFzaWNSb3ddW2NvbF0uZWxlbSkge1xyXG4gICAgICAgICAgY2VsbCA9IHNyY1tyb3cgKyBiYXNpY1Jvd11bY29sXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNlbGwpIHtcclxuICAgICAgICByZXR1cm4gY2VsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRBdmFpbGFibGVDZWxsc01vYmlsZShwcmV2Q2VsbCwgcm93U3BhbiwgY29sU3Bhbik6IGFueSB7XHJcbiAgICBsZXQgbGVmdENvcm5lckNlbGw7XHJcbiAgICBsZXQgcmlnaHRDb3JuZXJDZWxsO1xyXG4gICAgbGV0IGJhc2ljUm93ID0gdGhpcy5nZXRCYXNpY1JvdyhwcmV2Q2VsbCk7XHJcbiAgICBsZXQgYmFzaWNDb2wgPSBwcmV2Q2VsbCAmJiBwcmV2Q2VsbC5jb2wgfHwgMDtcclxuXHJcblxyXG4gICAgaWYgKGNvbFNwYW4gPT09IDEgJiYgcm93U3BhbiA9PT0gMSkge1xyXG4gICAgICBsZXQgZ3JpZENvcHkgPSB0aGlzLmdyaWRDZWxscy5zbGljZSgpO1xyXG5cclxuICAgICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICAgIGxlZnRDb3JuZXJDZWxsID0gZ3JpZENvcHlbMF1bMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93LCBiYXNpY0NvbCwgdGhpcy5jb2x1bW5zKTtcclxuXHJcbiAgICAgICAgaWYgKCFsZWZ0Q29ybmVyQ2VsbCkge1xyXG4gICAgICAgICAgbGV0IHJvd1NoaWZ0ID0gdGhpcy5pc01vYmlsZUxheW91dCA/IDEgOiAyO1xyXG4gICAgICAgICAgbGVmdENvcm5lckNlbGwgPSB0aGlzLmdldENlbGwoZ3JpZENvcHksIGJhc2ljUm93ICsgcm93U2hpZnQsIDAsIHRoaXMuY29sdW1ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFwcmV2Q2VsbCkge1xyXG4gICAgICBsZWZ0Q29ybmVyQ2VsbCA9IHRoaXMuZ2V0Q2VsbEJ5UG9zaXRpb24oYmFzaWNSb3csIDApO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgcm93U3BhbiAtIDEsIDEpO1xyXG4gICAgfSBlbHNlIGlmIChjb2xTcGFuID09PSAyKSB7XHJcbiAgICAgIGxlZnRDb3JuZXJDZWxsID0gdGhpcy5nZXRDZWxsQnlQb3NpdGlvbihiYXNpY1JvdyArIDEsIDApO1xyXG4gICAgICByaWdodENvcm5lckNlbGwgPSB0aGlzLmdldENlbGxCeVBvc2l0aW9uKGJhc2ljUm93ICsgcm93U3BhbiwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IGxlZnRDb3JuZXJDZWxsLFxyXG4gICAgICBlbmQ6IHJpZ2h0Q29ybmVyQ2VsbFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0QmFzaWNSb3cocHJldkNlbGwpOiBhbnkge1xyXG4gICAgbGV0IGJhc2ljUm93O1xyXG5cclxuICAgIGlmICh0aGlzLmlzTW9iaWxlTGF5b3V0KSB7XHJcbiAgICAgIGlmIChwcmV2Q2VsbCkge1xyXG4gICAgICAgIGJhc2ljUm93ID0gcHJldkNlbGwgJiYgcHJldkNlbGwucm93IHx8IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYmFzaWNSb3cgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocHJldkNlbGwpIHtcclxuICAgICAgICBiYXNpY1JvdyA9IHByZXZDZWxsLnJvdyAlIDIgPT09IDAgPyBwcmV2Q2VsbC5yb3cgOiBwcmV2Q2VsbC5yb3cgLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2ljUm93ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBiYXNpY1JvdztcclxuICB9O1xyXG5cclxuICBwdWJsaWMgaXNDZWxsRnJlZShyb3csIGNvbCk6IGFueSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZ3JpZENlbGxzW3Jvd11bY29sXS5lbGVtO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxsSW5kZXgoc3JjQ2VsbCk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgaW5kZXg7XHJcblxyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xyXG4gICAgICBpbmRleCA9IF8uZmluZEluZGV4KHNlbGYuZ3JpZENlbGxzW3Jvd0luZGV4XSwgKGNlbGwpID0+IHtcclxuICAgICAgICByZXR1cm4gY2VsbCA9PT0gc3JjQ2VsbDtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gaW5kZXggIT09IC0xID8gaW5kZXggOiAwO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyByZXNlcnZlQ2VsbHMoc3RhcnQsIGVuZCwgZWxlbSkge1xyXG4gICAgdGhpcy5ncmlkQ2VsbHMuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgIHJvdy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgaWYgKGNlbGwucm93ID49IHN0YXJ0LnJvdyAmJiBjZWxsLnJvdyA8PSBlbmQucm93ICYmXHJcbiAgICAgICAgICBjZWxsLmNvbCA+PSBzdGFydC5jb2wgJiYgY2VsbC5jb2wgPD0gZW5kLmNvbCkge1xyXG4gICAgICAgICAgY2VsbC5lbGVtID0gZWxlbTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGNsZWFyRWxlbWVudHMoKSB7XHJcbiAgICB0aGlzLmdyaWRDZWxscy5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgcm93LmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICB0aWxlLmVsZW0gPSBudWxsO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRBdmFpbGFibGVDb2x1bW5zKGNvbHVtbnMpOiBhbnkge1xyXG4gICAgdGhpcy5pc01vYmlsZUxheW91dCA9IGNvbHVtbnMgPT09IE1PQklMRV9MQVlPVVRfQ09MVU1OUztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnM7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIGdlbmVyYXRlR3JpZChzaW5nbGVUaWxlV2lkdGg/KTogYW55IHtcclxuICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgIGxldCBjb2xzSW5Sb3cgPSAwO1xyXG4gICAgbGV0IHJvd3MgPSAwO1xyXG4gICAgbGV0IHRpbGVXaWR0aCA9IHNpbmdsZVRpbGVXaWR0aCB8fCB0aGlzLm9wdHMudGlsZVdpZHRoO1xyXG4gICAgbGV0IG9mZnNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5waXAtZHJhZ2dhYmxlLWdyb3VwLXRpdGxlJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgZ3JpZEluUm93ID0gW107XHJcblxyXG4gICAgdGhpcy5ncmlkQ2VsbHMgPSBbXTtcclxuXHJcbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUsIGluZGV4LCBzcmNUaWxlcykgPT4ge1xyXG4gICAgICBsZXQgdGlsZVNpemUgPSB0aWxlLmdldFNpemUoKTtcclxuXHJcbiAgICAgIGdlbmVyYXRlQ2VsbHModGlsZVNpemUuY29sU3Bhbik7XHJcblxyXG4gICAgICBpZiAoc3JjVGlsZXMubGVuZ3RoID09PSBpbmRleCArIDEpIHtcclxuICAgICAgICBpZiAoY29sc0luUm93IDwgc2VsZi5jb2x1bW5zKSB7XHJcbiAgICAgICAgICBnZW5lcmF0ZUNlbGxzKHNlbGYuY29sdW1ucyAtIGNvbHNJblJvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBtb3JlIGNlbGxzIGZvciBleHRlbmRzIHRpbGUgc2l6ZSB0byBiaWdcclxuICAgICAgICBpZiAoc2VsZi50aWxlcy5sZW5ndGggKiAyID4gc2VsZi5ncmlkQ2VsbHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBBcnJheS5hcHBseShudWxsLCBBcnJheShzZWxmLnRpbGVzLmxlbmd0aCAqIDIgLSBzZWxmLmdyaWRDZWxscy5sZW5ndGgpKS5mb3JFYWNoKCgpID0+IHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVDZWxscyhzZWxmLmNvbHVtbnMpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNlbGxzKG5ld0NlbGxDb3VudCkge1xyXG4gICAgICAgIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KG5ld0NlbGxDb3VudCkpLmZvckVhY2goKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHNlbGYuY29sdW1ucyA8IGNvbHNJblJvdyArIDEpIHtcclxuICAgICAgICAgICAgcm93cysrO1xyXG4gICAgICAgICAgICBjb2xzSW5Sb3cgPSAwO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5ncmlkQ2VsbHMucHVzaChncmlkSW5Sb3cpO1xyXG4gICAgICAgICAgICBncmlkSW5Sb3cgPSBbXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsZXQgdG9wID0gcm93cyAqIHNlbGYub3B0cy50aWxlSGVpZ2h0ICsgKHJvd3MgPyByb3dzICogc2VsZi5vcHRzLmd1dHRlciA6IDApICsgb2Zmc2V0LmhlaWdodDtcclxuICAgICAgICAgIGxldCBsZWZ0ID0gY29sc0luUm93ICogdGlsZVdpZHRoICsgKGNvbHNJblJvdyA/IGNvbHNJblJvdyAqIHNlbGYub3B0cy5ndXR0ZXIgOiAwKTtcclxuXHJcbiAgICAgICAgICAvLyBEZXNjcmliZSBncmlkIGNlbGwgc2l6ZSB0aHJvdWdoIGJsb2NrIGNvcm5lcnMgY29vcmRpbmF0ZXNcclxuICAgICAgICAgIGdyaWRJblJvdy5wdXNoKHtcclxuICAgICAgICAgICAgdG9wOiB0b3AsXHJcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXHJcbiAgICAgICAgICAgIGJvdHRvbTogdG9wICsgc2VsZi5vcHRzLnRpbGVIZWlnaHQsXHJcbiAgICAgICAgICAgIHJpZ2h0OiBsZWZ0ICsgdGlsZVdpZHRoLFxyXG4gICAgICAgICAgICByb3c6IHJvd3MsXHJcbiAgICAgICAgICAgIGNvbDogY29sc0luUm93XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBjb2xzSW5Sb3crKztcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzZXRUaWxlc0RpbWVuc2lvbnMob25seVBvc2l0aW9uLCBkcmFnZ2VkVGlsZSk6IGFueSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICBsZXQgY3VyckluZGV4ID0gMDtcclxuICAgIGxldCBwcmV2Q2VsbDtcclxuXHJcbiAgICBpZiAob25seVBvc2l0aW9uKSB7XHJcbiAgICAgIHNlbGYuY2xlYXJFbGVtZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICBsZXQgdGlsZVNpemUgPSB0aWxlLmdldFNpemUoKTtcclxuICAgICAgbGV0IHN0YXJ0Q2VsbDtcclxuICAgICAgbGV0IHdpZHRoO1xyXG4gICAgICBsZXQgaGVpZ2h0O1xyXG4gICAgICBsZXQgY2VsbHM7XHJcblxyXG4gICAgICB0aWxlLnVwZGF0ZUVsZW0oJy5waXAtZHJhZ2dhYmxlLXRpbGUnKTtcclxuICAgICAgaWYgKHRpbGVTaXplLmNvbFNwYW4gPT09IDEpIHtcclxuICAgICAgICBpZiAocHJldkNlbGwgJiYgcHJldkNlbGwuZWxlbS5zaXplLmNvbFNwYW4gPT09IDIgJiYgcHJldkNlbGwuZWxlbS5zaXplLnJvd1NwYW4gPT09IDEpIHtcclxuICAgICAgICAgIHN0YXJ0Q2VsbCA9IHNlbGYuZ2V0Q2VsbHMoc2VsZi5nZXRDZWxsQnlQb3NpdGlvbihwcmV2Q2VsbC5yb3csIHByZXZDZWxsLmNvbCAtIDEpLCAxLCAxKS5zdGFydDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RhcnRDZWxsID0gc2VsZi5nZXRDZWxscyhwcmV2Q2VsbCwgMSwgMSkuc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYgKCFvbmx5UG9zaXRpb24pIHtcclxuICAgICAgICAgIHdpZHRoID0gc3RhcnRDZWxsLnJpZ2h0IC0gc3RhcnRDZWxsLmxlZnQ7XHJcbiAgICAgICAgICBoZWlnaHQgPSBzdGFydENlbGwuYm90dG9tIC0gc3RhcnRDZWxsLnRvcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZXZDZWxsID0gc3RhcnRDZWxsO1xyXG5cclxuICAgICAgICBzZWxmLnJlc2VydmVDZWxscyhzdGFydENlbGwsIHN0YXJ0Q2VsbCwgdGlsZSk7XHJcblxyXG4gICAgICAgIGN1cnJJbmRleCsrO1xyXG4gICAgICB9IGVsc2UgaWYgKHRpbGVTaXplLmNvbFNwYW4gPT09IDIpIHtcclxuICAgICAgICBjZWxscyA9IHNlbGYuZ2V0Q2VsbHMocHJldkNlbGwsIHRpbGVTaXplLnJvd1NwYW4sIHRpbGVTaXplLmNvbFNwYW4pO1xyXG4gICAgICAgIHN0YXJ0Q2VsbCA9IGNlbGxzLnN0YXJ0O1xyXG5cclxuICAgICAgICBpZiAoIW9ubHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgd2lkdGggPSBjZWxscy5lbmQucmlnaHQgLSBjZWxscy5zdGFydC5sZWZ0O1xyXG4gICAgICAgICAgaGVpZ2h0ID0gY2VsbHMuZW5kLmJvdHRvbSAtIGNlbGxzLnN0YXJ0LnRvcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZXZDZWxsID0gY2VsbHMuZW5kO1xyXG5cclxuICAgICAgICBzZWxmLnJlc2VydmVDZWxscyhjZWxscy5zdGFydCwgY2VsbHMuZW5kLCB0aWxlKTtcclxuXHJcbiAgICAgICAgY3VyckluZGV4ICs9IDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbmRlciBwcmV2aWV3XHJcbiAgICAgIC8vIHdoaWxlIHRpbGVzIGZyb20gZ3JvdXAgaXMgZHJhZ2dlZFxyXG4gICAgICBpZiAoZHJhZ2dlZFRpbGUgPT09IHRpbGUpIHtcclxuICAgICAgICB0aWxlLnNldFByZXZpZXdQb3NpdGlvbih7XHJcbiAgICAgICAgICBsZWZ0OiBzdGFydENlbGwubGVmdCxcclxuICAgICAgICAgIHRvcDogc3RhcnRDZWxsLnRvcFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghb25seVBvc2l0aW9uKSB7XHJcbiAgICAgICAgdGlsZS5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aWxlLnNldFBvc2l0aW9uKHN0YXJ0Q2VsbC5sZWZ0LCBzdGFydENlbGwudG9wKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjYWxjQ29udGFpbmVySGVpZ2h0KCk6IGFueSB7XHJcbiAgICBsZXQgbWF4SGVpZ2h0U2l6ZSwgbWF4V2lkdGhTaXplO1xyXG5cclxuICAgIGlmICghdGhpcy50aWxlcy5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgbWF4SGVpZ2h0U2l6ZSA9IF8ubWF4QnkodGhpcy50aWxlcywgKHRpbGUpID0+IHtcclxuICAgICAgbGV0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgIHJldHVybiB0aWxlU2l6ZS50b3AgKyB0aWxlU2l6ZS5oZWlnaHQ7XHJcbiAgICB9KVsnZ2V0U2l6ZSddKCk7XHJcblxyXG4gICAgdGhpcy5lbGVtLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodFNpemUudG9wICsgbWF4SGVpZ2h0U2l6ZS5oZWlnaHQgKyAncHgnO1xyXG5cclxuICAgIGlmICh0aGlzLmlubGluZSkge1xyXG4gICAgICBtYXhXaWR0aFNpemUgPSBfLm1heEJ5KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgICAgbGV0IHRpbGVTaXplID0gdGlsZVsnZ2V0U2l6ZSddKCk7XHJcbiAgICAgICAgcmV0dXJuIHRpbGVTaXplLmxlZnQgKyB0aWxlU2l6ZS53aWR0aDtcclxuICAgICAgfSlbJ2dldFNpemUnXSgpO1xyXG5cclxuICAgICAgdGhpcy5lbGVtLnN0eWxlLndpZHRoID0gbWF4V2lkdGhTaXplLmxlZnQgKyBtYXhXaWR0aFNpemUud2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBnZXRUaWxlQnlOb2RlKG5vZGUpOiBhbnkge1xyXG4gICAgbGV0IGZvdW5kVGlsZSA9IHRoaXMudGlsZXMuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgIHJldHVybiBub2RlID09PSB0aWxlLmdldEVsZW0oKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBmb3VuZFRpbGUubGVuZ3RoID8gZm91bmRUaWxlWzBdIDogbnVsbDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0VGlsZUJ5Q29vcmRpbmF0ZXMoY29vcmRzLCBkcmFnZ2VkVGlsZSk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy50aWxlc1xyXG4gICAgICAuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgbGV0IHRpbGVTaXplID0gdGlsZS5nZXRTaXplKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aWxlICE9PSBkcmFnZ2VkVGlsZSAmJlxyXG4gICAgICAgICAgdGlsZVNpemUubGVmdCA8PSBjb29yZHMubGVmdCAmJiBjb29yZHMubGVmdCA8PSAodGlsZVNpemUubGVmdCArIHRpbGVTaXplLndpZHRoKSAmJlxyXG4gICAgICAgICAgdGlsZVNpemUudG9wIDw9IGNvb3Jkcy50b3AgJiYgY29vcmRzLnRvcCA8PSAodGlsZVNpemUudG9wICsgdGlsZVNpemUuaGVpZ2h0KTtcclxuICAgICAgfSlbMF0gfHwgbnVsbDtcclxuICB9O1xyXG5cclxuICBwdWJsaWMgZ2V0VGlsZUluZGV4KHRpbGUpOiBhbnkge1xyXG4gICAgcmV0dXJuIF8uZmluZEluZGV4KHRoaXMudGlsZXMsIHRpbGUpO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzd2FwVGlsZXMobW92ZWRUaWxlLCBiZWZvcmVUaWxlKTogYW55IHtcclxuICAgIGxldCBtb3ZlZFRpbGVJbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsIG1vdmVkVGlsZSk7XHJcbiAgICBsZXQgYmVmb3JlVGlsZUluZGV4ID0gXy5maW5kSW5kZXgodGhpcy50aWxlcywgYmVmb3JlVGlsZSk7XHJcblxyXG4gICAgdGhpcy50aWxlcy5zcGxpY2UobW92ZWRUaWxlSW5kZXgsIDEpO1xyXG4gICAgdGhpcy50aWxlcy5zcGxpY2UoYmVmb3JlVGlsZUluZGV4LCAwLCBtb3ZlZFRpbGUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyByZW1vdmVUaWxlKHJlbW92ZVRpbGUpOiBhbnkge1xyXG4gICAgbGV0IGRyb3BwZWRUaWxlO1xyXG5cclxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSwgaW5kZXgsIHRpbGVzKSA9PiB7XHJcbiAgICAgIGlmICh0aWxlID09PSByZW1vdmVUaWxlKSB7XHJcbiAgICAgICAgZHJvcHBlZFRpbGUgPSB0aWxlcy5zcGxpY2UoaW5kZXgsIDEpWzBdO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGRyb3BwZWRUaWxlO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVUaWxlT3B0aW9ucyhvcHRzKTogYW55IHtcclxuICAgIGxldCBpbmRleCA9IF8uZmluZEluZGV4KHRoaXMudGlsZXMsICh0aWxlKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aWxlWydnZXRPcHRpb25zJ10oKSA9PT0gb3B0cztcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy50aWxlc1tpbmRleF0uc2V0T3B0aW9ucyhvcHRzKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH07XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBEcmFnZ2VkJylcclxuICAuc2VydmljZSgncGlwVGlsZXNHcmlkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0aWxlcywgb3B0aW9ucywgY29sdW1ucywgZWxlbSkge1xyXG4gICAgICBsZXQgbmV3R3JpZCA9IG5ldyBUaWxlc0dyaWRTZXJ2aWNlKHRpbGVzLCBvcHRpb25zLCBjb2x1bW5zLCBlbGVtKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXdHcmlkO1xyXG4gICAgfVxyXG4gIH0pOyIsImV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldFRlbXBsYXRlU2VydmljZSB7XHJcbiAgICBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55O1xyXG4gICAgc2V0SW1hZ2VNYXJnaW5DU1MoJGVsZW1lbnQsIGltYWdlKTogdm9pZDtcclxufVxyXG5cclxuY2xhc3Mgd2lkZ2V0VGVtcGxhdGVTZXJ2aWNlIGltcGxlbWVudHMgSVdpZGdldFRlbXBsYXRlU2VydmljZSB7XHJcbiAgICBwcml2YXRlIF8kaW50ZXJwb2xhdGU6IGFuZ3VsYXIuSUludGVycG9sYXRlU2VydmljZTtcclxuICAgIHByaXZhdGUgXyRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZTtcclxuICAgIHByaXZhdGUgXyR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgJGludGVycG9sYXRlOiBhbmd1bGFyLklJbnRlcnBvbGF0ZVNlcnZpY2UsXHJcbiAgICAgICAgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxyXG4gICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Q6IGFuZ3VsYXIuSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuXyRpbnRlcnBvbGF0ZSA9ICRpbnRlcnBvbGF0ZTtcclxuICAgICAgICB0aGlzLl8kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgICAgIHRoaXMuXyR0ZW1wbGF0ZVJlcXVlc3QgPSAkdGVtcGxhdGVSZXF1ZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRUZW1wbGF0ZShzb3VyY2UsIHRwbCA/ICwgdGlsZVNjb3BlID8gLCBzdHJpY3RDb21waWxlID8gKTogYW55IHtcclxuICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgdHlwZVxyXG4gICAgICAgIH0gPSBzb3VyY2U7XHJcbiAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgaWYgKHR5cGUpIHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJwb2xhdGVkID0gdHBsID8gdGhpcy5fJGludGVycG9sYXRlKHRwbCkoc291cmNlKSA6IHRoaXMuXyRpbnRlcnBvbGF0ZSh0ZW1wbGF0ZSkoc291cmNlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmljdENvbXBpbGUgPT0gdHJ1ZSA/XHJcbiAgICAgICAgICAgICAgICAodGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaW50ZXJwb2xhdGVkKSh0aWxlU2NvcGUpIDogdGhpcy5fJGNvbXBpbGUoaW50ZXJwb2xhdGVkKSkgOlxyXG4gICAgICAgICAgICAgICAgaW50ZXJwb2xhdGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aWxlU2NvcGUgPyB0aGlzLl8kY29tcGlsZSh0ZW1wbGF0ZSkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKHRlbXBsYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0ZW1wbGF0ZVVybCkge1xyXG4gICAgICAgICAgICB0aGlzLl8kdGVtcGxhdGVSZXF1ZXN0KHRlbXBsYXRlVXJsLCBmYWxzZSkudGhlbigoaHRtbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGlsZVNjb3BlID8gdGhpcy5fJGNvbXBpbGUoaHRtbCkodGlsZVNjb3BlKSA6IHRoaXMuXyRjb21waWxlKGh0bWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSkge1xyXG4gICAgICAgIGxldFxyXG4gICAgICAgICAgICBjb250YWluZXJXaWR0aCA9ICRlbGVtZW50LndpZHRoID8gJGVsZW1lbnQud2lkdGgoKSA6ICRlbGVtZW50LmNsaWVudFdpZHRoLCBcclxuICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGVsZW1lbnQuaGVpZ2h0ID8gJGVsZW1lbnQuaGVpZ2h0KCkgOiAkZWxlbWVudC5jbGllbnRIZWlnaHQsXHJcbiAgICAgICAgICAgIGltYWdlV2lkdGggPSAoaW1hZ2VbMF0gPyBpbWFnZVswXS5uYXR1cmFsV2lkdGggOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLndpZHRoLFxyXG4gICAgICAgICAgICBpbWFnZUhlaWdodCA9IChpbWFnZVswXSA/IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQgOiBpbWFnZS5uYXR1cmFsV2lkdGgpIHx8IGltYWdlLmhlaWdodCxcclxuICAgICAgICAgICAgbWFyZ2luID0gMCxcclxuICAgICAgICAgICAgY3NzUGFyYW1zID0ge307XHJcblxyXG4gICAgICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VXaWR0aCAvIGltYWdlSGVpZ2h0ICogY29udGFpbmVySGVpZ2h0IC0gY29udGFpbmVyV2lkdGgpIC8gMik7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgaW1hZ2VXaWR0aCAqIGNvbnRhaW5lckhlaWdodCAvIGltYWdlSGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJyc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWFyZ2luID0gLSgoaW1hZ2VIZWlnaHQgLyBpbWFnZVdpZHRoICogY29udGFpbmVyV2lkdGggLSBjb250YWluZXJIZWlnaHQpIC8gMik7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJycgKyBtYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICBjc3NQYXJhbXNbJ2hlaWdodCddID0gJycgKyBpbWFnZUhlaWdodCAqIGNvbnRhaW5lcldpZHRoIC8gaW1hZ2VXaWR0aCArICdweCc7IC8vJzEwMCUnO1xyXG4gICAgICAgICAgICBjc3NQYXJhbXNbJ3dpZHRoJ10gPSAnJyArIGNvbnRhaW5lcldpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgICAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJChpbWFnZSkuY3NzKGNzc1BhcmFtcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIGltYWdlIGxvYWQgZGlyZWN0aXZlIFRPRE86IHJlbW92ZSB0byBwaXBJbWFnZVV0aWxzXHJcbmZ1bmN0aW9uIEltYWdlTG9hZCgkcGFyc2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnBpcEltYWdlTG9hZCk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYmluZCgnbG9hZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcGUsIHskZXZlbnQ6IGV2ZW50fSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcERhc2hib2FyZCcpXHJcbiAgICAuc2VydmljZSgncGlwV2lkZ2V0VGVtcGxhdGUnLCB3aWRnZXRUZW1wbGF0ZVNlcnZpY2UpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBJbWFnZUxvYWQnLCBJbWFnZUxvYWQpOyIsIigoKSA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGlwV2lkZ2V0JywgW10pO1xyXG59KSgpO1xyXG5cclxuaW1wb3J0ICcuL2NhbGVuZGFyL1dpZGdldENhbGVuZGFyJztcclxuaW1wb3J0ICcuL2V2ZW50L1dpZGdldEV2ZW50JztcclxuaW1wb3J0ICcuL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQgJy4vbWVudS9XaWRnZXRNZW51RGlyZWN0aXZlJztcclxuaW1wb3J0ICcuL25vdGVzL1dpZGdldE5vdGVzJztcclxuaW1wb3J0ICcuL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uJztcclxuaW1wb3J0ICcuL3N0YXRpc3RpY3MvV2lkZ2V0U3RhdGlzdGljcyc7XHJcbmltcG9ydCAnLi9waWN0dXJlX3NsaWRlci9XaWRnZXRQaWN0dXJlU2xpZGVyJztcclxuIiwiaW1wb3J0IHsgTWVudVdpZGdldFNlcnZpY2UgfSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHsgSVdpZGdldENvbmZpZ1NlcnZpY2UgfSBmcm9tICcuLi8uLi9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcblxyXG5jbGFzcyBDYWxlbmRhcldpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG5cclxuICBwdWJsaWMgY29sb3I6IHN0cmluZyA9ICdibHVlJztcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwaXBXaWRnZXRNZW51OiBhbnksXHJcbiAgICAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2VcclxuICApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgICB0aGlzLl9jb25maWdEaWFsb2cgPSBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlO1xyXG5cclxuICAgICAgaWYgKHRoaXNbJ29wdGlvbnMnXSkge1xyXG4gICAgICAgIHRoaXMubWVudSA9IHRoaXNbJ29wdGlvbnMnXVsnbWVudSddID8gXy51bmlvbih0aGlzLm1lbnUsIHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKSA6IHRoaXMubWVudTtcclxuICAgICAgICB0aGlzLm1lbnUucHVzaCh7IHRpdGxlOiAnQ29uZmlndXJhdGUnLCBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgICAgfX0pO1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5kYXRlID0gdGhpc1snb3B0aW9ucyddLmRhdGUgfHwgbmV3IERhdGUoKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Db25maWdDbGljaygpIHtcclxuICAgIHRoaXMuX2NvbmZpZ0RpYWxvZy5zaG93KHtcclxuICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgIHNpemU6IHRoaXNbJ29wdGlvbnMnXS5zaXplLFxyXG4gICAgICBkYXRlOiB0aGlzWydvcHRpb25zJ10uZGF0ZSxcclxuICAgICAgZXh0ZW5zaW9uVXJsOiAnd2lkZ2V0cy9jYWxlbmRhci9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10uY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59XHJcblxyXG4oKCkgPT4ge1xyXG5cclxuICBsZXQgcGlwQ2FsZW5kYXJXaWRnZXQgPSB7XHJcbiAgICAgIGJpbmRpbmdzICAgICAgICA6IHtcclxuICAgICAgICBvcHRpb25zOiAnPXBpcE9wdGlvbnMnLFxyXG4gICAgICB9LFxyXG4gICAgICBjb250cm9sbGVyICAgICAgOiBDYWxlbmRhcldpZGdldENvbnRyb2xsZXIsXHJcbiAgICAgIGNvbnRyb2xsZXJBcyAgICA6ICd3aWRnZXRDdHJsJyxcclxuICAgICAgdGVtcGxhdGVVcmwgICAgIDogJ3dpZGdldHMvY2FsZW5kYXIvV2lkZ2V0Q2FsZW5kYXIuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBDYWxlbmRhcldpZGdldCcsIHBpcENhbGVuZGFyV2lkZ2V0KTtcclxuXHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IE1lbnVXaWRnZXRTZXJ2aWNlfSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHsgSVdpZGdldENvbmZpZ1NlcnZpY2UgfSBmcm9tICcuLi8uLi9kaWFsb2dzL3dpZGdldF9jb25maWcvQ29uZmlnRGlhbG9nU2VydmljZSc7XHJcblxyXG5jbGFzcyBFdmVudFdpZGdldENvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF8kZWxlbWVudDogYW55O1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX29sZE9wYWNpdHk6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGNvbG9yOiBzdHJpbmcgPSAnZ3JheSc7XHJcbiAgcHVibGljIG9wYWNpdHk6IG51bWJlciA9IDAuNTc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICRlbGVtZW50OiBhbnksXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG4gICkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuXyRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuXHJcbiAgICBpZiAodGhpc1snb3B0aW9ucyddKSB7XHJcbiAgICAgIGlmICh0aGlzWydvcHRpb25zJ11bJ21lbnUnXSkgdGhpcy5tZW51ID0gXy51bmlvbih0aGlzLm1lbnUsIHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1lbnUucHVzaCh7IHRpdGxlOiAnQ29uZmlndXJhdGUnLCBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICB9fSk7XHJcbiAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgICB0aGlzLm9wYWNpdHkgPSB0aGlzWydvcHRpb25zJ10ub3BhY2l0eSB8fCB0aGlzLm9wYWNpdHk7XHJcblxyXG4gICAgdGhpcy5kcmF3SW1hZ2UoKTtcclxuXHJcbiAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB7IHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTsgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYXdJbWFnZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdJbWFnZSgpIHtcclxuICAgIGlmICh0aGlzWydvcHRpb25zJ10uaW1hZ2UpIHtcclxuICAgICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMub25JbWFnZUxvYWQodGhpcy5fJGVsZW1lbnQuZmluZCgnaW1nJykpO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgdGhpcy5fb2xkT3BhY2l0eSA9IF8uY2xvbmUodGhpcy5vcGFjaXR5KTtcclxuICAgIHRoaXMuX2NvbmZpZ0RpYWxvZy5zaG93KHtcclxuICAgICAgZGlhbG9nQ2xhc3M6ICdwaXAtY2FsZW5kYXItY29uZmlnJyxcclxuICAgICAgY29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgIHNpemU6IHRoaXNbJ29wdGlvbnMnXS5zaXplIHx8IHtjb2xTcGFuOiAxLCByb3dTcGFuOiAxfSxcclxuICAgICAgZGF0ZTogdGhpc1snb3B0aW9ucyddLmRhdGUsXHJcbiAgICAgIHRpdGxlOiB0aGlzWydvcHRpb25zJ10udGl0bGUsXHJcbiAgICAgIHRleHQ6IHRoaXNbJ29wdGlvbnMnXS50ZXh0LFxyXG4gICAgICBvcGFjaXR5OiB0aGlzLm9wYWNpdHksXHJcbiAgICAgIG9uT3BhY2l0eXRlc3Q6IChvcGFjaXR5KSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgfSxcclxuICAgICAgZXh0ZW5zaW9uVXJsOiAnd2lkZ2V0cy9ldmVudC9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCdcclxuICAgIH0sIChyZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICB0aGlzLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10uY29sb3IgPSByZXN1bHQuY29sb3I7XHJcbiAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS5kYXRlID0gcmVzdWx0LmRhdGU7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS50aXRsZSA9IHJlc3VsdC50aXRsZTtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLnRleHQgPSByZXN1bHQudGV4dDtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLm9wYWNpdHkgPSByZXN1bHQub3BhY2l0eTtcclxuICAgIH0sICgpID0+IHtcclxuICAgICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5fb2xkT3BhY2l0eTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkltYWdlTG9hZChpbWFnZSkge1xyXG4gICAgdGhpcy5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLl8kZWxlbWVudC5wYXJlbnQoKSwgaW1hZ2UpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICBpZiAodGhpc1snb3B0aW9ucyddLmltYWdlKSB7XHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnNldEltYWdlTWFyZ2luQ1NTKHRoaXMuXyRlbGVtZW50LnBhcmVudCgpLCB0aGlzLl8kZWxlbWVudC5maW5kKCdpbWcnKSk7XHJcbiAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBMYXRlciByZXBsYWNlIGJ5IHBpcEltYWdlVXRpbHMgc2V2aWNlJ3MgZnVuY3Rpb25cclxuICBwcml2YXRlIHNldEltYWdlTWFyZ2luQ1NTKCRlbGVtZW50LCBpbWFnZSkge1xyXG4gICAgbGV0XHJcbiAgICAgIGNvbnRhaW5lcldpZHRoID0gJGVsZW1lbnQud2lkdGggPyAkZWxlbWVudC53aWR0aCgpIDogJGVsZW1lbnQuY2xpZW50V2lkdGgsIC8vIHx8IDgwLFxyXG4gICAgICBjb250YWluZXJIZWlnaHQgPSAkZWxlbWVudC5oZWlnaHQgPyAkZWxlbWVudC5oZWlnaHQoKSA6ICRlbGVtZW50LmNsaWVudEhlaWdodCwgLy8gfHwgODAsXHJcbiAgICAgIGltYWdlV2lkdGggPSBpbWFnZVswXS5uYXR1cmFsV2lkdGggfHwgaW1hZ2Uud2lkdGgsXHJcbiAgICAgIGltYWdlSGVpZ2h0ID0gaW1hZ2VbMF0ubmF0dXJhbEhlaWdodCB8fCBpbWFnZS5oZWlnaHQsXHJcbiAgICAgIG1hcmdpbiA9IDAsXHJcbiAgICAgIGNzc1BhcmFtcyA9IHt9O1xyXG5cclxuICAgIGlmICgoaW1hZ2VXaWR0aCAvIGNvbnRhaW5lcldpZHRoKSA+IChpbWFnZUhlaWdodCAvIGNvbnRhaW5lckhlaWdodCkpIHtcclxuICAgICAgbWFyZ2luID0gLSgoaW1hZ2VXaWR0aCAvIGltYWdlSGVpZ2h0ICogY29udGFpbmVySGVpZ2h0IC0gY29udGFpbmVyV2lkdGgpIC8gMik7XHJcbiAgICAgIGNzc1BhcmFtc1snbWFyZ2luLWxlZnQnXSA9ICcnICsgbWFyZ2luICsgJ3B4JztcclxuICAgICAgY3NzUGFyYW1zWydoZWlnaHQnXSA9ICcnICsgY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgaW1hZ2VXaWR0aCAqIGNvbnRhaW5lckhlaWdodCAvIGltYWdlSGVpZ2h0ICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snbWFyZ2luLXRvcCddID0gJyc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtYXJnaW4gPSAtKChpbWFnZUhlaWdodCAvIGltYWdlV2lkdGggKiBjb250YWluZXJXaWR0aCAtIGNvbnRhaW5lckhlaWdodCkgLyAyKTtcclxuICAgICAgY3NzUGFyYW1zWydtYXJnaW4tdG9wJ10gPSAnJyArIG1hcmdpbiArICdweCc7XHJcbiAgICAgIGNzc1BhcmFtc1snaGVpZ2h0J10gPSAnJyArIGltYWdlSGVpZ2h0ICogY29udGFpbmVyV2lkdGggLyBpbWFnZVdpZHRoICsgJ3B4JzsgLy8nMTAwJSc7XHJcbiAgICAgIGNzc1BhcmFtc1snd2lkdGgnXSA9ICcnICsgY29udGFpbmVyV2lkdGggKyAncHgnOyAvLycxMDAlJztcclxuICAgICAgY3NzUGFyYW1zWydtYXJnaW4tbGVmdCddID0gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgaW1hZ2UuY3NzKGNzc1BhcmFtcyk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuKCgpID0+IHtcclxuICBsZXQgcGlwRXZlbnRXaWRnZXQgPSAge1xyXG4gICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucydcclxuICAgICAgfSxcclxuICAgICAgY29udHJvbGxlcjogRXZlbnRXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgICBjb250cm9sbGVyQXM6ICd3aWRnZXRDdHJsJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL2V2ZW50L1dpZGdldEV2ZW50Lmh0bWwnXHJcbiAgfVxyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLmNvbXBvbmVudCgncGlwRXZlbnRXaWRnZXQnLCBwaXBFdmVudFdpZGdldCk7XHJcbn0pKCk7IiwiKCgpID0+IHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuZGlyZWN0aXZlKCdwaXBNZW51V2lkZ2V0JywgcGlwTWVudVdpZGdldCk7XHJcblxyXG4gIGZ1bmN0aW9uIHBpcE1lbnVXaWRnZXQoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdCAgICAgICAgOiAnRUEnLFxyXG4gICAgICB0ZW1wbGF0ZVVybCAgICAgOiAnd2lkZ2V0cy9tZW51L1dpZGdldE1lbnUuaHRtbCdcclxuICAgIH07XHJcbiAgfVxyXG59KSgpO1xyXG4iLCJcclxuZXhwb3J0IGNsYXNzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwdWJsaWMgbWVudTogYW55ID0gW1xyXG4gICAge1xyXG4gICAgICB0aXRsZTogJ0NoYW5nZSBTaXplJyxcclxuICAgICAgYWN0aW9uOiBhbmd1bGFyLm5vb3AsXHJcbiAgICAgIHN1Ym1lbnU6IFt7XHJcbiAgICAgICAgICB0aXRsZTogJzEgeCAxJyxcclxuICAgICAgICAgIGFjdGlvbjogJ2NoYW5nZVNpemUnLFxyXG4gICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgIHNpemVYOiAxLFxyXG4gICAgICAgICAgICBzaXplWTogMVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGl0bGU6ICcyIHggMScsXHJcbiAgICAgICAgICBhY3Rpb246ICdjaGFuZ2VTaXplJyxcclxuICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICBzaXplWDogMixcclxuICAgICAgICAgICAgc2l6ZVk6IDFcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnMiB4IDInLFxyXG4gICAgICAgICAgYWN0aW9uOiAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgc2l6ZVg6IDIsXHJcbiAgICAgICAgICAgIHNpemVZOiAyXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcIm5nSW5qZWN0XCI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FsbEFjdGlvbihhY3Rpb25OYW1lLCBwYXJhbXMsIGl0ZW0pIHtcclxuICAgIGlmICh0aGlzW2FjdGlvbk5hbWVdKSB7XHJcbiAgICAgIHRoaXNbYWN0aW9uTmFtZV0uY2FsbCh0aGlzLCBwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpdGVtWydjbGljayddKSB7XHJcbiAgICAgIGl0ZW1bJ2NsaWNrJ10uY2FsbChpdGVtLCBwYXJhbXMsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcbiAgfTtcclxufVxyXG5cclxuY2xhc3MgTWVudVdpZGdldFByb3ZpZGVyIHtcclxuICAgIHByaXZhdGUgX3NlcnZpY2U6IE1lbnVXaWRnZXRTZXJ2aWNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgfVxyXG5cclxuICAgcHVibGljICRnZXQoKSB7XHJcbiAgICAgICAgXCJuZ0luamVjdFwiO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fc2VydmljZSA9PSBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE1lbnVXaWRnZXRTZXJ2aWNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlcnZpY2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gICAgLnByb3ZpZGVyKCdwaXBXaWRnZXRNZW51JywgTWVudVdpZGdldFByb3ZpZGVyKTtcclxufSkoKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBNZW51V2lkZ2V0U2VydmljZSB9IGZyb20gJy4uL21lbnUvV2lkZ2V0TWVudVNlcnZpY2UnO1xyXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnU2VydmljZSB9IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbmNsYXNzIE5vdGVzV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgX2NvbmZpZ0RpYWxvZzogSVdpZGdldENvbmZpZ1NlcnZpY2U7XHJcblxyXG4gIHB1YmxpYyBjb2xvcjogc3RyaW5nID0gJ29yYW5nZSc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHBpcFdpZGdldENvbmZpZ0RpYWxvZ1NlcnZpY2U6IElXaWRnZXRDb25maWdTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMuXyRzY29wZSA9ICRzY29wZTtcclxuICAgICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuXHJcbiAgICAgIGlmICh0aGlzWydvcHRpb25zJ10pIHtcclxuICAgICAgICB0aGlzLm1lbnUgPSB0aGlzWydvcHRpb25zJ11bJ21lbnUnXSA/IF8udW5pb24odGhpcy5tZW51LCB0aGlzWydvcHRpb25zJ11bJ21lbnUnXSkgOiB0aGlzLm1lbnU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWVudS5wdXNoKHsgdGl0bGU6ICdDb25maWd1cmF0ZScsIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uQ29uZmlnQ2xpY2soKTtcclxuICAgICAgfX0pO1xyXG4gICAgICB0aGlzLmNvbG9yID0gdGhpc1snb3B0aW9ucyddLmNvbG9yIHx8IHRoaXMuY29sb3I7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uQ29uZmlnQ2xpY2soKSB7XHJcbiAgICB0aGlzLl9jb25maWdEaWFsb2cuc2hvdyh7XHJcbiAgICAgIGRpYWxvZ0NsYXNzOiAncGlwLWNhbGVuZGFyLWNvbmZpZycsXHJcbiAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxyXG4gICAgICBzaXplOiB0aGlzWydvcHRpb25zJ10uc2l6ZSxcclxuICAgICAgdGl0bGU6IHRoaXNbJ29wdGlvbnMnXS50aXRsZSxcclxuICAgICAgdGV4dDogdGhpc1snb3B0aW9ucyddLnRleHQsXHJcbiAgICAgIGV4dGVuc2lvblVybDogJ3dpZGdldHMvbm90ZXMvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnXHJcbiAgICB9LCAocmVzdWx0OiBhbnkpID0+IHtcclxuICAgICAgdGhpcy5jb2xvciA9IHJlc3VsdC5jb2xvcjtcclxuICAgICAgdGhpc1snb3B0aW9ucyddLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xyXG4gICAgICB0aGlzLmNoYW5nZVNpemUocmVzdWx0LnNpemUpO1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10udGV4dCA9IHJlc3VsdC50ZXh0O1xyXG4gICAgICB0aGlzWydvcHRpb25zJ10udGl0bGUgPSByZXN1bHQudGl0bGU7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbiAgbGV0IHBpcE5vdGVzV2lkZ2V0ID0ge1xyXG4gICAgICBiaW5kaW5ncyAgICAgICAgICAgOiB7XHJcbiAgICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgICB9LFxyXG4gICAgICBjb250cm9sbGVyICAgICAgOiBOb3Rlc1dpZGdldENvbnRyb2xsZXIsXHJcbiAgICAgIGNvbnRyb2xsZXJBcyAgICA6ICd3aWRnZXRDdHJsJyxcclxuICAgICAgdGVtcGxhdGVVcmwgICAgIDogJ3dpZGdldHMvbm90ZXMvV2lkZ2V0Tm90ZXMuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBOb3Rlc1dpZGdldCcsIHBpcE5vdGVzV2lkZ2V0KTtcclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbn0gZnJvbSAnLi4vLi4vdXRpbGl0eS9XaWRnZXRUZW1wbGF0ZVV0aWxpdHknO1xyXG5cclxuY2xhc3MgUGljdHVyZVNsaWRlckNvbnRyb2xsZXIgZXh0ZW5kcyBNZW51V2lkZ2V0U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfJHNjb3BlOiBhbmd1bGFyLklTY29wZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX3dpZGdldFV0aWxpdHk6IElXaWRnZXRUZW1wbGF0ZVNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBfJGVsZW1lbnQ6IGFueTtcclxuICBwcml2YXRlIF8kdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2U7XHJcblxyXG4gIHB1YmxpYyBhbmltYXRpb25UeXBlOiBzdHJpbmcgPSAnZmFkaW5nJztcclxuICBwdWJsaWMgYW5pbWF0aW9uSW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICRlbGVtZW50OiBhbnksXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwaXBXaWRnZXRDb25maWdEaWFsb2dTZXJ2aWNlOiBJV2lkZ2V0Q29uZmlnU2VydmljZSxcclxuICAgIHBpcFdpZGdldFRlbXBsYXRlOiBJV2lkZ2V0VGVtcGxhdGVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5fJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuICAgIHRoaXMuX3dpZGdldFV0aWxpdHkgPSBwaXBXaWRnZXRUZW1wbGF0ZTtcclxuICAgIHRoaXMuXyRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgaWYgKHRoaXNbJ29wdGlvbnMnXSkge1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblR5cGUgPSB0aGlzWydvcHRpb25zJ10uYW5pbWF0aW9uVHlwZSB8fCB0aGlzLmFuaW1hdGlvblR5cGU7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uSW50ZXJ2YWwgPSB0aGlzWydvcHRpb25zJ10uYW5pbWF0aW9uSW50ZXJ2YWwgfHwgdGhpcy5hbmltYXRpb25JbnRlcnZhbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkltYWdlTG9hZCgkZXZlbnQpIHtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5fd2lkZ2V0VXRpbGl0eS5zZXRJbWFnZU1hcmdpbkNTUyh0aGlzLl8kZWxlbWVudC5wYXJlbnQoKSwgJGV2ZW50LnRhcmdldCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjaGFuZ2VTaXplKHBhcmFtcykge1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9IHBhcmFtcy5zaXplWDtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPSBwYXJhbXMuc2l6ZVk7XHJcblxyXG4gICAgdGhpcy5fJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBfLmVhY2godGhpcy5fJGVsZW1lbnQuZmluZCgnaW1nJyksIChpbWFnZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuX3dpZGdldFV0aWxpdHkuc2V0SW1hZ2VNYXJnaW5DU1ModGhpcy5fJGVsZW1lbnQucGFyZW50KCksIGltYWdlKTtcclxuICAgICAgfSk7XHJcbiAgICB9LCA1MDApO1xyXG4gIH1cclxufVxyXG5cclxubGV0IHBpcFBpY3R1cmVTbGlkZXJXaWRnZXQgPSB7XHJcbiAgYmluZGluZ3M6IHtcclxuICAgIG9wdGlvbnM6ICc9cGlwT3B0aW9ucycsXHJcbiAgICBpbmRleDogJz0nLFxyXG4gICAgZ3JvdXA6ICc9J1xyXG4gIH0sXHJcbiAgY29udHJvbGxlcjogUGljdHVyZVNsaWRlckNvbnRyb2xsZXIsXHJcbiAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL3BpY3R1cmVfc2xpZGVyL1dpZGdldFBpY3R1cmVTbGlkZXIuaHRtbCcsXHJcbiAgY29udHJvbGxlckFzOiAnd2lkZ2V0Q3RybCdcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgLmNvbXBvbmVudCgncGlwUGljdHVyZVNsaWRlcldpZGdldCcsIHBpcFBpY3R1cmVTbGlkZXJXaWRnZXQpOyIsImltcG9ydCB7XHJcbiAgTWVudVdpZGdldFNlcnZpY2VcclxufSBmcm9tICcuLi9tZW51L1dpZGdldE1lbnVTZXJ2aWNlJztcclxuaW1wb3J0IHtcclxuICBJV2lkZ2V0Q29uZmlnU2VydmljZVxyXG59IGZyb20gJy4uLy4uL2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2dTZXJ2aWNlJztcclxuXHJcbmNsYXNzIFBvc2l0aW9uV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuICBwcml2YXRlIF9jb25maWdEaWFsb2c6IElXaWRnZXRDb25maWdTZXJ2aWNlO1xyXG4gIHByaXZhdGUgX2xvY2F0aW9uRGlhbG9nOiBhbnk7XHJcblxyXG4gIHB1YmxpYyBzaG93UG9zaXRpb246IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHBpcFdpZGdldE1lbnU6IGFueSxcclxuICAgICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICAkZWxlbWVudDogYW55LFxyXG4gICAgcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTogSVdpZGdldENvbmZpZ1NlcnZpY2UsXHJcbiAgICBwaXBMb2NhdGlvbkVkaXREaWFsb2c6IGFueSxcclxuICApIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLl8kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nID0gcGlwV2lkZ2V0Q29uZmlnRGlhbG9nU2VydmljZTtcclxuICAgIHRoaXMuX2xvY2F0aW9uRGlhbG9nID0gcGlwTG9jYXRpb25FZGl0RGlhbG9nO1xyXG5cclxuICAgIGlmICh0aGlzWydvcHRpb25zJ10pIHtcclxuICAgICAgaWYgKHRoaXNbJ29wdGlvbnMnXVsnbWVudSddKSB0aGlzLm1lbnUgPSBfLnVuaW9uKHRoaXMubWVudSwgdGhpc1snb3B0aW9ucyddWydtZW51J10pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWVudS5wdXNoKHtcclxuICAgICAgdGl0bGU6ICdDb25maWd1cmF0ZScsXHJcbiAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vbkNvbmZpZ0NsaWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5tZW51LnB1c2goe1xyXG4gICAgICB0aXRsZTogJ0NoYW5nZSBsb2NhdGlvbicsXHJcbiAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGVuTG9jYXRpb25FZGl0RGlhbG9nKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiA9IHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiB8fCB0aGlzWydvcHRpb25zJ10ucG9zaXRpb247XHJcblxyXG4gICAgJHNjb3BlLiR3YXRjaCgnd2lkZ2V0Q3RybC5vcHRpb25zLmxvY2F0aW9uJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlRHJhd1Bvc2l0aW9uKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUT0RPIGl0IGRvZXNuJ3Qgd29ya1xyXG4gICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB7IHJldHVybiAkZWxlbWVudC5pcygnOnZpc2libGUnKTsgfSwgKG5ld1ZhbCkgPT4ge1xyXG4gICAgICBpZiAobmV3VmFsID09IHRydWUpIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkNvbmZpZ0NsaWNrKCkge1xyXG4gICAgdGhpcy5fY29uZmlnRGlhbG9nLnNob3coe1xyXG4gICAgICBkaWFsb2dDbGFzczogJ3BpcC1wb3NpdGlvbi1jb25maWcnLFxyXG4gICAgICBzaXplOiB0aGlzWydvcHRpb25zJ10uc2l6ZSxcclxuICAgICAgbG9jYXRpb25OYW1lOiB0aGlzWydvcHRpb25zJ10ubG9jYXRpb25OYW1lLFxyXG4gICAgICBoaWRlQ29sb3JzOiB0cnVlLFxyXG4gICAgICBleHRlbnNpb25Vcmw6ICd3aWRnZXRzL3Bvc2l0aW9uL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJ1xyXG4gICAgfSwgKHJlc3VsdDogYW55KSA9PiB7XHJcbiAgICAgIHRoaXMuY2hhbmdlU2l6ZShyZXN1bHQuc2l6ZSk7XHJcbiAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbk5hbWUgPSByZXN1bHQubG9jYXRpb25OYW1lO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2hhbmdlU2l6ZShwYXJhbXMpIHtcclxuICAgIHRoaXNbJ29wdGlvbnMnXS5zaXplLmNvbFNwYW4gPSBwYXJhbXMuc2l6ZVg7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5yb3dTcGFuID0gcGFyYW1zLnNpemVZO1xyXG5cclxuICAgIHRoaXMucmVEcmF3UG9zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvcGVuTG9jYXRpb25FZGl0RGlhbG9nKCkge1xyXG4gICAgdGhpcy5fbG9jYXRpb25EaWFsb2cuc2hvdyh7XHJcbiAgICAgIGxvY2F0aW9uTmFtZTogdGhpc1snb3B0aW9ucyddLmxvY2F0aW9uTmFtZSxcclxuICAgICAgbG9jYXRpb25Qb3M6IHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvblxyXG4gICAgfSwgKG5ld1Bvc2l0aW9uKSA9PiB7XHJcbiAgICAgIGlmIChuZXdQb3NpdGlvbikge1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbiA9IG5ld1Bvc2l0aW9uLmxvY2F0aW9uO1xyXG4gICAgICAgIHRoaXNbJ29wdGlvbnMnXS5sb2NhdGlvbk5hbWUgPSBuZXdQb3NpdGlvbi5sb2NhdGlvTmFtZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlRHJhd1Bvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5zaG93UG9zaXRpb24gPSBmYWxzZTtcclxuICAgIHRoaXMuXyR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5zaG93UG9zaXRpb24gPSB0cnVlO1xyXG4gICAgfSwgNTApO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmxldCBwaXBQb3NpdGlvbldpZGdldCA9IHtcclxuICBiaW5kaW5nczoge1xyXG4gICAgb3B0aW9uczogJz1waXBPcHRpb25zJyxcclxuICAgIGluZGV4OiAnPScsXHJcbiAgICBncm91cDogJz0nXHJcbiAgfSxcclxuICBjb250cm9sbGVyOiBQb3NpdGlvbldpZGdldENvbnRyb2xsZXIsXHJcbiAgY29udHJvbGxlckFzOiAnd2lkZ2V0Q3RybCcsXHJcbiAgdGVtcGxhdGVVcmw6ICd3aWRnZXRzL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uLmh0bWwnXHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdwaXBXaWRnZXQnKVxyXG4gIC5jb21wb25lbnQoJ3BpcFBvc2l0aW9uV2lkZ2V0JywgcGlwUG9zaXRpb25XaWRnZXQpOyIsImltcG9ydCB7IE1lbnVXaWRnZXRTZXJ2aWNlIH0gZnJvbSAnLi4vbWVudS9XaWRnZXRNZW51U2VydmljZSc7XHJcblxyXG5sZXQgU01BTExfQ0hBUlQ6IG51bWJlciA9IDcwO1xyXG5sZXQgQklHX0NIQVJUOiBudW1iZXIgPSAyNTA7XHJcblxyXG5jbGFzcyBTdGF0aXN0aWNzV2lkZ2V0Q29udHJvbGxlciBleHRlbmRzIE1lbnVXaWRnZXRTZXJ2aWNlIHtcclxuICBwcml2YXRlIF8kc2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xyXG4gIHByaXZhdGUgXyR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZTtcclxuXHJcbiAgcHVibGljIHJlc2V0OiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGNoYXJ0U2l6ZTogbnVtYmVyID0gU01BTExfQ0hBUlQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcGlwV2lkZ2V0TWVudTogYW55LFxyXG4gICAgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZVxyXG4gICkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLl8kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICAgIHRoaXMuXyR0aW1lb3V0ID0gJHRpbWVvdXQ7XHJcblxyXG4gICAgICBpZiAodGhpc1snb3B0aW9ucyddKSB7XHJcbiAgICAgICAgdGhpcy5tZW51ID0gdGhpc1snb3B0aW9ucyddWydtZW51J10gPyBfLnVuaW9uKHRoaXMubWVudSwgdGhpc1snb3B0aW9ucyddWydtZW51J10pIDogdGhpcy5tZW51O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldENoYXJ0U2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNoYW5nZVNpemUocGFyYW1zKSB7XHJcbiAgICB0aGlzWydvcHRpb25zJ10uc2l6ZS5jb2xTcGFuID0gcGFyYW1zLnNpemVYO1xyXG4gICAgdGhpc1snb3B0aW9ucyddLnNpemUucm93U3BhbiA9IHBhcmFtcy5zaXplWTtcclxuXHJcbiAgICB0aGlzLnJlc2V0ID0gdHJ1ZTtcclxuICAgIHRoaXMuc2V0Q2hhcnRTaXplKCk7XHJcbiAgICB0aGlzLl8kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzZXQgPSBmYWxzZTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldENoYXJ0U2l6ZSgpIHtcclxuICAgIHRoaXMuY2hhcnRTaXplID0gdGhpc1snb3B0aW9ucyddLnNpemUuY29sU3BhbiA9PSAyICYmIHRoaXNbJ29wdGlvbnMnXS5zaXplLnJvd1NwYW4gPT0gMiA/IEJJR19DSEFSVCA6IFNNQUxMX0NIQVJUO1xyXG4gIH1cclxufVxyXG5cclxuKCgpID0+IHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBwaXBTdGF0aXN0aWNzV2lkZ2V0ID0ge1xyXG4gICAgICBiaW5kaW5ncyAgICAgICAgICAgOiB7XHJcbiAgICAgICAgb3B0aW9uczogJz1waXBPcHRpb25zJ1xyXG4gICAgICB9LFxyXG4gICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICBjb250cm9sbGVyICAgICAgOiBTdGF0aXN0aWNzV2lkZ2V0Q29udHJvbGxlcixcclxuICAgICAgY29udHJvbGxlckFzICAgIDogJ3dpZGdldEN0cmwnLFxyXG4gICAgICB0ZW1wbGF0ZVVybCAgICAgOiAnd2lkZ2V0cy9zdGF0aXN0aWNzL1dpZGdldFN0YXRpc3RpY3MuaHRtbCdcclxuICB9XHJcblxyXG4gIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3BpcFdpZGdldCcpXHJcbiAgICAuY29tcG9uZW50KCdwaXBTdGF0aXN0aWNzV2lkZ2V0JywgcGlwU3RhdGlzdGljc1dpZGdldCk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCdEYXNoYm9hcmQuaHRtbCcsXG4gICAgJzxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnQgbWQtcmFpc2VkIG1kLWZhYiBsYXlvdXQtY29sdW1uIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgYXJpYS1sYWJlbD1cIkFkZCBjb21wb25lbnRcIlxcbicgK1xuICAgICcgICAgICAgICAgIG5nLWNsaWNrPVwiZGFzaGJvYXJkQ3RybC5hZGRDb21wb25lbnQoKVwiPlxcbicgK1xuICAgICcgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCIgY2xhc3M9XCJtZC1oZWFkbGluZSBjZW50ZXJlZC1hZGQtaWNvblwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnPC9tZC1idXR0b24+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICc8ZGl2IGNsYXNzPVwicGlwLWRyYWdnYWJsZS1ncmlkLWhvbGRlclwiPlxcbicgK1xuICAgICcgIDxwaXAtZHJhZ2dhYmxlLWdyaWQgcGlwLXRpbGVzLXRlbXBsYXRlcz1cImRhc2hib2FyZEN0cmwuZ3JvdXBlZFdpZGdldHNcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICAgcGlwLXRpbGVzLWNvbnRleHQ9XCJkYXNoYm9hcmRDdHJsLndpZGdldHNDb250ZXh0XCJcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICAgIHBpcC1kcmFnZ2FibGUtZ3JpZD1cImRhc2hib2FyZEN0cmwuZHJhZ2dhYmxlR3JpZE9wdGlvbnNcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgICAgcGlwLWdyb3VwLW1lbnUtYWN0aW9ucz1cImRhc2hib2FyZEN0cmwuZ3JvdXBNZW51QWN0aW9uc1wiPlxcbicgK1xuICAgICcgIDwvcGlwLWRyYWdnYWJsZS1ncmlkPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICA8bWQtcHJvZ3Jlc3MtY2lyY3VsYXIgbWQtbW9kZT1cImluZGV0ZXJtaW5hdGVcIiBjbGFzcz1cInByb2dyZXNzLXJpbmdcIj48L21kLXByb2dyZXNzLWNpcmN1bGFyPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJycpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RyYWdnYWJsZS9EcmFnZ2FibGUuaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWhvbGRlclwiPlxcbicgK1xuICAgICcgIDxkaXYgY2xhc3M9XCJwaXAtZHJhZ2dhYmxlLWdyb3VwXCIgXFxuJyArXG4gICAgJyAgICAgICBuZy1yZXBlYXQ9XCJncm91cCBpbiBkcmFnZ2FibGVDdHJsLmdyb3Vwc1wiIFxcbicgK1xuICAgICcgICAgICAgZGF0YS1ncm91cC1pZD1cInt7ICRpbmRleCB9fVwiIFxcbicgK1xuICAgICcgICAgICAgcGlwLWRyYWdnYWJsZS10aWxlcz1cImdyb3VwLnNvdXJjZVwiPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXAtdGl0bGUgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyXCI+XFxuJyArXG4gICAgJyAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZS1pbnB1dC1jb250YWluZXJcIiBuZy1jbGljaz1cImRyYWdnYWJsZUN0cmwub25UaXRsZUNsaWNrKGdyb3VwLCAkZXZlbnQpXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGlucHV0IG5nLWlmPVwiZ3JvdXAuZWRpdGluZ05hbWVcIiBuZy1ibHVyPVwiZHJhZ2dhYmxlQ3RybC5vbkJsdXJUaXRsZUlucHV0KGdyb3VwKVwiIFxcbicgK1xuICAgICcgICAgICAgICAgICAgICBuZy1rZXlwcmVzcz1cImRyYWdnYWJsZUN0cmwub25LeWVwcmVzc1RpdGxlSW5wdXQoZ3JvdXAsICRldmVudClcIlxcbicgK1xuICAgICcgICAgICAgICAgICAgICBuZy1tb2RlbD1cImdyb3VwLnRpdGxlXCI+XFxuJyArXG4gICAgJyAgICAgICAgPC9pbnB1dD5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1vdmVyZmxvdyBmbGV4LW5vbmVcIiBuZy1pZj1cIiFncm91cC5lZGl0aW5nTmFtZVwiPnt7IGdyb3VwLnRpdGxlIH19PC9kaXY+XFxuJyArXG4gICAgJyAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgXFxuJyArXG4gICAgJyAgICAgICAgbmctc2hvdz1cImdyb3VwLmVkaXRpbmdOYW1lXCIgbmctY2xpY2s9XCJkcmFnZ2FibGVDdHJsLmNhbmNlbEVkaXRpbmcoZ3JvdXApXCJcXG4nICtcbiAgICAnICAgICAgICBhcmlhLWxhYmVsPVwiQ2FuY2VsXCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpjcm9zc1wiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICAgIDxtZC1tZW51IGNsYXNzPVwiZmxleC1ub25lIGxheW91dC1jb2x1bW5cIiBtZC1wb3NpdGlvbi1tb2RlPVwidGFyZ2V0LXJpZ2h0IHRhcmdldFwiIG5nLXNob3c9XCIhZ3JvdXAuZWRpdGluZ05hbWVcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lIGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCIgbmctY2xpY2s9XCIkbWRPcGVuTWVudSgpOyBncm91cElkID0gJGluZGV4XCIgYXJpYS1sYWJlbD1cIk1lbnVcIj5cXG4nICtcbiAgICAnICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6ZG90c1wiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtbWVudS1jb250ZW50IHdpZHRoPVwiNFwiPlxcbicgK1xuICAgICcgICAgICAgICAgPG1kLW1lbnUtaXRlbSBuZy1yZXBlYXQ9XCJhY3Rpb24gaW4gZHJhZ2dhYmxlQ3RybC5ncm91cE1lbnVBY3Rpb25zXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCJhY3Rpb24uY2FsbGJhY2soZ3JvdXBJZClcIj57eyBhY3Rpb24udGl0bGUgfX08L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICAgIDwvbWQtbWVudS1pdGVtPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtbWVudS1jb250ZW50PlxcbicgK1xuICAgICcgICAgICA8L21kLW1lbnU+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgPGRpdiBjbGFzcz1cInBpcC1kcmFnZ2FibGUtZ3JvdXAgZmljdC1ncm91cCBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlciBsYXlvdXQtY29sdW1uIHRtMTZcIiA+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiZmljdC1ncm91cC10ZXh0LWNvbnRhaW5lclwiPlxcbicgK1xuICAgICcgICAgICAgICAgPG1kLWljb24gbWQtc3ZnLWljb249XCJpY29uczpwbHVzXCI+PC9tZC1pY29uPnt7IFxcJ0RST1BfVE9fQ1JFQVRFX05FV19HUk9VUFxcJyB8IHRyYW5zbGF0ZSB9fVxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3MvYWRkX2NvbXBvbmVudC9BZGRDb21wb25lbnQuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC1hZGQtY29tcG9uZW50LWRpYWxvZ1wiPlxcbicgK1xuICAgICcgIDxtZC1kaWFsb2ctY29udGVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0aGVtZS1kaXZpZGVyIHAxNiBmbGV4LWF1dG9cIj5cXG4nICtcbiAgICAnICAgICAgPGgzIGNsYXNzPVwiaGlkZS14cyBtMCBibTE2IHRoZW1lLXRleHQtcHJpbWFyeVwiIGhpZGUteHM+QWRkIGNvbXBvbmVudDwvaDQ+XFxuJyArXG4gICAgJyAgICAgIDxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJsYXlvdXQtcm93IGZsZXgtYXV0byBtMFwiPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1zZWxlY3QgY2xhc3M9XCJmbGV4LWF1dG8gbTAgdGhlbWUtdGV4dC1wcmltYXJ5XCIgbmctbW9kZWw9XCJkaWFsb2dDdHJsLmFjdGl2ZUdyb3VwSW5kZXhcIiBwbGFjZWhvbGRlcj1cIkNyZWF0ZSBOZXcgR3JvdXBcIlxcbicgK1xuICAgICcgICAgICAgICAgYXJpYS1sYWJlbD1cIkdyb3VwXCI+XFxuJyArXG4gICAgJyAgICAgICAgICA8bWQtb3B0aW9uIG5nLXZhbHVlPVwiJGluZGV4XCIgbmctcmVwZWF0PVwiZ3JvdXAgaW4gZGlhbG9nQ3RybC5ncm91cHNcIj57eyBncm91cCB9fTwvbWQtb3B0aW9uPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtc2VsZWN0PlxcbicgK1xuICAgICcgICAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBpcC1ib2R5IHBpcC1zY3JvbGwgcDAgZmxleC1hdXRvXCI+XFxuJyArXG4gICAgJyAgICAgIDxwIGNsYXNzPVwibWQtYm9keS0xIHRoZW1lLXRleHQtc2Vjb25kYXJ5IG0wIGxwMTYgcnAxNlwiID5cXG4nICtcbiAgICAnICAgICAgICBVc2UgXCJFbnRlclwiIG9yIFwiK1wiIGJ1dHRvbnMgb24ga2V5Ym9hcmQgdG8gZW5jcmVhc2UgYW5kIFwiRGVsZXRlXCIgb3IgXCItXCIgdG8gZGVjcmVhc2UgdGlsZXMgYW1vdW50XFxuJyArXG4gICAgJyAgICAgIDwvcD5cXG4nICtcbiAgICAnICAgICAgPG1kLWxpc3QgbmctaW5pdD1cImdyb3VwSW5kZXggPSAkaW5kZXhcIiBuZy1yZXBlYXQ9XCJncm91cCBpbiBkaWFsb2dDdHJsLmRlZmF1bHRXaWRnZXRzXCI+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWxpc3QtaXRlbSBjbGFzcz1cImxheW91dC1yb3cgcGlwLWxpc3QtaXRlbSBscDE2IHJwMTZcIiBuZy1yZXBlYXQ9XCJpdGVtIGluIGdyb3VwXCI+XFxuJyArXG4gICAgJyAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbi1ob2xkZXIgZmxleC1ub25lXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6e3s6OiBpdGVtLmljb24gfX1cIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwaXAtYmFkZ2UgdGhlbWUtYmFkZ2UgbWQtd2FyblwiIG5nLWlmPVwiaXRlbS5hbW91bnRcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICA8c3Bhbj57eyBpdGVtLmFtb3VudCB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZmxleC1hdXRvIGxtMjQgdGhlbWUtdGV4dC1wcmltYXJ5XCI+e3s6OiBpdGVtLnRpdGxlIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWljb24tYnV0dG9uIGZsZXgtbm9uZVwiIG5nLWNsaWNrPVwiZGlhbG9nQ3RybC5lbmNyZWFzZShncm91cEluZGV4LCAkaW5kZXgpXCIgYXJpYS1sYWJlbD1cIkVuY3JlYXNlXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1pY29uIG1kLXN2Zy1pY29uPVwiaWNvbnM6cGx1cy1jaXJjbGVcIj48L21kLWljb24+XFxuJyArXG4gICAgJyAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcbiAgICAnICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1pY29uLWJ1dHRvbiBmbGV4LW5vbmVcIiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuZGVjcmVhc2UoZ3JvdXBJbmRleCwgJGluZGV4KVwiIGFyaWEtbGFiZWw9XCJEZWNyZWFzZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOm1pbnVzLWNpcmNsZVwiPjwvbWQtaWNvbj5cXG4nICtcbiAgICAnICAgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgIDwvbWQtbGlzdC1pdGVtPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1kaXZpZGVyIGNsYXNzPVwibG03MiB0bTggYm04XCIgbmctaWY9XCJncm91cEluZGV4ICE9PSAoZGlhbG9nQ3RybC5kZWZhdWx0V2lkZ2V0cy5sZW5ndGggLSAxKVwiPjwvbWQtZGl2aWRlcj5cXG4nICtcbiAgICAnICAgICAgPC9tZC1saXN0PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgPC9tZC1kaWFsb2ctY29udGVudD5cXG4nICtcbiAgICAnICA8bWQtZGlhbG9nLWFjdGlvbnMgY2xhc3M9XCJmbGV4LW5vbmUgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXIgdGhlbWUtZGl2aWRlciBkaXZpZGVyLXRvcCB0aGVtZS10ZXh0LXByaW1hcnlcIj5cXG4nICtcbiAgICAnICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCJkaWFsb2dDdHJsLmNhbmNlbCgpXCIgYXJpYS1sYWJlbD1cIkFkZFwiPkNhbmNlbDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgPG1kLWJ1dHRvbiBuZy1jbGljaz1cImRpYWxvZ0N0cmwuYWRkKClcIiBhcmlhbC1sYWJlbD1cIkNhbmNlbFwiPkFkZDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgIDwvbWQtZGlhbG9nLWFjdGlvbnM+XFxuJyArXG4gICAgJzwvbWQtZGlhbG9nPicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2RpYWxvZ3Mvd2lkZ2V0X2NvbmZpZy9Db25maWdEaWFsb2cuaHRtbCcsXG4gICAgJzxtZC1kaWFsb2cgY2xhc3M9XCJwaXAtZGlhbG9nIHBpcC13aWRnZXQtY29uZmlnLWRpYWxvZyB7eyB2bS5wYXJhbXMuZGlhbG9nQ2xhc3MgfX1cIiB3aWR0aD1cIjQwMFwiIG1kLXRoZW1lPVwie3t2bS50aGVtZX19XCI+XFxuJyArXG4gICAgJyAgICA8cGlwLXdpZGdldC1jb25maWctZXh0ZW5kLWNvbXBvbmVudCBjbGFzcz1cImxheW91dC1jb2x1bW5cIiBwaXAtZXh0ZW5zaW9uLXVybD1cInt7IHZtLnBhcmFtcy5leHRlbnNpb25VcmwgfX1cIj5cXG4nICtcbiAgICAnICAgIDwvcGlwLXdpZGdldC1jb25maWctZXh0ZW5kLWNvbXBvbmVudD5cXG4nICtcbiAgICAnPC9tZC1kaWFsb2c+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZGlhbG9ncy93aWRnZXRfY29uZmlnL0NvbmZpZ0RpYWxvZ0V4dGVuZENvbXBvbmVudC5odG1sJyxcbiAgICAnPGgzIGNsYXNzPVwidG0wIGZsZXgtbm9uZVwiPnt7dm0uZGlhbG9nVGl0bGV9fTwvaDM+XFxuJyArXG4gICAgJzxkaXYgY2xhc3M9XCJwaXAtYm9keSBwaXAtc2Nyb2xsIHAxNiBicDAgZmxleC1hdXRvXCI+XFxuJyArXG4gICAgJyAgICA8cGlwLWV4dGVuc2lvbi1wb2ludD48L3BpcC1leHRlbnNpb24tcG9pbnQ+XFxuJyArXG4gICAgJyAgICA8cGlwLXRvZ2dsZS1idXR0b25zIGNsYXNzPVwiYm0xNlwiIG5nLWlmPVwiIXZtLmhpZGVTaXplc1wiIHBpcC1idXR0b25zPVwidm0uc2l6ZXNcIiBuZy1tb2RlbD1cInZtLnNpemVJZFwiPlxcbicgK1xuICAgICcgICAgPC9waXAtdG9nZ2xlLWJ1dHRvbnM+XFxuJyArXG4gICAgJyAgICA8cGlwLWNvbG9yLXBpY2tlciBuZy1pZj1cIiF2bS5oaWRlQ29sb3JzXCIgcGlwLWNvbG9ycz1cInZtLmNvbG9yc1wiIG5nLW1vZGVsPVwidm0uY29sb3JcIj5cXG4nICtcbiAgICAnICAgIDwvcGlwLWNvbG9yLXBpY2tlcj5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICc8ZGl2IGNsYXNzPVwicGlwLWZvb3RlciBmbGV4LW5vbmVcIj5cXG4nICtcbiAgICAnICAgIDxkaXY+XFxuJyArXG4gICAgJyAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cIm1kLWFjY2VudFwiIG5nLWNsaWNrPVwidm0ub25DYW5jZWwoKVwiPkNhbmNlbDwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XCJtZC1hY2NlbnRcIiBuZy1jbGljaz1cInZtLm9uQXBwbHkoKVwiPkFwcGx5PC9tZC1idXR0b24+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9jYWxlbmRhci9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0xNlwiPlxcbicgK1xuICAgICcgICAgRGF0ZTpcXG4nICtcbiAgICAnICAgIDxtZC1kYXRlcGlja2VyIG5nLW1vZGVsPVwidm0uZGF0ZVwiIGNsYXNzPVwidy1zdHJldGNoIFwiPlxcbicgK1xuICAgICcgICAgPC9tZC1kYXRlcGlja2VyPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL2NhbGVuZGFyL1dpZGdldENhbGVuZGFyLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtY2FsZW5kYXItd2lkZ2V0IHt7IHdpZGdldEN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbCB0cDBcIlxcbicgK1xuICAgICcgICAgIG5nLWNsYXNzPVwie1xcbicgK1xuICAgICcgICAgICAgIHNtYWxsOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLFxcbicgK1xuICAgICcgICAgICAgIG1lZGl1bTogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBiaWc6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiPlxcbicgK1xuICAgICcgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtaGVhZGluZyBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1lbmQtY2VudGVyIGZsZXgtbm9uZVwiPlxcbicgK1xuICAgICcgICAgPHBpcC1tZW51LXdpZGdldD48L3BpcC1tZW51LXdpZGdldD5cXG4nICtcbiAgICAnICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgPGRpdiBjbGFzcz1cIndpZGdldC1jb250ZW50IGZsZXgtYXV0byBsYXlvdXQtcm93IGxheW91dC1hbGlnbi1jZW50ZXItY2VudGVyXCJcXG4nICtcbiAgICAnICAgICAgIG5nLWlmPVwid2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPlxcbicgK1xuICAgICcgICAgPHNwYW4gY2xhc3M9XCJkYXRlIGxtMjQgcm0xMlwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlLmdldERhdGUoKSB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJmbGV4LWF1dG8gbGF5b3V0LWNvbHVtblwiPlxcbicgK1xuICAgICcgICAgICA8c3BhbiBjbGFzcz1cIndlZWtkYXkgbWQtaGVhZGxpbmVcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdEYXlPZldlZWsgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICAgIDxzcGFuIGNsYXNzPVwibW9udGgteWVhciBtZC1oZWFkbGluZVwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ01vbnRoIH19IHt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0WWVhciB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICcgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgZmxleC1hdXRvIGxheW91dC1jb2x1bW4gbGF5b3V0LWFsaWduLXNwYWNlLWFyb3VuZC1jZW50ZXJcIlxcbicgK1xuICAgICcgICAgICAgbmctaGlkZT1cIndpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDFcIj5cXG4nICtcbiAgICAnICAgIDxzcGFuIGNsYXNzPVwid2Vla2RheSBtZC1oZWFkbGluZVwiXFxuJyArXG4gICAgJyAgICAgICAgICBuZy1oaWRlPVwid2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgIDxzcGFuIGNsYXNzPVwid2Vla2RheVwiXFxuJyArXG4gICAgJyAgICAgICAgICBuZy1zaG93PVwid2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMVwiPnt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0TG9uZ0RheU9mV2VlayB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgIDxzcGFuIGNsYXNzPVwiZGF0ZSBsbTEyIHJtMTJcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZS5nZXREYXRlKCkgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgICA8c3BhbiBjbGFzcz1cIm1vbnRoLXllYXIgbWQtaGVhZGxpbmVcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdExvbmdNb250aCB9fSB7eyB3aWRnZXRDdHJsLm9wdGlvbnMuZGF0ZSB8IGZvcm1hdFllYXIgfX08L3NwYW4+XFxuJyArXG4gICAgJyAgPC9kaXY+XFxuJyArXG4gICAgJzwvZGl2PlxcbicgK1xuICAgICcnKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL21lbnUvV2lkZ2V0TWVudS5odG1sJyxcbiAgICAnPG1kLW1lbnUgY2xhc3M9XCJ3aWRnZXQtbWVudVwiIG1kLXBvc2l0aW9uLW1vZGU9XCJ0YXJnZXQtcmlnaHQgdGFyZ2V0XCI+XFxuJyArXG4gICAgJyAgICA8bWQtYnV0dG9uIGNsYXNzPVwibWQtaWNvbi1idXR0b24gZmxleC1ub25lXCIgbmctY2xpY2s9XCIkbWRPcGVuTWVudSgpXCIgYXJpYS1sYWJlbD1cIk1lbnVcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtaWNvbiBtZC1zdmctaWNvbj1cImljb25zOnZkb3RzXCI+PC9tZC1pY29uPlxcbicgK1xuICAgICcgICAgPC9tZC1idXR0b24+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPG1kLW1lbnUtY29udGVudCB3aWR0aD1cIjRcIj5cXG4nICtcbiAgICAnICAgICAgICA8bWQtbWVudS1pdGVtIG5nLXJlcGVhdD1cIml0ZW0gaW4gd2lkZ2V0Q3RybC5tZW51XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxtZC1idXR0b24gbmctaWY9XCIhaXRlbS5zdWJtZW51XCIgbmctY2xpY2s9XCJ3aWRnZXRDdHJsLmNhbGxBY3Rpb24oaXRlbS5hY3Rpb24sIGl0ZW0ucGFyYW1zLCBpdGVtKVwiPnt7OjogaXRlbS50aXRsZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICAgICAgPG1kLW1lbnUgbmctaWY9XCJpdGVtLnN1Ym1lbnVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCJ3aWRnZXRDdHJsLmNhbGxBY3Rpb24oaXRlbS5hY3Rpb24pXCI+e3s6OiBpdGVtLnRpdGxlIH19PC9tZC1idXR0b24+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPG1kLW1lbnUtY29udGVudD5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgICAgICA8bWQtbWVudS1pdGVtIG5nLXJlcGVhdD1cInN1Yml0ZW0gaW4gaXRlbS5zdWJtZW51XCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCJ3aWRnZXRDdHJsLmNhbGxBY3Rpb24oc3ViaXRlbS5hY3Rpb24sIHN1Yml0ZW0ucGFyYW1zLCBzdWJpdGVtKVwiPnt7Ojogc3ViaXRlbS50aXRsZSB9fTwvbWQtYnV0dG9uPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIDwvbWQtbWVudS1pdGVtPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPC9tZC1tZW51LWNvbnRlbnQ+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvbWQtbWVudT5cXG4nICtcbiAgICAnICAgICAgICA8L21kLW1lbnUtaXRlbT5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8L21kLW1lbnUtY29udGVudD5cXG4nICtcbiAgICAnPC9tZC1tZW51PicpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvZXZlbnQvQ29uZmlnRGlhbG9nRXh0ZW5zaW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwidy1zdHJldGNoXCI+XFxuJyArXG4gICAgJyAgICA8bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwidy1zdHJldGNoIGJtMFwiPlxcbicgK1xuICAgICcgICAgICAgIDxsYWJlbD5UaXRsZTo8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwidm0udGl0bGVcIi8+XFxuJyArXG4gICAgJyAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICBEYXRlOlxcbicgK1xuICAgICcgICAgPG1kLWRhdGVwaWNrZXIgbmctbW9kZWw9XCJ2bS5kYXRlXCIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm04XCI+XFxuJyArXG4gICAgJyAgICA8L21kLWRhdGVwaWNrZXI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaFwiPlxcbicgK1xuICAgICcgICAgICAgIDxsYWJlbD5EZXNjcmlwdGlvbjo8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDx0ZXh0YXJlYSB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwidm0udGV4dFwiLz5cXG4nICtcbiAgICAnICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIEJhY2tkcm9wXFwncyBvcGFjaXR5OlxcbicgK1xuICAgICcgICAgPG1kLXNsaWRlciBhcmlhLWxhYmVsPVwib3BhY2l0eVwiICB0eXBlPVwibnVtYmVyXCIgbWluPVwiMC4xXCIgbWF4PVwiMC45XCIgc3RlcD1cIjAuMDFcIiBcXG4nICtcbiAgICAnICAgICAgICBuZy1tb2RlbD1cInZtLm9wYWNpdHlcIiBuZy1jaGFuZ2U9XCJ2bS5vbk9wYWNpdHl0ZXN0KHZtLm9wYWNpdHkpXCI+XFxuJyArXG4gICAgJyAgICA8L21kLXNsaWRlcj5cXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9ldmVudC9XaWRnZXRFdmVudC5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cIndpZGdldC1ib3ggcGlwLWV2ZW50LXdpZGdldCB7eyB3aWRnZXRDdHJsLmNvbG9yIH19IGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIiBuZy1jbGFzcz1cIntcXG4nICtcbiAgICAnICAgICAgICBzbWFsbDogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAxICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBtZWRpdW06IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgYmlnOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAyIH1cIiA+XFxuJyArXG4gICAgJyAgICA8aW1nIG5nLWlmPVwid2lkZ2V0Q3RybC5vcHRpb25zLmltYWdlXCIgbmctc3JjPVwie3t3aWRnZXRDdHJsLm9wdGlvbnMuaW1hZ2V9fVwiIGFsdD1cInt7d2lkZ2V0Q3RybC5vcHRpb25zLnRpdGxlIHx8IHdpZGdldEN0cmwub3B0aW9ucy5uYW1lfX1cIlxcbicgK1xuICAgICcgICAgLz5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWJhY2tkcm9wXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIHt7IHdpZGdldEN0cmwub3BhY2l0eSB9fSlcIj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIndpZGdldC10aXRsZSBmbGV4LWF1dG8gdGV4dC1vdmVyZmxvd1wiPnt7IHdpZGdldEN0cmwub3B0aW9ucy50aXRsZSB8fCB3aWRnZXRDdHJsLm9wdGlvbnMubmFtZSB9fTwvc3Bhbj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHBpcC1tZW51LXdpZGdldCBuZy1pZj1cIiF3aWRnZXRDdHJsLm9wdGlvbnMuaGlkZU1lbnVcIj48L3BpcC1tZW51LXdpZGdldD5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jb250YWluZXIgZmxleC1hdXRvIHBpcC1zY3JvbGxcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHAgY2xhc3M9XCJkYXRlIGZsZXgtbm9uZVwiIG5nLWlmPVwid2lkZ2V0Q3RybC5vcHRpb25zLmRhdGVcIj5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIHt7IHdpZGdldEN0cmwub3B0aW9ucy5kYXRlIHwgZm9ybWF0U2hvcnREYXRlIH19XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvcD5cXG4nICtcbiAgICAnICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0IGZsZXgtYXV0b1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAge3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRleHQgfHwgd2lkZ2V0Q3RybC5vcHRpb25zLmRlc2NyaXB0aW9uIH19XFxuJyArXG4gICAgJyAgICAgICAgICAgIDwvcD5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL25vdGVzL0NvbmZpZ0RpYWxvZ0V4dGVuc2lvbi5odG1sJyxcbiAgICAnPGRpdiBjbGFzcz1cInctc3RyZXRjaFwiPlxcbicgK1xuICAgICcgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCBibTBcIj5cXG4nICtcbiAgICAnICAgICAgICA8bGFiZWw+VGl0bGU6PC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cInZtLnRpdGxlXCIvPlxcbicgK1xuICAgICcgICAgPC9tZC1pbnB1dC1jb250YWluZXI+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPG1kLWlucHV0LWNvbnRhaW5lciBjbGFzcz1cInctc3RyZXRjaCB0bTBcIj5cXG4nICtcbiAgICAnICAgICAgICA8bGFiZWw+VGV4dDo8L2xhYmVsPlxcbicgK1xuICAgICcgICAgICAgIDx0ZXh0YXJlYSB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwidm0udGV4dFwiLz5cXG4nICtcbiAgICAnICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL25vdGVzL1dpZGdldE5vdGVzLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtbm90ZXMtd2lkZ2V0IHt7IHdpZGdldEN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtblwiPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxheW91dC1yb3cgbGF5b3V0LWFsaWduLXN0YXJ0LWNlbnRlciBmbGV4LW5vbmVcIiBuZy1pZj1cIndpZGdldEN0cmwub3B0aW9ucy50aXRsZSB8fCB3aWRnZXRDdHJsLm9wdGlvbnMubmFtZVwiPlxcbicgK1xuICAgICcgICAgICAgIDxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRpdGxlIHx8IHdpZGdldEN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJyAgICA8cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PlxcbicgK1xuICAgICcgICAgXFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwidGV4dC1jb250YWluZXIgZmxleC1hdXRvIHBpcC1zY3JvbGxcIj5cXG4nICtcbiAgICAnICAgICAgICA8cD57eyB3aWRnZXRDdHJsLm9wdGlvbnMudGV4dCB9fTwvcD5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnJyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9waWN0dXJlX3NsaWRlci9XaWRnZXRQaWN0dXJlU2xpZGVyLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtcGljdHVyZS1zbGlkZXItd2lkZ2V0IHt7IHdpZGdldEN0cmwuY29sb3IgfX0gbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiIG5nLWNsYXNzPVwie1xcbicgK1xuICAgICcgICAgICAgIHNtYWxsOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLFxcbicgK1xuICAgICcgICAgICAgIG1lZGl1bTogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBiaWc6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiIFxcbicgK1xuICAgICcgICAgICAgIGluZGV4PVxcJ3t7IHdpZGdldEN0cmwuaW5kZXggfX1cXCcgZ3JvdXA9XFwne3sgd2lkZ2V0Q3RybC5ncm91cCB9fVxcJz5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxwMTYgcnA4IGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXIgZmxleC1ub25lXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZmxleCB0ZXh0LW92ZXJmbG93XCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRpdGxlIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgICAgICA8cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PlxcbicgK1xuICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwic2xpZGVyLWNvbnRhaW5lclwiPlxcbicgK1xuICAgICcgICAgICAgICAgICA8ZGl2IHBpcC1pbWFnZS1zbGlkZXIgcGlwLWFuaW1hdGlvbi10eXBlPVwiXFwnZmFkaW5nXFwnXCIgcGlwLWFuaW1hdGlvbi1pbnRlcnZhbD1cIndpZGdldEN0cmwuYW5pbWF0aW9uSW50ZXJ2YWxcIiBcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG5nLWlmPVwid2lkZ2V0Q3RybC5hbmltYXRpb25UeXBlID09IFxcJ2ZhZGluZ1xcJ1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1hbmltYXRpb24tYmxvY2tcIiBuZy1yZXBlYXQ9XCJzbGlkZSBpbiB3aWRnZXRDdHJsLm9wdGlvbnMuc2xpZGVzXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPGltZyBuZy1zcmM9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIGFsdD1cInt7IHNsaWRlLmltYWdlIH19XCIgcGlwLWltYWdlLWxvYWQ9XCJ3aWRnZXRDdHJsLm9uSW1hZ2VMb2FkKCRldmVudClcIi8+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJzbGlkZS10ZXh0XCIgbmctaWY9XCJzbGlkZS50ZXh0XCI+e3sgc2xpZGUudGV4dCB9fTwvcD5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICAgICAgICAgIDxkaXYgcGlwLWltYWdlLXNsaWRlciBwaXAtYW5pbWF0aW9uLXR5cGU9XCJcXCdjYXJvdXNlbFxcJ1wiIHBpcC1hbmltYXRpb24taW50ZXJ2YWw9XCJ3aWRnZXRDdHJsLmFuaW1hdGlvbkludGVydmFsXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICBuZy1pZj1cIndpZGdldEN0cmwuYW5pbWF0aW9uVHlwZSA9PSBcXCdjYXJvdXNlbFxcJ1wiPlxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBpcC1hbmltYXRpb24tYmxvY2tcIiBuZy1yZXBlYXQ9XCJzbGlkZSBpbiB3aWRnZXRDdHJsLm9wdGlvbnMuc2xpZGVzXCI+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPGltZyBuZy1zcmM9XCJ7eyBzbGlkZS5pbWFnZSB9fVwiIGFsdD1cInt7IHNsaWRlLmltYWdlIH19XCIgcGlwLWltYWdlLWxvYWQ9XCJ3aWRnZXRDdHJsLm9uSW1hZ2VMb2FkKCRldmVudClcIi8+XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJzbGlkZS10ZXh0XCIgbmctaWY9XCJzbGlkZS50ZXh0XCI+e3sgc2xpZGUudGV4dCB9fTwvcD5cXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuICAgICcgICAgICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgICAgICBcXG4nICtcbiAgICAnPC9kaXY+Jyk7XG59XSk7XG59KSgpO1xuXG4oZnVuY3Rpb24obW9kdWxlKSB7XG50cnkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycpO1xufSBjYXRjaCAoZSkge1xuICBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncGlwRGFzaGJvYXJkLlRlbXBsYXRlcycsIFtdKTtcbn1cbm1vZHVsZS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICR0ZW1wbGF0ZUNhY2hlLnB1dCgnd2lkZ2V0cy9wb3NpdGlvbi9Db25maWdEaWFsb2dFeHRlbnNpb24uaHRtbCcsXG4gICAgJzxkaXYgY2xhc3M9XCJ3LXN0cmV0Y2hcIj5cXG4nICtcbiAgICAnICAgIDxtZC1pbnB1dC1jb250YWluZXIgY2xhc3M9XCJ3LXN0cmV0Y2ggYm0wXCI+XFxuJyArXG4gICAgJyAgICAgICAgPGxhYmVsPkxvY2F0aW9uIG5hbWU6PC9sYWJlbD5cXG4nICtcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cInZtLmxvY2F0aW9uTmFtZVwiLz5cXG4nICtcbiAgICAnICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuICAgICc8L2Rpdj4nKTtcbn1dKTtcbn0pKCk7XG5cbihmdW5jdGlvbihtb2R1bGUpIHtcbnRyeSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJyk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwaXBEYXNoYm9hcmQuVGVtcGxhdGVzJywgW10pO1xufVxubW9kdWxlLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KCd3aWRnZXRzL3Bvc2l0aW9uL1dpZGdldFBvc2l0aW9uLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwicGlwLXBvc2l0aW9uLXdpZGdldCB3aWRnZXQtYm94IHAwIGxheW91dC1jb2x1bW4gbGF5b3V0LWZpbGxcIlxcbicgK1xuICAgICcgICAgIG5nLWNsYXNzPVwie1xcbicgK1xuICAgICcgICAgICAgIHNtYWxsOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDEgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLFxcbicgK1xuICAgICcgICAgICAgIG1lZGl1bTogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMSxcXG4nICtcbiAgICAnICAgICAgICBiaWc6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMiAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDIgfVwiXFxuJyArXG4gICAgJyAgICAgICAgaW5kZXg9XFwne3sgd2lkZ2V0Q3RybC5pbmRleCB9fVxcJyBncm91cD1cXCd7eyB3aWRnZXRDdHJsLmdyb3VwIH19XFwnPlxcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cInBvc2l0aW9uLWFic29sdXRlLXJpZ2h0LXRvcFwiIG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5sb2NhdGlvbk5hbWVcIj5cXG4nICtcbiAgICAnICAgICAgICA8cGlwLW1lbnUtd2lkZ2V0IG5nLWlmPVwiIXdpZGdldEN0cmwub3B0aW9ucy5oaWRlTWVudVwiPjwvcGlwLW1lbnUtd2lkZ2V0PlxcbicgK1xuICAgICcgICAgPC9kaXY+XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cIndpZGdldC1oZWFkaW5nIGxwMTYgcnA4IGxheW91dC1yb3cgbGF5b3V0LWFsaWduLWVuZC1jZW50ZXIgZmxleC1ub25lXCIgbmctaWY9XCJ3aWRnZXRDdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lXCI+XFxuJyArXG4gICAgJyAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGV4IHRleHQtb3ZlcmZsb3dcIj57eyB3aWRnZXRDdHJsLm9wdGlvbnMubG9jYXRpb25OYW1lIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgIDxwaXAtbWVudS13aWRnZXQgbmctaWY9XCIhd2lkZ2V0Q3RybC5vcHRpb25zLmhpZGVNZW51XCI+PC9waXAtbWVudS13aWRnZXQ+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICA8cGlwLWxvY2F0aW9uLW1hcCBjbGFzcz1cImZsZXhcIiBuZy1pZj1cIndpZGdldEN0cmwuc2hvd1Bvc2l0aW9uXCIgcGlwLXN0cmV0Y2g9XCJ0cnVlXCIgcGlwLXJlYmluZD1cInRydWVcIlxcbicgK1xuICAgICcgICAgICAgIHBpcC1sb2NhdGlvbi1wb3M9XCJ3aWRnZXRDdHJsLm9wdGlvbnMubG9jYXRpb25cIj48L3BpcC1sb2NhdGlvbj5cXG4nICtcbiAgICAnPC9kaXY+XFxuJyArXG4gICAgJycpO1xufV0pO1xufSkoKTtcblxuKGZ1bmN0aW9uKG1vZHVsZSkge1xudHJ5IHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3BpcERhc2hib2FyZC5UZW1wbGF0ZXMnLCBbXSk7XG59XG5tb2R1bGUucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3dpZGdldHMvc3RhdGlzdGljcy9XaWRnZXRTdGF0aXN0aWNzLmh0bWwnLFxuICAgICc8ZGl2IGNsYXNzPVwid2lkZ2V0LWJveCBwaXAtc3RhdGlzdGljcy13aWRnZXQgbGF5b3V0LWNvbHVtbiBsYXlvdXQtZmlsbFwiXFxuJyArXG4gICAgJyAgICAgbmctY2xhc3M9XCJ7XFxuJyArXG4gICAgJyAgICAgICAgc21hbGw6IHdpZGdldEN0cmwub3B0aW9ucy5zaXplLmNvbFNwYW4gPT0gMSAmJiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5yb3dTcGFuID09IDEsXFxuJyArXG4gICAgJyAgICAgICAgbWVkaXVtOiB3aWRnZXRDdHJsLm9wdGlvbnMuc2l6ZS5jb2xTcGFuID09IDIgJiYgd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUucm93U3BhbiA9PSAxLFxcbicgK1xuICAgICcgICAgICAgIGJpZzogd2lkZ2V0Q3RybC5vcHRpb25zLnNpemUuY29sU3BhbiA9PSAyICYmIHdpZGdldEN0cmwub3B0aW9ucy5zaXplLnJvd1NwYW4gPT0gMiB9XCI+XFxuJyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRpbmcgbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tc3RhcnQtY2VudGVyIGZsZXgtbm9uZVwiPlxcbicgK1xuICAgICcgICAgICAgIDxzcGFuIGNsYXNzPVwid2lkZ2V0LXRpdGxlIGZsZXgtYXV0byB0ZXh0LW92ZXJmbG93XCI+e3sgd2lkZ2V0Q3RybC5vcHRpb25zLnRpdGxlIHx8IHdpZGdldEN0cmwub3B0aW9ucy5uYW1lIH19PC9zcGFuPlxcbicgK1xuICAgICcgICAgICAgIDxwaXAtbWVudS13aWRnZXQ+PC9waXAtbWVudS13aWRnZXQ+XFxuJyArXG4gICAgJyAgICA8L2Rpdj5cXG4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtY29udGVudCBmbGV4LWF1dG8gbGF5b3V0LXJvdyBsYXlvdXQtYWxpZ24tY2VudGVyLWNlbnRlclwiIG5nLWlmPVwid2lkZ2V0Q3RybC5vcHRpb25zLnNlcmllcyAmJiAhd2lkZ2V0Q3RybC5yZXNldFwiPlxcbicgK1xuICAgICcgICAgICAgIDxwaXAtcGllLWNoYXJ0IHBpcC1zZXJpZXM9XCJ3aWRnZXRDdHJsLm9wdGlvbnMuc2VyaWVzXCIgbmctaWY9XCIhd2lkZ2V0Q3RybC5vcHRpb25zLmNoYXJ0VHlwZSB8fCB3aWRnZXRDdHJsLm9wdGlvbnMuY2hhcnRUeXBlID09IFxcJ3BpZVxcJ1wiXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgcGlwLWRvbnV0PVwidHJ1ZVwiIFxcbicgK1xuICAgICcgICAgICAgICAgICAgICAgICAgIHBpcC1waWUtc2l6ZT1cIndpZGdldEN0cmwuY2hhcnRTaXplXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgcGlwLXNob3ctdG90YWw9XCJ0cnVlXCIgXFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICAgICAgcGlwLWNlbnRlcmVkPVwidHJ1ZVwiPlxcbicgK1xuICAgICcgICAgICAgIDwvcGlwLXBpZS1jaGFydD5cXG4nICtcbiAgICAnICAgIDwvZGl2PlxcbicgK1xuICAgICc8L2Rpdj5cXG4nICtcbiAgICAnJyk7XG59XSk7XG59KSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1waXAtd2VidWktZGFzaGJvYXJkLWh0bWwuanMubWFwXG4iXX0=