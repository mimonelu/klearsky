<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const props = defineProps<{
  labels?: Array<TTLabel>
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  harmfulLabels: ComputedRef<Array<TTLabel>>
  labelerLabels: ComputedRef<Array<TILabelerLabel>>
  customLabels: ComputedRef<Array<TTLabel>>
}>({
  harmfulLabels: computed((): Array<TTLabel> => {
    return mainState.getHarmfulLabels(props.labels)
  }),
  labelerLabels: computed((): Array<TILabelerLabel> => {
    return mainState.myLabeler.makeMyLabelerLabels(mainState.getLabelerLabels(props.labels))
  }),
  customLabels: computed((): Array<TTLabel> => {
    return mainState.getCustomLabels(props.labels)
  }),
})
</script>

<template>
  <div
    v-if="
      state.harmfulLabels.length > 0 ||
      state.labelerLabels.length > 0 ||
      state.customLabels.length > 0
    "
    class="label-tags"
  >
    <slot />

    <!-- 有害なラベル -->
    <div
      v-for="label, labelIndex of state.harmfulLabels"
      :key="labelIndex"
      class="labels__harmful-label"
    >
      <SVGIcon name="label" />
      <span>{{ $t(label.val) }}</span>
    </div>

    <!-- ラベラーによるラベル -->
    <RouterLink
      v-for="label of state.labelerLabels"
      :key="label.id"
      :to="{ path: '/profile/feeds', query: { account: label.did } }"
      class="labels__labelers-label"
      :title="label.description ?? ''"
      @click.stop
    >
      <SVGIcon name="label" />
      <span>{{ $t(label.name) }}</span>
    </RouterLink>

    <!-- カスタムラベル -->
    <div
      v-for="label of state.customLabels"
      :key="label.val"
      class="labels__custom-label"
    >
      <SVGIcon name="label" />
      <span>{{ $t(label.val) }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.label-tags {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5em;
  &:empty {
    display: contents;
  }

  &:deep(.label-tags__labeler),
  &__harmful-label,
  &__labelers-label,
  &__custom-label {
    border: 1px solid transparent;
    border-radius: var(--border-radius-middle);
    display: flex;
    align-items: center;
    grid-gap: 0.25em;
    padding: 0.25em 0.5em;

    & > .svg-icon {
      fill: var(--color);
      font-size: 0.875em;
    }

    & > span {
      color: var(--color);
      font-weight: bold;
      line-height: var(--line-height-low);
      user-select: none;
      word-break: break-all;
    }
  }

  // ラベラー
  &:deep(.label-tags__labeler) {
    --color: rgb(var(--share-color), var(--alpha, 1.0));
    background-color: var(--share-color-0125);
  }

  // 有害なラベル
  &__harmful-label {
    --color: rgb(var(--notice-color), var(--alpha, 1.0));
    background-color: var(--notice-color-0125);
  }

  // ラベラーによるラベル
  &__labelers-label {
    --color: rgb(var(--share-color), var(--alpha, 1.0));
    background-color: var(--share-color-0125);
    border-color: var(--share-color-025);
    &:focus,
    &:hover {
      --alpha: 1.0;
    }
  }

  // カスタムラベル
  &__custom-label {
    --color: rgb(var(--fg-color), var(--alpha, 1.0));
    background-color: var(--fg-color-0125);
  }
}
</style>
