<script lang="ts" setup>
import { computed, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const props = defineProps<{
  labels?: Array<TTLabel | TILabelSetting>
  type?: TTLabelOnWarn
  display: boolean
  togglable: boolean
}>()

const state = reactive<{
  labelNames: ComputedRef<Array<string>>
}>({
  labelNames: computed((): Array<string> => {
    return Array.from(new Set((props.labels?.map((label: any) => {
      // TODO:
      return label.locale?.name || label.definition?.identifier || label.val
    }) ?? [])))
  }),
})
</script>

<template>
  <button
    class="button--bordered content-filtering-toggle"
    :data-enabled="false"
    :data-blur="type === 'blur'"
  >
    <SVGIcon name="contentFiltering" />
    <div
      v-for="label, labelIndex of state.labelNames"
      :key="labelIndex"
      class="content-filtering-toggle__label"
    >{{ $t(label) }}</div>
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
  --alpha: 0.5;
  background-color: rgb(var(--bg-color), 0.75);
  border: 1px solid rgb(var(--notice-color), 0.5);
  flex-wrap: wrap;
  justify-content: flex-start;
  &:focus, &:hover {
    border-color: rgb(var(--notice-color), 0.75);
    &[data-blur="true"] {
      background-color: rgb(var(--notice-color));
    }

    & > .state-label {
      color: var(--fg-color-075);
    }
  }
  &[data-blur="true"] {
    background-color: rgb(var(--notice-color), 0.75);

    & > * {
      --fg-color: var(--bg-color);
      --notice-color: var(--bg-color);
    }
  }

  & > .svg-icon {
    fill: rgb(var(--notice-color));
  }

  &__label {
    color: rgb(var(--notice-color));
    font-weight: bold;
    line-height: var(--line-height-high);
    word-break: break-all;
  }
}
</style>
