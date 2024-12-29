<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
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
    mainState.openErrorPopup(response, "TrendingView/fetchTrendingTopics")
    return
  }
  mainState.currentSuggestedTopics.splice(0, mainState.currentSuggestedTopics.length, ...response.suggested)
  mainState.currentTrendingTopics.splice(0, mainState.currentTrendingTopics.length, ...response.topics)
  if (mainState.currentTrendingTopics.length > 0) {
    await updateHotPosts()
  }
}

async function updateHotPosts () {
  const hotPosts: Array<Array<TTPost>> = []
  const hotTopics = mainState.currentTrendingTopics.slice(0, 7)
  const tasks = hotTopics.map((topic, index) => {
    hotPosts[index] = []
    return mainState.atp.fetchPostSearch(
      hotPosts[index],
      topic.topic,
      { sort: top },
      5
    )
  })
  await Promise.all(tasks)
  hotTopics.forEach((topic, index) => {
    hotPosts[index]?.forEach((post) => {
      post.__topic = topic.topic
    })
  })
  const hotImages: Array<TTrendingImage> = hotPosts
    .flat()
    .filter((post) => {
      return post.embed?.images?.[0]?.thumb != null
    })
    .map((post) => {
      return {
        topic: post.__topic as string,
        image: post.embed?.images?.[0]?.thumb as string,
        text: post.record.text as string,
      }
    })
    .slice(0, 5)
  if ((hotImages.length % 2) === 0) {
    hotImages.pop()
  }
  mainState.currentTrendingImages.splice(0, mainState.currentTrendingImages.length, ...hotImages)
}
</script>

<template>
  <div class="trending-view">
    <div class="trending-view__container">
      <div
        v-if="mainState.currentTrendingImages.length > 0"
        class="trending-view__image-container"
      >
        <RouterLink
          v-for="image, imageIndex in mainState.currentTrendingImages"
          :key="imageIndex"
          :to="{ name: 'post-search', query: { text: image.topic } }"
          class="trending-view__image"
        >
          <LazyImage
            :src="image.image"
            :alt="image.text"
          />
          <div class="trending-view__image-topic">{{ image.topic }}</div>
          <div class="trending-view__image-text">{{ image.text }}</div>
        </RouterLink>
      </div>
      <div
        v-if="mainState.currentTrendingTopics.length > 0"
        class="trending-view__topics-container"
      >
        <h2>
          <SVGIcon name="trending" />
          <span>{{ $t("trendingTopics") }}</span>
        </h2>
        <div class="trending-view__topics">
          <RouterLink
            v-for="topic, topicIndex in mainState.currentTrendingTopics"
            :key="topicIndex"
            :to="{ name: 'post-search', query: { text: topic.topic } }"
            class="button--plane trending-view__topic"
          >
            <span>{{ topic.topic }}</span>
          </RouterLink>
        </div>
      </div>
      <div
        v-if="mainState.currentSuggestedTopics.length > 0"
        class="trending-view__topics-container"
      >
        <h2>
          <SVGIcon name="trending" />
          <span>{{ $t("suggestedTopics") }}</span>
        </h2>
        <div class="trending-view__topics">
          <RouterLink
            v-for="topic, topicIndex in mainState.currentSuggestedTopics"
            :key="topicIndex"
            :to="{ name: 'post-search', query: { text: topic.topic } }"
            class="button--plane trending-view__topic"
          >
            <span>{{ topic.topic }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
    <div class="trending-view__button-container">
      <button
        type="button"
        class="trending-view__refresh-button button--plane"
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
.trending-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-bottom: 1rem;
  position: relative;

  &__container {
    flex-grow: 1;
  }

  &__image-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  }

  &__image {
    aspect-ratio: 16 / 9;
    border-radius: var(--border-radius-large);
    display: block;
    overflow: hidden;
    position: relative;
    &:first-child {
      grid-column: span 2;

      .trending-view__image-topic {
        font-size: 1.5rem;
      }

      .trending-view__image-text {
        font-size: 1rem;
      }
    }

    & > img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }

    &-topic {
      background-color: rgb(0, 0, 0, 0.75);
      border-radius: 0 0 var(--border-radius-large) 0;
      color: rgb(255, 255, 255);
      font-size: 1rem;
      font-weight: bold;
      overflow: hidden;
      padding: 0.5em;
      position: absolute;
      top: 0;
      left: 0;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-text {
      background-color: rgb(0, 0, 0, 0.75);
      color: rgb(224, 224, 224);
      font-size: 0.875rem;
      font-style: italic;
      overflow: hidden;
      padding: 0.5em;
      position: absolute;
      bottom: 0;
      left: 0;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
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
