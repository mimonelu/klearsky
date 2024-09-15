<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const $t = inject("$t") as Function

const props = defineProps<{
  labels?: Array<TILabelSetting>
  type?: TTLabelOnWarn
  display: boolean
  togglable: boolean
}>()

const state = reactive<{
  labelNames: ComputedRef<string>
}>({
  labelNames: computed((): string => {
    return Array.from(new Set((props.labels?.map((label) => {
      return $t(label.locale.name || label.definition.identifier)
    }) ?? []))).join(", ")
  }),
})
</script>

<template>
  <button
    class="button--bordered content-filtering-toggle"
    :data-enabled="false"
    :data-show="display"
  >
    <SVGIcon name="contentFiltering" />
    <div class="content-filtering-toggle__label">{{ state.labelNames }}</div>
    <div
      v-if="display && togglable"
      class="button__suffix"
    >{{ $t("hide") }}</div>
    <div
      v-if="!display && togglable"
      class="button__suffix"
    >{{ $t("show") }}</div>
  </button>
</template>

<style lang="scss" scoped>
.content-filtering-toggle {
  --alpha: 0.75;
  background-color: rgb(var(--notice-color), 0.125);
  border: 1px solid rgb(var(--notice-color), calc(var(--alpha) / 2));
  display: grid;
  grid-template-columns: auto 1fr auto;
  &:focus, &:hover {
    --alpha: 1.0;
  }
  &[data-show="true"] {
    border-color: transparent;
  }

  & > .svg-icon {
    fill: rgb(var(--notice-color), var(--alpha));
  }

  &__label {
    color: rgb(var(--notice-color), var(--alpha));
    font-weight: bold;
    line-height: var(--line-height-high);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
