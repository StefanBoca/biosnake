<script lang="ts">
  import Nav from "../components/Nav.svelte";

  export let segment: string;
</script>

<Nav {segment} />

<main class="bg-transparent relative max-w-4xl p-8 mx-auto my-0 box-border">
  <slot />
</main>
