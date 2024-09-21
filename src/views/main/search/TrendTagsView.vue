<script lang="ts" setup>
import TrendTags from "@/components/compositions/TrendTags.vue";
</script>

<template>
  <div class="trend-tags-view">
    <div class="trend-tags-view__main">
      <TrendTags />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.trend-tags-view {
  &__main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .trend-tags {
    flex-grow: 1;
  }
}
</style>
