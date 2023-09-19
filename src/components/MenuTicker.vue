<script lang="ts" setup>
import { nextTick, reactive, ref, watch } from "vue"

const props = defineProps<{
  display: boolean
  container?: HTMLElement
}>()

const state = reactive<{
  top: number;
  left: number;
}>({
  top: 0,
  left: 0,
})

const menuTickerOverlay = ref()
const menuTickerInner = ref()

watch(() => props.display, (display: boolean) => {
  state.top = 0
  state.left = 0
  nextTick(() => {
    if (!display) return
    if (menuTickerInner.value == null) return
    const innerRect = menuTickerInner.value.getBoundingClientRect()

    const left = props.container != null
      ? props.container.offsetLeft
      : 0
    if (left > innerRect.left)
      state.left = left - innerRect.left

    const innerHeight = props.container != null
      ? props.container.clientHeight + props.container.offsetTop
      : window.innerHeight
    if (innerHeight < innerRect.bottom)
      state.top = innerHeight - innerRect.bottom
  })
})
</script>

<template>
  <div
    v-if="display"
    class="menu-ticker"
  >
    <div
      class="menu-ticker--overlay"
      ref="menuTickerOverlay"
    />
    <div
      class="menu-ticker--inner"
      ref="menuTickerInner"
      :style="{ transform: `translate(${state.left}px, ${state.top}px)` }"
    >
      <menu class="list-menu">
        <slot />
      </menu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-ticker {
  &--overlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  &--inner {
    // SP幅以上
    @media (min-width: $sp-width) {
      padding: 0 0 0.75rem 0.75rem;
    }

    // SP幅未満
    @media not all and (min-width: $sp-width) {
      padding: 0 0 calc(var(--sp-menu-height) + 0.75rem) 0.75rem;
    }
    .popup-body & {
      @media not all and (min-width: $sp-width) {
        padding: 0 0 0.75rem 0.75rem;
      }
    }

    position: absolute;
    max-width: 16rem;
    z-index: 2;
  }

  &:deep() {
    .menu-ticker__sub-trigger {
      position: relative;
    }

    .menu-ticker__sub {
      display: contents;

      .menu-ticker--overlay {
        pointer-events: none;
      }

      .menu-ticker--inner {
        top: 0;
        right: calc(100% - 2rem) !important; // TODO:
      }
    }
  }
}
</style>
