<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post?: TTPost;
}>()

const mainState = inject("state") as MainState

function onActivate () {
  emit("close")
  if (props.post == null) return
  mainState.openThreadgatePopup({
    postThreadgate: props.post.threadgate,
    postUri: props.post.uri,
  })
}
</script>

<template>
  <button @click.prevent.stop="onActivate">
    <SVGIcon name="reply" />
    <span>{{ $t("threadgate") }}</span>
  </button>
</template>
