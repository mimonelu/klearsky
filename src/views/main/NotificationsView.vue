<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, watch } from "vue"
import LoadButton from "@/components/LoadButton.vue"
import NotificationList from "@/components/NotificationList.vue"
import PageHeader from "@/components/PageHeader.vue"
import Util from "@/composables/util/index"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false
})

onBeforeUnmount(() => {
  mainState.notificationCount = 0
})

onMounted(async () => {
  if (mainState.notificationCount <= 0) return
  await mainState.atp.updateNotificationSeen()
})

async function fetchNotifications (limit: number, direction: "new" | "old") {
  Util.blurElement()
  state.processing = true
  try {
    await mainState.fetchNotifications(limit, direction)
  } finally {
    state.processing = false
  }
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchNotifications(25, 'old')
})
</script>

<template>
  <div class="notifications-view">
    <PageHeader
      :title="$t('notifications')"
      :subTitle="mainState.atp.session?.handle ?? ''"
    />
    <LoadButton
      direction="new"
      :processing="state.processing"
      @activate="fetchNotifications(25, 'new')"
    />
    <div class="notifications-view__main">
      <NotificationList />
    </div>
    <LoadButton
      direction="old"
      :processing="state.processing"
      @activate="fetchNotifications(25, 'old')"
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
