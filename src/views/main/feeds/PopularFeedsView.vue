<script lang="ts" setup>
import { inject } from "vue"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import Loader from "@/components/Loader.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="popular-feeds-view">
    <div
      v-if="!mainState.listProcessing && mainState.currentPopularFeedGenerators.length === 0"
      class="textlabel"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noPopularFeeds") }}
      </div>
    </div>
    <template v-else>
      <CustomFeedCard
        v-for="generator of mainState.currentPopularFeedGenerators"
        :key="generator.cid"
        :generator="generator"
      />
    </template>
    <Loader v-if="mainState.listProcessing" />
  </div>
</template>

<style lang="scss" scoped>
.popular-feeds-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-bottom: var(--sp-menu-height);
  position: relative;

  .custom-feed-card {
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  }

  .textlabel {
    margin: 1.5rem;
  }
}
</style>
