
class TileColors {
    static all: string[] = ['purple', 'green', 'gray', 'orange', 'blue'];
}

class TileSizes {
    static all: any = [{
            name: 'DASHBOARD_TILE_CONFIG_DIALOG_SIZE_SMALL',
            id: '11'
        },
        {
            name: 'DASHBOARD_TILE_CONFIG_DIALOG_SIZE_WIDE',
            id: '21'
        },
        {
            name: 'DASHBOARD_TILE_CONFIG_DIALOG_SIZE_LARGE',
            id: '22'
        }
    ];
}

export class TileConfigDialogController {
    public colors: string[] = TileColors.all;
    public sizes: any = TileSizes.all;
    public sizeId: string = TileSizes.all[0].id;
    public onCancel: Function;

    constructor(
        public params,
        public extensionUrl,
        public $mdDialog: angular.material.IDialogService
    ) {
        "ngInject";

        angular.extend(this, this.params);
        this.sizeId = '' + this.params.size.colSpan + this.params.size.rowSpan;

        this.onCancel = () => {
            this.$mdDialog.cancel();
        }
    }

    public onApply(updatedData) {
        this['size'].sizeX = Number(this.sizeId.substr(0, 1));
        this['size'].sizeY = Number(this.sizeId.substr(1, 1));
        this.$mdDialog.hide(updatedData);
    }
}