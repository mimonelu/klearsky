<script lang="ts" setup>
import { reactive, watch } from "vue"
import getCaretCoordinates from "textarea-caret"

const props = defineProps<{
  text: string
}>()

const state = reactive<{
  display: boolean
  text?: string
  top?: number
}>({
  display: false,
  text: undefined,
  top: undefined,
})

watch(() => props.text, (value: string) => {
  const textarea = document.activeElement as null | HTMLTextAreaElement
  if (textarea == null) {
    resetState()
    return
  }
  const index = textarea.selectionEnd ?? - 1
  if (index === - 1) {
    resetState()
    return
  }
  const frontText = value.substring(0, index)
  const backText = value.substring(index)
  const frontMatch = frontText.match(/(?:^|\s)@([^\s]*)$/)
  const backMatch = backText.match(/^([\w.]*)/)
  if (frontMatch == null || backMatch == null) {
    resetState()
    return
  }
  state.text = frontMatch[1] + backMatch[1]
  const coordinates = getCaretCoordinates(textarea, index)
  state.top = coordinates.top + coordinates.height - textarea.scrollTop
  state.display = true
})

function resetState () {
  state.display = false
  state.text = undefined
  state.top = undefined
}
</script>

<template>
  <div class="account-suggest">
    <div
      v-if="state.display"
      class="account-suggest__suggest"
      :style="{ top: `calc(0.5rem + ${state.top}px)` }"
    >
      <button class="account-suggest__suggest__item">{{ state.text }}</button>
      <button class="account-suggest__suggest__item">{{ state.text }}</button>
      <button class="account-suggest__suggest__item">{{ state.text }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-suggest {
  &__suggest {
    background-color: rgb(var(--fg-color));
    border: 1px solid rgba(var(--bg-color), 0.25);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1;

    &__item {
      color: rgb(var(--bg-color));
      line-height: 1.25;
      padding: 0.5em 0.75em;
      word-break: break-all;
      &:not(:last-child) {
        border-bottom: 1px solid rgba(var(--bg-color), 0.25);
      }
    }
  }
}
</style>
