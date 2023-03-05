import { createRouter, createWebHashHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
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
      path: "/upload-profile-images-form",
      name: "upload-profile-images-form",
      component: UploadProfileImagesFormView,
    },
  ],
})

export default router
