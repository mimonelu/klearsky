<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser
}>()

const mainState = inject("state") as MainState

const allowIncoming = props.user.associated?.chat?.allowIncoming
const isDisabled =
  props.user.did === mainState.atp.data.did ||
  (
    (allowIncoming === "none") ||
    (
      (allowIncoming == null || allowIncoming === "following") &&
      (props.user.viewer.followedBy == null)
    )
  )

async function onActivate () {
  emit("close")
  if (props.user == null) {
    return
  }
  mainState.loaderDisplay = true
  const myConvo = await mainState.myChat!.fetchMyConvo([props.user.did])
  mainState.loaderDisplay = false
  if (myConvo != null) {
    mainState.openChatConvoPopup(myConvo)
  }
}
</script>

<template>
  <button
    :disabled="isDisabled"
    @click.prevent.stop="onActivate"
  >
    <SVGIcon name="chat" />
    <span>{{ $t("startChat") }}</span>
  </button>
</template>
