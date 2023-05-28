<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

defineProps<{
  generator: TTFeedGenerator
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <RouterLink
    class="feed-card"
    :to="{ path: '/feeds/timeline', query: {
      feed: generator.uri,
      displayName: generator.displayName,
    } }"
    @click.stop
  >
    <div class="feed-card__left">
      <img
        class="feed-card__avatar"
        loading="lazy"
        :src="generator.avatar"
        alt=""
      >
    </div>
    <div class="feed-card__right">
      <div class="feed-card__display-name">
        <SVGIcon name="rss" />
        <span>{{ generator.displayName }}</span>
      </div>
      <div class="feed-card__right__middle">
        <div class="feed-card__like-count">
          <SVGIcon name="heart" />
          <span>{{ generator.likeCount }}</span>
        </div>
        <div class="feed-card__indexed-at">
          <SVGIcon name="clock" />
          <span>{{ mainState.formatDate(generator.indexedAt) }}</span>
        </div>
      </div>
      <div class="feed-card__description">{{ generator.description }}</div>
      <RouterLink
        class="feed-card__creator"
        :to="{ name: 'profile-post', query: { handle: generator.creator.handle } }"
        @click.stop
      >
        <SVGIcon name="person" />
        <div class="feed-card__creator__display-name">{{ generator.creator.displayName }}</div>
        <div class="feed-card__creator__handle">{{ generator.creator.handle }}</div>
      </RouterLink>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.feed-card {
  background-color: rgba(var(--accent-color), 0.125);
  border: 1px solid rgba(var(--accent-color), 0.25);
  border-radius: var(--border-radius);
  display: flex;
  grid-gap: 1em;
  padding: 1em;
  &:focus, &:hover {
    border-color: rgb(var(--accent-color), 0.5);
  }

  &__avatar {
    border: 1px solid rgba(var(--fg-color), 0.25);
    border-radius: var(--border-radius);
    display: block;
    min-width: 3em;
    max-width: 3em;
    min-height: 3em;
    max-height: 3em;
  }

  &__right {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    grid-gap: 0.25em;

    &__middle {
      display: flex;
      grid-gap: 0.5em;
    }
  }

  &__display-name {
    display: flex;
    align-items: center;
    grid-gap: 0.25em;

    & > .svg-icon {
      fill: rgb(var(--accent-color));
      font-size: 0.875em;
    }

    & > span {
      font-weight: bold;
      line-height: 1.25;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  &__like-count,
  &__indexed-at {
    display: flex;
    align-items: center;
    grid-gap: 0.25em;

    & > .svg-icon {
      font-size: 0.75em;
    }

    & > span {
      font-size: 0.875em;
      line-height: 1.25;
    }
  }

  &__like-count {
    & > .svg-icon {
      fill: rgba(var(--like-color), 0.75);
    }

    & > span {
      color: rgba(var(--fg-color), 0.75);
      font-weight: bold;
    }
  }

  &__indexed-at {
    & > .svg-icon {
      fill: rgba(var(--fg-color), 0.75);
    }

    & > span {
      color: rgba(var(--fg-color), 0.75);
    }
  }

  &__description {
    font-size: 0.875em;
    line-height: 1.25;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__creator {
    background-color: rgb(var(--bg-color));
    border: 1px solid rgb(var(--accent-color), 0.25);
    border-radius: var(--border-radius);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    grid-gap: 0.5em;
    margin: 0.25em 0 0 auto;
    padding: 0.5em 1em;
    &:focus, &:hover {
      border-color: rgb(var(--accent-color), 0.5);
    }

    & > .svg-icon {
      fill: rgba(var(--accent-color), 0.75);
      font-size: 0.75em;
    }

    &__display-name {
      font-size: 0.875em;
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
    }

    &__handle {
      color: rgba(var(--fg-color), 0.75);
      font-size: 0.875em;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
    }
  }
}
</style>
