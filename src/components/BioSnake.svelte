<script lang="ts">
  import BioSnake from "./BioSnake";

  let game: BioSnake = new BioSnake(20, 200, () => (lost = game.isLost)); // do something in the callback to update display
  let lost = game.isLost;

  // function getRandomInt(max: number) {
  //   return Math.floor(Math.random() * Math.floor(max));
  // }
  // function randomFood() {
  //   grid[getRandomInt(bs.GRID_SIZE)][getRandomInt(bs.GRID_SIZE)] = "food";
  //   grid[getRandomInt(bs.GRID_SIZE)][getRandomInt(bs.GRID_SIZE)] = "food";
  // }
  // randomFood();

  // function tick(n: number) {
  //   setTimeout(() => {
  //     if (!started) {
  //       return;
  //     }

  //     const [x, y] = snakePosition[bs.SNAKE_HEAD];
  //     const [dx, dy] = direction;
  //     const newHead = [dx + x, y + dy] as [number, number];
  //     function isOutOfBounds(n: number) {
  //       return n < 0 || n > bs.GRID_SIZE - 1;
  //     }
  //     if (isOutOfBounds(newHead[0]) || isOutOfBounds(newHead[1])) {
  //       lost = true;
  //       return;
  //     }
  //     let ateFood = false;
  //     if (gridWithSnake[newHead[0]][newHead[1]] === "food") {
  //       ateFood = true;
  //       randomFood();
  //     }
  //     const snakeBody = snakePosition.slice(
  //       0,
  //       snakePosition.length - (ateFood ? 0 : 1)
  //     );
  //     if (snakeBody.some((x) => x[0] === newHead[0] && x[1] === newHead[1])) {
  //       lost = true;
  //       return;
  //     }
  //     snakePosition = [newHead, ...snakeBody];
  //     prevDirection = [...direction];
  //     updateDisplay();
  //     tick(bs.TICK_DELAY - Math.min(snakePosition.length, 15) * 10);
  //   }, n);
  // }

  // function restart() {
  //   snakePosition = [[12, 13]];
  //   direction = [0, 1];
  //   grid = [...Array(bs.GRID_SIZE)].map(() =>
  //     Array(bs.GRID_SIZE).fill("empty")
  //   );
  //   gridWithSnake = grid;
  //   randomFood();
  //   updateDisplay();
  //   lost = false;
  //   started = false;
  // }

  async function handleInput(e: { key: any }): Promise<void> {
    if (!game.isRunning) {
      game.start();
    }

    let newDir: [number, number] = [0, 0];
    switch (e.key) {
      case "ArrowLeft":
        newDir = [0, -1];
        break;
      case "ArrowRight":
        newDir = [0, 1];
        break;
      case "ArrowUp":
        newDir = [-1, 0];
        break;
      case "ArrowDown":
        newDir = [1, 0];
        break;
      case "Enter":
        game.stop();
        return;
    }

    if (
      !(
        (newDir[0] !== 0 && newDir[0] === -game.prev_direction[0]) ||
        (newDir[1] !== 0 && newDir[1] === -game.prev_direction[1])
      ) ||
      game.snake.length <= 1
    ) {
      // opposite direction
      game.direction = newDir;
    }
  }
</script>

<svelte:window on:keydown={handleInput} />

<main>
  {#if lost}
    <h1 class="text-center">you lost</h1>
    <h3 class="text-center">
      Hit <code
        class="border border-solid border-black bg-gray-200 rounded-sm p-1"
        >ENTER</code
      > to restart
    </h3>
  {/if}
  <h3 class="text-center">score {game.grid.grid.length}</h3>
  <div class="flex justify-center items-center">
    <div>
      {#each game.grid.grid as row, i}
        <div class="flex">
          {#each row as cell, j}
            <!-- TODO: turn clicked cells into food? -->
            <div class={`w-5 h-5 border border-solid border-white ${cell}`} />
          {/each}
        </div>
      {/each}
    </div>
  </div>

  {#if lost}
    <div class="center m-auto mt-3">
      <button on:click={game.stop}> Start again </button>
    </div>
  {/if}
</main>

<style>
  .empty {
    @apply bg-gray-900;
  }
  .food {
    @apply bg-pink-500;
  }
  .snake_body {
    @apply bg-green-500;
  }
  .snake_head {
    @apply bg-green-800;
  }
</style>
