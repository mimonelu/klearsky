import { createRouter, createWebHashHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import MainView from "@/views/MainView.vue"
import PostRecordFormView from "@/views/PostRecordFormView.vue"
import UploadProfileImagesFormView from "@/views/UploadProfileImagesFormView.vue"
import ProfileView from "@/views/main/ProfileView.vue"

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
          path: "/profile",
          name: "profile",
          component: ProfileView,
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
