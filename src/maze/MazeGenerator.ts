import {Cell, Maze} from "./Maze";

class MazeGeneratorCell {
    readonly cell: Cell;
    readonly mazeGenerator: MazeGenerator;
    isVisited: boolean;

    constructor(cell: Cell, mazeGenerator: MazeGenerator) {
        this.cell = cell;
        this.mazeGenerator = mazeGenerator;
        this.isVisited = false;
    }

    get availableDirections(): number[] {
        let result: number[] = [];
        this.cell.neighbours.forEach((cell, direction) => {
            if (cell) {
                if (!this.mazeGenerator.getCell(cell.x, cell.y).isVisited) {
                    result.push(direction);
                }
            }
        });
        return result;
    }

    getNeighbourCell(direction: number): MazeGeneratorCell {
        let cell = this.cell.getNeighbourCell(direction);
        return this.mazeGenerator.getCell(cell.x, cell.y);
    }
}

class MazeGenerator {
    maze: Maze;
    cells: MazeGeneratorCell[][];
    queue: MazeGeneratorCell[];

    constructor(maze: Maze) {
        this.maze = maze;
        this.cells = [];
        for (let y = 0; y < this.maze.h; y++) {
            let row = [];
            for (let x = 0; x < this.maze.w; x++) {
                row.push(new MazeGeneratorCell(this.maze.getCell(x, y), this));
            }
            this.cells.push(row);
        }
        this.queue = [];
    }

    private reset() {
        this.cells.forEach(row => {
            row.forEach(item => {
                item.isVisited = false;
            });
        });
    }

    getCell(x: number, y: number) {
        return this.cells[y][x];
    }

    /**
     * A limited DFS maze generation algorithm.
     *
     * 1. Use recursive backtracker maze generation, but limit the stack length (aka. current path length).
     * 2. If it reaches the limit, then put it into a queue.
     * 3. Breadth "second" search the queue.
     *
     * If no limit (DFS), the maze has too many tiny dead ends, and the good path is easy to find.
     * With a limit (DFS then BFS), the maze path is really long, but every possible path is deep enough.
     *
     * @see http://www.astrolog.org/labyrnth/algrithm.htm
     *
     * @param {number} [riverFactor] max length of one path. number form 0 to 1 (0: BFS, 1: DFS). Default is 0.1
     */
    generate(riverFactor: number = 0.1) {
        this.reset();
        this.queue.push(this.getCell(0, 0));
        let river = this.maze.w * this.maze.h * riverFactor;
        if (river < 3) {
            river = 3;
        }
        while (this.queue.length > 0) {
            let n = Math.floor(Math.random() * this.queue.length);
            this.next(this.queue.splice(n, 1)[0], river);
        }
    }

    next(cell: MazeGeneratorCell, len: number) {
        cell.isVisited = true;
        if (len > 0) {
            for (; ;) {
                let avails = cell.availableDirections;
                if (avails.length > 0) {
                    let n = Math.floor(Math.random() * avails.length);
                    let direction = avails[n];
                    cell.cell.getWall(direction).isWall = false;
                    this.next(cell.getNeighbourCell(direction), len - 1);
                } else {
                    break;
                }
            }
        } else {
            this.queue.push(cell);
        }
    }
}

export {
    MazeGenerator,
};
