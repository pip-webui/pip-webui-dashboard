export interface TilesGridConstructor {
  new(tiles, options, columns, elem);
}

export function ITilesGridConstructor(constructor: TilesGridConstructor, tiles, options, columns, elem): ITilesGridService {
  return new constructor(tiles, options, columns, elem);
}

export interface ITilesGridService {
  tiles: any;
  opts: any;
  columns: any;
  elem: any;
  gridCells: any;
  inline: boolean;
  isMobileLayout: boolean;

  addTile(tile): any;
  getCellByPosition(row, col): any;
  getCells(prevCell, rowSpan, colSpan): any;
  getAvailableCellsDesktop(prevCell, rowSpan, colSpan): any;
  getCell(src, basicRow, basicCol, columns): any;
  getAvailableCellsMobile(prevCell, rowSpan, colSpan): any;
  getBasicRow(prevCell): any;
  isCellFree(row, col): any;
  getCellIndex(srcCell): any;
  reserveCells(start, end, elem): void;
  clearElements(): void;
  setAvailableColumns(columns): any;
  generateGrid(singleTileWidth ? ): any;
  setTilesDimensions(onlyPosition, draggedTile): any;
  calcContainerHeight(): any;
  getTileByNode(node): any;
  getTileByCoordinates(coords, draggedTile): any;
  getTileIndex(tile): any;
  swapTiles(movedTile, beforeTile): any;
  removeTile(removeTile): any;
  updateTileOptions(opts): any;
}

const MOBILE_LAYOUT_COLUMNS = 2;

export class TilesGridService implements ITilesGridService {
  public tiles: any;
  public opts: any;
  public columns: any;
  public elem: any;
  public gridCells: any = [];
  public inline: boolean = false;
  public isMobileLayout: boolean;

  constructor(tiles, options, columns, elem) {
    this.tiles = tiles;
    this.opts = options;
    this.columns = columns || 0; // available columns in a row
    this.elem = elem;
    this.gridCells = [];
    this.inline = options.inline || false;
    this.isMobileLayout = columns === MOBILE_LAYOUT_COLUMNS;
  }

  public addTile(tile): any {
    this.tiles.push(tile);
    if (this.tiles.length === 1) {
      this.generateGrid();
    }

    return this;
  };

  public getCellByPosition(row, col): any {
    return this.gridCells[row][col];
  };

  public getCells(prevCell, rowSpan, colSpan): any {
    if (this.isMobileLayout) {
      return this.getAvailableCellsMobile(prevCell, rowSpan, colSpan);
    } else {
      return this.getAvailableCellsDesktop(prevCell, rowSpan, colSpan);
    }
  };

  public getAvailableCellsDesktop(prevCell, rowSpan, colSpan): any {
    let leftCornerCell;
    let rightCornerCell;
    const basicCol = prevCell && prevCell.col || 0;
    const basicRow = this.getBasicRow(prevCell);

    // Small tile
    if (colSpan === 1 && rowSpan === 1) {
      const gridCopy = this.gridCells.slice();

      if (!prevCell) {
        leftCornerCell = gridCopy[0][0];
      } else {
        leftCornerCell = this.getCell(gridCopy, basicRow, basicCol, this.columns);

        if (!leftCornerCell) {
          const rowShift = this.isMobileLayout ? 1 : 2;
          leftCornerCell = this.getCell(gridCopy, basicRow + rowShift, 0, this.columns);
        }
      }
    }

    // Medium tile
    if (colSpan === 2 && rowSpan === 1) {
      const prevTileSize = prevCell && prevCell.elem.size || null;

      if (!prevTileSize) {
        leftCornerCell = this.getCellByPosition(basicRow, basicCol);
        rightCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
      } else if (prevTileSize.colSpan === 2 && prevTileSize.rowSpan === 2) {
        if (this.columns - basicCol - 2 > 0) {
          leftCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
          rightCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
        } else {
          leftCornerCell = this.getCellByPosition(basicRow + 2, 0);
          rightCornerCell = this.getCellByPosition(basicRow + 2, 1);
        }
      } else if (prevTileSize.colSpan === 2 && prevTileSize.rowSpan === 1) {
        if (prevCell.row % 2 === 0) {
          leftCornerCell = this.getCellByPosition(basicRow + 1, basicCol - 1);
          rightCornerCell = this.getCellByPosition(basicRow + 1, basicCol);
        } else {
          if (this.columns - basicCol - 3 >= 0) {
            leftCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
            rightCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
          } else {
            leftCornerCell = this.getCellByPosition(basicRow + 2, 0);
            rightCornerCell = this.getCellByPosition(basicRow + 2, 1);
          }
        }
      } else if (prevTileSize.colSpan === 1 && prevTileSize.rowSpan === 1) {
        if (this.columns - basicCol - 3 >= 0) {
          if (this.isCellFree(basicRow, basicCol + 1)) {
            leftCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
            rightCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
          } else {
            leftCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
            rightCornerCell = this.getCellByPosition(basicRow, basicCol + 3);
          }
        } else {
          leftCornerCell = this.getCellByPosition(basicRow + 2, 0);
          rightCornerCell = this.getCellByPosition(basicRow + 2, 1);
        }
      }
    }

    // Big tile
    if (!prevCell && rowSpan === 2 && colSpan === 2) {
      leftCornerCell = this.getCellByPosition(basicRow, basicCol);
      rightCornerCell = this.getCellByPosition(basicRow + 1, basicCol + 1);
    } else if (rowSpan === 2 && colSpan === 2) {
      if (this.columns - basicCol - 2 > 0) {
        if (this.isCellFree(basicRow, basicCol + 1)) {
          leftCornerCell = this.getCellByPosition(basicRow, basicCol + 1);
          rightCornerCell = this.getCellByPosition(basicRow + 1, basicCol + 2);
        } else {
          leftCornerCell = this.getCellByPosition(basicRow, basicCol + 2);
          rightCornerCell = this.getCellByPosition(basicRow + 1, basicCol + 3);
        }
      } else {
        leftCornerCell = this.getCellByPosition(basicRow + 2, 0);
        rightCornerCell = this.getCellByPosition(basicRow + 3, 1);
      }
    }

    return {
      start: leftCornerCell,
      end: rightCornerCell
    };
  };

  public getCell(src, basicRow, basicCol, columns): any {
    let cell, col, row;

    if (this.isMobileLayout) {
      // mobile layout
      for (col = basicCol; col < columns; col++) {
        if (!src[basicRow][col].elem) {
          cell = src[basicRow][col];
          break;
        }
      }

      return cell;
    }

    // desktop
    for (col = basicCol; col < columns; col++) {
      for (row = 0; row < 2; row++) {
        if (!src[row + basicRow][col].elem) {
          cell = src[row + basicRow][col];
          break;
        }
      }

      if (cell) {
        return cell;
      }
    }
  };

  public getAvailableCellsMobile(prevCell, rowSpan, colSpan): any {
    let leftCornerCell;
    let rightCornerCell;
    const basicRow = this.getBasicRow(prevCell);
    const basicCol = prevCell && prevCell.col || 0;


    if (colSpan === 1 && rowSpan === 1) {
      const gridCopy = this.gridCells.slice();

      if (!prevCell) {
        leftCornerCell = gridCopy[0][0];
      } else {
        leftCornerCell = this.getCell(gridCopy, basicRow, basicCol, this.columns);

        if (!leftCornerCell) {
          const rowShift = this.isMobileLayout ? 1 : 2;
          leftCornerCell = this.getCell(gridCopy, basicRow + rowShift, 0, this.columns);
        }
      }
    }

    if (!prevCell) {
      leftCornerCell = this.getCellByPosition(basicRow, 0);
      rightCornerCell = this.getCellByPosition(basicRow + rowSpan - 1, 1);
    } else if (colSpan === 2) {
      leftCornerCell = this.getCellByPosition(basicRow + 1, 0);
      rightCornerCell = this.getCellByPosition(basicRow + rowSpan, 1);
    }

    return {
      start: leftCornerCell,
      end: rightCornerCell
    };
  };

  public getBasicRow(prevCell): any {
    let basicRow;

    if (this.isMobileLayout) {
      if (prevCell) {
        basicRow = prevCell && prevCell.row || 0;
      } else {
        basicRow = 0;
      }
    } else {
      if (prevCell) {
        basicRow = prevCell.row % 2 === 0 ? prevCell.row : prevCell.row - 1;
      } else {
        basicRow = 0;
      }
    }

    return basicRow;
  };

  public isCellFree(row, col): any {
    return !this.gridCells[row][col].elem;
  };

  public getCellIndex(srcCell): any {
    const self = this;
    let index;

    this.gridCells.forEach((row, rowIndex) => {
      index = _.findIndex(self.gridCells[rowIndex], (cell) => {
        return cell === srcCell;
      });

      if (index !== -1) {
        return;
      }
    });

    return index !== -1 ? index : 0;
  };

  public reserveCells(start, end, elem) {
    this.gridCells.forEach((row) => {
      row.forEach((cell) => {
        if (cell.row >= start.row && cell.row <= end.row &&
          cell.col >= start.col && cell.col <= end.col) {
          cell.elem = elem;
        }
      });
    });
  };

  public clearElements() {
    this.gridCells.forEach((row) => {
      row.forEach((tile) => {
        tile.elem = null;
      });
    });
  };

  public setAvailableColumns(columns): any {
    this.isMobileLayout = columns === MOBILE_LAYOUT_COLUMNS;
    this.columns = columns;

    return this;
  };

  public generateGrid(singleTileWidth ? ): any {
    const self = this,
      tileWidth = singleTileWidth || this.opts.tileWidth,
      offset = document.querySelector('.pip-draggable-group-title').getBoundingClientRect();
    let colsInRow = 0,
      rows = 0,
      gridInRow = [];

    this.gridCells = [];

    this.tiles.forEach((tile, index, srcTiles) => {
      const tileSize = tile.getSize();

      generateCells(tileSize.colSpan);

      if (srcTiles.length === index + 1) {
        if (colsInRow < self.columns) {
          generateCells(self.columns - colsInRow);
        }

        // Generate more cells for extends tile size to big
        if (self.tiles.length * 2 > self.gridCells.length) {
          Array.apply(null, Array(self.tiles.length * 2 - self.gridCells.length)).forEach(() => {
            generateCells(self.columns);
          });
        }
      }
    });

    function generateCells(newCellCount) {
      Array.apply(null, Array(newCellCount)).forEach(() => {
        if (self.columns < colsInRow + 1) {
          rows++;
          colsInRow = 0;

          self.gridCells.push(gridInRow);
          gridInRow = [];
        }

        let top = rows * self.opts.tileHeight + (rows ? rows * self.opts.gutter : 0) + offset.height;
        let left = colsInRow * tileWidth + (colsInRow ? colsInRow * self.opts.gutter : 0);

        // Describe grid cell size through block corners coordinates
        gridInRow.push({
          top: top,
          left: left,
          bottom: top + self.opts.tileHeight,
          right: left + tileWidth,
          row: rows,
          col: colsInRow
        });

        colsInRow++;
      });
    }

    return this;
  };

  public setTilesDimensions(onlyPosition, draggedTile): any {
    const self = this;
    let currIndex = 0;
    let prevCell;

    if (onlyPosition) {
      self.clearElements();
    }

    this.tiles.forEach((tile) => {
      const tileSize = tile.getSize();
      let startCell;
      let width;
      let height;
      let cells;

      tile.updateElem('.pip-draggable-tile');
      if (tileSize.colSpan === 1) {
        if (prevCell && prevCell.elem.size.colSpan === 2 && prevCell.elem.size.rowSpan === 1) {
          startCell = self.getCells(self.getCellByPosition(prevCell.row, prevCell.col - 1), 1, 1).start;
        } else {
          startCell = self.getCells(prevCell, 1, 1).start;
        }


        if (!onlyPosition) {
          width = startCell.right - startCell.left;
          height = startCell.bottom - startCell.top;
        }

        prevCell = startCell;

        self.reserveCells(startCell, startCell, tile);

        currIndex++;
      } else if (tileSize.colSpan === 2) {
        cells = self.getCells(prevCell, tileSize.rowSpan, tileSize.colSpan);
        startCell = cells.start;

        if (!onlyPosition) {
          width = cells.end.right - cells.start.left;
          height = cells.end.bottom - cells.start.top;
        }

        prevCell = cells.end;

        self.reserveCells(cells.start, cells.end, tile);

        currIndex += 2;
      }

      // Render preview
      // while tiles from group is dragged
      if (draggedTile === tile) {
        tile.setPreviewPosition({
          left: startCell.left,
          top: startCell.top
        });

        return;
      }

      if (!onlyPosition) {
        tile.setSize(width, height);
      }

      tile.setPosition(startCell.left, startCell.top);
    });

    return this;
  };

  public calcContainerHeight(): any {
    let maxHeightSize, maxWidthSize;

    if (!this.tiles.length) {
      return this;
    }

    maxHeightSize = _.maxBy(this.tiles, (tile) => {
      const tileSize = tile['getSize']();
      return tileSize.top + tileSize.height;
    })['getSize']();

    this.elem.style.height = maxHeightSize.top + maxHeightSize.height + 'px';

    if (this.inline) {
      maxWidthSize = _.maxBy(this.tiles, (tile) => {
        const tileSize = tile['getSize']();
        return tileSize.left + tileSize.width;
      })['getSize']();

      this.elem.style.width = maxWidthSize.left + maxWidthSize.width + 'px';
    }

    return this;
  };

  public getTileByNode(node): any {
    const foundTile = this.tiles.filter((tile) => {
      return node === tile.getElem();
    });

    return foundTile.length ? foundTile[0] : null;
  };

  public getTileByCoordinates(coords, draggedTile): any {
    return this.tiles
      .filter((tile) => {
        const tileSize = tile.getSize();

        return tile !== draggedTile &&
          tileSize.left <= coords.left && coords.left <= (tileSize.left + tileSize.width) &&
          tileSize.top <= coords.top && coords.top <= (tileSize.top + tileSize.height);
      })[0] || null;
  };

  public getTileIndex(tile): any {
    return _.findIndex(this.tiles, tile);
  };

  public swapTiles(movedTile, beforeTile): any {
    const movedTileIndex = _.findIndex(this.tiles, movedTile);
    const beforeTileIndex = _.findIndex(this.tiles, beforeTile);

    this.tiles.splice(movedTileIndex, 1);
    this.tiles.splice(beforeTileIndex, 0, movedTile);

    return this;
  };

  public removeTile(removeTile): any {
    let droppedTile;

    this.tiles.forEach((tile, index, tiles) => {
      if (tile === removeTile) {
        droppedTile = tiles.splice(index, 1)[0];
        return false;
      }
    });

    return droppedTile;
  };

  public updateTileOptions(opts): any {
    const index = _.findIndex(this.tiles, (tile) => {
      return tile['getOptions']() === opts;
    });

    if (index !== -1) {
      this.tiles[index].setOptions(opts);
      return true;
    }

    return false;
  };
}


angular
  .module('pipDraggableTilesGroup')
  .service('pipTilesGrid', function () {
    return function (tiles, options, columns, elem) {
      const newGrid = new TilesGridService(tiles, options, columns, elem);

      return newGrid;
    }
  });