<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  myConvo: TIMyConvo
}>()

const mainState = inject("state") as MainState

async function sendChatConvoReport () {
  Util.blurElement()
  emit("close")
  mainState.openSendChatConvoReportPopup(props.myConvo)
}
</script>

<template>
  <button @click.prevent.stop="sendChatConvoReport">
    <SVGIcon name="contentFiltering" />
    <span>{{ $t("reportSendChatConvo") }}</span>
  </button>
</template>
