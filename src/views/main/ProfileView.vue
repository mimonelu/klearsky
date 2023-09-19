<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { RouterView, type LocationQueryValue } from "vue-router"
import AvatarButton from "@/components/AvatarButton.vue"
import BlockButton from "@/components/BlockButton.vue"
import ContentWarning from "@/components/ContentWarning.vue"
import FollowButton from "@/components/FollowButton.vue"
import HandleHistoryPopup from "@/components/HandleHistoryPopup.vue"
import HtmlText from "@/components/HtmlText.vue"
import MuteButton from "@/components/MuteButton.vue"
import PageHeader from "@/components/PageHeader.vue"
import ProfileMenuTicker from "@/components/ProfileMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  handleHistoryPopupDisplay: boolean;
  profileMenuDisplay: boolean;

  // ラベル対応
  contentWarningForceDisplay: boolean;
  contentWarningIsHidden: ComputedRef<boolean>;
  contentWarningVisibility: ComputedRef<TTContentVisibility>;

  showPrivateData: ComputedRef<boolean>
}>({
  handleHistoryPopupDisplay: false,
  profileMenuDisplay: false,

  // ラベル対応
  contentWarningForceDisplay: false,
  contentWarningIsHidden: computed((): boolean => {
    return state.contentWarningVisibility === 'show' ||
           ((state.contentWarningVisibility === 'always-warn' || state.contentWarningVisibility === 'warn') && state.contentWarningForceDisplay)
  }),
  contentWarningVisibility: computed((): TTContentVisibility => {
    return mainState.getContentWarningVisibility(
      mainState.currentProfile?.labels,
      undefined
    )
  }),

  showPrivateData: computed((): boolean =>
    state.contentWarningIsHidden && mainState.currentProfile?.viewer.blocking == null)
})

function isMyProfile (): boolean {
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
    :data-is-my-profile="isMyProfile()"
    :data-content-warning-force-display="state.contentWarningForceDisplay"
    :data-content-warning-visibility="state.contentWarningVisibility"
    :data-log-loaded="mainState.currentProfile?.__log != null"
  >
    <PageHeader
      :hasBackButton="true"
      :title="$t('profile')"
      :subTitle="mainState.currentProfile?.displayName"
    />

    <div
      v-if="state.showPrivateData"
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
        v-if="state.contentWarningIsHidden && (mainState.currentProfile?.labels?.length ?? 0) > 0"
        class="textlabel--alert"
      >
        <div class="textlabel__text">
          <SVGIcon name="contentFiltering" />{{ $t("profileLabel") }}
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
        class="textlabel--alert"
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
          v-if="state.showPrivateData"
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
            v-if="!isMyProfile() && isFollowed()"
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
            v-if="isMyProfile()"
            to="/profile/edit"
            class="button edit-button"
          >
            <SVGIcon name="edit" />
            <span>{{ $t("editProfile") }}</span>
          </RouterLink>
          <FollowButton
            v-if="!isMyProfile()"
            :viewer="mainState.currentProfile.viewer"
            :did="mainState.currentProfile.did"
            :declarationDid="mainState.currentProfile.did"
          />
          <div class="button-container__separator" />
          <MuteButton
            v-if="!isMyProfile()"
            :did="mainState.currentProfile.did"
            :viewer="mainState.currentProfile.viewer"
          />
          <BlockButton
            v-if="!isMyProfile()"
            :did="mainState.currentProfile.did"
            :viewer="mainState.currentProfile.viewer"
          />
          <button
            class="button--bordered menu-button"
            @click.stop="openPostMenu"
          >
            <SVGIcon name="menu" />
            <ProfileMenuTicker
              :isUser="isMyProfile()"
              :display="state.profileMenuDisplay"
              :user="(mainState.currentProfile as TTProfile)"
              @close="closePostMenu"
            />
          </button>
        </div>
        <HtmlText
          v-if="state.showPrivateData"
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

    <!-- タブ -->
    <div class="tab-container">
      <!-- 上タブ -->
      <div class="tab tab--top">
        <!-- ポストタブボタン -->
        <RouterLink
          class="tab__button tab__button--post"
          :to="{ path: '/profile/feeds', query: { account: mainState.currentProfile?.did } }"
          :title="$t('post')"
        >
          <SVGIcon name="post" />
        </RouterLink>

        <!-- リプライ付きポストタブボタン -->
        <RouterLink
          class="tab__button tab__button--post"
          :to="{ path: '/profile/feeds-with-replies', query: { account: mainState.currentProfile?.did } }"
          :title="$t('postWithReplies')"
        >
          <SVGIcon name="posts" />
        </RouterLink>

        <!-- メディアタブボタン -->
        <RouterLink
          class="tab__button tab__button--media"
          :to="{ path: '/profile/feeds-with-media', query: { account: mainState.currentProfile?.did } }"
          :title="$t('medias')"
        >
          <SVGIcon name="image" />
        </RouterLink>

        <!-- カスタムフィードタブボタン -->
        <RouterLink
          class="tab__button tab__button--custom-feeds"
          :to="{ path: '/profile/custom-feeds', query: { account: mainState.currentProfile?.did } }"
          :title="$t('customFeeds')"
        >
          <SVGIcon name="feed" />
        </RouterLink>

        <!-- 自分のリポストタブボタン -->
        <RouterLink
          v-if="isMyProfile()"
          class="tab__button tab__button--repost"
          :to="{ path: '/profile/repost', query: { account: mainState.currentProfile?.did } }"
          :title="$t('reposts')"
        >
          <SVGIcon name="repost" />
        </RouterLink>

        <!-- 自分のいいねタブボタン -->
        <RouterLink
          v-if="isMyProfile()"
          class="tab__button tab__button--like"
          :to="{ path: '/profile/like', query: { account: mainState.currentProfile?.did } }"
          :title="$t('likes')"
        >
          <SVGIcon name="like" />
        </RouterLink>
      </div>

      <!-- 下タブ -->
      <div class="tab tab--bottom">
        <!-- フォローイングタブボタン -->
        <RouterLink
          class="tab__button tab__button--following"
          :to="{ path: '/profile/following', query: { account: mainState.currentProfile?.did } }"
          :title="$t('following')"
        >
          <span>{{ $t("followings") }}</span>
        </RouterLink>

        <!-- フォロワータブボタン -->
        <RouterLink
          class="tab__button tab__button--following"
          :to="{ path: '/profile/follower', query: { account: mainState.currentProfile?.did } }"
          :title="$t('follower')"
        >
          <span>{{ $t("followers") }}</span>
        </RouterLink>
      </div>
    </div>

    <RouterView class="profile-view__router-view" />

    <!-- ハンドル履歴ポップアップ -->
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
  border-bottom: 1px solid var(--fg-color-025);
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
  border-bottom: 1px solid var(--fg-color-025);
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
  font-size: 1.75rem;
  font-weight: bold;
  line-height: 1.25;
  margin-bottom: 0.25rem;
  user-select: text;
  word-break: break-word;
}

.handle {
  color: var(--fg-color-075);
  display: flex;
  align-items: center;
  grid-gap: 0.25rem;
  margin-bottom: 0.5rem;
  [data-log-loaded="true"] & {
    color: var(--accent-color-0875);
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
    fill: var(--accent-color-0875);
  }

  & > span {
    line-height: 1.25;
    user-select: text;
    word-break: break-all;
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
}

.edit-button,
.follow-button,
.mute-button,
.block-button,
.menu-button {
  &:deep() {
    & > span {
      font-size: 0.875rem;
    }

    & > .svg-icon {
      font-size: 1rem;
    }
  }
}

.edit-button {
  & > .svg-icon {
    font-size: 0.75rem;
  }
}

.mute-button {
  min-width: 3rem;
  max-width: 3rem;
}

.block-button {
  min-width: 3rem;
  max-width: 3rem;
}

.menu-button {
  grid-gap: 0;
  position: relative;
  min-width: 4rem;
  max-width: 4rem;

  .menu-ticker:deep() > .menu-ticker--inner {
    top: 2.75rem;
    right: 0;
  }
}

.description {
  line-height: var(--line-height);
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
    color: var(--fg-color-075);
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

.tab-container {
  position: sticky;
  top: 3rem;
  z-index: 1;
}

.tab {
  [data-is-my-profile="false"] &__button {
    flex: 1;
  }

  &__button--repost > .svg-icon {
    --fg-color: var(--share-color);
  }

  &__button--like > .svg-icon {
    --fg-color: var(--like-color);
  }

  &__button--post > .svg-icon {
    --fg-color: var(--post-color);
  }

  &__button--custom-feeds > .svg-icon {
    --fg-color: var(--accent-color);
  }
}

.tab--bottom > * {
  width: 50%;
}

.feed-list,
.user-list {
  flex-grow: 1;
}
</style>
