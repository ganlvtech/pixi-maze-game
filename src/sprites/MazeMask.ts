import * as PIXI from "pixi.js";

class SimpleMazeMask extends PIXI.Sprite {
    constructor(radius: number, blurSize: number, app: PIXI.Application) {
        let circle = new PIXI.Graphics();
        circle.beginFill(0xFF0000);
        circle.drawCircle(radius + blurSize, radius + blurSize, radius);
        circle.endFill();
        circle.filters = [new PIXI.filters.BlurFilter(blurSize)];
        const bounds = new PIXI.Rectangle(0, 0, (radius + blurSize) * 2, (radius + blurSize) * 2);
        const texture = app.renderer.generateTexture(circle, PIXI.SCALE_MODES.NEAREST, 1, bounds);
        super(texture);
        this.anchor.set(0.5, 0.5);
    }
}

export {
    SimpleMazeMask
}
