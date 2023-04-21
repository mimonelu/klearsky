<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import AsyncPost from "@/components/AsyncPost.vue"
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

function isGroupingReason (reason: string): boolean {
  return reason === "like" ||
    reason === "quote" ||
    reason === "reply" ||
    reason === "repost"
}

async function openSubject (notificationGroup: TTNotificationGroup) {
  Util.blurElement()
  switch (notificationGroup.reason) {
    case "follow": {
      await router.push({ name: "profile-post", query: { handle: notificationGroup.reasonSubject } })
      break
    }
    case "invite": {
      // TODO:
      break
    }
    case "mention": {
      await router.push({ name: "post", query: { postUri: notificationGroup.reasonSubject } })
      break
    }
    case "quote":
    case "reply":
      await router.push({ name: "post", query: { postUri: notificationGroup.reasonSubject } })
      break
    case "repost":
    case "like": {
      await router.push({ name: "post", query: { postUri: notificationGroup.reasonSubject } })
      break
    }
  }
}

function makeSubjectTo (notification: TTNotification): any {
  Util.blurElement()
  switch (notification.reason) {
    case "follow":
    case "invite":
    case "repost":
    case "like": {
      return { name: "profile-post", query: { handle: notification.handle } }
    }
    case "mention":
    case "quote":
    case "reply": {
      return { name: "post", query: { postUri: notification.uri } }
    }
  }
}
</script>

<template>
  <div class="notification-list">
    <div
      v-for="notificationGroup, index of mainState.notifications"
      :key="index"
      class="notification-group"
      tabindex="0"
      :data-reason="notificationGroup.reason"
      :data-has-folder="isGroupingReason(notificationGroup.reason) &&
        notificationGroup.notifications.length >= 2"
    >
      <!-- ユーザーポスト -->
      <RouterLink :to="{ name: 'post', query: { postUri: notificationGroup.reasonSubject } }">
        <AsyncPost
          v-if="isGroupingReason(notificationGroup.reason)"
          :uri="notificationGroup.reasonSubject as string"
        />
      </RouterLink>

      <!-- 通知フォルダー -->
      <div class="notification-folder">
        <!-- 通知フォルダー開閉ボタン -->
        <button
          v-if="isGroupingReason(notificationGroup.reason) &&
            notificationGroup.notifications.length >= 2"
          class="folder-button"
          :data-folding="notificationGroup.__folding"
          @click.prevent.stop="notificationGroup.__folding = !notificationGroup.__folding"
        >
          <SVGIcon
            class="icon icon--reason"
            :name="iconMap[notificationGroup.reason]"
          />
          <span>+ {{ notificationGroup.notifications.length }}</span>
          <SVGIcon
            class="icon icon--cursor"
            :name="notificationGroup.__folding ? 'cursorDown' : 'cursorUp'"
          />
        </button>

        <template v-if="
          !isGroupingReason(notificationGroup.reason) ||
          (
            notificationGroup.notifications.length === 1 ||
            !notificationGroup.__folding
          )">

          <!-- 通知 -->
          <RouterLink
            v-for="notification of notificationGroup.notifications"
            :key="notification.cid"
            :to="makeSubjectTo(notification)"
            class="notification"
            :data-is-new="!notification.isRead"
          >
            <div
              v-if="!notification.isRead"
              class="new"
            >NEW</div>
            <SVGIcon
              class="icon icon--reason"
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
              class="text"
            >{{ notification.text }}</div>
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification-group {
  border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  padding: 1rem;
  &[data-reason="reply"] {
    background-color: rgba(var(--post-color), 0.125);
  }
  &[data-reason="like"] {
    background-color: rgba(var(--like-color), 0.125);
  }
  &[data-reason="repost"] {
    background-color: rgba(var(--share-color), 0.125);
  }
  &[data-reason="follow"] {
    padding: 0.5rem 1rem;
    
    .text {
      color: rgba(var(--fg-color), 0.75);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &[data-has-folder="true"] {
    .notification-folder {
      border: 1px solid rgba(var(--fg-color), 0.25);
      border-radius: var(--border-radius);
    }

    .notification {
      padding: 0.25rem 0.75rem;
    }
  }
}

.async-post {
  background-color: rgba(var(--fg-color), 0.125);
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
}

.notification-folder {
  display: flex;
  flex-direction: column;
}

.folder-button {
  background-color: rgba(var(--fg-color), 0.25);
  display: flex;
  align-items: center;
  grid-gap: 0.5rem;
  padding: 0.75rem;
  &:focus, &:hover {
    cursor: pointer;
  }

  & > span {
    font-weight: bold;
  }

  & > .icon--cursor {
    fill: transparent;
    margin-left: auto;
    stroke: rgb(var(--fg-color));
  }
}

.notification {
  display: grid;
  grid-template-columns: min-content min-content auto 1fr max-content;
  align-items: center;
  grid-gap: 0 0.5rem;
  overflow: hidden;
  &:nth-child(2):not(:last-child) {
    margin-top: 0.75rem;
  }
  &:last-child:not(:first-child) {
    margin-bottom: 0.75rem;
  }
  &[data-is-new="true"] {
    grid-template-columns: min-content min-content min-content auto 1fr max-content;

    .text {
      grid-column: 4 / 7;
    }
  }
  &:focus, &:hover {
    cursor: pointer;

    .display-name {
      color: rgb(var(--fg-color));
    }

    .handle,
    .indexed-at {
      color: rgba(var(--fg-color), 0.75);
    }
  }
}

.new {
  color: rgb(var(--accent-color));
  font-size: 0.75rem;
  font-weight: bold;
}

.icon--reason {
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
  color: rgba(var(--fg-color), 0.75);
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
}

.handle {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.75rem;
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

.text {
  color: rgb(var(--post-color));
  font-size: 0.875rem;
  grid-column: 3 / 6;
  line-height: 1.5;
  word-break: break-all;
}
</style>
