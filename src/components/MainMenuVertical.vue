<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

async function refreshSession () {
  if (!await mainState.openConfirmationPopup(
    $t("refreshSession"),
    $t("refreshSessionDescription")
  )) return
  mainState.processing = true
  if (!await mainState.atp.refreshSession())
    mainState.openErrorPopup("errorApiFailed", "SubMenu/refreshSession")
  else
    // セッションの同期
    mainState.broadcastChannel.postMessage({
      type: "refreshSession",
      data: JSON.parse(JSON.stringify(mainState.atp.session)),
    })
  mainState.processing = false
}

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
      <div class="label">{{ mainState.userProfile?.handle }}</div>
    </RouterLink>

    <!-- ショートカットプルダウン -->
    <div
      class="pulldown-button"
      tabindex="0"
    >
      <span>{{ $t("shortcuts") }}</span>
      <SVGIcon name="cursorDown" />
      <menu>
        <!-- コンテンツ言語選択ポップアップトリガー -->
        <a @click.prevent="() => { Util.blurElement(); mainState.openContentLanguagesPopup() }">
          <SVGIcon name="translate" />
          <span>{{ $t("contentLanguages") }}</span>
        </a>

        <!-- ポスト言語選択ポップアップトリガー -->
        <a @click.prevent="() => { Util.blurElement(); mainState.openPostLanguagesPopup() }">
          <SVGIcon name="translate" />
          <span>{{ $t("postLanguages") }}</span>
        </a>

        <!-- マイフィードポップアップトリガー -->
        <a @click.prevent="() => { Util.blurElement(); mainState.openMyFeedsPopup() }">
          <SVGIcon name="feed" />
          <span>{{ $t("myFeeds") }}</span>
        </a>

        <hr />

        <!-- コンテンツフィルタリングポップアップトリガー -->
        <a @click.prevent="() => { Util.blurElement(); mainState.openContentFilteringPopup() }">
          <SVGIcon name="alert" />
          <span>{{ $t("contentFiltering") }}</span>
        </a>

        <!-- ミュート中のユーザーポップアップトリガー -->
        <a @click.prevent="() => { Util.blurElement(); mainState.openMutingUsersPopup() }">
          <SVGIcon name="volumeOff" />
          <span>{{ $t("mutingUsers") }}</span>
        </a>

        <!-- ブロック中のユーザーポップアップトリガー -->
        <a @click.prevent="() => { Util.blurElement(); mainState.openBlockingUsersPopup() }">
          <SVGIcon name="personOff" />
          <span>{{ $t("blockingUsers") }}</span>
        </a>

        <!-- ワードミュートポップアップトリガー -->
        <a @click.prevent="() => { Util.blurElement(); mainState.openWordMutePopup() }">
          <SVGIcon name="alphabeticalOff" />
          <span>{{ $t("wordMute") }}</span>
        </a>

        <hr />

        <!-- 招待コード確認ポップアップトリガー -->
        <a
          v-if="mainState.numberOfAvailableInviteCodes > 0"
          @click.prevent="() => { Util.blurElement(); mainState.openInviteCodesPopup() }"
        >
          <SVGIcon name="inviteCode" />
          <span>{{ mainState.numberOfAvailableInviteCodes }} {{ $t("inviteCodes") }}</span>
        </a>

        <!-- セッション更新トリガー -->
        <a @click.prevent="() => { Util.blurElement(); refreshSession() }">
          <SVGIcon name="refresh" />
          <span>{{ $t("refreshSession") }}</span>
        </a>
      </menu>
    </div>

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

    <!-- 検索ボタン -->
    <RouterLink
      class="link-button"
      to="/search/post"
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
    <button
      class="link-button"
      @click.prevent="openSettingsPopup"
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

  // ショートカットプルダウン
  .pulldown-button {
    display: none;
  }

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
    padding: 1rem 1rem 1.25rem;

    .move-to-bottom-button {
      display: none;
    }
  }
}

// ショートカットプルダウン
.pulldown-button {
  margin-bottom: 1rem;

  .svg-icon--feed {
    --bg-color: var(--accent-color);
  }
  .svg-icon--alphabeticalOff,
  .svg-icon--alert,
  .svg-icon--volumeOff,
  .svg-icon--personOff {
    --bg-color: var(--notice-color);
  }
}

// プロフィールボタン
.profile-button {
  --size: 4.5rem;
  --padding: 1rem;
  --color: var(--fg-color);
  --alpha: 0.75;
  border-radius: var(--border-radius);
  display: grid;
  grid-gap: 0.5rem;
  overflow: hidden;
  padding: var(--padding);
  &:focus, &:hover {
    --alpha: 1.0;
  }
  &[data-is-focus="true"],
  &:not([data-is-focus]).router-link-active {
    --color: var(--accent-color);
  }

  & > .image {
    border-radius: var(--border-radius);
    font-size: var(--size);
    margin: auto;
    object-fit: cover;
    min-width: var(--size);
    max-width: var(--size);
    min-height: var(--size);
    max-height: var(--size);
  }

  & > .label {
    color: rgb(var(--color), var(--alpha));
    font-size: 1.25rem;
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
      fill: rgb(var(--fg-color), 0.75);
      font-size: 1.5rem;
    }
  }

  .label {
    color: rgb(var(--fg-color), 0.75);
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
    background-color: rgb(var(--accent-color), 0.25);
  }

  // ポスト送信ポップアップトリガー
  &.send-post-button {
    .svg-icon {
      fill: rgb(var(--post-color), 0.75);
    }

    .label {
      color: rgb(var(--post-color), 0.75);
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
    fill: rgb(var(--fg-color), 0.25);
  }
  &:focus , &:hover {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
}
</style>
