<script lang="ts" setup>
import { computed, inject, reactive } from "vue"
import ListCardList from "@/components/next/List/ListCardList.vue"
import ScrollObserver from "@/components/next/ScrollObserver/ScrollObserver.vue"

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

const lists = computed((): Array<TTList> => {
  return mainState.isMyProfile()
    ? mainState.myLists!.items
    : mainState.currentAuthorLists
})

async function fetchLists (direction: "new" | "old") {
  // マイリストは起動時にすべて読み込むため取得不要
  if (mainState.isMyProfile()) return

  state.processing = true
  await mainState.fetchAuthorLists(direction)
  state.processing = false
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !listLoading.value
  ) {
    fetchLists("old")
  }
}
</script>

<template>
  <div class="author-list">
    <!-- リスト一覧 -->
    <ListCardList
      :lists="lists"
      :headerDisplay="mainState.isMyProfile()"
      :loaderDisplay="!mainState.isMyProfile()"
      :isCompact="false"
      :processing="listLoading"
      @fetch="fetchLists as unknown"
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
