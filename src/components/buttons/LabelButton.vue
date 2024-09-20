<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

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
    <SVGIcon name="label" />
    <span>{{ $t("labels") }}</span>
    <b v-if="state.labels.length > 0">{{ state.labels.join(", ") }}</b>
  </button>
</template>

<style lang="scss" scoped>
.label-button {
  & > span {
    white-space: nowrap;
  }

  & > b {
    color: rgb(var(--notice-color));
    font-weight: bold;
    line-height: var(--line-height-high);
    word-break: break-all;
  }
}
</style>
