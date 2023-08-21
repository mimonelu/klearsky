<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
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
  contentWarningForceDisplay: boolean;
  contentWarningDisplay: ComputedRef<boolean>;
  contentWarningVisibility: ComputedRef<TTContentVisibility>;

  profileMenuDisplay: boolean;
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
        <SVGIcon name="alert" />{{ $t("profileLabel") }}
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
      <div class="author-handle">{{ user.handle }}</div>
      <!-- // TODO: ポップアップで見切れる不具合を修正すること
      <button
        class="menu-button"
        @click.prevent.stop="openPostMenu"
      >
        <SVGIcon name="menu" />
        <ProfileMenuTicker
          :isUser="user.handle === mainState.atp.session?.handle"
          :display="state.profileMenuDisplay"
          :user="user"
          @close="closePostMenu"
        />
      </button>
      -->
      <div class="description">{{ user.description }}</div>
      <div class="bottom">
        <slot name="bottom" />
      </div>
    </template>
  </RouterLink>
</template>

<style lang="scss" scoped>
.user-box {
  display: grid;
  grid-gap: 0 0.5rem;
  grid-template-columns: min-content auto 1fr;
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    "c c c"
    "o o o"
    "a n h"
    "a d d"
    "b b b";
  align-items: center;
  &[data-content-warning-disabled="false"][data-content-warning-visibility="hide"],
  &[data-content-warning-disabled="false"][data-content-warning-visibility="always-hide"] {
    pointer-events: none;
  }
}

.content-warning {
  grid-area: c;
  margin-bottom: 0.5rem;
}

.textlabel--alert {
  grid-area: o;
  margin-bottom: 0.5rem;
}

.avatar-link {
  grid-area: a;
  font-size: 3rem;
}

.display-name {
  grid-area: n;
  color: var(--fg-color-075);
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
}

.author-handle {
  grid-area: h;
}

/*
.menu-button {
  grid-area: m;
  cursor: pointer;
  margin: -1rem -1rem;
  padding: 1rem 1.5rem;
  position: relative;

  & > .svg-icon {
    fill: var(--fg-color-05);
  }
  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }

  .menu-ticker:deep() {
    & > .menu-ticker--inner {
      top: 2.5rem;
      right: 0.5rem;
    }
  }
}
*/

.description {
  grid-area: d;
  font-size: 0.875rem;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
    margin-top: 0.5rem;
  }
}
</style>
