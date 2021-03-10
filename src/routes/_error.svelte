<script lang="ts">
  export let status: number;
  export let error: Error;

  const dev = process.env.NODE_ENV === "development";
</script>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<h1 class="m-0 mb-2 font-bold text-5xl md:text-7xl">{status}</h1>

<p class="mx-auto my-4">{error.message}</p>

{#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if}
