<script setup lang="ts">
import { onMounted, provide, reactive, ref } from "vue"
import { RouterView } from "vue-router"
import LoginPopup from "@/components/LoginPopup.vue"
import Atp from "@/composables/atp"

const state = reactive<MainState>({
  atp: new Atp(),
  mounted: false,
  hasLogin: false
})

provide("state", state)

const login = async () => {
  if (state.hasLogin) return
  if (!state.atp.createAgent()) return
  if (state.atp.canLogin()) state.hasLogin = await state.atp.login()
}

onMounted(async () => {
  state.hasLogin = state.atp.hasLogin()
  await login()
  state.mounted = true
})
</script>

<template>
  <div class="main">
    <RouterView />
    <LoginPopup v-if="state.mounted && !state.hasLogin" />
  </div>
</template>

<style lang="scss" scoped>
</style>
