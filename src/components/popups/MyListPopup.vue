<script lang="ts" setup>
import { inject } from "vue"
import ListCardList from "@/components/lists/ListCardList.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

function close () {
  emit("close")
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
        <SVGIcon name="list" />
        <span>{{ $t("myList") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- リスト一覧 -->
      <ListCardList
        :lists="mainState.myLists!.items"
        :headerDisplay="true"
        :loaderDisplay="false"
        :isCompact="false"
        @close="close"
        @onActivateMention="close"
        @onActivateHashTag="close"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-list-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--list-color));
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
