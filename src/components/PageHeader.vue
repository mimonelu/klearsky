<script lang="ts" setup>
const props = defineProps<{
  title?: string;
}>()
</script>

<template>
  <header class="page-header">
    <h1 v-if="props.title">{{ props.title }}</h1>
  </header>
</template>

<style lang="scss" scoped>
.page-header {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  padding: 1rem;
}
</style>
