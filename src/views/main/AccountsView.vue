<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import AccountList from "@/components/AccountList.vue"
import PageHeader from "@/components/PageHeader.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const router = useRouter()

async function newLogin () {
  blurElement()
  mainState.processing = true
  mainState.atp.logout()
  await router.push({ name: "home" })
  location.reload()
  mainState.processing = false
}

async function logout () {
  blurElement()
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
    <PageHeader :title="`${$t('accounts')} - ${mainState.atp.session?.handle ?? ''}`" />
    <div class="body">
      <div class="button-container">
        <button
          class="button"
          @click.prevent="newLogin()"
        >{{ $t("newLogin") }}</button>
        <button
          class="button button--important"
          @click.prevent="logout"
        >{{ $t("logout") }}</button>
      </div>
      <AccountList :hasDeleteButton="true" />
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
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
}
</style>
