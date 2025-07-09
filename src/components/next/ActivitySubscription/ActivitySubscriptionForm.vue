<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import UserBox from "@/components/compositions/UserBox.vue"

const props = defineProps<{
  user: TTUser
}>()

// const $t = inject("$t") as Function

const mainState = inject("state") as MainState

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
  const user = mainState.activitySubscriptions.find((user) => user.did === props.user.did)
  if (user == null) {
    await mainState.atp.createActivitySubscription(props.user.did, hasPost, hasReply)
    return
  }
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
      :menuDisplay="true"
      :contentWarningDisabled="false"
      :viewerDisplay="true"
    >
      <template #content>{{ $t(`allowSubscription-${user.associated?.activitySubscription?.allowSubscriptions}`) }}</template>
    </UserBox>
    <EasyForm v-bind="easyFormProps" />
  </div>
</template>

<style lang="scss" scoped>
.activity-subscription-form {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
}
</style>
