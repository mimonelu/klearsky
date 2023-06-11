<script lang="ts" setup>
import { inject } from "vue"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import Loader from "@/components/Loader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function updatePopularFeeds () {
  Util.blurElement()
  if (mainState.listProcessing) return
  mainState.listProcessing = true
  await mainState.fetchPopularFeedGenerators()
  mainState.listProcessing = false
}
</script>

<template>
  <div class="popular-feeds-view">
    <Portal to="custom-feeds-view-header-portal">
      <button
        class="button--bordered"
        @click.stop="updatePopularFeeds"
      >
        <SVGIcon name="repost" />
      </button>
    </Portal>
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
        :orderButtonDisplay="false"
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
    margin: 2rem;
  }
}
</style>
