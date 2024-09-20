<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import CONSTS from "@/consts/consts.json"

const props = defineProps<{
  labels?: Array<TTLabel>
  labelerDisplay: boolean
  unauthenticatedDisplay: boolean
  harmfulDisplay: boolean
  customDisplay: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  hasNoUnauthenticated: ComputedRef<boolean>
  harmfulLabels: ComputedRef<Array<TTLabel>>
  labelerLabels: ComputedRef<Array<undefined | TILabelSetting>>
  customLabels: ComputedRef<Array<TTLabel>>
}>({
  hasNoUnauthenticated: computed((): boolean => {
    if (props.labels == null) {
      return true
    }
    return mainState.hasLabel("!no-unauthenticated", props.labels)
  }),
  harmfulLabels: computed((): Array<TTLabel> => {
    return props.harmfulDisplay ? mainState.getHarmfulLabels(props.labels) : []
  }),
  labelerLabels: computed((): Array<undefined | TILabelSetting> => {
    return mainState.getLabelerLabels(props.labels)
      .map((label) => {
        return mainState.myLabeler!.labelMap[`${label.src}-${label.val}`]
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
  const labeler = mainState.myLabeler!.labelers.find((labeler) => {
    return labeler.creator.did === did
  })
  if (labeler == null) {
    return
  }
  mainState.openLabelerSettingsPopup(labeler)
}

function getLabelerAvatar (label?: TILabelSetting): string {
  if (label == null) {
    return ""
  }
  return mainState.myLabeler!.labelers.find((labeler) => {
    return labeler.creator.did === label.did
  })?.creator.avatar ?? ""
}
</script>

<template>
  <div
    v-if="
      labelerDisplay ||
      (unauthenticatedDisplay && !state.hasNoUnauthenticated) ||
      state.harmfulLabels.length > 0 ||
      state.labelerLabels.length > 0 ||
      state.customLabels.length > 0
    "
    class="label-tags"
  >
    <!-- 外部公開状態ラベル -->
    <div
      v-if="unauthenticatedDisplay && !state.hasNoUnauthenticated"
      class="label-tags__unauthenticated-label"
    >
      <SVGIcon name="earth" />
      <span>{{ $t("unauthenticated") }}</span>
    </div>

    <!-- ラベラー -->
    <div
      v-if="labelerDisplay"
      class="label-tags__labeler"
    >
      <SVGIcon name="labeler" />
      <span>{{ $t("labeler") }}</span>
    </div>

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
      <LazyImage :src="getLabelerAvatar(label)" />
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
  grid-gap: 0.25em;
  &:empty {
    display: contents;
  }

  &:deep(.label-tags__labeler),
  &__unauthenticated-label,
  &__harmful-label,
  &__labelers-label,
  &__custom-label {
    // border: 1px solid transparent;
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
    --color: rgb(var(--label-color), var(--alpha, 1.0));
    background-color: rgb(var(--label-color), 0.125);
  }

  // 外部公開状態ラベル
  &__unauthenticated-label {
    --color: rgb(var(--accent-color));
    background-color: rgb(var(--accent-color), 0.25);
  }

  // 有害なラベル
  &__harmful-label {
    --color: rgb(var(--notice-color), var(--alpha, 1.0));
    background-color: rgb(var(--notice-color), 0.125);
    // border-color: rgb(var(--notice-color), calc(var(--alpha) / 2));
    cursor: pointer;
    &:focus,
    &:hover {
      --alpha: 1.0;
    }
  }

  // ラベラーによるラベル
  &__labelers-label {
    --color: rgb(var(--label-color), var(--alpha, 1.0));
    background-color: rgb(var(--label-color), 0.125);
    // border-color: rgb(var(--label-color), calc(var(--alpha) / 3));
    cursor: pointer;
    grid-gap: 0.5em;
    padding-left: 0.25em;
    &:focus,
    &:hover {
      --alpha: 1.0;
    }

    & > .lazy-image {
      border-radius: var(--border-radius-small);
      font-size: 1.25em;
      min-width: 1em;
      max-width: 1em;
      min-height: 1em;
      max-height: 1em;
      opacity: var(--alpha) !important;
    }
  }

  // カスタムラベル
  &__custom-label {
    --color: rgb(var(--fg-color), var(--alpha, 1.0));
    background-color: rgb(var(--fg-color), 0.125);

    & > .svg-icon {
      fill: rgb(var(--orange-color), var(--alpha, 1.0));
    }
  }
}
</style>
