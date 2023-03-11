<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import type { MainState } from "@/@types/main-state.d"

const emit = defineEmits<{(event: string): void}>()

const mainState: MainState = inject("state") as MainState

const close = () => {
  emit("close")
}
</script>

<template>
  <div class="popup-overlay error-popup">
    <div class="popup">
      <h2 class="header">{{ $t("error") }}</h2>
      <pre class="message">{{ mainState.error }}</pre>
      <button
        @click.prevent="close"
        class="popup-closer"
      >
        <SVGIcon name="cross" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popup {
  width: 320px;
}

.header {
  color: rgb(var(--notice-color));
  font-size: 2rem;
}

.message {
  background-color: rgba(var(--notice-color), 0.125);
  color: rgb(var(--notice-color));
  line-height: 1.5;
  padding: 1rem 2rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
