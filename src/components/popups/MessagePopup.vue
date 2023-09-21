<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  title?: string;
  text?: string;
}>()

const mainState = inject("state") as MainState

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="message-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <span>{{ mainState.messagePopupTitle }}</span>
      </h2>
    </template>
    <template #body>
      <div class="text">{{ mainState.messagePopupText }}</div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.message-popup {
  &:deep() .popup {
    width: calc($router-view-width - 4rem);
  }

  .text {
    line-height: var(--line-height);
    user-select: text;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
