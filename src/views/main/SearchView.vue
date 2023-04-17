<script lang="ts" setup>
import { RouterView } from "vue-router"
</script>

<template>
  <div class="search-view">
    <div class="tab">
      <RouterLink
        class="tab__button"
        to="/search/user"
      >{{ $t("userSearch") }}</RouterLink>
      <RouterLink
        class="tab__button"
        to="/search/keyword"
      >{{ $t("keywordSearch") }}</RouterLink>
    </div>
    <RouterView class="child-view" />
  </div>
</template>

<style lang="scss" scoped>
.search-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  &:deep() {
    .textbox {
      border-bottom-style: none;
    }
  }
}

.tab {
  position: sticky;
  top: 0;
  z-index: 1;

  &__button {
    width: 50%;
  }
}

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
