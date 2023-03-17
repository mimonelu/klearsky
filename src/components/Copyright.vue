<script lang="ts" setup>
import Package from "../../package.json"
</script>

<template>
  <div class="copyright">
    <div class="kebab-header">{{ $t("title") }} v{{ Package.version }}</div>
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
    <div />
    <div class="kebab-header">Bluesky</div>
    <small>&copy; 2023 Bluesky PBLLC</small>
    <a
      class="textlink"
      href="https://blueskyweb.xyz/"
      rel="noreferrer"
      target="_blank"
    >Bluesky official web site</a>
    <a
      class="textlink"
      href="https://twitter.com/bluesky"
      rel="noreferrer"
      target="_blank"
    >Twitter@bluesky</a>
  </div>
</template>

<style lang="scss" scoped>
.copyright {
  display: flex;
  align-items: center;
  flex-direction: column;
  grid-gap: 1em;
}

.kebab-header {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-gap: 0.5em;
  width: 100%;

  &::before,
  &::after {
    background-color: rgba(var(--fg-color), 0.25);
    content: "";
    display: block;
    flex-grow: 1;
    height: 1px;
  }
}
</style>
