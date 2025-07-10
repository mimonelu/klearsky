<script lang="ts" setup>
import { inject, ref } from "vue"
import ActivitySubscriptionForm from "@/components/next/ActivitySubscription/ActivitySubscriptionForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  user: TTUser
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const activitySubscriptionForm = ref([])

async function close () {
  mainState.loaderDisplay = true
  await (activitySubscriptionForm.value as unknown as typeof ActivitySubscriptionForm).update()
  mainState.loaderDisplay = false
  emit("close")
}
</script>

<template>
  <Popup
    class="activity-subscription-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="activitySubscription" />
        <span>{{ $t("activitySubscription") }}</span>
      </h2>
    </template>
    <template #body>
      <ActivitySubscriptionForm
        ref="activitySubscriptionForm"
        :user="user"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.activity-subscription-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--post-color));
      }
    }
  }
}
</style>
