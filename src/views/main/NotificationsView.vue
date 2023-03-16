<script lang="ts" setup>
import { inject } from "vue"
import { RouterView, useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const router = useRouter()

async function fetchNewNotifications () {
  blurElement()
  await mainState.fetchNotifications("new")
}

async function fetchOldNotifications () {
  blurElement()
  await mainState.fetchNotifications("old")
}

function openChildPage (pageName: string) {
  blurElement()
  router.push({ name: pageName })
}
</script>

<template>
  <div class="notifications-view">
    <div class="tab">
      <button
        class="tab-button--outline"
        @click.prevent="fetchNewNotifications"
      >
        <SVGIcon name="cursorUp" />
      </button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('reply-notifications')"
      >
        <SVGIcon name="post" />
      </button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('repost-notifications')"
      >
        <SVGIcon name="repost" />
      </button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('vote-notifications')"
      >
        <SVGIcon name="heart" />
      </button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('mention-notifications')"
      >
        <SVGIcon name="at" />
      </button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('follow-notifications')"
      >
        <SVGIcon name="person" />
      </button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('invite-notifications')"
      >
        <SVGIcon name="mail" />
      </button>
      <button
        class="tab-button--outline"
        @click.prevent="fetchOldNotifications"
      >
        <SVGIcon name="cursorDown" />
      </button>
    </div>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.notifications-view {
  flex-grow: 1;
}
</style>
