<script lang="ts" setup>
import { inject } from "vue"
import ListCard from "@/components/cards/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function fetchListItems (direction: "new" | "old") {
  Util.blurElement()
  mainState.listLoaderDisplay = true
  const result = await mainState.fetchCurrentListItems(direction)
  mainState.listLoaderDisplay = false

  // セッションキャッシュの更新
  if (result) mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

// マイリストの削除
async function deleteList (list: TTList) {
  if (!mainState.myLists!.remove(list.uri)) return

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

function openListUserManagementPopup (user: TTUser) {
  mainState.openListUserManagementPopup({ user })
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !mainState.listLoaderDisplay
  ) {
    fetchListItems("old")
  }
}
</script>

<template>
  <div class="list-users">
    <ListCard
      v-if="mainState.currentList"
      :list="mainState.currentList"
      :menuDisplay="true"
      :detailDisplay="false"
      :orderButtonDisplay="false"
      @deleteList="deleteList"
    />
    <div
      v-else
      class="list-users__list-card-skeleton"
    />
    <LoadButton
      direction="new"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchListItems('new')"
    />
    <div class="list-users__list-item-container">
      <UserBox
        v-for="listItem of mainState.currentListItems"
        :key="listItem.uri"
        :user="listItem.subject"
        :contentWarningDisabled="false"
        :menuDisplay="true"
        :viewerDisplay="true"
      >
        <template #bottom>
          <!-- リスト管理ボタン -->
          <button
            class="button list-users__manage-button"
            @click.prevent="openListUserManagementPopup(listItem.subject)"
          >
            <SVGIcon name="list" />
            <span>{{ $t("listUserManagement") }}</span>
          </button>
        </template>
      </UserBox>
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchListItems('old')"
    />

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.list-users {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__list-card-skeleton {
    min-height: 8rem;
  }

  &__list-item-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  &__manage-button {
    font-size: 0.875rem;
  }
}

.user-box {
  padding: 1em;
}
</style>
