<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import UserBox from "@/components/UserBox.vue"
import { blurElement } from "@/composables/misc"

const props = defineProps<{
  type: "follower" | "following"
}>()

const mainState = inject("state") as MainState

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
</script>

<template>
  <div class="user-list">
    <button
      class="fetch-button"
      @click.prevent="fetchUsers('new')"
    >
      <SVGIcon name="cursorUp"/>
    </button>
    <div class="users">
      <UserBox
        v-for="user of currentUsers"
        :user="user as TTUser"
      >
        <div class="relations">
          <div
            v-if="user.viewer.following"
            class="you-following"
          >{{ $t("following") }}</div>
          <div
            v-if="user.viewer.followedBy"
            class="you-followed"
          >{{ $t("followed") }}</div>
        </div>
      </UserBox>
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

.users {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 1rem;
  &:not(:empty) {
    padding: 1rem 0;
  }
}

.relations {
  grid-area: r;
  display: flex;
  grid-gap: 0.5rem;
}

.you-following,
.you-followed {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  line-height: 1.25;
}

.you-following {
  color: rgb(var(--accent-color));
}

.you-followed {
  color: rgb(var(--pink));
}
</style>
