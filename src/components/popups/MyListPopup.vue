<script lang="ts" setup>
import { inject } from "vue"
import Lists from "@/components/list/Lists.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

function close () {
  emit("close")
}

function openListEditPopup () {
  mainState.openListEditPopup({
    mode: "create",
    callback: addList,
  })
}

function onClicked () {
  close()
}

async function fetchLists (direction: "new" | "old") {
  mainState.listProcessing = true
  await mainState.fetchMyLists(direction)
  mainState.listProcessing = false
}

function addList (list: TTList) {
  mainState.myList.unshift(list)
}
</script>

<template>
  <Popup
    class="my-list-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="fetchLists('old')"
  >
    <template #header>
      <h2>
        <!-- リスト作成ボタン -->
        <button
          class="button my-list-popup__create-button"
          @click.prevent.stop="openListEditPopup"
        >
          <span>{{ $t("listCreate") }}</span>
        </button>

        <SVGIcon name="list" />
        <span>{{ $t("myList") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- リスト一覧 -->
      <Lists
        :lists="mainState.myList"
        @clicked="onClicked"
        @fetch="fetchLists"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-list-popup {
  &:deep() {
    .popup-header > h2 {
      margin-left: 1.5rem;

      & > .svg-icon {
        fill: rgb(var(--accent-color));
      }
    }

    .popup-body {
      padding: 0;
    }
  }

  // リスト作成ボタン
  &__create-button {
    font-size: 0.75rem;
    position: absolute;
    left: 0.5rem;
  }
}
</style>
