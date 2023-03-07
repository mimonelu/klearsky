<script setup lang="ts">
import { onErrorCaptured, onMounted, provide, reactive } from "vue"
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
  <div class="page">
    <div class="main">
      <div class="left">
        <div class="menu"></div>
      </div>
      <RouterView class="center" />
      <div class="right"></div>
    </div>
    <LoginPopup v-if="state.mounted && !state.hasLogin" />
    <ErrorPopup
      v-if="state.mounted && state.error != null"
      @close="closeErrorPopup"
    />
  </div>
</template>

<style lang="scss" scoped>
.main {
  display: flex;
  margin: auto;
  max-width: 1024px;
  min-height: 100vh;
}

.left {
  position: relative;
  min-width: 5rem;
  @media (min-width: 1024px) {
    border-left: 1px solid rgba(var(--fg-color), 0.25);
  }
}

.menu {
  position: fixed;
  top: 0;
}

.center {
  border-left: 1px solid rgba(var(--fg-color), 0.25);
  padding: 1rem 0;
  max-width: 640px;
  @media (min-width: 1024px) {
    min-width: 640px;
  }
  @media (min-width: calc(640px + 5rem)) {
    border-right: 1px solid rgba(var(--fg-color), 0.25);
  }
}

.right {
  flex-grow: 1;
  @media (max-width: 1024px) {
    display: none;
  }
  @media (min-width: 1024px) {
    border-right: 1px solid rgba(var(--fg-color), 0.25);
  }
}
</style>
