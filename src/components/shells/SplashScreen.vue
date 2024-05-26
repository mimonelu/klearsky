<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <Transition>
    <div
      v-if="!mainState.mounted"
      class="splash-screen"
    >
      <SVGIcon name="shimmer" />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@keyframes show {
  0% { transform: scale(0, 0); }
  50% { transform: scale(1.25, 1.25); }
  100% { transform: scale(1.0, 1.0); }
}

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
  transition: background-color 500ms ease-out, opacity 500ms ease-out;
  &.v-leave-to {
    opacity: 0;
  }

  & > .svg-icon {
    animation: show 500ms ease-in-out;
    animation-fill-mode: forwards;
    fill: rgb(var(--accent-color));
    font-size: 4rem;
    transition: fill 500ms ease-out;
  }
}
</style>
