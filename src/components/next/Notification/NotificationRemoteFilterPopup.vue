<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { NOTIFICATION_REMOTE_FILTER } from "@/consts/settings.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  easyFormProps: TTEasyForm
}>({
  easyFormProps: {
    hasSubmitButton: false,
    data: [
      {
        state: mainState.currentSetting,
        model: "notificationRemoteFilter",
        type: "checkbox",
        options: NOTIFICATION_REMOTE_FILTER,

        // すべてチェックされていたら、すべてのチェックを外す
        onUpdate () {
          if (mainState.currentSetting.notificationRemoteFilter == null) {
            return
          }
          if (mainState.currentSetting.notificationRemoteFilter.length === NOTIFICATION_REMOTE_FILTER.length) {
            mainState.currentSetting.notificationRemoteFilter.splice(0)
          }
        },
      },
    ],
  },
})

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="notification-remote-filter-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="setting" />
        <span>{{ $t("notificationRemoteFilter") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="state.easyFormProps" />
    </template>
  </Popup>
</template>
