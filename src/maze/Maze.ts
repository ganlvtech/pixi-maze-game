import * as PIXI from "pixi.js";

enum NeighbourDirection {
    TOP,
    RIGHT,
    BOTTOM,
    LEFT
}

enum WallDirection {
    HORIZONTAL,
    VERTICAL
}

class Cell {
    readonly x: number;
    readonly y: number;
    readonly maze: Maze;

    constructor(x: number, y: number, maze: Maze) {
        this.x = x;
        this.y = y;
        this.maze = maze;
    }

    get centerX() {
        return this.x + 0.5;
    }

    get centerY() {
        return this.y + 0.5;
    }

    private _neighboursExists: boolean[];

    get neighboursExists(): boolean[] {
        if (!this._neighboursExists) {
            this._neighboursExists = [
                (this.y !== 0), // TOP
                (this.x !== this.maze.w - 1), // RIGHT
                (this.y !== this.maze.h - 1), // BOTTOM
                (this.x !== 0), // LEFT
            ];
        }
        return this._neighboursExists;
    }

    private _neighbours: Cell[];

    get neighbours(): Cell[] {
        if (!this._neighbours) {
            this._neighbours = [];
            for (let direction = NeighbourDirection.TOP; direction <= NeighbourDirection.LEFT; direction++) {
                this._neighbours.push(this.getNeighbourCell(direction));
            }
        }
        return this._neighbours;
    }

    private _walls: Wall[];

    get walls(): Wall[] {
        if (!this._walls) {
            this._walls = [];
            for (let direction = NeighbourDirection.TOP; direction <= NeighbourDirection.LEFT; direction++) {
                this._walls.push(this.getWall(direction));
            }
        }
        return this._walls;
    }

    static getWallIndex(x: number, y: number, direction: NeighbourDirection): { x: number; y: number } {
        switch (direction) {
            case NeighbourDirection.TOP:
                return {x: x, y: y * 2};
            case NeighbourDirection.RIGHT:
                return {x: x + 1, y: y * 2 + 1};
            case NeighbourDirection.BOTTOM:
                return {x: x, y: y * 2 + 2};
            case NeighbourDirection.LEFT:
                return {x: x, y: y * 2 + 1};
            default:
                throw new Error("getWallIndex bad direction");
        }
    }

    static getNeighbourCellIndex(x: number, y: number, direction: NeighbourDirection): { x: number; y: number } {
        switch (direction) {
            case NeighbourDirection.TOP:
                return {x: x, y: y - 1};
            case NeighbourDirection.RIGHT:
                return {x: x + 1, y: y};
            case NeighbourDirection.BOTTOM:
                return {x: x, y: y + 1};
            case NeighbourDirection.LEFT:
                return {x: x - 1, y: y};
            default:
                throw new Error("getNeighbourCellIndex bad direction");
        }
    }

    getWall(direction: NeighbourDirection): Wall {
        let pos = Cell.getWallIndex(this.x, this.y, direction);
        return this.maze.getWall(pos.x, pos.y);
    }

    getNeighbourCell(direction: NeighbourDirection): Cell {
        if (!this.neighboursExists[direction]) {
            return null;
        }
        let pos = Cell.getNeighbourCellIndex(this.x, this.y, direction);
        return this.maze.getCell(pos.x, pos.y);
    }
}

class Wall {
    readonly x: number;
    readonly y: number;
    readonly direction: WallDirection;
    isWall: boolean;
    readonly maze: Maze;

    constructor(x: number, y: number, direction: WallDirection, isWall: boolean, maze: Maze) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isWall = isWall;
        this.maze = maze;
    }

    get endX() {
        switch (this.direction) {
            case WallDirection.HORIZONTAL:
                return this.x + 1;
            case WallDirection.VERTICAL:
                return this.x;
            default:
                throw new Error("unknown wall direction");
        }
    }

    get endY() {
        switch (this.direction) {
            case WallDirection.HORIZONTAL:
                return this.y;
            case WallDirection.VERTICAL:
                return this.y + 1;
            default:
                throw new Error("unknown wall direction");
        }
    }

    static getWallDirectionByYIndex(y: number): WallDirection {
        return y & 1;
    }

    static getRowWallCountByYIndex(y: number, w: number) {
        if (this.getWallDirectionByYIndex(y) === WallDirection.VERTICAL) {
            return w + 1;
        } else {
            return w;
        }
    }
}

class Maze {
    readonly w: number;
    readonly h: number;
    walls: Wall[][];
    cells: Cell[][];

    constructor(w: number, h: number) {
        this.w = w;
        this.h = h;

        this.walls = [];
        for (let y = 0; y < this.h; y++) {
            let horizontalRow = [];
            let verticalRow = [];
            for (let x = 0; x < this.w; x++) {
                horizontalRow.push(new Wall(x, y, WallDirection.HORIZONTAL, true, this));
                verticalRow.push(new Wall(x, y, WallDirection.VERTICAL, true, this));
            }
            verticalRow.push(new Wall(this.w, y, WallDirection.VERTICAL, true, this));
            this.walls.push(horizontalRow);
            this.walls.push(verticalRow);
        }
        if (this.h > 0) {
            let horizontalRow = [];
            for (let x = 0; x < this.w; x++) {
                horizontalRow.push(new Wall(x, this.h, WallDirection.HORIZONTAL, true, this));
            }
            this.walls.push(horizontalRow);
        }

        this.cells = [];
        for (let y = 0; y < this.h; y++) {
            let row = [];
            for (let x = 0; x < this.w; x++) {
                row.push(new Cell(x, y, this));
            }
            this.cells.push(row);
        }
    }

    static fromGenerator() {
    }

    getCell(x: number, y: number): Cell {
        if (y < 0 || y >= this.h || x < 0 || x >= this.w) {
            throw new Error("cell not exists");
        }
        x = Math.floor(x);
        y = Math.floor(y);
        return this.cells[y][x];
    }

    getWall(x: number, y: number): Wall {
        if (y < 0 || y >= this.walls.length) {
            throw new Error("wall not exists");
        }
        if (x < 0 || x >= this.walls[y].length) {
            throw new Error("wall not exists");
        }
        return this.walls[y][x];
    }

    reset() {
        this.walls.forEach(row => {
            row.forEach(item => {
                item.isWall = true;
            });
        });
    }

    draw(graphics: PIXI.Graphics, a: number = 20, b: number = 2) {
        graphics.beginFill(0xcccccc);
        this.walls.forEach(row => {
            row.forEach(item => {
                if (item.isWall) {
                    switch (item.direction) {
                        case WallDirection.HORIZONTAL:
                            graphics.drawRect(item.x * a, item.y * a, b + a, b);
                            break;
                        case WallDirection.VERTICAL:
                            graphics.drawRect(item.x * a, item.y * a, b, b + a);
                            break;
                    }
                }
            });
        });
        graphics.endFill();
        return graphics;
    }

    toString() {
        let result = "";
        for (let y = 0; y <= this.h; y++) {
            if (y === 0) {
                for (let x = 0; x < this.w; x++) {
                    result += ".";
                    result += this.getWall(x, 0).isWall ? "__" : "  ";
                }
                result += ".";
                result += "\n";
            } else {
                for (let x = 0; x < this.w; x++) {
                    result += this.getWall(x, y * 2 - 1).isWall ? "|" : ".";
                    result += this.getWall(x, y * 2).isWall ? "__" : "  ";
                }
                result += this.getWall(this.w, y * 2 - 1).isWall ? "|" : ".";
                result += "\n";
            }
        }
        return result;
    }
}

export {
    NeighbourDirection,
    WallDirection,
    Cell,
    Wall,
    Maze,
};
