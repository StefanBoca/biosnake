<script lang="ts">
  import Rickroll from "../components/Rickroll.svelte";

  let rickroll = false;
</script>

<svelte:head>
  <title>bioSNAKE</title>
</svelte:head>

<div class="text-center m-auto">
  {#if !rickroll}
    <button
      class="text-3xl text-black bg-blue-500 px-8 py-2 rounded-xl shadow-2xl align-middle"
      on:click={() => (rickroll = true)}
    >
      Play
    </button>
  {:else}
    <Rickroll />
  {/if}
</div>
