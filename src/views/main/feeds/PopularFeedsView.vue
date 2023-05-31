<script lang="ts" setup>
import { inject } from "vue"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import Loader from "@/components/Loader.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="popular-feeds-view">
    <CustomFeedCard
      v-for="generator of mainState.currentPopularFeedGenerators"
      :key="generator.cid"
      :generator="generator"
    />
    <Loader v-if="mainState.listProcessing" />
  </div>
</template>

<style lang="scss" scoped>
.popular-feeds-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 0.5rem;
  padding: 0.5rem;
  position: relative;
}
</style>
