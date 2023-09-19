<script lang="ts" setup>
import { computed, inject, reactive, ref, type ComputedRef } from "vue"
import AuthorHandle from "@/components/AuthorHandle.vue"
import AvatarLink from "@/components/AvatarLink.vue"
import ContentWarning from "@/components/ContentWarning.vue"
import ProfileMenuTicker from "@/components/ProfileMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<(name: string) => void>()

const props = defineProps<{
  user: TTUser
  contentWarningDisabled: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  // ラベル対応
  contentWarningForceDisplay: boolean
  contentWarningDisplay: ComputedRef<boolean>
  contentWarningVisibility: ComputedRef<TTContentVisibility>

  profileMenuDisplay: boolean
  profileMenuContainer: ComputedRef<undefined | HTMLElement>
}>({
  // ラベル対応
  contentWarningForceDisplay: false,
  contentWarningDisplay: computed((): boolean => {
    return state.contentWarningVisibility === 'show' ||
           ((state.contentWarningVisibility === 'always-warn' || state.contentWarningVisibility === 'warn') && state.contentWarningForceDisplay)
  }),
  contentWarningVisibility: computed((): TTContentVisibility => {
    return mainState.getContentWarningVisibility(
      props.user.labels,
      undefined
    )
  }),

  profileMenuDisplay: false,
  profileMenuContainer: computed((): undefined | HTMLElement => {
    return profileMenuTrigger.value?.closest(".popup-body") ?? undefined
  }),
})

const profileMenuTrigger = ref()

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

function showWarningContent () {
  state.contentWarningForceDisplay = true
}

function hideWarningContent () {
  state.contentWarningForceDisplay = false
}
</script>

<template>
  <RouterLink
    class="user-box"
    :to="{ name: 'profile-feeds', query: { account: user.did } }"
    :data-is-following="user.viewer.following != null"
    :data-content-warning-disabled="contentWarningDisabled"
    :data-content-warning-visibility="state.contentWarningVisibility"
    @click="onActivateLink"
  >
    <!-- ラベル対応 -->
    <ContentWarning
      v-if="!contentWarningDisabled"
      :display="state.contentWarningForceDisplay"
      :authorLabels="user.labels"
      @show="showWarningContent"
      @hide="hideWarningContent"
    />

    <!-- プロフィールラベル -->
    <div
      v-if="(contentWarningDisabled || (!contentWarningDisabled && state.contentWarningDisplay)) && (user.labels?.length ?? 0) > 0"
      class="textlabel--alert"
    >
      <div class="textlabel__text">
        <SVGIcon name="contentFiltering" />{{ $t("profileLabel") }}
      </div>
      <div
        v-for="label of user.labels"
        :key="label.val"
        class="textlabel__item"
      >{{ $t(label.val) }}</div>
    </div>

    <template v-if="contentWarningDisabled || (!contentWarningDisabled && state.contentWarningDisplay)">
      <AvatarLink
        :did="user.did"
        :image="user.avatar"
        :labels="user.labels"
      />
      <div class="display-name">{{ user.displayName }}</div>
      <AuthorHandle :handle="user.handle" />
      <div class="description">{{ user.description || "&#160;" }}</div>

      <!-- プロフィールメニュートリガー -->
      <button
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
  grid-gap: 0 0.5em;
  grid-template-columns: min-content auto 1fr auto;
  grid-template-rows: auto auto auto auto 1fr;
  grid-template-areas:
    "c c c c"
    "o o o o"
    "a n h m"
    "a d d m"
    "b b b b";
  align-items: center;
  &[data-content-warning-disabled="false"][data-content-warning-visibility="hide"],
  &[data-content-warning-disabled="false"][data-content-warning-visibility="always-hide"] {
    pointer-events: none;
  }
}

.content-warning {
  grid-area: c;
  margin-bottom: 0.5em;
}

.textlabel--alert {
  grid-area: o;
  margin-bottom: 0.5em;
}

.avatar-link {
  grid-area: a;
  font-size: 3em;
}

.display-name {
  grid-area: n;
  color: var(--fg-color-075);
  font-size: 0.875em;
  font-weight: bold;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
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
