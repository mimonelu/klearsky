import { createRouter, createWebHashHistory } from "vue-router"
import NotFoundView from "@/views/NotFoundView.vue"

// Main
import MainView from "@/views/MainView.vue"
import EditProfileView from "@/views/main/EditProfileView.vue"
import PostView from "@/views/main/PostView.vue"

// Main - Home
import HomeView from "@/views/main/HomeView.vue"
import TimelineView from "@/views/main/home/TimelineView.vue"
import FeedsView from "@/views/main/home/FeedsView.vue"
import ListFeedsView from "@/views/main/home/ListFeedsView.vue"
import ListUsersView from "@/views/main/home/ListUsersView.vue"
import StarterPackView from "@/views/main/home/StarterPackView.vue"
import GloballineView from "@/views/main/home/GloballineView.vue"

// Main - Profile
import ProfileView from "@/views/main/ProfileView.vue"
import AuthorFeedsView from "@/views/main/profile/AuthorFeedsView.vue"
import AuthorFeedsWithRepliesView from "@/views/main/profile/AuthorFeedsWithRepliesView.vue"
import AuthorFeedsWithMediaView from "@/views/main/profile/AuthorFeedsWithMediaView.vue"
import AuthorFeedGeneratorsView from "@/views/main/profile/AuthorFeedGeneratorsView.vue"
import AuthorListView from "@/views/main/profile/AuthorListView.vue"
import AuthorRepostView from "@/views/main/profile/AuthorRepostView.vue"
import AuthorLikeView from "@/views/main/profile/AuthorLikeView.vue"
import AuthorStarterPacksView from "@/views/main/profile/AuthorStarterPacksView.vue"
import FollowerListView from "@/views/main/profile/FollowerListView.vue"
import FollowingListView from "@/views/main/profile/FollowingListView.vue"
import SuggestedFollowsView from "@/views/main/profile/SuggestedFollowsView.vue"

// Main - Search
import SearchView from "@/views/main/SearchView.vue"
import PostSearchView from "@/views/main/search/PostSearchView.vue"
import FeedSearchView from "@/views/main/search/FeedSearchView.vue"
import UserSearchView from "@/views/main/search/UserSearchView.vue"
import TrendTagsView from "@/views/main/search/TrendTagsView.vue"

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
              component: FollowerListView,
            },
            {
              path: "following",
              name: "profile-following",
              meta: { label: "followings" },
              component: FollowingListView,
            },
            {
              path: "suggested-follows",
              name: "profile-suggested-follows",
              meta: { label: "suggestedFollows" },
              component: SuggestedFollowsView,
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
            {
              path: "trend-tags",
              name: "trend-tags",
              meta: { label: "trendTags" },
              component: TrendTagsView,
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

export default router
