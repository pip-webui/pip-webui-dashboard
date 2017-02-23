'use strict';

angular
  .module('pipDragged')
  .directive('pipDraggableGrid', DragDirective);

function DragDirective() {
  return {
    restrict: 'E',
    scope: {
      tilesTemplates: '=pipTilesTemplates',
      tilesContext: '=pipTilesContext',
      options: '=pipDraggableGrid',
      groupMenuActions: '=pipGroupMenuActions'
    },
    templateUrl: 'draggable/Draggable.html',
    bindToController: true,
    controllerAs: 'draggableCtrl',
    controller: 'pipDraggableCtrl',
    link: function ($scope, $elem) {
      $scope.$container = $elem;
    }
  };
}