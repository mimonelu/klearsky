<script lang="ts" setup>
import { inject, reactive } from "vue"
import FeedCard from "@/components/app-parts/FeedCard.vue"
import ListCard from "@/components/list/ListCard.vue"
import Popup from "@/components/popups/Popup.vue"
import SpecialFeedCard from "@/components/app-parts/SpecialFeedCard.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  orderChanged: boolean
  popupLoaderDisplay: boolean
}>({
  orderChanged: false,
  popupLoaderDisplay: false,
})

async function close () {
  if (state.orderChanged) {
    state.popupLoaderDisplay = true
    mainState.sortFeedPreferencesSavedAndPinned()
    mainState.myFeeds.saveCustomItemSettings()
    const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
    state.popupLoaderDisplay = false
    if (!result) {
      mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/updatePreferences")
    }

    // セッションキャッシュの更新
    if (result) {
      mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
      mainState.myWorker.setSessionCache("myFeeds.items", mainState.myFeeds.items)
    }
  }
  emit("close")
}

async function fetchMyFeeds () {
  // Preferences の取得
  state.popupLoaderDisplay = true
  const preferences = await mainState.fetchPreferences()
  if (!preferences) {
    mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchPreferences")
    state.popupLoaderDisplay = false
    return
  }

  // ブックマークが存在しない
  if (mainState.currentFeedPreference?.saved == null) {
    mainState.myFeeds.clearItems()
    state.popupLoaderDisplay = false
    return
  }

  // マイフィードジェネレーターの取得
  await mainState.myFeeds.fetchItems()
  mainState.myFeeds.sortItems()
  state.popupLoaderDisplay = false
}

async function sortMyFeeds (
  { type, order }:
  { type: "like" | "name" | "uri" | "indexedAt", order: "asc" | "desc" }
) {
  interface TISpecialItem {
    kind: TTMyFeedsItemKind
    index: number
  }

  // 特殊フィードの保存
  const specialKinds: TTMyFeedsItemKind[] = ["followings", "globalline"]
  const specialItems: TISpecialItem[] = specialKinds.map((kind: TTMyFeedsItemKind) => {
    const index = mainState.myFeeds.items.findIndex((item: TTMyFeedsItem) => {
      return item.kind === kind
    })
    return {
      kind,
      index,
    }
  })
  specialItems.sort((a: TISpecialItem, b: TISpecialItem) => {
    return a.index < b.index ? - 1 : a.index > b.index ? 1 : 0
  })

  const orderA = order === "asc" ? 1 : - 1
  const orderB = order === "asc" ? - 1 : 1

  switch (type) {
    // フィードのいいね順
    case "like": {
      mainState.myFeeds.items.sort((a: TTMyFeedsItem, b: TTMyFeedsItem) => {
        if (a.kind === "feed" && b.kind === "feed") {
          return a.value.likeCount < b.value.likeCount
            ? orderB
            : a.value.likeCount > b.value.likeCount
              ? orderA
              : 0
        }
        if (a.kind === "feed" && b.kind !== "feed") {
          return - 1
        }
        if (a.kind !== "feed" && b.kind === "feed") {
          return 1
        }
        return 0
      })
      break
    }

    // 名前順
    case "name": {
      mainState.myFeeds.items.sort((a: TTMyFeedsItem, b: TTMyFeedsItem) => {
        const aIsTarget = a.kind === "feed" || a.kind === "list"
        const bIsTarget = b.kind === "feed" || b.kind === "list"
        if (aIsTarget && bIsTarget) {
          const aName = ((a.value as any).displayName ?? (a.value as any).name ?? "").toLowerCase()
          const bName = ((b.value as any).displayName ?? (b.value as any).name ?? "").toLowerCase()
          return aName < bName
            ? orderB
            : aName > bName
              ? orderA
              : 0
        }
        if (aIsTarget && !bIsTarget) {
          return - 1
        }
        if (!aIsTarget && bIsTarget) {
          return 1
        }
        return 0
      })
      break
    }

    // URI順
    case "uri": {
      mainState.myFeeds.items.sort((a: TTMyFeedsItem, b: TTMyFeedsItem) => {
        const aIsTarget = a.kind === "feed" || a.kind === "list"
        const bIsTarget = b.kind === "feed" || b.kind === "list"
        if (aIsTarget && bIsTarget) {
          return a.value.uri < b.value.uri
            ? orderB
            : a.value.uri > b.value.uri
              ? orderA
              : 0
        }
        if (aIsTarget && !bIsTarget) {
          return - 1
        }
        if (!aIsTarget && bIsTarget) {
          return 1
        }
        return 0
      })
      break
    }

    // 作成日順
    case "indexedAt": {
      mainState.myFeeds.items.sort((a: TTMyFeedsItem, b: TTMyFeedsItem) => {
        const aIsTarget = a.kind === "feed" || a.kind === "list"
        const bIsTarget = b.kind === "feed" || b.kind === "list"
        if (aIsTarget && bIsTarget) {
          return a.value.indexedAt < b.value.indexedAt
            ? orderB
            : a.value.indexedAt > b.value.indexedAt
              ? orderA
              : 0
        }
        if (aIsTarget && !bIsTarget) {
          return - 1
        }
        if (!aIsTarget && bIsTarget) {
          return 1
        }
        return 0
      })
      break
    }
  }

  // 特殊フィードの復帰
  specialItems.forEach((specialItem: TISpecialItem) => {
    const currentIndex = mainState.myFeeds.items.findIndex((item: TTMyFeedsItem) => {
      return item.kind === specialItem.kind
    })
    if (currentIndex === - 1 || specialItem.index === - 1) return
    moveArray(mainState.myFeeds.items, currentIndex, specialItem.index)
  })

  state.orderChanged = true
}

function moveArray <T>(array: T[], fromIndex: number, toIndex: number) {
  if (fromIndex < 0 ||
      fromIndex >= array.length ||
      toIndex < 0 ||
      toIndex >= array.length ||
      fromIndex === toIndex) {
    return array
  }
  const element = array.splice(fromIndex, 1)[0]
  array.splice(toIndex, 0, element)
}

function changeCustomFeedOrder (params: any) {
  const direction = params.direction as "top" | "up" | "down" | "bottom"
  const item = params.item as TTMyFeedsItemValue
  const index = mainState.myFeeds.findIndexByUri(item.uri)
  if (index === - 1) return
  const lastIndex = mainState.myFeeds.items.length - 1
  if (direction === "top" && index !== 0) {
    const temp = mainState.myFeeds.items[index]
    mainState.myFeeds.items.splice(index, 1)
    mainState.myFeeds.items.unshift(temp)
  } else if (direction === "up" && index > 0) {
    mainState.myFeeds.swapItem(index, index - 1)
  } else if (direction === "down" && index < lastIndex) {
    mainState.myFeeds.swapItem(index, index + 1)
  } else if (direction === "bottom" && index !== lastIndex) {
    const temp = mainState.myFeeds.items[index]
    mainState.myFeeds.items.splice(index, 1)
    mainState.myFeeds.items.push(temp)
  }
  state.orderChanged = true
}

function openMyFeedsSortPopover ($event: Event) {
  Util.blurElement()
  mainState.myFeedsSortPopoverCallback = sortMyFeeds
  mainState.openMyFeedsSortPopover($event.target)
}
</script>

<template>
  <Popup
    class="my-feeds-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <!-- 更新ボタン -->
      <button @click.stop="fetchMyFeeds">
        <SVGIcon name="refresh" />
      </button>

      <!-- マイフィードソートポップオーバートリガー -->
      <button
        class="my-feeds-popup__sort-menu-trigger"
        @click.stop="openMyFeedsSortPopover"
      >
        <SVGIcon name="sort" />
      </button>

      <h2>
        <SVGIcon name="feed" />
        <span>{{ $t("myFeeds") }}</span>
      </h2>
    </template>
    <template #body>
      <div
        v-if="!state.popupLoaderDisplay && mainState.myFeeds.items.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noMyFeeds") }}
        </div>
      </div>
      <template v-else>
        <template
          v-for="item of mainState.myFeeds.items"
          :key="item.value.uri"
        >
          <!-- フォロー中フィード -->
          <SpecialFeedCard
            v-if="item.kind === 'followings'"
            :item="item"
            @click.exact="close"
            @changeCustomFeedOrder="changeCustomFeedOrder"
          />

          <!-- グローバルフィード -->
          <SpecialFeedCard
            v-else-if="item.kind === 'globalline'"
            :item="item"
            @click.exact="close"
            @changeCustomFeedOrder="changeCustomFeedOrder"
          />

          <!-- フィードカード -->
          <FeedCard
            v-else-if="item.kind === 'feed'"
            :generator="item.value"
            :menuDisplay="true"
            :toggleDisplay="true"
            :orderButtonDisplay="true"
            :creatorDisplay="true"
            @click.exact="close"
            @changeCustomFeedOrder="changeCustomFeedOrder"
            @onActivateMention="close"
            @onActivateHashTag="close"
          />

          <!-- リストカード -->
          <ListCard
            v-else-if="item.kind === 'list'"
            :list="item.value"
            :isCompact="false"
            :toggleDisplay="true"
            :orderButtonDisplay="true"
            @close="close"
            @changeCustomFeedOrder="changeCustomFeedOrder"
            @onActivateMention="close"
            @onActivateHashTag="close"
          />
        </template>
      </template>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-feeds-popup {
  &:deep() {
    .popup {
      &-header {
        & > h2 > .svg-icon {
          fill: rgb(var(--accent-color));
        }
      }

      &-body {
        flex-grow: 1;
        grid-gap: unset;
        padding: unset;
      }
    }
  }

  &__sort-menu-trigger {
    position: relative;

    & > .svg-icon {
      font-size: 1.25rem;
      pointer-events: none;
    }
  }

  .feed-card,
  .special-feed-card,
  .list-card {
    &:not(:last-child) {
      border-bottom: 1px solid var(--fg-color-0125);
    }
  }

  .textlabel {
    margin: 1rem;
  }
}
</style>
