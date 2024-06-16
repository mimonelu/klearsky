<script lang="ts" setup>
import { computed, inject, nextTick, reactive, ref, type ComputedRef } from "vue"
import { RouterView, useRouter } from "vue-router"
import { differenceInDays } from "date-fns"
import AuthorHandle from "@/components/labels/AuthorHandle.vue"
import AvatarImageButton from "@/components/buttons/AvatarImageButton.vue"
import BlockButton from "@/components/buttons/BlockButton.vue"
import ContentFilteringToggle from "@/components/buttons/ContentFilteringToggle.vue"
import DisplayName from "@/components/labels/DisplayName.vue"
import FollowButton from "@/components/buttons/FollowButton.vue"
import HandleHistoryPopup from "@/components/popups/HandleHistoryPopup.vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import LabelerSettingsPopupTrigger from "@/components/buttons/LabelerSettingsPopupTrigger.vue"
import LabelerSubscribeToggle from "@/components/buttons/LabelerSubscribeToggle.vue"
import LabelTags from "@/components/buttons/LabelTags.vue"
import LazyImage from "@/components/images/LazyImage.vue"
import KnownFollowers from "@/components/lists/KnownFollowers.vue"
import MuteButton from "@/components/buttons/MuteButton.vue"
import PageHeader from "@/components/shells/PageHeader.vue"
import PageHeaderButtons from "@/components/shells/PageHeaderButtons.vue"
import Popover from "@/components/popovers/Popover.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import ViewerLabels from "@/components/labels/ViewerLabels.vue"
import WhiteWinds from "@/components/compositions/WhiteWinds.vue"
import Util from "@/composables/util"

const router = useRouter()

const mainState = inject("state") as MainState

const svgIconNamesOfPostTabButton: { [k: string]: string } = {
  "profile-feeds": "post",
  "profile-feeds-with-replies": "posts",
  "profile-feeds-with-media": "image",
  "profile-repost": "repost",
  "profile-like": "like",
}

const labelsOfPostTabButton: { [k: string]: string } = {
  "profile-feeds": "post",
  "profile-feeds-with-replies": "reply",
  "profile-feeds-with-media": "media",
  "profile-repost": "reposts",
  "profile-like": "likes",
}

const state = reactive<{
  loaderDisplay: ComputedRef<boolean>
  handleHistoryPopupDisplay: boolean
  svgIconNameOfPostTabButton: ComputedRef<string>
  labelOfPostTabButton: ComputedRef<string>
  isPagePostFeeds: ComputedRef<boolean>
  isPagePostFeedsWithReplies: ComputedRef<boolean>
  isPagePostFeedsWithMedia: ComputedRef<boolean>
  isPageRepostList: ComputedRef<boolean>
  isPageLikeList: ComputedRef<boolean>
  isLabeler: ComputedRef<boolean>
  numberOfPostsPerDay: ComputedRef<undefined | number>
  profilePostPopverDisplay: boolean

  // ラベル対応
  enabledContentMask: boolean
  hasNoUnauthenticated: ComputedRef<boolean>
  contentFilteringLabels: ComputedRef<Array<TILabelSetting>>
  contentFilteringToggleDisplay: ComputedRef<boolean>

  // ラベル対応 - アカウントコンテンツ
  hasBlurredContent: ComputedRef<boolean>
  accountContentDisplay: ComputedRef<boolean>

  // ラベル対応 - アカウントメディア
  hasBlurredMedia: ComputedRef<boolean>
  accountMediaDisplay: ComputedRef<boolean>
}>({
  loaderDisplay: computed((): boolean => {
    return mainState.currentProfile == null && mainState.listLoaderDisplay
  }),
  handleHistoryPopupDisplay: false,
  svgIconNameOfPostTabButton: computed((): string => {
    return svgIconNamesOfPostTabButton[(router.currentRoute.value.name ?? "") as string] ?? "post"
  }),
  labelOfPostTabButton: computed((): string => {
    return labelsOfPostTabButton[(router.currentRoute.value.name ?? "") as string] ?? "post"
  }),
  isPagePostFeeds: computed((): boolean => {
    return router.currentRoute.value.name === "profile-feeds"
  }),
  isPagePostFeedsWithReplies: computed((): boolean => {
    return router.currentRoute.value.name === "profile-feeds-with-replies"
  }),
  isPagePostFeedsWithMedia: computed((): boolean => {
    return router.currentRoute.value.name === "profile-feeds-with-media"
  }),
  isPageRepostList: computed((): boolean => {
    return router.currentRoute.value.name === "profile-repost"
  }),
  isPageLikeList: computed((): boolean => {
    return router.currentRoute.value.name === "profile-like"
  }),
  isLabeler: computed((): boolean => {
    return mainState.currentProfile?.associated?.labeler ?? false
  }),
  numberOfPostsPerDay: computed((): undefined | number => {
    if (mainState.currentProfile == null ||
        mainState.currentProfile.__createdAt == null
    ) {
      return
    }
    const days = differenceInDays(
      new Date(),
      new Date(mainState.currentProfile.__createdAt)
    )
    return days > 0
      ? Math.ceil(mainState.currentProfile.postsCount / days)
      : mainState.currentProfile.postsCount
  }),
  profilePostPopverDisplay: false,

  // ラベル対応
  enabledContentMask: true,
  hasNoUnauthenticated: computed((): boolean => {
    return mainState.hasLabel("!no-unauthenticated", mainState.currentProfile?.labels)
  }),
  contentFilteringLabels: computed((): Array<TILabelSetting> => {
    if (mainState.currentProfile?.labels == null) {
      return []
    }
    return mainState.myLabeler.getSpecificLabels(mainState.currentProfile.labels, ["hide", "warn"], ["content", "media", "none"])
  }),
  contentFilteringToggleDisplay: computed((): boolean => {
    return state.contentFilteringLabels.length > 0
  }),

  // ラベル対応 - アカウントコンテンツ
  hasBlurredContent: computed((): boolean => {
    if (mainState.currentProfile?.labels == null) {
      return true
    }
    return mainState.myLabeler.getSpecificLabels(mainState.currentProfile.labels, ["hide", "warn"], ["content", "none"]).length > 0
  }),
  accountContentDisplay: computed((): boolean => {
    return !state.enabledContentMask || !state.hasBlurredContent
  }),

  // ラベル対応 - アカウントメディア
  hasBlurredMedia: computed((): boolean => {
    if (mainState.currentProfile?.labels == null) {
      return true
    }
    return mainState.myLabeler.getSpecificLabels(mainState.currentProfile.labels, ["hide", "warn"], ["media"]).length > 0
  }),
  accountMediaDisplay: computed((): boolean => {
    return !state.enabledContentMask || !state.hasBlurredMedia
  }),
})

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
  if (mainState.userProfile == null) {
    return
  }
  const params: TTUpdateProfileParams = {
    displayName: mainState.userProfile.displayName ?? "",
    description: mainState.userProfile.description ?? "",
    labels: mainState.userProfile.labels
      ?.filter((label) => {
        return !label.ver
      })
      .map((label) => {
        return label.val
      }) ?? [],
    avatar: null,
    detachAvatar: [false],
    banner: null,
    detachBanner: [false],

    // 固定ポスト
    pinnedPost: mainState.userProfile.pinnedPost,
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

function openHandleHistoryPopup () {
  if (mainState.currentProfile?.__log == null) return
  state.handleHistoryPopupDisplay = true
}

function closeHandleHistoryPopup () {
  state.handleHistoryPopupDisplay = false
}

function openProfilePopover ($event: Event) {
  Util.blurElement()
  mainState.profilePopoverProps.isUser = mainState.isMyProfile()
  mainState.profilePopoverProps.user = mainState.currentProfile as TTProfile
  mainState.profilePopoverFrom = "profile-view"
  mainState.openProfilePopover($event.target)
}

// プロフィールポストポップオーバー

const popover = ref(null)

async function openProfilePostPopver ($event: Event) {
  Util.blurElement()
  state.profilePostPopverDisplay = true
  await nextTick()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    $event.target,
    {
      positionX: "left",
      positionY: "bottom",
      directionX: "right",
      directionY: "down",
      collideX: true,
      collideY: true,
      animationDirection: "down",
      isChild: false,
    }
  )
}

function closeProfilePostPopver () {
  state.profilePostPopverDisplay = false
}

// ラベル対応

function onActivateAccountMaskToggle () {
  state.enabledContentMask = !state.enabledContentMask
}

// 固定ポスト

function updateThisPostThread (newPosts: Array<TTPost>) {
  Util.updatePostProps(mainState.currentAuthorPinnedPost, newPosts[0])
}

function removeThisPost () {
  mainState.currentAuthorPinnedPost = undefined
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
        :title="mainState.currentProfile?.displayName || mainState.currentProfile?.handle"
      >
        <template #right>
          <PageHeaderButtons />
        </template>
      </PageHeader>
    </Portal>

    <!-- バナー -->
    <LazyImage
      v-if="state.loaderDisplay || (state.accountContentDisplay && state.accountMediaDisplay)"
      class="banner"
      :src="mainState.currentProfile?.banner"
      :data-has-banner="!!mainState.currentProfile?.banner"
      @click="openImagePopup(mainState.currentProfile?.banner ?? '')"
    />

    <div class="profile-view__top-wrapper">
      <div class="profile-view__top">
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
              v-if="state.loaderDisplay || (state.accountContentDisplay && state.accountMediaDisplay)"
              class="profile-view__details__top__left"
            >
              <AvatarImageButton
                :isLabeler="state.isLabeler"
                :image="mainState.currentProfile?.avatar"
              />
            </div>

            <div class="profile-view__details__top__right">
              <!-- ラベルタグ -->
              <LabelTags
                :labels="mainState.currentProfile?.labels"
                :labelerDisplay="state.isLabeler"
                :unauthenticatedDisplay="true"
                :harmfulDisplay="true"
                :customDisplay="true"
              />

              <!-- 表示名 -->
              <DisplayName
                :displayName="mainState.currentProfile?.displayName ?? '&emsp;'"
                :anonymizable="false"
              />

              <!-- 折り畳みトグル -->
              <button
                v-if="!state.loaderDisplay"
                class="button--bordered folding-toggle"
                @click="toggleFolding"
              >
                <SVGIcon :name="mainState.profileFolding ? 'cursorDown' : 'cursorUp'" />
                <span>{{ $t(mainState.profileFolding ? "showDetail" : "hideDetail") }}</span>
              </button>

              <!-- ハンドル -->
              <div class="handle">
                <a @click.stop="openHandleHistoryPopup">
                  <SVGIcon name="history" />
                  <AuthorHandle
                    :handle="mainState.currentProfile?.handle ?? '&nbsp;'"
                    :anonymizable="false"
                  />
                </a>
              </div>
            </div>
          </div>
          <div class="profile-view__details__bottom">
            <!-- ボタンコンテナ -->
            <div
              v-if="mainState.currentProfile != null"
              class="button-container"
            >
              <!-- 段落ちボタンコンテナ -->
              <div
                v-if="!mainState.isMyProfile()"
                class="button-container__dropoff"
              >
                <!-- フォロートグル -->
                <FollowButton
                  :viewer="mainState.currentProfile.viewer"
                  :did="mainState.currentProfile.did"
                  :declarationDid="mainState.currentProfile.did"
                />

                <!-- Known Followers -->
                <KnownFollowers
                  v-if="mainState.currentProfile?.viewer?.knownFollowers?.followers != null"
                  :followers="mainState.currentProfile.viewer.knownFollowers.followers"
                />
              </div>

              <!-- 段落ちなしボタンコンテナ -->
              <div class="button-container__nodropoff">
                <!-- プロフィール編集ボタン -->
                <RouterLink
                  v-if="mainState.isMyProfile()"
                  to="/profile/edit"
                  class="button edit-button"
                >
                  <SVGIcon name="edit" />
                  <span>{{ $t("editProfile") }}</span>
                </RouterLink>

                <!-- 外部公開状態トグル -->
                <button
                  v-if="mainState.isMyProfile()"
                  class="button--bordered no-unauthenticated-toggle"
                  :data-no-unauthenticated="state.hasNoUnauthenticated"
                  @click.stop="toggleNoUnauthenticated"
                >
                  <SVGIcon :name="state.hasNoUnauthenticated ? 'earthOff' : 'earth'" />
                </button>

                <!-- 高さ合わせ兼セパレータ用ボタン -->
                <button
                  type="button"
                  class="button button-container__hidden-button"
                  tabindex="-1"
                >
                  <SVGIcon name="like" />
                  <span>-</span>
                </button>

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

                <!-- プロフィールポップオーバートグル -->
                <button
                  class="button--bordered menu-button"
                  @click.stop="openProfilePopover"
                >
                  <SVGIcon name="menu" />
                </button>
              </div>
            </div>

            <!-- ラベラー行 -->
            <div
              v-if="state.isLabeler"
              class="group-buttons"
            >
              <!-- ラベラーサブスクライブトグル -->
              <LabelerSubscribeToggle :labeler="mainState.currentLabeler" />

              <!-- ラベラー設定ポップアップトリガー -->
              <LabelerSettingsPopupTrigger :labeler="mainState.currentLabeler" />
            </div>

            <!-- 説明文 -->
            <HtmlText
              v-if="state.accountContentDisplay"
              class="description"
              dir="auto"
              :text="mainState.currentProfile?.description ?? '&emsp;'"
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

              <!-- 1日あたりの投稿数 -->
              <dl
                v-if="state.numberOfPostsPerDay != null"
                class="number-of-posts-per-day"
              >
                <dt>{{ $t("numberOfPostsPerDay") }}</dt>
                <dd>{{ state.numberOfPostsPerDay.toLocaleString() }}</dd>
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
              <dl
                v-if="mainState.currentProfile?.__createdAt != null"
                class="created-at"
              >
                <dt>{{ $t("startedAt") }}</dt>
                <dd>{{ mainState.formatDate(mainState.currentProfile?.__createdAt) }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- タブ -->
    <div
      class="tab-container"
      :data-disabled="state.loaderDisplay"
    >
      <!-- メインタブ -->
      <div class="tab">
        <!-- プロフィールポストポップオーバートリガー -->
        <button
          type="button"
          class="tab__button tab__button--post"
          :class="
            state.isPagePostFeeds ||
            state.isPagePostFeedsWithReplies ||
            state.isPagePostFeedsWithMedia ||
            state.isPageRepostList ||
            state.isPageLikeList
              ? 'router-link-active'
              : ''
          "
          to="{ path: '/profile/feeds', query: { account: mainState.currentProfile?.did } }"
          @click.stop.self="openProfilePostPopver"
        >
          <SVGIcon :name="state.svgIconNameOfPostTabButton" />
          <span>{{ $t(state.labelOfPostTabButton) }}</span>
          <SVGIcon name="cursorDown" />

          <!-- プロフィールポストポップオーバー -->
          <Popover
            v-if="state.profilePostPopverDisplay"
            class="profile-post-popover"
            ref="popover"
            @close="closeProfilePostPopver"
          >
            <menu class="list-menu">
              <!-- ポストページリンク -->
              <Component
                :is="state.isPagePostFeeds ? 'div' : 'RouterLink'"
                class="list-menu__item"
                :data-selected="state.isPagePostFeeds"
                :to="{ path: '/profile/feeds', query: { account: mainState.currentProfile?.did } }"
                @click.stop="closeProfilePostPopver"
              >
                <SVGIcon name="post" />
                <span>{{ $t("posts") }}</span>
              </Component>

              <!-- リプライ付きポストページリンク -->
              <Component
                :is="state.isPagePostFeedsWithReplies ? 'div' : 'RouterLink'"
                class="list-menu__item"
                :data-selected="state.isPagePostFeedsWithReplies"
                :to="{ path: '/profile/feeds-with-replies', query: { account: mainState.currentProfile?.did } }"
                @click.stop="closeProfilePostPopver"
              >
                <SVGIcon name="posts" />
                <span>{{ $t("postWithReplies") }}</span>
              </Component>

              <!-- メディア一覧ページリンク -->
              <Component
                :is="state.isPagePostFeedsWithMedia ? 'div' : 'RouterLink'"
                class="list-menu__item"
                :data-selected="state.isPagePostFeedsWithMedia"
                :to="{ path: '/profile/feeds-with-media', query: { account: mainState.currentProfile?.did } }"
                @click.stop="closeProfilePostPopver"
              >
                <SVGIcon name="image" />
                <span>{{ $t("postWithMedia") }}</span>
              </Component>

              <!-- リポスト一覧ページリンク -->
              <Component
                :is="state.isPageRepostList ? 'div' : 'RouterLink'"
                class="list-menu__item"
                :data-selected="state.isPageRepostList"
                :to="{ path: '/profile/repost', query: { account: mainState.currentProfile?.did } }"
                @click.stop="closeProfilePostPopver"
              >
                <SVGIcon name="repost" />
                <span>{{ $t("reposts") }}</span>
              </Component>

              <!-- いいね一覧ページリンク -->
              <Component
                v-if="mainState.isMyProfile()"
                :is="state.isPageLikeList ? 'div' : 'RouterLink'"
                class="list-menu__item"
                :data-selected="state.isPageLikeList"
                :to="{ path: '/profile/like', query: { account: mainState.currentProfile?.did } }"
                @click.stop="closeProfilePostPopver"
              >
                <SVGIcon name="like" />
                <span>{{ $t("likes") }}</span>
              </Component>
            </menu>
          </Popover>
        </button>

        <!-- カスタムフィードタブボタン -->
        <RouterLink
          class="tab__button tab__button--feed"
          :to="{ path: '/profile/feed-generators', query: { account: mainState.currentProfile?.did } }"
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

    <!-- 固定ポスト -->
    <Post
      v-if="
        state.isPagePostFeeds &&
        mainState.currentAuthorPinnedPost != null
      "
      position="post"
      :post="mainState.currentAuthorPinnedPost"
      class="pinned-post"
      @updateThisPostThread="updateThisPostThread"
      @removeThisPost="removeThisPost"
    >
      <template #post-before>
        <div class="pinned-post__header">
          <SVGIcon name="pinOutline" />
          <span>{{ $t("pinnedPost") }}</span>
        </div>
      </template>
    </Post>

    <!-- WhiteWind 導線 -->
    <WhiteWinds
      v-if="state.isPagePostFeeds"
      :profile="mainState.currentProfile ?? undefined"
    />

    <RouterView class="profile-view__router-view" />

    <!-- ハンドル履歴ポップアップ -->
    <Transition>
      <HandleHistoryPopup
        v-if="state.handleHistoryPopupDisplay"
        :log="mainState.currentProfile?.__log"
        @close="closeHandleHistoryPopup"
      />
    </Transition>
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
    .label-tags,
    .known-followers,
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

  &__top-wrapper {
    position: relative;
  }

  &__top {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
    padding: 1rem;
    position: relative;
  }

  &__details {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;

    &__top {
      display: flex;
      grid-gap: 1rem;

      &__right {
        flex-grow: 1;
        overflow: hidden;
      }
    }

    &__bottom {
      display: flex;
      flex-direction: column;
      grid-gap: 1rem;
    }
  }
}

// Viewer ラベル
.viewer-labels:empty {
  display: contents;
}

// バナー
.banner {
  aspect-ratio: 3 / 1;
  object-fit: cover;
  &[data-has-banner="true"] {
    cursor: pointer;
  }
}

// アバターボタン
.avatar {
  font-size: 5rem;
}

// ラベルタグ
.label-tags {
  --alpha: 0.75;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

// 表示名
.display-name {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  user-select: text;

  &:deep() > span {
    white-space: unset;
    word-break: break-all;
  }
}

// 折り畳みトグル
.folding-toggle {
  float: right;
  font-size: 0.625rem;
  margin-left: 0.5rem;
  white-space: nowrap;
}

// ハンドル
.handle {
  display: flex;

  & > a {
    display: flex;
    align-items: center;
    grid-gap: 0.375rem;
    font-size: 0.875rem;
    overflow: hidden;

    & > .svg-icon {
      fill: var(--fg-color-05);
    }
    [data-log-loaded="true"] & {
      & > .svg-icon {
        fill: var(--accent-color-0875);
      }
      &:focus, &:hover {
        & > .svg-icon {
          fill: rgb(var(--accent-color));
        }
      }
    }
    [data-log-loaded="false"] & > .svg-icon {
      display: none;
    }

    & > .author-handle {
      color: var(--fg-color-05);
      font-size: 0.875rem;
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: text;
      white-space: nowrap;
    }
    [data-log-loaded="true"] & > .author-handle {
      color: var(--accent-color-0875);
      cursor: pointer;
      &:focus, &:hover {
        color: rgb(var(--accent-color));
      }
    }
  }
}

// ボタンコンテナ
.button-container {
  display: flex;
  align-items: flex-start;
  grid-gap: 0.5rem;

  // 段落ちボタンコンテナ
  &__dropoff {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    grid-gap: 0.5rem 0.75rem;
  }

  // 段落ちなしボタンコンテナ
  &__nodropoff {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    grid-gap: 0.5rem;
  }

  // 高さ合わせ兼セパレータ用ボタン
  &__hidden-button {
    flex-grow: 1;
    font-size: 0.875rem;
    padding-left: 0;
    padding-right: 0;
    visibility: hidden;
  }
}

// Known Followers
.known-followers {
  font-size: 2rem;
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
}

// ラベラーサブスクライブトグル
// ラベラー設定ポップアップトリガー
.labeler-subscribe-toggle:deep(),
.labeler-settings-popup-trigger:deep() {
  & > span {
    font-size: 0.875rem;
  }
}

.description {
  line-height: var(--line-height-high);
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
    grid-gap: 0.25rem;
    overflow: hidden;

    & > dt {
      color: var(--fg-color-075);
      font-size: 0.875rem;
      line-height: 1.25;
    }

    & > dd {
      color: rgb(var(--fg-color));
      font-weight: bold;
    }
  }
}

.tab-container {
  position: sticky;
  top: 3rem;
  z-index: 1;
  &[data-disabled="true"] {
    opacity: 0.9375;
    pointer-events: none;
  }

  .tab__button--post {
    & > .svg-icon--cursorDown {
      font-size: 0.75rem;
    }
  }
}

.profile-post-popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }
}

// 固定ポスト
.pinned-post {
  background-color: rgb(var(--like-color), 0.125);

  &__header {
    display: flex;
    align-items: center;
    grid-gap: 0.5em;
    font-size: 0.875em;
    margin-bottom: 0.75em;
    overflow: hidden;
    white-space: nowrap;

    & > .svg-icon {
      fill: rgb(var(--like-color));
    }

    & > span {
      color: rgb(var(--like-color));
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.feed-list,
.user-box-list {
  flex-grow: 1;
}
</style>
