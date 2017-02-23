(() => {
  'use strict';

  angular
    .module('pipWidget')
    .directive('pipMenuWidget', pipMenuWidget);

  function pipMenuWidget() {
    return {
      restrict        : 'EA',
      templateUrl     : 'widgets/menu/WidgetMenu.html'
    };
  }
})();
