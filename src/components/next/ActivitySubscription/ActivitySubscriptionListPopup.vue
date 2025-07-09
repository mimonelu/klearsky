<script lang="ts" setup>
import { inject, onBeforeMount, reactive, ref } from "vue"
import ActivitySubscriptionForm from "@/components/next/ActivitySubscription/ActivitySubscriptionForm.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
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

const activitySubscriptionForm = ref([])

onBeforeMount(async () => {
  await fetchContinuousResults("new")
})

async function close () {
  const tasks = (activitySubscriptionForm.value as Array<typeof ActivitySubscriptionForm>).map(form => form.update)
  mainState.loaderDisplay = true
  for (const task of tasks) {
    await task()
  }
  mainState.loaderDisplay = false
  emit("close")
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
        <ActivitySubscriptionForm
          v-for="user of mainState.activitySubscriptions"
          :key="user.did"
          ref="activitySubscriptionForm"
          :user="user"
        />
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
}
</style>
