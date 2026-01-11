<script lang="ts" setup>
import { computed, inject } from "vue"
import { differenceInDays } from "date-fns"
import LazyImage from "@/components/images/LazyImage.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import CONSTS from "@/consts/consts.json"

const props = defineProps<{
  labels?: Array<TTLabel>
  labelerDisplay: boolean
  unauthenticatedDisplay: boolean
  harmfulDisplay: boolean
  customDisplay: boolean

  // 新規アカウントラベル用
  userCreatedAt?: string
  postIndexedAt?: string
}>()

const mainState = inject("state") as MainState

const hasNoUnauthenticated = computed((): boolean => {
  if (props.labels == null) {
    return true
  }
  return mainState.hasLabel("!no-unauthenticated", props.labels)
})

const harmfulLabels = computed((): Array<TTLabel> => {
  return props.harmfulDisplay ? mainState.getHarmfulLabels(props.labels) : []
})

const labelerLabels = computed((): Array<undefined | TILabelSetting> => {
  return mainState.getLabelerLabels(props.labels)
    .map((label) => {
      return mainState.myLabeler!.labelMap[`${label.src}-${label.val}`]
    })

    // ラベラーラベルは「バッジを表示」以外の設定では表示しない
    .filter((labelSetting) => {
      if (labelSetting == null) {
        return false
      }
      const visibility =
        labelSetting.preference?.visibility ??
        labelSetting.definition.defaultSetting
      if (
        (
          labelSetting.isBadge &&
          (
            visibility === "inform" ||
            visibility === "show" ||
            visibility === "warn"
          )
        ) || visibility === "hide"
      ) {
        return true
      }
      return false
    })
})

const customLabels = computed((): Array<TTLabel> => {
  return props.customDisplay ? mainState.getCustomLabels(props.labels) : []
})

// 新規アカウントフラグ
const isBeginner = computed((): boolean => {
  const now = props.postIndexedAt != null
    ? new Date(props.postIndexedAt)
    : new Date()
  return props.userCreatedAt != null
    ? differenceInDays(now, new Date(props.userCreatedAt)) <= 7
    : false
})

function openLabelerSettingsPopup (did?: string, focusIdentifier?: string) {
  const labeler = mainState.myLabeler!.labelers.find((labeler) => {
    return labeler.creator.did === did
  })
  if (labeler == null) {
    return
  }
  mainState.openLabelerSettingsPopup(labeler, focusIdentifier)
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
      (unauthenticatedDisplay && !hasNoUnauthenticated) ||
      harmfulLabels.length > 0 ||
      labelerLabels.length > 0 ||
      customLabels.length > 0 ||
      isBeginner
    "
    class="label-tags"
  >
    <!-- 新規アカウントラベル -->
    <div
      v-if="isBeginner"
      class="label-tags__beginner-label"
    >
      <SVGIcon name="sprout" />
      <span>{{ $t(postIndexedAt != null ? "beginnerInPost" : "beginner") }}</span>
    </div>

    <!-- 外部公開状態ラベル -->
    <div
      v-if="unauthenticatedDisplay && !hasNoUnauthenticated"
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
      v-for="label, labelIndex of harmfulLabels"
      :key="labelIndex"
      type="button"
      class="label-tags__harmful-label"
      @click.prevent.stop="openLabelerSettingsPopup(CONSTS.OFFICIAL_LABELER_DID, label.val)"
    >
      <SVGIcon :name="label.__isAuthorLabel ? 'person' : 'label'" />
      <span translate="no">{{ $t(label.val) }}</span>
    </button>

    <!-- ラベラーによるラベル -->
    <button
      v-for="label, labelIndex of labelerLabels"
      :key="labelIndex"
      type="button"
      class="label-tags__labelers-label"
      :title="label?.locale.description ?? ''"
      @click.prevent.stop="openLabelerSettingsPopup(label?.did, label?.definition.identifier)"
    >
      <LazyImage :src="getLabelerAvatar(label)" />
      <span translate="no">{{ $t(label?.locale.name) }}</span>
    </button>

    <!-- カスタムラベル -->
    <div
      v-for="label, labelIndex of customLabels"
      :key="labelIndex"
      class="label-tags__custom-label"
    >
      <SVGIcon name="label" />
      <span translate="no">{{ $t(label.val) }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.label-tags {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.25em;
  overflow: hidden;
  &:empty {
    display: contents;
  }

  &:deep(.label-tags__labeler),
  &__beginner-label,
  &__unauthenticated-label,
  &__harmful-label,
  &__labelers-label,
  &__custom-label {
    border-radius: var(--border-radius-middle);
    display: flex;
    align-items: center;
    grid-gap: 0.25em;
    overflow: hidden;
    padding: 0.25em 0.5em;

    & > .svg-icon {
      fill: var(--color);
      font-size: 0.875em;
    }

    & > span {
      color: var(--color);
      line-height: var(--line-height-low);
      overflow: hidden;
      user-select: none;
      word-break: break-all;
    }
  }

  // ラベラー
  &:deep(.label-tags__labeler) {
    --color: rgb(var(--label-color), var(--alpha, 1.0));
    background-color: rgb(var(--label-color), 0.125);
  }

  // 新規アカウントラベル
  &__beginner-label {
    --color: rgb(var(--accent-color));
    background-color: rgb(var(--accent-color), 0.25);
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
