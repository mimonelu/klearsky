<script lang="ts" setup>
defineProps<{
  title?: string;
}>()
</script>

<template>
  <header class="page-header">
    <h1 v-if="title">{{ title }}</h1>
  </header>
</template>

<style lang="scss" scoped>
.page-header {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  padding: 1rem;
}
</style>
