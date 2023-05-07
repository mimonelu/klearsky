<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user?: TTUser;
}>()

const mainState = inject("state") as MainState

async function toggleMute () {
  emit("close")
  if (mainState.processing) return
  mainState.processing = true
  try {
    if (props.user?.viewer.muted) {
      await mainState.atp.disableMute(props.user.handle)
      props.user.viewer.muted = false

      mainState.currentMutingUsers = mainState.currentMutingUsers.filter((user: TTUser) => {
        return user.handle !== props.user?.handle
      })
    } else if (props.user != null) {
      await mainState.atp.enableMute(props.user.handle)
      props.user.viewer.muted = true
    }
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <button @click.stop="toggleMute">
    <template v-if="user?.viewer.muted">
      <SVGIcon name="volumeOff" />
      <span>{{ $t("muting") }}</span>
    </template>
    <template v-else>
      <SVGIcon name="volumeOn" />
      <span>{{ $t("mute") }}</span>
    </template>
  </button>
</template>
