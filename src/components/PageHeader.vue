<script lang="ts" setup>
defineProps<{
  title?: string;
  subTitle?: string;
}>()
</script>

<template>
  <header class="page-header">
    <h1 v-if="title">{{ title }}</h1>
    <div v-if="subTitle">-</div>
    <h2 v-if="subTitle">{{ subTitle }}</h2>
  </header>
</template>

<style lang="scss" scoped>
.page-header {
  background-color: rgba(var(--bg-color), var(--main-area-opacity));
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  display: grid;
  grid-gap: 0.5rem;
  grid-template-columns: auto auto 1fr;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 1;

  & > h1,
  & > h2 {
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > h1 {
    font-weight: bold;
  }
}
</style>
