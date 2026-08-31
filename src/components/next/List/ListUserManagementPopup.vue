<script lang="ts" setup>
import { computed, inject, onMounted, reactive, type ComputedRef } from "vue"
import ListCardList from "@/components/next/List/ListCardList.vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import CONSTS from "@/consts/consts.json"

// リストURIからリストユーザーURIへのマップ
// NOTE: キーが存在する＝対象ユーザーがそのリストに所属している
interface TTListItemUriMap { [listUri: string]: string }

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user?: TTUser
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
  loaderDisplayMap: { [k: string]: boolean }

  // マイリストにおける自分が作成したリストの配列
  lists: ComputedRef<Array<TTList>>

  // 各リストにおける対象ユーザーの listItemUri マップ
  listItemUriMap: TTListItemUriMap
}>({
  loaderDisplay: false,
  loaderDisplayMap: {},

  // マイリストにおける自分が作成したリストの配列
  lists: computed((): Array<TTList> => {
    return mainState.myLists!.items.filter((list: TTList) => {
      return list.creator.did === mainState.atp.session?.did
    })
  }),

  listItemUriMap: {},
})

onMounted(() => {
  fetchListsWithMembership()
})

// 対象ユーザーの所属リストを取得
// NOTE: リファレンスリストには含まれない
async function fetchListsWithMembership () {
  if (props.user == null) return
  state.loaderDisplay = true
  let cursor: undefined | string = undefined
  for (let i = 0; i < CONSTS.LIMIT_OF_FETCH_LISTS_WITH_MEMBERSHIP_ITERATION; i ++) {
    const response = await mainState.atp.fetchListsWithMembership(
      props.user.did,
      CONSTS.LIMIT_OF_FETCH_LISTS_WITH_MEMBERSHIP,
      cursor
    )
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "ListUserManagementPopup/fetchListsWithMembership")
      break
    }
    response.actors.forEach((actor) => {
      state.listItemUriMap[actor.listUri] = actor.listItemUri
    })
    if (response.cursor == null) break
    cursor = response.cursor
  }
  state.loaderDisplay = false
}

function close () {
  emit("close")
}

function isReferenceList (list: TTList): boolean {
  return list.purpose === "app.bsky.graph.defs#referencelist"
}

function clicked (list: TTList) {
  // リファレンスリストは追加／削除ボタンで個別に処理する
  if (isReferenceList(list)) {
    return
  }
  if (state.listItemUriMap[list.uri] != null) {
    removeUser(list)
  } else {
    addUser(list)
  }
}

async function addUser (list: TTList) {
  if (props.user == null || state.loaderDisplayMap[list.uri]) {
    return
  }
  state.loaderDisplayMap[list.uri] = true

  // リファレンスリストは所属判定ができないため、追加実行時にオンデマンドで既存チェックを行う
  if (state.listItemUriMap[list.uri] == null && isReferenceList(list)) {
    const foundListItemUri = await findListItemUri(list.uri, props.user.did)
    if (foundListItemUri != null) {
      // 既に追加済み
      state.listItemUriMap[list.uri] = foundListItemUri
      state.loaderDisplayMap[list.uri] = false
      mainState.openMessagePopup({
        title: $t("error"),
        text: $t("listUserAlreadyInList"),
      })
      return
    }
  }
  if (state.listItemUriMap[list.uri] != null) {
    state.loaderDisplayMap[list.uri] = false
    mainState.openMessagePopup({
      title: $t("error"),
      text: $t("listUserAlreadyInList"),
    })
    return
  }

  const listItemUri = await mainState.atp.createListUser(list.uri, props.user.did)
  state.loaderDisplayMap[list.uri] = false
  if (listItemUri instanceof Error) {
    mainState.openErrorPopup(listItemUri, "ListUserManagementPopup/addUser")
    return
  }
  state.listItemUriMap[list.uri] = listItemUri

  // リストユーザー数をインクリメント
  if (list.listItemCount != null) {
    list.listItemCount ++
  }

  syncCurrentListItems("add", list, listItemUri)

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

async function removeUser (list: TTList) {
  if (props.user == null || state.loaderDisplayMap[list.uri]) {
    return
  }
  state.loaderDisplayMap[list.uri] = true

  // リファレンスリストは所属判定ができないため、削除実行時にオンデマンドで listItemUri を検索する
  let listItemUri = state.listItemUriMap[list.uri]
  if (listItemUri == null) {
    const foundListItemUri = await findListItemUri(list.uri, props.user.did)
    if (foundListItemUri == null) {
      state.loaderDisplayMap[list.uri] = false
      mainState.openMessagePopup({
        title: $t("error"),
        text: $t("listUserNotFoundInList"),
      })
      return
    }
    listItemUri = foundListItemUri
  }

  const result = await mainState.atp.deleteListUser(listItemUri)
  state.loaderDisplayMap[list.uri] = false
  if (result instanceof Error) {
    mainState.openErrorPopup(result, "ListUserManagementPopup/removeUser")
    return
  }
  delete state.listItemUriMap[list.uri]

  // リストユーザー数をデクリメント
  if (list.listItemCount != null) {
    list.listItemCount --
  }

  syncCurrentListItems("remove", list, listItemUri)

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

// 指定リストのメンバーをページングしながら検索し、対象ユーザーの listItemUri を特定する
async function findListItemUri (listUri: string, userDid: string): Promise<undefined | string> {
  const items: Array<TTListItem> = []
  let cursor = undefined
  for (let i = 0; i < CONSTS.LIMIT_OF_FETCH_MY_LIST_USERS_ITERATION; i ++) {
    const result = await mainState.atp.fetchListItems(
      items,
      listUri,
      CONSTS.LIMIT_OF_FETCH_MY_LIST_USERS,
      cursor
    )
    const found = items.find((item: TTListItem) => item.subject.did === userDid)
    if (found != null) {
      return found.uri
    }
    if (result instanceof Error || result == null) {
      break
    }
    cursor = result
  }
  return undefined
}

// 現在表示中のリストユーザー一覧との同期
function syncCurrentListItems (type: "add" | "remove", list: TTList, listItemUri: string) {
  if (props.user == null || mainState.currentList?.uri !== list.uri) {
    return
  }
  if (type === "remove") {
    const currentListItemIndex = mainState.currentListItems.findIndex((listItem: TTListItem) => {
      return listItem.subject.did === props.user?.did
    })
    if (currentListItemIndex === - 1) {
      return
    }
    mainState.currentListItems.splice(currentListItemIndex, 1)
  } else {
    mainState.currentListItems.unshift({
      uri: listItemUri,
      subject: props.user,
    })
  }
}
</script>

<template>
  <Popup
    class="list-user-management-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="list" />
        <span>{{ $t("listUserManagementDetail") }}</span>
      </h2>
    </template>
    <template #header-after>
      <!-- 対象リストユーザー -->
      <UserBox
        v-if="user != null"
        :user="user"
        :menuDisplay="false"
        :contentWarningDisabled="false"
        :viewerDisplay="true"
      />
    </template>
    <template #body>
      <!-- リスト一覧 -->
      <ListCardList
        v-slot="{ list }"
        :lists="state.lists"
        :headerDisplay="false"
        :loaderDisplay="false"
        :isCompact="true"
        @clicked="clicked as (...args: unknown[]) => void"
      >
        <!-- リファレンスリスト: 所属判定不能のため追加／削除ボタンを常設 -->
        <div
          v-if="isReferenceList(list)"
          class="list-card__reference-buttons"
        >
          <button
            type="button"
            class="button--important"
            @click.stop.prevent="removeUser(list)"
          >
            <SVGIcon name="remove" />
            <span>{{ $t("delete") }}</span>
          </button>
          <button
            type="button"
            class="button"
            @click.stop.prevent="addUser(list)"
          >
            <SVGIcon name="plus" />
            <span>{{ $t("add") }}</span>
          </button>
        </div>

        <!-- 通常のリスト: 所属フラグアイコン -->
        <div
          v-else
          class="list-card__check-icon"
          :data-checked="state.listItemUriMap[list.uri] != null"
        >
          <SVGIcon :name="state.listItemUriMap[list.uri] != null ? 'check' : 'minus'" />
        </div>

        <Loader v-if="state.loaderDisplayMap[list.uri] ?? false" />
      </ListCardList>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.list-user-management-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--list-color));
      }

      &-body {
        grid-gap: 0;
        padding: 0;
      }
    }

    .list-card {
      flex-direction: row;
      align-items: flex-end;
      grid-gap: 1em;
      &:not([data-purpose="referencelist"]) {
        cursor: pointer;
      }

      // リファレンスリストは追加／削除ボタンを詳細情報の下に配置
      &[data-purpose="referencelist"] {
        flex-direction: column;
        align-items: stretch;
        margin-left: 2.5rem;

        .list-card__detail {
          order: 0;
        }

        .list-card__reference-buttons {
          order: 1;
        }
      }
    }

    // リファレンスリストの追加／削除ボタン
    .list-card__reference-buttons {
      display: flex;
      justify-content: flex-end;
      grid-gap: 0.5em;

      & > button {
        display: flex;
        align-items: center;
        grid-gap: 0.375em;
        cursor: pointer;
        font-size: 0.875em;
        white-space: nowrap;
      }
    }
  }

  // 対象リストユーザー
  .user-box {
    background-color: rgb(var(--bg-color));
    padding: 1em;
    pointer-events: none;
    position: sticky;
    top: 0;
    z-index: 1;
  }
}
</style>
