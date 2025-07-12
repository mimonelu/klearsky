<script lang="ts" setup>
import { computed, inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const props = defineProps<{
  user?: TTUser
}>()

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

const isSubscribed = computed((): boolean => {
  return (
    (props.user?.viewer?.activitySubscription?.post ?? false) ||
    (props.user?.viewer?.activitySubscription?.reply ?? false)
  )
})

async function openActivitySubscriptionItemPopup () {
  if (props.user != null) {
    mainState.openActivitySubscriptionItemPopup(props.user)
  }
}
</script>

<template>
  <button
    class="button--nolabel activity-subscription-item-trigger"
    :class="isSubscribed ? 'button' : 'button--bordered'"
    type="button"
    :data-can-subscribe="canSubscribe"
    :data-is-subscribed="isSubscribed"
    @click.stop="openActivitySubscriptionItemPopup"
  >
    <SVGIcon :name="canSubscribe ? 'bell' : 'bellOff'" />
    <span>&#160;</span>
  </button>
</template>

<style lang="scss" scoped>
.activity-subscription-item-trigger {
  --fg-color: var(--like-color);

  & > span {
    font-size: 0.875rem;
  }
}
</style>
