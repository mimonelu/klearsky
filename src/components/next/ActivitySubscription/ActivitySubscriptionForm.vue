<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"

const props = defineProps<{
  user: TTUser
}>()

const mainState = inject("state") as MainState

const canSubscribe = ((): boolean => {
  const allowSubscriptions = props.user.associated?.activitySubscription?.allowSubscriptions
  if (allowSubscriptions == null) {
    return true
  }
  if (
    allowSubscriptions === "followers" &&
    props.user.viewer?.following != null
  ) {
    return true
  }
  if (
    allowSubscriptions === "mutuals" &&
    props.user.viewer?.following != null &&
    props.user.viewer?.followedBy != null
  ) {
    return true
  }
  return false
})()

const easyFormStates: {
  states: Array<"post" | "reply">
} = reactive({
  states: (() => {
    const states: Array<"post" | "reply"> = []
    if (props.user.viewer?.activitySubscription?.post) {
      states.push("post")
    }
    if (props.user.viewer?.activitySubscription?.reply) {
      states.push("reply")
    }
    return states
  })(),
})

const easyFormProps: TTEasyForm = {
  blurOnSubmit: false,
  hasSubmitButton: false,
  data: [
    {
      state: easyFormStates,
      model: "states",
      disabled: !canSubscribe,
      type: "checkbox",
      layout: "horizontal",
      options: [
        { label: "post", value: "post" },
        { label: "reply", value: "reply" },
      ],
    },
  ],
}

async function update () {
  const hasPost = easyFormStates.states.includes("post")
  const hasReply = easyFormStates.states.includes("reply")
  const userIndex = mainState.activitySubscriptions.findIndex(user => user.did === props.user.did)

  // 作成
  if (userIndex === - 1) {
    await mainState.atp.createActivitySubscription(props.user.did, hasPost, hasReply)
    mainState.activitySubscriptions.unshift(props.user)
    return
  }

  // 削除
  if (!hasPost && !hasReply) {
    await mainState.atp.createActivitySubscription(props.user.did, false, false)
    mainState.activitySubscriptions.splice(userIndex, 1)
    return
  }

  // 変更
  if (
    hasPost !== props.user.viewer?.activitySubscription?.post ||
    hasReply !== props.user.viewer?.activitySubscription?.reply
  ) {
    if (props.user.viewer?.activitySubscription != null) {
      /* eslint-disable vue/no-mutating-props */
      props.user.viewer.activitySubscription.post = hasPost
      props.user.viewer.activitySubscription.reply = hasReply
      /* eslint-enable vue/no-mutating-props */
    }

    // 変更＝削除してから作成
    await mainState.atp.createActivitySubscription(props.user.did, false, false)
    await mainState.atp.createActivitySubscription(props.user.did, hasPost, hasReply)
  }
}

defineExpose({
  update,
})
</script>

<template>
  <div class="activity-subscription-form">
    <UserBox
      :user="user"
      :menuDisplay="false"
      :contentWarningDisabled="false"
      :viewerDisplay="true"
    >
      <template #content>
        <div
          class="activity-subscription-form__allow-subscriptions"
          :data-can-subscribe="canSubscribe"
        >
          <SVGIcon :name="canSubscribe ? 'check' : 'cross'" />
          <span>{{ $t(`allowSubscription-${user.associated?.activitySubscription?.allowSubscriptions}`) }}</span>
        </div>
      </template>
    </UserBox>
    <EasyForm v-bind="easyFormProps" />
  </div>
</template>

<style lang="scss" scoped>
.activity-subscription-form {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;

  .user-box {
    pointer-events: none;
  }

  &__allow-subscriptions {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;

    span {
      font-weight: bold;
    }

    &[data-can-subscribe="true"] {
      color: rgb(var(--green-color));

      .svg-icon {
        fill: rgb(var(--green-color));
      }
    }
    &[data-can-subscribe="false"] {
      color: rgb(var(--notice-color));

      .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }
}
</style>
