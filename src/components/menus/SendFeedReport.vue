<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  generator: TTFeedGenerator
}>()

const mainState = inject("state") as MainState

async function sendFeedReport () {
  Util.blurElement()
  emit("close")
  mainState.openSendFeedReportPopup(props.generator)
}
</script>

<template>
  <button @click.prevent.stop="sendFeedReport">
    <SVGIcon name="contentFiltering" />
    <span>{{ $t("reportSendFeed") }}</span>
  </button>
</template>
