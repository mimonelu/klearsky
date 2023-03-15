<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"

const mainState = inject("state") as MainState

const router = useRouter()

async function openProfile (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
}
</script>

<template>
  <div class="user-list">
    <div
      v-for="user of mainState.currentUsers"
      class="user"
    >
      <div
        class="avatar"
        @click.prevent="openProfile(user.handle)"
      >
        <img
          :src="user.avatar ?? '/img/void.png'"
          loading="lazy"
        >
      </div>
      <div class="display-name">{{ user.displayName }}</div>
      <div class="handle">{{ user.handle }}</div>
      <div class="relations">
        <div
          v-if="user.viewer.following"
          class="you-following"
        >Following</div>
        <div
          v-if="user.viewer.followedBy"
          class="you-followed"
        >Followed</div>
      </div>
    </div>
  </div>
</template>
