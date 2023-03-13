<script lang="ts" setup>
import Package from "../../package.json"
</script>

<template>
  <div class="copyright">
    <div>{{ $t("title") }} v{{ Package.version }}</div>
    <small>&copy; 2023 mimonelu</small>
    <a
      class="textlink"
      href="https://blue.amazingca.dev/?username=mimonelu.bsky.social"
      rel="noreferrer"
      target="_blank"
    >Bluesky@mimonelu.bsky.social</a>
    <a
      class="textlink"
      href="https://iris.to/mimonelu@mimonelu.github.io"
      rel="noreferrer"
      target="_blank"
    >Nostr@mimonelu</a>
    <a
      class="textlink"
      href="https://twitter.com/mimonelu"
      rel="noreferrer"
      target="_blank"
    >Twitter@mimonelu</a>
  </div>
</template>

<style lang="scss" scoped>
.copyright {
  display: flex;
  align-items: center;
  flex-direction: column;
  grid-gap: 1rem;
}
</style>
