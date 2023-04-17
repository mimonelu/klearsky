<script lang="ts" setup>
import { inject, reactive } from "vue"
import { useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const mainState = inject("state") as MainState

const state = reactive<{
  canBack: boolean;
}>({
  canBack: history.state.back != null,
})

const router = useRouter()

router.afterEach(() => {
  state.canBack = history.state.back != null
})

function back () {
  Util.blurElement()
  if (state.canBack) router.back()
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
  <div class="main-menu">
    <!-- バックボタン -->
    <button
      v-if="state.canBack"
      class="move-button"
      @click.prevent="back"
    >
      <div class="icon">
        <SVGIcon name="cursorLeft" />
      </div>
    </button>

    <!-- スモールロゴ -->
    <div
      v-else
      class="small-logo"
    >
      <SVGIcon name="shimmer" />
    </div>

    <!-- プロフィールボタン -->
    <RouterLink
      class="link-button"
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
      >
      <div class="label">{{ mainState.userProfile?.handle }}</div>
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
      <div class="label">{{ $t("home") }}</div>
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
      <div class="label">{{ $t("hot") }}</div>
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
      <div class="label">{{ $t("search") }}</div>
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
      <div class="label">{{ $t("notifications") }}</div>
    </RouterLink>

    <!-- 設定ボタン -->
    <RouterLink
      class="link-button"
      to="/settings/klearsky"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="setting" />
      </div>
      <div class="label">{{ $t("settings") }}</div>
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
      <div class="label">{{ $t("accounts") }}</div>
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
.main-menu {
  display: flex;
  flex-direction: column;
  grid-gap: 0.25rem;

  @media (max-width: $max-width-with-scrollbar) {
    padding: 0.75rem 0.5rem;

    .link-button {
      grid-template-columns: min-content;
    }

    .label {
      display: none;
    }
  }
  @media not all and (max-width: $max-width-with-scrollbar) {
    padding: 1.25rem 1rem;

    .move-to-bottom-button {
      display: none;
    }
  }
}

// バックボタン
.move-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  min-height: 3rem;

  .svg-icon {
    fill: transparent;
    stroke: rgba(var(--fg-color), 0.25);
    stroke-width: 2px;
  }
  &:focus , &:hover {
    .svg-icon {
      stroke: rgb(var(--fg-color));
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
    line-height: 1.25;
    overflow: hidden;
    padding-right: 0.25rem;
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
    background-color: rgba(var(--accent-color), 0.125);
  }

  // HOTボタン
  &.hot-button {
    .icon {
      background-color: rgba(var(--fg-color), 0.75);
      border-radius: 1rem;
    }

    .svg-icon {
      fill: rgba(var(--hot-color), 0.75);
    }

    &:focus, &:hover {
      .icon {
        background-color: rgb(var(--fg-color));
      }

      .svg-icon {
        fill: rgb(var(--hot-color));
      }
    }
  }

  // ポスト送信ポップアップトリガー
  &.send-post-button {
    .svg-icon {
      fill: rgba(var(--post-color), 0.75);
    }

    .label {
      color: rgba(var(--post-color), 0.75);
      font-weight: bold;
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
</style>
