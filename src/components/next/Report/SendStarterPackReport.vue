<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  starterPack: TIStarterPack
}>()

const mainState = inject("state") as MainState

async function sendStarterPackReport () {
  Util.blurElement()
  emit("close")
  mainState.openSendStarterPackReportPopup(props.starterPack)
}
</script>

<template>
  <button @click.prevent.stop="sendStarterPackReport">
    <SVGIcon name="contentFiltering" />
    <span>{{ $t("reportSendStarterPack") }}</span>
  </button>
</template>
