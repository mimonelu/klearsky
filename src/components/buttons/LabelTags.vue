<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import CONSTS from "@/consts/consts.json"

const props = defineProps<{
  labels?: Array<TTLabel>
  harmfulDisplay: boolean
  customDisplay: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  harmfulLabels: ComputedRef<Array<TTLabel>>
  labelerLabels: ComputedRef<Array<undefined | TILabelSetting>>
  customLabels: ComputedRef<Array<TTLabel>>
}>({
  harmfulLabels: computed((): Array<TTLabel> => {
    return props.harmfulDisplay ? mainState.getHarmfulLabels(props.labels) : []
  }),
  labelerLabels: computed((): Array<undefined | TILabelSetting> => {
    return mainState.getLabelerLabels(props.labels)
      .map((label) => {
        return mainState.myLabeler.labelMap[`${label.src}-${label.val}`]
      })

      // ラベラーラベルは「バッジを表示」以外の設定では表示しない
      .filter((labelSetting) => {
        if (labelSetting == null) {
          return false
        }
        if (labelSetting.isBadge &&
          (labelSetting.preference?.visibility ?? labelSetting.definition.defaultSetting) === "warn"
        ) {
          return true
        }
        return false
      })
  }),
  customLabels: computed((): Array<TTLabel> => {
    return props.customDisplay ? mainState.getCustomLabels(props.labels) : []
  }),
})

function openLabelerSettingsPopup (did?: string) {
  const labeler = mainState.myLabeler.labelers.find((labeler) => {
    return labeler.creator.did === did
  })
  if (labeler == null) {
    return
  }
  mainState.openLabelerSettingsPopup(labeler)
}
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
    <button
      v-for="label, labelIndex of state.harmfulLabels"
      :key="labelIndex"
      type="button"
      class="label-tags__harmful-label"
      @click.prevent.stop="openLabelerSettingsPopup(CONSTS.OFFICIAL_LABELER_DID)"
    >
      <SVGIcon name="label" />
      <span>{{ $t(label.val) }}</span>
    </button>

    <!-- ラベラーによるラベル -->
    <button
      v-for="label, labelIndex of state.labelerLabels"
      :key="labelIndex"
      type="button"
      class="label-tags__labelers-label"
      :title="label?.locale.description ?? ''"
      @click.prevent.stop="openLabelerSettingsPopup(label?.did)"
    >
      <SVGIcon name="label" />
      <span>{{ $t(label?.locale.name) }}</span>
    </button>

    <!-- カスタムラベル -->
    <div
      v-for="label, labelIndex of state.customLabels"
      :key="labelIndex"
      class="label-tags__custom-label"
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
    border-color: rgb(var(--notice-color), calc(var(--alpha) / 2));
    cursor: pointer;
    &:focus,
    &:hover {
      --alpha: 1.0;
    }
  }

  // ラベラーによるラベル
  &__labelers-label {
    --color: rgb(var(--share-color), var(--alpha, 1.0));
    background-color: var(--share-color-0125);
    border-color: rgb(var(--share-color), calc(var(--alpha) / 2));
    cursor: pointer;
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
