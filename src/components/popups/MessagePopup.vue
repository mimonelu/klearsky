<script lang="ts" setup>
import { inject } from "vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import Popup from "@/components/popups/Popup.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

function close () {
  emit("close")
}

function translate () {
  Util.translateInExternalService(mainState.messagePopupProps.text)
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
        <span>{{ mainState.messagePopupProps.title }}</span>
      </h2>
    </template>
    <template #body>
      <HtmlText
        :text="mainState.messagePopupProps.text"
        :hasTranslateLink="mainState.messagePopupProps.hasTranslateLink"
        @onActivateHashTag="close"
        @onActivateMention="close"
        @translate="translate"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.message-popup {
  .html-text {
    line-height: var(--line-height-high);
    user-select: text;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
