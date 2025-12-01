<script lang="ts" setup>
import { computed, inject } from "vue"

const props = defineProps<{
  handle?: string
  anonymizable?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const isInvalidHandle = props.handle === "handle.invalid"

const handle = computed((): string => {
  return props.anonymizable && mainState.currentSetting.postAnonymization
    ? $t("anonymous")
    : isInvalidHandle
      ? $t("invalidHandle")
      : props.handle ?? ""
})
</script>

<template>
  <div
    class="author-handle"
    :data-is-invalid-handle="isInvalidHandle"
    translate="no"
  >{{ handle || "&emsp;" }}</div>
</template>

<style lang="scss" scoped>
.author-handle {
  color: rgb(var(--fg-color), 0.5);
  font-size: 0.75em;
  line-height: var(--line-height-low);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &[data-is-invalid-handle="true"] {
    --fg-color: var(--notice-color);
    font-weight: bold;
  }
}
</style>
