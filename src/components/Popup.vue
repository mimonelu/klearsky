<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { useEventListener } from "@vueuse/core"
import hotkeys from "hotkeys-js"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  hasCloseButton?: boolean;
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

function scrollToTop () {
  popupBody?.value?.scrollTo({
    left: 0,
    top: 0,
    behavior: "smooth",
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
}

.popup {
  background-color: rgb(var(--bg-color));
  border: 1px solid var(--fg-color-025);
  border-radius: var(--border-radius);
  box-shadow: 0 0 1rem 0 rgb(0, 0, 0, 0.5);
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
  padding: 1.5rem;
  @include scroll-bar();
  &:first-child {
    padding-top: 1.5rem;
  }
}
</style>
