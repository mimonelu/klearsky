<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import AuthorHandle from "@/components/labels/AuthorHandle.vue"
import AvatarButton from "@/components/buttons/AvatarButton.vue"
import ContentFilteringToggle from "@/components/buttons/ContentFilteringToggle.vue"
import DisplayName from "@/components/labels/DisplayName.vue"
import LabelTags from "@/components/buttons/LabelTags.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import ViewerLabels from "@/components/labels/ViewerLabels.vue"

const emit = defineEmits<(name: string) => void>()

const props = defineProps<{
  user: TTUser
  noLink?: boolean
  contentWarningDisabled: boolean
  menuDisplay: boolean
  viewerDisplay: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  // ラベル対応
  appliedHarmfulLabels: ComputedRef<Array<TILabelSetting>>
  hasAppliedHarmfulLabel: ComputedRef<boolean>
  contentFilteringToggleDisplay: boolean
}>({
  // ラベル対応
  appliedHarmfulLabels: computed((): Array<TILabelSetting> => {
    if (props.user.labels == null) {
      return []
    }
    return mainState.myLabeler!.getSpecificLabels(props.user.labels, ["hide", "warn"], ["content", "media", "none"])
  }),
  hasAppliedHarmfulLabel: computed((): boolean => {
    return state.appliedHarmfulLabels.length > 0
  }),
  contentFilteringToggleDisplay: false,
})

const profileMenuTrigger = ref()

onMounted(() => {
  state.contentFilteringToggleDisplay = !state.hasAppliedHarmfulLabel
})

function onActivateLink () {
  emit("link")
}

function openProfilePopover ($event: Event) {
  Util.blurElement()
  mainState.profilePopoverProps.isUser = props.user.did === mainState.atp.session?.did
  mainState.profilePopoverProps.user = props.user
  mainState.profilePopoverFrom = undefined
  mainState.openProfilePopover($event.target)
}

// ラベル対応

function onActivateContentFilteringToggle () {
  state.contentFilteringToggleDisplay = !state.contentFilteringToggleDisplay
}
</script>

<template>
  <Component
    :is="noLink ? 'div' : 'RouterLink'"
    class="user-box"
    :to="{ name: 'profile-feeds', query: { account: user.did } }"
    :data-menu-display="menuDisplay"
    @click="onActivateLink"
  >
    <!-- プロフィールトグル -->
    <ContentFilteringToggle
      v-if="state.hasAppliedHarmfulLabel"
      :labels="state.appliedHarmfulLabels"
      :display="state.contentFilteringToggleDisplay"
      :togglable="!contentWarningDisabled"
      @click.prevent.stop="onActivateContentFilteringToggle"
    />

    <template v-if="
      contentWarningDisabled ||
      (!contentWarningDisabled && state.contentFilteringToggleDisplay)
    ">
      <!-- ラベルタグ -->
      <LabelTags
        :labels="user.labels"
        :labelerDisplay="false"
        :unauthenticatedDisplay="false"
        :harmfulDisplay="true"
        :customDisplay="true"
      />

      <!-- Viewer ラベル -->
      <ViewerLabels
        v-if="viewerDisplay"
        :viewer="user.viewer"
      />

      <AvatarButton
        :noLink="noLink"
        :isLabeler="user.associated?.labeler"
        :did="user.did"
        :image="user.avatar"
      />
      <DisplayName
        :displayName="user.displayName"
        :anonymizable="true"
      >
        <!-- ラベラーアイコン -->
        <template v-if="user.associated?.labeler">
          <SVGIcon
            v-if="mainState.myLabeler!.isSubscribed(user.did)"
            name="labeler"
            class="account-labeler-icon"
          />
          <SVGIcon
            v-else
            name="labelerOff"
            class="account-labeler-icon"
          />
        </template>

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
      <div class="description">
        <template v-if="$slots.content == null">{{ user.description || "&emsp;" }}</template>
        <slot
          v-else
          name="content"
        />
      </div>

      <!-- プロフィールポップオーバートグル -->
      <button
        v-if="menuDisplay"
        class="menu-button"
        ref="profileMenuTrigger"
        @click.prevent.stop="openProfilePopover"
      >
        <SVGIcon name="menu" />
      </button>

      <div class="bottom">
        <slot name="bottom" />
      </div>
    </template>
  </Component>
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
    "l l l l"
    "v v v v"
    "a n h m"
    "a d d m"
    "b b b b";
  align-items: center;
  &[data-menu-display="false"] {
    grid-template-columns: min-content auto 1fr;
    grid-template-areas:
      "c c c"
      "l l l"
      "v v v"
      "a n h"
      "a d d"
      "b b b";
  }
}

.content-filtering-toggle {
  grid-area: c;
  &:not(:last-child) {
    margin-bottom: 0.5em;
  }
}

// ラベルタグ
.label-tags {
  grid-area: l;
  --alpha: 0.75;
  font-size: 0.75em;
  &:not(:last-child) {
    margin-bottom: 0.5em;
  }
}

.viewer-labels {
  grid-area: v;
  font-size: 0.75rem;
  margin-bottom: 0.5em;
  &:empty {
    display: contents;
  }
}

.avatar-button {
  grid-area: a;
  font-size: 3em;
}

.display-name {
  grid-area: n;
  display: flex;
  align-items: center;
  grid-gap: 0.5em;

  // ラベラーアイコン
  // アカウントラベルアイコン
  .account-labeler-icon,
  .account-label-icon {
    font-size: 0.875em;
  }
  .account-labeler-icon {
    fill: rgb(var(--label-color));
  }
  .account-label-icon {
    fill: rgb(var(--notice-color));
  }

  &:deep() > span {
    color: rgb(var(--fg-color), 0.75);
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
    fill: rgb(var(--fg-color), 0.5);
    pointer-events: none;
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
