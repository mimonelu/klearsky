<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const props = defineProps<{
  type: "follower" | "following"
}>()

const mainState = inject("state") as MainState

const router = useRouter()

const currentUsers = props.type === "follower"
  ? mainState.currentFollowers
  : mainState.currentFollowings

async function fetchUsers (direction: "new" | "old") {
  blurElement()
  mainState.processing = true
  try {
    switch (props.type) {
      case "follower": {
        await mainState.fetchFollowers(direction)
        break
      }
      case "following": {
        await mainState.fetchFollowings(direction)
        break
      }
    }
  } finally {
    mainState.processing = false
  }
}

async function openProfile (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
}
</script>

<template>
  <div class="user-list">
    <button
      class="fetch-button"
      @click.prevent="fetchUsers('new')"
    >
      <SVGIcon name="cursorUp"/>
    </button>
    <div class="main">
      <div
        v-for="user of currentUsers"
        class="user"
      >
        <div
          class="avatar"
          @click.prevent="openProfile(user.handle)"
        >
          <img
            :src="user.avatar ?? '/img/void-avatar.png'"
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
    <button
      class="fetch-button"
      @click.prevent="fetchUsers('old')"
    >
      <SVGIcon name="cursorDown"/>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.user-list {
  display: flex;
  flex-direction: column;
}

.main {
  flex-grow: 1;
  &:not(:empty) {
    padding: 0.5rem 0;
  }
}

.user {
  display: grid;
  grid-template-columns: max-content 1fr min-content;
  grid-template-areas:
    "a d r"
    "a h h";
  grid-gap: 0.5rem 1rem;
  align-items: center;
  overflow: hidden;
  padding: 0.5rem 1rem;
}

.avatar {
  grid-area: a;
  @include avatar-link(3rem);
}

.display-name {
  grid-area: d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.handle {
  grid-area: h;
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relations {
  grid-area: r;
  display: flex;
  grid-gap: 1rem;
}

.you-following,
.you-followed {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: bold;
}

.you-following {
  color: rgb(var(--accent-color));
}

.you-followed {
  color: rgb(var(--pink));
}
</style>
