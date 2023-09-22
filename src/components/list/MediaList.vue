<script lang="ts" setup>
import { inject } from "vue"
import LazyImage from "@/components/common/LazyImage.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

defineProps<{
  medias: Array<TTMedia>
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <div class="media-list">
    <RouterLink
      v-for="media of medias"
      :key="media.uri"
      :to="{ name: 'post', query: { uri: media.post.uri } }"
      class="media"
    >
      <LazyImage
        :src="media.uri"
        :alt="media.alt"
      />
      <div class="media__cover">
        <SVGIcon
          v-if="media.isRepost"
          name="repost"
        />
        <div
          class="media__text"
          dir="auto"
        >{{ media.post.record.text }}</div>
        <div class="media__created-at">{{ mainState.formatDate(media.post.record.createdAt) }}</div>
      </div>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.media-list {
  display: grid;
  grid-gap: 1px;
  grid-template-columns: repeat(2, 1fr);
  padding: 1px;
}

.media {
  aspect-ratio: 1 / 1;
  position: relative;

  .lazy-image {
    aspect-ratio: 1 / 1;
    background-color: var(--fg-color-0125);
    object-fit: cover;
    width: 100%; // for Firefox
  }

  &__cover {
    background-color: var(--fg-color-075);
    color: rgb(var(--bg-color));
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 0.125rem 0.375rem;
    position: absolute;
    bottom: 0;
    right: 0;

    & > .svg-icon {
      fill: rgb(var(--bg-color));
      font-size: 0.75rem;
      margin-right: 0.375rem;
    }
  }

  &__text {
    font-size: 0.75rem;
    font-style: italic;
    line-height: var(--line-height);
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
    line-height: var(--line-height);
    white-space: nowrap;
  }
}
</style>
