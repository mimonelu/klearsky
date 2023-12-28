<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Lists from "@/components/list/Lists.vue"
import Loader from "@/components/common/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import UserBox from "@/components/app-parts/UserBox.vue"

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
    return mainState.myList.filter((list: TTList) => {
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
    const result = await mainState.atp.createListUser(list.uri, props.user.did)
    state.loaderDisplayMap[list.uri] = false
    if (result instanceof Error) {
      // TODO:
      return
    }
    const newListItem: TTListItem = {
      uri: result,
      subject: props.user,
    }
    myList.items.unshift(newListItem)

    // リストユーザーを現在のリストに追加
    if (mainState.currentList?.uri !== list.uri) return
    mainState.currentListItems.unshift(newListItem)
  }
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
    <template #body>
      <!-- 対象リストユーザー -->
      <UserBox
        v-if="user != null"
        :user="user"
        :menuDisplay="false"
        :contentWarningDisabled="false"
      />

      <!-- リスト一覧 -->
      <Lists
        v-slot="{ list }"
        :lists="state.lists"
        :loaderDisplay="false"
        :isCompact="true"
        @clicked="clicked"
      >
        <!-- リストユーザーステータスアイコン -->
        <div
          class="list-user-management-popup__icon"
          :data-has-user="state.userMap[list.uri]"
        >
          <SVGIcon :name="state.userMap[list.uri] ? 'check' : 'minus'" />
        </div>

        <Loader v-if="state.loaderDisplayMap[list.uri] ?? false" />
      </Lists>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.list-user-management-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--accent-color));
      }

      &-body {
        padding: 0;
      }
    }

    .user-box {
      pointer-events: none;
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

  // 対象リストユーザー
  .user-box {
    margin: 1em 1em 0;
  }

  // リストユーザーステータスアイコン
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 3em;

    & > .svg-icon {
      font-size: 1.5em;
    }
    &[data-has-user="true"] {
      fill: rgb(var(--fg-color));
    }
    &[data-has-user="false"] {
      fill: var(--fg-color-025);
    }
  }
}
</style>
