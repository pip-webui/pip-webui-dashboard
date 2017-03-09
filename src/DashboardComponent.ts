(function () {
  'use strict';

  const pipDashboard: ng.IComponentOptions = {
    bindings: {
      gridOptions: '=pipGridOptions',
      groupAdditionalActions: '=pipGroupActions',
      groupedWidgets: '=pipGroups'
    },
    controller: 'pipDashboardCtrl',
    controllerAs: 'dashboardCtrl',
    templateUrl: 'Dashboard.html'
  }

  angular
    .module('pipDashboard')
    .component('pipDashboard', pipDashboard);
})();