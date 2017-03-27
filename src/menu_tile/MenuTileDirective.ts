{
  const TileMenu = ():ng.IDirective => {
    return {
      restrict: 'EA',
      templateUrl: 'menu_tile/MenuTile.html'
    };
  }

  angular
    .module('pipMenuTile')
    .directive('pipTileMenu', TileMenu);
}