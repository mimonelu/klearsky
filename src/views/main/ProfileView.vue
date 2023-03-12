<script lang="ts" setup>
import { inject } from "vue"
import format from "date-fns/format"
import FeedList from "@/components/FeedList.vue"
import SVGIcon from "@/components/SVGIcon.vue"

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
      <div class="left">
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
        <RouterLink
          v-if="mainState.isUserProfile"
          to="edit-profile"
          class="button"
        >
          <SVGIcon name="edit" />
          <span>{{ $t("edit") }}</span>
        </RouterLink>
      </div>
      <div class="right">
        <div class="display-name">{{ mainState.currentProfile?.displayName }}</div>
        <div class="handle">{{ mainState.currentProfile?.handle }}</div>
        <div
          class="description"
          v-html="mainState.currentProfile?.descriptionHtml ?? ''"
        />
        <dl class="indexed-at">
          <dt>{{ $t("startedAt") }}</dt>
          <dd>{{ getIndexedAt(mainState.currentProfile?.indexedAt) }}</dd>
        </dl>
        <div class="statistics">
          <dl class="follows-count">
            <dt>{{ $t("following") }}</dt>
            <dd>{{ mainState.currentProfile?.followsCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="followers-count">
            <dt>{{ $t("followers") }}</dt>
            <dd>{{ mainState.currentProfile?.followersCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="posts-count">
            <dt>{{ $t("posts") }}</dt>
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

.banner {
  display: block;

  & > img {
    aspect-ratio: 3/1;
    object-fit: cover;
    width: 100%;
  }
}

.profile {
  border-top: 1px solid rgba(var(--fg-color), 0.25);
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  grid-gap: 1rem;
  padding: 1rem;
}

.left {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;

  & > .button {
    font-size: 0.875rem;
    padding: 0.5rem;
  }
}

.avatar {
  @include avatar-link(6rem);
}

.right {
  display: flex;
  flex-direction: column;

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
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.handle {
  color: rgba(var(--fg-color), 0.75);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  word-break: break-all;
}

.description {
  line-height: 1.5;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.indexed-at {
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.statistics {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem 1rem;
}

.follows-count {}

.followers-count {}

.posts-count {}
</style>
