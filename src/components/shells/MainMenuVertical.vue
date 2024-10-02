<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  query: ComputedRef<string>
}>({
  query: computed((): string => {
    return mainState.currentSearchTerm
      ? `?text=${mainState.currentSearchTerm}`
      : ""
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
    ".main-menu-vertical__settings-popover-trigger",
    "toRight"
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

function moveToBottom () {
  window.scrollTo({
    left: 0,
    top: document.body.clientHeight,
    behavior: "smooth",
  })
}
</script>

<template>
  <div class="main-menu-vertical">
    <!-- プロフィールボタン -->
    <RouterLink
      class="profile-button"
      :to="{ name: 'profile-feeds', query: { account: mainState.atp.session?.did } }"
      :data-is-focus="
        (
          mainState.currentPath.startsWith('/profile/') &&
          (
            mainState.currentQuery.account === mainState.atp.session?.handle ||
            mainState.currentQuery.account === mainState.atp.session?.did
          )
        ) ||
        mainState.currentPath.startsWith('/profile/edit')
      "
    >
      <LazyImage :src="mainState.userProfile?.avatar" />
      <div class="label">{{ mainState.userProfile?.handle ?? "&nbsp;" }}</div>
    </RouterLink>

    <!-- スクローラー -->
    <div class="main-menu-vertical__scroller">
      <!-- ホームボタン -->
      <RouterLink
        class="link-button"
        to="/home"
      >
        <div class="icon">
          <SVGIcon name="home" />

          <!-- 新着フォロー中フィードバッジ -->
          <div
            v-if="mainState.hasTimelineNewArrival && !mainState.currentSetting.hideNotificationBadge"
            class="timeline-new-arrival-badge"
          />
        </div>
        <div class="label">{{ $t("home") }}</div>
      </RouterLink>

      <!-- 検索ボタン -->
      <RouterLink
        class="link-button"
        :to="`/search/post${state.query}`"
        :data-is-focus="mainState.currentPath.startsWith('/search/')"
      >
        <div class="icon">
          <SVGIcon name="search" />
        </div>
        <div class="label">{{ $t("search") }}</div>
      </RouterLink>

      <!-- 通知ボタン -->
      <button
        class="link-button"
        @click.prevent="openNotificationPopup"
      >
        <div class="icon">
          <SVGIcon name="bell" />

          <!-- 未読通知バッジ -->
          <div
            v-if="mainState.notificationCount > 0 && !mainState.currentSetting.hideNotificationBadge"
            class="unread-badge"
          >{{ mainState.notificationCount }}</div>
        </div>
        <div class="label">{{ $t("notifications") }}</div>
      </button>

      <!-- チャットボタン -->
      <button
        class="link-button"
        @click.prevent="openChatListPopup"
      >
        <div class="icon">
          <SVGIcon name="chat" />

          <!-- 未読チャットバッジ -->
          <div
            v-if="mainState.myChat!.unread > 0 && !mainState.currentSetting.hideNotificationBadge"
            class="unread-badge"
          >{{ mainState.myChat!.unread }}</div>
        </div>
        <div class="label">{{ $t("chat") }}</div>
      </button>

      <!-- 設定ボタン -->
      <button
        class="link-button main-menu-vertical__settings-popover-trigger"
        @click.prevent="openSettingsPopover"
      >
        <div class="icon">
          <SVGIcon name="setting" />
        </div>
        <div class="label">{{ $t("settings") }}</div>
      </button>

      <!-- アカウントポップアップトリガー -->
      <button
        class="link-button"
        @click.prevent="openAccountPopup"
      >
        <div class="icon">
          <SVGIcon name="person" />
        </div>
        <div class="label">{{ $t("myAccounts") }}</div>
      </button>

      <!-- ポスト送信ポップアップトリガー -->
      <button
        class="link-button send-post-button"
        @click.prevent="openSendPostPopup"
      >
        <div class="icon">
          <SVGIcon
            v-if="!mainState.sendPostPopupProcessing"
            name="sendPost"
          />
          <Loader v-else />
        </div>
        <div class="label">{{ $t("sendPost") }}</div>
      </button>

      <!-- スクロールダウンボタン -->
      <button
        class="move-button move-to-bottom-button"
        @click.prevent="moveToBottom"
      >
        <div class="icon">
          <SVGIcon name="cursorDown" />
        </div>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin slimLayout {
  padding: 0 0.5rem 0.75rem;

  .profile-button {
    --size: 2rem;
    --padding: 0.5rem;
    margin-top: 0.5rem;

    &[data-is-focus="true"],
    &:not([data-is-focus]).router-link-active {
      background-color: rgb(var(--accent-color), 0.25);
    }
  }

  .link-button {
    grid-template-columns: min-content;
  }

  .label {
    display: none;
  }
}

.main-menu-vertical {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;

  // タブレットレイアウト
  @include media-tablet-layout() {
    @include slimLayout;
  }

  // フルレイアウト
  @include media-full-layout() {
    overflow: hidden;
    padding: 1rem 1rem 1.25rem;

    // 内部スクロール
    &__scroller {
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: none;
      max-height: 100%;
      @include scroll-bar("transparent");
    }

    .move-to-bottom-button {
      display: none;
    }
  }

  // スクローラー
  &__scroller {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
  }
}

// プロフィールボタン
.profile-button {
  --size: 4.5rem;
  --padding: 1rem;

  display: grid;
  grid-gap: 0.5rem;
  justify-content: center;
  padding: var(--padding);
  &:focus, &:hover {
    & > .label {
      color: rgb(var(--fg-color));
    }
  }
  &[data-is-focus="true"],
  &:not([data-is-focus]).router-link-active {
    & > .label {
      color: rgb(var(--fg-color));
    }
  }

  & > .lazy-image {
    border-radius: var(--border-radius-large);
    font-size: var(--size);
    margin: auto;
    object-fit: cover;
    min-width: var(--size);
    max-width: var(--size);
    min-height: var(--size);
    max-height: var(--size);
    transition: border-radius 125ms ease-out;
  }
  &:hover > .lazy-image {
    border-radius: 1px;
  }

  & > .label {
    color: rgb(var(--fg-color), 0.5);
    font-size: 1.125rem;
    font-weight: bold;
    line-height: 1.25;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 各種ボタン
.link-button {
  border-radius: var(--border-radius-middle);
  cursor: pointer;
  display: grid;
  grid-template-columns: min-content 1fr;
  align-items: center;
  justify-content: center;
  grid-gap: 1rem;
  width: 100%;

  .lazy-image {
    border-radius: var(--border-radius-middle);
    font-size: 2rem;
    margin: 0.5rem;
    object-fit: cover;
    min-width: 2rem;
    max-width: 2rem;
    min-height: 2rem;
    max-height: 2rem;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.5rem;
    position: relative;
    min-width: 2rem;
    min-height: 2rem;

    .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
      font-size: 1.5rem;
    }
  }

  .label {
    color: rgb(var(--fg-color), 0.5);
    font-size: 1.25rem;
    line-height: 1.25;
    overflow: hidden;
    padding-right: 0.5rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
  }

  &:focus, &:hover {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }

    .label {
      color: rgb(var(--fg-color));
    }
  }
  &[data-is-focus="true"],
  &:not([data-is-focus]).router-link-active {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }

    .label {
      color: rgb(var(--fg-color));
      font-weight: bold;
    }
  }

  // ポスト送信ポップアップトリガー
  &.send-post-button {
    .svg-icon {
      fill: rgb(var(--post-color), 0.5);
    }

    .loader {
      font-size: 0.5rem;
    }

    &:focus, &:hover {
      .svg-icon {
        fill: rgb(var(--post-color));
      }
    }
  }
}

// 新着フォロー中フィードバッジ
.timeline-new-arrival-badge {
  background-color: rgb(var(--notice-color));
  border: 1px solid rgb(var(--bg-color));
  border-radius: 100%;
  position: absolute;
  right: 0rem;
  top: 0rem;
  width: 0.625rem;
  height: 0.625rem;
}

// 未読バッジ
.unread-badge {
  background-color: rgb(var(--notice-color));
  border: 1px solid rgb(var(--bg-color));
  border-radius: var(--border-radius-middle);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.125rem 0.25rem;
  position: absolute;
  right: 0rem;
  top: 0rem;
}

// スクロールボタン
.move-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  min-height: 3rem;

  .svg-icon {
    fill: rgb(var(--fg-color), 0.25);
  }
  &:focus , &:hover {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
}
</style>
