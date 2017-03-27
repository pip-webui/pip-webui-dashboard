export interface IDashboardTile {
    options: any;
    color: string;
    size: Object | string | number;
}

export class DashboardTile implements IDashboardTile {
    public options: any;
    public color: string;
    public size: Object | string | number;

    constructor() { }
}