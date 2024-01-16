<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import ListCard from "@/components/list/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params: any): void}>()

const props = defineProps<{
  lists: Array<TTList>
  headerDisplay: boolean
  loaderDisplay: boolean
  isCompact: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  lists: ComputedRef<Array<TTList>>
}>({
  lists: computed((): Array<TTList> => {
    return Array.from(props.lists)
      .sort((a: TTList, b: TTList): number => {
        const aTerm = a.name || a.indexedAt
        const bTerm = b.name || b.indexedAt
        return aTerm < bTerm ? - 1 : aTerm > bTerm ? 1 : 0
      })
  }),
})

function fetchLists (direction: "new" | "old") {
  Util.blurElement()
  emit("fetch", direction)
}

async function updateMylist () {
  Util.blurElement()
  if (!await mainState.openConfirmationPopup(
    $t("confirmation"),
    $t("myListConfirmation")
  )) return
  mainState.myList.splice(0)
  mainState.loaderDisplay = true
  await mainState.fetchMyLists()
  mainState.loaderDisplay = false

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myList)
}

function openListEditPopup () {
  Util.blurElement()
  mainState.openListEditPopup({
    mode: "create",
    callback: addList,
  })
}

function addList (list: TTList) {
  props.lists.unshift(list)

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myList)
}

function deleteList (list: TTList) {
  const targetIndex = props.lists.findIndex((myList: TTList) => {
    return myList.uri === list.uri
  })
  if (targetIndex === - 1) return
  props.lists.splice(targetIndex, 1)

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myList)
}

function clicked (list?: TTList) {
  emit("clicked", list)
}
</script>

<template>
  <div class="lists">
    <!-- リストヘッダー -->
    <div
      v-if="headerDisplay"
      class="lists__header"
    >
      <!-- マイリスト更新ボタン -->
      <button
        class="button--bordered lists__update-button"
        @click.prevent="updateMylist"
      >
        <SVGIcon name="refresh" />
        <span>{{ $t("listUpdate") }}</span>
      </button>

      <!-- マイリスト作成ボタン -->
      <button
        class="button lists__create-button"
        @click.prevent="openListEditPopup"
      >
        <SVGIcon name="plus" />
        <span>{{ $t("listAdd") }}</span>
      </button>
    </div>

    <LoadButton
      v-if="loaderDisplay"
      direction="new"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchLists('new')"
    />

    <!-- 空リストメッセージ -->
    <div
      v-if="!mainState.listLoaderDisplay && state.lists.length === 0"
      class="textlabel lists__nolist"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noList") }}
      </div>
    </div>

    <div class="lists__list-card-container">
      <ListCard
        v-for="list of state.lists"
        v-slot="{ list }"
        :key="list.uri"
        :list="list"
        :isCompact="isCompact"
        :createDisplay="false"
        @click="clicked(list)"
        @close="$emit('close')"
        @deleteList="deleteList"
        @onActivateMention="$emit('onActivateMention')"
        @onActivateHashTag="$emit('onActivateHashTag')"
      >
        <slot :list="list" />
      </ListCard>
    </div>
    <LoadButton
      v-if="loaderDisplay"
      direction="old"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchLists('old')"
    />
  </div>
</template>

<style lang="scss" scoped>
.lists {
  display: flex;
  flex-direction: column;

  &__header {
    border-bottom: 1px solid var(--fg-color-025);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    grid-gap: 0.25rem;
    padding: 0.25rem;
  }

  // マイリスト更新ボタン
  // マイリスト作成ボタン
  &__update-button,
  &__create-button {
    font-size: 0.875rem;
  }

  &__nolist {
    margin: 1rem;
  }

  &__list-card-container {
    flex-grow: 1;
  }
}

.list-card:not(:last-child) {
  border-bottom: 1px solid var(--fg-color-0125);
}
</style>
