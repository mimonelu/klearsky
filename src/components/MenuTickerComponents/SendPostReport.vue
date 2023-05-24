<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

async function sendPostReport () {
  Util.blurElement()
  emit("close")
  // await mainState.openSendPostReportPopup(props.post)
}
</script>

<template>
  <button @click.prevent.stop="sendPostReport">
    <SVGIcon name="alert" />
    <span>{{ $t("sendPostReport") }}</span>
  </button>
</template>
