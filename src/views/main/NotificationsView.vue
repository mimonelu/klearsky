<script lang="ts" setup>
import { RouterView, useRouter } from "vue-router"
import { blurElement } from "@/composables/misc"

const router = useRouter()

function openChildPage (pageName: string) {
  blurElement()
  router.push({ name: pageName })
}
</script>

<template>
  <div class="notifications-view">
    <div class="tab">
      <button
        class="tab-button"
        @click.prevent="openChildPage('reply-notifications')"
      >Reply</button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('repost-notifications')"
      >Repost</button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('vote-notifications')"
      >Vote</button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('mention-notifications')"
      >Mention</button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('follow-notifications')"
      >Follow</button>
      <button
        class="tab-button"
        @click.prevent="openChildPage('invite-notifications')"
      >Invite</button>
    </div>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.notifications-view {
  flex-grow: 1;
}
</style>
