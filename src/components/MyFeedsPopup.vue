<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  myFeedGenerators: Array<TTFeedGenerator>
}>({
  myFeedGenerators: [],
})

onMounted(async () => {
  mainState.processing = true
  const preferences = await mainState.fetchPreferences()
  mainState.processing = false
  if (!preferences) {
    mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchPreferences")
    return
  }

  if (mainState.feedPreferences?.saved == null) {
    state.myFeedGenerators.splice(0)
    return
  }

  mainState.processing = true
  const generators = await mainState.atp.fetchFeedGenerators(mainState.feedPreferences.saved)
  mainState.processing = false
  if (generators instanceof Error) {
    mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchFeedGenerators")
    return
  }
  state.myFeedGenerators.splice(0, state.myFeedGenerators.length, ...generators)
})

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="my-feeds-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="rss" />
        <span>{{ $t("myFeeds") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <div
        v-if="state.myFeedGenerators.length === 0"
        class="textlabel"
        :data-is-processing="mainState.processing"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noFeeds") }}
        </div>
      </div>
      <template v-else>
        <CustomFeedCard
          v-for="generator of state.myFeedGenerators"
          :key="generator.cid"
          :generator="generator"
          @click="close"
        />
      </template>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-feeds-popup:deep() {
  .popup-header {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);

    & > h2 {
      color: rgb(var(--accent-color));

      & > .svg-icon {
        fill: rgb(var(--accent-color));
      }
    }
  }

  .popup-body {
    grid-gap: unset;
    padding: unset;
  }

  .custom-feed-card:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  }

  .textlabel {
    margin: 1rem;
    &[data-is-processing="true"] {
      visibility: hidden;
    }
  }
}
</style>
