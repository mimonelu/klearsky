<script lang="ts" setup>
import { inject, watch } from "vue"
import FollowButton from "@/components/FollowButton.vue"
import MuteButton from "@/components/MuteButton.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import UserBox from "@/components/UserBox.vue"
import Util from "@/composables/util/index"

const props = defineProps<{
  type: "follower" | "following"
}>()

const mainState = inject("state") as MainState

const currentUsers = props.type === "follower"
  ? mainState.currentFollowers
  : mainState.currentFollowings

async function fetchUsers (direction: "new" | "old") {
  Util.blurElement()
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

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchUsers("old")
})
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
        :key="user.did"
        :user="user as TTUser"
      >
        <template v-slot:bottom>
          <div class="relations">
            <div
              v-if="user.viewer.followedBy"
              class="you-followed"
            >{{ $t("followed") }}</div>
            <FollowButton
              v-if="user.did !== mainState.atp.session?.did"
              :viewer="user.viewer"
              :did="user.did"
              :declarationDid="user.did"
            />
            <MuteButton
              v-if="user.did !== mainState.atp.session?.did"
              :handle="user.handle"
              :viewer="user.viewer"
            />
          </div>
        </template>
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

  .user-box {
    padding: 0 1rem;
  }
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

.follow-button {
  font-size: 0.875rem;
  padding: 0.25rem 0;
  min-width: 7rem;
}

.you-followed {
  color: rgb(var(--like-color));
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  line-height: 1.25;
}

.mute-button {
  font-size: 0.875rem;
  margin-left: auto;
  padding: 0.25rem 0;
  min-width: 3rem;
  &:deep() span {
    display: none;
  }
}
</style>
