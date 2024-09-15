<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import ContentFilteringToggle from "@/components/buttons/ContentFilteringToggle.vue"
import LazyImage from "@/components/images/LazyImage.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const props = defineProps<{
  media: TTMedia
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  allLabels: ComputedRef<Array<TTLabel>>
  blurMediaLabels: ComputedRef<Array<TILabelSetting>>
  hasBlurredMedia: ComputedRef<boolean>
  contentFilteringDisplay: boolean
  imageDisplay: ComputedRef<boolean>
  createdAt: string
}>({
  allLabels: computed((): Array<TTLabel> => {
    return [
      ...(props.media.post.author?.labels ?? []),
      ...(props.media.post.labels ?? [])
    ]
  }),
  blurMediaLabels: computed((): Array<TILabelSetting> => {
    return mainState.myLabeler!.getSpecificLabels(state.allLabels, ["hide", "warn"], ["media", "none"])
  }),
  hasBlurredMedia: computed((): boolean => {
    return state.blurMediaLabels.length > 0
  }),
  contentFilteringDisplay: false,
  imageDisplay: computed((): boolean => {
    return !state.hasBlurredMedia ||
      (
        state.hasBlurredMedia &&
        state.contentFilteringDisplay
      )
  }),
  createdAt: mainState.formatDate(props.media.post.record.createdAt),
})

function onActivatePostContentToggle () {
  state.contentFilteringDisplay = !state.contentFilteringDisplay
}
</script>

<template>
  <RouterLink
    :to="{ name: 'post', query: { uri: media.post.uri } }"
    class="media-list__item"
    :data-image-display="state.imageDisplay"
  >
    <LazyImage
      v-if="state.imageDisplay"
      :src="media.uri"
      :alt="media.alt"
    />

    <!-- ポストコンテンツトグル -->
    <ContentFilteringToggle
      v-if="state.hasBlurredMedia"
      type="blur"
      :labels="state.blurMediaLabels"
      :display="state.contentFilteringDisplay"
      :togglable="true"
      @click.prevent="onActivatePostContentToggle"
    />

    <!-- キャプション -->
    <div class="media-list__item__caption">
      <SVGIcon
        v-if="media.isRepost"
        name="repost"
      />
      <div
        class="media-list__item__text"
        dir="auto"
      >{{ media.post.record.text }}</div>
      <div class="media-list__item__created-at">{{ state.createdAt }}</div>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.media-list__item {
  aspect-ratio: 1 / 1;
  position: relative;
  &[data-image-display="false"] {
    background-image: linear-gradient(
      -45deg,
      rgb(var(--fg-color), 0.125) 49.875%,
      rgb(var(--bg-color)) 49.875%,
      rgb(var(--bg-color)) 50.125%,
      rgb(var(--fg-color), 0.125) 50.125%
    );
  }

  .lazy-image {
    aspect-ratio: 1 / 1;
    background-color: rgb(var(--fg-color), 0.125);
    object-fit: cover;
    width: 100%; // for Firefox
  }

  .content-filtering-toggle {
    font-size: 0.75rem;
    margin: 0.5rem;
    position: absolute;
    top: 0;
    left: 0;
  }

  &__caption {
    background-color: rgb(black, 0.5);
    color: white;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 0.125rem 0.375rem;
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;

    & > .svg-icon {
      fill: rgb(var(--bg-color));
      font-size: 0.75rem;
      margin-right: 0.375rem;
    }
  }

  &__text {
    font-size: 0.75rem;
    font-style: italic;
    line-height: var(--line-height-high);
    margin-right: 0.375rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:empty {
      display: none;
    }
  }

  &__created-at {
    font-size: 0.75rem;
    line-height: var(--line-height-high);
    margin-left: auto;
    white-space: nowrap;
  }
}
</style>
