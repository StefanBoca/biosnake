<script lang="ts">
  import { onMount } from "svelte";

  const GRID_SIZE = 20;
  const DEBUG_STEP = process.env.NODE_ENV === "development" && false;

  function tick_delay(): number {
    return 200;
  }

  const Food = ["A", "C", "G", "T", "U"] as const;
  type FoodCell = "empty" | typeof Food[number];
  type SnakeCell = "empty" | "head" | "body";

  type Dir = "up" | "down" | "left" | "right" | "none";
  interface State {
    status: "stopped" | "running" | "lost";
    dir: Dir;
    prev_dir: Dir;
    prev_tail: Cell;
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

  let state: State = {
    status: "stopped",
    dir: "none",
    prev_dir: "none",
    prev_tail: undefined,
  };
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
        let cell = grid[y][x];
        if (cell.snake !== "empty") {
          cell.snake = "empty";
        }
        cell.connections = [];
      }
    }

    snake.forEach(([x, y]) => (grid[y][x].snake = "body"));
    for (let i = 0; i < snake.length - 1; i++) {
      let a = snake[i];
      let b = snake[i + 1];
      let dir: Dir = vec2dir([a[0] - b[0], a[1] - b[1]]);
      grid[a[1]][a[0]].connections.push(oppositeDir.get(dir));
      grid[b[1]][b[0]].connections.push(dir);
    }
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
      const r = unoccupied[Math.floor(Math.random() * unoccupied.length)];
      grid[r[1]][r[0]].food = Food[Math.floor(Math.random() * Food.length)];
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
    if (grid[newHead[1]][newHead[0]].food !== "empty") {
      grid[newHead[1]][newHead[0]].food = "empty";
      ateFood = true;
    }

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
    if (keyMap.has(e.key)) {
      handleStart(keyMap.get(e.key));
    } else {
      switch (e.key) {
        case "Escape":
          stop();
          return;
        case "t":
          tick();
          return;
        case "Enter":
          reset();
          spawnFood();
          return;
      }
    }
  }

  function handleStart(new_dir: Dir) {
    if (new_dir !== "none") {
      if (new_dir !== oppositeDir.get(state.prev_dir) || snake.length <= 1) {
        state.dir = new_dir;
      }

      if (state.status === "stopped") {
        start();
      }
    }
  }

  var xDown = null;
  var yDown = null;

  function handleTouchStart(evt: TouchEvent) {
    evt.preventDefault();
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  }

  function handleTouchMove(evt: TouchEvent) {
    evt.preventDefault();
    if (!xDown || !yDown) {
      return;
    }
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
    let event = false;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        handleStart("left");
        event = true;
      } else if (xDiff < -0) {
        handleStart("right");
        event = true;
      }
    } else {
      if (yDiff > 0) {
        handleStart("up");
        event = true;
      } else if (yDiff < -0) {
        handleStart("down");
        event = true;
      }
    }
    if (event) {
      xDown = null;
      yDown = null;
    }
  }

  $: lost = state.status === "lost";

  reset();
  onMount(async () => {
    spawnFood();
  });
</script>

<svelte:window
  on:keydown={handleInput}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
/>

<h3 class="text-center font-mono font-bold text-lg md:text-xl">
  Score: {snake.length}
</h3>
<div
  class="board m-auto"
  style="grid-template-columns: repeat({GRID_SIZE}, minmax(0, 1fr)); grid-template-rows: repeat({GRID_SIZE}, minmax(0, 1fr));"
>
  {#each grid as row, x}
    {#each row as cell, y}
      <div
        class="cell rounded-md sm:rounded-lg md:rounded-xl {cell.value} {cell.connections
          .map((e) => dir2connect.get(e))
          .join(' ')}"
        on:click={() =>
          (grid[x][y].food = Food[Math.floor(Math.random() * Food.length)])}
      >
        {#if cell.snake === "empty" && cell.food !== "empty"}
          {cell.food}
        {/if}
      </div>
    {/each}
  {/each}
</div>

{#if lost || process.env.NODE_ENV}
  <div class="center m-auto mt-3 text-center font-mono">
    <h1 class="text-center">You Lost!</h1>
    <h3 class="text-center">
      Hit <code class="bg-green-600 rounded-md p-1">ENTER</code>
      to restart or press the button below
    </h3>
    <button
      class="bg-blue-600 hover:bg-red-600 rounded-md p-2 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 m-2"
      on:click={() => {
        reset();
        spawnFood();
      }}
    >
      Start again
    </button>
  </div>
{/if}

<style>
  .board {
    width: calc(90vmin - 10rem);
    height: calc(90vmin - 10rem);
    @apply grid;
    @apply gap-0;
    aspect-ratio: 1 / 1;
  }
  .cell {
    @apply w-full;
    @apply h-full;
    @apply border-2;
    @apply border-solid;
    @apply border-transparent;
    @apply bg-gray-800;
    @apply m-0;
    @apply text-center;
    @apply font-mono;
    @apply font-bold;
    font-size: 2vmin;
  }
  .A {
    @apply bg-pink-500;
    @apply border-pink-600;
    @apply text-pink-900;
  }
  .C {
    @apply bg-yellow-500;
    @apply border-yellow-600;
    @apply text-yellow-900;
  }
  .G {
    @apply bg-red-500;
    @apply border-red-600;
    @apply text-red-900;
  }
  .T {
    @apply bg-blue-500;
    @apply border-blue-600;
    @apply text-blue-900;
  }
  .U {
    @apply bg-indigo-500;
    @apply border-indigo-600;
    @apply text-indigo-900;
  }
  .body {
    @apply bg-green-700;
    @apply border-green-600;
  }
  .head {
    @apply bg-green-500;
    @apply border-green-600;
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
  :global(html, body) {
    @apply h-full;
    @apply overflow-hidden;
  }
</style>
