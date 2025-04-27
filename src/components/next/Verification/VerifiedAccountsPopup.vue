<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  accounts: any[]
}>({
  processing: false,
  accounts: [],
})

onBeforeMount(async () => {
  await fetchContinuousResults("new")
})

function onClickAccount (event: MouseEvent) {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return
  }
  close()
}

function close () {
  emit("close")
}

let cursor: undefined | string

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (
    state.processing ||
    mainState.verifiedAccountsPopupProps.did == null
  ) {
    return
  }
  state.processing = true
  const response = await mainState.atp.fetchRecords(
    mainState.verifiedAccountsPopupProps.did,
    "app.bsky.graph.verification",
    100,
    direction === "old" ? cursor : undefined,
    false
  )
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "VerifiedAccountsPopup/fetchContinuousResults")
    return
  }
  const newRecords = response.records.filter((record) => {
    return state.accounts.every((account) => {
      return account.uri !== record.uri
    })
  })
  if (direction === "new") {
    state.accounts.unshift(...newRecords)
  } else if (direction === "old") {
    state.accounts.push(...newRecords)
  }
  if ((
    response.cursor != null && (
      direction === "old" ||
      cursor == null
    )
  )) {
    cursor = response.cursor
  }
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}
</script>

<template>
  <Popup
    class="verified-accounts-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="verified" />
        <span>{{ $t("verifiedAccounts") }}</span>
        <template v-if="mainState.verifiedAccountsPopupProps.displayName">
          <span>-</span>
          <span>{{ mainState.verifiedAccountsPopupProps.displayName }}</span>
        </template>
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
      <div class="verified-accounts-popup__accounts">
        <RouterLink
          v-for="account of state.accounts"
          :key="account.uri"
          :to="{
            path: '/profile/feeds',
            query: { account: account.value.subject },
          }"
          class="verified-accounts-popup__account"
          @click="onClickAccount"
        >
          <SVGIcon name="verified" />
          <div class="verified-accounts-popup__account__display-name">{{ account.value.displayName || "&nbsp;" }}</div>
          <div class="verified-accounts-popup__account__handle">{{ account.value.handle }}</div>
          <div class="verified-accounts-popup__account__created-at">{{ mainState.formatDate(account.value.createdAt) }}</div>
        </RouterLink>
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
.verified-accounts-popup {
  &:deep(.popup) {
    .popup-header {
      .svg-icon {
        --fg-color: var(--accent-color);
      }

      span:first-of-type {
        overflow: unset;
      }
    }

    .popup-body {
      padding: 0;
    }
  }

  &__accounts {
    display: flex;
    flex-direction: column;
  }

  &__account {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "i d d"
      "i h c";
    gap: 0 0.5rem;
    align-items: center;
    justify-content: start;
    padding: 1rem;
    &:hover,
    &:focus {
      background-color: rgb(var(--fg-color), 0.05);
    }

    .svg-icon--verified {
      grid-area: i;
      fill: rgb(var(--accent-color));
      font-size: 1.5rem;
    }

    &__display-name {
      grid-area: d;
      font-weight: bold;
      line-height: var(--line-height-high);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__handle {
      grid-area: h;
      color: rgb(var(--fg-color), 0.5);
      font-size: 0.875rem;
      line-height: var(--line-height-middle);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__created-at {
      grid-area: c;
      color: rgb(var(--fg-color), 0.5);
      font-size: 0.875rem;
      line-height: var(--line-height-middle);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
