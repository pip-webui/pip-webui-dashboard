declare module pip.dashboard {



export const DEFAULT_TILE_WIDTH: number;
export const DEFAULT_TILE_HEIGHT: number;
export const UPDATE_GROUPS_EVENT = "pipUpdateDashboardGroupsConfig";

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

export interface IDashboardWidget {
    options: any;
    color: string;
    size: Object | string | number;
}
export class DashboardWidget implements IDashboardWidget {
    options: any;
    color: string;
    size: Object | string | number;
    constructor();
}


export class AddComponentDialogWidget {
    title: string;
    icon: string;
    name: string;
    amount: number;
}
export class AddComponentDialogController implements ng.IController {
    activeGroupIndex: number;
    $mdDialog: angular.material.IDialogService;
    defaultWidgets: [AddComponentDialogWidget[]];
    groups: any;
    totalWidgets: number;
    constructor(groups: any, activeGroupIndex: number, widgetList: [AddComponentDialogWidget[]], $mdDialog: angular.material.IDialogService);
    add(): void;
    cancel(): void;
    encrease(groupIndex: number, widgetIndex: number): void;
    decrease(groupIndex: number, widgetIndex: number): void;
}

export interface IAddComponentDialogService {
    show(groups: any, activeGroupIndex: any): angular.IPromise<any>;
}
export interface IAddComponentDialogprovider {
    configWidgetList(list: [AddComponentDialogWidget[]]): void;
}

export class WidgetConfigDialogController {
    params: any;
    $mdDialog: angular.material.IDialogService;
    colors: string[];
    sizes: any;
    sizeId: string;
    onCancel: Function;
    constructor(params: any, $mdDialog: angular.material.IDialogService);
    onApply(updatedData: any): void;
}


export interface IWidgetConfigService {
    show(params: IWidgetConfigDialogOptions, successCallback?: (key) => void, cancelCallback?: () => void): any;
}
export interface IWidgetConfigDialogOptions extends angular.material.IDialogOptions {
    dialogClass?: string;
    extensionUrl?: string;
    event?: any;
}


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




export class MenuWidgetService extends DashboardWidget {
    menu: any;
    constructor();
    callAction(actionName: any, params: any, item: any): void;
    changeSize(params: any): void;
}





}
