import { createRouter, createWebHashHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import ProfileImagesUploaderView from "@/views/ProfileImagesUploaderView.vue"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/profile-images-uploader",
      name: "profile-images-uploader",
      component: ProfileImagesUploaderView,
    },
  ],
})

export default router
