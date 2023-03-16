import { createRouter, createWebHashHistory } from "vue-router"
import EditProfileView from "@/views/main/EditProfileView.vue"
import HomeView from "@/views/HomeView.vue"
import MainView from "@/views/MainView.vue"
import PostView from "@/views/main/PostView.vue"
import ProfileView from "@/views/main/ProfileView.vue"
import SettingsView from "@/views/main/SettingsView.vue"
import TimelineView from "@/views/main/TimelineView.vue"
import AuthorPostView from "@/views/main/profile/AuthorPostView.vue"
import FollowerListView from "@/views/main/profile/FollowerListView.vue"
import FollowingListView from "@/views/main/profile/FollowingListView.vue"
import NotificationsView from "@/views/main/NotificationsView.vue"
import FollowNotificationsView from "@/views/main/notifications/FollowNotificationsView.vue"
import InviteNotificationsView from "@/views/main/notifications/InviteNotificationsView.vue"
import MentionNotificationsView from "@/views/main/notifications/MentionNotificationsView.vue"
import ReplyNotificationsView from "@/views/main/notifications/ReplyNotificationsView.vue"
import RepostNotificationsView from "@/views/main/notifications/RepostNotificationsView.vue"
import VoteNotificationsView from "@/views/main/notifications/VoteNotificationsView.vue"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/main",
      name: "main",
      component: MainView,
      children: [
        {
          path: "/settings",
          name: "settings",
          component: SettingsView,
        },
        {
          path: "/timeline",
          name: "timeline",
          component: TimelineView,
        },
        {
          path: "/edit-profile",
          name: "edit-profile",
          component: EditProfileView,
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
          children: [
            {
              path: "/profile-post",
              name: "profile-post",
              component: AuthorPostView,
            },
            {
              path: "/profile-follower",
              name: "profile-follower",
              component: FollowerListView,
            },
            {
              path: "/profile-following",
              name: "profile-following",
              component: FollowingListView,
            },
          ],
        },
        {
          path: "/notifications",
          name: "notifications",
          component: NotificationsView,
          children: [
            {
              path: "/follow-notifications",
              name: "follow-notifications",
              component: FollowNotificationsView,
            },
            {
              path: "/invite-notifications",
              name: "invite-notifications",
              component: InviteNotificationsView,
            },
            {
              path: "/mention-notifications",
              name: "mention-notifications",
              component: MentionNotificationsView,
            },
            {
              path: "/reply-notifications",
              name: "reply-notifications",
              component: ReplyNotificationsView,
            },
            {
              path: "/repost-notifications",
              name: "repost-notifications",
              component: RepostNotificationsView,
            },
            {
              path: "/vote-notifications",
              name: "vote-notifications",
              component: VoteNotificationsView,
            },
          ],
        },
      ],
    },
  ],
})

export default router
