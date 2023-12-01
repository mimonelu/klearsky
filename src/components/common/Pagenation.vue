<script lang="ts" setup>
import { reactive, computed, type ComputedRef } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const props = defineProps<{
  numberOfPager: number
  total?: number
  unit?: number
  cursor?: number
  isLast: boolean
}>()

const state = reactive<{
  range: ComputedRef<Array<number>>
  page: ComputedRef<number>
  prev: ComputedRef<number>
  next: ComputedRef<number>
  last: ComputedRef<number>
}>({
  range: computed((): Array<number> => {
    const results: Array<number> = []
    if (props.total != null && props.unit != null) {
      const maxPage = Math.ceil(props.total / props.unit)
      const maxSlot = Math.min(maxPage, props.numberOfPager)
      const half = Math.floor(maxSlot / 2)
      const diff = maxPage <= props.numberOfPager
        ? state.page - 1
        : state.page <= half
          ? state.page - 1
          : state.page > maxPage - half
            ? props.numberOfPager - (maxPage - state.page + 1)
            : half
      for (let i = 0; i < maxSlot; i ++) results.push(state.page - diff + i)
    }
    return results
  }),
  page: computed((): number => {
    return props.unit != null && props.cursor != null
      ? Math.floor(props.cursor / props.unit) + 1
      : 1
  }),
  prev: computed((): number => {
    return props.unit != null
      ? (state.page - 2) * props.unit
      : 1
  }),
  next: computed((): number => {
    return props.unit != null
      ? state.page * props.unit
      : 1
  }),
  last: computed((): number => {
    if (props.total != null && props.unit != null) {
      const result = Math.floor(props.total / props.unit) * props.unit
      if (result === props.total) return props.total - props.unit
      return result
    }
    return 1
  }),
})
</script>

<template>
  <div class="pagenation">
    <!-- 最初へ戻るボタン -->
    <button
      v-if="total != null"
      class="button--plane navigation-button"
      :disabled="state.page === 1"
      @click.stop="$emit('paging', 0)"
    >
      <SVGIcon name="cursorFirst" />
    </button>

    <!-- 前へ戻るボタン -->
    <button
      class="button--plane navigation-button"
      :disabled="state.page === 1"
      @click.stop="$emit('paging', state.prev)"
    >
      <SVGIcon name="cursorLeft" />
    </button>

    <div class="pagenation__center">
      <!-- ページャー -->
      <button
        v-for="i of state.range"
        :key="i"
        :class="state.page === i ? 'button' : 'button--bordered'"
        class="pager-button"
        @click.stop="$emit('paging', (i - 1) * (unit ?? 0))"
      >
        <span>{{ i }}</span>
      </button>

      <!-- ページラベル（ヒット数未取得時のみ） -->
      <button
        v-if="total == null"
        class="button--plane page-label"
        :disabled="true"
        @click.stop
      >
        <span>{{ state.page }}</span>
      </button>
    </div>

    <!-- 次へ進むボタン -->
    <button
      class="button--plane navigation-button"
      :disabled="isLast"
      @click.stop="$emit('paging', state.next)"
    >
      <SVGIcon name="cursorRight" />
    </button>

    <!-- 最後へ進むボタン -->
    <button
      v-if="total != null"
      class="button--plane navigation-button"
      :disabled="isLast"
      @click.stop="$emit('paging', state.last)"
    >
      <SVGIcon name="cursorLast" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.pagenation {
  display: flex;
  align-items: center;
  justify-content: center;

  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
    grid-gap: 0 0.25rem;
    flex-grow: 1;
  }
}

.navigation-button,
.pager-button,
.page-label {
  & > span {
    line-height: 1;
    white-space: nowrap;
  }

  & > .svg-icon {
    font-size: 1rem;
  }

  // タブレット幅未満
  @media not all and (min-width: calc($router-view-width + $main-menu-min-width)) {
    & {
      padding: 0.5em 0.375em;
    }
  }
}
// タブレット幅未満
@media not all and (min-width: calc($router-view-width + $main-menu-min-width)) {
  .navigation-button {
    min-width: 2.5rem;
    max-width: 2.5rem;
  }
}
.pager-button,
.page-label {
  min-width: 2em;

  & > span {
    font-size: 0.875em;
  }
}
</style>
