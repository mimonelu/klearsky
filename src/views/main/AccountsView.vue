<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const router = useRouter()

function newLogin () {
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

function deleteAccount (session: TTSession) {
  blurElement()
  mainState.atp.logout(session.did)
  if (mainState.atp.session?.did === session.did) router.go(0)
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
      <div class="account-container">
        <div
          v-for="session in mainState.atp.data.sessions"
          class="account"
          :data-is-me="mainState.atp.session?.did === session.did"
        >
          <div
            class="account__left"
            @click.prevent="login(session)"
          >
            <img
              class="account__image"
              src="/img/void-avatar.png"
            >
            <div class="account__handle">{{ session.handle }}</div>
            <div class="account__service">{{ session.__service }}</div>
          </div>
          <div class="account__right">
            <button
              class="account__delete"
              @click.prevent="deleteAccount(session)"
            >
              <SVGIcon name="cross" />
            </button>
          </div>
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
}

.button-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
}

.account-container {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
}

.account {
  display: flex;

  &__left {
    border: 1px solid rgba(var(--fg-color), 0.125);
    border-radius: 1px;
    cursor: pointer;
    display: grid;
    flex-grow: 1;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "i h"
      "i s";
    grid-gap: 0.25rem 0.5rem;
    align-items: center;
    padding: 0.5rem 1rem 0.5rem 0.5rem;
    &:focus, &:hover {
      border-color: rgb(var(--fg-color));
    }
  }
  &[data-is-me="true"] &__left {
    background-color: rgba(var(--accent-color), 0.125);
  }

  &__image {
    grid-area: i;
    width: 3rem;
    height: 3rem;
  }

  &__handle {
    grid-area: h;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__service {
    grid-area: s;
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__right {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__delete {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: -1rem;
    min-width: 3rem;
    min-height: 3rem;

    & > .svg-icon {
      fill: rgba(var(--notice-color), 0.75);
    }
    &:focus, &:hover {
      & > .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }
}
</style>
