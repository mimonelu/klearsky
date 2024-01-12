<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user?: TTUser,
}>()

const mainState = inject("state") as MainState

async function onActivate () {
  if (props.user?.viewer.blocking == null) await block()
  else await unblock()
}

async function block () {
  emit("close")
  if (mainState.centerLoaderDisplay) return
  if (props.user?.viewer.blocking != null) return
  mainState.centerLoaderDisplay = true
  const blocking = await mainState.atp.updateBlockToEnable(props.user?.did as string)
  if (blocking != null && props.user != null)
    props.user.viewer.blocking = blocking
  mainState.centerLoaderDisplay = false
}

async function unblock () {
  emit("close")
  if (mainState.centerLoaderDisplay) return
  if (props.user?.viewer.blocking == null) return
  mainState.centerLoaderDisplay = true
  await mainState.atp.updateBlockToDisable(props.user.viewer.blocking)

  mainState.currentBlockingUsers = mainState.currentBlockingUsers.filter((user: TTUser) => {
    return user.viewer.blocking !== props.user?.viewer.blocking
  })

  delete props.user.viewer.blocking
  mainState.centerLoaderDisplay = false
}
</script>

<template>
  <button
    :disabled="user?.viewer.blockingByList != null"
    @click.prevent.stop="onActivate"
  >
    <template v-if="user?.viewer.blocking == null">
      <SVGIcon name="personOff" />
      <span>{{ $t("block") }}</span>
    </template>
    <template v-else>
      <SVGIcon name="person" />
      <span>{{ $t("unblock") }}</span>
    </template>
  </button>
</template>
