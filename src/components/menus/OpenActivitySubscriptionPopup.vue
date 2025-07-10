<script lang="ts" setup>
import { computed, inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser
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

async function openActivitySubscriptionPopup () {
  emit("close")
  if (props.user != null) {
    mainState.openActivitySubscriptionPopup(props.user)
  }
}
</script>

<template>
  <button
    class="open-activity-subscription-popup"
    type="button"
    :data-can-subscribe="canSubscribe"
    @click.stop="openActivitySubscriptionPopup"
  >
    <SVGIcon :name="canSubscribe ? 'activitySubscription' : 'cross'" />
    <span>{{ $t("activitySubscription") }}</span>
  </button>
</template>

<style lang="scss" scoped>
.open-activity-subscription-popup {
  &[data-can-subscribe="false"] .svg-icon {
    fill: rgb(var(--notice-color));
  }
}
</style>
