<script lang="ts" setup>
import { inject, reactive, watch } from "vue"
import { useRouter } from "vue-router"
import format from "date-fns/format"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const props = defineProps<{
  reason: string
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  notifications: Array<KNotification>
}>({
  notifications: [],
})

const router = useRouter()

const iconMap: { [reason: string]: string } = {
  follow: "person",
  invite: "mail",
  mention: "at",
  reply: "post",
  repost: "repost",
  vote: "heart",
}

watch(mainState.notifications, updateNotifications)

updateNotifications(mainState.notifications)

function updateNotifications (notifications: Array<KNotification>) {
  state.notifications =
    notifications.filter((notification: KNotification) =>
      notification.reason === props.reason)
}

async function openSubject (notification: KNotification) {
  blurElement()
  switch (props.reason) {
    case "follow": {
      await router.push({ name: "profile-post", query: { handle: notification.handle } })
      break
    }
    case "invite": {
      // TODO:
      break
    }
    case "mention": {
      console.log(notification)
      await router.push({ name: "post", query: { uri: notification.reasonSubject } })
      break
    }
    case "reply":
    case "repost":
    case "vote": {
      await router.push({ name: "post", query: { uri: notification.reasonSubject } })
      break
    }
  }
}

async function openProfile (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
}

function formatDate (dateString: string): string {
  return format(new Date(dateString), "MM/dd HH:mm:ss")
}
</script>

<template>
  <div class="notification-list">
    <div
      v-for="notification of state.notifications"
      class="notification"
      tabindex="0"
      :data-reason="props.reason"
      @click="openSubject(notification)"
    >
      <SVGIcon
        class="icon"
        :name="iconMap[props.reason]"
      />
      <button
        class="avatar"
        @click.stop="openProfile(notification.handle)"
      >
        <img
          loading="lazy"
          :src="notification.avatar ?? '/img/void.png'"
        >
      </button>
      <div class="display-name">{{ notification.displayName }}</div>
      <div class="handle">{{ notification.handle }}</div>
      <div class="indexed-at">{{ formatDate(notification.indexedAt) }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification {
  cursor: pointer;
  display: grid;
  grid-template-columns: min-content min-content max-content auto max-content;
  align-items: center;
  grid-gap: 0.5rem;
  overflow: hidden;
  padding: 0.5rem 1rem;
  &:focus, &:hover {
    filter: brightness(1.25);
  }
}

.icon {
  [data-reason="follow"] & {
    fill: rgb(var(--fg-color));
  }
  [data-reason="invite"] & {
    fill: rgb(var(--fg-color));
  }
  [data-reason="mention"] & {
    fill: rgb(var(--fg-color));
  }
  [data-reason="reply"] & {
    fill: rgb(var(--accent-color));
  }
  [data-reason="repost"] & {
    fill: rgb(var(--green));
  }
  [data-reason="vote"] & {
    fill: rgb(var(--pink));
  }
}

.avatar {
  @include avatar-link(2rem);
}

.display-name {
  overflow: hidden;
  white-space: nowrap;
}

.handle {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.indexed-at {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.875rem;
  overflow: hidden;
  white-space: nowrap;
}
</style>
