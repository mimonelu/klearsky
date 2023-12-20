<script lang="ts" setup>
import { inject } from "vue"
import Lists from "@/components/list/Lists.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const mainState = inject("state") as MainState

function openListEditPopup () {
  mainState.openListEditPopup({
    mode: "create",
    callback: addList,
  })
}

function addList (list: TTList) {
  mainState.currentAuthorLists.unshift(list)
}
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
        <span>{{ $t("listCreate") }}</span>
      </button>
    </div>

    <!-- リスト一覧 -->
    <Lists :lists="mainState.currentAuthorLists" />
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
