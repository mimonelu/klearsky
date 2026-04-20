<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const mainState = inject("state") as MainState

const props = defineProps<{
  labeler?: TILabeler
}>()

function openLabelerSettingsPopup () {
  if (props.labeler == null) {
    return
  }
  mainState.openLabelerSettingsPopup(props.labeler)
}
</script>

<template>
  <button
    class="labeler-settings-popup-trigger button"
    :disabled="labeler == null"
    @click.stop="openLabelerSettingsPopup"
  >
    <SVGIcon name="setting" />
    <span>{{ $t("settings") }}</span>
  </button>
</template>
