import { createRouter, createWebHashHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import NotFoundView from "@/views/NotFoundView.vue"

// Main
import MainView from "@/views/MainView.vue"
import AccountsView from "@/views/main/AccountsView.vue"
import EditProfileView from "@/views/main/EditProfileView.vue"
import PostView from "@/views/main/PostView.vue"
import TimelineView from "@/views/main/TimelineView.vue"

// Main - Notifications
import NotificationsView from "@/views/main/NotificationsView.vue"
import FollowNotificationsView from "@/views/main/notifications/FollowNotificationsView.vue"
import InviteNotificationsView from "@/views/main/notifications/InviteNotificationsView.vue"
import MentionNotificationsView from "@/views/main/notifications/MentionNotificationsView.vue"
import ReplyNotificationsView from "@/views/main/notifications/ReplyNotificationsView.vue"
import RepostNotificationsView from "@/views/main/notifications/RepostNotificationsView.vue"
import VoteNotificationsView from "@/views/main/notifications/VoteNotificationsView.vue"

// Main - Profile
import ProfileView from "@/views/main/ProfileView.vue"
import AuthorPostView from "@/views/main/profile/AuthorPostView.vue"
import FollowerListView from "@/views/main/profile/FollowerListView.vue"
import FollowingListView from "@/views/main/profile/FollowingListView.vue"

// Main - Search
import SearchView from "@/views/main/SearchView.vue"
import KeywordSearchView from "@/views/main/search/KeywordSearchView.vue"
import UserSearchView from "@/views/main/search/UserSearchView.vue"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "top",
      component: HomeView,
    },
    {
      path: "/main",
      name: "main",
      component: MainView,
      redirect: "/home",
      children: [
        {
          path: "/accounts",
          name: "accounts",
          component: AccountsView,
        },
        {
          path: "/home",
          name: "home",
          component: TimelineView,
        },
        {
          path: "/profile/edit",
          name: "edit-profile",
          component: EditProfileView,
        },
        {
          path: "/post",
          name: "post",
          component: PostView,
        },
        {
          path: "/notifications",
          name: "notifications",
          component: NotificationsView,
          redirect: "/notifications/reply",
          children: [
            {
              path: "follow",
              name: "follow-notifications",
              component: FollowNotificationsView,
            },
            {
              path: "invite",
              name: "invite-notifications",
              component: InviteNotificationsView,
            },
            {
              path: "mention",
              name: "mention-notifications",
              component: MentionNotificationsView,
            },
            {
              path: "reply",
              name: "reply-notifications",
              component: ReplyNotificationsView,
            },
            {
              path: "repost",
              name: "repost-notifications",
              component: RepostNotificationsView,
            },
            {
              path: "vote",
              name: "vote-notifications",
              component: VoteNotificationsView,
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
