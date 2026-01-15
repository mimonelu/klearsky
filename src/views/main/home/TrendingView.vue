<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { hasUserBlurLabel } from "@/composables/util/use-content-labels"

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
  mainState.currentTrendingImagesFetched = false
  const response = await mainState.atp.fetchTrendingTopics(mainState.atp.data.did)
  if (response instanceof Error || response == null) {
    state.processing = false

    // 3rd PDS 向けにエラーメッセージは非表示
    // mainState.openErrorPopup(response, "TrendingView/fetchTrendingTopics")

    return
  }
  mainState.currentSuggestedTopics.splice(0, mainState.currentSuggestedTopics.length, ...response.suggested)
  mainState.currentTrendingTopics.splice(0, mainState.currentTrendingTopics.length, ...response.topics)

  // 連動してホット画像データを更新
  if (mainState.currentTrendingTopics.length > 0) {
    await updateHotPosts()
  }

  state.processing = false
  mainState.currentTrendingImagesFetched = true
}

// ホットトピックの最大数
const MAX_HOT_TOPICS = 5

// ホットトピックごとに取得するホットポストの最大数
const MAX_HOT_POSTS = 5

// ホット画像データの最大数
const MAX_HOT_TRENDING_IMAGES = 5

// ホット画像スケルトンの最大数
const MAX_HOT_TRENDING_IMAGE_SKELETONS = 3

async function updateHotPosts () {
  // ホットポスト
  const hotPosts: Array<Array<TTPost>> = []

  // 検索対象となるホットトピックを取得
  const hotTopics = mainState.currentTrendingTopics.slice(0, MAX_HOT_TOPICS)

  // ホットトピックごとにホットポストを取得
  const tasks = hotTopics.map((topic, index) => {
    hotPosts[index] = []
    return mainState.atp.fetchPostSearch(
      hotPosts[index],
      topic.topic,
      { sort: "top" },
      MAX_HOT_POSTS
    )
  })
  await Promise.all(tasks)

  // ホットポストにトピック情報を追加
  hotTopics.forEach((topic, index) => {
    hotPosts[index]?.forEach((post) => {
      post.__topic = topic.topic
    })
  })

  // ホット画像データを抽出
  const hotImages: Array<TTrendingImage> = hotPosts
    .flat()

    // 有害なラベルが設定されているポストを除外（ラベラー設定を考慮）
    .filter((post) => {
      const hasHarmfulAuthorLabel = hasUserBlurLabel(mainState, post.author.labels)
      const hasHarmfulPostLabel = hasUserBlurLabel(mainState, post.labels)
      return !hasHarmfulAuthorLabel && !hasHarmfulPostLabel
    })

    // 画像を持つポストのみを抽出
    .filter((post) => {
      return post.embed?.images?.[0]?.thumb != null
    })

    // ホットポストからホット画像データに変換
    .map((post) => {
      return {
        topic: post.__topic as string,
        image: post.embed?.images?.[0]?.thumb as string,
        text: post.record.text as string,
      }
    })

    // 重複するトピックを削除
    .reduce((results: Array<TTrendingImage>, current: TTrendingImage) => {
      if (results.findIndex((hotImage) => {
        return hotImage.topic === current.topic
      }) === - 1) {
        results.push(current)
      }
      return results
    }, [])

    // 最大 5 件に制限
    .slice(0, MAX_HOT_TRENDING_IMAGES)

  // 画像が偶数の場合は最後の要素を削除（レイアウト都合）
  if ((hotImages.length % 2) === 0) {
    hotImages.pop()
  }

  mainState.currentTrendingImages.splice(0, mainState.currentTrendingImages.length, ...hotImages)
}
</script>

<template>
  <div class="trending-view">
    <div class="trending-view__container">
      <!-- ホット画像 -->
      <div
        v-if="mainState.currentTrendingImagesFetched"
        class="trending-view__image-container"
      >
        <RouterLink
          v-for="image, imageIndex in mainState.currentTrendingImages"
          :key="imageIndex"
          :to="{ name: 'post-search', query: { text: image.topic, sort: 'top' } }"
          class="trending-view__image"
        >
          <LazyImage
            :src="image.image"
            :alt="image.text"
          />
          <div
            class="trending-view__image-topic"
            translate="no"
          >{{ image.topic }}</div>
          <div
            v-if="image.text"
            class="trending-view__image-text"
          >{{ image.text }}</div>
        </RouterLink>
      </div>

      <!-- ホット画像スケルトン -->
      <div
        v-else
        class="trending-view__image-container"
      >
        <div
          v-for="index of MAX_HOT_TRENDING_IMAGE_SKELETONS"
          :key="index"
          class="trending-view__skeleton"
        />
      </div>

      <!-- 話題のトピック -->
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
            :to="{ name: 'post-search', query: { text: topic.topic, sort: 'top' } }"
            class="button--plain trending-view__topic"
          >
            <span translate="no">{{ topic.topic }}</span>
          </RouterLink>
        </div>
      </div>

      <!-- おすすめのトピック -->
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
            :to="{ name: 'post-search', query: { text: topic.topic, sort: 'top' } }"
            class="button--plain trending-view__topic"
          >
            <span translate="no">{{ topic.topic }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- 更新ボタン -->
    <div class="trending-view__button-container">
      <button
        type="button"
        class="trending-view__refresh-button button--plain"
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
    border-radius: var(--border-radius-middle);
    display: block;
    overflow: hidden;
    position: relative;
    &:first-child {
      grid-column: span 2;

      .trending-view__image-topic {
        font-size: min(1.25rem, 4vmin);
      }

      .trending-view__image-text {
        font-size: min(1.0rem, 3vmin);
      }
    }

    & > img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }

    &-topic {
      background-color: rgb(0, 0, 0, 0.75);
      border-radius: 0 0 var(--border-radius-middle) 0;
      color: rgb(255, 255, 255);
      font-size: min(1rem, 3vmin);
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
      font-size: min(0.875rem, 2vmin);
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

  &__skeleton {
    aspect-ratio: 16 / 9;
    background-color: rgba(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
    &:first-child {
      grid-column: span 2;
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
