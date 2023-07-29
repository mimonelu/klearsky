<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import Loader from "@/components/Loader.vue"
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
    await updatePopularFeeds()
})

function close () {
  emit("close")
}

async function updatePopularFeeds () {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  await mainState.fetchPopularFeedGenerators()
  state.processing = false
}
</script>

<template>
  <Popup
    class="popular-feeds-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <button @click.stop="updatePopularFeeds">
        <SVGIcon name="refresh" />
      </button>
      <h2>
        <SVGIcon name="fire" />
        <span>{{ $t("popularFeeds") }}</span>
      </h2>
    </template>
    <template #body>
      <div
        v-if="!state.processing && mainState.currentPopularFeedGenerators.length === 0"
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
          :creatorDisplay="true"
          @click="close"
          @onActivateMention="close"
          @onActivateHashTag="close"
        />
      </template>
      <Loader v-if="state.processing" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.popular-feeds-popup:deep() {
  .popup {
    flex-grow: 1;
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

  .custom-feed-card:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  }

  .textlabel {
    margin: 1rem;
  }
}
</style>
