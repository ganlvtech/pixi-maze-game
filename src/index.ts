/// <reference path="../node_modules/pixi.js/pixi.js.d.ts"/>

import {MazeGame} from "./MazeGame";

let game = new MazeGame();
document.body.appendChild(game.app.renderer.view);
window.addEventListener("devicemotion", function (event: DeviceMotionEvent) {
    game.onDeviceMotion(event);
});
window.addEventListener("click", function () {
    game.reset();
});

// @ts-ignore
window.game = game;
