<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, watch } from "vue"
import LoadButton from "@/components/LoadButton.vue"
import NotificationList from "@/components/NotificationList.vue"
import PageHeader from "@/components/PageHeader.vue"
import Util from "@/composables/util"
import consts from "@/consts/consts.json"

const mainState = inject("state") as MainState

onBeforeUnmount(() => {
  updateNotificationSeen()
  updateNotificationIsRead()
  mainState.notificationCount = 0
})

onMounted(updateNotificationSeen)

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
  mainState.listProcessing = true
  try {
    await mainState.fetchNotifications(consts.limitOfFetchNotifications, direction)
  } finally {
    mainState.listProcessing = false
  }
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchNotifications("old")
})
</script>

<template>
  <div class="notifications-view">
    <PageHeader
      :hasBackButton="true"
      :title="$t('notifications')"
      :subTitle="mainState.atp.session?.handle ?? ''"
    />
    <LoadButton
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchNotifications('new')"
    />
    <div class="notifications-view__main">
      <NotificationList />
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listProcessing"
      @activate="fetchNotifications('old')"
    />
  </div>
</template>

<style lang="scss" scoped>
.notifications-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__main {
    flex-grow: 1;
  }
}
</style>
