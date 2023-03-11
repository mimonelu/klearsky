<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import { useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"
import type { MainState } from "@/@types/app.d"

const router = useRouter()

const mainState: MainState = inject("state") as MainState

const state = reactive<{
  canBack: boolean;
}>({
  canBack: false,
})

const back = () => {
  if (state.canBack) router.back()
}

const openUserProfile = async () => {
  await router.push({ name: "profile", query: { did: mainState.atp.session?.did } })
}

const openSendPostPopup = () => {
  blurElement()
  mainState.openSendPostPopup("post")
}

onMounted(() => {
  state.canBack = history.state.back != null
})
</script>

<template>
  <div class="main-menu">
    <button
      v-if="state.canBack"
      class="link-button--outline"
      @click="back"
    >
      <SVGIcon name="cursorLeft" />
    </button>
    <div
      v-else
      class="small-logo"
    >
      <SVGIcon name="shimmer" />
    </div>
    <button
      class="avatar"
      @click.stop="openUserProfile"
    >
      <img
        loading="lazy"
        :src="mainState.userProfile?.avatar ?? '/img/void.png'"
      >
    </button>
    <RouterLink
      class="link-button"
      to="timeline"
    >
      <SVGIcon name="timeline" />
    </RouterLink>
    <button
      class="link-button--post"
      @click="openSendPostPopup"
    >
      <SVGIcon name="post" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.main-menu {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  padding: 1rem;
}

.small-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  min-width: 3rem;
  min-height: 3rem;

  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.25);
  }
}

.link-button,
.link-button--outline,
.link-button--post {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  min-width: 3rem;
  min-height: 3rem;
}
.link-button {
  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.25);
  }
  &:focus > .svg-icon,
  &:hover > .svg-icon {
    fill: rgba(var(--fg-color), 0.5);
  }
}
.link-button--outline {
  & > .svg-icon {
    fill: transparent;
    stroke: rgba(var(--fg-color), 0.25);
    stroke-width: 2px;
  }
  &:focus > .svg-icon,
  &:hover > .svg-icon {
    stroke: rgba(var(--fg-color), 0.5);
  }
}
.link-button--post {
  & > .svg-icon {
    fill: rgba(var(--accent-color), 1);
  }
  &:focus > .svg-icon,
  &:hover > .svg-icon {
    filter: brightness(1.25);
  }
}

.avatar {
  @include avatar-link(3rem);
}
</style>
