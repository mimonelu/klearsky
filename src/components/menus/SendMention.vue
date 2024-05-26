<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  mentionTo?: string;
}>()

const mainState = inject("state") as MainState

async function sendMention () {
  Util.blurElement()
  emit("close")
  if (props.mentionTo == null) return
  await mainState.openSendPostPopup({
    type: "post",
    text: `@${props.mentionTo} `,
  })
}
</script>

<template>
  <button @click.prevent.stop="sendMention">
    <SVGIcon name="at" />
    <span>{{ $t("sendMention") }}</span>
  </button>
</template>
