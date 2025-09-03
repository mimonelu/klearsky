<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

function onActivate () {
  if (props.post == null) {
    emit("close")
    return
  }
  mainState.openCustomBookmarkManagementPopup({
    post: props.post,
  })
  emit("close")
}
</script>

<template>
  <button @click.prevent.stop="onActivate">
    <SVGIcon name="bookmark" />
    <span>{{ $t("customBookmarkManagement") }}</span>
  </button>
</template>
