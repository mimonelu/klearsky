<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  hasCloseButton?: boolean;
}>()

function close () {
  emit("close")
}
</script>

<template>
  <div class="popup-overlay">
    <div class="popup">
      <header
        v-if="$slots.header"
        class="popup-header"
      >
        <slot name="header" />
        <button
          v-if="props.hasCloseButton"
          class="popup-closer"
          @click.prevent="close"
        >
          <SVGIcon name="cross" />
        </button>
      </header>
      <div class="popup-body">
        <slot name="body" />
      </div>
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popup-overlay {
  background-color: rgba(var(--bg-color), 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overscroll-behavior: none;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 2;
  width: 100vw;
  height: 100vh;
}

.popup {
  background-color: rgb(var(--bg-color));
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: 1px;
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  margin: 3rem;
  overflow: hidden;
  overscroll-behavior: none;
  position: relative;
  min-width: 320px;
  width: 640px;
  max-width: calc(100vw - 6rem);
  max-height: calc(100vh - 6rem);
}

.popup-header {
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  position: relative;
  min-height: 4rem;

  &:deep() > h2 {
    flex-grow: 1;
    text-align: center;
  }
}

.popup-body {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  overflow-y: auto;
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
    fill: rgba(var(--fg-color), 0.5);
  }

  &:focus,
  &:hover {
    filter: brightness(1.5);
  }
}
</style>
