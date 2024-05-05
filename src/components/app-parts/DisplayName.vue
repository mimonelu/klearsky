<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"

const props = defineProps<{
  displayName?: string
  anonymizable?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  displayName?: ComputedRef<string>
}>({
  displayName: computed((): string => {
    return props.anonymizable && mainState.currentSetting.postAnonymization
      ? $t("anonymous")
      : props.displayName
  }),
})
</script>

<template>
  <div class="display-name">
    <slot />
    <span>{{ state.displayName || "&emsp;" }}</span>
  </div>
</template>

<style lang="scss" scoped>
.display-name {
  display: flex;
  overflow: hidden;

  & > span {
    font-weight: bold;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
