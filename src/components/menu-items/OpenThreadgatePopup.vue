<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post?: TTPost;
}>()

const mainState = inject("state") as MainState

function onActivate () {
  if (props.post == null) {
    emit("close")
    return
  }
  mainState.openThreadgatePopup({
    mode: "post",
    postThreadgate: props.post.threadgate,
    postUri: props.post.uri,
    onClosed (params: any) {
      if (params?.updated) emit("updateThisPost")
      emit("close")
    },
  })
}
</script>

<template>
  <button @click.prevent.stop="onActivate">
    <SVGIcon name="lock" />
    <span>{{ $t("threadgate") }}</span>
  </button>
</template>
