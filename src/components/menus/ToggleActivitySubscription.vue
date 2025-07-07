<script lang="ts" setup>
import { computed, inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser
}>()

const $t = inject("$t") as Function
const mainState = inject("state") as MainState

const canSubscribe = computed((): boolean => {
  // 購読許可情報
  const allowSubscriptions = props.user?.associated?.activitySubscription?.allowSubscriptions

  // 購読許可情報がなければ許可
  if (allowSubscriptions == null) {
    return true
  }

  // 購読許可状態が不許可の場合
  if (allowSubscriptions === "none") {
    return false
  }

  // 購読許可状態がフォロワー限定の場合
  if (allowSubscriptions === "followers") {
    return props.user?.viewer?.following != null
  }

  // 購読許可状態が相互フォロー限定の場合
  if (allowSubscriptions === "mutuals") {
    return (
      props.user?.viewer?.following != null &&
      props.user?.viewer?.followedBy != null
    )
  }

  return true
})

async function toggleActivitySubscription () {
  emit("close")
  if (props.user?.did) {
    const isSubscribed = !!props.user.viewer?.activitySubscription
    mainState.centerLoaderDisplay = true
    const response = await mainState.atp.createActivitySubscription(
      props.user.did,
      !isSubscribed, // post: 購読していない場合は true
      !isSubscribed  // reply: 購読していない場合は true
    )
    mainState.centerLoaderDisplay = false
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "MenuTickerToggleActivitySubscription/toggleActivitySubscription")
      return
    }
    // プロフィールデータを更新
    if (props.user.viewer) {
      // eslint-disable-next-line vue/no-mutating-props
      props.user.viewer.activitySubscription = isSubscribed ? undefined : {
        post: true,
        reply: true,
      }
    }
  }
}
</script>

<template>
  <button
    type="button"
    :disabled="!canSubscribe"
    @click.stop="toggleActivitySubscription"
  >
    <SVGIcon name="activitySubscription" />
    <span>{{ $t(user.viewer?.activitySubscription ? "unsubscribe" : "subscribe") }}</span>
  </button>
</template>
