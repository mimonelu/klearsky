<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  display: boolean
  container?: HTMLElement
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

async function sortBy (type: "like" | "name" | "uri" | "indexedAt", order: "asc" | "desc") {
  Util.blurElement()
  emit("close")
  const result = await mainState.openConfirmationPopup($t("confirmation"), $t("sortMyFeedsConfirmation"))
  if (!result) return
  emit("sort", { type, order })
}
</script>

<template>
  <MenuTicker
    :display="display"
    :container="container"
  >
    <div class="list-menu__header">{{ $t("sortInAsc") }}</div>

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
  </MenuTicker>
</template>

<style lang="scss" scoped>
.menu-ticker:deep() {
  .menu-ticker--inner {
    max-width: 24rem;
  }
}
</style>
