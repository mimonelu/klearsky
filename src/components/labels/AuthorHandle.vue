<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"

const props = defineProps<{
  handle?: string
  anonymizable?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const isInvalidHandle = props.handle === "handle.invalid"

const state = reactive<{
  handle?: ComputedRef<string>
}>({
  handle: computed((): string => props.anonymizable && mainState.currentSetting.postAnonymization
    ? ""
    : isInvalidHandle
      ? $t("invalidHandle")
      : props.handle
  ),
})
</script>

<template>
  <div
    class="author-handle"
    :data-is-invalid-handle="isInvalidHandle"
  >{{ state.handle || "&emsp;" }}</div>
</template>

<style lang="scss" scoped>
.author-handle {
  color: rgb(var(--fg-color), 0.5);
  font-size: 0.75em;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &[data-is-invalid-handle="true"] {
    --fg-color: var(--notice-color);
    font-weight: bold;
  }
}
</style>
