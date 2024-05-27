<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  uri?: string;
}>()

const mainState = inject("state") as MainState

async function sendMention () {
  Util.blurElement()
  emit("close")
  if (props.uri == null) return
  await mainState.openSendPostPopup({
    type: "post",
    url: props.uri,
  })
}
</script>

<template>
  <button @click.prevent.stop="sendMention">
    <SVGIcon name="link" />
    <span>{{ $t("sendLinkCard") }}</span>
  </button>
</template>
