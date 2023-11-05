<script lang="ts" setup>
import SVGIcon from "@/components/common/SVGIcon.vue"

defineProps<{
  labels?: Array<TTLabel>
  display: boolean
}>()
</script>

<template>
  <button
    class="content-filtering-toggle"
    :data-enabled="false"
  >
    <SVGIcon name="contentFiltering" />
    <div
      v-for="label of labels"
      :key="label.val"
      class="content-filtering-toggle__label"
    >{{ $t(label.val) }}</div>
    <div
      v-if="display"
      class="content-filtering-toggle__state-label"
    >{{ $t("hide") }}</div>
    <div
      v-else="display"
      class="content-filtering-toggle__state-label"
    >{{ $t("show") }}</div>
  </button>
</template>

<style lang="scss" scoped>
.content-filtering-toggle {
  border: 1px solid rgb(var(--notice-color), 0.5);
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  grid-gap: 0.5em;
  padding: 0.5em 1em;
  &:focus, &:hover {
    border-color: rgb(var(--notice-color), 0.75);

    & > .state-label {
      color: var(--fg-color-075);
    }
  }

  & > .svg-icon {
    fill: rgb(var(--notice-color));
  }


  &__label,
  &__state-label {
    font-weight: bold;
    line-height: var(--line-height);
  }

  &__label {
    color: rgb(var(--notice-color));
    word-break: break-word;
  }

  &__state-label {
    color: var(--fg-color-05);
    font-size: 0.875em;
    margin-left: auto;
    white-space: nowrap;
  }
}
</style>
