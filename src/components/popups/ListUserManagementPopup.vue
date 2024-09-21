<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import ListCardList from "@/components/lists/ListCardList.vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"

interface TTUserMap { [k: string]: boolean }

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user?: TTUser
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplayMap: { [k: string]: boolean }

  // マイリストにおける自分が作成したリストの配列
  lists: ComputedRef<Array<TTList>>

  // 各リストにおける対象ユーザーの存在フラグマップ
  userMap: ComputedRef<TTUserMap>
}>({
  loaderDisplayMap: {},

  // マイリストにおける自分が作成したリストの配列
  lists: computed((): Array<TTList> => {
    return mainState.myLists!.items.filter((list: TTList) => {
      return list.creator.did === mainState.atp.session?.did
    })
  }),

  // 各リストにおける対象ユーザーの存在フラグマップ
  userMap: computed((): TTUserMap => {
    if (props.user == null) return {}
    const map: TTUserMap = {}
    state.lists.forEach((list: TTList) => {
      map[list.uri] = (list.items?.findIndex((listItem: TTListItem) => {
        return listItem.subject.did === props.user?.did
      }) ?? - 1) !== - 1
    })
    return map
  }),
})

function close () {
  emit("close")
}

async function clicked (list: TTList) {
  if (state.loaderDisplayMap[list.uri]) return
  if (props.user == null) return

  // 対象マイリスト
  const myList = state.lists.find((myList: TTList) => {
    return myList.uri === list.uri
  })
  if (myList?.items == null) return

  if (state.userMap[list.uri]) {
    // リストユーザーをマイリストから削除
    const listItemIndex = myList.items.findIndex((listItem: TTListItem) => {
      return listItem.subject.did === props.user?.did
    })
    if (listItemIndex === - 1) return
    const listItem = myList.items[listItemIndex]
    state.loaderDisplayMap[list.uri] = true
    const result = await mainState.atp.deleteListUser(listItem.uri)
    state.loaderDisplayMap[list.uri] = false
    if (result instanceof Error) {
      // TODO:
      return
    }
    myList.items.splice(listItemIndex, 1)

    // リストユーザー数をデクリメント
    if (list.listItemCount != null) {
      list.listItemCount --
    }

    // リストユーザーを現在のリストから削除
    if (mainState.currentList?.uri !== list.uri) return
    const currentListItemIndex = mainState.currentListItems.findIndex((listItem: TTListItem) => {
      return listItem.subject.did === props.user?.did
    })
    if (currentListItemIndex === - 1) return
    mainState.currentListItems.splice(currentListItemIndex, 1)
  } else {
    // リストユーザーをマイリストに追加
    state.loaderDisplayMap[list.uri] = true
    const listUserUri = await mainState.atp.createListUser(list.uri, props.user.did)
    state.loaderDisplayMap[list.uri] = false
    if (listUserUri instanceof Error) {
      // TODO:
      return
    }
    const newListItem: TTListItem = {
      uri: listUserUri,
      subject: props.user,
    }
    myList.items.unshift(newListItem)

    // リストユーザー数をインクリメント
    if (list.listItemCount != null) {
      list.listItemCount ++
    }

    // リストユーザーを現在のリストに追加
    if (mainState.currentList?.uri !== list.uri) return
    mainState.currentListItems.unshift(newListItem)
  }

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}
</script>

<template>
  <Popup
    class="list-user-management-popup"
    :hasCloseButton="true"
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
        @clicked="clicked"
      >
        <!-- リストチェックアイコン -->
        <div
          class="list-card__check-icon"
          :data-checked="state.userMap[list.uri]"
        >
          <SVGIcon :name="state.userMap[list.uri] ? 'check' : 'minus'" />
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
      cursor: pointer;
      flex-direction: row;
      align-items: flex-end;
      grid-gap: 1em;
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

