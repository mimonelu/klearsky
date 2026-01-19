import { createRouter, createWebHashHistory } from "vue-router"
import MainView from "@/views/MainView.vue"
import NotFoundView from "@/views/NotFoundView.vue"

// Main
import EditProfileView from "@/views/main/EditProfileView.vue"
import HomeView from "@/views/main/HomeView.vue"
import PostView from "@/views/main/PostView.vue"
import ProfileView from "@/views/main/ProfileView.vue"
import SearchView from "@/views/main/SearchView.vue"

// Main - Home
import FeedsView from "@/views/main/home/FeedsView.vue"
import GloballineView from "@/views/main/home/GloballineView.vue"
import ListFeedsView from "@/views/main/home/ListFeedsView.vue"
import ListUsersView from "@/views/main/home/ListUsersView.vue"
import StarterPackView from "@/views/main/home/StarterPackView.vue"
import TimelineView from "@/views/main/home/TimelineView.vue"
import TrendingView from "@/views/main/home/TrendingView.vue"

// Main - Profile
import AuthorFeedGeneratorsView from "@/views/main/profile/AuthorFeedGeneratorsView.vue"
import AuthorFeedsView from "@/views/main/profile/AuthorFeedsView.vue"
import AuthorFeedsWithMediaView from "@/views/main/profile/AuthorFeedsWithMediaView.vue"
import AuthorFeedsWithRepliesView from "@/views/main/profile/AuthorFeedsWithRepliesView.vue"
import AuthorFeedsWithVideoView from "@/views/main/profile/AuthorFeedsWithVideoView.vue"
import AuthorFollowerListView from "@/views/main/profile/AuthorFollowerListView.vue"
import AuthorFollowingListView from "@/views/main/profile/AuthorFollowingListView.vue"
import AuthorLikeView from "@/views/main/profile/AuthorLikeView.vue"
import AuthorListView from "@/views/main/profile/AuthorListView.vue"
import AuthorRepostView from "@/views/main/profile/AuthorRepostView.vue"
import AuthorStarterPacksView from "@/views/main/profile/AuthorStarterPacksView.vue"
import AuthorSuggestedFollowsView from "@/views/main/profile/AuthorSuggestedFollowsView.vue"

// Main - Search
import FeedSearchView from "@/views/main/search/FeedSearchView.vue"
import PostSearchView from "@/views/main/search/PostSearchView.vue"
import UserSearchView from "@/views/main/search/UserSearchView.vue"

const router = createRouter({
  history: createWebHashHistory(),

  // スクロールポジションの復帰
  scrollBehavior (_to, _from, savedPosition) {
    if (savedPosition != null) {
      return savedPosition
    }
    return { left: 0, top: 0 }
  },

  routes: [
    {
      path: "/",
      name: "main",
      component: MainView,
      redirect: "/home",
      children: [
        {
          path: "/profile/edit",
          name: "edit-profile",
          meta: { label: "editProfile" },
          component: EditProfileView,
        },
        {
          path: "/post",
          name: "post",
          meta: { label: "post" },
          component: PostView,
        },
        {
          path: "/home",
          name: "home",
          component: HomeView,
          children: [
            {
              path: "timeline",
              name: "timeline-home",
              meta: { label: "The Bluesky Client" },
              component: TimelineView,
            },
            {
              path: "feeds",
              name: "feeds-home",
              meta: { label: "customFeeds" },
              component: FeedsView,
            },
            {
              path: "list-feeds",
              name: "list-feeds-home",
              meta: { label: "listFeeds" },
              component: ListFeedsView,
            },
            {
              path: "list-users",
              name: "list-users-home",
              meta: { label: "listUsers" },
              component: ListUsersView,
            },
            {
              path: "trending",
              name: "trending-home",
              meta: { label: "trending" },
              component: TrendingView,
            },
            {
              path: "starter-pack",
              name: "starter-pack-home",
              meta: { label: "starterPack" },
              component: StarterPackView,
            },
            {
              path: "globalline",
              name: "globalline-home",
              meta: { label: "globalline" },
              component: GloballineView,
            },
          ],
        },
        {
          path: "/profile",
          name: "profile",
          component: ProfileView,
          redirect: "/profile/feeds",
          children: [
            {
              path: "feeds",
              name: "profile-feeds",
              component: AuthorFeedsView,
            },
            {
              path: "feeds-with-replies",
              name: "profile-feeds-with-replies",
              meta: { label: "postWithReplies" },
              component: AuthorFeedsWithRepliesView,
            },
            {
              path: "feeds-with-media",
              name: "profile-feeds-with-media",
              meta: { label: "postWithMedia" },
              component: AuthorFeedsWithMediaView,
            },
            {
              path: "feeds-with-video",
              name: "profile-feeds-with-video",
              meta: { label: "postWithVideo" },
              component: AuthorFeedsWithVideoView,
            },
            {
              path: "feed-generators",
              name: "profile-feed-generators",
              meta: { label: "customFeeds" },
              component: AuthorFeedGeneratorsView,
            },
            {
              path: "list",
              name: "profile-list",
              meta: { label: "lists" },
              component: AuthorListView,
            },
            {
              path: "repost",
              name: "profile-repost",
              meta: { label: "reposts" },
              component: AuthorRepostView,
            },
            {
              path: "like",
              name: "profile-like",
              meta: { label: "likes" },
              component: AuthorLikeView,
            },
            {
              path: "starterPacks",
              name: "profile-starter-packs",
              meta: { label: "starterPacks" },
              component: AuthorStarterPacksView,
            },
            {
              path: "follower",
              name: "profile-follower",
              meta: { label: "followers" },
              component: AuthorFollowerListView,
            },
            {
              path: "following",
              name: "profile-following",
              meta: { label: "followings" },
              component: AuthorFollowingListView,
            },
            {
              path: "suggested-follows",
              name: "profile-suggested-follows",
              meta: { label: "suggestedFollows" },
              component: AuthorSuggestedFollowsView,
            },
          ],
        },
        {
          path: "/search",
          name: "search",
          component: SearchView,
          redirect: "/search/user",
          children: [
            {
              path: "post",
              name: "post-search",
              meta: { label: "postSearch" },
              component: PostSearchView,
            },
            {
              path: "feed",
              name: "feed-search",
              meta: { label: "feedSearch" },
              component: FeedSearchView,
            },
            {
              path: "user",
              name: "user-search",
              meta: { label: "userSearch" },
              component: UserSearchView,
            },
          ],
        },
      ],
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
})

// `/UNKNOWN_PAGE` へのアクセスはエラーページへ遷移させる
// 存在するアセットファイルへのアクセスはサーバ側が処理するため考慮していない
router.beforeEach((_to, _from, next) => {
  const pathname = window.location.pathname
  const basePath = import.meta.env.BASE_URL
  const normalizedBasePath = basePath.endsWith("/") ? basePath : basePath + "/"
  if (
    pathname !== normalizedBasePath &&
    pathname !== normalizedBasePath + "index.html"
  ) {
    window.location.href = normalizedBasePath + "#/error"
    return
  }
  next()
})

export default router
