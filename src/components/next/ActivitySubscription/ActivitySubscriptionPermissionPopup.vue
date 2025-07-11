<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormStates: {
  allowSubscriptions: "followers" | "mutuals" | "none"
} = reactive({
  allowSubscriptions: mainState.currentProfile?.associated?.activitySubscription?.allowSubscriptions ?? "followers",
})

const easyFormProps: TTEasyForm = {
  blurOnSubmit: false,
  hasSubmitButton: false,
  data: [
    {
      state: easyFormStates,
      model: "allowSubscriptions",
      type: "radio",
      options: [
        { label: "allowSubscriptionsFollowers", value: "followers" },
        { label: "allowSubscriptionsMutuals", value: "mutuals" },
        { label: "allowSubscriptionsNone", value: "none" },
      ],
    },
  ],
}

async function close () {
  emit("close")
  const currentActivitySubscription = mainState.currentProfile?.associated?.activitySubscription
  if (currentActivitySubscription?.allowSubscriptions !== easyFormStates.allowSubscriptions) {
    mainState.loaderDisplay = true

    // TODO: AtpAgent に更新用のメソッドがないため、直接レコードを更新している
    //       メソッドが用意され次第、換装すること
    const result = await mainState.atp.updateRecord(
      mainState.atp.data.did,
      "app.bsky.notification.declaration",
      `at://${mainState.atp.data.did}/app.bsky.notification.declaration/self`,
      {
        "$type": "app.bsky.notification.declaration",
        allowSubscriptions: easyFormStates.allowSubscriptions,
      }
    )

    mainState.loaderDisplay = false
    if (result instanceof Error) {
      mainState.openErrorPopup(result, "ActivitySubscriptionPermissionPopup/close")
    }
  }
  if (currentActivitySubscription?.allowSubscriptions != null) {
    currentActivitySubscription.allowSubscriptions = easyFormStates.allowSubscriptions
  }
}
</script>

<template>
  <Popup
    class="activity-subscription-permission-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="bell" />
        <span>{{ $t("activitySubscriptionPermission") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.activity-subscription-permission-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--post-color));
      }
    }
  }
}
</style>
