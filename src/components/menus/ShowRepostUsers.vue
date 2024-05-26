<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  uri?: string;
}>()

const mainState = inject("state") as MainState

function show () {
  Util.blurElement()
  if (props.uri == null) return
  mainState.openRepostUsersPopup(props.uri)
  emit("close")
}
</script>

<template>
  <button @click.prevent.stop="show">
    <SVGIcon name="repost" />
    <span>{{ $t("repostUsers") }}</span>
  </button>
</template>
