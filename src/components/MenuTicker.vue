<script lang="ts" setup>
import { nextTick, ref, watch } from "vue"

const props = defineProps<{
  display: boolean;
}>()

const menuTickerOverlay = ref()
const menuTickerInner = ref()

watch(() => props.display, () => {
  nextTick(() => {
    if (menuTickerOverlay.value == null) return
    if (menuTickerInner.value == null) return
    const overlayRect = menuTickerOverlay.value.getBoundingClientRect()
    const innerRect = menuTickerInner.value.getBoundingClientRect()
    const heightDiff = (overlayRect.bottom / 2) - innerRect.y
    menuTickerInner.value.setAttribute("data-to-down", heightDiff >= 0)
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
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-ticker {
  display: contents;

  &--overlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  &--inner {
    box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.25);
    background-color: rgb(var(--fg-color));
    color: rgba(var(--bg-color), 0.75);
    border: 1px solid rgba(var(--bg-color), 0.25);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    grid-gap: 0.25rem;
    padding: 0.5rem 0;
    position: absolute;
    max-width: 16rem;
    z-index: 2;

    &:deep() {
      .menu-ticker__header {
        border-bottom: 1px solid rgba(var(--bg-color), 0.25);
        font-weight: bold;
        padding: 0.25rem 1rem 0.75rem 1rem;
        word-wrap: break-word;

        & > .svg-icon {
          fill: rgba(var(--bg-color), 0.5);
        }
      }

      & > button {
        cursor: pointer;
        display: flex;
        align-items: center;
        grid-gap: 0.5rem;
        padding: 0.5rem 1rem;
        white-space: nowrap;
        &:focus, &:hover {
          color: rgb(var(--bg-color));
        }

        & > .svg-icon {
          fill: rgba(var(--bg-color), 0.75);
        }
        &:focus, &:hover {
          & > .svg-icon {
            fill: rgb(var(--bg-color));
          }
        }
      }

      & > hr {
        border-bottom: 1px solid rgba(var(--bg-color), 0.25);
      }
    }
  }
}
</style>
