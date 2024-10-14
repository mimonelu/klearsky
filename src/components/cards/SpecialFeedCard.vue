<script lang="ts" setup>
import { computed, reactive, type ComputedRef } from "vue"
import OrderButtons from "@/components/buttons/OrderButtons.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(name: string, params?: any): void}>()

const props = defineProps<{
  item: TTMyFeedsItem
}>()

const state = reactive<{
  routerLinkToFeedsPage: ComputedRef<any>
}>({
  routerLinkToFeedsPage: computed(() => {
    return props.item.kind === "following"
      ? { to: "/home/timeline" }
      : props.item.kind === "space.aoisora.preference.feed.extra"
        ? { to: "/home/globalline" }
        : { to: "/home/timeline" }
  }),
})

function changeCustomFeedOrder (direction: "top" | "up" | "down" | "bottom") {
  emit("changeCustomFeedOrder", {
    direction,
    item: props.item.value,
  })
}
</script>

<template>
  <RouterLink
    class="special-feed-card"
    v-bind="state.routerLinkToFeedsPage"
  >
    <div class="special-feed-card__detail">
      <!-- フィード画像 -->
      <SVGIcon
        class="special-feed-card__avatar"
        name="shimmer"
      />

      <!-- フィード名 -->
      <div class="special-feed-card__display-name">
        <span>{{ $t(item.value.displayName) }}</span>
      </div>

      <!-- フィード説明 -->
      <div class="special-feed-card__description">
        <span>{{ $t(`${item.kind}Description`) }}</span>
      </div>
    </div>

    <!-- オーダーボタン -->
    <OrderButtons
      @moveTop="changeCustomFeedOrder('top')"
      @moveUp="changeCustomFeedOrder('up')"
      @moveDown="changeCustomFeedOrder('down')"
      @moveBottom="changeCustomFeedOrder('bottom')"
    />
  </RouterLink>
</template>

<style lang="scss" scoped>
.special-feed-card {
  cursor: default;
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;

  &__detail {
    display: grid;
    grid-gap: 0 0.75em;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "a n"
      "a d";
    align-items: flex-start;
  }

  // フィード画像
  &__avatar {
    grid-area: a;
    border-radius: var(--border-radius-middle);
    display: block;
    fill: rgb(var(--fg-color), 0.5);
    overflow: hidden;
    min-width: 3em;
    max-width: 3em;
    min-height: 3em;
    max-height: 3em;
    transform: scale(0.75);
  }

  // フィード名
  &__display-name {
    grid-area: n;
    display: inline;
    font-weight: bold;
    line-height: var(--line-height-high);
    margin-bottom: 0.25em;
    word-break: break-all;
  }

  // フィード説明
  &__description {
    grid-area: d;
    color: rgb(var(--fg-color), 0.5);
    font-size: 0.875em;
    line-height: var(--line-height-high);
    word-break: break-all;
  }
}

// オーダーボタン
.order-buttons {
  font-size: 0.875em;
  justify-content: flex-end;
}
</style>
