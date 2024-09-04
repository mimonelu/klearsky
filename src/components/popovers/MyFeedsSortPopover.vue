<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  display: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

async function sortBy (type: "like" | "name" | "uri" | "indexedAt", order: "asc" | "desc") {
  Util.blurElement()
  close()
  const result = await mainState.openConfirmationPopup({
    title: $t("confirmation"),
    text: $t("sortMyFeedsConfirmation"),
  })
  if (!result) return

  // マイフィードポップアップの関数をコール
  if (mainState.myFeedsSortPopoverCallback != null) {
    mainState.myFeedsSortPopoverCallback({ type, order })
  }
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
      positionY: "bottom",
      directionX: "right",
      directionY: "down",
      collideX: true,
      collideY: true,
      animationDirection: "down",
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
      <hr />

      <!-- フィードのいいね順 -->
      <button @click.stop="sortBy('like', 'asc')">
        <SVGIcon name="like" />
        <span>{{ $t("sortByLike") }}</span>
      </button>

      <!-- 名前順 -->
      <button @click.stop="sortBy('name', 'asc')">
        <SVGIcon name="alphaA" />
        <span>{{ $t("sortByName") }}</span>
      </button>

      <!-- URI順 -->
      <button @click.stop="sortBy('uri', 'asc')">
        <SVGIcon name="link" />
        <span>{{ $t("sortByUri") }}</span>
      </button>

      <!-- 作成日順 -->
      <button @click.stop="sortBy('indexedAt', 'asc')">
        <SVGIcon name="clock" />
        <span>{{ $t("sortByIndexedAt") }}</span>
      </button>

      <div class="list-menu__header">{{ $t("sortInDesc") }}</div>
      <hr />

      <!-- フィードのいいね順 -->
      <button @click.stop="sortBy('like', 'desc')">
        <SVGIcon name="like" />
        <span>{{ $t("sortByLike") }}</span>
      </button>

      <!-- 名前順 -->
      <button @click.stop="sortBy('name', 'desc')">
        <SVGIcon name="alphaA" />
        <span>{{ $t("sortByName") }}</span>
      </button>

      <!-- URI順 -->
      <button @click.stop="sortBy('uri', 'desc')">
        <SVGIcon name="link" />
        <span>{{ $t("sortByUri") }}</span>
      </button>

      <!-- 作成日順 -->
      <button @click.stop="sortBy('indexedAt', 'desc')">
        <SVGIcon name="clock" />
        <span>{{ $t("sortByIndexedAt") }}</span>
      </button>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.my-feeds-sort-popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }
}
</style>
