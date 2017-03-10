export interface IDashboardWidget {
    options: any;
    color: string;
    size: Object | string | number;
}

export class DashboardWidget implements IDashboardWidget {
    public options: any;
    public color: string;
    public size: Object | string | number;

    constructor() { }
}