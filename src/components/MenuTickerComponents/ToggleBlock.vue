<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user?: TTUser;
}>()

const mainState = inject("state") as MainState

async function onActivate () {
  if (props.user?.viewer.blocking == null) await block()
  else await unblock()
}

async function block () {
  emit("close")
  if (mainState.processing) return
  if (props.user?.viewer.blocking != null) return
  mainState.processing = true
  const blocking = await mainState.atp.enableBlock(props.user?.did as string)
  if (blocking != null && props.user != null)
    props.user.viewer.blocking = blocking
  mainState.processing = false
}

async function unblock () {
  emit("close")
  if (mainState.processing) return
  if (props.user?.viewer.blocking == null) return
  mainState.processing = true
  await mainState.atp.disableBlock(props.user.viewer.blocking)

  mainState.currentBlockingUsers = mainState.currentBlockingUsers.filter((user: TTUser) => {
    return user.viewer.blocking !== props.user?.viewer.blocking
  })

  delete props.user.viewer.blocking
  mainState.processing = false
}
</script>

<template>
  <button
    class="block"
    @click.stop="onActivate"
  >
    <SVGIcon name="alert" />
    <span>{{ $t(user?.viewer.blocking == null ? "block" : "unblock") }}</span>
  </button>
</template>
