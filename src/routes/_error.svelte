<script lang="ts">
  export let status: number;
  export let error: Error;

  const dev = process.env.NODE_ENV === "development";
</script>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<h1 class="m-0 mb-2 font-mono font-bold text-5xl md:text-7xl">
  Something went wrong!
</h1>
<h1 class="m-0 mb-2 font-mono font-bold text-4xl md:text-6xl text-red-800">
  {status}
</h1>

<p
  class="mx-auto my-4 font-mono font-semibold text-3xl md:text-5xl text-yellow-800"
>
  {error.message}
</p>

{#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if}
