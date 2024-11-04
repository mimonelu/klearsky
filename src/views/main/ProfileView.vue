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
import Frontpage from "@/components/next/Frontpage/Main.vue"
import HandleHistoryPopup from "@/components/popups/HandleHistoryPopup.vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import LabelerSettingsPopupTrigger from "@/components/buttons/LabelerSettingsPopupTrigger.vue"
import LabelerSubscribeToggle from "@/components/buttons/LabelerSubscribeToggle.vue"
import LabelTags from "@/components/buttons/LabelTags.vue"
import LazyImage from "@/components/images/LazyImage.vue"
import Linkat from "@/components/next/Linkat/Main.vue"
import KnownFollowers from "@/components/lists/KnownFollowers.vue"
import MuteButton from "@/components/buttons/MuteButton.vue"
import PageHeader from "@/components/shells/PageHeader.vue"
import PageHeaderButtons from "@/components/shells/PageHeaderButtons.vue"
import Popover from "@/components/popovers/Popover.vue"
import Post from "@/components/compositions/Post.vue"
import SmokeSignal from "@/components/next/SmokeSignal/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import ViewerLabels from "@/components/labels/ViewerLabels.vue"
import WhiteWind from "@/components/next/WhiteWind/Main.vue"
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

  // 登録時に使用したスターターパック
  joinedStarterPackUrl: ComputedRef<undefined | string>

  // ラベル対応
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
    if (mainState.currentProfile?.createdAt == null) {
      return
    }
    const days = differenceInDays(
      new Date(),
      new Date(mainState.currentProfile.createdAt)
    )
    return days > 0
      ? Math.ceil(mainState.currentProfile.postsCount / days)
      : mainState.currentProfile.postsCount
  }),
  profilePostPopverDisplay: false,

  // 登録時に使用したスターターパック
  joinedStarterPackUrl: computed((): undefined | string => {
    return mainState.currentProfile?.joinedViaStarterPack != null
      ? `https://bsky.app/starter-pack/${mainState.currentProfile.joinedViaStarterPack.creator.handle}/${Util.getRkey(mainState.currentProfile.joinedViaStarterPack.uri)}`
      : undefined
  }),

  // ラベル対応
  hasNoUnauthenticated: computed((): boolean => {
    return mainState.hasLabel("!no-unauthenticated", mainState.currentProfile?.labels)
  }),
  contentFilteringLabels: computed((): Array<TILabelSetting> => {
    if (mainState.currentProfile?.labels == null) {
      return []
    }
    return mainState.myLabeler!.getSpecificLabels(mainState.currentProfile.labels, ["hide", "warn"], ["content", "media", "none"])
  }),
  contentFilteringToggleDisplay: computed((): boolean => {
    return state.contentFilteringLabels.length > 0
  }),

  // ラベル対応 - アカウントコンテンツ
  hasBlurredContent: computed((): boolean => {
    if (mainState.currentProfile?.labels == null) {
      return true
    }
    return mainState.myLabeler!.getSpecificLabels(mainState.currentProfile.labels, ["hide", "warn"], ["content", "none"]).length > 0
  }),
  accountContentDisplay: computed((): boolean => {
    return !!mainState.currentProfile?.__enabledContentMask || !state.hasBlurredContent
  }),

  // ラベル対応 - アカウントメディア
  hasBlurredMedia: computed((): boolean => {
    if (mainState.currentProfile?.labels == null) {
      return true
    }
    return mainState.myLabeler!.getSpecificLabels(mainState.currentProfile.labels, ["hide", "warn"], ["media"]).length > 0
  }),
  accountMediaDisplay: computed((): boolean => {
    return !!mainState.currentProfile?.__enabledContentMask || !state.hasBlurredMedia
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
    await Util.wait(1000)
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
  if (mainState.currentProfile == null) {
    return
  }
  mainState.currentProfile.__enabledContentMask ??= false
  mainState.currentProfile.__enabledContentMask = !mainState.currentProfile.__enabledContentMask
  // state.enabledContentMask = !state.enabledContentMask
}

// 固定ポスト

function updateThisPostThread (newPosts: Array<TTPost>) {
  if (mainState.currentAuthorPostOfPinnedPost != null) {
    Util.updatePostProps(mainState.currentAuthorPostOfPinnedPost, newPosts[0])
  }
}

function removeThisPost () {
  mainState.currentAuthorPostOfPinnedPost = undefined
}
</script>

<template>
  <div
    class="profile-view"
    :data-folding="mainState.profileFolding"
    :data-content-filtering="!(state.accountContentDisplay && state.accountMediaDisplay)"
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
    <div
      v-if="state.loaderDisplay"
      class="banner--transparent"
    />
    <div
      v-else-if="
        !!mainState.currentProfile?.banner &&
        state.accountContentDisplay &&
        state.accountMediaDisplay
      "
      class="banner"
      @click="openImagePopup(mainState.currentProfile?.banner ?? '')"
    >
      <LazyImage :src="mainState.currentProfile?.banner" />
    </div>
    <div
      v-else
      class="banner--filled"
    />

    <div class="profile-view__top-wrapper">
      <div class="profile-view__top">
        <!-- コンテンツフィルタトグル -->
        <ContentFilteringToggle
          v-if="state.contentFilteringToggleDisplay"
          :labels="state.contentFilteringLabels"
          :display="!!mainState.currentProfile?.__enabledContentMask"
          :togglable="true"
          @click.prevent.stop="onActivateAccountMaskToggle"
        />

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
              <!-- 折り畳みトグル -->
              <button
                v-if="!state.loaderDisplay"
                class="button--bordered folding-toggle"
                @click="toggleFolding"
              >
                <SVGIcon :name="mainState.profileFolding ? 'cursorDown' : 'cursorUp'" />
                <span>{{ $t(mainState.profileFolding ? "showDetail" : "hideDetail") }}</span>
              </button>

              <!-- Viewer ラベル -->
              <ViewerLabels :viewer="mainState.currentProfile?.viewer" />

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
              v-if="
                state.accountContentDisplay &&
                !!mainState.currentProfile?.description
              "
              class="description"
              dir="auto"
              :text="mainState.currentProfile?.description ?? '&emsp;'"
            />

            <!-- Atmosphere -->
            <div class="atmosphere-container">
              <!-- SmokeSignal -->
              <SmokeSignal :profile="mainState.currentProfile ?? undefined" />

              <!-- Linkat -->
              <Linkat :profile="mainState.currentProfile ?? undefined" />

              <!-- Frontpage -->
              <Frontpage :profile="mainState.currentProfile ?? undefined" />

              <!-- WhiteWind -->
              <WhiteWind :profile="mainState.currentProfile ?? undefined" />
            </div>

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
                v-if="mainState.currentProfile?.createdAt != null"
                class="created-at"
              >
                <dt>{{ $t("startedAt") }}</dt>
                <dd>{{ mainState.formatDate(mainState.currentProfile.createdAt) }} ({{ differenceInDays(new Date(), new Date(mainState.currentProfile.createdAt)) }}{{ $t("daysAgo") }})</dd>

                <!-- 登録時に使用したスターターパック -->
                <dd v-if="state.joinedStarterPackUrl != null">
                  <a
                    class="button--plane joined-starter-pack"
                    :href="state.joinedStarterPackUrl"
                    rel="noreferrer"
                    target="_blank"
                    :title="$t('joinedStarterPack')"
                  >
                    <SVGIcon name="cards" />
                  </a>
                </dd>
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
                :disabled="state.isPagePostFeeds"
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
                :disabled="state.isPagePostFeedsWithReplies"
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
                :disabled="state.isPagePostFeedsWithMedia"
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
                :disabled="state.isPageRepostList"
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
                :disabled="state.isPageLikeList"
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

        <!-- スターターパックタブボタン -->
        <RouterLink
          class="tab__button tab__button--starter-pack"
          :to="{ path: '/profile/starterPacks', query: { account: mainState.currentProfile?.did } }"
          :title="$t('starterPacks')"
          :data-disabled="!mainState.currentProfile?.associated?.starterPacks"
        >
          <SVGIcon name="cards" />
          <span>{{ $t("packs") }}</span>
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
        mainState.currentAuthorPostOfPinnedPost != null
      "
      position="post"
      :post="mainState.currentAuthorPostOfPinnedPost"
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

  --avatar-size: 10rem;

  // SPレイアウト
  @include media-sp-layout() {
    --avatar-size: 5rem;
  }

  // 非SPレイアウト
  @include media-not-sp-layout() {
    --avatar-size: 10rem;
  }

  // 折り畳み
  &[data-folding="true"] {
    .banner,
    .banner--transparent,
    .banner--filled,
    .label-tags,
    .known-followers,
    .profile-view__details__bottom {
      display: none;
    }

    .profile-view__details,
    .avatar {
      --avatar-size: 5rem;
      position: unset;
    }
  }

  &__top-wrapper {
    position: relative;
  }

  &__top {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
    padding: 1rem;
    position: relative;
  }

  &__details {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;

    &__top {
      display: grid;
      grid-template-columns: var(--avatar-size) 1fr;
      grid-gap: 1rem;
      position: relative;

      // コンテンツフィルタトグル
      [data-content-filtering="true"] & {
        grid-template-columns: 1fr;
      }

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

// コンテンツフィルタトグル
.content-filtering-toggle {
  position: relative;
  z-index: 1;
}
.profile-view[data-folding="false"] .content-filtering-toggle[data-show="true"] {
  // 非SPレイアウト
  @include media-not-sp-layout() {
    margin-left: calc(var(--avatar-size) + 1rem);
  }
}

// バナー
.banner,
.banner--transparent,
.banner--filled {
  aspect-ratio: 3 / 1;
}
.banner {
  cursor: pointer;
  object-fit: cover;
  background-color: rgb(var(--bg-color), var(--main-area-opacity));
}
.banner--transparent {
  background-color: rgb(var(--bg-color), var(--main-area-opacity));
}
.banner--filled {
  background-color: rgb(var(--fg-color), 0.125);
}

// アバターボタン
.avatar {
  font-size: var(--avatar-size);

  // 非SPレイアウト
  @include media-not-sp-layout() {
    position: absolute;
    bottom: 0;
  }
}

// 折り畳みトグル
.folding-toggle {
  float: right;
  font-size: 0.75rem;
  margin-left: 1rem;
  padding: 0.375em 1em;
  white-space: nowrap;

  & > span {
    line-height: var(--line-height-low);
  }
}

// Viewer ラベル
.viewer-labels {
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  &:empty {
    display: contents;
  }
}

// ラベルタグ
.label-tags {
  --alpha: 0.75;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

// 表示名
.display-name {
  display: contents;

  &:deep() > span {
    font-size: 1.5rem;
    user-select: text;
    white-space: pre-line;
    word-break: break-all;
    word-break: break-word;
  }
}

// ハンドル
.handle {
  display: flex;
  margin-top: 0.25rem;

  & > a {
    display: flex;
    align-items: center;
    grid-gap: 0.375rem;
    overflow: hidden;

    & > .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
    }
    [data-log-loaded="true"] & {
      & > .svg-icon {
        fill: rgb(var(--accent-color), 0.875);
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
      color: rgb(var(--fg-color), 0.5);
      font-size: 1rem;
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: text;
      white-space: nowrap;
    }
    [data-log-loaded="true"] & > .author-handle {
      color: rgb(var(--accent-color), 0.875);
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
    fill: rgb(var(--fg-color), 0.5);
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
  background-color: rgb(var(--fg-color), 0.0625);
  border-radius: var(--border-radius-middle);
  padding: 1rem;
  line-height: var(--line-height-high);
  user-select: text;
  white-space: pre-wrap;
  word-break: break-word;
}

.atmosphere-container {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
}

.statistics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  grid-gap: 0.5rem;
  padding-right: 2rem;
  position: relative;

  dl {
    display: flex;
    align-items: baseline;
    grid-gap: 0.25rem;
    overflow: hidden;

    & > dt {
      color: rgb(var(--fg-color), 0.5);
      font-size: 0.875rem;
      line-height: 1.25;
    }

    & > dd {
      color: rgb(var(--fg-color), 0.75);
      font-weight: bold;
    }
  }
}

// 登録時に使用したスターターパック
.joined-starter-pack {
  --fg-color: var(--starter-pack-color);
  margin: -0.5em -0.5em -0.5em -0.25em;
  padding: 0.5em;
}

.tab-container {
  background-color: rgb(var(--bg-color), var(--main-area-opacity));
  // BORDERED_DESIGN: border-top: 1px solid rgb(var(--fg-color), 0.25);
  // BORDERED_DESIGN: border-bottom: 1px solid rgb(var(--fg-color), 0.25);
  position: sticky;
  top: 3rem;
  z-index: 1;
  &[data-disabled="true"] {
    pointer-events: none;
  }

  .tab__button--post {
    min-width: 28.75%;

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
  background-color: rgb(var(--pinned-post-color), 0.125);

  &__header {
    display: flex;
    align-items: center;
    grid-gap: 0.5em;
    font-size: 0.875em;
    margin-bottom: 0.75em;
    overflow: hidden;
    white-space: nowrap;

    & > .svg-icon {
      fill: rgb(var(--pinned-post-color));
    }

    & > span {
      color: rgb(var(--pinned-post-color));
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
