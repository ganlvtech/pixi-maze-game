import * as PIXI from "pixi.js";

class Ball extends PIXI.Sprite {
    readonly radius: number;
    vx: number;
    vy: number;

    constructor(radius: number, color: number, app: PIXI.Application) {
        let circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(radius, radius, radius);
        circle.endFill();
        const bounds = new PIXI.Rectangle(0, 0, radius * 2, radius * 2);
        const texture = app.renderer.generateTexture(circle, PIXI.SCALE_MODES.NEAREST, 1, bounds);
        super(texture);
        this.radius = radius;
        this.anchor.set(0.5, 0.5);
    }
}

export {
    Ball,
};
