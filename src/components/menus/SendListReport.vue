<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  list: TTList
}>()

const mainState = inject("state") as MainState

async function sendListReport () {
  Util.blurElement()
  emit("close")
  mainState.openSendListReportPopup(props.list)
}
</script>

<template>
  <button @click.prevent.stop="sendListReport">
    <SVGIcon name="contentFiltering" />
    <span>{{ $t("reportSendList") }}</span>
  </button>
</template>
