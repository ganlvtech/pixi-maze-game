import * as PIXI from "pixi.js";
import {Maze, WallDirection} from "../maze/Maze";

class Map extends PIXI.Graphics {
    readonly cellWidth: number;
    readonly wallBreadth: number;
    readonly wallLength: number;
    readonly maze: Maze;

    constructor(cellWidth: number, wallBreadth: number, maze: Maze) {
        super();
        this.cellWidth = cellWidth;
        this.wallBreadth = wallBreadth;
        this.wallLength = this.cellWidth + this.wallBreadth;
        this.maze = maze;
    }

    update() {
        this.clear();
        this.beginFill(0xcccccc);
        this.maze.walls.forEach(row => {
            row.forEach(item => {
                if (item.isWall) {
                    switch (item.direction) {
                        case WallDirection.HORIZONTAL:
                            this.drawRect(item.x * this.cellWidth, item.y * this.cellWidth, this.wallLength, this.wallBreadth);
                            break;
                        case WallDirection.VERTICAL:
                            this.drawRect(item.x * this.cellWidth, item.y * this.cellWidth, this.wallBreadth, this.wallLength);
                            break;
                    }
                }
            });
        });
        this.endFill();
    }

    getCell(x: number, y: number) {
        return this.maze.getCell(x / this.cellWidth, y / this.cellWidth);
    }
}

export {
    Map,
};
