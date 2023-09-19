<script lang="ts" setup>
import { inject } from "vue"
import AuthorHandle from "@/components/AuthorHandle.vue"
import AvatarLink from "@/components/AvatarLink.vue"
import FeedCard from "@/components/FeedCard.vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState

const iconMap: { [reason: string]: string } = {
  follow: "person",
  invite: "mail",
  mention: "at",
  quote: "quoteRepost",
  reply: "reply",
  repost: "repost",
  like: "like",
  likeGenerator: "like",
}

function notificationGroupHasNew (notificationGroup: TTNotificationGroup): boolean {
  return notificationGroup.notifications
    .some((notification: TTNotification) => !notification.isRead)
}

// 通知フォルダーを持つ通知かどうか
function isGroupingReason (reason: string): boolean {
  return reason === "like" ||
    reason === "likeGenerator" ||
    reason === "quote" ||
    reason === "reply" ||
    reason === "repost"
}

// 通知押下時の遷移先
function makeSubjectTo (notification: TTNotification): any {
  switch (notification.reason) {
    case "follow":
    case "invite":
    case "repost":
    case "like": {
      return { name: "profile-feeds", query: { account: notification.did } }
    }
    case "likeGenerator": {
      return { name: "feeds", query: { feed: notification.uri, displayName: notification.displayName } }
    }
    case "mention":
    case "quote":
    case "reply": {
      return { name: "post", query: { uri: notification.uri } }
    }
  }
}
</script>

<template>
  <div class="notification-list">
    <!-- 通知グループ -->
    <div
      v-for="notificationGroup of mainState.notifications"
      :key="notificationGroup.id"
      class="notification-group"
      tabindex="0"
      :data-reason="notificationGroup.reason"
      :data-is-new="notificationGroupHasNew(notificationGroup)"
      :data-has-folder="isGroupingReason(notificationGroup.reason) &&
        notificationGroup.notifications.length >= 2"
    >
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
          <!-- 新着通知内包アイコン -->
          <div
            v-if="notificationGroupHasNew(notificationGroup) &&
              isGroupingReason(notificationGroup.reason) &&
              notificationGroup.notifications.length >= 2"
            class="new"
          >NEW</div>

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
            :data-is-following="notification.following"
            @click="$emit('close')"
          >
            <!-- 新着通知アイコン -->
            <div
              v-if="!notification.isRead"
              class="new"
            >NEW</div>

            <!-- reason アイコン -->
            <SVGIcon
              class="icon icon--reason"
              :name="iconMap[notification.reason]"
            />

            <!-- アバターリンク -->
            <AvatarLink
              :did="notification.did"
              :image="notification.avatar"
              @click.stop="$emit('close')"
            />

            <!-- 表示名 -->
            <div class="display-name">{{ notification.displayName }}</div>

            <!-- ハンドル -->
            <AuthorHandle :handle="notification.handle" />

            <!-- リアクション日時 -->
            <div class="indexed-at">{{ mainState.formatDate(notification.indexedAt) }}</div>

            <!-- 本文 -->
            <div
              v-if="notification.text"
              class="text"
            >{{ notification.text }}</div>
          </RouterLink>
        </template>
      </div>

      <!-- ユーザーポスト -->
      <Post
        v-if="isGroupingReason(notificationGroup.reason) && notificationGroup.post != null"
        position="slim"
        :post="notificationGroup.post"
        @click="$emit('close')"
      />

      <!-- フィードジェネレーター -->
      <FeedCard
        v-if="isGroupingReason(notificationGroup.reason) && notificationGroup.generator != null"
        :generator="notificationGroup.generator"
        :menuDisplay="true"
        :orderButtonDisplay="false"
        :creatorDisplay="false"
        @click="$emit('close')"
        @onActivateMention="$emit('close')"
        @onActivateHashTag="$emit('close')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 通知グループ
.notification-group {
  padding: 1rem;
  &:not(:last-child) {
    border-bottom: 1px solid var(--fg-color-0125);
  }
  &[data-is-new="true"] {
    background-color: var(--accent-color-0125);
  }

  // reason ごとの処理
  &[data-reason="quote"] {
    .text {
      color: rgb(var(--share-color));
    }
  }
  &[data-reason="follow"] {
    .text {
      color: var(--fg-color-075);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // 通知フォルダー開閉ボタンを持つ通知グループの処理
  &[data-has-folder="true"] {
    .notification-folder {
      border: 1px solid var(--fg-color-025);
      border-radius: var(--border-radius);
    }

    .notification {
      padding: 0.25rem 0.75rem;
    }
  }

  // フィードジェネレーター
  & > .feed-card {
    background-color: var(--accent-color-0125);
    border: 1px solid var(--accent-color-025);
    border-radius: var(--border-radius);
    margin-top: 0.5rem;
    &:focus, &:hover {
      border-color: var(--accent-color-05);
    }
  }
}

// 通知フォルダー
.notification-folder {
  display: flex;
  flex-direction: column;
}

// 通知フォルダー開閉ボタン
.folder-button {
  display: flex;
  align-items: center;
  grid-gap: 0.5rem;
  padding: 0.75rem;
  &:focus, &:hover {
    cursor: pointer;
  }

  // 新着通知内包アイコン
  & > .new {
    font-size: 0.875rem;
    margin: -0.375rem 0;
  }

  & > span {
    font-weight: bold;
  }

  & > .icon--cursor {
    fill: rgb(var(--fg-color));
    margin-left: auto;
  }
}

// 通知
.notification {
  display: grid;
  grid-template-columns: min-content min-content auto 1fr max-content;
  align-items: center;
  grid-gap: 0 0.5rem;
  overflow: hidden;
  [data-reason="like"] &,
  [data-reason="likeGenerator"] &,
  [data-reason="repost"] &,
  [data-reason="reply"] &,
  [data-reason="quote"] & {
    padding-bottom: calc(0.5rem + 2px);
  }
  &:last-child:not(:first-child) {
    margin-bottom: 0.25rem;
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

    .indexed-at {
      color: var(--fg-color-075);
    }
  }

  & > .new {
    font-size: 0.75rem;
  }
}

// 新着通知アイコン
.new {
  background-color: rgb(var(--bg-color));
  border: 1px solid rgb(var(--accent-color));
  border-radius: var(--border-radius);
  color: rgb(var(--accent-color));
  font-weight: bold;
  padding: 0.25rem 0.5rem;
}

// reason アイコン
.icon--reason {
  [data-reason="follow"] & {
    fill: rgb(var(--fg-color));
  }
  [data-reason="invite"] & {
    fill: rgb(var(--fg-color));
  }
  [data-reason="mention"] & {
    fill: rgb(var(--post-color));
  }
  [data-reason="quote"] & {
    fill: rgb(var(--share-color));
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
  [data-reason="likeGenerator"] & {
    fill: rgb(var(--post-color));
  }
}

// アバターリンク
.avatar-link {
  font-size: 2rem;
}

// 表示名
.display-name {
  color: var(--fg-color-075);
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
}

// リアクション日時
.indexed-at {
  color: var(--fg-color-05);
  font-size: 0.875rem;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
}

// 本文
.text {
  color: rgb(var(--post-color));
  font-size: 0.875rem;
  grid-column: 3 / 6;
  line-height: var(--line-height);
  word-break: break-all;
}

// ユーザーポスト
.post {
  background-color: var(--fg-color-0125);
  border: 1px solid var(--fg-color-025);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
}
</style>
