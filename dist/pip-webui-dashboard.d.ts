declare module pip.dashboard {




export let DEFAULT_TILE_WIDTH: number;
export let DEFAULT_TILE_HEIGHT: number;
export let UPDATE_GROUPS_EVENT: string;

function DragDirective(): {
    restrict: string;
    scope: {
        tilesTemplates: string;
        tilesContext: string;
        options: string;
        groupMenuActions: string;
    };
    templateUrl: string;
    bindToController: boolean;
    controllerAs: string;
    controller: string;
    link: ($scope: any, $elem: any) => void;
};

export interface DragTileConstructor {
    new (options: any): any;
}
export function IDragTileConstructor(constructor: DragTileConstructor, options: any): IDragTileService;
export interface IDragTileService {
    tpl: any;
    opts: any;
    size: any;
    elem: any;
    preview: any;
    getSize(): any;
    setSize(width: any, height: any): any;
    setPosition(left: any, top: any): any;
    getCompiledTemplate(): any;
    updateElem(parent: any): any;
    getElem(): any;
    startDrag(): any;
    stopDrag(isAnimate: any): any;
    setPreviewPosition(coords: any): void;
    getOptions(): any;
    setOptions(options: any): any;
}
export class DragTileService implements IDragTileService {
    tpl: any;
    opts: any;
    size: any;
    elem: any;
    preview: any;
    constructor(options: any);
    getSize(): any;
    setSize(width: any, height: any): any;
    setPosition(left: any, top: any): any;
    getCompiledTemplate(): any;
    updateElem(parent: any): any;
    getElem(): any;
    startDrag(): any;
    stopDrag(isAnimate: any): any;
    setPreviewPosition(coords: any): void;
    getOptions(): any;
    setOptions(options: any): any;
}

export interface IWidgetTemplateService {
    getTemplate(source: any, tpl?: any, tileScope?: any, strictCompile?: any): any;
    setImageMarginCSS($element: any, image: any): void;
}


export class AddComponentDialogController {
    _mdDialog: angular.material.IDialogService;
    activeGroupIndex: number;
    defaultWidgets: any;
    groups: any;
    constructor(groups: any, activeGroupIndex: any, widgetList: any, $mdDialog: angular.material.IDialogService);
    add(): void;
    cancel(): void;
    encrease(groupIndex: any, widgetIndex: any): void;
    decrease(groupIndex: any, widgetIndex: any): void;
}

export interface IAddComponentDialogService {
    show(groups: any, activeGroupIndex: any): any;
}

export class WidgetConfigDialogController {
    dialogTitle: string;
    $mdDialog: angular.material.IDialogService;
    transclude: any;
    params: any;
    colors: string[];
    sizes: any;
    sizeId: string;
    private _$element;
    private _$timeout;
    constructor(params: any, $mdDialog: angular.material.IDialogService, $compile: angular.ICompileService, $timeout: angular.ITimeoutService, $injector: any, $scope: angular.IScope, $rootScope: any);
    onApply(): void;
    onCancel(): void;
}


export interface IWidgetConfigService {
    show(params: any, successCallback?: (key) => void, cancelCallback?: () => void): any;
}

function DraggableTile(): {
    restrict: string;
    link: ($scope: any, $elem: any, $attr: any) => void;
};

export interface TilesGridConstructor {
    new (tiles: any, options: any, columns: any, elem: any): any;
}
export function ITilesGridConstructor(constructor: TilesGridConstructor, tiles: any, options: any, columns: any, elem: any): ITilesGridService;
export interface ITilesGridService {
    tiles: any;
    opts: any;
    columns: any;
    elem: any;
    gridCells: any;
    inline: boolean;
    isMobileLayout: boolean;
    addTile(tile: any): any;
    getCellByPosition(row: any, col: any): any;
    getCells(prevCell: any, rowSpan: any, colSpan: any): any;
    getAvailableCellsDesktop(prevCell: any, rowSpan: any, colSpan: any): any;
    getCell(src: any, basicRow: any, basicCol: any, columns: any): any;
    getAvailableCellsMobile(prevCell: any, rowSpan: any, colSpan: any): any;
    getBasicRow(prevCell: any): any;
    isCellFree(row: any, col: any): any;
    getCellIndex(srcCell: any): any;
    reserveCells(start: any, end: any, elem: any): void;
    clearElements(): void;
    setAvailableColumns(columns: any): any;
    generateGrid(singleTileWidth?: any): any;
    setTilesDimensions(onlyPosition: any, draggedTile: any): any;
    calcContainerHeight(): any;
    getTileByNode(node: any): any;
    getTileByCoordinates(coords: any, draggedTile: any): any;
    getTileIndex(tile: any): any;
    swapTiles(movedTile: any, beforeTile: any): any;
    removeTile(removeTile: any): any;
    updateTileOptions(opts: any): any;
}
export class TilesGridService implements ITilesGridService {
    tiles: any;
    opts: any;
    columns: any;
    elem: any;
    gridCells: any;
    inline: boolean;
    isMobileLayout: boolean;
    constructor(tiles: any, options: any, columns: any, elem: any);
    addTile(tile: any): any;
    getCellByPosition(row: any, col: any): any;
    getCells(prevCell: any, rowSpan: any, colSpan: any): any;
    getAvailableCellsDesktop(prevCell: any, rowSpan: any, colSpan: any): any;
    getCell(src: any, basicRow: any, basicCol: any, columns: any): any;
    getAvailableCellsMobile(prevCell: any, rowSpan: any, colSpan: any): any;
    getBasicRow(prevCell: any): any;
    isCellFree(row: any, col: any): any;
    getCellIndex(srcCell: any): any;
    reserveCells(start: any, end: any, elem: any): void;
    clearElements(): void;
    setAvailableColumns(columns: any): any;
    generateGrid(singleTileWidth?: any): any;
    setTilesDimensions(onlyPosition: any, draggedTile: any): any;
    calcContainerHeight(): any;
    getTileByNode(node: any): any;
    getTileByCoordinates(coords: any, draggedTile: any): any;
    getTileIndex(tile: any): any;
    swapTiles(movedTile: any, beforeTile: any): any;
    removeTile(removeTile: any): any;
    updateTileOptions(opts: any): any;
}



export class MenuWidgetService {
    menu: any;
    constructor();
    callAction(actionName: any, params: any, item: any): void;
    changeSize(params: any): void;
}






}
