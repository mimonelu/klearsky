<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

function openNotificationPopup () {
  Util.blurElement()
  mainState.openNotificationPopup()
}

async function openSendPostPopup () {
  Util.blurElement()
  await mainState.openSendPostPopup("post")
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
    <!-- スモールロゴ -->
    <div class="small-logo">
      <SVGIcon name="shimmer" />
    </div>

    <!-- プロフィールボタン -->
    <RouterLink
      class="link-button"
      :to="{ name: 'profile-post', query: { account: mainState.atp.session?.handle } }"
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
      <img
        class="image"
        loading="lazy"
        :src="mainState.userProfile?.avatar ?? '/img/void-avatar.png'"
        alt=""
      >
      <div class="label">{{ mainState.userProfile?.handle }}</div>
    </RouterLink>

    <!-- ホームボタン -->
    <RouterLink
      class="link-button"
      to="/home"
    >
      <div class="icon">
        <SVGIcon name="home" />
      </div>
      <div class="label">{{ $t("home") }}</div>
    </RouterLink>

    <!-- カスタムフィードボタン -->
    <RouterLink
      class="link-button"
      to="/feeds/my"
      :data-is-focus="mainState.currentPath.startsWith('/feeds/')"
    >
      <div class="icon">
        <SVGIcon name="rss" />
      </div>
      <div class="label">{{ $t("customFeeds") }}</div>
    </RouterLink>

    <!-- 検索ボタン -->
    <RouterLink
      class="link-button"
      to="/search/suggestion"
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

        <!-- 通知バッジ -->
        <div
          v-if="mainState.notificationCount > 0"
          class="notification-count"
        >{{ mainState.notificationCount }}</div>
      </div>
      <div class="label">{{ $t("notifications") }}</div>
    </button>

    <!-- 設定ボタン -->
    <RouterLink
      class="link-button"
      to="/settings/klearsky"
      :data-is-focus="mainState.currentPath.startsWith('/settings/')"
    >
      <div class="icon">
        <SVGIcon name="setting" />
      </div>
      <div class="label">{{ $t("settings") }}</div>
    </RouterLink>

    <!-- ポスト送信ポップアップトリガー -->
    <button
      class="link-button send-post-button"
      @click.prevent="openSendPostPopup"
    >
      <div class="icon">
        <SVGIcon name="sendPost" />
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
</template>

<style lang="scss" scoped>
@mixin slimLayout {
  padding: 0 0.5rem 0.75rem;

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

  // スリムレイアウト
  @media (max-width: $max-width-with-scrollbar) {
    @include slimLayout;
  }
  .main-view[data-layout="slim"] &,
  .main-view[data-layout="slimLeft"] &,
  .main-view[data-layout="slimRight"] & {
    @include slimLayout;
  }

  // フルレイアウト
  @media not all and (max-width: $max-width-with-scrollbar) {
    padding: 0 1rem 1.25rem;

    .move-to-bottom-button {
      display: none;
    }
  }
}

// スモールロゴ
.small-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  min-width: 3rem;
  min-height: 3rem;

  .svg-icon {
    fill: rgba(var(--fg-color), 0.5);
  }
}

// 各種ボタン
.link-button {
  border-radius: var(--border-radius);
  cursor: pointer;
  display: grid;
  grid-template-columns: min-content 1fr;
  align-items: center;
  justify-content: center;
  grid-gap: 1rem;
  width: 100%;

  .image {
    border-radius: var(--border-radius);
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
      fill: rgba(var(--fg-color), 0.75);
      font-size: 1.5rem;
    }
  }

  .label {
    color: rgba(var(--fg-color), 0.75);
    font-size: 1.25rem;
    font-weight: bold;
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
    background-color: rgba(var(--accent-color), 0.25);
  }

  // ポスト送信ポップアップトリガー
  &.send-post-button {
    .svg-icon {
      fill: rgba(var(--post-color), 0.75);
    }

    .label {
      color: rgba(var(--post-color), 0.75);
    }

    &:focus, &:hover {
      .svg-icon {
        fill: rgb(var(--post-color));
      }

      .label {
        color: rgb(var(--post-color));
      }
    }
  }
}

// 通知バッジ
.notification-count {
  background-color: rgb(var(--notice-color));
  border: 1px solid rgb(var(--bg-color));
  border-radius: var(--border-radius);
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
    fill: rgba(var(--fg-color), 0.25);
  }
  &:focus , &:hover {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
}
</style>
