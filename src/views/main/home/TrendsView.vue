<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue";

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

onMounted(async () => {
  if (
    mainState.currentSuggestedTopics.length > 0 ||
    mainState.currentTrendingTopics.length > 0
  ) {
    return
  }
  await updateTrendingTopics()
})

async function updateTrendingTopics () {
  state.processing = true
  const response = await mainState.atp.fetchTrendingTopics(mainState.atp.data.did)
  state.processing = false
  if (response instanceof Error || response == null) {
    mainState.openErrorPopup(response, "TrendsView/fetchTrendingTopics")
    return
  }
  mainState.currentSuggestedTopics.splice(0, mainState.currentSuggestedTopics.length, ...response.suggested)
  mainState.currentTrendingTopics.splice(0, mainState.currentTrendingTopics.length, ...response.topics)
}
</script>

<template>
  <div class="trends-view">
    <div class="trends-view__container">
      <div
        v-if="mainState.currentTrendingTopics.length > 0"
        class="trends-view__topics-container"
      >
        <h2>
          <SVGIcon name="trending" />
          <span>{{ $t("trendingTopics") }}</span>
        </h2>
        <div class="trends-view__topics">
          <RouterLink
            v-for="topic, topicIndex in mainState.currentTrendingTopics"
            :key="topicIndex"
            :to="{ name: 'post-search', query: { text: topic.topic } }"
            class="button--plane trends-view__topic"
          >
            <span>{{ topic.topic }}</span>
          </RouterLink>
        </div>
      </div>
      <div
        v-if="mainState.currentSuggestedTopics.length > 0"
        class="trends-view__topics-container"
      >
        <h2>
          <SVGIcon name="trending" />
          <span>{{ $t("suggestedTopics") }}</span>
        </h2>
        <div class="trends-view__topics">
          <RouterLink
            v-for="topic, topicIndex in mainState.currentSuggestedTopics"
            :key="topicIndex"
            :to="{ name: 'post-search', query: { text: topic.topic } }"
            class="button--plane trends-view__topic"
          >
            <span>{{ topic.topic }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
    <div class="trends-view__button-container">
      <button
        type="button"
        class="trends-view__refresh-button button--plane"
        :disabled="state.processing"
        @click.prevent="updateTrendingTopics"
      >
        <SVGIcon name="refresh" />
        <span>{{ $t("refresh") }}</span>
      </button>
    </div>
    <Loader v-if="state.processing" />
  </div>
</template>

<style lang="scss" scoped>
.trends-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-bottom: 1rem;
  position: relative;

  &__container {
    flex-grow: 1;
  }

  &__topics-container {
    padding: 1rem;

    & > h2 {
      display: flex;
      align-items: center;
      grid-gap: 0.5rem;
      margin-bottom: 1rem;

      & > .svg-icon {
        fill: rgb(var(--fg-color));
      }

      & > span {
        font-weight: bold;
      }
    }
  }

  &__topics {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  &__topic {
    --fg-color: var(--accent-color);
  }

  &__button-container {
    display: flex;
    justify-content: center;
  }
}
</style>
