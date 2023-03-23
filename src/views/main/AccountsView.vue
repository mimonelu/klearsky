<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const router = useRouter()

function newLogin () {
  // mainState.atp.data.did = ""
  // mainState.atp.session = undefined
  mainState.loginPopupDisplay = true
}

async function login (session: TTSession) {
  blurElement()
  mainState.atp.data.did = session.did
  mainState.atp.saveData()
  if (mainState.atp.hasLogin()) router.go(0)
}

async function logout () {
  blurElement()
  mainState.atp.logout()
  mainState.timelineFeeds?.splice(0)
  await router.push({ name: "home" })
  router.go(0)
}
</script>

<template>
  <div class="accounts-view">
    <PageHeader :title="`${$t('accounts')} - ${mainState.atp.session?.handle ?? ''}`" />
    <div class="body">
      <div class="body__section">
        <div
          v-for="session in mainState.atp.data.sessions"
          class="account"
        >
          <button
            class="button"
            @click.prevent="login(session)"
          >{{ $t("login") }}</button>
          <div class="account__right">
            <div class="account__handle">{{ session.handle }}</div>
            <div class="account__service">{{ session.__service }}</div>
          </div>
        </div>
      </div>
      <div class="body__section">
        <div class="button-container">
          <button
            class="button"
            @click.prevent="newLogin()"
          >{{ $t("login") }}</button>
          <button
            class="button"
            @click.prevent="logout"
          >{{ $t("logout") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.body {
  display: flex;
  flex-direction: column;
  grid-gap: 2rem;
  padding: 2rem;

  &__section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    grid-gap: 1rem;
    &:not(:last-child) {
      border-bottom: 1px solid rgba(var(--fg-color), 0.25);
      padding-bottom: 2rem;
    }
  }
}

.account {
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 1rem;
  align-items: flex-start;

  &__right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    grid-gap: 0.5rem;
  }

  &__handle {
    font-weight: bold;
    word-break: break-all;
    white-space: pre-wrap;
  }

  &__service {
    font-size: 0.875rem;
    word-break: break-all;
    white-space: pre-wrap;
  }
}

.button-container {
  display: flex;
  align-items: center;
  grid-gap: 1rem;
}
</style>
