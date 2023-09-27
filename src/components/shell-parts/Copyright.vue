<script lang="ts" setup>
const yyyy = (new Date).getFullYear()
</script>

<template>
  <div class="copyright">
    <small>Klearsky &copy; {{ yyyy }} mimonelu</small>
    <a
      class="textlink"
      href="https://github.com/mimonelu/klearsky"
      rel="noreferrer"
      target="_blank"
    >@GitHub</a>
    <RouterLink
      class="textlink"
      :to="{ path: '/profile/feeds', query: { account: 'mimonelu.net' } }"
    >@Bluesky</RouterLink>
    <a
      class="textlink"
      href="https://twitter.com/mimonelu"
      rel="noreferrer"
      target="_blank"
    >@X(Twitter)</a>
    <span>/</span>
    <small>Bluesky &copy; {{ yyyy }} Bluesky PBC</small>
    <a
      class="textlink"
      href="https://blueskyweb.xyz/"
      rel="noreferrer"
      target="_blank"
    >@Web</a>
    <a
      class="textlink"
      href="https://twitter.com/bluesky"
      rel="noreferrer"
      target="_blank"
    >@X(Twitter)</a>
  </div>
</template>

<style lang="scss" scoped>
.copyright {
  color: var(--fg-color-05);
  line-height: var(--line-height);

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
