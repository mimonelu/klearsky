<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import ListCardList from "@/components/lists/ListCardList.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  lists: ComputedRef<Array<TTList>>
}>({
  lists: computed((): Array<TTList> => {
    return mainState.isMyProfile()
      ? mainState.myLists!.items
      : mainState.currentAuthorLists
  }),
})

async function fetchLists (direction: "new" | "old") {
  // マイリストは起動時にすべて読み込むため取得不要
  if (mainState.isMyProfile()) return

  mainState.listLoaderDisplay = true
  await mainState.fetchAuthorLists(direction)
  mainState.listLoaderDisplay = false
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !mainState.listLoaderDisplay
  ) {
    fetchLists("old")
  }
}
</script>

<template>
  <div class="author-list">
    <!-- リスト一覧 -->
    <ListCardList
      :lists="state.lists"
      :headerDisplay="mainState.isMyProfile()"
      :loaderDisplay="!mainState.isMyProfile()"
      :isCompact="false"
      @fetch="fetchLists"
    />

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.author-list {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

// リスト一覧
.list-card-list {
  flex-grow: 1;
}
</style>
