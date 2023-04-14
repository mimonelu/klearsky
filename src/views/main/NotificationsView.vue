<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, watch } from "vue"
import NotificationList from "@/components/NotificationList.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const mainState = inject("state") as MainState

onBeforeUnmount(() => {
  mainState.notificationCount = 0
})

onMounted(async () => {
  if (mainState.notificationCount <= 0) return
  await mainState.atp.updateNotificationSeen()
})

async function fetchNotifications (limit: number, direction: "new" | "old") {
  Util.blurElement()
  mainState.processing = true
  try {
    await mainState.fetchNotifications(limit, direction)
  } finally {
    mainState.processing = false
  }
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchNotifications(25, 'old')
})
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
