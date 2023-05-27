<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import Loader from "@/components/Loader.vue"
import PageHeader from "@/components/PageHeader.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="custom-feeds-view">
    <div class="custom-feeds-view__header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('customFeeds')"
      />
    </div>
    <div class="generator-container">
      <a
        v-for="generator of mainState.currentFeedGenerators"
        :key="generator.cid"
        class="generator"
        :href="generator.uri.replace('at://', 'https://bsky.app/profile/').replace('app.bsky.feed.generator', 'feed')"
        target="_blank"
      >
        <div class="generator__left">
          <img
            class="generator__avatar"
            loading="lazy"
            :src="generator.avatar"
            alt=""
          >
        </div>
        <div class="generator__right">
          <div class="generator__display-name">{{ generator.displayName }}</div>
          <div class="generator__right__middle">
            <div class="generator__like-count">
              <SVGIcon name="heart" />
              <span>{{ generator.likeCount }}</span>
            </div>
            <div class="generator__indexed-at">
              <SVGIcon name="history" />
              <span>{{ mainState.formatDate(generator.indexedAt) }}</span>
            </div>
          </div>
          <div class="generator__description">{{ generator.description }}</div>
          <RouterLink
            class="generator__creator"
            :to="{ name: 'profile-post', query: { handle: generator.creator.handle } }"
          >
            <SVGIcon name="person" />
            <div class="generator__creator__display-name">{{ generator.creator.displayName }}</div>
            <div class="generator__creator__handle">{{ generator.creator.handle }}</div>
          </RouterLink>
        </div>
      </a>
      <Loader v-if="mainState.listProcessing" />
    </div>
    <RouterView class="child-view" />
  </div>
</template>

<style lang="scss" scoped>
.custom-feeds-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__header {
    position: sticky;
    top: 0;
    z-index: 1;
  }
}

.generator-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 0.5rem;
  padding: 0.5rem;
  position: relative;
}

.generator {
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);
  display: flex;
  grid-gap: 1rem;
  padding: 1rem;
  &:focus, &:hover {
    border-color: rgb(var(--fg-color), 0.5);
  }

  &__avatar {
    border: 1px solid rgba(var(--fg-color), 0.25);
    border-radius: var(--border-radius);
    display: block;
    min-width: 3rem;
    max-width: 3rem;
    min-height: 3rem;
    max-height: 3rem;
  }

  &__right {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    grid-gap: 0.25rem;

    &__middle {
      display: flex;
      grid-gap: 0.5rem;
    }
  }

  &__display-name {
    font-weight: bold;
    line-height: 1.25;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__like-count,
  &__indexed-at {
    display: flex;
    align-items: center;
    grid-gap: 0.25rem;

    & > .svg-icon {
      font-size: 0.75rem;
    }

    & > span {
      font-size: 0.875rem;
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
    font-size: 0.875rem;
    line-height: 1.25;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__creator {
    border: 1px solid rgb(var(--accent-color), 0.5);
    border-radius: var(--border-radius);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    grid-gap: 0.5rem;
    margin: 0.25rem 0 0 auto;
    padding: 0.5rem 1rem;
    &:focus, &:hover {
      border-color: rgb(var(--accent-color), 0.75);
    }

    & > .svg-icon {
      fill: rgba(var(--accent-color), 0.75);
      font-size: 0.75rem;
    }

    &__display-name {
      font-size: 0.875rem;
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
    }

    &__handle {
      color: rgba(var(--fg-color), 0.75);
      font-size: 0.875rem;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
    }
  }
}

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
