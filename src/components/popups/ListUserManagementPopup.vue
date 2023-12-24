<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Lists from "@/components/list/Lists.vue"
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
  loaderDisplay: boolean

  // 各リストにおける対象ユーザーの存在フラグマップ
  userMap: ComputedRef<TTUserMap>
}>({
  loaderDisplay: false,

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

function clicked (list: TTList) {
  // TODO:
  console.log(list)
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
        <span>{{ $t("listUserManagement") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- 対象リストユーザー -->
      <UserBox
        v-if="user != null"
        :user="user"
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

