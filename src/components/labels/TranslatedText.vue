<script lang="ts" setup>
defineProps<{
  step: TTTranslationStep
  text: undefined | string
}>()
</script>

<template>
  <div
    v-if="
      step === 'waiting' ||
      step === 'failed' ||
      step === 'done'
    "
    class="translated-text"
    dir="auto"
  >
    <template v-if="step === 'waiting'">{{ $t("translating") }}</template>
    <template v-else-if="step === 'failed'">{{ $t("translationFailed") }}</template>
    <template v-else-if="step === 'done'">{{ text }}</template>
  </div>
</template>

<style lang="scss" scoped>
.translated-text {
  border-top: 1px solid rgb(var(--fg-color), 0.125);
  padding-top: 0.5em;
  color: rgb(var(--fg-color), 0.75);
  font-style: italic;
  line-height: var(--line-height-high);
  user-select: text;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
