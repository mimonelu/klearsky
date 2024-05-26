<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

async function openTimeFeedsPopup () {
  Util.blurElement()
  emit("close")
  mainState.openTimeFeedsPopup(props.post, "old")
}
</script>

<template>
  <button @click.prevent.stop="openTimeFeedsPopup">
    <SVGIcon name="history" />
    <span>{{ $t("showTimeFeeds") }}</span>
  </button>
</template>
