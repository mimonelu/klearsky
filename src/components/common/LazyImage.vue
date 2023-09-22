<script lang="ts" setup>
import { reactive } from "vue"

defineProps<{
  src?: string
  alt?: string
}>()

const state = reactive<{
  hasError: boolean
  hasLoad: boolean
}>({
  hasError: false,
  hasLoad: false,
})

function onError () {
  state.hasError = true
}

function onLoad () {
  state.hasLoad = true
}
</script>

<template>
  <img
    class="lazy-image"
    loading="lazy"
    decoding="async"
    :src="state.hasError ? '/img/void.png' : src ?? '/img/void.png'"
    :alt="alt ?? ''"
    :data-has-load="state.hasLoad"
    @error="onError"
    @load="onLoad"
  >
</template>

<style lang="scss" scoped>
@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1.0; }
}

.lazy-image {
  display: block;
  opacity: 0;
  &[data-has-load="true"] {
    animation: fade-in 250ms ease-out;
    animation-fill-mode: forwards;
  }
}
</style>
