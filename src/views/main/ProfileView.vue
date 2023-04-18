<script lang="ts" setup>
import { inject, reactive } from "vue"
import { RouterView } from "vue-router"
import type { LocationQueryValue } from "vue-router"
import FollowButton from "@/components/FollowButton.vue"
import MuteButton from "@/components/MuteButton.vue"
import PostAndProfileMenuTicker from "@/components/PostAndProfileMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const mainState = inject("state") as MainState

const state = reactive<{
  profileMenuDisplay: boolean;
}>({
  profileMenuDisplay: false,
})

function isUserProfile (): boolean {
  const handle = mainState.currentQuery.handle as LocationQueryValue
  return handle === mainState.atp.session?.handle
}

function isFollowed (): boolean {
  return mainState.currentProfile?.viewer?.followedBy != null
}

function openImagePopup (uri: string) {
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

async function copyHandle () {
  await navigator.clipboard.writeText(mainState.currentProfile?.handle ?? "")
  closePostMenu()
}

async function copyDid () {
  await navigator.clipboard.writeText(mainState.currentProfile?.did ?? "")
  closePostMenu()
}
</script>

<template>
  <div class="profile-view">
    <div
      class="banner"
      :data-has-banner="!!mainState.currentProfile?.banner"
      :style="{ 'background-image': `url(${mainState.currentProfile?.banner ?? '/img/void.png'})` }"
      @click="openImagePopup(mainState.currentProfile?.banner ?? '')"
    />
    <div class="details">
      <div class="top">
        <div class="left">
          <div
            class="avatar"
            @click="openImagePopup(mainState.currentProfile?.avatar ?? '')"
          >
            <img
              loading="lazy"
              :src="mainState.currentProfile?.avatar ?? '/img/void-avatar.png'"
            >
          </div>
        </div>
        <div class="right">
          <div class="display-name">{{ mainState.currentProfile?.displayName ?? "&nbsp;" }}</div>
          <div class="handle">{{ mainState.currentProfile?.handle ?? "&nbsp;" }}</div>
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
        <div
          class="description"
          dir="auto"
          v-html="mainState.currentProfile?.__descriptionHtml ?? '&nbsp;'"
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
            <dd>{{ Util.dateLabel(
              mainState.currentProfile?.__createdAt,
              mainState.currentSetting.language
            ) }}</dd>
          </dl>
          <button
            class="menu-button"
            @click.stop="openPostMenu"
          >
            <SVGIcon name="menu" />
            <PostAndProfileMenuTicker
              :display="state.profileMenuDisplay"
              :translateText="mainState.currentProfile?.description"
              :copyText="mainState.currentProfile?.description"
              :mentionTo="mainState.currentProfile?.handle"
              :openSource="mainState.currentProfile"
              @close="closePostMenu"
            >
              <template v-slot:before>
                <!-- メールアドレス -->
                <div
                  v-if="isUserProfile()"
                  class="menu-ticker__header"
                >{{ mainState.atp.session?.email ?? "&nbsp;" }}</div>

                <!-- ハンドルのコピー -->
                <button
                  class="copy-handle"
                  @click.stop="copyHandle"
                >
                  <SVGIcon name="clipboard" />
                  <span>{{ $t("copyHandle") }}</span>
                </button>

                <!-- DID のコピー -->
                <button
                  class="copy-did"
                  @click.stop="copyDid"
                >
                  <SVGIcon name="clipboard" />
                  <span>{{ $t("copyDid") }}</span>
                </button>

                <hr />
              </template>
            </PostAndProfileMenuTicker>
          </button>
        </div>
      </div>
    </div>
    <div class="tab">
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/post', query: { handle: mainState.currentProfile?.handle } }"
        @click.prevent
      >
        <SVGIcon name="post" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/repost', query: { handle: mainState.currentProfile?.handle } }"
        @click.prevent
      >
        <SVGIcon name="repost" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/like', query: { handle: mainState.currentProfile?.handle } }"
        @click.prevent
      >
        <SVGIcon name="heart" />
      </RouterLink>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/following', query: { handle: mainState.currentProfile?.handle } }"
        @click.prevent
      >{{ $t("following") }}</RouterLink>
      <RouterLink
        class="tab__button"
        :to="{ path: '/profile/follower', query: { handle: mainState.currentProfile?.handle } }"
        @click.prevent
      >{{ $t("follower") }}</RouterLink>
    </div>
    <RouterView />
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
  &[data-has-banner="false"] {
    background-image:
      linear-gradient(45deg, rgba(var(--fg-color), 0.1) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(var(--fg-color), 0.1) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(var(--fg-color), 0.1) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(var(--fg-color), 0.1) 75%);
    background-position: 0 0, 0 1rem, 1rem -1rem, -1rem 0;
    background-size: 2rem 2rem;
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
  @include avatar-link(6rem);
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
  grid-gap: 0.5rem;
  line-height: 1.25;
  user-select: text;
  word-break: break-all;
  margin-bottom: 0.5rem;
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
  margin: -1rem;
  padding: 1rem;
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
    .menu-ticker--inner {
      right: 0.25em;
      &[data-to-down="true"] {
        top: 2.5em;
      }
      &[data-to-down="false"] {
        bottom: 2.5em;
      }
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
}

.feed-list,
.user-list {
  flex-grow: 1;
}
</style>
