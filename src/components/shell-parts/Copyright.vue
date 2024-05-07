<script lang="ts" setup>
import Package from "@/../package.json"

const yyyy = (new Date).getFullYear()
</script>

<template>
  <div class="copyright">
    <small>Klearsky v{{ Package.version }} alpha (@atproto/api v{{ Package.dependencies["@atproto/api"] }}) &copy; {{ yyyy }} mimonelu</small>
    <a
      class="textlink--underline"
      href="https://github.com/mimonelu/klearsky"
      rel="noreferrer"
      target="_blank"
    >
      <span>GitHub</span>
    </a>
    <RouterLink
      class="textlink--underline"
      :to="{ path: '/profile/feeds', query: { account: 'mimonelu.net' } }"
    >
      <span>Bluesky</span>
    </RouterLink>
    <span>/</span>
    <small>Bluesky &copy; {{ yyyy }} Bluesky PBC</small>
    <a
      class="textlink--underline"
      href="https://blueskyweb.xyz/"
      rel="noreferrer"
      target="_blank"
    >
      <span>Web</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
.copyright {
  color: var(--fg-color-05);
  line-height: var(--line-height-high);

  & > * {
    display: inline;
    margin: 0 0.25em;
    word-break: break-all;
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }

  .textlink--underline {
    --accent-color: var(--fg-color-05);
  }
}
</style>
