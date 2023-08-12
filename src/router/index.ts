import { createRouter, createWebHashHistory } from "vue-router"
import NotFoundView from "@/views/NotFoundView.vue"

// Main
import MainView from "@/views/MainView.vue"
import EditProfileView from "@/views/main/EditProfileView.vue"
import PostView from "@/views/main/PostView.vue"

// Main - Home
import HomeView from "@/views/main/HomeView.vue"
import TimelineView from "@/views/main/home/TimelineView.vue"
import MyFeedsView from "@/views/main/home/MyFeedsView.vue"
import FeedsView from "@/views/main/home/FeedsView.vue"
import GloballineView from "@/views/main/home/GloballineView.vue"

// Main - Profile
import ProfileView from "@/views/main/ProfileView.vue"
import AuthorFeedsView from "@/views/main/profile/AuthorFeedsView.vue"
import AuthorFeedsWithRepliesView from "@/views/main/profile/AuthorFeedsWithRepliesView.vue"
import AuthorFeedsWithMediaView from "@/views/main/profile/AuthorFeedsWithMediaView.vue"
import AuthorCustomFeedsView from "@/views/main/profile/AuthorCustomFeedsView.vue"
import AuthorRepostView from "@/views/main/profile/AuthorRepostView.vue"
import AuthorLikeView from "@/views/main/profile/AuthorLikeView.vue"
import FollowerListView from "@/views/main/profile/FollowerListView.vue"
import FollowingListView from "@/views/main/profile/FollowingListView.vue"

// Main - Search
import SearchView from "@/views/main/SearchView.vue"
import PostSearchView from "@/views/main/search/PostSearchView.vue"
import FeedSearchView from "@/views/main/search/FeedSearchView.vue"
import UserSearchView from "@/views/main/search/UserSearchView.vue"
import SuggestionSearchView from "@/views/main/search/SuggestionSearchView.vue"

const router = createRouter({
  history: createWebHashHistory(),
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
          path: "/home",
          name: "home",
          component: TimelineView,
        },
        {
          path: "/post",
          name: "post",
          component: PostView,
        },
        {
          path: "/home",
          name: "home",
          component: HomeView,
          redirect: "/home/timeline",
          children: [
            {
              path: "timeline",
              name: "timeline-home",
              meta: { label: "The Bluesky Client" },
              component: TimelineView,
            },
            {
              path: "my",
              name: "my-feeds-home",
              meta: { label: "myFeeds" },
              component: MyFeedsView,
            },
            {
              path: "feeds",
              name: "feeds-home",
              meta: { label: "feeds" },
              component: FeedsView,
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
              component: AuthorFeedsWithRepliesView,
            },
            {
              path: "feeds-with-media",
              name: "profile-feeds-with-media",
              meta: { label: "media" },
              component: AuthorFeedsWithMediaView,
            },
            {
              path: "custom-feeds",
              name: "profile-custom-feeds",
              meta: { label: "custom-feeds" },
              component: AuthorCustomFeedsView,
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
              path: "suggestion",
              name: "suggestion-search",
              meta: { label: "suggestionSearch" },
              component: SuggestionSearchView,
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
