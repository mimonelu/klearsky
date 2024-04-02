<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import NotificationList from "@/components/list/NotificationList.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(name: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  total: ComputedRef<number>
}>({
  processing: false,
  total: computed((): number => {
    let result = 0
    mainState.notifications
      .forEach((notificationGroup: TTNotificationGroup) => {
        result += notificationGroup.notifications.length
      })
    return result
  }),
})

const popup = ref()

onBeforeUnmount(() => {
  updateNotificationSeen()
  updateNotificationIsRead()
  mainState.notificationCount = 0
  emit("updatePageTitle")
})

onMounted(async () => {
  if (!mainState.notificationFetchedFirst) {
    mainState.notificationFetchedFirst = true
    await fetchNotifications("new")
  }
  updateNotificationSeen()
})

function close () {
  emit("close")
}

async function updateNotificationSeen () {
  if (mainState.notificationCount <= 0) return
  await mainState.atp.updateNotificationSeen()
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

function setReasonFilter (reason?: TTNotificationReason) {
  Util.blurElement()
  mainState.notificationReasonFilter = reason
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
      <h2>
        <SVGIcon name="bell" />
        <span>{{ $t("notifications") }} ({{ state.total }})</span>
      </h2>
    </template>
    <template #header-after>
      <!-- 通知フィルタータブ -->
      <div class="tab notification-popup__filter-tab">
        <!-- 通知フィルタータブ - すべて -->
        <button
          type="button"
          class="tab__button"
          :data-focused="mainState.notificationReasonFilter == null"
          @click="setReasonFilter()"
        >
          <span>ALL</span>
        </button>

        <!-- 通知フィルタータブ - リプライ -->
        <button
          type="button"
          class="tab__button tab__button--reply"
          :data-focused="mainState.notificationReasonFilter == 'reply'"
          @click="setReasonFilter('reply')"
        >
          <SVGIcon name="reply" />
        </button>

        <!-- 通知フィルタータブ - メンション -->
        <button
          type="button"
          class="tab__button tab__button--mention"
          :data-focused="mainState.notificationReasonFilter == 'mention'"
          @click="setReasonFilter('mention')"
        >
          <SVGIcon name="at" />
        </button>

        <!-- 通知フィルタータブ - 引用リポスト -->
        <button
          type="button"
          class="tab__button tab__button--quoteRepost"
          :data-focused="mainState.notificationReasonFilter == 'quote'"
          @click="setReasonFilter('quote')"
        >
          <SVGIcon name="quoteRepost" />
        </button>

        <!-- 通知フィルタータブ - リポスト -->
        <button
          type="button"
          class="tab__button tab__button--repost"
          :data-focused="mainState.notificationReasonFilter == 'repost'"
          @click="setReasonFilter('repost')"
        >
          <SVGIcon name="repost" />
        </button>

        <!-- 通知フィルタータブ - いいね -->
        <button
          type="button"
          class="tab__button tab__button--like"
          :data-focused="mainState.notificationReasonFilter == 'like'"
          @click="setReasonFilter('like')"
        >
          <SVGIcon name="like" />
        </button>

        <!-- 通知フィルタータブ - フォロー -->
        <button
          type="button"
          class="tab__button tab__button--follow"
          :data-focused="mainState.notificationReasonFilter == 'follow'"
          @click="setReasonFilter('follow')"
        >
          <SVGIcon name="person" />
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
        <NotificationList
          :reason-filter="mainState.notificationReasonFilter"
          @close="close"
        />
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
      height: 100%;
    }

    .popup-body {
      flex-grow: 1;
      grid-gap: 0;
      padding: 0;
    }
  }

  // 通知フィルタータブ
  &__filter-tab {
    & > .tab__button {
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
