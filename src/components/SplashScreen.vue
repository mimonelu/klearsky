<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div
    v-if="!mainState.mounted"
    class="splash-screen"
  >
    <SVGIcon name="shimmer" />
  </div>
</template>

<style lang="scss" scoped>
.splash-screen {
  background-color: rgb(var(--bg-color));
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  width: 100%;
  height: 100%;

  & > .svg-icon {
    animation: show 500ms ease-out;
    animation-fill-mode: forwards;
    fill: rgba(var(--fg-color), 0.5);
    font-size: 100px;
  }

  @keyframes show {
    0% {
      opacity: 0;
      transform: scale(1.5, 1.5);
    }
    100% {
      opacity: 1.0;
      transform: scale(1.0, 1.0);
    }
  }
}
</style>
