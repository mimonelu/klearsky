<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post?: TTPost;
}>()

const mainState = inject("state") as MainState

async function onActivate () {
  emit("close")
  if (mainState.processing || props.post == null) return
  mainState.processing = true
  const response = props.post.threadgate != null
    ? await mainState.atp.deleteThreadgate(props.post.uri)
    : await mainState.atp.updateThreadgate(props.post.uri, true, false)
  mainState.processing = false
  if (!response || response instanceof Error) {
    mainState.openErrorPopup("errorApiFailed", response)
  }
}
</script>

<template>
  <button @click.prevent.stop="onActivate">
    <SVGIcon name="reply" />
    <span>{{ $t("Threadgate") }}</span>
  </button>
</template>
