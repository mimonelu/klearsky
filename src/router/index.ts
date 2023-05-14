import { createRouter, createWebHashHistory } from "vue-router"
import NotFoundView from "@/views/NotFoundView.vue"

// Main
import MainView from "@/views/MainView.vue"
import EditProfileView from "@/views/main/EditProfileView.vue"
import GloballineView from "@/views/main/GloballineView.vue"
import HotView from "@/views/main/HotView.vue"
import NotificationsView from "@/views/main/NotificationsView.vue"
import PostView from "@/views/main/PostView.vue"
import TimelineView from "@/views/main/TimelineView.vue"

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

// Main - Settings
import SettingsView from "@/views/main/SettingsView.vue"
import KlearskySettingsView from "@/views/main/settings/KlearskySettingsView.vue"
import BlueskySettingsView from "@/views/main/settings/BlueskySettingsView.vue"
import AccountSettingsView from "@/views/main/settings/AccountSettingsView.vue"

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
          component: EditProfileView,
        },
        {
          path: "/home",
          name: "home",
          component: TimelineView,
        },
        {
          path: "/global",
          name: "global",
          component: GloballineView,
        },
        {
          path: "/hot",
          name: "hot",
          component: HotView,
        },
        {
          path: "/notifications",
          name: "notifications",
          component: NotificationsView,
        },
        {
          path: "/post",
          name: "post",
          component: PostView,
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
              component: AuthorRepostView,
            },
            {
              path: "like",
              name: "profile-like",
              component: AuthorLikeView,
            },
            {
              path: "follower",
              name: "profile-follower",
              component: FollowerListView,
            },
            {
              path: "following",
              name: "profile-following",
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
              component: SuggestionSearchView,
            },
            {
              path: "keyword",
              name: "keyword-search",
              component: KeywordSearchView,
            },
            {
              path: "user",
              name: "user-search",
              component: UserSearchView,
            },
          ],
        },
        {
          path: "/settings",
          name: "settings",
          component: SettingsView,
          redirect: "/settings/klearsky",
          children: [
            {
              path: "klearsky",
              name: "klearsky-settings",
              component: KlearskySettingsView,
            },
            {
              path: "bluesky",
              name: "bluesky-settings",
              component: BlueskySettingsView,
            },
            {
              path: "account",
              name: "account-settings",
              component: AccountSettingsView,
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
