<script lang="ts" setup>
import Package from "@/../package.json"
import { inject } from "vue"

const mainState = inject("state") as MainState

const atprotoApiVersion = (Package.dependencies["@atproto/api"] ?? "").replace(/^[\^|~]/, "")

const yyyy = (new Date).getFullYear()
</script>

<template>
  <div class="copyright">
    <small>Klearsky</small>
    <RouterLink
      v-if="mainState.atp.hasLogin()"
      class="textlink--underline"
      :to="{ path: '/search/post', query: { text: 'from:mimonelu.net ⭐ Klearsky | 🔥 Klearsky' } }"
    >
      <span>v{{ Package.version }}</span>
    </RouterLink>
    <span v-else>v{{ Package.version }}</span>
    <small>alpha (@atproto/api v{{ atprotoApiVersion }}) &copy; {{ yyyy }} mimonelu</small>
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
  color: rgb(var(--fg-color), 0.5);
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
    --accent-color: rgb(var(--fg-color), 0.5);
  }
}
</style>
