<script lang="ts" setup>
import { computed, inject, reactive, watch, type ComputedRef } from "vue"

const mainState = inject("state") as MainState

const state = reactive<{
  numberOfStarterPacks: ComputedRef<number>
}>({
  numberOfStarterPacks: computed((): number => {
    return mainState.currentProfile?.associated?.starterPacks ?? 0
  }),
})

async function fetchLists (direction: "new" | "old") {
  // マイリストは起動時にすべて読み込むため取得不要
  if (mainState.isMyProfile()) return

  // mainState.listLoaderDisplay = true
  // await mainState.fetchAuthorLists(direction)
  // mainState.listLoaderDisplay = false
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchLists("old")
})
</script>

<template>
  <div class="author-starter-packs">
    {{ state.numberOfStarterPacks }}
  </div>
</template>

<style lang="scss" scoped>
.author-starter-packs {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
