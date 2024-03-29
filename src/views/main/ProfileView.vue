<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { RouterView, useRouter } from "vue-router"
import AuthorHandle from "@/components/app-parts/AuthorHandle.vue"
import AvatarButton from "@/components/buttons/AvatarButton.vue"
import BlockButton from "@/components/buttons/BlockButton.vue"
import ContentFilteringToggle from "@/components/app-parts/ContentFilteringToggle.vue"
import DisplayName from "@/components/app-parts/DisplayName.vue"
import FollowButton from "@/components/buttons/FollowButton.vue"
import HandleHistoryPopup from "@/components/popups/HandleHistoryPopup.vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import Loader from "@/components/common/Loader.vue"
import MuteButton from "@/components/buttons/MuteButton.vue"
import PageHeader from "@/components/shell-parts/PageHeader.vue"
import ProfileMenuTicker from "@/components/menu-tickers/ProfileMenuTicker.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import ViewerLabels from "@/components/app-parts/ViewerLabels.vue"
import Util from "@/composables/util"

const router = useRouter()

const mainState = inject("state") as MainState

const state = reactive<{
  handleHistoryPopupDisplay: boolean
  profileMenuDisplay: boolean
  endpoint: ComputedRef<undefined | string>
  isPagePostFeeds: ComputedRef<boolean>
  isPagePostFeedsWithReplies: ComputedRef<boolean>
  isPagePostFeedsWithMedia: ComputedRef<boolean>

  // ラベル対応
  enabledContentMask: boolean
  hasNoUnauthenticated: ComputedRef<boolean>
  harmfulLabels: ComputedRef<Array<TTLabel>>
  customLabels: ComputedRef<Array<TTLabel>>
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
  isPagePostFeeds: computed((): boolean => {
    return router.currentRoute.value.name === 'profile-feeds'
  }),
  isPagePostFeedsWithReplies: computed((): boolean => {
    return router.currentRoute.value.name === 'profile-feeds-with-replies'
  }),
  isPagePostFeedsWithMedia: computed((): boolean => {
    return router.currentRoute.value.name === 'profile-feeds-with-media'
  }),

  // ラベル対応
  enabledContentMask: true,
  hasNoUnauthenticated: computed((): boolean => {
    return mainState.hasLabel("!no-unauthenticated", mainState.currentProfile?.labels)
  }),
  harmfulLabels: computed((): Array<TTLabel> => {
    return mainState.filterLabels(undefined, ["alert", "blur", "blur-media"], mainState.currentProfile?.labels)
  }),
  customLabels: computed((): Array<TTLabel> => {
    return mainState.getCustomLabels(mainState.currentProfile?.labels)
  }),
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
  mainState.imagePopupProps.alts = [""]
  mainState.imagePopupProps.index = 0
  mainState.imagePopupProps.display = true
}

async function toggleNoUnauthenticated () {
  if (mainState.userProfile == null) return
  const params: TTUpdateProfileParams = {
    displayName: mainState.userProfile.displayName ?? "",
    description: mainState.userProfile.description ?? "",
    labels: mainState.userProfile.labels?.map((label: TTLabel) => label.val) ?? [],
    avatar: null,
    detachAvatar: [false],
    banner: null,
    detachBanner: [false],
  }

  // 外部公開状態の追加／削除
  if (state.hasNoUnauthenticated) {
    const index = params.labels.indexOf("!no-unauthenticated")
    if (index !== - 1) {
      params.labels.splice(index, 1)
    }
  } else {
    if (!params.labels.includes("!no-unauthenticated")) {
      params.labels.push("!no-unauthenticated")
    }
  }

  mainState.centerLoaderDisplay = true
  await mainState.updateUserProfile(params)
  const did = mainState.atp.session?.did
  if (did != null) {
    await Util.wait(500)
    await mainState.fetchCurrentProfile(did)
  }
  mainState.centerLoaderDisplay = false
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
    :data-is-my-profile="mainState.isMyProfile()"
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
        <!-- アカウントトグル -->
        <ContentFilteringToggle
          v-if="state.contentFilteringToggleDisplay"
          :labels="state.contentFilteringLabels"
          :display="!state.enabledContentMask"
          :togglable="true"
          @click.prevent.stop="onActivateAccountMaskToggle"
        />

        <!-- Viewer ラベル -->
        <ViewerLabels :viewer="mainState.currentProfile?.viewer" />

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
              <!-- 有害なラベル -->
              <div
                v-if="state.harmfulLabels.length > 0"
                class="labels"
              >
                <SVGIcon name="contentFiltering" />
                <div
                  v-for="label of state.harmfulLabels"
                  :key="label.val"
                  class="labels__item"
                >{{ $t(label.val) }}</div>
              </div>

              <!-- カスタムラベル -->
              <div
                v-if="state.customLabels.length > 0 || mainState.currentProfile?.associated?.labeler"
                class="custom-labels"
                :data-labeler="mainState.currentProfile?.associated?.labeler"
              >
                <SVGIcon name="label" />

                <!-- Labeler -->
                <div
                  v-if="mainState.currentProfile?.associated?.labeler"
                  class="custom-labels__labeler"
                >{{ $t("labelerOn") }}</div>

                <div
                  v-for="label of state.customLabels"
                  :key="label.val"
                  class="labels__item"
                >{{ $t(label.val) }}</div>
              </div>

              <!-- 表示名 -->
              <DisplayName
                :displayName="mainState.currentProfile?.displayName ?? '&nbsp;'"
                :anonymizable="false"
              />

              <!-- ハンドル -->
              <div class="handle">
                <a @click.stop="state.handleHistoryPopupDisplay = true">
                  <SVGIcon name="history" />
                  <AuthorHandle
                    :handle="mainState.currentProfile?.handle ?? '&nbsp;'"
                    :anonymizable="false"
                  />
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
                  v-if="!mainState.isMyProfile() && isFollowed()"
                  class="followed"
                >
                  <SVGIcon name="like" />
                  <span>{{ $t("followed") }}</span>
                </div>

                <!-- 折り畳みトグル -->
                <button
                  class="button--bordered folding-toggle"
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
                v-if="mainState.isMyProfile()"
                to="/profile/edit"
                class="button edit-button"
              >
                <SVGIcon name="edit" />
                <span>{{ $t("editProfile") }}</span>
              </RouterLink>

              <!-- フォロートグル -->
              <FollowButton
                v-if="!mainState.isMyProfile()"
                :viewer="mainState.currentProfile.viewer"
                :did="mainState.currentProfile.did"
                :declarationDid="mainState.currentProfile.did"
              />

              <!-- 外部公開状態トグル -->
              <button
                v-if="mainState.isMyProfile()"
                class="button--bordered no-unauthenticated-toggle"
                :data-no-unauthenticated="state.hasNoUnauthenticated"
                @click.stop="toggleNoUnauthenticated"
              >
                <SVGIcon :name="state.hasNoUnauthenticated ? 'earthOff' : 'earth'" />
              </button>

              <div class="button-container__separator" />

              <!-- ミュートトグル -->
              <MuteButton
                v-if="!mainState.isMyProfile()"
                :did="mainState.currentProfile.did"
                :viewer="mainState.currentProfile.viewer"
              />

              <!-- ブロックトグル -->
              <BlockButton
                v-if="!mainState.isMyProfile()"
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
                  :isUser="mainState.isMyProfile()"
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
      <Loader v-if="mainState.currentProfile == null && mainState.listLoaderDisplay" />
    </div>

    <!-- タブ -->
    <div class="tab-container">
      <!-- メインタブ -->
      <div class="tab">
        <!-- ポストタブボタン -->
        <RouterLink
          class="tab__button tab__button--post"
          :class="state.isPagePostFeedsWithReplies || state.isPagePostFeedsWithMedia ? 'router-link-active' : ''"
          :to="{ path: '/profile/feeds', query: { account: mainState.currentProfile?.did } }"
          :title="$t('posts')"
        >
          <SVGIcon name="post" />
          <span>{{ $t("posts") }}</span>
        </RouterLink>

        <!-- リプロフィールポストページタブボタン -->
        <RouterLink
          class="tab__button tab__button--repost"
          :to="{ path: '/profile/repost', query: { account: mainState.currentProfile?.did } }"
          :title="$t('reposts')"
        >
          <SVGIcon name="repost" />
        </RouterLink>

        <!-- 自分のいいね一覧タブボタン -->
        <RouterLink
          v-if="mainState.isMyProfile()"
          class="tab__button tab__button--like"
          :to="{ path: '/profile/like', query: { account: mainState.currentProfile?.did } }"
          :title="$t('likes')"
        >
          <SVGIcon name="like" />
        </RouterLink>

        <!-- カスタムフィードタブボタン -->
        <RouterLink
          class="tab__button tab__button--feed"
          :to="{ path: '/profile/custom-feeds', query: { account: mainState.currentProfile?.did } }"
          :title="$t('customFeeds')"
          :data-disabled="!mainState.currentProfile?.associated?.feedgens"
        >
          <SVGIcon name="feed" />
          <span>{{ $t("feeds") }}</span>
        </RouterLink>

        <!-- リストタブボタン -->
        <RouterLink
          class="tab__button tab__button--list"
          :to="{ path: '/profile/list', query: { account: mainState.currentProfile?.did } }"
          :title="$t('lists')"
          :data-disabled="!mainState.currentProfile?.associated?.lists"
        >
          <SVGIcon name="list" />
          <span>{{ $t("lists") }}</span>
        </RouterLink>
      </div>

      <!-- ユーザータブ -->
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

    <!-- プロフィールポストページ用リンクコンテナ -->
    <div
      v-if="
        state.isPagePostFeeds ||
        state.isPagePostFeedsWithReplies ||
        state.isPagePostFeedsWithMedia
      "
      class="profile-view__link-container group-buttons"
    >
      <!-- リプライ付きポストページリンク -->
      <Component
        :class="state.isPagePostFeedsWithReplies ? 'button--plane' : 'button--bordered'"
        :is="state.isPagePostFeedsWithReplies ? 'div' : 'RouterLink'"
        :to="{ path: '/profile/feeds-with-replies', query: { account: mainState.currentProfile?.did } }"
      >
        <SVGIcon name="posts" />
        <span>{{ $t("postWithReplies") }}</span>
      </Component>

      <!-- メディア一覧ページリンク -->
      <Component
        :class="state.isPagePostFeedsWithMedia ? 'button--plane' : 'button--bordered'"
        :is="state.isPagePostFeedsWithMedia ? 'div' : 'RouterLink'"
        :to="{ path: '/profile/feeds-with-media', query: { account: mainState.currentProfile?.did } }"
      >
        <SVGIcon name="image" />
        <span>{{ $t("postWithMedia") }}</span>
      </Component>
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
      border-bottom: 1px solid var(--fg-color-0125);
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

        .display-name {
          display: unset;
          font-size: 1.5rem;

          &:deep() > span {
            white-space: unset;
            word-break: break-word;
          }
        }

        &__bottom {
          display: flex;
          align-items: flex-start;
          flex-grow: 1;
          grid-gap: 0.5rem;

          button {
            font-size: 0.75rem;
            margin-left: auto;
            white-space: nowrap;
          }

          // 折り畳みトグル
          .folding-toggle {
            white-space: unset;
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

  // プロフィールポストページ用リンクコンテナ
  &__link-container {
    border-bottom: 1px solid var(--fg-color-0125);
    justify-content: flex-end;
    padding: 0.25rem;

    & > .button--bordered,
    & > .button--plane {
      font-size: 0.875rem;
    }
    & > .button--plane {
      background-color: var(--accent-color-025);
      pointer-events: none;
    }
  }
}

// Viewer ラベル
.viewer-labels:empty {
  display: contents;
}

.banner {
  aspect-ratio: 3 / 1;
  border-bottom: 1px solid var(--fg-color-0125);
  object-fit: cover;
  &[data-has-banner="true"] {
    cursor: pointer;
  }
}

.avatar {
  font-size: 5rem;
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

  & > .author-handle {
    color: var(--color);
    font-size: 0.875rem;
    font-weight: bold;
    overflow: hidden;
    text-overflow: unset;
    user-select: text;
    word-break: break-all;
    white-space: unset;
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

// 外部公開状態トグル
.no-unauthenticated-toggle {
  display: flex;
  align-items: center;
  font-size: 1.25rem;

  &[data-no-unauthenticated="true"] > .svg-icon {
    fill: var(--fg-color-05);
  }
  &[data-no-unauthenticated="false"] > .svg-icon {
    fill: rgb(var(--fg-color));
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
    overflow: hidden;

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

  .tab__button {
    &--post,
    &--reply {
      border-right-color: var(--fg-color-0125);
    }
    &--like,
    &--repost {
      flex: 0.5;
    }
  }

  .tab__button--repost > .svg-icon {
    --fg-color: var(--share-color);
  }

  .tab__button--like > .svg-icon {
    --fg-color: var(--like-color);
  }

  .tab__button--post,
  .tab__button--reply {
    & > .svg-icon {
      --fg-color: var(--post-color);
    }
  }

  .tab__button--feed,
  .tab__button--list {
    & > .svg-icon {
      --fg-color: var(--accent-color);
    }
  }
}

.feed-list,
.user-list {
  flex-grow: 1;
}
</style>
