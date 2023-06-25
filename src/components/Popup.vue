<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, ref } from "vue"
import hotkeys from "hotkeys-js"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  hasCloseButton?: boolean;
}>()

onBeforeMount(() => {
  hotkeys("esc", close)
})

onBeforeUnmount(() => {
  hotkeys.unbind("esc")
})

function close () {
  emit("close")
}

const popupBody = ref()

function scrollToTop () {
  popupBody?.value?.scrollTo({
    left: 0,
    top: 0,
    behavior: "smooth",
  })
}
</script>

<template>
  <div
    class="popup-overlay"
    @click="close"
  >
    <div
      class="popup"
      @click.stop
    >
      <header
        v-if="$slots.header"
        class="popup-header"
        @click="scrollToTop"
      >
        <slot name="header" />
        <button
          v-if="hasCloseButton"
          class="popup-closer"
          @click.prevent="close"
        >
          <SVGIcon name="cross" />
        </button>
      </header>
      <slot name="header-after" />
      <div
        class="popup-body"
        ref="popupBody"
      >
        <slot name="body" />
      </div>
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popup-overlay {
  background-color: rgba(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overscroll-behavior: none;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.popup {
  background-color: rgb(var(--bg-color));
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.25);
  color: rgb(var(--fg-color));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: none;
  width: calc($router-view-width - 2rem);
  max-width: calc(100% - 2rem);
  max-height: calc(100% - 2rem);

  // SP幅以上
  @media (min-width: $sp-width) {
    margin: 1rem;
  }

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    margin: calc(1rem + env(safe-area-inset-top)) 1rem calc(1rem + var(--sp-menu-height));
  }
}

.popup-header {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  cursor: pointer;
  display: flex;
  position: relative;
  min-height: 3rem;

  &:deep() {
    & > button {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      // min-height: 3rem;

      & > .svg-icon {
        fill: rgba(var(--fg-color), 0.75);
      }

      &:focus, &:hover {
        & > .svg-icon {
          fill: rgb(var(--fg-color));
        }
      }
    }

    & > h2 {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-grow: 1;
      grid-gap: 0.5rem;

      &:first-child {
        margin-left: 3rem;
      }

      & > .svg-icon {
        fill: rgb(var(--fg-color));
      }

      & > span {
        font-weight: bold;
      }
    }
  }
}

.popup-body {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: none;
  padding: 2rem;
  @include scroll-bar();
  &:first-child {
    padding-top: 2rem;
  }
}
</style>
