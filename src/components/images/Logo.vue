<script lang="ts" setup>
import logo from "@/svg/logo.svg?raw"
import SVGIcon from "@/components/images/SVGIcon.vue"
</script>

<template>
  <h1 class="logo">
    <div class="logo__inner">
      <SVGIcon name="shimmer" />
      <div
        v-html="logo"
        class="logo__inner__svg"
      />
    </div>
  </h1>
</template>

<style lang="scss" scoped>
.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-gap: 0.25em;

  &__inner {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    grid-gap: 0.25em;

    & > .svg-icon {
      fill: rgb(var(--accent-color));
      font-size: 0.8em;
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
}
</style>
