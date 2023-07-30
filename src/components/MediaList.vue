<script lang="ts" setup>
import { inject } from "vue"

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
      <img
        class="media__image"
        loading="lazy"
        decoding="async"
        :src="media.uri"
        :alt="media.alt"
      />
      <div class="media__cover">
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

  &__image {
    aspect-ratio: 1 / 1;
    background-color: rgba(var(--fg-color), 0.125);
    display: block;
    object-fit: cover;
  }

  &__cover {
    background-color: rgba(var(--fg-color), 0.75);
    color: rgb(var(--bg-color));
    display: grid;
    grid-template-columns: 1fr auto;
    padding: 0.125rem 0.375rem;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  &__created-at {
    font-size: 0.75rem;
    line-height: var(--line-height);
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
}
</style>
