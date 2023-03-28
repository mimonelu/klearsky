<script lang="ts" setup>
import logo from "@/svg/logo.svg?raw"
import SVGIcon from "@/components/SVGIcon.vue"
</script>

<template>
  <h1 class="logo">
    <SVGIcon name="shimmer" />
    <div
      v-html="logo"
      class="logo__svg"
    />
  </h1>
</template>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  grid-gap: 0.25em;

  & > .svg-icon {
    fill: rgb(var(--accent-color));
    height: 0.75em;
  }

  &__svg {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    height: 1em;

    &:deep(svg) {
      fill: rgb(var(--fg-color));
      height: 100%;
    }
  }
}
</style>
