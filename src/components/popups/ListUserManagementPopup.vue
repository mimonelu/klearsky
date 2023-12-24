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

  // 各リストにおける対象ユーザーの存在フラグマップ
  userMap: ComputedRef<TTUserMap>
}>({
  loaderDisplayMap: {},

  // 各リストにおける対象ユーザーの存在フラグマップ
  userMap: computed((): TTUserMap => {
    if (props.user == null) return {}
    const map: TTUserMap = {}
    mainState.myList.forEach((list: TTList) => {
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
  const myList = mainState.myList.find((myList: TTList) => {
    return myList.uri === list.uri
  })
  if (myList?.items == null) return

  if (state.userMap[list.uri]) {
    // リストユーザーの削除
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
  } else {
    // リストユーザーの追加
    state.loaderDisplayMap[list.uri] = true
    const result = await mainState.atp.createListUser(list.uri, props.user.did)
    state.loaderDisplayMap[list.uri] = false
    if (result instanceof Error) {
      // TODO:
      return
    }
    myList.items.unshift({
      uri: result,
      subject: props.user,
    })
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
        <span>{{ $t("listUserManagement") }}</span>
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
        :lists="mainState.myList"
        :loaderDisplay="false"
        :isCompact="true"
        :unclickable="true"
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

    .list-card {
      cursor: pointer;
      flex-direction: row;
      align-items: flex-start;
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

