<script lang="ts" setup>
import { inject, watch } from "vue"
import FollowButton from "@/components/FollowButton.vue"
import LoadButton from "@/components/LoadButton.vue"
import MuteButton from "@/components/MuteButton.vue"
import UserBox from "@/components/UserBox.vue"
import Util from "@/composables/util"

const props = defineProps<{
  type: "follower" | "following" | "suggestion"
}>()

const mainState = inject("state") as MainState

const currentUsers = props.type === "follower"
  ? mainState.currentFollowers
  : props.type === "following"
    ? mainState.currentFollowings
    : mainState.currentSearchSuggestionResults

async function fetchUsers (direction: "new" | "old") {
  Util.blurElement()
  mainState.listProcessing = true
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
      case "suggestion": {
        await mainState.fetchSuggestions(direction)
        break
      }
    }
  } finally {
    mainState.listProcessing = false
  }
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchUsers("old")
})
</script>

<template>
  <div class="user-list">
    <LoadButton
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchUsers('new')"
    />
    <div class="users">
      <UserBox
        v-for="user of currentUsers"
        :key="user.did"
        :user="user as TTUser"
        :contentWarningDisabled="false"
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
    <LoadButton
      direction="old"
      :processing="mainState.listProcessing"
      @activate="fetchUsers('old')"
    />
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

.you-followed {
  color: rgb(var(--like-color));
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.25;
}

.follow-button {
  font-size: 0.875rem;
  padding: 0.25rem 0;
  min-width: 7rem;
}

.mute-button {
  margin-left: auto;
  padding: 0.25rem 0;
  min-width: 3rem;
}
</style>
