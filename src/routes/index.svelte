<script lang="ts">
  import BioSnake from "../components/BioSnake.svelte";
</script>

<div class="m-5 text-6xl md:text-8xl font-black">bioSNAKE</div>

<div
  class="m-5 flex align-stretch justify-center align-center rounded-3xl font-bold text-4xl md:text-6xl transition transform ease-in-out duration-300 bg-blue-600 hover:bg-red-600 hover:-translate-y-2 hover:scale-110"
>
  <a class="flex justify-center align-center w-full h-full" href="play">Play</a>
</div>

<div
  class="m-3 mx-10 flex align-stretch justify-center align-center rounded-xl font-bold text-xl md:text-2xl transition transform ease-in-out duration-300 bg-blue-600 hover:bg-red-600 hover:-translate-y-2 hover:scale-110"
>
  <a
    class="flex justify-center align-center w-full h-full"
    href="mailto: sdboca.biosnake@gmail.com">Contact</a
  >
</div>

<style>
  :global(#sapper) {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>
