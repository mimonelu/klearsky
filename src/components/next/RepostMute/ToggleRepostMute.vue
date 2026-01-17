<script lang="ts" setup>
import { computed, inject, type ComputedRef } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: "close"): void}>()

const props = defineProps<{
  did: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const isRepostMuted: ComputedRef<boolean> = computed(() => {
  return mainState.repostMutes.some((subject) => subject.did === props.did)
})

async function toggle () {
  Util.blurElement()
  emit("close")

  mainState.loaderDisplay = true

  let newSubjects: Array<TIRepostMuteSubject>

  if (isRepostMuted.value) {
    // リポストミュートを解除
    newSubjects = mainState.repostMutes.filter((subject) => subject.did !== props.did)
  } else {
    // リポストミュートを追加
    const newSubject: TIRepostMuteSubject = {
      did: props.did,
      createdAt: new Date().toISOString(),
    }
    newSubjects = [...mainState.repostMutes, newSubject]
  }

  const response = await mainState.atp.updateRepostMutes(newSubjects)
  mainState.loaderDisplay = false

  if (response instanceof Error) {
    mainState.openErrorPopup(response, "ToggleRepostMute/toggle")
    return
  }

  // ローカルの状態を更新
  mainState.repostMutes.splice(0, mainState.repostMutes.length, ...newSubjects)
}
</script>

<template>
  <button @click.stop="toggle">
    <SVGIcon :name="isRepostMuted ? 'repost' : 'repostOff'" />
    <span>{{ $t(isRepostMuted ? "enableRepost" : "disableRepost") }}</span>
  </button>
</template>
