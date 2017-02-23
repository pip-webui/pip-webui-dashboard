'use strict';

angular
  .module('pipDragged')
  .directive('pipDraggableTiles', DraggableTile);

function DraggableTile() {
  return {
    restrict: 'A',
    link: function ($scope, $elem, $attr) {
      var docFrag = document.createDocumentFragment();
      var group = $scope.$eval($attr.pipDraggableTiles);

      group.forEach(function (tile) {
        var tpl = wrapComponent(tile.getCompiledTemplate());
        docFrag.appendChild(tpl);
      });

      $elem.append(docFrag);

      function wrapComponent(elem) {
        return $('<div>')
          .addClass('pip-draggable-tile')
          .append(elem)
          .get(0);
      }
    }
  };
}