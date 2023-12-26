<script lang="ts" setup>
import { computed, inject, reactive, watch, type ComputedRef } from "vue"
import Lists from "@/components/list/Lists.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  lists: ComputedRef<Array<TTList>>
}>({
  lists: computed((): Array<TTList> => {
    return mainState.isMyProfile()
      ? mainState.myList
      : mainState.currentAuthorLists
  }),
})

function openListEditPopup () {
  mainState.openListEditPopup({
    mode: "create",
    callback: addList,
  })
}

async function fetchLists (direction: "new" | "old") {
  // マイリストは起動時にすべて読み込むため取得不要
  if (mainState.isMyProfile()) return

  mainState.listProcessing = true
  await mainState.fetchAuthorLists(direction)
  mainState.listProcessing = false
}

function addList (list: TTList) {
  state.lists.unshift(list)
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchLists("old")
})
</script>

<template>
  <div class="author-list">
    <div
      v-if="mainState.isMyProfile()"
      class="author-list__header"
    >
      <!-- リスト作成ボタン -->
      <button
        class="button author-list__create-button"
        @click.prevent="openListEditPopup"
      >
        <SVGIcon name="plus" />
        <span>{{ $t("listAdd") }}</span>
      </button>
    </div>

    <!-- リスト一覧 -->
    <Lists
      :lists="state.lists"
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

  &__header {
    background-color: var(--fg-color-0125);
    border-bottom: 1px solid var(--fg-color-025);
    padding: 0.25rem;
  }

  // リスト作成ボタン
  &__create-button {
    font-size: 0.875rem;
    margin-left: auto;
  }
}

// リスト一覧
.lists {
  flex-grow: 1;
}
</style>
