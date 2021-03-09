<script lang="ts">
  import { onMount } from "svelte";

  const GRID_SIZE = 20;
  const DEBUG_STEP = process.env.NODE_ENV === "development" && false;

  function tick_delay(): number {
    return 200;
  }

  type FoodCell = "empty" | "food";
  type SnakeCell = "empty" | "head" | "body";

  type Dir = "up" | "down" | "left" | "right" | "none";
  interface State {
    status: "stopped" | "running" | "lost";
    dir: Dir;
    prev_dir: Dir;
  }
  class Cell {
    food: FoodCell = "empty";
    snake: SnakeCell = "empty";
    connections: Array<Dir> = [];

    constructor() {}

    get empty(): boolean {
      return this.food == "empty" && this.snake == "empty";
    }

    get value(): FoodCell | SnakeCell {
      // snake should always be visible above food
      if (this.empty) return "empty";
      return this.snake !== "empty" ? this.snake : this.food;
    }
  }

  let state: State = { status: "stopped", dir: "none", prev_dir: "none" };
  let grid: Array<Array<Cell>>;
  let snake: Array<[number, number]>;
  let step: number;
  let tick_timeout: number;

  const dir2vec: Map<Dir, [number, number]> = new Map([
    ["up", [0, -1]],
    ["down", [0, 1]],
    ["left", [-1, 0]],
    ["right", [1, 0]],
    ["none", [0, 0]],
  ]);
  function vec2dir(v: [number, number]): Dir {
    for (const [dir, vec] of dir2vec.entries()) {
      if (vec[0] === v[0] && vec[1] === v[1]) {
        return dir;
      }
    }
    return "none";
  }

  const dir2connect: Map<Dir, string> = new Map([
    ["up", "connect-top"],
    ["down", "connect-bottom"],
    ["left", "connect-left"],
    ["right", "connect-right"],
    ["none", ""],
  ]);

  const oppositeDir: Map<Dir, Dir> = new Map([
    ["up", "down"],
    ["down", "up"],
    ["left", "right"],
    ["right", "left"],
    ["none", "none"],
  ]);

  const keyMap: Map<string, Dir> = new Map([
    ["ArrowUp", "up"],
    ["ArrowDown", "down"],
    ["ArrowLeft", "left"],
    ["ArrowRight", "right"],
    ["w", "up"],
    ["s", "down"],
    ["a", "left"],
    ["f", "right"],
    ["h", "left"],
    ["j", "down"],
    ["k", "up"],
    ["l", "right"],
  ]);

  function isOutOfBounds(x: number, y: number): boolean {
    return x < 0 || x > GRID_SIZE - 1 || y < 0 || y > GRID_SIZE - 1;
  }

  function start(): void {
    if (state.status === "running") return;
    if (state.dir === "none") return;
    state.status = "running";
    if (!DEBUG_STEP) {
      loop();
    }
  }
  function stop(): void {
    if (state.status !== "running") return;
    state.status = "stopped";
  }
  function reset(): void {
    state.status = "stopped";
    step = 0;
    grid = [...Array(GRID_SIZE)].map(() =>
      [...Array(GRID_SIZE)].map(() => new Cell())
    );
    snake = [[12, 13]];
  }

  $: {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x].snake !== "empty") {
          grid[y][x].snake = "empty";
        }
      }
    }

    snake.forEach(([x, y]) => (grid[y][x].snake = "body"));
    grid[snake[0][1]][snake[0][0]].snake = "head";
  }

  function spawnFood(): void {
    for (let i = 0; i < 2; i++) {
      let unoccupied: Array<[number, number]> = [];
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (grid[y][x].empty) {
            unoccupied.push([x, y]);
          }
        }
      }
      if (unoccupied.length === 0) {
        return;
      }
      const rand_cell =
        unoccupied[Math.floor(Math.random() * unoccupied.length)];
      grid[rand_cell[1]][rand_cell[0]].food = "food";
    }
  }

  function tick(): void {
    const [x, y] = snake[0]; // head of snake
    const [dx, dy] = dir2vec.get(state.dir);
    const newHead = [dx + x, y + dy] as [number, number];

    if (isOutOfBounds(newHead[0], newHead[1])) {
      state.status = "lost";
      return;
    }

    let ateFood = false;
    if (grid[newHead[1]][newHead[0]].food === "food") {
      grid[newHead[1]][newHead[0]].food = "empty";
      ateFood = true;
    }

    // the following voodoo code updates the cell conections instead of doing this every render
    if (snake.length > 1 || ateFood) {
      let newHeadCell = grid[newHead[1]][newHead[0]];
      let oldHeadCell = grid[snake[0][1]][snake[0][0]];
      let connectHead: Dir = oppositeDir.get(state.dir);
      let connectBody: Dir = state.dir;
      if (!newHeadCell.connections.includes(connectHead)) {
        newHeadCell.connections.push(connectHead);
      }
      if (!oldHeadCell.connections.includes(connectBody)) {
        oldHeadCell.connections.push(connectBody);
      }
    }
    if (snake.length > 1 && !ateFood) {
      function getCellsFromEnd(i: number = 1): Cell {
        return grid[snake[snake.length - i][1]][snake[snake.length - i][0]];
      }
      function getSnakeIndices(i: number = 1): [number, number] {
        return [snake[snake.length - i][1], snake[snake.length - i][0]];
      }
      let oldLastCell = getCellsFromEnd(1);
      let newLastCell = getCellsFromEnd(2);
      let lastDir: Dir = state.dir;
      if (snake.length > 2) {
        lastDir = vec2dir([
          getSnakeIndices(3)[1] - getSnakeIndices(2)[1],
          getSnakeIndices(3)[0] - getSnakeIndices(2)[0],
        ]);
      }
      newLastCell.connections = [lastDir];
      oldLastCell.connections = [];
    }
    // end voodoo code

    const snakeBody = snake.slice(0, snake.length - (ateFood ? 0 : 1));

    if (
      snakeBody.some(
        (x: [number, number]) => x[0] === newHead[0] && x[1] === newHead[1]
      )
    ) {
      state.status = "lost";
      return;
    }

    snake = [newHead, ...snakeBody];
    if (ateFood) {
      spawnFood();
    }
    state.prev_dir = state.dir;
    step++;
  }

  function loop(): void {
    tick_timeout = (setTimeout(() => {
      tick();
      if (state.status === "running") {
        loop();
      }
    }, tick_delay()) as unknown) as number;
  }

  async function handleInput(e: KeyboardEvent): Promise<void> {
    e.stopPropagation();
    let new_dir: Dir = "none";
    if (keyMap.has(e.key)) {
      new_dir = keyMap.get(e.key);
    } else {
      switch (e.key) {
        case "t":
          tick();
          return;
        case "Enter":
          reset();
          spawnFood();
          return;
      }
    }

    if (new_dir !== "none") {
      if (new_dir !== oppositeDir.get(state.prev_dir) || snake.length <= 1) {
        state.dir = new_dir;
      }

      if (state.status === "stopped") {
        start();
      }
    }
  }

  $: lost = state.status === "lost";

  reset();
  onMount(async () => {
    spawnFood();
  });
</script>

<svelte:window on:keydown={handleInput} />

{#if lost}
  <h1 class="text-center">you lost</h1>
  <h3 class="text-center">
    Hit <code
      class="border border-solid border-black bg-gray-200 rounded-sm p-1"
      >ENTER</code
    > to restart
  </h3>
{/if}
<h3 class="text-center">score {snake.length}</h3>
<div class="flex justify-center items-center">
  <div>
    {#each grid as row, x}
      <div class="flex">
        {#each row as cell, y}
          <!-- TODO: turn clicked cells into food? -->
          <div
            class={`w-10 h-10 rounded-md border border-solid border-white ${
              cell.value
            } ${cell.connections.map((e) => dir2connect.get(e)).join(" ")}`}
            on:click={() => (grid[x][y].food = "food")}
          />
        {/each}
      </div>
    {/each}
  </div>
</div>

{#if lost}
  <div class="center m-auto mt-3">
    <button on:click={stop}> Start again </button>
  </div>
{/if}

<style>
  .empty {
    @apply bg-gray-800;
  }
  .food {
    @apply bg-pink-500;
  }
  .body {
    @apply bg-green-800;
  }
  .head {
    @apply bg-green-500;
  }
  .connect-top {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top-color: transparent;
  }
  .connect-bottom {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-color: transparent;
  }
  .connect-left {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left-color: transparent;
  }
  .connect-right {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right-color: transparent;
  }
</style>
