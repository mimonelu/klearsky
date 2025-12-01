<script lang="ts" setup>
import { computed, inject } from "vue"

const props = defineProps<{
  displayName?: string
  pronouns?: string
  anonymizable?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const isAnonymization = computed((): boolean => {
  return props.anonymizable && (mainState.currentSetting.postAnonymization ?? false)
})
</script>

<template>
  <div class="display-name">
    <slot />
    <span
      class="display-name__name"
      translate="no"
    >{{ isAnonymization ? $t("anonymous") : (displayName || "&emsp;") }}</span>
    <span
      v-if="!isAnonymization && pronouns"
      class="display-name__pronouns"
      translate="no"
    >{{ pronouns }}</span>
  </div>
</template>

<style lang="scss" scoped>
.display-name {
  display: flex;
  align-items: flex-end;
  overflow: hidden;

  &__name,
  &__pronouns {
    line-height: var(--line-height-low);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__name {
    font-weight: bold;

    &:not(:last-child) {
      margin-right: 0.5em;
    }
  }

  &__pronouns {
    color: rgb(var(--fg-color), 0.5);
    font-size: 0.875em;
  }
}
</style>
