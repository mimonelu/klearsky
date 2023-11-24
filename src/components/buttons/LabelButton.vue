<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const props = defineProps<{
  type: "post" | "account"
  parentState: any
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  labels: ComputedRef<string[]>
}>({
  labels: computed((): string[] => {
    return [...(props.parentState.labels?.map((label: string) => $t(label)) ?? [])]
  })
})
</script>

<template>
  <button
    class="button--bordered label-button"
    @click.prevent="mainState.openSelectLabelsPopup(parentState)"
  >
    <SVGIcon name="contentFiltering" />
    <span>{{ $t("labels") }}:</span>
    <span>{{
      state.labels.length === 0
      ? "-"
      : `${state.labels.join(", ")}`
    }}</span>
  </button>
</template>

<style lang="scss" scoped>
.label-button {
  --fg-color: var(--notice-color);

  & > span:nth-child(2) {
    white-space: nowrap;
  }
}
</style>
