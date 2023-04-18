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
  background-color: rgb(var(--bg-color));
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  display: grid;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 1;

  & > h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
