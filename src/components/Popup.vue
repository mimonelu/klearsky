<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount } from "vue"
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
      <div class="popup-body">
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
  height: 100vh;
}

.popup {
  background-color: rgb(var(--bg-color));
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  margin: 1rem;
  overflow: hidden;
  overscroll-behavior: none;
  width: calc($router-view-width - 2rem);
  max-width: calc(100vw - 2rem);
  max-height: calc(100svh - 10rem);
}

.popup-header {
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  position: relative;
  min-height: 4rem;

  &:deep() > h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    grid-gap: 0.5rem;

    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }

    & > span {
      font-weight: bold;
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
  padding: 0 2rem 2rem 2rem;
  @include scroll-bar();
  &:first-child {
    padding-top: 2rem;
  }
}

.popup-closer {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
  width: 4rem;
  min-height: 4rem;

  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.75);
  }

  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
}
</style>
