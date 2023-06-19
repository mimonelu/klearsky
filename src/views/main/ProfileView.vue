<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { RouterView, useRouter, type LocationQueryValue } from "vue-router"
import AvatarButton from "@/components/AvatarButton.vue"
import ContentWarning from "@/components/ContentWarning.vue"
import FollowButton from "@/components/FollowButton.vue"
import HandleHistoryPopup from "@/components/HandleHistoryPopup.vue"
import HtmlText from "@/components/HtmlText.vue"
import MuteButton from "@/components/MuteButton.vue"
import ProfileMenuTicker from "@/components/ProfileMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  handleHistoryPopupDisplay: boolean;
  profileMenuDisplay: boolean;

  // ラベル対応
  contentWarningForceDisplay: boolean;
  contentWarningDisplay: ComputedRef<boolean>;
  contentWarningVisibility: ComputedRef<TTContentVisibility>;
}>({
  handleHistoryPopupDisplay: false,
  profileMenuDisplay: false,

  // ラベル対応
  contentWarningForceDisplay: false,
  contentWarningDisplay: computed((): boolean => {
    return state.contentWarningVisibility === 'show' ||
           ((state.contentWarningVisibility === 'always-warn' || state.contentWarningVisibility === 'warn') && state.contentWarningForceDisplay)
  }),
  contentWarningVisibility: computed((): TTContentVisibility => {
    return mainState.getContentWarningVisibility(
      mainState.currentProfile?.labels,
      undefined
    )
  }),
})

const router = useRouter()

function isUserProfile (): boolean {
  const account = mainState.currentQuery.account as LocationQueryValue
  return account === mainState.atp.session?.handle ||
         account === mainState.atp.session?.did
}

function isFollowed (): boolean {
  return mainState.currentProfile?.viewer?.followedBy != null
}

function openImagePopup (uri: string) {
  if (uri === "") return
  mainState.imagePopupProps.images = [{
    largeUri: uri,
    smallUri: "",
  }]
  mainState.imagePopupProps.index = 0
  mainState.imagePopupProps.display = true
}

function openPostMenu () {
  Util.blurElement()
  state.profileMenuDisplay = !state.profileMenuDisplay
}

function closePostMenu () {
  state.profileMenuDisplay = false
}

function onActivateBackButton () {
  Util.blurElement()
  if (history.state.back != null) router.back()
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
  <div
    class="profile-view"
    :data-content-warning-force-display="state.contentWarningForceDisplay"
    :data-content-warning-visibility="state.contentWarningVisibility"
    :data-log-loaded="mainState.currentProfile?.__log != null"
  >
    <div
      v-if="state.contentWarningDisplay"
      class="banner"
      :data-has-banner="!!mainState.currentProfile?.banner"
      :style="`background-image: url(${mainState.currentProfile?.banner ?? '/img/void.png'});`"
      @click="openImagePopup(mainState.currentProfile?.banner ?? '')"
    />

    <!-- Danger zone -->
    <div class="danger-zone">
      <!-- ラベル対応 -->
      <ContentWarning
        :display="state.contentWarningForceDisplay"
        :authorLabels="mainState.currentProfile?.labels"
        @show="showWarningContent"
        @hide="hideWarningContent"
      />

      <!-- プロフィールラベル -->
      <div
        v-if="state.contentWarningDisplay && (mainState.currentProfile?.labels?.length ?? 0) > 0"
        class="textlabel--alert"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("profileLabel") }}
        </div>
        <div
          v-for="label of mainState.currentProfile?.labels"
          :key="label.val"
          class="textlabel__item"
        >{{ $t(label.val) }}</div>
      </div>

      <!-- ミュートしている -->
      <div
        v-if="mainState.currentProfile?.viewer.muted"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="volumeOff" />{{ $t("muting") }}
        </div>
      </div>

      <!-- ブロックしている -->
      <div
        v-if="mainState.currentProfile?.viewer.blocking != null"
        class="textlabel--alert"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("blocking") }}
        </div>
      </div>

      <!-- ブロックされている -->
      <div
        v-if="mainState.currentProfile?.viewer.blockedBy"
        class="textlabel--alert"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("blocked") }}
        </div>
      </div>
    </div>

    <div class="details">
      <div class="top">
        <div
          v-if="state.contentWarningDisplay"
          class="left"
        >
          <AvatarButton
            :handle="mainState.currentProfile?.handle"
            :image="mainState.currentProfile?.avatar"
          />
        </div>
        <div class="right">
          <div class="display-name">{{ mainState.currentProfile?.displayName ?? "&nbsp;" }}</div>
          <a
            class="handle"
            @click.stop="state.handleHistoryPopupDisplay = true"
          >
            <span>{{ mainState.currentProfile?.handle ?? "&nbsp;" }}</span>
            <SVGIcon name="history" />
          </a>
          <div
            v-if="!isUserProfile() && isFollowed()"
            class="followed"
          >{{ $t("followed") }}</div>
        </div>
      </div>
      <div class="bottom">
        <div
          v-if="mainState.currentProfile != null"
          class="button-container"
        >
          <RouterLink
            v-if="isUserProfile()"
            to="/profile/edit"
            class="button"
          >
            <SVGIcon name="edit" />
            <span>{{ $t("editProfile") }}</span>
          </RouterLink>
          <FollowButton
            v-if="!isUserProfile()"
            :viewer="mainState.currentProfile.viewer"
            :did="mainState.currentProfile.did"
            :declarationDid="mainState.currentProfile.did"
          />
          <div class="button-container__separator" />
          <MuteButton
            v-if="!isUserProfile()"
            :handle="mainState.currentProfile.handle"
            :viewer="mainState.currentProfile.viewer"
          />
          <button
            class="button--bordered menu-button"
            @click.stop="openPostMenu"
          >
            <SVGIcon name="menu" />
            <ProfileMenuTicker
              :isUser="isUserProfile()"
              :display="state.profileMenuDisplay"
              :user="(mainState.currentProfile as TTProfile)"
              @close="closePostMenu"
            />
          </button>
        </div>
        <HtmlText
          v-if="state.contentWarningDisplay"
          class="description"
          dir="auto"
          :text="mainState.currentProfile?.description ?? '&nbsp;'"
        />
        <div class="statistics">
          <dl class="posts-count">
            <dt>{{ $t("postsCount") }}</dt>
            <dd>{{ mainState.currentProfile?.postsCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="follows-count">
            <dt>{{ $t("followingCount") }}</dt>
            <dd>{{ mainState.currentProfile?.followsCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="followers-count">
            <dt>{{ $t("followersCount") }}</dt>
            <dd>{{ mainState.currentProfile?.followersCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="created-at">
            <dt>{{ $t("startedAt") }}</dt>
            <dd>{{ mainState.formatDate(mainState.currentProfile?.__createdAt) }}</dd>
          </dl>
        </div>
      </div>
    </div>
    <div class="tab">
      <button
        class="tab__button"
        @click.prevent="onActivateBackButton"
      >
        <SVGIcon name="cursorLeft" />
      </button>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/post', query: { account: mainState.currentProfile?.handle } }"
      >
        <SVGIcon name="post" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/repost', query: { account: mainState.currentProfile?.did } }"
      >
        <SVGIcon name="repost" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/like', query: { account: mainState.currentProfile?.did } }"
      >
        <SVGIcon name="heart" />
      </RouterLink>
      <RouterLink
        class="tab__button tab__button--following"
        :to="{ path: '/profile/following', query: { account: mainState.currentProfile?.handle } }"
        :title="$t('following')"
      >
        <SVGIcon name="people" />
        <SVGIcon name="arrowLeft" />
        <img
          loading="lazy"
          :src="mainState.currentProfile?.avatar ?? '/img/void-avatar.png'"
          alt=""
        >
      </RouterLink>
      <RouterLink
        class="tab__button tab__button--following"
        :to="{ path: '/profile/follower', query: { account: mainState.currentProfile?.handle } }"
        :title="$t('follower')"
      >
        <img
          loading="lazy"
          :src="mainState.currentProfile?.avatar ?? '/img/void-avatar.png'"
          alt=""
        >
        <SVGIcon name="arrowLeft" />
        <SVGIcon name="people" />
      </RouterLink>
    </div>
    <RouterView />
    <HandleHistoryPopup
      v-if="state.handleHistoryPopupDisplay"
      :log="mainState.currentProfile?.__log"
      @close="state.handleHistoryPopupDisplay = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
}

// Danger zone
.danger-zone {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  &:not(:empty) {
    margin: 1rem 1rem 0;
  }
}

// ラベル対応
.content-warning {
  height: unset;
}
.profile-view[data-content-warning-force-display="false"]:not([data-content-warning-visibility="show"]) {
  .danger-zone,
  .handle {
    margin-bottom: 0;
  }
}

.banner {
  aspect-ratio: 3/1;
  display: block;
  &[data-has-banner="true"] {
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    cursor: pointer;
  }

  & > img {
    aspect-ratio: 3/1;
    display: block;
    object-fit: cover;
    width: 100%;
  }
}

.details {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  padding: 1rem;
}

.top {
  display: flex;
  grid-gap: 1rem;
}

.avatar {
  font-size: 6rem;
}

.right {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.display-name {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1.25;
  margin-bottom: 0.25rem;
  user-select: text;
  word-break: break-word;
}

.handle {
  color: rgba(var(--fg-color), 0.75);
  display: flex;
  align-items: center;
  grid-gap: 0.25rem;
  line-height: 1.25;
  user-select: text;
  word-break: break-all;
  margin-bottom: 0.5rem;
  [data-log-loaded="true"] & {
    color: rgba(var(--accent-color), 0.875);
    cursor: pointer;
    &:focus, &:hover {
      color: rgb(var(--accent-color));
      & > .svg-icon {
        fill: rgb(var(--accent-color));
      }
    }
  }

  [data-log-loaded="false"] & > .svg-icon {
    display: none;
  }
  [data-log-loaded="true"] & > .svg-icon {
    fill: rgba(var(--accent-color), 0.875);
  }
}

.followed {
  color: rgb(var(--like-color));
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.25;
  word-break: break-all;
}

.bottom {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem;

  &__separator {
    flex-grow: 1;
  }

  .button {
    font-size: 0.875rem;

    &:deep() > .svg-icon {
      font-size: 1rem;
    }
  }
}

.mute-button {
  max-width: 3rem;
}

.menu-button {
  grid-gap: 0;
  position: relative;
  max-width: 3rem;

  .menu-ticker:deep() > .menu-ticker--inner {
    top: 2.75rem;
    right: 0;
  }
}

.description {
  line-height: 1.5;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-word;
}

.statistics {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem 1rem;
  padding-right: 2rem;
  position: relative;

  dl {
    color: rgba(var(--fg-color), 0.75);
    display: flex;
    align-items: baseline;
    grid-gap: 0.5rem;

    & > dt {
      font-size: 0.875rem;
      line-height: 1.25;
    }

    & > dd {
      font-weight: bold;
    }
  }
}

.tab {
  position: sticky;
  top: 0;
  z-index: 1;

  &__button {
    padding: 0.75rem 0;
  }

  &__button--following {
    grid-gap: 0.375rem;

    & > .svg-icon--people {
      font-size: 1.5rem;
    }

    & > .svg-icon--arrowLeft {
      font-size: 0.75rem;
    }

    & > img {
      border-radius: var(--border-radius);
      display: block;
      font-size: 1.5rem;
      min-width: 1.5rem;
      max-width: 1.5rem;
      min-height: 1.5rem;
      max-height: 1.5rem;
    }
  }
}

.feed-list,
.user-list {
  flex-grow: 1;
}
</style>
