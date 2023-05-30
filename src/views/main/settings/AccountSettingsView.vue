<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import AccountList from "@/components/AccountList.vue"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const router = useRouter()

async function refreshSession () {
  if (!await mainState.openConfirmationPopup(
    $t("refreshSession"),
    $t("refreshSessionDescription")
  )) return
  mainState.processing = true
  if (!await mainState.atp.refreshSession())
    mainState.openErrorPopup("errorApiFailed", "AccountSettingsView/refreshSession")
  mainState.processing = false
}

async function newLogin () {
  Util.blurElement()
  mainState.processing = true
  mainState.atp.logout()
  await router.push({ name: "home" })
  location.reload()
  mainState.processing = false
}

async function logout () {
  Util.blurElement()
  mainState.processing = true
  try {
    await mainState.atp.deleteSession()
  } finally {
    mainState.atp.logout()
    await router.push({ name: "home" })
    location.reload()
    mainState.processing = false
  }
}
</script>

<template>
  <div class="accounts-view">
    <div class="body">
      <div class="button-container">
        <button
          class="button--bordered"
          @click.prevent="refreshSession()"
        >{{ $t("refreshSession") }}</button>
        <button
          class="button"
          @click.prevent="newLogin()"
        >{{ $t("newLogin") }}</button>
      </div>
      <AccountList :hasDeleteButton="true" />
      <button
        class="button--important"
        @click.prevent="logout"
      >{{ $t("logout") }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.body {
  display: flex;
  flex-direction: column;
  grid-gap: 2rem;
  padding: 2rem;
}

.button-container {
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 0.5rem;
}
</style>
