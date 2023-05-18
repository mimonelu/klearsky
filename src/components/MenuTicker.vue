<script lang="ts" setup>
import { nextTick, reactive, ref, watch } from "vue"

const props = defineProps<{
  display: boolean;
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

    if (window.innerHeight < innerRect.bottom)
      state.top = window.innerHeight - innerRect.bottom
    if (0 > innerRect.left)
      state.left = - innerRect.left
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
      <div class="menu-ticker--content">
        <slot />
      </div>
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

    position: absolute;
    max-width: 16rem;
    z-index: 2;
  }

  &--content {
    box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.25);
    background-color: rgb(var(--fg-color));
    color: rgb(var(--bg-color));
    border: 1px solid rgba(var(--bg-color), 0.25);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    grid-gap: 0.125rem;
    padding: 0.5rem 0;

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
          background-color: rgba(var(--accent-color), 0.25);
        }

        & > .svg-icon {
          fill: rgb(var(--bg-color));
        }
        & > .svg-icon--at,
        & > .svg-icon--post {
          fill: rgb(var(--post-color));
        }
        & > .svg-icon--repost,
        & > .svg-icon--quoteRepost {
          fill: rgb(var(--share-color));
        }
        & > .svg-icon--heart {
          fill: rgb(var(--like-color));
        }
        & > .svg-icon--person,
        & > .svg-icon--personOff,
        & > .svg-icon--remove,
        & > .svg-icon--volumeOn,
        & > .svg-icon--volumeOff {
          fill: rgb(var(--notice-color));
        }
      }

      & > hr {
        border-bottom: 1px solid rgba(var(--bg-color), 0.25);
      }
    }
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
