<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import FeedCard from "@/components/FeedCard.vue"
import LoadButton from "@/components/LoadButton.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

onMounted(async () => {
  if (mainState.currentPopularFeedGenerators.length === 0)
    await fetchContinuousResults("new")
})

function close () {
  emit("close")
}

async function resetPopularFeeds () {
  mainState.currentPopularFeedGenerators.splice(0)
  mainState.currentPopularFeedGeneratorsCursor = undefined
  await fetchContinuousResults("new")
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  await mainState.fetchPopularFeedGenerators(direction)
  state.processing = false
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}
</script>

<template>
  <Popup
    class="popular-feeds-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <!-- リセットボタン -->
      <button @click.stop="resetPopularFeeds">
        <SVGIcon name="refresh" />
      </button>

      <h2>
        <SVGIcon name="fire" />
        <span>{{ $t("popularFeeds") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- 人気フィードがひとつもないメッセージ -->
      <div
        v-if="!state.processing && mainState.currentPopularFeedGenerators.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noPopularFeeds") }}
        </div>
      </div>

      <!-- カスタムフィード -->
      <template v-else>
        <FeedCard
          v-for="generator of mainState.currentPopularFeedGenerators"
          :key="generator.cid"
          :generator="generator"
          :orderButtonDisplay="false"
          :creatorDisplay="true"
          @click="close"
          @onActivateMention="close"
          @onActivateHashTag="close"
        />
      </template>
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.popular-feeds-popup:deep() {
  .popup {
    flex-grow: 1;
    height: 100%;
  }

  .popup-header {
    & > h2 {
      color: rgb(var(--notice-color));

      & > .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }

  .popup-body {
    flex-grow: 1;
    grid-gap: unset;
    padding: unset;
  }

  .feed-card:not(:last-child) {
    border-bottom: 1px solid var(--fg-color-0125);
  }

  .textlabel {
    margin: 1rem;
  }
}
</style>
