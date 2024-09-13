<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import ListCard from "@/components/cards/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
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

const router = useRouter()

function fetchLists (direction: "new" | "old") {
  Util.blurElement()
  emit("fetch", direction)
}

async function updateMylist () {
  Util.blurElement()
  if (!await mainState.openConfirmationPopup({
    title: $t("confirmation"),
    text: $t("myListConfirmation"),
  })) return
  mainState.myLists!.items.splice(0)
  mainState.loaderDisplay = true
  await mainState.myLists!.fetchAll()
  mainState.myFeeds!.synchronizeToMyList()
  mainState.loaderDisplay = false

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
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
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

function deleteList (list: TTList) {
  if (!mainState.myLists!.remove(list.uri)) return

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

function clicked (list?: TTList) {
  emit("clicked", list)
}
</script>

<template>
  <div class="list-card-list">
    <!-- リストヘッダー -->
    <div
      v-if="headerDisplay"
      class="list-card-list__header group-buttons"
    >
      <!-- マイリスト更新ボタン -->
      <button
        class="button--bordered list-card-list__update-button"
        @click.prevent="updateMylist"
      >
        <SVGIcon name="refresh" />
        <span>{{ $t("listUpdate") }}</span>
      </button>

      <!-- マイリスト作成ボタン -->
      <button
        class="button list-card-list__create-button"
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
      class="textlabel list-card-list__nolist"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noList") }}
      </div>
    </div>

    <div class="list-card-list__container">
      <ListCard
        v-for="list of state.lists"
        v-slot="{ list }"
        :key="list.uri"
        :list="list"
        :isCompact="isCompact"
        :menuDisplay="true"
        :detailDisplay="router.currentRoute.value.name === 'profile-list'"
        :orderButtonDisplay="false"
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
.list-card-list {
  display: flex;
  flex-direction: column;

  &__header {
    justify-content: flex-end;
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

  &__container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    grid-gap: 1px;
  }
}
</style>
