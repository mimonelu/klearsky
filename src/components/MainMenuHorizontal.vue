<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const mainState = inject("state") as MainState

async function openSendPostPopup () {
  Util.blurElement()
  await mainState.openSendPostPopup("post")
}
</script>

<template>
  <div class="main-menu-horizontal">
    <!-- プロフィールボタン -->
    <RouterLink
      class="link-button profile-button"
      :to="{ name: 'profile-post', query: { handle: mainState.atp.session?.handle } }"
      :data-is-focus="
        mainState.currentPath.startsWith('/profile/') &&
        mainState.currentQuery.handle === mainState.atp.session?.handle
      "
      @click.prevent
    >
      <img
        class="image"
        loading="lazy"
        :src="mainState.userProfile?.avatar ?? '/img/void-avatar.png'"
        alt=""
      >
    </RouterLink>

    <!-- ホームボタン -->
    <RouterLink
      class="link-button"
      to="/home"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="home" />
      </div>
    </RouterLink>

    <!-- HOTボタン -->
    <RouterLink
      class="link-button hot-button"
      to="/hot"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="fire" />
      </div>
    </RouterLink>

    <!-- 検索ボタン -->
    <RouterLink
      class="link-button"
      to="/search/user"
      :data-is-focus="mainState.currentPath.startsWith('/search/')"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="search" />
      </div>
    </RouterLink>

    <!-- 通知ボタン -->
    <RouterLink
      class="link-button"
      to="/notifications"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="bell" />

        <!-- 通知バッジ -->
        <div
          v-if="mainState.notificationCount > 0"
          class="notification-count"
        >{{ mainState.notificationCount }}</div>
      </div>
    </RouterLink>

    <!-- 設定ボタン -->
    <RouterLink
      class="link-button"
      to="/settings/klearsky"
      :data-is-focus="mainState.currentPath.startsWith('/settings/')"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="setting" />
      </div>
    </RouterLink>

    <!-- アカウントボタン -->
    <RouterLink
      class="link-button"
      to="/accounts"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="person" />
      </div>
    </RouterLink>

    <!-- ポスト送信ポップアップトリガー -->
    <button
      class="link-button send-post-button"
      @click.prevent="openSendPostPopup"
    >
      <div class="icon">
        <SVGIcon name="sendPost" />
      </div>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.main-menu-horizontal {
  background-color: rgb(var(--bg-color));
  border-top: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  align-items: center;
  justify-content: space-around;
  grid-gap: 0.5rem;
}

// 各種ボタン
.link-button {
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;

  .image {
    border-radius: var(--border-radius);
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

  &:focus, &:hover {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
  &[data-is-focus="true"],
  &:not([data-is-focus]).router-link-active {
    background-color: rgba(var(--accent-color), 0.25);
  }

  // HOTボタン
  &.hot-button {
    .svg-icon {
      fill: rgba(var(--hot-color), 0.75);
    }

    &:focus, &:hover {
      .svg-icon {
        fill: rgb(var(--hot-color));
      }
    }
  }

  // ポスト送信ポップアップトリガー
  &.send-post-button {
    background-color: rgb(var(--post-color));
    border: 1px solid rgb(var(--bg-color));
    border-radius: 3rem;
    position: absolute;
    bottom: 4rem;
    right: 1rem;

    .svg-icon {
      fill: rgb(var(--bg-color));
    }

    &:focus, &:hover {
      background-color: rgba(var(--post-color), 0.75);
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
</style>
