import { createRouter, createWebHashHistory } from "vue-router"
import NotFoundView from "@/views/NotFoundView.vue"

// Main
import MainView from "@/views/MainView.vue"
import EditProfileView from "@/views/main/EditProfileView.vue"
import FeedsView from "@/views/main/FeedsView.vue"
import PostView from "@/views/main/PostView.vue"

// Main - Home
import HomeView from "@/views/main/HomeView.vue"
import TimelineView from "@/views/main/home/TimelineView.vue"
import MyFeedsView from "@/views/main/home/MyFeedsView.vue"
import GloballineView from "@/views/main/home/GloballineView.vue"

// Main - Profile
import ProfileView from "@/views/main/ProfileView.vue"
import AuthorPostView from "@/views/main/profile/AuthorPostView.vue"
import AuthorRepostView from "@/views/main/profile/AuthorRepostView.vue"
import AuthorLikeView from "@/views/main/profile/AuthorLikeView.vue"
import FollowerListView from "@/views/main/profile/FollowerListView.vue"
import FollowingListView from "@/views/main/profile/FollowingListView.vue"

// Main - Search
import SearchView from "@/views/main/SearchView.vue"
import SuggestionSearchView from "@/views/main/search/SuggestionSearchView.vue"
import KeywordSearchView from "@/views/main/search/KeywordSearchView.vue"
import UserSearchView from "@/views/main/search/UserSearchView.vue"

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
          path: "/feeds",
          name: "feeds",
          component: FeedsView,
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
              name: "feeds-home",
              meta: { label: "myFeeds" },
              component: MyFeedsView,
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
          redirect: "/profile/post",
          children: [
            {
              path: "post",
              name: "profile-post",
              component: AuthorPostView,
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
              path: "suggestion",
              name: "suggestion-search",
              meta: { label: "suggestionSearch" },
              component: SuggestionSearchView,
            },
            {
              path: "keyword",
              name: "keyword-search",
              meta: { label: "keywordSearch" },
              component: KeywordSearchView,
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

export default router
