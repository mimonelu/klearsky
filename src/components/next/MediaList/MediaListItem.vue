<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import ContentFilteringToggle from "@/components/buttons/ContentFilteringToggle.vue"
import LazyImage from "@/components/images/LazyImage.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { useContentLabels } from "@/composables/util/use-content-labels"

const props = defineProps<{
  media: TTMedia
}>()

const mainState = inject("state") as MainState

const {
  blurContentLabels,
  blurMediaLabels
} = useContentLabels(
  computed(() => props.media.post.author?.labels),
  computed(() => props.media.post.labels)
)

// 元のロジック: ["media", "none"]
const mediaFilteringLabels = computed((): Array<TILabelSetting> => {
  return [
    ...blurContentLabels.value.filter((label) => {
      return label.definition.blurs === "none"
    }),
    ...blurMediaLabels.value
  ]
})

const hasBlurMedia = computed((): boolean => {
  return mediaFilteringLabels.value.length > 0
})

const state = reactive<{
  contentFilteringDisplay: boolean
  imageDisplay: ComputedRef<boolean>
  createdAt: string
}>({
  contentFilteringDisplay: false,
  imageDisplay: computed((): boolean => {
    return !hasBlurMedia.value ||
      (
        hasBlurMedia.value &&
        state.contentFilteringDisplay
      )
  }),
  createdAt: mainState.formatDate(props.media.post.record.createdAt),
})

function onActivatePostContentToggle () {
  state.contentFilteringDisplay = !state.contentFilteringDisplay
}

function openPostThreadPopup () {
  mainState.postThreadPopupProps.posts = [props.media.post]
  // mainState.postThreadPopupProps.focusPostUri = props.media.post.uri
  mainState.postThreadPopupProps.display = true
}
</script>

<template>
  <button
    type="button"
    class="media-list__item"
    :data-image-display="state.imageDisplay"
    @click.prevent="$emit('clickItem')"
  >
    <LazyImage
      v-if="state.imageDisplay"
      :src="media.smallUri"
      :alt="media.alt"
    />

    <!-- ポストコンテンツトグル -->
    <ContentFilteringToggle
      v-if="hasBlurMedia"
      type="blur"
      :labels="mediaFilteringLabels"
      :display="state.contentFilteringDisplay"
      :togglable="true"
      @click.prevent.stop="onActivatePostContentToggle"
    />

    <div class="media-list__item__bottom">
      <!-- ポストスレッドポップアップトリガー -->
      <button
        type="button"
        class="media-list__item__post-thread-popup-trigger"
        @click.prevent.stop="openPostThreadPopup"
      >
        <SVGIcon name="post" />
      </button>

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
    </div>
  </button>
</template>

<style lang="scss" scoped>
.media-list__item {
  aspect-ratio: 1 / 1;
  cursor: pointer;
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

  &__bottom {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    grid-gap: 0.5rem;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
  }

  &__post-thread-popup-trigger {
    background-color: rgb(black, 0.5);
    border-radius: var(--border-radius-middle);
    cursor: pointer;
    font-size: 0.75rem;
    margin-right: 0.5rem;
    padding: 1em;

    & > .svg-icon {
      fill: rgb(white, 0.875);
    }
    &:focus, &:hover {
      & > .svg-icon {
        fill: white;
      }
    }
  }

  &__caption {
    background-color: rgb(black, 0.5);
    color: white;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 0.25rem 0.375rem;
    width: 100%;

    & > .svg-icon--repost {
      fill: rgb(var(--share-color));
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
