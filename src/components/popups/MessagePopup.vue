<script lang="ts" setup>
import { inject } from "vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
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
      <HtmlText
        :text="mainState.messagePopupText"
        :processHashTag="true"
        @onActivateHashTag="close"
        @onActivateMention="close"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.message-popup {
  &:deep() .popup {
    width: calc($router-view-width - 4rem);
  }

  .html-text {
    line-height: var(--line-height);
    user-select: text;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
