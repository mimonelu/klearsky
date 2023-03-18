<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import { useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const state = reactive<{
  canBack: boolean;
}>({
  canBack: false,
})

const router = useRouter()

onMounted(() => {
  state.canBack = history.state.back != null
})

function back () {
  blurElement()
  if (state.canBack) router.back()
}

async function openUserProfile () {
  blurElement()
  await router.push({
    name: "profile-post",
    query: { handle: mainState.atp.session?.handle },
  })
}

function openSendPostPopup () {
  blurElement()
  mainState.openSendPostPopup("post")
}

async function openSettings () {
  blurElement()
  await router.push({ name: "settings" })
}
</script>

<template>
  <div class="main-menu">
    <button
      v-if="state.canBack"
      class="link-button--outline"
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
    <button
      class="link-button"
      @click.prevent="openUserProfile"
    >
      <img
        class="image"
        loading="lazy"
        :src="mainState.userProfile?.avatar ?? '/img/void-avatar.png'"
      >
      <div class="label">{{ mainState.userProfile?.handle }}</div>
    </button>
    <RouterLink
      class="link-button"
      to="timeline"
      @click.prevent="blurElement"
    >
      <div class="icon">
        <SVGIcon name="home" />
      </div>
      <div class="label">{{ $t("home") }}</div>
    </RouterLink>
    <RouterLink
      class="link-button"
      to="reply-notifications"
      @click.prevent="blurElement"
    >
      <div class="icon">
        <SVGIcon name="bell" />
      </div>
      <div class="label">{{ $t("notifications") }}</div>
    </RouterLink>
    <button
      class="link-button"
      @click.prevent="openSettings"
    >
      <div class="icon">
        <SVGIcon name="setting" />
      </div>
      <div class="label">{{ $t("settings") }}</div>
    </button>
    <button
      class="link-button send-post-button"
      @click.prevent="openSendPostPopup"
    >
      <div class="icon">
        <SVGIcon name="sendPost" />
      </div>
      <div class="label">{{ $t("sendPost") }}</div>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.main-menu {
  display: flex;
  flex-direction: column;
  padding: 1rem;

  @media (max-width: $max-width-with-scrollbar) {
    .link-button,
    .link-button--outline {
      grid-template-columns: min-content;
    }

    .label {
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
  min-height: calc(3rem + 1rem);

  .svg-icon {
    fill: rgba(var(--fg-color), 0.5);
  }
}

.link-button,
.link-button--outline {
  cursor: pointer;
  display: grid;
  grid-template-columns: min-content 1fr;
  align-items: center;
  justify-content: center;
  grid-gap: 1rem;
  padding: 0.5rem 0;
  width: 100%;
  &:focus, &:hover {
    .label {
      color: rgb(var(--fg-color));
    }
  }

  .image {
    border-radius: 1px;
    object-fit: cover;
    min-width: 3rem;
    max-width: 3rem;
    min-height: 3rem;
    max-height: 3rem;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 3rem;
    min-height: 3rem;

    .svg-icon {
      font-size: 1.75rem;
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
}
.link-button {
  .svg-icon {
    fill: rgba(var(--fg-color), 0.5);
  }
  &:focus, &:hover {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
}
.link-button--outline {
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
.send-post-button {
  .svg-icon {
    fill: rgb(var(--accent-color));
  }
}
</style>
