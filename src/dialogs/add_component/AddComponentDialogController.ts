export class AddComponentDialogWidget {
    title: string;
    icon: string;
    name: string;
    amount: number;
}

export class AddComponentDialogController implements ng.IController {
    public defaultWidgets: [AddComponentDialogWidget[]];
    public groups: any;
    public totalWidgets: number = 0;

    constructor(
        groups, // Later may be group type
        public activeGroupIndex: number,
        widgetList: [AddComponentDialogWidget[]],
        public $mdDialog: angular.material.IDialogService
    ) {
        this.activeGroupIndex = _.isNumber(activeGroupIndex) ? activeGroupIndex : -1;
        this.defaultWidgets = _.cloneDeep(widgetList);
        this.groups = _.map(groups, function (group) {
            return group['title'];
        });
    }

    public add() {
        this.$mdDialog.hide({
            groupIndex: this.activeGroupIndex,
            widgets: this.defaultWidgets
        });
    };

    public cancel() {
        this.$mdDialog.cancel();
    };

    public encrease(groupIndex: number, widgetIndex: number) {
        const widget = this.defaultWidgets[groupIndex][widgetIndex];
        widget.amount++;
        this.totalWidgets++;
    };

    public decrease(groupIndex: number, widgetIndex: number) {
        const widget = this.defaultWidgets[groupIndex][widgetIndex];
        widget.amount = widget.amount ? widget.amount - 1 : 0;
        this.totalWidgets = this.totalWidgets ? this.totalWidgets - 1 : 0;
    };
}

angular
    .module('pipAddDashboardComponentDialog', ['ngMaterial']);

import './AddComponentProvider';