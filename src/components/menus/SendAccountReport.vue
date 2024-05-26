<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser
}>()

const mainState = inject("state") as MainState

async function sendAccountReport () {
  Util.blurElement()
  emit("close")
  mainState.openSendAccountReportPopup(props.user)
}
</script>

<template>
  <button @click.prevent.stop="sendAccountReport">
    <SVGIcon name="contentFiltering" />
    <span>{{ $t("reportSendAccount") }}</span>
  </button>
</template>
