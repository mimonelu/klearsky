<script lang="ts" setup>
import { onMounted, reactive } from "vue"

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

onMounted(() => {
  state.hasError = false
  state.hasLoad = false
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
    v-if="!state.hasError && src"
    class="lazy-image lazy-image--src"
    loading="lazy"
    decoding="async"
    :src="src"
    :alt="alt ?? ''"
    :data-has-load="state.hasLoad"
    @error="onError"
    @load="onLoad"
  >
  <img
    v-else
    class="lazy-image"
    loading="lazy"
    decoding="async"
    src="/img/void.png"
    :alt="alt ?? ''"
  >
</template>

<style lang="scss" scoped>
.lazy-image {
  background-color: rgb(var(--fg-color), 0.125);
  display: block;
  &[data-has-load="true"] {
    @keyframes fade-in {
      0% { opacity: 0; }
      100% { opacity: 1.0; }
    }
    animation: fade-in 250ms ease-out;
    animation-fill-mode: forwards;
  }

  &--src {
    opacity: 0;
  }
}
</style>
