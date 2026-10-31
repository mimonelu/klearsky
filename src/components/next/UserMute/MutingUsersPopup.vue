<script lang="ts" setup>
import { inject, onBeforeMount, reactive, watch } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Loader from "@/components/shells/Loader.vue"
import NoContent from "@/components/labels/NoContent.vue"
import Popup from "@/components/popups/Popup.vue"
import QuoteMuteButton from "@/components/next/QuoteMute/QuoteMuteButton.vue"
import RepostMuteButton from "@/components/next/RepostMute/RepostMuteButton.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

type TTMutingUsersTab = "mute" | "repost" | "quote"

type TTScopedMuteTab = Exclude<TTMutingUsersTab, "mute">

interface TIScopedMuteUsers {
  processing: boolean
  fetched: boolean
  users: Array<TTUser>
}

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  tab: TTMutingUsersTab
  processing: boolean
  repost: TIScopedMuteUsers
  quote: TIScopedMuteUsers
}>({
  tab: "mute",
  processing: false,
  repost: {
    processing: false,
    fetched: false,
    users: [],
  },
  quote: {
    processing: false,
    fetched: false,
    users: [],
  },
})

onBeforeMount(async () => {
  await fetchContinuousResults("new")
})

// 解除したユーザーを一覧から除く
watch(
  () => mainState.repostMutes,
  (newMutes) => {
    removeUnmutedUsers("repost", newMutes)
  },
  { deep: true }
)

watch(
  () => mainState.quoteMutes,
  (newMutes) => {
    removeUnmutedUsers("quote", newMutes)
  },
  { deep: true }
)

function removeUnmutedUsers (tab: TTScopedMuteTab, subjects: Array<{ did: string }>) {
  const mutedDids = new Set(subjects.map((subject) => subject.did))
  state[tab].users = state[tab].users.filter((user) => mutedDids.has(user.did))
}

function close () {
  emit("close")
}

async function changeTab (tab: TTMutingUsersTab) {
  Util.blurElement()
  if (state.tab === tab) {
    return
  }
  state.tab = tab
  if (tab !== "mute") {
    await fetchScopedMuteUsers(tab)
  }
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) {
    return
  }
  state.processing = true
  const cursor = await mainState.atp.fetchMutingUsers(
    mainState.currentMutingUsers as Array<TTUser>,
    CONSTS.LIMIT_OF_FETCH_MUTING_USERS,
    direction === "old" ? mainState.currentMutingUsersCursor : undefined
  )
  state.processing = false
  if (cursor instanceof Error) {
    mainState.openErrorPopup(cursor, "MutingUsersPopup/fetchContinuousResults")
    return
  }
  if (cursor != null && (
    direction === "old" || (
      direction === "new" &&
      mainState.currentMutingUsersCursor == null
    )
  )) {
    mainState.currentMutingUsersCursor = cursor
  }
}

// リポストミュート・引用リポストミュートのユーザーを取得
async function fetchScopedMuteUsers (tab: TTScopedMuteTab) {
  const target = state[tab]
  if (target.processing || target.fetched) {
    return
  }
  const subjects = tab === "repost"
    ? mainState.repostMutes
    : mainState.quoteMutes
  const dids = subjects.map((subject) => subject.did)
  target.processing = true
  const users: Array<TTUser> = []

  // `getProfiles` は一度に取得できる件数に上限があるため分割する
  for (let i = 0; i < dids.length; i += CONSTS.LIMIT_OF_FETCH_PROFILES) {
    const response = await mainState.atp.fetchProfiles(
      dids.slice(i, i + CONSTS.LIMIT_OF_FETCH_PROFILES)
    )
    if (response instanceof Error) {
      target.processing = false
      mainState.openErrorPopup(response, "MutingUsersPopup/fetchScopedMuteUsers")
      return
    }
    users.push(...response)
  }
  target.processing = false
  target.fetched = true

  // 取得中に解除したユーザーは除く
  const mutedDids = new Set(
    (tab === "repost" ? mainState.repostMutes : mainState.quoteMutes)
      .map((subject) => subject.did)
  )
  target.users = users.filter((user) => mutedDids.has(user.did))
}

function scrolledToBottom () {
  if (state.tab !== "mute") {
    return
  }
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
      <!-- ミュート種別タブ -->
      <div class="tab">
        <!-- ミュート種別タブ - ミュート -->
        <button
          type="button"
          class="tab__button"
          :data-focused="state.tab === 'mute'"
          @click="changeTab('mute')"
        >
          <SVGIcon name="volumeOff" />
          <span>{{ $t("mute") }}</span>
        </button>

        <!-- ミュート種別タブ - リポスト -->
        <button
          type="button"
          class="tab__button"
          :data-focused="state.tab === 'repost'"
          @click="changeTab('repost')"
        >
          <SVGIcon name="repostOff" />
          <span>{{ $t("repost") }}</span>
        </button>

        <!-- ミュート種別タブ - 引用リポスト -->
        <button
          type="button"
          class="tab__button"
          :data-focused="state.tab === 'quote'"
          @click="changeTab('quote')"
        >
          <SVGIcon name="quoteRepostOff" />
          <span>{{ $t("quoteRepost") }}</span>
        </button>
      </div>

      <LoadButton
        v-if="state.tab === 'mute'"
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
    </template>
    <template #body>
      <!-- ミュート -->
      <div
        v-if="state.tab === 'mute'"
        class="users"
      >
        <UserBox
          v-for="user of mainState.currentMutingUsers"
          :key="user.did"
          class="user"
          :user="user"
          :menuDisplay="true"
          :contentWarningDisabled="false"
          :viewerDisplay="true"
          @link="close"
        />
      </div>

      <!-- リポストミュート・引用リポストミュート -->
      <template v-else>
        <p class="notice">{{ $t("scopedMuteNotice") }}</p>
        <Loader v-if="state[state.tab].processing" />
        <NoContent v-if="
          !state[state.tab].processing &&
          state[state.tab].users.length === 0
        "/>
        <div class="scoped-users">
          <div
            v-for="user of state[state.tab].users"
            :key="user.did"
            class="scoped-user"
          >
            <UserBox
              :user="user"
              :menuDisplay="true"
              :contentWarningDisabled="false"
              :viewerDisplay="true"
              @link="close"
            />
            <RepostMuteButton
              v-if="state.tab === 'repost'"
              :did="user.did"
              :hasLabel="true"
            />
            <QuoteMuteButton
              v-else
              :did="user.did"
              :hasLabel="true"
            />
          </div>
        </div>
      </template>
    </template>
    <template #footer>
      <LoadButton
        v-if="state.tab === 'mute'"
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
    // タブ切り替え時に高さが変わらないよう、最大の高さで固定する
    flex-grow: 1;

    &-header > h2 > .svg-icon {
      fill: rgb(var(--notice-color));
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

.notice {
  color: rgb(var(--fg-color), 0.75);
  font-size: 0.875rem;
  line-height: var(--line-height-high);
}

.scoped-users {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
}

.scoped-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  grid-gap: 0.5rem;
  position: relative;

  & > .user-box {
    cursor: pointer;
    width: 100%;
  }

  & > .repost-mute-button,
  & > .quote-mute-button {
    font-size: 0.875rem;
    padding: 0.25rem 1rem;
  }
}

.loader {
  position: unset;
}
</style>
