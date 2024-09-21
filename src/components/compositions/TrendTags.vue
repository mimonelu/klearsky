<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import Loader from "@/components/shells/Loader.vue";
import SVGIcon from "@/components/images/SVGIcon.vue";
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
}>({
  loaderDisplay: false,
})

onMounted(async () => {
  if (Object.keys(mainState.currentTrendTags).length === 0) {
    await fetchTrendTags()
  }
})

async function fetchTrendTags () {
  if (state.loaderDisplay) {
    return
  }
  mainState.currentTrendTags.splice(0)
  state.loaderDisplay = true
  const response: Error | Response = await Util.fetchWithTimeout(
    "https://skyfeed-trending-tags.b-cdn.net/xrpc/app.skyfeed.feed.getTrendingTags?minutes=60",
    { mode: "cors" },
  )
    .then((value) => value)
    .catch((error) => error)

  // DoS攻撃対策
  await Util.wait(1000)

  console.log("[klearsky/app.skyfeed.feed.getTrendingTags]", response)
  if (response instanceof Error) {
    state.loaderDisplay = false
    mainState.openErrorPopup(response, "TrendTags/fetchTrendTags")
    return
  }
  if (!response.ok) {
    state.loaderDisplay = false
    mainState.openErrorPopup(Error("apiError"), "TrendTags/fetchTrendTags")
    return
  }
  const trendTags = await response.json()
  Util.setArray(mainState.currentTrendTags, trendTags?.tags ?? [])
  state.loaderDisplay = false
}
</script>

<template>
  <div class="trend-tags">
    <div class="trend-tags__header">
      <div class="textlabel">
        <div class="textlabel__text">
          <SVGIcon name="hash" />{{ $t("trendTags") }}
        </div>
      </div>
      <button
        type="button"
        class="textlink--icon"
        :disabled="state.loaderDisplay"
        @click.stop="fetchTrendTags"
      >
        <SVGIcon name="refresh" />
        <span>{{ $t("reload") }}</span>
      </button>
    </div>
    <div class="trend-tags__container">
      <RouterLink
        v-for="trendTag, trendTagIndex of mainState.currentTrendTags"
        :key="trendTagIndex"
        :to="{ name: 'post-search', query: { text: `#${trendTag.tag}` } }"
        class="trend-tag"
      >
        <SVGIcon name="hash" />
        <div class="trend-tag__name">{{ trendTag.name }}</div>
        <div class="trend-tag__count">{{ trendTag.count }}</div>
      </RouterLink>
    </div>
    <Loader v-if="state.loaderDisplay" />
  </div>
</template>

<style lang="scss" scoped>
.trend-tags {
  padding: 1rem;
  position: relative;

  &__header {
    display: grid;
    grid-gap: 0.5rem;
    grid-template-columns: 1fr auto;
    align-items: center;
    margin-bottom: 1rem;

    .textlabel {
      word-break: break-all;
    }
  }

  &__container {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    grid-gap: 0.25rem 0.25rem;
  }
}

.trend-tag {
  border-radius: var(--border-radius-middle);
  display: flex;
  align-items: baseline;
  grid-gap: 0.5em;
  font-size: 1rem;
  padding: 0.5em;
  &:focus, &:hover {
    background-color: rgb(var(--accent-color), 0.25);
  }

  // フォントサイズの変更
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      font-size: (math.div(11 - $i, 20) + 1) + rem;
    }
  }

  & > .svg-icon {
    fill: rgb(var(--post-color));
  }

  &__name {
    font-size: 1.5em;
    word-break: break-all;
  }

  &__count {
    color: rgb(var(--fg-color), 0.5);
  }
}
</style>
