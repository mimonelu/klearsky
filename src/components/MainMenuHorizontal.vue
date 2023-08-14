<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

function openNotificationPopup () {
  Util.blurElement()
  mainState.openNotificationPopup()
}

function openSettingsPopup () {
  Util.blurElement()
  mainState.openSettingsPopup()
}

function openAccountPopup () {
  Util.blurElement()
  mainState.openAccountPopup()
}

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
      :to="{ name: 'profile-feeds', query: { account: mainState.atp.session?.handle } }"
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
        decoding="async"
        :src="mainState.userProfile?.avatar ?? '/img/void-avatar.png'"
        alt=""
      >
    </RouterLink>

    <!-- ホームボタン -->
    <RouterLink
      class="link-button"
      to="/home"
    >
      <SVGIcon name="home" />
    </RouterLink>

    <!-- 検索ボタン -->
    <RouterLink
      class="link-button"
      to="/search/post"
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

      <!-- 通知バッジ -->
      <div
        v-if="mainState.notificationCount > 0"
        class="notification-count"
      >{{ mainState.notificationCount }}</div>
    </button>

    <!-- 設定ボタン -->
    <button
      class="link-button"
      @click.prevent="openSettingsPopup"
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
      <SVGIcon name="sendPost" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.main-menu-horizontal {
  --button-size: 2.125rem;
  background-color: rgb(var(--bg-color), var(--main-area-opacity));
  border-top: 1px solid rgb(var(--fg-color), 0.25);
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: var(--sp-menu-height);
  max-height: var(--sp-menu-height);
}

// 各種ボタン
.link-button {
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0.25rem;
  min-height: calc(var(--sp-menu-size) - 0.5rem - 1px);
  max-height: calc(var(--sp-menu-size) - 0.5rem - 1px);

  .svg-icon {
    fill: rgb(var(--fg-color), 0.75);
    font-size: 1.5rem;
  }

  &:focus, &:hover {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
  &[data-is-focus="true"],
  &:not([data-is-focus]).router-link-active {
    background-color: rgb(var(--accent-color), 0.25);
  }

  &.profile-button {
    .image {
      border-radius: var(--border-radius);
      font-size: var(--button-size);
      object-fit: cover;
      min-width: var(--button-size);
      max-width: var(--button-size);
      min-height: var(--button-size);
      max-height: var(--button-size);
    }
  }

  // ポスト送信ポップアップトリガー
  &.send-post-button {
    .svg-icon {
      fill: rgb(var(--post-color));
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
  right: 0.5rem;
  top: 0.5rem;
}
</style>
