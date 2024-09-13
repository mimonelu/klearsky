<script lang="ts" setup>
import { computed, inject, reactive, watch, type ComputedRef } from "vue"
import ListCardList from "@/components/lists/ListCardList.vue"

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

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchLists("old")
})
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
