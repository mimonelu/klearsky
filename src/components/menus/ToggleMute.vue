<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user?: TTUser,
}>()

const mainState = inject("state") as MainState

async function toggleMute () {
  emit("close")
  if (mainState.centerLoaderDisplay) {
    return
  }
  mainState.centerLoaderDisplay = true
  if (props.user?.viewer.muted) {
    const response = await mainState.atp.updateMuteToDisable(props.user.did)
    mainState.centerLoaderDisplay = false
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "ToggleMute/toggleMute")
      return
    }
    props.user.viewer.muted = false

    mainState.currentMutingUsers = mainState.currentMutingUsers
      .filter((user: TTUser) => {
        return user.did !== props.user?.did
      })
  } else if (props.user != null) {
    const response = await mainState.atp.updateMuteToEnable(props.user.did)
    mainState.centerLoaderDisplay = false
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "ToggleMute/toggleMute")
      return
    }
    props.user.viewer.muted = true
  }
}
</script>

<template>
  <button
    :disabled="user?.viewer.mutedByList != null"
    @click.prevent.stop="toggleMute"
  >
    <template v-if="user?.viewer.muted">
      <SVGIcon name="volumeOff" />
      <span>{{ $t("muteOff") }}</span>
    </template>
    <template v-else>
      <SVGIcon name="volumeOn" />
      <span>{{ $t("muteOn") }}</span>
    </template>
  </button>
</template>
