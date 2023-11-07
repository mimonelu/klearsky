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
    const cursor: undefined | string = await mainState.atp.fetchMutingUsers(
      mainState.currentMutingUsers as Array<TTUser>,
      CONSTS.LIMIT_OF_FETCH_MUTING_USERS,
      direction === "old" ? mainState.currentMutingUsersCursor : undefined
    )
    if (cursor != null) mainState.currentMutingUsersCursor = cursor
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
    class="muting-users-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="volumeOff" />
        <span>{{ $t("mutingUsers") }}</span>
      </h2>
    </template>
    <template #header-after>
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
    </template>
    <template #body>
      <div class="users">
        <UserBox
          v-for="user of mainState.currentMutingUsers"
          :key="user.did"
          class="user"
          :user="user"
          :contentWarningDisabled="false"
          @link="close"
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
.muting-users-popup:deep() {
  .popup {
    height: 100%;

    &-header {
      & > h2 {
        color: rgb(var(--notice-color));

        & > .svg-icon {
          fill: rgb(var(--notice-color));
        }
      }
    }

    &-body {
      & > .users {
        display: flex;
        flex-direction: column;
        grid-gap: 1rem;

        & > .user-box {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
