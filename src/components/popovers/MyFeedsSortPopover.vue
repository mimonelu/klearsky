<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

interface TISpecialItem {
  kind: TTMyFeedsItemKind
  index: number
}

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  display: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

async function sortMyFeeds (type: "like" | "name" | "uri" | "indexedAt", order: "asc" | "desc") {
  Util.blurElement()
  emit("close")
  const result = await mainState.openConfirmationPopup($t("confirmation"), $t("sortMyFeedsConfirmation"))
  if (!result) return

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

  // TODO:
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

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    mainState.myFeedsSortPopoverSelector,
    {
      positionX: "left",
      positionY: "middle",
      directionX: "left",
      directionY: "middle",
      collideX: true,
      collideY: true,
      hornDirection: "right",
      isChild: false,
    }
  )
}

function close () {
  emit("close")
}
</script>

<template>
  <Popover
    class="my-feeds-sort-popover"
    ref="popover"
    @close="close"
  >
    <menu class="list-menu">
      <div class="list-menu__header">{{ $t("sortInAsc") }}</div>

      <!-- フィードのいいね順 -->
      <button @click.stop="sortMyFeeds('like', 'asc')">
        <SVGIcon name="like" />
        <span>{{ $t("sortByLike") }}</span>
      </button>

      <!-- 名前順 -->
      <button @click.stop="sortMyFeeds('name', 'asc')">
        <SVGIcon name="alphaA" />
        <span>{{ $t("sortByName") }}</span>
      </button>

      <!-- URI順 -->
      <button @click.stop="sortMyFeeds('uri', 'asc')">
        <SVGIcon name="link" />
        <span>{{ $t("sortByUri") }}</span>
      </button>

      <!-- 作成日順 -->
      <button @click.stop="sortMyFeeds('indexedAt', 'asc')">
        <SVGIcon name="clock" />
        <span>{{ $t("sortByIndexedAt") }}</span>
      </button>

      <div class="list-menu__header">{{ $t("sortInDesc") }}</div>

      <!-- フィードのいいね順 -->
      <button @click.stop="sortMyFeeds('like', 'desc')">
        <SVGIcon name="like" />
        <span>{{ $t("sortByLike") }}</span>
      </button>

      <!-- 名前順 -->
      <button @click.stop="sortMyFeeds('name', 'desc')">
        <SVGIcon name="alphaA" />
        <span>{{ $t("sortByName") }}</span>
      </button>

      <!-- URI順 -->
      <button @click.stop="sortMyFeeds('uri', 'desc')">
        <SVGIcon name="link" />
        <span>{{ $t("sortByUri") }}</span>
      </button>

      <!-- 作成日順 -->
      <button @click.stop="sortMyFeeds('indexedAt', 'desc')">
        <SVGIcon name="clock" />
        <span>{{ $t("sortByIndexedAt") }}</span>
      </button>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.list-card-popover {
  &:deep() {
    .popover__content {
      padding: 0.5rem;
    }
  }
}
</style>
