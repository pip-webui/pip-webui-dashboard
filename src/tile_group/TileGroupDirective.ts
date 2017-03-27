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

  function DraggableTile() {
    return {
      restrict: 'A',
      link: DraggableTileLink
    };
  }

console.log('here 3');

  angular
    .module('pipDraggableTilesGroup')
    .directive('pipDraggableTiles', DraggableTile);
}