<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false
})

const easyFormStates: Array<{
  _did: string
  states: Array<"post" | "reply">
}> = reactive([])

const easyFormProps: Array<TTEasyForm> = []

onBeforeMount(async () => {
  await fetchContinuousResults("new")
})

async function close () {
  emit("close")

  mainState.loaderDisplay = true
  for (const newState of easyFormStates) {
    const oldState = mainState.activitySubscriptions.find((user) => user.did === newState._did)
    if (oldState == null) {
      continue
    }
    const post = newState.states.includes("post")
    const reply = newState.states.includes("reply")
    if (
      post !== oldState.viewer?.activitySubscription?.post ||
      reply !== oldState.viewer?.activitySubscription?.reply
    ) {
      if (oldState.viewer?.activitySubscription != null) {
        oldState.viewer.activitySubscription.post = post
        oldState.viewer.activitySubscription.reply = reply
      }

      await mainState.atp.createActivitySubscription(newState._did, false, false)
      await mainState.atp.createActivitySubscription(newState._did, post, reply)
    }
  }
  mainState.loaderDisplay = false
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) {
    return
  }
  state.processing = true
  const cursor = await mainState.atp.fetchActivitySubscriptions(
    mainState.activitySubscriptions as Array<TTUser>,
    CONSTS.LIMIT_OF_FETCH_ACTIVITY_SUBSCRIPTIONS,
    direction === "old" ? mainState.activitySubscriptionsCursor : undefined
  )
  state.processing = false
  if (cursor instanceof Error) {
    mainState.openErrorPopup(cursor, "ActivitySubscriptionListPopup/fetchContinuousResults")
    return
  }
  if (cursor != null && (
    direction === "old" || (
      direction === "new" &&
      mainState.activitySubscriptionsCursor == null
    )
  )) {
    mainState.activitySubscriptionsCursor = cursor
  }

  mainState.activitySubscriptions.forEach((user, userIndex) => {
    if (easyFormStates[userIndex] == null) {
      const states: Array<"post" | "reply"> = []
      if (user.viewer?.activitySubscription?.post) {
        states.push("post")
      }
      if (user.viewer?.activitySubscription?.reply) {
        states.push("reply")
      }
      easyFormStates[userIndex] = {
        _did: user.did,
        states,
      }
    }

    if (easyFormProps[userIndex] == null) {
      easyFormProps[userIndex] = {
        blurOnSubmit: false,
        hasSubmitButton: false,
        data: [
          {
            state: easyFormStates[userIndex],
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
    }
  })
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}
</script>

<template>
  <Popup
    class="activity-subscription-list-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="activitySubscription" />
        <span>{{ $t("activitySubscriptionList") }}</span>
      </h2>
    </template>
    <template #header-after>
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
    </template>
    <template #body>
      <div class="activity-subscriptions">
        <div
          v-for="user, userIndex of mainState.activitySubscriptions"
          :key="user.did"
           class="activity-subscription"
        >
          <UserBox
            :user="user"
            :menuDisplay="true"
            :contentWarningDisabled="false"
            :viewerDisplay="true"
            @link="close"
          >
            <template #content>{{ user.associated?.activitySubscription?.allowSubscriptions }}</template>
          </UserBox>

          <EasyForm
            v-if="easyFormProps[userIndex] != null"
            v-bind="easyFormProps[userIndex]"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.activity-subscription-list-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--post-color));
      }
    }
  }

  .activity-subscriptions {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
  }

  .activity-subscription {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
  }
}
</style>
