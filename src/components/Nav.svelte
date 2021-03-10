<script context="module" lang="ts">
  export interface Page {
    segment: string;
    name: string;
    href: string;
  }
</script>

<script lang="ts">
  export let segment: string;

  export let pages: Array<Page> = [
    { segment: undefined, name: "home", href: "." },
    { segment: "about", name: "about", href: "about" },
  ];
</script>

<nav class="font-light px-4 py-0">
  <ul class="m-0 p-0">
    {#each pages as page}
      <li
        class="block float-left hover:scale-110 transition ease-in-out transform duration-300"
      >
        <a
          class:selected={segment === page.segment}
          class="no-underline p-2 block"
          href={page.href}>{page.name}</a
        >
      </li>
    {/each}
  </ul>
</nav>

<style lang="postcss">
  ul::after {
    /* clearfix */
    content: "";
    display: block;
    clear: both;
  }

  .selected {
    @apply relative;
    @apply inline-block;
  }

  .selected::after {
    content: "";
    @apply absolute;
    width: calc(100% - 1em);
    height: 2px;
    @apply bg-blue-600;
    @apply block;
    bottom: -1px;
  }
</style>
