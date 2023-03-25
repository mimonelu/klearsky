<script lang="ts" setup>
import { inject, reactive } from "vue"
import { useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

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
  if (state.canBack) router.back()
}

async function openSendPostPopup () {
  blurElement()
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
    <button
      v-if="state.canBack"
      class="move-button"
      @click.prevent="back"
    >
      <div class="icon">
        <SVGIcon name="cursorLeft" />
      </div>
    </button>
    <div
      v-else
      class="small-logo"
    >
      <SVGIcon name="shimmer" />
    </div>
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
    <RouterLink
      class="link-button"
      to="/notifications/reply"
      :data-is-focus="mainState.currentPath.startsWith('/notifications/')"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="bell" />
      </div>
      <div class="label">{{ $t("notifications") }}</div>
    </RouterLink>
    <RouterLink
      class="link-button"
      to="/settings"
      @click.prevent
    >
      <div class="icon">
        <SVGIcon name="setting" />
      </div>
      <div class="label">{{ $t("settings") }}</div>
    </RouterLink>
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
    <button
      class="link-button send-post-button"
      @click.prevent="openSendPostPopup"
    >
      <div class="icon">
        <SVGIcon name="sendPost" />
      </div>
      <div class="label">{{ $t("sendPost") }}</div>
    </button>
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

.link-button {
  border-radius: 1px;
  cursor: pointer;
  display: grid;
  grid-template-columns: min-content 1fr;
  align-items: center;
  justify-content: center;
  grid-gap: 1rem;
  width: 100%;

  .image {
    border-radius: 1px;
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
    min-width: 3rem;
    min-height: 3rem;

    .svg-icon {
      fill: rgba(var(--fg-color), 0.5);
      font-size: 1.5rem;
    }
  }

  .label {
    color: rgba(var(--fg-color), 0.5);
    font-size: 1.25rem;
    overflow: hidden;
    padding-right: 0.25rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
  }

  &.send-post-button {
    .svg-icon {
      fill: rgb(var(--accent-color));
    }
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
}
</style>
