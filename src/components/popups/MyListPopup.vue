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

function addList (list: TTList) {
  mainState.myList.unshift(list)
}
</script>

<template>
  <Popup
    class="my-list-popup"
    :hasCloseButton="true"
    @close="close"
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
        :loaderDisplay="false"
        :isCompact="false"
        :unclickable="false"
        @clicked="onClicked"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-list-popup {
  &:deep() {
    .popup {
      flex-grow: 1;
      height: 100%;

      &-header > h2 {
        margin-left: 1.5rem;

        & > .svg-icon {
          fill: rgb(var(--accent-color));
        }
      }

      &-body {
        padding: 0;
      }
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
