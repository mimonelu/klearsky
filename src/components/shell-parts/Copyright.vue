<script lang="ts" setup>
import Package from "@/../package.json"

const yyyy = (new Date).getFullYear()
</script>

<template>
  <div class="copyright">
    <small>Klearsky v{{ Package.version }} alpha (@atproto/api v{{ Package.dependencies["@atproto/api"] }}) &copy; {{ yyyy }} mimonelu</small>
    <a
      class="textlink"
      href="https://github.com/mimonelu/klearsky"
      rel="noreferrer"
      target="_blank"
    >GitHub</a>
    <RouterLink
      class="textlink"
      :to="{ path: '/profile/feeds', query: { account: 'mimonelu.net' } }"
    >Bluesky</RouterLink>
    <span>/</span>
    <small>Bluesky &copy; {{ yyyy }} Bluesky PBC</small>
    <a
      class="textlink"
      href="https://blueskyweb.xyz/"
      rel="noreferrer"
      target="_blank"
    >Web</a>
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
}
</style>
