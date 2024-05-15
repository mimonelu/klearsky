<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const props = defineProps<{
  labels?: Array<TTLabel>
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  harmfulLabels: ComputedRef<Array<TTLabel>>
  labelerLabels: ComputedRef<Array<undefined | TILabelSetting>>
  customLabels: ComputedRef<Array<TTLabel>>
}>({
  harmfulLabels: computed((): Array<TTLabel> => {
    return mainState.getHarmfulLabels(props.labels)
  }),
  labelerLabels: computed((): Array<undefined | TILabelSetting> => {
    return mainState.getLabelerLabels(props.labels)
      .map((label) => {
        return mainState.myLabeler.labelMap[`${label.src}-${label.val}`]
      })

      // ラベラーラベルは「バッジを表示」以外の設定では表示しない
      // SEE: https://github.com/bluesky-social/social-app/blob/main/src/lib/moderation/useLabelBehaviorDescription.ts
      .filter((label) => {
        if (label == null) {
          return false
        }
        if (label.definition.severity === "inform" &&
          (
            label.definition.blurs !== "content" &&
            label.definition.blurs !== "media"
          ) &&
          (label.preference?.visibility ?? label.definition.defaultSetting) === "warn"
        ) {
          return true
        }
        return false
      })
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
      v-for="label, labelIndex of state.labelerLabels"
      :key="labelIndex"
      :to="{ path: '/profile/feeds', query: { account: label?.did } }"
      class="labels__labelers-label"
      :title="label?.locale.description ?? ''"
      @click.stop
    >
      <SVGIcon name="label" />
      <span>{{ $t(label?.locale.name) }}</span>
    </RouterLink>

    <!-- カスタムラベル -->
    <div
      v-for="label, labelIndex of state.customLabels"
      :key="labelIndex"
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
