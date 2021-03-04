<script lang="ts">
  import Youtube from "svelte-youtube";
  import { nav_enabled } from "../components/Nav";

  const EVIL_MODE: boolean = true; // loop

  let rickroll = false;
</script>

<svelte:head>
  <title>About</title>
</svelte:head>

<div class="text-center m-auto">
  {#if !rickroll}
    <button
      class="text-3xl text-black bg-blue-500 px-8 py-2 rounded-xl shadow-2xl align-middle"
      on:click={() => {
        rickroll = true;
        nav_enabled.set(false);
      }}>Play</button
    >
  {:else}
    <div class="m-auto relative">
      <div class="absolute top-0 left-0 h-full w-full z-50" />
      <Youtube
        videoId="dQw4w9WgXcQ"
        id="player"
        class="video-responsive"
        options={{
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: EVIL_MODE ? 1 : 0,
            modestbranding: 1,
          },
        }}
        on:end={() => nav_enabled.set(true)}
      />
    </div>
  {/if}
</div>
