<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const router = useRouter()

async function login (account: { [k: string]: string }) {
  blurElement()
  mainState.atp.logout()
  mainState.challengingAccount = account
  mainState.hasLogin = await mainState.atp.login(account.service, account.handle)
  if (mainState.hasLogin) router.go(0)
}

async function logout () {
  blurElement()
  mainState.atp.logout()
  mainState.timelineFeeds?.splice(0)
  await router.push({ name: "timeline" })
  router.go(0)
}
</script>

<template>
  <div class="settings-view">
    <PageHeader :title="`${$t('settings')} - ${mainState.atp.session?.handle ?? ''}`" />
    <div class="body">
      <div class="body__section">
        <div
          v-for="account in mainState.atp.accounts"
          class="account"
        >
          <button
            class="button"
            @click.prevent="login(account)"
          >{{ $t("login") }}</button>
          <div class="account__right">
            <div class="account__handle">{{ account.handle }}</div>
            <div class="account__service">{{ account.service }}</div>
          </div>
        </div>
      </div>
      <div class="body__section">
        <button
          class="button"
          @click.prevent="logout"
        >{{ $t("logout") }}</button>
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
</style>
