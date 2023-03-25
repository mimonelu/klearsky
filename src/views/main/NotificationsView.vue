<script lang="ts" setup>
import { inject, onMounted } from "vue"
import { RouterView } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState

onMounted(async () => {
  if (mainState.notificationCount <= 0) return
  mainState.notificationCount = 0
  await mainState.atp.updateNotificationSeen()
})

async function fetchNotifications (limit: number, direction: "new" | "old") {
  mainState.processing = true
  try {
    await mainState.fetchNotifications(limit, direction, false)
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <div class="notifications-view">
    <div class="tab">
      <button
        class="tab__button--outline"
        @click.prevent="fetchNotifications(25, 'new')"
      >
        <SVGIcon name="cursorUp" />
      </button>
      <RouterLink
        class="tab__button"
        to="/notifications/reply"
        @click.prevent
      >
        <SVGIcon name="post" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        to="/notifications/repost"
        @click.prevent
      >
        <SVGIcon name="repost" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        to="/notifications/vote"
        @click.prevent
      >
        <SVGIcon name="heart" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        to="/notifications/mention"
        @click.prevent
      >
        <SVGIcon name="at" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        to="/notifications/follow"
        @click.prevent
      >
        <SVGIcon name="person" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        to="/notifications/invite"
        @click.prevent
      >
        <SVGIcon name="mail" />
      </RouterLink>
      <button
        class="tab__button--outline"
        @click.prevent="fetchNotifications(25, 'old')"
      >
        <SVGIcon name="cursorDown" />
      </button>
    </div>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.notifications-view {
  flex-grow: 1;
}

.tab {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
