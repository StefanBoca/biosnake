<script>
  import Youtube from "svelte-youtube";

  let rickroll = false;
  let target;
  let w;
  let h;
  async function lol() {
    console.log(w, h);
    rickroll = true;
    target.seekTo(0);
    target.unMute();
  }
  async function handleReady(e) {
    target = e.detail.target;
  }
</script>

<svelte:head>
  <title>About</title>
</svelte:head>

<svelte:window bind:innerWidth={w} bind:innerHeight={h} />

<div class="text-center m-auto h-full min-h-full">
  {#if !rickroll}
    <button
      class="text-3xl text-black bg-blue-500 px-8 py-2 rounded-xl shadow-2xl align-middle"
      on:click={lol}>Play</button
    >
  {/if}
  <div class="vid-div h-full w-full" class:hidden={!rickroll}>
    <div id="vid-blocker" class="w-full m-auto " />
    <Youtube
      videoId="dQw4w9WgXcQ"
      id="player"
      class="w-full m-auto vid-class video-responsive"
      options={{
        // width: w,
        // height: h,
        playerVars: {
          autoplay: 1,
          mute: 1,
        },
      }}
      on:ready={handleReady}
    />
  </div>
</div>

<style lang="postcss">
  .hidden {
    display: none;
  }

  .vid-div {
    margin: 20px 0px;
    position: relative;
  }

  #vid-blocker {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    z-index: 5;
  }
  :global(.video-responsive) {
    overflow: hidden;
    padding-bottom: 56.25%;
    position: relative;
    height: 0;
  }
  :global(.video-responsive iframe) {
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    position: absolute;
  }
</style>
