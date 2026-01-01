import { computed, inject, type ComputedRef } from "vue"

export interface UseContentLabelsReturn {
  allLabels: ComputedRef<Array<TTLabel>>
  hideLabels: ComputedRef<Array<TILabelSetting>>
  blurContentLabels: ComputedRef<Array<TILabelSetting>>
  blurMediaLabels: ComputedRef<Array<TILabelSetting>>
  hasHideLabel: ComputedRef<boolean>
  hasBlurContentLabel: ComputedRef<boolean>
  hasBlurMediaLabel: ComputedRef<boolean>
}

export function useContentLabels(
  authorLabels: ComputedRef<Array<TTLabel> | undefined>,
  contentLabels: ComputedRef<Array<TTLabel> | undefined>
): UseContentLabelsReturn {
  const mainState = inject("state") as MainState

  // 1. allLabels: author + content labels をマージ
  const allLabels = computed((): Array<TTLabel> => {
    return [
      ...((authorLabels.value ?? []).map((label) => {
        return { ...label, __isAuthorLabel: true }
      })),
      ...(contentLabels.value ?? [])
    ]
  })

  // 2. Single-pass: すべての候補ラベルを一度に取得
  // hide と warn の両方、すべての blurs タイプを取得
  const allFilteredLabels = computed((): Array<TILabelSetting> => {
    return mainState.myLabeler!.getSpecificLabels(
      allLabels.value,
      ["hide", "warn"],
      ["none", "content", "media"]
    )
  })

  // 3. hideLabels: visibility が "hide" のラベル
  const hideLabels = computed((): Array<TILabelSetting> => {
    return allFilteredLabels.value.filter((labelSetting) => {
      const visibility =
        labelSetting.preference?.visibility ??
        labelSetting.definition.defaultSetting
      const visibilityModified =
        labelSetting.isBadge && visibility === "warn"
          ? "show"
          : visibility
      return visibilityModified === "hide"
    })
  })

  // 4. blurContentLabels: blurs が "none" または "content" のラベル
  const blurContentLabels = computed((): Array<TILabelSetting> => {
    return allFilteredLabels.value.filter((labelSetting) => {
      return ["none", "content"].includes(labelSetting.definition.blurs)
    })
  })

  // 5. blurMediaLabels: blurs が "media" のラベル
  const blurMediaLabels = computed((): Array<TILabelSetting> => {
    return allFilteredLabels.value.filter((labelSetting) => {
      return labelSetting.definition.blurs === "media"
    })
  })

  // 6. has* computed の追加（便利メソッド）
  const hasHideLabel = computed(() => hideLabels.value.length > 0)
  const hasBlurContentLabel = computed(() => blurContentLabels.value.length > 0)
  const hasBlurMediaLabel = computed(() => blurMediaLabels.value.length > 0)

  return {
    allLabels,
    hideLabels,
    blurContentLabels,
    blurMediaLabels,
    hasHideLabel,
    hasBlurContentLabel,
    hasBlurMediaLabel
  }
}
