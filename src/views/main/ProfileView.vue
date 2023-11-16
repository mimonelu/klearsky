<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { RouterView, type LocationQueryValue } from "vue-router"
import AvatarButton from "@/components/buttons/AvatarButton.vue"
import BlockButton from "@/components/buttons/BlockButton.vue"
import ContentFilteringToggle from "@/components/app-parts/ContentFilteringToggle.vue"
import FollowButton from "@/components/buttons/FollowButton.vue"
import HandleHistoryPopup from "@/components/popups/HandleHistoryPopup.vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import Loader from "@/components/common/Loader.vue"
import MuteButton from "@/components/buttons/MuteButton.vue"
import PageHeader from "@/components/shell-parts/PageHeader.vue"
import ProfileMenuTicker from "@/components/menu-tickers/ProfileMenuTicker.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  handleHistoryPopupDisplay: boolean
  profileMenuDisplay: boolean
  endpoint: ComputedRef<undefined | string>

  // ラベル対応
  enabledContentMask: boolean
  contentFilteringLabels: ComputedRef<Array<TTLabel>>
  contentFilteringToggleDisplay: ComputedRef<boolean>

  // ラベル対応 - アカウントコンテンツ
  hasBlurredContent: ComputedRef<boolean>
  accountContentDisplay: ComputedRef<boolean>

  // ラベル対応 - アカウントメディア
  hasBlurredMedia: ComputedRef<boolean>
  accountMediaDisplay: ComputedRef<boolean>
}>({
  handleHistoryPopupDisplay: false,
  profileMenuDisplay: false,
  endpoint: computed((): undefined | string => {
    const log = mainState.currentProfile?.__log
    return log != null && log[0] != null
      ? log[0].operation?.services?.atproto_pds?.endpoint
      : undefined
  }),

  // ラベル対応
  enabledContentMask: true,
  contentFilteringLabels: computed((): Array<TTLabel> => {
    return mainState.filterLabels(["hide", "warn"], ["blur", "blur-media"], mainState.currentProfile?.labels)
  }),
  contentFilteringToggleDisplay: computed((): boolean => {
    return state.contentFilteringLabels.length > 0
  }),

  // ラベル対応 - アカウントコンテンツ
  hasBlurredContent: computed((): boolean => {
    return mainState.filterLabels(["hide", "warn"], ["blur"], mainState.currentProfile?.labels).length > 0
  }),
  accountContentDisplay: computed((): boolean => {
    return !state.enabledContentMask || !state.hasBlurredContent
  }),

  // ラベル対応 - アカウントメディア
  hasBlurredMedia: computed((): boolean => {
    return mainState.filterLabels(["hide", "warn"], ["blur-media"], mainState.currentProfile?.labels).length > 0
  }),
  accountMediaDisplay: computed((): boolean => {
    return !state.enabledContentMask || !state.hasBlurredMedia
  }),
})

function isMyProfile (): boolean {
  const account = mainState.currentQuery.account as LocationQueryValue
  return account === mainState.atp.session?.handle ||
         account === mainState.atp.session?.did
}

function isFollowed (): boolean {
  return mainState.currentProfile?.viewer?.followedBy != null
}

function toggleFolding () {
  Util.blurElement()
  mainState.profileFolding = !mainState.profileFolding
  window.scrollTo({ left: 0, top: 0 })
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

function onActivateAccountMaskToggle () {
  state.enabledContentMask = !state.enabledContentMask
}
</script>

<template>
  <div
    class="profile-view"
    :data-folding="mainState.profileFolding"
    :data-is-my-profile="isMyProfile()"
    :data-log-loaded="mainState.currentProfile?.__log != null"
  >
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('profile')"
        :subTitle="mainState.currentProfile?.displayName"
      />
    </Portal>

    <!-- バナー -->
    <LazyImage
      v-if="state.accountContentDisplay && state.accountMediaDisplay"
      class="banner"
      :src="mainState.currentProfile?.banner"
      :data-has-banner="!!mainState.currentProfile?.banner"
      @click="openImagePopup(mainState.currentProfile?.banner ?? '')"
    />

    <div class="profile-view__top">
      <div class="profile-view__top__inner">
        <!-- Danger zone -->
        <div class="danger-zone">
          <!-- アカウントトグル -->
          <ContentFilteringToggle
            v-if="state.contentFilteringToggleDisplay"
            :labels="state.contentFilteringLabels"
            :display="!state.enabledContentMask"
            :togglable="true"
            @click.prevent.stop="onActivateAccountMaskToggle"
          />

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

        <div class="profile-view__details">
          <div class="profile-view__details__top">
            <!-- アバターボタン -->
            <div
              v-if="state.accountContentDisplay && state.accountMediaDisplay"
              class="profile-view__details__top__left"
            >
              <AvatarButton
                :handle="mainState.currentProfile?.handle"
                :image="mainState.currentProfile?.avatar"
              />
            </div>

            <div class="profile-view__details__top__right">
              <!-- アカウントラベルアイコン -->
              <div
                v-if="(mainState.currentProfile?.labels?.length ?? 0) > 0"
                class="labels"
              >
                <SVGIcon name="contentFiltering" />
                <div
                  v-for="label of mainState.currentProfile?.labels"
                  :key="label.val"
                  class="labels__item"
                >{{ $t(label.val) }}</div>
              </div>

              <!-- 表示名 -->
              <div class="display-name">{{ mainState.currentProfile?.displayName ?? "&nbsp;" }}</div>

              <!-- ハンドル -->
              <div class="handle">
                <a @click.stop="state.handleHistoryPopupDisplay = true">
                  <SVGIcon name="history" />
                  <span>{{ mainState.currentProfile?.handle ?? "&nbsp;" }}</span>
                </a>
              </div>

              <!-- Endpoint (PDS) -->
              <div class="endpoint">
                <SVGIcon name="database" />
                <span>{{ state.endpoint ?? "&nbsp;" }}</span>
              </div>

              <div class="profile-view__details__top__right__bottom">
                <!-- フォロー中メッセージ -->
                <div
                  v-if="!isMyProfile() && isFollowed()"
                  class="followed"
                >
                  <SVGIcon name="like" />
                  <span>{{ $t("followed") }}</span>
                </div>

                <!-- 折り畳みトグルボタン -->
                <button
                  class="button--bordered"
                  @click="toggleFolding"
                >
                  <SVGIcon :name="mainState.profileFolding ? 'cursorDown' : 'cursorUp'" />
                  <span>{{ $t(mainState.profileFolding ? "showDetail" : "hideDetail") }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="profile-view__details__bottom">
            <div
              v-if="mainState.currentProfile != null"
              class="button-container"
            >
              <!-- プロフィール編集ボタン -->
              <RouterLink
                v-if="isMyProfile()"
                to="/profile/edit"
                class="button edit-button"
              >
                <SVGIcon name="edit" />
                <span>{{ $t("editProfile") }}</span>
              </RouterLink>

              <!-- フォロートグル -->
              <FollowButton
                v-if="!isMyProfile()"
                :viewer="mainState.currentProfile.viewer"
                :did="mainState.currentProfile.did"
                :declarationDid="mainState.currentProfile.did"
              />
              <div class="button-container__separator" />

              <!-- ミュートトグル -->
              <MuteButton
                v-if="!isMyProfile()"
                :did="mainState.currentProfile.did"
                :viewer="mainState.currentProfile.viewer"
              />

              <!-- ブロックトグル -->
              <BlockButton
                v-if="!isMyProfile()"
                :did="mainState.currentProfile.did"
                :viewer="mainState.currentProfile.viewer"
              />

              <!-- プロフィールメニュートグル -->
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

            <!-- 説明文 -->
            <HtmlText
              v-if="state.accountContentDisplay"
              class="description"
              dir="auto"
              :text="mainState.currentProfile?.description ?? '&nbsp;'"
              :processHashTag="true"
            />

            <div
              v-if="state.accountContentDisplay"
              class="statistics"
            >
              <!-- ポスト数 -->
              <dl class="posts-count">
                <dt>{{ $t("postsCount") }}</dt>
                <dd>{{ mainState.currentProfile?.postsCount?.toLocaleString() }}</dd>
              </dl>

              <!-- フォローイング数 -->
              <dl class="follows-count">
                <dt>{{ $t("followingCount") }}</dt>
                <dd>{{ mainState.currentProfile?.followsCount?.toLocaleString() }}</dd>
              </dl>

              <!-- フォロワー数 -->
              <dl class="followers-count">
                <dt>{{ $t("followersCount") }}</dt>
                <dd>{{ mainState.currentProfile?.followersCount?.toLocaleString() }}</dd>
              </dl>

              <!-- アカウント作成日時 -->
              <dl class="created-at">
                <dt>{{ $t("startedAt") }}</dt>
                <dd>{{ mainState.formatDate(mainState.currentProfile?.__createdAt) }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <Loader v-if="mainState.currentProfile == null && mainState.listProcessing" />
    </div>

    <!-- タブ -->
    <div class="tab-container">
      <!-- 上タブ -->
      <div class="tab">
        <!-- ポストタブボタン -->
        <RouterLink
          class="tab__button tab__button--post"
          :to="{ path: '/profile/feeds', query: { account: mainState.currentProfile?.did } }"
          :title="$t('posts')"
        >
          <SVGIcon name="post" />
          <span>{{ $t("posts") }}</span>
        </RouterLink>

        <!-- リプライ付きポストタブボタン -->
        <RouterLink
          class="tab__button tab__button--post"
          :to="{ path: '/profile/feeds-with-replies', query: { account: mainState.currentProfile?.did } }"
          :title="$t('postWithReplies')"
        >
          <SVGIcon name="posts" />
          <span>{{ $t("replies") }}</span>
        </RouterLink>

        <!-- メディアタブボタン -->
        <RouterLink
          class="tab__button tab__button--media"
          :to="{ path: '/profile/feeds-with-media', query: { account: mainState.currentProfile?.did } }"
          :title="$t('medias')"
        >
          <SVGIcon name="image" />
          <span>{{ $t("medias") }}</span>
        </RouterLink>

        <!-- カスタムフィードタブボタン -->
        <RouterLink
          class="tab__button tab__button--custom-feeds"
          :to="{ path: '/profile/custom-feeds', query: { account: mainState.currentProfile?.did } }"
          :title="$t('customFeeds')"
        >
          <SVGIcon name="feed" />
          <span>{{ $t("feeds") }}</span>
        </RouterLink>
      </div>

      <!-- 中タブ -->
      <div
        v-if="isMyProfile()"
        class="tab"
      >
        <!-- 自分のリポストタブボタン -->
        <RouterLink
          class="tab__button tab__button--repost"
          :to="{ path: '/profile/repost', query: { account: mainState.currentProfile?.did } }"
          :title="$t('reposts')"
        >
          <SVGIcon name="repost" />
          <span>{{ $t("reposts") }}</span>
        </RouterLink>

        <!-- 自分のいいねタブボタン -->
        <RouterLink
          class="tab__button tab__button--like"
          :to="{ path: '/profile/like', query: { account: mainState.currentProfile?.did } }"
          :title="$t('likes')"
        >
          <SVGIcon name="like" />
          <span>{{ $t("likes") }}</span>
        </RouterLink>
      </div>

      <!-- 下タブ -->
      <div class="tab">
        <!-- 関連ユーザータブボタン -->
        <RouterLink
          class="tab__button"
          :to="{ path: '/profile/suggested-follows', query: { account: mainState.currentProfile?.did } }"
          :title="$t('suggestedFollows')"
        >
          <SVGIcon name="person" />
          <span>{{ $t("suggestedFollows") }}</span>
        </RouterLink>

        <!-- フォローイングタブボタン -->
        <RouterLink
          class="tab__button"
          :to="{ path: '/profile/following', query: { account: mainState.currentProfile?.did } }"
          :title="$t('followings')"
        >
          <SVGIcon name="person" />
          <span>{{ $t("followings") }}</span>
        </RouterLink>

        <!-- フォロワータブボタン -->
        <RouterLink
          class="tab__button"
          :to="{ path: '/profile/follower', query: { account: mainState.currentProfile?.did } }"
          :title="$t('followers')"
        >
          <SVGIcon name="person" />
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

  // 折り畳み
  &[data-folding="true"] {
    .banner,
    .endpoint,
    .profile-view__details__bottom {
      display: none;
    }

    .profile-view__details {
      .avatar {
        font-size: 4rem;
      }

      .display-name {
        font-size: 1.25rem;
      }
    }
  }

  &__top {
    &__inner {
      border-bottom: 1px solid var(--fg-color-025);
      display: flex;
      flex-direction: column;
      grid-gap: 1rem;
      padding: 1rem;
      position: relative;
    }
  }

  &__details {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;

    &__top {
      display: flex;
      grid-gap: 1rem;

      &__right {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        grid-gap: 0.375rem;

        &__bottom {
          display: flex;
          align-items: flex-start;
          flex-grow: 1;
          grid-gap: 0.5rem;

          button {
            font-size: 0.75rem;
            margin-left: auto;
          }
        }
      }
    }

    &__bottom {
      display: flex;
      flex-direction: column;
      grid-gap: 1rem;
    }
  }
}

// Danger zone
.danger-zone {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
  &:empty {
    display: contents;
  }
}

.banner {
  aspect-ratio: 3/1;
  border-bottom: 1px solid var(--fg-color-025);
  object-fit: cover;
  &[data-has-banner="true"] {
    cursor: pointer;
  }
}

.avatar {
  font-size: 5rem;
}

.display-name {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1.25;
  user-select: text;
  word-break: break-word;
}

.handle > a,
.endpoint,
.followed {
  display: inline-flex;
  grid-gap: 0.375rem;

  & > .svg-icon {
    font-size: 0.875rem;
    margin-top: 0.0625rem;
  }

  & > span {
    color: var(--color);
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.25;
    word-break: break-all;
  }
}

.handle > a {
  color: var(--fg-color-075);
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
    user-select: text;
  }
}

.endpoint {
  --color: var(--fg-color-075);
  display: inline-flex;

  & > .svg-icon {
    fill: var(--color);
  }
  [data-log-loaded="false"] & > .svg-icon {
    display: none;
  }

  & > span {
    color: var(--color);
    user-select: text;
  }
}

.followed {
  display: flex;
  flex-grow: 1;

  & > .svg-icon {
    fill: rgb(var(--like-color));
  }

  & > span {
    color: rgb(var(--like-color));
  }
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
  &__button {
    flex: 1;
  }
  &:first-child {
    font-size: 0.9375rem;
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
