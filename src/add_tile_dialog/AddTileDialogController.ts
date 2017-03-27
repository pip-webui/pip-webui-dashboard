export class AddTileDialog {
    title: string;
    icon: string;
    name: string;
    amount: number;
}

export class AddTileDialogController implements ng.IController {
    public defaultTiles: [AddTileDialog[]];
    public groups: any;
    public totalTiles: number = 0;

    constructor(
        groups: any,
        public activeGroupIndex: number,
        widgetList: [AddTileDialog[]],
        public $mdDialog: angular.material.IDialogService
    ) {
        this.activeGroupIndex = _.isNumber(activeGroupIndex) ? activeGroupIndex : -1;
        this.defaultTiles = _.cloneDeep(widgetList);
        this.groups = _.map(groups, function (group) {
            return group['title'];
        });
    }

    public add() {
        this.$mdDialog.hide({
            groupIndex: this.activeGroupIndex,
            widgets: this.defaultTiles
        });
    };

    public cancel() {
        this.$mdDialog.cancel();
    };

    public encrease(groupIndex: number, widgetIndex: number) {
        const widget = this.defaultTiles[groupIndex][widgetIndex];
        widget.amount++;
        this.totalTiles++;
    };

    public decrease(groupIndex: number, widgetIndex: number) {
        const widget = this.defaultTiles[groupIndex][widgetIndex];
        widget.amount = widget.amount ? widget.amount - 1 : 0;
        this.totalTiles = this.totalTiles ? this.totalTiles - 1 : 0;
    };
}