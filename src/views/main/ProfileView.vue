<script lang="ts" setup>
import { inject, reactive } from "vue"
import { RouterView, useRouter, type LocationQueryValue } from "vue-router"
import AvatarButton from "@/components/AvatarButton.vue"
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
}>({
  handleHistoryPopupDisplay: false,
  profileMenuDisplay: false,
})

const router = useRouter()

function isUserProfile (): boolean {
  const handle = mainState.currentQuery.handle as LocationQueryValue
  return handle === mainState.atp.session?.handle
}

function isFollowed (): boolean {
  return mainState.currentProfile?.viewer?.followedBy != null
}

function openImagePopup (uri: string) {
  if (uri === "") return
  mainState.imagePopupProps.largeUri = uri
  mainState.imagePopupProps.smallUri = ""
  mainState.imagePopupProps.display = true
}

function openPostMenu () {
  state.profileMenuDisplay = !state.profileMenuDisplay
}

function closePostMenu () {
  state.profileMenuDisplay = false
}

function onActivateBackButton () {
  Util.blurElement()
  if (history.state.back != null) router.back()
}
</script>

<template>
  <div
    class="profile-view"
    :data-log-loaded="mainState.currentProfile?.__log != null"
  >
    <div
      class="banner"
      :data-has-banner="!!mainState.currentProfile?.banner"
      :style="`background-image: url(${mainState.currentProfile?.banner ?? '/img/void.png'});`"
      @click="openImagePopup(mainState.currentProfile?.banner ?? '')"
    />
    <div class="details">
      <!-- ブロックしている -->
      <div
        v-if="mainState.currentProfile?.viewer.blocking != null"
        class="notification-message"
      >
        <SVGIcon name="alert" />
        <span>{{ $t("blocking") }}</span>
      </div>

      <!-- ブロックされている -->
      <div
        v-if="mainState.currentProfile?.viewer.blockedBy"
        class="notification-message"
      >
        <SVGIcon name="alert" />
        <span>{{ $t("blocked") }}</span>
      </div>

      <div class="top">
        <div class="left">
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
        <div class="button-container">
          <RouterLink
            v-if="isUserProfile()"
            to="/profile/edit"
            class="button"
          >
            <SVGIcon name="edit" />
            <span>{{ $t("editProfile") }}</span>
          </RouterLink>
          <FollowButton
            v-if="!isUserProfile() && mainState.currentProfile != null"
            :viewer="mainState.currentProfile.viewer"
            :did="mainState.currentProfile.did"
            :declarationDid="mainState.currentProfile.did"
          />
          <MuteButton
            v-if="!isUserProfile() && mainState.currentProfile != null"
            :handle="mainState.currentProfile.handle"
            :viewer="mainState.currentProfile.viewer"
          />
        </div>
        <HtmlText
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
          <button
            class="menu-button"
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
        :to="{ path: '/profile/post', query: { handle: mainState.currentProfile?.handle } }"
      >
        <SVGIcon name="post" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/repost', query: { handle: mainState.currentProfile?.handle } }"
      >
        <SVGIcon name="repost" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/like', query: { handle: mainState.currentProfile?.handle } }"
      >
        <SVGIcon name="heart" />
      </RouterLink>
      <RouterLink
        class="tab__button tab__button--following"
        :to="{ path: '/profile/following', query: { handle: mainState.currentProfile?.handle } }"
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
        :to="{ path: '/profile/follower', query: { handle: mainState.currentProfile?.handle } }"
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
  align-items: center;
  flex-wrap: wrap;
  grid-gap: 0.5rem;

  .button {
    font-size: 0.875rem;
  }
}

.mute-button {
  margin-left: auto;
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

.menu-button {
  cursor: pointer;
  margin: -1rem -1rem;
  padding: 1rem 1.5rem;
  position: absolute;
  bottom: 0rem;
  right: 0;

  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.5);
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
