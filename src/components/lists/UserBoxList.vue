<script lang="ts" setup>
import { inject } from "vue"
import FollowButton from "@/components/buttons/FollowButton.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Loader from "@/components/shells/Loader.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"

const props = defineProps<{
  type: "follower" | "following" | "suggestedFollows"
}>()

const mainState = inject("state") as MainState

const currentUsers = props.type === "follower"
  ? mainState.currentFollowers
  : props.type === "following"
    ? mainState.currentFollowings
    : mainState.currentSuggestedFollows

async function fetchUsers (direction: "new" | "old") {
  Util.blurElement()
  mainState.listLoaderDisplay = true
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
      case "suggestedFollows": {
        await mainState.fetchSuggestedFollows()
        break
      }
    }
  } finally {
    mainState.listLoaderDisplay = false
  }
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !mainState.listLoaderDisplay &&
    props.type !== "suggestedFollows"
  ) {
    fetchUsers("old")
  }
}
</script>

<template>
  <div class="user-box-list">
    <div class="users">
      <UserBox
        v-for="user of currentUsers"
        :key="user.did"
        :user="user as TTUser"
        :menuDisplay="true"
        :contentWarningDisabled="false"
        :viewerDisplay="true"
      >
        <template #bottom>
          <div class="relations">
            <FollowButton
              v-if="user.did !== mainState.atp.session?.did"
              :viewer="user.viewer"
              :did="user.did"
              :declarationDid="user.did"
            />
          </div>
        </template>
      </UserBox>
    </div>

    <!-- おすすめユーザーはページネーションなし -->
    <LoadButton
      v-if="type !== 'suggestedFollows'"
      direction="old"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchUsers('old')"
    />

    <!-- おすすめユーザー用ローダー -->
    <Loader v-if="type === 'suggestedFollows' && mainState.listLoaderDisplay" />

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.user-box-list {
  display: flex;
  flex-direction: column;
  position: relative;

  .user-box {
    padding: 0 1rem;
  }
}

.users {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 0.5rem;
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
  min-width: 8rem;
}

.loader {
  z-index: unset;
}
</style>
