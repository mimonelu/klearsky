<script lang="ts" setup>
import { RouterView, useRouter } from "vue-router"
import { blurElement } from "@/composables/misc"

const router = useRouter()

function openChildPage (pageName: string) {
  blurElement()
  router.push({ name: pageName })
}
</script>

<template>
  <div class="search-view">
    <div class="tab">
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'user-search'"
        @click.prevent="openChildPage('user-search')"
      >{{ $t("userSearch") }}</button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'keyword-search'"
        @click.prevent="openChildPage('keyword-search')"
      >{{ $t("keywordSearch") }}</button>
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

  &-button {
    background-color: rgb(var(--bg-color));
  }
}

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
