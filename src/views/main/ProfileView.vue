<script lang="ts" setup>
import { inject } from "vue"
import format from "date-fns/format"
import FeedList from "@/components/FeedList.vue"
import type { MainState } from "@/@types/app.d"

const mainState: MainState = inject("state") as MainState

const getIndexedAt = (indexedAt?: null | string): string => {
  return indexedAt == null ? "" : format(new Date(indexedAt), "yyyy/MM/dd")
}
</script>

<template>
  <div class="profile-view">
    <a
      class="banner"
      :href="mainState.currentProfile?.banner"
      rel="noreferrer"
      target="_blank"
    >
      <img
        loading="lazy"
        :src="mainState.currentProfile?.banner ?? '/img/void.png'"
      >
    </a>
    <div class="profile">
      <a
        class="avatar"
        :href="mainState.currentProfile?.avatar"
        rel="noreferrer"
        target="_blank"
      >
        <img
          loading="lazy"
          :src="mainState.currentProfile?.avatar ?? '/img/void.png'"
        >
      </a>
      <div class="right">
        <div class="display-name">{{ mainState.currentProfile?.displayName }}</div>
        <div class="handle">{{ mainState.currentProfile?.handle }}</div>
        <div class="description">{{ mainState.currentProfile?.description }}</div>
        <dl class="indexed-at">
          <dt>利用開始日</dt>
          <dd>{{ getIndexedAt(mainState.currentProfile?.indexedAt) }}</dd>
        </dl>
        <div class="statistics">
          <dl class="follows-count">
            <dt>フォロー数</dt>
            <dd>{{ mainState.currentProfile?.followsCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="followers-count">
            <dt>フォロワー数</dt>
            <dd>{{ mainState.currentProfile?.followersCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="posts-count">
            <dt>ポスト数</dt>
            <dd>{{ mainState.currentProfile?.postsCount?.toLocaleString() }}</dd>
          </dl>
        </div>
      </div>
    </div>
    <FeedList
      type="post"
      :feeds="mainState.pageFeeds"
      :hasFetchButton="false"
    />
  </div>
</template>

<style lang="scss" scoped>
.profile-view {
  flex-grow: 1;
}

.banner > img {
  aspect-ratio: 3/1;
  object-fit: cover;
  width: 100%;
}

.profile {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  grid-gap: 1rem;
  padding: 1rem;
}

.avatar {
  display: block;
  min-width: 6rem;
  height: 6rem;

  & > img {
    border: 1px solid rgba(var(--fg-color), 0.25);
    border-radius: 1px;
    display: block;
    min-width: 6rem;
    height: 6rem;
  }
}

.right {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;

  dl {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;

    & > dt {
      font-size: 0.75rem;
    }

    & > dd {
      font-weight: bold;
    }
  }
}

.display-name {
  font-size: 2rem;
  word-break: break-all;
}

.handle {
  color: rgba(var(--fg-color), 0.75);
  font-size: 0.875rem;
  word-break: break-all;
}

.description {
  line-height: 1.5;
  word-break: break-all;
}

.indexed-at {
  word-break: break-all;
}

.statistics {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 1rem;
}

.follows-count {}

.followers-count {}

.posts-count {}
</style>
