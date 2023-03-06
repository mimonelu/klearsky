<script setup lang="ts">
import { onErrorCaptured, onMounted, provide, reactive, ref } from "vue"
import { RouterView } from "vue-router"
import ErrorPopup from "@/components/ErrorPopup.vue"
import LoginPopup from "@/components/LoginPopup.vue"
import Atp from "@/composables/atp"

const state = reactive<MainState>({
  atp: new Atp(),
  mounted: false,
  hasLogin: false,
  error: null
})

provide("state", state)

const login = async () => {
  if (state.hasLogin) return
  if (!state.atp.createAgent()) return
  if (state.atp.canLogin()) state.hasLogin = await state.atp.login()
}

const closeErrorPopup = () => {
  state.error = null
}

onErrorCaptured((error: any) => {
  state.error = error
})

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
    <ErrorPopup
      v-if="state.mounted && state.error != null"
      @close="closeErrorPopup"
    />
  </div>
</template>

<style lang="scss" scoped>
</style>
