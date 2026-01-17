<script lang="ts" setup>
import { inject, onBeforeMount, reactive, watch } from "vue"
import Loader from "@/components/shells/Loader.vue"
import NoContent from "@/components/labels/NoContent.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import RepostMuteButton from "@/components/next/RepostMute/RepostMuteButton.vue"
import UserBox from "@/components/compositions/UserBox.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  users: Array<TTUser>
}>({
  processing: false,
  users: [],
})

onBeforeMount(async () => {
  await fetchUsers()
})

watch(
  () => mainState.repostMutes,
  (newMutes) => {
    const mutedDids = new Set(newMutes.map((m) => m.did))
    state.users = state.users.filter((user) => mutedDids.has(user.did))
  },
  { deep: true }
)

function close () {
  emit("close")
}

async function fetchUsers () {
  if (state.processing) {
    return
  }
  const dids = mainState.repostMutes.map((subject) => subject.did)
  if (dids.length === 0) {
    return
  }
  state.processing = true
  const response = await mainState.atp.fetchProfiles(dids)
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "RepostMutesPopup/fetchUsers")
    return
  }
  state.users = response
}
</script>

<template>
  <Popup
    class="repost-mutes-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="repostOff" />
        <span>{{ $t("repostMutingUsers") }}</span>
      </h2>
    </template>
    <template #body>
      <Loader v-if="state.processing" />
      <NoContent v-if="
        !state.processing &&
        state.users.length === 0
      "/>
      <div
        v-for="user of state.users"
        :key="user.did"
        class="user"
      >
        <UserBox
          :user="user"
          :menuDisplay="true"
          :contentWarningDisabled="false"
          :viewerDisplay="true"
          @link="close"
        />
        <RepostMuteButton
          :did="user.did"
          :hasLabel="true"
        />
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.repost-mutes-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--notice-color));
      }

      &-body {
        display: flex;
        flex-direction: column;
        grid-gap: 1rem;
        position: relative;
      }
    }
  }

  .user {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    grid-gap: 0.5rem;
    position: relative;
  }

  .user-box {
    cursor: pointer;
    width: 100%;
  }

  .repost-mute-button {
    font-size: 0.875rem;
    padding: 0.25rem 1rem;
  }

  .loader {
    position: unset;
  }
}
</style>
