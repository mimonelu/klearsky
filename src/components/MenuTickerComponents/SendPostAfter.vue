<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  createdAt?: string;
}>()

const mainState = inject("state") as MainState

async function sendPostAfter () {
  Util.blurElement()
  emit("close")
  if (props.createdAt == null) return

  // １ミリセカンド進める
  const createdAtDate = new Date(props.createdAt)
  createdAtDate.setMilliseconds(createdAtDate.getMilliseconds() + 1)
  const createdAtString = createdAtDate.toISOString()

  await mainState.openSendPostPopup({
    type: "post",
    createdAt: createdAtString,
  })
}
</script>

<template>
  <button @click.prevent.stop="sendPostAfter">
    <SVGIcon name="post" />
    <span>{{ $t("sendPostAfter") }}</span>
  </button>
</template>
