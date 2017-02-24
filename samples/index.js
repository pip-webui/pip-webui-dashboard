'use strict';

const STATES = [{ 
    title: 'Dashboard',
    icon: 'dashboard',
    name: 'dashboard', 
    url: '/dashboard', 
    controller: 'pipDashboardSampleController', 
    templateUrl: 'DashboardSample.html' 
}];

function configureDashboardRoutes(
    $stateProvider,//: ng.ui.IStateProvider
    $mdIconProvider,
    $urlRouterProvider
) {
    "ngInject";

    $mdIconProvider.iconSet('icons', '../lib/images/icons.svg', 512);

    // Configure module routes
    _.each(STATES, (state) => {
        $stateProvider.state(state.name, {
            url: state.url, 
            controller: state.controller, 
            controllerAs: 'vm',
            templateUrl: state.templateUrl
        })
    });

    $urlRouterProvider.otherwise('/dashboard');
}

class MainController {
    constructor(
        $scope,//: angular.IScope
        $rootScope,
        $state,
        $mdSidenav,
        pipSystemInfo//: pip.services.ISystemInfo
    ) {
        $scope.title = 'Dashboard';
        $scope.content = STATES;
        $scope.browser = pipSystemInfo.browserName;

        $scope.onSwitchPage = (state) => {
            $mdSidenav('left').close();
            $state.go(state);
        };

        $scope.onToggleMenu = () => {
            $mdSidenav('left').toggle();
        };

        $scope.isActiveState = (state) => {
            return $state.current.name == state;
        };

    }
}

angular
    .module('app.Dashboard', ['ngMaterial', 'pipServices', 'pipDashboard'])
    .controller('samplesMainController', MainController)
    .config(configureDashboardRoutes);