let D = console.log


export type State = "stopped" | "running" | "paused";

type FoodCell = "empty" | "food";
type SnakeCell = "empty" | "snake_head" | "snake_body";
export type Cell = FoodCell | SnakeCell;
export type Snake = Array<[number, number]>

export class Grid {
    readonly size: number;

    private m_food_layer: Array<Array<FoodCell>>;
    private m_snake_layer: Array<Array<SnakeCell>>;

    // this is public but I wish it wasn't
    // unfortunately it needs to be acessed and set to cause a svelte reactivity update
    grid: Array<Array<Cell>>;

    constructor(size: number) {
        this.size = size;
        this.reset();
    }

    reset(): void {
        this.m_food_layer = [...Array(this.size)].map(() => Array(this.size).fill("empty"));
        this.m_snake_layer = [...Array(this.size)].map(() => Array(this.size).fill("empty"));
        this.grid = [...Array(this.size)].map(() => Array(this.size).fill("empty"));
    }

    spawnFood(): void {
        // TODO
    }

    at(x: number, y: number): Cell {
        if (this.m_snake_layer[y][x] !== "empty") {
            return this.m_snake_layer[y][x];
        } else if (this.m_food_layer[y][x] !== "empty") {
            return this.m_food_layer[y][x];
        } else {
            return "empty";
        }
    }

    update(snake: Snake): void {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid.length; x++) {
                if (snake[0][0] == x && snake[0][1] == y) {
                    this.m_snake_layer[y][x] = "snake_head";
                }
                else if (snake.some((v) => v[0] == x && v[1] == y)) {
                    this.m_snake_layer[y][x] = "snake_body";
                } else if (this.at(x, y) === "food") {
                    continue;
                } else {
                    this.m_snake_layer[y][x] = "empty";
                    this.m_food_layer[y][x] = "empty";
                }
            }
        }
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid.length; x++) {
                this.grid[x][y] = this.at(x, y);
            }
        }
    }
};


export default class BioSnake {
    private m_tick_delay: ((n: number) => number);
    private m_state: State = "stopped"
    private m_snake: Snake = [[12, 13]];
    private m_grid: Grid;
    private m_step: number = 0;
    private m_tick_timeout: number;

    private m_direction: [number, number] = [0, 0];
    private m_prev_direction: [number, number] = [0, 0];
    tick_callback: (n: number) => void;
    lost = false;

    constructor(size: number = 20, tick_delay: number | ((n: number) => number) = 200, tick_callback?: (n: number) => void) {
        this.m_grid = new Grid(size);
        this.tick_callback = tick_callback;

        if (typeof tick_delay == "number") {
            this.m_tick_delay = () => tick_delay;
        } else { this.m_tick_delay = tick_delay; }

        this.m_grid.update(this.m_snake);
    }

    start(): void {
        if (!this.isStopped) { return; }
        this.reset();
        this.m_state = "running";
        this.loop();
    }

    pause(): void {
        if (!this.isRunning) { return; }
        this.m_state = "paused";
        clearTimeout(this.m_tick_timeout);
    }

    resume(): void {
        if (!this.isPaused) { return; }
        this.m_state = "running"
        this.loop();
    }

    stop(): void {
        if (this.isStopped) { return; }
        this.m_state = "stopped"
        clearTimeout(this.m_tick_timeout);
        this.m_step = 0;
    }

    reset(): void {
        this.m_state = "stopped"
        this.m_snake = [[12, 13]];
        this.m_grid.reset();
        this.m_grid.update(this.m_snake);
    }

    tick(): void {
        const [x, y] = this.m_snake[0]; // head of snake
        const [dx, dy] = this.m_direction;
        const newHead = [dx + x, y + dy] as [number, number];

        if ((newHead[0] < 0 || newHead[0] > this.m_grid.size - 1) || (newHead[1] < 0 || newHead[1] > this.m_grid.size - 1)) {
            // out of bounds
            this.m_state = "stopped";
            this.lost = true;
            return;
        }

        let ateFood = false;
        if (this.m_grid.at(newHead[0], newHead[1]) === "food") {
            ateFood = true;
            this.m_grid.spawnFood();
        }

        const snakeBody = this.m_snake.slice(
            0,
            this.m_snake.length - (ateFood ? 0 : 1)
        );

        if (this.m_snake.length > 3) {
            if (snakeBody.some((x) => x[0] === newHead[0] && x[1] === newHead[1])) {
                this.m_state = "stopped";
                this.lost = true;
                return;
            }
        }

        this.m_snake = [newHead, ...snakeBody];
        if (this.tick_callback) { this.tick_callback(this.m_step); }
        this.m_grid.update(this.m_snake);
        this.m_step++;
    }

    private loop() {
        this.m_tick_timeout = setTimeout(() => {
            this.tick();
            console.log(this.m_grid.grid);
            if (!this.isStopped && !this.isPaused) {
                this.loop();
            }
        }, this.m_tick_delay(this.m_step)) as unknown as number;
    }

    get state(): State { return this.m_state; }
    get snake(): Array<[number, number]> { return this.m_snake; }
    get grid(): Grid { return this.m_grid; }
    get step(): number { return this.m_step; }

    get score(): number { return this.m_snake.length }

    get isStopped(): boolean { return this.m_state == "stopped"; }
    get isRunning(): boolean { return this.m_state == "running"; }
    get isPaused(): boolean { return this.m_state == "paused"; }

    set direction(dir: [number, number]) { this.m_prev_direction = this.m_direction; this.m_direction = dir; }
    get direction(): [number, number] { return this.m_direction; }
    get prev_direction(): [number, number] { return this.m_prev_direction; }

}
