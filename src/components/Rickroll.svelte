<script lang="ts">
  import Youtube from "svelte-youtube";
  import { nav_enabled } from "../components/Nav";

  export let evil_mode: boolean = true;

  let nav_before: boolean = $nav_enabled;
  if (evil_mode) nav_enabled.set(false);
</script>

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
        modestbranding: 1,
      },
    }}
    on:end={() => {
      nav_enabled.set(nav_before);
    }}
  />
</div>
