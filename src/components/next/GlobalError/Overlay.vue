<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  error?: any
}>()

function close () {
  emit("close")
}
</script>

<template>
  <div
    class="global-error-overlay"
    @close="close"
  >
    <div class="closer-container">
      <button
        class="closer"
        @click="emit('close')"
      >
        <SVGIcon name="cross" />
      </button>
    </div>
    <div class="message-container">
      <p class="message">{{ error }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-error-overlay {
  background-color: rgb(0, 0, 0, 0.75);
  display: grid;
  grid-template-rows: auto 1fr;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
}

.closer-container {
  display: flex;
  justify-content: flex-end;
}

.closer {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  padding: 1rem;

  & > .svg-icon {
    fill: rgb(var(--fg-color), 0.75);
  }

  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
}

.message-container {
  overflow-y: scroll;
  overscroll-behavior: none;
  @include scroll-bar(transparent);
}

.message {
  color: rgb(var(--notice-color));
  font-size: 1.25rem;
  font-weight: bold;
  line-height: var(--line-height-middle);
  padding: 2rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
