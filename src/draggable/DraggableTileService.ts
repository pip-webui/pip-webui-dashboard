'use strict';

export interface DragTileConstructor {
  new (options: any);
}

export function IDragTileConstructor(constructor: DragTileConstructor, options: any): IDragTileService {
  return new constructor(options);
}

export interface IDragTileService {
  tpl: any;
  opts: any;
  size: any;
  elem: any;
  preview: any;
  getSize(): any;
  setSize(width, height): any;
  setPosition(left, top): any;
  getCompiledTemplate(): any;
  updateElem(parent): any;
  getElem(): any;
  startDrag(): any;
  stopDrag(isAnimate): any;
  setPreviewPosition(coords): void;
  getOptions(): any;
  setOptions(options): any;
}

let DEFAULT_TILE_SIZE = {
  colSpan: 1,
  rowSpan: 1
};

export class DragTileService implements IDragTileService {
  public tpl: any;
  public opts: any;
  public size: any;
  public elem: any;
  public preview: any;

  constructor (options: any) {
    this.tpl = options.tpl.get(0);
    this.opts = options;
    this.size = _.merge({}, DEFAULT_TILE_SIZE, options.size);
    this.elem = null;
  }

  public getSize(): any {
    return this.size;
  }

  public setSize(width, height): any {
    this.size.width = width;
    this.size.height = height;

    if (this.elem) {
      this.elem.css({
        width: width,
        height: height
      });
    }

    return this;
  }

  public setPosition(left, top): any {
    this.size.left = left;
    this.size.top = top;

    if (this.elem) {
      this.elem.css({
        left: left,
        top: top
      });
    }

    return this;
  }

  public getCompiledTemplate(): any {
    return this.tpl;
  };

  public updateElem(parent): any {
    this.elem = $(this.tpl).parent(parent);

    return this;
  };

  public getElem(): any {
    return this.elem.get(0);
  };

  public startDrag(): any {
    this.preview = $('<div>')
      .addClass('pip-dragged-preview')
      .css({
        position: 'absolute',
        left: this.elem.css('left'),
        top: this.elem.css('top'),
        width: this.elem.css('width'),
        height: this.elem.css('height')
      });

    this.elem
      .addClass('no-animation')
      .css({
        zIndex: '9999'
      })
      .after(this.preview);

    return this;
  };

  public stopDrag(isAnimate): any {
    let self = this;

    if (isAnimate) {
      this.elem
        .removeClass('no-animation')
        .css({
          left: this.preview.css('left'),
          top: this.preview.css('top')
        })
        .on('transitionend', onTransitionEnd);
    } else {
      self.elem
        .css({
          left: self.preview.css('left'),
          top: self.preview.css('top'),
          zIndex: ''
        })
        .removeClass('no-animation');

      self.preview.remove();
      self.preview = null;
    }

    return this;

    function onTransitionEnd() {
      if (self.preview) {
        self.preview.remove();
        self.preview = null;
      }

      self.elem
        .css('zIndex', '')
        .off('transitionend', onTransitionEnd);
    }
  };

  public setPreviewPosition(coords) {
    this.preview.css(coords);
  };

  public getOptions(): any {
    return this.opts.options;
  };

  public setOptions(options): any {
    _.merge(this.opts.options, options);
    _.merge(this.size, options.size);

    return this;
  };
}

angular
  .module('pipDragged')
  .service('pipDragTile', function () {
    return function (options) {
      let newTile = new DragTileService(options);

      return newTile;
    }
  });