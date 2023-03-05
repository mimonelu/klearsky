import { createRouter, createWebHashHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import PostRecordFormView from "@/views/PostRecordFormView.vue"
import UploadProfileImagesFormView from "@/views/UploadProfileImagesFormView.vue"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
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
