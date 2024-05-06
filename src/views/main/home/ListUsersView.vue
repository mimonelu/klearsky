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
  mainState.listLoaderDisplay = true
  const result = await mainState.fetchCurrentListItems(direction)
  mainState.listLoaderDisplay = false

  // セッションキャッシュの更新
  if (result) mainState.myWorker.setSessionCache("myList", mainState.myLists.items)
}

// マイリストの削除
async function deleteList (list: TTList) {
  if (!mainState.myLists.remove(list.uri)) return

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)
}

function openListUserManagementPopup (user: TTUser) {
  mainState.openListUserManagementPopup({ user })
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchListItems("old")
})
</script>

<template>
  <div class="list-users">
    <ListCard
      v-if="mainState.currentList"
      :list="mainState.currentList"
      :toggleDisplay="true"
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
        :contentWarningDisabled="true"
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
  </div>
</template>

<style lang="scss" scoped>
.list-users {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__list-card-skeleton {
    border-bottom: 1px solid var(--fg-color-0125);
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

.list-card {
  border-bottom: 1px solid var(--fg-color-0125);
}

.user-box {
  padding: 1em;
  &:not(:last-child) {
    border-bottom: 1px solid var(--fg-color-0125);
  }
}
</style>
