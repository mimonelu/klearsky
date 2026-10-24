<script lang="ts" setup>
import { computed, inject, reactive } from "vue"
import ListCard from "@/components/next/List/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/ScrollObserver.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

// 追加読み込み中フラグ
// 初回の読み込み中は `mainState.listLoaderDisplay` （ `processPage()` が管理）
const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

// 初回の読み込み中または追加読み込み中
const listLoading = computed((): boolean => {
  return mainState.listLoaderDisplay || state.processing
})

async function fetchListItems (direction: "new" | "old") {
  Util.blurElement()
  state.processing = true
  const result = await mainState.fetchCurrentListItems(direction)
  state.processing = false

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
    !listLoading.value
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
      @deleteList="deleteList as unknown"
    />
    <div
      v-else
      class="list-users__list-card-skeleton"
    />
    <LoadButton
      direction="new"
      :processing="listLoading"
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
      :processing="listLoading"
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
