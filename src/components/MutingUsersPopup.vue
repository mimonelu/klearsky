<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import LoadButton from "@/components/LoadButton.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import UserBox from "@/components/UserBox.vue"
import Util from "@/composables/util"
import consts from "@/consts/consts.json"

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
      consts.limitOfFetchMutingUsers,
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
    <template v-slot:header>
      <h2>
        <SVGIcon name="volumeOff" />
        <span>{{ $t("mutingUsers") }}</span>
      </h2>
    </template>
    <template v-slot:header-after>
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
    </template>
    <template v-slot:body>
      <div class="users">
        <UserBox
          v-for="user of mainState.currentMutingUsers"
          :key="user.did"
          class="user"
          :user="user"
          :contentWarningDisabled="true"
          @link="close"
        />
      </div>
    </template>
    <template v-slot:footer>
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
