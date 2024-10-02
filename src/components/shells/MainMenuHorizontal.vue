<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  query: ComputedRef<string>
  isAtProfilePage: ComputedRef<boolean>
}>({
  query: computed((): string => {
    return mainState.currentSearchTerm
      ? `?text=${mainState.currentSearchTerm}`
      : ""
  }),
  isAtProfilePage: computed((): boolean => {
    return (
      mainState.currentPath.startsWith('/profile/') &&
      (
        mainState.currentQuery.account === mainState.atp.session?.handle ||
        mainState.currentQuery.account === mainState.atp.session?.did
      )
    ) ||
    mainState.currentPath.startsWith('/profile/edit')
  }),
})

function openNotificationPopup () {
  Util.blurElement()
  mainState.openNotificationPopup()
}

function openChatListPopup () {
  Util.blurElement()
  mainState.openChatListPopup()
}

function openSettingsPopover () {
  Util.blurElement()
  mainState.openSettingsPopover(
    ".main-menu-horizontal__settings-popover-trigger",
    "toUp"
  )
}

function openAccountPopup () {
  Util.blurElement()
  mainState.openAccountPopup()
}

async function openSendPostPopup () {
  Util.blurElement()
  await mainState.openSendPostPopup({ type: "post" })
}
</script>

<template>
  <div class="main-menu-horizontal">
    <!-- プロフィールボタン -->
    <RouterLink
      class="link-button profile-button"
      :to="{ name: 'profile-feeds', query: { account: mainState.atp.session?.did } }"
      :data-is-focus="state.isAtProfilePage"
    >
      <LazyImage :src="mainState.userProfile?.avatar" />
    </RouterLink>

    <!-- ホームボタン -->
    <RouterLink
      class="link-button"
      to="/home"
    >
      <SVGIcon name="home" />

      <!-- 新着フォロー中フィードバッジ -->
      <div
        v-if="mainState.hasTimelineNewArrival && !mainState.currentSetting.hideNotificationBadge"
        class="timeline-new-arrival-badge"
      />
    </RouterLink>

    <!-- 検索ボタン -->
    <RouterLink
      class="link-button"
      :to="`/search/post${state.query}`"
      :data-is-focus="mainState.currentPath.startsWith('/search/')"
    >
      <SVGIcon name="search" />
    </RouterLink>

    <!-- 通知ボタン -->
    <button
      class="link-button"
      @click.prevent="openNotificationPopup"
    >
      <SVGIcon name="bell" />

      <!-- 未読通知バッジ -->
      <div
        v-if="mainState.notificationCount > 0 && !mainState.currentSetting.hideNotificationBadge"
        class="unread-badge"
      >{{ mainState.notificationCount }}</div>
    </button>

    <!-- チャットボタン -->
    <button
      class="link-button"
      @click.prevent="openChatListPopup"
    >
      <SVGIcon name="chat" />

      <!-- 未読チャットバッジ -->
      <div
        v-if="mainState.myChat!.unread > 0 && !mainState.currentSetting.hideNotificationBadge"
        class="unread-badge"
      >{{ mainState.myChat!.unread }}</div>
    </button>

    <!-- 設定ボタン -->
    <button
      class="link-button main-menu-horizontal__settings-popover-trigger"
      @click.prevent="openSettingsPopover"
    >
      <SVGIcon name="setting" />
    </button>

    <!-- アカウントポップアップトリガー -->
    <button
      class="link-button"
      @click.prevent="openAccountPopup"
    >
      <SVGIcon name="person" />
    </button>

    <!-- ポスト送信ポップアップトリガー -->
    <button
      class="link-button send-post-button"
      @click.prevent="openSendPostPopup"
    >
      <SVGIcon
        v-if="!mainState.sendPostPopupProcessing"
        name="sendPost"
      />
      <Loader v-else />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.main-menu-horizontal {
  // BORDERED_DESIGN: border-top: 1px solid rgb(var(--fg-color), 0.25);
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  min-height: var(--sp-menu-height);
  max-height: var(--sp-menu-height);
}

// 各種ボタン
.link-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: var(--sp-menu-size);
  max-height: var(--sp-menu-size);

  & > .svg-icon {
    fill: rgb(var(--fg-color), 0.5);
    font-size: 1.5rem;
  }

  &:focus, &:hover {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
  &[data-is-focus="true"],
  &:not([data-is-focus]).router-link-active {
    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }

  &.profile-button {
    --button-size: 2.125rem;

    & > .lazy-image {
      border-radius: var(--border-radius-large);
      font-size: var(--button-size);
      object-fit: cover;
      min-width: var(--button-size);
      max-width: var(--button-size);
      min-height: var(--button-size);
      max-height: var(--button-size);
      transition: border-radius 125ms ease-out;
    }
    &:hover > .lazy-image {
      border-radius: 1px;
    }
  }

  // ポスト送信ポップアップトリガー
  &.send-post-button {
    .svg-icon {
      --fg-color: var(--post-color);
    }

    .loader {
      font-size: 0.5rem;
    }
  }
}

// 新着フォロー中フィードバッジ
.timeline-new-arrival-badge {
  background-color: rgb(var(--notice-color));
  border: 1px solid rgb(var(--bg-color));
  border-radius: 100%;
  position: absolute;
  right: 0.625rem;
  top: 0.625rem;
  width: 0.625rem;
  height: 0.625rem;
}

// 通知バッジ
.unread-badge {
  background-color: rgb(var(--notice-color));
  border: 1px solid rgb(var(--bg-color));
  border-radius: var(--border-radius-middle);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.125rem 0.25rem;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
}
</style>
