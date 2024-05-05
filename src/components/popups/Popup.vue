<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { useEventListener } from "@vueuse/core"
import hotkeys from "hotkeys-js"
import Loader from "@/components/common/Loader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineExpose({
  scrollToTop,
  scrollToBottom,
})

defineProps<{
  hasCloseButton?: boolean
  loaderDisplay?: boolean
}>()

const state = reactive<{
  scrolledToBottom: boolean
}>({
  scrolledToBottom: false,
})

const popupBody = ref()

onMounted(() => {
  // インフィニットスクロール用処理
  useEventListener(popupBody, "scroll", scrollListener)
})

onBeforeMount(() => {
  hotkeys("esc", close)
})

onBeforeUnmount(() => {
  hotkeys.unbind("esc")
})

function close () {
  emit("close")
}

function scrollToTop (behavior: undefined | string) {
  popupBody?.value?.scrollTo({
    left: 0,
    top: 0,
    behavior,
  })
}

function scrollToBottom (behavior: undefined | string) {
  popupBody?.value?.scrollTo({
    left: 0,
    top: Number.MAX_SAFE_INTEGER,
    behavior,
  })
}

// インフィニットスクロール用処理
let isEnter = false
function scrollListener () {
  if (popupBody?.value == null) return
  const threshold = 64
  const diff = Math.abs(popupBody.value.scrollTop - (
    popupBody.value.scrollHeight -
    popupBody.value.clientHeight
  ))
  state.scrolledToBottom = false
  if (diff < threshold) {
    if (!isEnter) {
      state.scrolledToBottom = true
      emit("scrolledToBottom")
    }
    isEnter = true
  } else {
    isEnter = false
  }
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
  background-color: rgb(var(--bg-color));
  border: 1px solid var(--fg-color-025);
  border-radius: var(--border-radius-middle);
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

  // SP幅以上
  @media (min-width: $sp-width) {
    margin: var(--margin);
  }

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    margin: calc(var(--margin) + env(safe-area-inset-top)) var(--margin) calc(var(--margin) + var(--sp-menu-height));
  }
}

.popup-header {
  border-bottom: 1px solid var(--fg-color-025);
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
        fill: var(--fg-color-075);
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 1rem;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: none;
  padding: 1.5rem;
  @include scroll-bar("fgColor");
  &:first-child {
    padding-top: 1.5rem;
  }
}
</style>
