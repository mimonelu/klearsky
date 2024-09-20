<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false
})

onBeforeMount(async () => {
  await fetchContinuousResults("new")
})

function close () {
  emit("close")
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  const cursor = await mainState.atp.fetchLikeUsers(
    mainState.currentLikeUsers as Array<TTUser>,
    mainState.currentLikeUsersUri as string,
    CONSTS.LIMIT_OF_FETCH_LIKE_USERS,
    direction === "old" ? mainState.currentLikeUsersCursor : undefined
  )
  state.processing = false
  if (cursor instanceof Error) {
    mainState.openErrorPopup(cursor, "LikeUsersPopup/fetchContinuousResults")
    return
  }
  if (cursor != null && (
    direction === "old" || (
      direction === "new" &&
      mainState.currentLikeUsersCursor == null
    )
  )) {
    mainState.currentLikeUsersCursor = cursor
  }
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}
</script>

<template>
  <Popup
    class="like-users-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="like" />
        <span>{{ $t("likeUsers") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="users">
        <UserBox
          v-for="user of mainState.currentLikeUsers"
          :key="user.did"
          class="user"
          :user="user"
          :menuDisplay="true"
          :contentWarningDisabled="false"
          :viewerDisplay="true"
        />
      </div>
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.like-users-popup:deep() {
  .popup {
    &-header > h2 > .svg-icon {
      fill: rgb(var(--like-color));
    }

    &-body > .users {
      display: flex;
      flex-direction: column;
      grid-gap: 1rem;

      & > .user-box {
        cursor: pointer;
      }
    }
  }
}
</style>
