'use strict';

export class AddComponentDialogController {
    public _mdDialog: angular.material.IDialogService;
    public activeGroupIndex: number;
    public defaultWidgets: any;
    public groups: any;

    constructor(
        groups, 
        activeGroupIndex, 
        widgetList,
        $mdDialog: angular.material.IDialogService
    ) {
        this.activeGroupIndex = _.isNumber(activeGroupIndex) ? activeGroupIndex : -1;
        this.defaultWidgets   = _.cloneDeep(widgetList);
        this.groups = _.map(groups, function (group) {
          return group['title'];
        });
        this._mdDialog = $mdDialog;
    }

    public add () {
          this._mdDialog.hide({
            groupIndex: this.activeGroupIndex,
            widgets   : this.defaultWidgets
          });
        };

    public cancel () {
          this._mdDialog.cancel();
        };

    public encrease (groupIndex, widgetIndex) {
          var widget = this.defaultWidgets[groupIndex][widgetIndex];
          widget.amount++;
    };

    public decrease (groupIndex, widgetIndex) {
          var widget    = this.defaultWidgets[groupIndex][widgetIndex];
          widget.amount = widget.amount ? widget.amount - 1 : 0;
    };
}

angular
    .module('pipAddDashboardComponentDialog', ['ngMaterial'])
    .controller('pipAddDashboardComponentDialogController', AddComponentDialogController);

import './AddComponentProvider';