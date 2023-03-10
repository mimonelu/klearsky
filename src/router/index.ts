import { createRouter, createWebHashHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import MainView from "@/views/MainView.vue"
import PostRecordFormView from "@/views/PostRecordFormView.vue"
import UploadProfileImagesFormView from "@/views/UploadProfileImagesFormView.vue"
import PostView from "@/views/main/PostView.vue"
import EditProfileView from "@/views/main/EditProfileView.vue"
import ProfileView from "@/views/main/ProfileView.vue"
import TimelineView from "@/views/main/TimelineView.vue"

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
          path: "/timeline",
          name: "timeline",
          component: TimelineView,
        },
        {
          path: "/profile",
          name: "profile",
          component: ProfileView,
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
      ],
    },
    {
      path: "/post-record-form",
      name: "post-record-form",
      component: PostRecordFormView,
    },
    {
      path: "/upload-profile-images-form",
      name: "upload-profile-images-form",
      component: UploadProfileImagesFormView,
    },
  ],
})

export default router
