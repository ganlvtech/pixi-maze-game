import * as PIXI from "pixi.js";
import {Map} from "./sprites/Map";
import {Maze, NeighbourDirection} from "./maze/Maze";
import {SimpleMazeMask} from "./sprites/MazeMask";
import {Ball} from "./sprites/Ball";
import {MazeGenerator} from "./maze/MazeGenerator";

class MazeGame {
    app: PIXI.Application;
    maze: Maze;
    map: Map;
    mazeMask: SimpleMazeMask;
    bg: PIXI.Container;
    ball: Ball;

    constructor() {
        this.app = new PIXI.Application({
            antialias: true,
        });
        this.maze = new Maze(20, 20);
        this.map = new Map(30, 2, this.maze);
        this.app.renderer.autoDensity = true;
        this.app.renderer.resize(this.map.cellWidth * this.maze.w + this.map.wallBreadth, this.map.cellWidth * this.maze.h + this.map.wallBreadth);
        this.ball = new Ball(8, 0x00ff00, this.app);
        this.bg = new PIXI.Container();
        this.bg.addChild(this.map);
        this.bg.addChild(this.ball);
        this.app.stage.addChild(this.bg);
        this.mazeMask = new SimpleMazeMask(100, 30, this.app);
        this.app.stage.addChild(this.mazeMask);
        this.bg.mask = this.mazeMask;

        this.app.stage.interactive = true;
        this.app.stage.on("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("devicemotion", this.onDeviceMotion.bind(this));

        this.reset();
    }

    reset() {
        this.maze.reset();
        let mazeGenerator = new MazeGenerator(this.maze);
        mazeGenerator.generate();
        console.log(this.maze.toString());
        this.map.update();
        let cell = this.maze.getCell(0, 0);
        this.ball.x = cell.centerX * this.map.cellWidth;
        this.ball.y = cell.centerY * this.map.cellWidth;
        this.mazeMask.x = this.ball.x;
        this.mazeMask.y = this.ball.y;
    }

    moveBall(dx: number, dy: number) {
        let maxMove = this.ball.radius - 2;
        if (dx > maxMove) {
            dx = maxMove;
        }
        if (dy > maxMove) {
            dy = maxMove;
        }
        if (dx < -maxMove) {
            dx = -maxMove;
        }
        if (dy < -maxMove) {
            dy = -maxMove;
        }
        this.ball.x += dx;
        this.ball.y += dy;
        let restricted = this.wallRestrict(this.ball.x, this.ball.y);
        this.ball.x = restricted.x;
        this.ball.y = restricted.y;
        this.mazeMask.x = this.ball.x;
        this.mazeMask.y = this.ball.y;
        let cell = this.map.getCell(this.ball.x, this.ball.y);
        if (cell.x === this.maze.w - 1 && cell.y == this.maze.h - 1) {
            alert("You win!");
            this.reset();
        }
    }

    onDeviceMotion(event: DeviceMotionEvent) {
        let ax;
        let ay;
        switch (screen.orientation.type) {
            case "portrait-primary":
                ax = -event.accelerationIncludingGravity.x;
                ay = event.accelerationIncludingGravity.y;
                break;
            case "landscape-primary":
                ax = event.accelerationIncludingGravity.y;
                ay = event.accelerationIncludingGravity.x;
                break;
            case "landscape-secondary":
                ax = -event.accelerationIncludingGravity.y;
                ay = -event.accelerationIncludingGravity.x;
                break;
            case "portrait-secondary":
                ax = event.accelerationIncludingGravity.x;
                ay = -event.accelerationIncludingGravity.y;
                break;
        }
        this.moveBall(ax, ay);
    }

    onMouseMove(event: PIXI.interaction.InteractionEvent) {
        let dx = event.data.global.x - this.ball.x;
        let dy = event.data.global.y - this.ball.y;
        this.moveBall(dx, dy);
    }

    wallRestrict(x: number, y: number) {
        let cell = this.map.getCell(x, y);
        if (x > cell.centerX * this.map.cellWidth) {
            let wall = cell.getWall(NeighbourDirection.RIGHT);
            if (wall.isWall) {
                if (x > wall.x * this.map.cellWidth - this.ball.radius) {
                    x = wall.x * this.map.cellWidth - this.ball.radius;
                }
            }
        } else {
            let wall = cell.getWall(NeighbourDirection.LEFT);
            if (wall.isWall) {
                if (x < wall.x * this.map.cellWidth + this.ball.radius) {
                    x = wall.x * this.map.cellWidth + this.ball.radius;
                }
            }
        }
        if (y > cell.centerY * this.map.cellWidth) {
            let wall = cell.getWall(NeighbourDirection.BOTTOM);
            if (wall.isWall) {
                if (y > wall.y * this.map.cellWidth - this.ball.radius) {
                    y = wall.y * this.map.cellWidth - this.ball.radius;
                }
            }
        } else {
            let wall = cell.getWall(NeighbourDirection.TOP);
            if (wall.isWall) {
                if (y < wall.y * this.map.cellWidth + this.ball.radius) {
                    y = wall.y * this.map.cellWidth + this.ball.radius;
                }
            }
        }
        return {x: x, y: y};
    }
}

export {
    MazeGame,
};
