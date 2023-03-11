<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"
</script>

<template>
  <h1 class="logo">
    <SVGIcon name="shimmer" />
    <span>{{ $t("title") }}</span>
  </h1>
</template>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: baseline;
  justify-content: center;
  grid-gap: 0.25em;

  & > .svg-icon {
    fill: rgb(var(--accent-color));
    font-size: 0.75em;
  }
}
</style>
