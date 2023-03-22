<script lang="ts" setup>
import { inject } from "vue"
import { RouterView, useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const router = useRouter()

async function fetchNotifications (direction: "new" | "old") {
  blurElement()
  mainState.processing = true
  try {
    await mainState.fetchNotifications(direction)
  } finally {
    mainState.processing = false
  }
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
        @click.prevent="fetchNotifications('new')"
      >
        <SVGIcon name="cursorUp" />
      </button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'reply-notifications'"
        @click.prevent="openChildPage('reply-notifications')"
      >
        <SVGIcon name="post" />
      </button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'repost-notifications'"
        @click.prevent="openChildPage('repost-notifications')"
      >
        <SVGIcon name="repost" />
      </button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'vote-notifications'"
        @click.prevent="openChildPage('vote-notifications')"
      >
        <SVGIcon name="heart" />
      </button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'mention-notifications'"
        @click.prevent="openChildPage('mention-notifications')"
      >
        <SVGIcon name="at" />
      </button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'follow-notifications'"
        @click.prevent="openChildPage('follow-notifications')"
      >
        <SVGIcon name="person" />
      </button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'invite-notifications'"
        @click.prevent="openChildPage('invite-notifications')"
      >
        <SVGIcon name="mail" />
      </button>
      <button
        class="tab-button--outline"
        @click.prevent="fetchNotifications('old')"
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

.tab {
  position: sticky;
  top: 0;
  z-index: 1;

  & > .tab-button,
  & > .tab-button--outline {
    background-color: rgb(var(--bg-color));
    border-right-style: none;
  }
}
</style>
