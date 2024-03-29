<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import AuthorHandle from "@/components/app-parts/AuthorHandle.vue"
import AvatarLink from "@/components/app-parts/AvatarLink.vue"
import ContentFilteringToggle from "@/components/app-parts/ContentFilteringToggle.vue"
import DisplayName from "@/components/app-parts/DisplayName.vue"
import ProfileMenuTicker from "@/components/menu-tickers/ProfileMenuTicker.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import ViewerLabels from "@/components/app-parts/ViewerLabels.vue"

const emit = defineEmits<(name: string) => void>()

const props = defineProps<{
  user: TTUser
  contentWarningDisabled: boolean
  menuDisplay: boolean
  viewerDisplay: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  // ラベル対応
  appliedHarmfulLabels: ComputedRef<Array<TTLabel>>
  hasAppliedHarmfulLabel: ComputedRef<boolean>
  contentFilteringToggleDisplay: boolean
  contentWarningVisibility: ComputedRef<TTContentVisibility>

  profileMenuDisplay: boolean
  profileMenuContainer: ComputedRef<undefined | HTMLElement>
}>({
  // ラベル対応
  appliedHarmfulLabels: computed((): Array<TTLabel> => {
    return mainState.filterLabels(["hide", "warn"], ["alert", "blur", "blur-media"], props.user.labels)
  }),
  hasAppliedHarmfulLabel: computed((): boolean => {
    return state.appliedHarmfulLabels.length > 0
  }),
  contentFilteringToggleDisplay: false,
  contentWarningVisibility: computed((): TTContentVisibility => {
    return mainState.getContentWarningVisibility(props.user.labels)
  }),

  profileMenuDisplay: false,
  profileMenuContainer: computed((): undefined | HTMLElement => {
    return profileMenuTrigger.value?.closest(".popup-body") ?? undefined
  }),
})

const profileMenuTrigger = ref()

onMounted(() => {
  state.contentFilteringToggleDisplay = !state.hasAppliedHarmfulLabel
})

function onActivateLink () {
  emit("link")
}

function openPostMenu () {
  state.profileMenuDisplay = !state.profileMenuDisplay
}

function closePostMenu () {
  state.profileMenuDisplay = false
}

// ラベル対応

function onActivateContentFilteringToggle () {
  state.contentFilteringToggleDisplay = !state.contentFilteringToggleDisplay
}
</script>

<template>
  <RouterLink
    class="user-box"
    :to="{ name: 'profile-feeds', query: { account: user.did } }"
    :data-menu-display="menuDisplay"
    @click="onActivateLink"
  >
    <!-- プロフィールトグル -->
    <ContentFilteringToggle
      v-if="state.hasAppliedHarmfulLabel"
      :labels="state.appliedHarmfulLabels"
      :display="
        state.contentWarningVisibility === 'show' ||
        state.contentFilteringToggleDisplay
      "
      :togglable="!contentWarningDisabled"
      @click.prevent.stop="onActivateContentFilteringToggle"
    />

    <template v-if="
      contentWarningDisabled || (
        !contentWarningDisabled && (
          state.contentWarningVisibility === 'show' ||
          state.contentFilteringToggleDisplay
        )
      )
    ">
      <!-- Viewer ラベル -->
      <ViewerLabels
        v-if="viewerDisplay"
        :viewer="user.viewer"
      />

      <AvatarLink
        :did="user.did"
        :image="user.avatar"
      />
      <DisplayName
        :displayName="user.displayName"
        :anonymizable="true"
      >
        <!-- アカウントラベルアイコン -->
        <SVGIcon
          v-if="state.hasAppliedHarmfulLabel"
          name="contentFiltering"
          class="account-label-icon"
        />
      </DisplayName>
      <AuthorHandle
        :handle="user.handle"
        :anonymizable="true"
      />
      <div class="description">{{ user.description || "&#160;" }}</div>

      <!-- プロフィールメニュートリガー -->
      <button
        v-if="menuDisplay"
        class="menu-button"
        ref="profileMenuTrigger"
        @click.prevent.stop="openPostMenu"
      >
        <SVGIcon name="menu" />

        <!-- プロフィールメニュー -->
        <ProfileMenuTicker
          :isUser="user.handle === mainState.atp.session?.handle"
          :display="state.profileMenuDisplay"
          :user="user"
          :container="state.profileMenuContainer"
          @close="closePostMenu"
        />
      </button>

      <div class="bottom">
        <slot name="bottom" />
      </div>
    </template>
  </RouterLink>
</template>

<style lang="scss" scoped>
.user-box {
  color: rgb(var(--fg-color));
  display: grid;
  grid-gap: 0 0.75em;
  grid-template-columns: min-content auto 1fr auto;
  grid-template-rows: auto auto auto 1fr;
  grid-template-areas:
    "c c c c"
    "v v v v"
    "a n h m"
    "a d d m"
    "b b b b";
  align-items: center;
  &[data-menu-display="false"] {
    grid-template-columns: min-content auto 1fr;
    grid-template-areas:
      "c c c"
      "v v v"
      "a n h"
      "a d d"
      "b b b";
  }
}

.content-filtering-toggle {
  grid-area: c;
  margin: 0.5em 0;
}

.viewer-labels {
  grid-area: v;
  margin-bottom: 0.5em;
}

.avatar-link {
  grid-area: a;
  font-size: 3em;
}

.display-name {
  grid-area: n;
  display: flex;
  align-items: center;
  grid-gap: 0.5em;

  .account-label-icon {
    fill: rgb(var(--notice-color));
    font-size: 0.875em;
  }

  &:deep() > span {
    color: var(--fg-color-075);
    font-size: 0.875em;
  }
}

.author-handle {
  grid-area: h;
}

.description {
  grid-area: d;
  font-size: 0.875em;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-button {
  grid-area: m;
  cursor: pointer;
  margin: 0 -1em 0 -0.5em;
  padding: 0 1em;
  position: relative;
  height: 100%;

  & > .svg-icon {
    fill: var(--fg-color-05);
  }
  &:focus, &:hover {
    --fg-color-0125: var(--fg-color-025);

    & > .svg-icon {
      --fg-color-05: var(--fg-color-075);
    }
  }

  .menu-ticker:deep() {
    & > .menu-ticker--inner {
      top: 3em;
      right: 0.5em;
    }
  }
}

.bottom {
  grid-area: b;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:not(:empty) {
    margin-top: 0.5em;
  }
}
</style>
