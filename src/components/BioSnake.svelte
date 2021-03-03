<script lang="ts">
  import BioSnake from "./BioSnake";

  let game: BioSnake = new BioSnake(20, 200, () => (game = game)); // hack to get this damn thing updating properly lol

  async function handleInput(e: { key: any }): Promise<void> {
    if (!game.isRunning && !game.lost) {
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
        game.reset();
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
  {#if game.lost}
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

  {#if game.lost}
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
