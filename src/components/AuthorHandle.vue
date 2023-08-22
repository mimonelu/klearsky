<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"

const props = defineProps<{
  handle?: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  isInvalid?: ComputedRef<boolean>
  handle?: ComputedRef<string>
}>({
  isInvalid: computed((): boolean => props.handle === "handle.invalid"),
  handle: computed((): string => mainState.currentSetting.postAnonymization
    ? ""
    : state.isInvalid
      ? $t("invalidHandle")
      : props.handle
  ),
})
</script>

<template>
  <div
    class="author-handle"
    :data-is-invalid="state.isInvalid"
  >{{ state.handle }}</div>
</template>

<style lang="scss" scoped>
.author-handle {
  color: var(--fg-color-05);
  font-size: 0.75em;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &[data-is-invalid="true"] {
    --fg-color: var(--notice-color);
    font-weight: bold;
  }

  // フォローイングドット
  [data-is-following="true"] &::before {
    background-image: radial-gradient(
      circle at center,
      var(--fg-color-05) 37.5%,
      transparent 37.5%
    );
    content: "";
    display: inline-block;
    margin-right: 0.5em;
    width: 0.375em;
    height: 0.75em;
  }
}
</style>
