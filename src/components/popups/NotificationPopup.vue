<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import NotificationList from "@/components/lists/NotificationList.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(name: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  enableRemoteNotificationFilter: ComputedRef<boolean>
  numberByReason: ComputedRef<any>
}>({
  processing: false,
  enableRemoteNotificationFilter: computed((): boolean => {
    return mainState.notificationRemoteFilter.length > 0
  }),
  numberByReason: computed((): any => {
    const results: { [k: string]: number } = {
      all: 0,
      reply: 0,
      quote: 0,
      mention: 0,
      repost: 0,
      like: 0,
      follow: 0,
    }
    mainState.notifications
      .forEach((notificationGroup: TTNotificationGroup) => {
        const numberOfNotifications = notificationGroup.notifications.length
        results.all += numberOfNotifications
        const reason = notificationGroup.reason === "likeGenerator"
          ? "like"
          : notificationGroup.reason === "starterpack-joined"
            ? "follow"
            : notificationGroup.reason
        results[reason] += numberOfNotifications
      })
    return results
  }),
})

const popup = ref()

onMounted(async () => {
  if (!mainState.notificationFetchedFirst) {
    mainState.notificationFetchedFirst = true
    await fetchNotifications("new")
  }
  updateNotificationSeen()
})

onBeforeUnmount(() => {
  updateNotificationSeen()
  updateNotificationIsRead()
  mainState.notificationCount = 0
  emit("updatePageTitle")
})

function close () {
  emit("close")
}

function clipBadge (value: number): string {
  return value > 999 ? "+" : value.toString()
}

async function updateNotificationSeen () {
  if (mainState.notificationCount <= 0) {
    return
  }

  // エラーが頻発するためエラーポップアップは開かない
  await mainState.atp.updateNotificationSeen(mainState.lastFetchNotificationsDate)
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
  state.processing = true
  await mainState.fetchNotifications(CONSTS.LIMIT_OF_FETCH_NOTIFICATIONS, direction)
  state.processing = false
}

async function openRemoteNotificationFilterPopup () {
  Util.blurElement()

  // TODO:
  const filter1 = [...mainState.notificationRemoteFilter].sort()
  if (state.enableRemoteNotificationFilter) {
    mainState.notificationRemoteFilter.splice(0)
  } else {
    mainState.notificationRemoteFilter.push("reply", "mention", "quote")
  }
  const filter2 = [...mainState.notificationRemoteFilter].sort()

  // リモート通知フィルターに変更があれば通知データをリセットして再取得
  if (
    filter1.length !== filter2.length ||
    filter1.some((v, i) => v !== filter2[i])
  ) {
    mainState.notifications.splice(0)
    mainState.notificationCursor = undefined
    mainState.notificationCount = 0
    await fetchNotifications("new")
  }
}

function setLocalNotificationFilter (reason?: TTNotificationReason) {
  Util.blurElement()
  mainState.notificationLocalFilter = reason
  popup.value?.scrollToTop()
}

function scrolledToBottom () {
  fetchNotifications("old")
}
</script>

<template>
  <Popup
    class="notification-popup"
    ref="popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <!-- リモート通知フィルターボタン -->
      <button
        type="button"
        class="button--plane notification-popup__filter-button"
        :data-enable-remote-notification-filter="state.enableRemoteNotificationFilter"
        @click.stop="openRemoteNotificationFilterPopup"
      >
        <SVGIcon :name="state.enableRemoteNotificationFilter ? 'setting' : 'settingOff'" />
      </button>

      <h2>
        <SVGIcon name="bell" />
        <span>{{ $t("notifications") }}</span>
      </h2>
    </template>
    <template #header-after>
      <!-- ローカル通知フィルタータブ -->
      <div class="tab notification-popup__filter-tab">
        <!-- ローカル通知フィルタータブ - すべて -->
        <button
          type="button"
          class="tab__button"
          :data-focused="mainState.notificationLocalFilter == null"
          @click="setLocalNotificationFilter()"
        >
          <SVGIcon name="shimmer" />
          <span
            v-if="state.numberByReason.all > 0"
            class="tab__button__badge"
          >{{ clipBadge(state.numberByReason.all) }}</span>
        </button>

        <!-- ローカル通知フィルタータブ - リプライ -->
        <button
          type="button"
          class="tab__button tab__button--reply"
          :data-focused="mainState.notificationLocalFilter == 'reply'"
          @click="setLocalNotificationFilter('reply')"
        >
          <SVGIcon name="reply" />
          <span
            v-if="state.numberByReason.reply > 0"
            class="tab__button__badge"
          >{{ clipBadge(state.numberByReason.reply) }}</span>
        </button>

        <!-- ローカル通知フィルタータブ - メンション -->
        <button
          type="button"
          class="tab__button tab__button--mention"
          :data-focused="mainState.notificationLocalFilter == 'mention'"
          @click="setLocalNotificationFilter('mention')"
        >
          <SVGIcon name="at" />
          <span
            v-if="state.numberByReason.mention > 0"
            class="tab__button__badge"
          >{{ clipBadge(state.numberByReason.mention) }}</span>
        </button>

        <!-- ローカル通知フィルタータブ - 引用リポスト -->
        <button
          type="button"
          class="tab__button tab__button--quoteRepost"
          :data-focused="mainState.notificationLocalFilter == 'quote'"
          @click="setLocalNotificationFilter('quote')"
        >
          <SVGIcon name="quoteRepost" />
          <span
            v-if="state.numberByReason.quote > 0"
            class="tab__button__badge"
          >{{ clipBadge(state.numberByReason.quote) }}</span>
        </button>

        <!-- ローカル通知フィルタータブ - リポスト -->
        <button
          type="button"
          class="tab__button tab__button--repost"
          :data-focused="mainState.notificationLocalFilter == 'repost'"
          @click="setLocalNotificationFilter('repost')"
        >
          <SVGIcon name="repost" />
          <span
            v-if="state.numberByReason.repost > 0"
            class="tab__button__badge"
          >{{ clipBadge(state.numberByReason.repost) }}</span>
        </button>

        <!-- ローカル通知フィルタータブ - いいね -->
        <button
          type="button"
          class="tab__button tab__button--like"
          :data-focused="mainState.notificationLocalFilter == 'like'"
          @click="setLocalNotificationFilter('like')"
        >
          <SVGIcon name="like" />
          <span
            v-if="state.numberByReason.like > 0"
            class="tab__button__badge"
          >{{ clipBadge(state.numberByReason.like) }}</span>
        </button>

        <!-- ローカル通知フィルタータブ - フォロー -->
        <button
          type="button"
          class="tab__button tab__button--follow"
          :data-focused="mainState.notificationLocalFilter == 'follow'"
          @click="setLocalNotificationFilter('follow')"
        >
          <SVGIcon name="person" />
          <span
            v-if="state.numberByReason.follow > 0"
            class="tab__button__badge"
          >{{ clipBadge(state.numberByReason.follow) }}</span>
        </button>
      </div>

      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchNotifications('new')"
      />
    </template>
    <template #body>
      <div class="notifications-view__main">
        <NotificationList @close="close" />
      </div>
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchNotifications('old')"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.notification-popup {
  &:deep() {
    .popup {
      flex-grow: 1;
    }

    .popup-body {
      flex-grow: 1;
      grid-gap: 0;
      padding: 0;
    }
  }

  // リモート通知フィルターボタン
  &__filter-button {
    font-size: 1.25rem;

    &[data-enable-remote-notification-filter="true"] > .svg-icon {
      --fg-color: var(--notice-color);
    }
  }

  // ローカル通知フィルタータブ
  &__filter-tab {
    & > .tab__button {
      & > .svg-icon {
        font-size: 1.25rem;
        opacity: 0.5;
      }
      &:focus, &:hover,
      &[data-focused="true"] {
        & > .svg-icon {
          opacity: 1.0
        }
      }

      &--reply > .svg-icon,
      &--mention > .svg-icon {
        fill: rgb(var(--post-color));
      }

      &--quoteRepost > .svg-icon,
      &--repost > .svg-icon {
        fill: rgb(var(--share-color));
      }

      &--like > .svg-icon {
        fill: rgb(var(--like-color));
      }
    }
  }
}
</style>
