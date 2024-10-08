<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import hotkeys from "hotkeys-js"
import Loader from "@/components/shells/Loader.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const popupBody = ref()

const scrollObserver = ref()

defineExpose({
  scrollToTop,
  scrollToBottom,
  scrollTop,
  scrollObserver,
})

defineProps<{
  hasCloseButton?: boolean
  loaderDisplay?: boolean
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

function scrollToTop (behavior?: string) {
  popupBody?.value?.scrollTo({
    left: 0,
    top: 0,
    behavior,
  })
}

function scrollToBottom (behavior?: string) {
  popupBody?.value?.scrollTo({
    left: 0,
    top: Number.MAX_SAFE_INTEGER,
    behavior,
  })
}

function scrollTop (): undefined | number {
  return popupBody?.value?.scrollTop
}
</script>

<template>
  <div
    class="popup-overlay"
    @click.self="close"
  >
    <div class="popup">
      <header
        v-if="$slots.header"
        class="popup-header"
        @click="scrollToTop('smooth')"
      >
        <slot name="header" />
        <button
          v-if="hasCloseButton"
          class="popup-closer"
          @click="close"
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

        <!-- スクロールオブザーバー -->
        <ScrollObserver
          ref="scrollObserver"
          @scrolledToBottom="emit('scrolledToBottom')"
        />
      </div>
      <slot name="footer" />
      <Loader v-if="loaderDisplay" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes popup-overlay-animation {
  0% {}
  100% {}
}

@keyframes popup-content-animation {
  0% {
    transform: translateY(1rem);
  }
  100% {
    transform: translateY(0);
  }
}

.popup-overlay {
  --margin: 0.5rem;

  background-color: rgb(0, 0, 0, 0.5);
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

  // アニメーション
  &.v-enter-from,
  &.v-leave-from {
    pointer-events: none;
  }
  &.v-enter-to,
  &.v-leave-to {
    pointer-events: unset;
  }
  &.v-enter-active {
    animation: popup-overlay-animation 125ms linear;

    .popup {
      animation: popup-content-animation 125ms ease-out;
    }
  }
  &.v-leave-active {
    animation: popup-overlay-animation 125ms linear reverse;

    .popup {
      animation: popup-content-animation 125ms ease-out reverse;
    }
  }
}

.popup {
  background-color: rgb(var(--bg-sub-color));
  // BORDERED_DESIGN: border: 1px solid rgb(var(--fg-color), 0.25);
  border: 1px solid rgb(var(--fg-color), 0.125);
  border-radius: var(--border-radius-large);
  box-shadow: 0 0 1rem 0 rgb(0, 0, 0, 0.5);
  color: rgb(var(--fg-color));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: none;
  position: relative;
  --margin2: calc(var(--margin) * 2);
  width: calc($router-view-width - var(--margin2));
  max-width: calc(100% - var(--margin2));
  max-height: calc(100% - var(--margin2));
  transform: translateY(0);

  // 非SPレイアウト
  @include media-not-sp-layout() {
    margin: var(--margin);
  }

  // SPレイアウト
  @include media-sp-layout() {
    margin: calc(var(--margin) + env(safe-area-inset-top)) var(--margin) calc(var(--margin) + var(--sp-menu-height));
  }
}

.popup-header {
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
      min-width: 3rem;

      & > .svg-icon {
        fill: rgb(var(--fg-color), 0.75);
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
      overflow: hidden;

      &:first-child {
        margin-left: 3rem;
      }

      & > .svg-icon {
        fill: rgb(var(--fg-color));
      }

      & > span {
        font-weight: bold;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.popup-body {
  background-color: rgb(var(--bg-color));
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 1rem;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: none;
  padding: 1rem;
  @include scroll-bar("transparent");
  &:not(:first-child) {
    // BORDERED_DESIGN: border-top: 1px solid rgb(var(--fg-color), 0.25);
    border-top: 1px solid rgb(var(--bg-color));
  }
  &:not(:last-child) {
    // BORDERED_DESIGN: border-bottom: 1px solid rgb(var(--fg-color), 0.25);
    border-bottom: 1px solid rgb(var(--bg-color));
  }
}
</style>
