<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import AvatarLink from "@/components/AvatarLink.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const mainState = inject("state") as MainState

const router = useRouter()

const iconMap: { [reason: string]: string } = {
  follow: "person",
  invite: "mail",
  mention: "at",
  quote: "post", // TODO:
  reply: "post",
  repost: "repost",
  like: "heart",
}

async function openSubject (notification: TTNotification) {
  Util.blurElement()
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
    case "quote":
    case "reply":
      await router.push({ name: "post", query: { postUri: notification.uri } })
      break
    case "repost":
    case "like": {
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
      :key="notification.cid"
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
      <AvatarLink
        :handle="notification.handle"
        :image="notification.avatar"
        @click.stop
      />
      <div class="display-name">{{ notification.displayName }}</div>
      <div class="handle">{{ notification.handle }}</div>
      <div class="indexed-at">{{ Util.dateLabel(
        notification.indexedAt,
        mainState.currentSetting.language
      ) }}</div>
      <div
        v-if="notification.text"
        class="reply-text"
      >{{ notification.text }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification {
  display: grid;
  grid-template-columns: min-content min-content auto 1fr max-content;
  align-items: center;
  grid-gap: 0 0.5rem;
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
  [data-reason="quote"] & {
    fill: rgb(var(--post-color));
  }
  [data-reason="reply"] & {
    fill: rgb(var(--post-color));
  }
  [data-reason="repost"] & {
    fill: rgb(var(--share-color));
  }
  [data-reason="like"] & {
    fill: rgb(var(--like-color));
  }
}

.avatar-link {
  font-size: 2rem;
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

.reply-text {
  color: rgb(var(--post-color));
  font-size: 0.875rem;
  grid-column: 3 / 6;
  line-height: 1.5;
  word-break: break-all;
}
</style>
