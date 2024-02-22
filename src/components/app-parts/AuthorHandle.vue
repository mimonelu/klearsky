<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"

const props = defineProps<{
  handle?: string
  anonymizable?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const isInvalid = props.handle === "handle.invalid"

const state = reactive<{
  handle?: ComputedRef<string>
}>({
  handle: computed((): string => props.anonymizable && mainState.currentSetting.postAnonymization
    ? ""
    : isInvalid
      ? $t("invalidHandle")
      : props.handle
  ),
})
</script>

<template>
  <div
    class="author-handle"
    :data-is-invalid="isInvalid"
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
}
</style>
