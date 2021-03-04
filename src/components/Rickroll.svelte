<script lang="ts">
  import Youtube from "../components/Youtube.svelte";
  import { nav_enabled } from "../components/Nav";

  export let evil_mode: boolean = true;
  export let resume: boolean = true;

  export let button: boolean = true;
  export let button_class: string =
    "text-3xl text-black bg-blue-500 px-8 py-2 rounded-xl shadow-2xl align-middle";

  let rickroll = !button;
  let nav_before: boolean = $nav_enabled;
  let player;

  async function activate() {
    rickroll = true;
    if (evil_mode) nav_enabled.set(false);
    player.seekTo(0);
    player.unMute();
  }
  async function handleReady(e: CustomEvent) {
    player = e.detail.target;
  }
</script>

<div class="text-center m-auto">
  <div class="m-auto relative">
    {#if !rickroll}
      <button class={button_class} on:click={activate}>
        <slot>Play</slot>
      </button>
    {:else}
      <div class="absolute top-0 left-0 h-full w-full z-50" />
    {/if}
    <Youtube
      videoId="dQw4w9WgXcQ"
      class="video-responsive {!rickroll ? 'hidden' : ''}"
      options={{
        playerVars: {
          mute: button ? 1 : 0,
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
      }}
      on:ready={handleReady}
      on:end={() => {
        if (resume) rickroll = false;
        nav_enabled.set(nav_before);
      }}
    />
  </div>
</div>

<style lang="postcss">
  .hidden {
    display: none;
  }
</style>
