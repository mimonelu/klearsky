<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import UserBox from "@/components/app-parts/UserBox.vue"
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
  try {
    const cursor: undefined | string = await mainState.atp.fetchRepostUsers(
      mainState.currentRepostUsers as Array<TTUser>,
      mainState.currentRepostUsersUri as string,
      CONSTS.LIMIT_OF_FETCH_REPOST_USERS,
      direction === "old" ? mainState.currentRepostUsersCursor : undefined
    )
    if (cursor != null) mainState.currentRepostUsersCursor = cursor
  } finally {
    state.processing = false
  }
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}
</script>

<template>
  <Popup
    class="repost-users-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="repost" />
        <span>{{ $t("repostUsers") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="users">
        <UserBox
          v-for="user of mainState.currentRepostUsers"
          :key="user.did"
          class="user"
          :user="user"
          :menuDisplay="true"
          :contentWarningDisabled="false"
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
.repost-users-popup:deep() {
  .popup {
    height: 100%;

    &-header {
      & > h2 {
        color: rgb(var(--share-color));

        & > .svg-icon {
          fill: rgb(var(--share-color));
        }
      }
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
