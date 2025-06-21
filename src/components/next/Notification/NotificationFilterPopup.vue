<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { NOTIFICATION_FILTER } from "@/consts/settings.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  easyFormProps: TTEasyForm
}>({
  easyFormProps: {
    hasSubmitButton: false,
    data: (() => {
      const preferences = mainState.notificationPreferences?.preferences
      if (preferences == null) {
        return []
      }
      return [
        // reply
        {
          state: preferences.reply,
          model: "list",
          label: $t("notificationFilterReply"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
        },
        {
          state: preferences.reply,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
        },

        // mention
        {
          state: preferences.mention,
          model: "list",
          label: $t("notificationFilterMention"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
        },
        {
          state: preferences.mention,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
        },

        // quote
        {
          state: preferences.quote,
          model: "list",
          label: $t("notificationFilterQuote"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
        },
        {
          state: preferences.quote,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
        },

        // repost
        {
          state: preferences.repost,
          model: "list",
          label: $t("notificationFilterRepost"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
        },
        {
          state: preferences.repost,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
        },

        // repostViaRepost
        {
          state: preferences.repostViaRepost,
          model: "list",
          label: $t("notificationFilterRepostViaRepost"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
        },
        {
          state: preferences.repostViaRepost,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
        },

        // like
        {
          state: preferences.like,
          model: "list",
          label: $t("notificationFilterLike"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
        },
        {
          state: preferences.like,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
        },

        // likeViaRepost
        {
          state: preferences.likeViaRepost,
          model: "list",
          label: $t("notificationFilterLikeViaRepost"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
        },
        {
          state: preferences.likeViaRepost,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
        },

        // follow
        {
          state: preferences.follow,
          model: "list",
          label: $t("notificationFilterFollow"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
        },
        {
          state: preferences.follow,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
        },
      ]
    })(),
  },
})

function close () {
  // TODO: 変更があった場合のみ保存すること
  mainState.updateNotificationPreferences()

  emit("close")
}
</script>

<template>
  <Popup
    class="notification-filter-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="setting" />
        <span>{{ $t("notificationFilter") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="state.easyFormProps" />
    </template>
  </Popup>
</template>
