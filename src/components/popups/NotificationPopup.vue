<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, reactive, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import NotificationList from "@/components/list/NotificationList.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(name: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  total: ComputedRef<number>
}>({
  processing: false,
  total: computed((): number => {
    let result = 0
    mainState.notifications
      .forEach((notificationGroup: TTNotificationGroup) => {
        notificationGroup.notifications
          .forEach(() => {
            result ++
          })
      })
    return result
  }),
})

onBeforeUnmount(() => {
  updateNotificationSeen()
  updateNotificationIsRead()
  mainState.notificationCount = 0
  emit("updatePageTitle")
})

onMounted(async () => {
  if (!mainState.notificationFetchedFirst) {
    mainState.notificationFetchedFirst = true
    await fetchNotifications("new")
  }
  updateNotificationSeen()
})

function close () {
  emit("close")
}

async function updateNotificationSeen () {
  if (mainState.notificationCount <= 0) return
  await mainState.atp.updateNotificationSeen()
}

function updateNotificationIsRead () {
  mainState.notifications.forEach((notificationGroup: TTNotificationGroup) => {
    notificationGroup.notifications.forEach((notification: TTNotification) => {
      notification.isRead = true
    })
  })
}

async function fetchNotifications (direction: "new" | "old") {
  Util.blurElement()
  state.processing = true
  try {
    await mainState.fetchNotifications(CONSTS.LIMIT_OF_FETCH_NOTIFICATIONS, direction)
  } finally {
    state.processing = false
  }
}

function scrolledToBottom () {
  fetchNotifications("old")
}
</script>

<template>
  <Popup
    class="notification-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="bell" />
        <span>{{ $t("notifications") }} ({{ state.total }})</span>
      </h2>
    </template>
    <template #header-after>
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchNotifications('new')"
      />
    </template>
    <template #body>
      <div class="notifications-view__main">
        <NotificationList @close="close" />
      </div>
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchNotifications('old')"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.notification-popup {
  &:deep() {
    .popup {
      flex-grow: 1;
      height: 100%;
    }

    .popup-body {
      flex-grow: 1;
      grid-gap: 0;
      padding: 0;
    }
  }
}
</style>
