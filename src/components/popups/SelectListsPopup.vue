<script lang="ts" setup>
import { inject } from "vue"
import Lists from "@/components/list/Lists.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  checkedLists: { [k: string]: string }
}>()

const mainState = inject("state") as MainState

const NUMBER_OF_SELECTABLE_LISTS = 3

function close () {
  emit("close")
}

function clicked (list: TTList) {

  if (props.checkedLists[list.uri] == null) {
    // 許可リストの上限チェック
    // TODO: リプライ制限の構成要素は5つまでだが、簡便のため許可リストに上限を設けている。要検討
    if (Object.keys(props.checkedLists).length >= NUMBER_OF_SELECTABLE_LISTS) return

    props.checkedLists[list.uri] = list.name
  } else {
    delete props.checkedLists[list.uri]
  }
}
</script>

<template>
  <Popup
    class="select-lists-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="list" />
        <span>{{ $t("selectLists") }}</span>
      </h2>
    </template>
    <template #body>
      <p class="select-lists-popup__notification">{{ $t("selectListsNotification") }}{{ NUMBER_OF_SELECTABLE_LISTS }}</p>

      <!-- リスト一覧 -->
      <Lists
        v-slot="{ list }"
        :lists="mainState.myList"
        :headerDisplay="false"
        :loaderDisplay="false"
        :isCompact="true"
        @clicked="clicked"
      >
        <!-- リストチェックアイコン -->
        <div
          class="list-card__check-icon"
          :data-checked="checkedLists[list.uri] != null"
        >
          <SVGIcon :name="checkedLists[list.uri] != null ? 'check' : 'minus'" />
        </div>
      </Lists>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.select-lists-popup {
  &__notification {
    margin: 1rem 1rem 0;
  }

  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--accent-color));
      }

      &-body {
        padding: 0;
      }
    }

    .list-card {
      cursor: pointer;
      flex-direction: row;
      align-items: flex-end;
      grid-gap: 1em;
      &:first-child {
        border-top: 1px solid var(--fg-color-0125);
      }
    }
  }
}
</style>

