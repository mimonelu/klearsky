<script lang="ts" setup>
import { inject, watch } from "vue"
import ListCard from "@/components/list/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import UserBox from "@/components/app-parts/UserBox.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function fetchListItems (direction: "new" | "old") {
  Util.blurElement()
  mainState.listProcessing = true
  await mainState.fetchCurrentListItems(direction)
  mainState.listProcessing = false
}

// マイリストの削除
async function deleteList (list: TTList) {
  if (list.creator.did !== mainState.atp.session?.did) return
  const targetIndex = mainState.myList.findIndex((myList: TTList) => {
    return myList.uri === list.uri
  })
  if (targetIndex === - 1) return
  mainState.myList.splice(targetIndex, 1)
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchListItems("old")
})
</script>

<template>
  <div class="list-users">
    <Portal to="home-view-header-top">
      <!-- マイリストポップアップトリガー -->
      <button
        class="my-list-trigger"
        @click.stop="mainState.openMyListPopup"
      >
        <SVGIcon name="list" />
      </button>
    </Portal>
    <ListCard
      v-if="mainState.currentList"
      :list="mainState.currentList"
      :createDisplay="true"
      :unclickable="true"
      @deleteList="deleteList"
    />
    <div
      v-else
      class="list-users__list-card-skeleton"
    />
    <LoadButton
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchListItems('new')"
    />
    <div class="list-users__list-item-container">
      <UserBox
        v-for="listItem of mainState.currentListItems"
        :key="listItem.uri"
        :user="listItem.subject"
        :contentWarningDisabled="true"
        :menuDisplay="true"
      />
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listProcessing"
      @activate="fetchListItems('old')"
    />
  </div>
</template>

<style lang="scss" scoped>
.list-users {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__list-card-skeleton {
    border-bottom: 1px solid var(--fg-color-025);
    min-height: 8rem;
  }

  &__list-item-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
}

.list-card {
  border-bottom: 1px solid var(--fg-color-025);
}

.user-box {
  padding: 1em;
  &:not(:last-child) {
    border-bottom: 1px solid var(--fg-color-0125);
  }
}
</style>
