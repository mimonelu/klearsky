<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user?: TTUser;
}>()

const mainState = inject("state") as MainState

function onActivate () {
  if (props.user == null) {
    emit("close")
    return
  }
  /*
  mainState.openThreadgatePopup({
    mode: "post",
    postThreadgate: props.post.threadgate,
    postUri: props.post.uri,
    onClosed (params: any) {
      if (params?.updated) emit("updateThisPost")
      emit("close")
    },
  })
  */
  emit("close")
}
</script>

<template>
  <button @click.prevent.stop="onActivate">
    <SVGIcon name="list" />
    <span>{{ $t("listUserManagement") }}</span>
  </button>
</template>
