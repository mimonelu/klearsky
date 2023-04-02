<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted } from "vue"
import NotificationList from "@/components/NotificationList.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

onBeforeUnmount(() => {
  mainState.notificationCount = 0
})

onMounted(async () => {
  if (mainState.notificationCount <= 0) return
  await mainState.atp.updateNotificationSeen()
})

async function fetchNotifications (limit: number, direction: "new" | "old") {
  blurElement()
  mainState.processing = true
  try {
    await mainState.fetchNotifications(limit, direction)
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <div class="notifications-view">
    <button
      class="fetch-button"
      @click.prevent="fetchNotifications(25, 'new')"
    >
      <SVGIcon name="cursorUp"/>
    </button>
    <div class="notifications-view__main">
      <NotificationList />
    </div>
    <button
      class="fetch-button"
      @click.prevent="fetchNotifications(25, 'old')"
    >
      <SVGIcon name="cursorDown"/>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.notifications-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
