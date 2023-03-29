<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import dateLabel from "@/composables/date-label"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const router = useRouter()

const iconMap: { [reason: string]: string } = {
  follow: "person",
  invite: "mail",
  mention: "at",
  reply: "post",
  repost: "repost",
  vote: "heart",
}

async function openSubject (notification: TTNotification) {
  blurElement()
  switch (notification.reason) {
    case "follow": {
      await router.push({ name: "profile-post", query: { handle: notification.handle } })
      break
    }
    case "invite": {
      // TODO:
      break
    }
    case "mention": {
      await router.push({ name: "post", query: { postUri: notification.reasonSubject } })
      break
    }
    case "reply":
    case "repost":
    case "vote": {
      await router.push({ name: "post", query: { postUri: notification.reasonSubject } })
      break
    }
  }
}
</script>

<template>
  <div class="notification-list">
    <div
      v-for="notification, index of mainState.notifications"
      class="notification"
      tabindex="0"
      :data-reason="notification.reason"
      :data-is-new="mainState.notificationCount >= index + 1"
      @click="openSubject(notification)"
    >
      <SVGIcon
        class="icon"
        :name="iconMap[notification.reason]"
      />
      <RouterLink
        class="avatar"
        :to="{ path: '/profile/post', query: { handle: notification.handle } }"
        @click.prevent.stop
      >
        <img
          loading="lazy"
          :src="notification.avatar ?? '/img/void-avatar.png'"
        >
      </RouterLink>
      <div class="display-name">{{ notification.displayName }}</div>
      <div class="handle">{{ notification.handle }}</div>
      <div class="indexed-at">{{ dateLabel(
        notification.indexedAt,
        mainState.currentSetting.language
      ) }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification {
  display: grid;
  grid-template-columns: min-content min-content auto 1fr max-content;
  align-items: center;
  grid-gap: 0.5rem;
  overflow: hidden;
  padding: 0.5rem 1rem;
  &[data-is-new="true"] {
    background-color: rgba(var(--like-color), 0.125);
  }
  &:focus, &:hover {
    background-color: rgba(var(--accent-color), 0.125);
    cursor: pointer;
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
    fill: rgb(var(--share-color));
  }
  [data-reason="vote"] & {
    fill: rgb(var(--like-color));
  }
}

.avatar {
  @include avatar-link(2rem);
}

.display-name {
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
}

.handle {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.875rem;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.indexed-at {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.875rem;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
}
</style>
