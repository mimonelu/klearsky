<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user?: TTUser,
}>()

const mainState = inject("state") as MainState

async function onActivate () {
  if (props.user?.viewer.blocking == null) {
    await block()
  } else {
    await unblock()
  }
}

async function block () {
  emit("close")
  if (mainState.centerLoaderDisplay) {
    return
  }
  if (props.user?.viewer.blocking != null) {
    return
  }
  mainState.centerLoaderDisplay = true
  const response = await mainState.atp.updateBlockToEnable(props.user?.did as string)
  mainState.centerLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "ToggleBlock/block")
    return
  }
  if (props.user != null) {
    props.user.viewer.blocking = response
  }
}

async function unblock () {
  emit("close")
  if (mainState.centerLoaderDisplay) {
    return
  }
  if (props.user?.viewer.blocking == null) {
    return
  }
  mainState.centerLoaderDisplay = true
  const response = await mainState.atp.updateBlockToDisable(props.user.viewer.blocking)
  mainState.centerLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "ToggleBlock/unblock")
    return
  }
  mainState.currentBlockingUsers = mainState.currentBlockingUsers
    .filter((user: TTUser) => {
      return user.viewer.blocking !== props.user?.viewer.blocking
    })
  delete props.user.viewer.blocking
}
</script>

<template>
  <button
    :disabled="user?.viewer.blockingByList != null"
    @click.prevent.stop="onActivate"
  >
    <template v-if="user?.viewer.blocking == null">
      <SVGIcon name="person" />
      <span>{{ $t("block") }}</span>
    </template>
    <template v-else>
      <SVGIcon name="personOff" />
      <span>{{ $t("unblock") }}</span>
    </template>
  </button>
</template>
