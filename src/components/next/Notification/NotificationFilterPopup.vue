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
          onUpdate () {
            updateRadioDisabled("reply", preferences.reply.list)
          },
        },
        {
          state: preferences.reply,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
          disabled: !preferences.reply.list,
        },

        // mention
        {
          state: preferences.mention,
          model: "list",
          label: $t("notificationFilterMention"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
          onUpdate () {
            updateRadioDisabled("mention", preferences.mention.list)
          },
        },
        {
          state: preferences.mention,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
          disabled: !preferences.mention.list,
        },

        // quote
        {
          state: preferences.quote,
          model: "list",
          label: $t("notificationFilterQuote"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
          onUpdate () {
            updateRadioDisabled("quote", preferences.quote.list)
          },
        },
        {
          state: preferences.quote,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
          disabled: !preferences.quote.list,
        },

        // repost
        {
          state: preferences.repost,
          model: "list",
          label: $t("notificationFilterRepost"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
          onUpdate () {
            updateRadioDisabled("repost", preferences.repost.list)
          },
        },
        {
          state: preferences.repost,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
          disabled: !preferences.repost.list,
        },

        // repostViaRepost
        {
          state: preferences.repostViaRepost,
          model: "list",
          label: $t("notificationFilterRepostViaRepost"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
          onUpdate () {
            updateRadioDisabled("repostViaRepost", preferences.repostViaRepost.list)
          },
        },
        {
          state: preferences.repostViaRepost,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
          disabled: !preferences.repostViaRepost.list,
        },

        // like
        {
          state: preferences.like,
          model: "list",
          label: $t("notificationFilterLike"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
          onUpdate () {
            updateRadioDisabled("like", preferences.like.list)
          },
        },
        {
          state: preferences.like,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
          disabled: !preferences.like.list,
        },

        // likeViaRepost
        {
          state: preferences.likeViaRepost,
          model: "list",
          label: $t("notificationFilterLikeViaRepost"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
          onUpdate () {
            updateRadioDisabled("likeViaRepost", preferences.likeViaRepost.list)
          },
        },
        {
          state: preferences.likeViaRepost,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
          disabled: !preferences.likeViaRepost.list,
        },

        // follow
        {
          state: preferences.follow,
          model: "list",
          label: $t("notificationFilterFollow"),
          type: "boolean",
          booleanboxLabel: "notificationFilterList",
          onUpdate () {
            updateRadioDisabled("follow", preferences.follow.list)
          },
        },
        {
          state: preferences.follow,
          model: "include",
          type: "radio",
          layout: "horizontal",
          options: NOTIFICATION_FILTER,
          disabled: !preferences.follow.list,
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

function updateRadioDisabled (type: keyof TTNotificationPreferences["preferences"], isEnabled: boolean) {
  const radioItem = state.easyFormProps.data.find((item) => {
    return (
      item.state?.constructor.name === "Object" &&
      item.model === "include" &&
      item.state === mainState.notificationPreferences?.preferences?.[type]
    )
  })
  if (radioItem) {
    radioItem.disabled = !isEnabled
  }
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

<style lang="scss" scoped>
// フォームのギャップ調整
.notification-filter-popup:deep(.easy-form__body) {
  grid-gap: 0.5rem;

  dl[data-name="list"]:not(:first-child) {
    margin-top: 0.5rem;
  }
}
</style>
