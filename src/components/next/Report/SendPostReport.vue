<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

async function sendPostReport () {
  Util.blurElement()
  emit("close")
  mainState.openSendPostReportPopup(props.post)
}
</script>

<template>
  <button @click.prevent.stop="sendPostReport">
    <SVGIcon name="contentFiltering" />
    <span>{{ $t("reportSendPost") }}</span>
  </button>
</template>
