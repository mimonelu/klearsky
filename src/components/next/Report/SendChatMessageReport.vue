<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  myConvo: TIMyConvo
  message: TIChatMessage
}>()

const mainState = inject("state") as MainState

async function sendChatMessageReport () {
  Util.blurElement()
  emit("close")
  mainState.openSendChatMessageReportPopup(props.myConvo, props.message)
}
</script>

<template>
  <button @click.prevent.stop="sendChatMessageReport">
    <SVGIcon name="contentFiltering" />
    <span>{{ $t("reportSendChatMessage") }}</span>
  </button>
</template>
