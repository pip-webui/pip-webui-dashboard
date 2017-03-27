{
  interface DraggableTileAttributes extends ng.IAttributes {
    pipDraggableTiles: any;
  }

  function DraggableTileLink(
    $scope: ng.IScope,
    $elem: JQuery,
    $attr: DraggableTileAttributes
  ) {
    const docFrag = document.createDocumentFragment(),
      group = $scope.$eval($attr.pipDraggableTiles);

    group.forEach(function (tile) {
      const tpl = wrapComponent(tile.getCompiledTemplate());
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

  function DraggableTiles(): ng.IDirective {
    return {
      restrict: 'A',
      link: function(
        $scope: ng.IScope,
        $elem: JQuery,
        $attr: DraggableTileAttributes
      ) {
          new DraggableTileLink($scope, $elem, $attr);
      }
    };
  }

  angular
    .module('pipDraggableTilesGroup')
    .directive('pipDraggableTiles', DraggableTiles);
}