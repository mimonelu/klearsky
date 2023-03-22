<script lang="ts" setup>
import { inject, reactive } from "vue"
import { RouterView, useRouter } from "vue-router"
import type { LocationQueryValue } from "vue-router"
import format from "date-fns/format"
import PostAndProfileMenuTicker from "@/components/PostAndProfileMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const state = reactive<{
  profileMenuDisplay: boolean;
}>({
  profileMenuDisplay: false,
})

const router = useRouter()

function isUserProfile (): boolean {
  const handle = mainState.currentQuery.handle as LocationQueryValue
  return handle === mainState.atp.session?.handle
}

function isFollowing (): boolean {
  return mainState.currentProfile?.viewer?.following != null
}

function isFollowed (): boolean {
  return mainState.currentProfile?.viewer?.followedBy != null
}

async function toggleFollow () {
  if (mainState.currentProfile == null) return
  blurElement()
  mainState.processing = true
  try {
    if (isFollowing()) {
      await mainState.atp.deleteFollow(
        mainState.currentProfile.viewer.following as string
      )
    } else {
      await mainState.atp.createFollow(
        mainState.currentProfile.did,
        mainState.currentProfile.declaration.cid as string
      )
    }
    const handle = mainState.currentQuery.handle as LocationQueryValue
    if (handle != null) await mainState.fetchCurrentProfile(handle)
  } finally {
    mainState.processing = false
  }
}

function getIndexedAt (indexedAt?: null | string): string {
  return indexedAt == null ? "" : format(new Date(indexedAt), "yyyy/MM/dd")
}

function openPostMenu () {
  blurElement()
  state.profileMenuDisplay = !state.profileMenuDisplay
}

function closePostMenu () {
  state.profileMenuDisplay = false
}

function openChildPage (pageName: string) {
  blurElement()
  router.push({
    name: pageName,
    query: { handle: mainState.currentProfile?.handle },
  })
}
</script>

<template>
  <div class="profile-view">
    <a
      class="banner"
      :href="mainState.currentProfile?.banner"
      rel="noreferrer"
      target="_blank"
      :data-has-banner="!!mainState.currentProfile?.banner"
    >
      <img
        loading="lazy"
        :src="mainState.currentProfile?.banner ?? '/img/void.png'"
      >
    </a>
    <div class="details">
      <div class="top">
        <div class="left">
          <a
            class="avatar"
            :href="mainState.currentProfile?.avatar"
            rel="noreferrer"
            target="_blank"
          >
            <img
              loading="lazy"
              :src="mainState.currentProfile?.avatar ?? '/img/void-avatar.png'"
            >
          </a>
        </div>
        <div class="right">
          <div class="display-name">{{ mainState.currentProfile?.displayName ?? "&nbsp;" }}</div>
          <div class="handle">{{ mainState.currentProfile?.handle ?? "&nbsp;" }}</div>
          <div class="right-bottom">
            <RouterLink
              v-if="isUserProfile()"
              to="/profile/edit"
              class="button"
            >
              <SVGIcon name="edit" />
              <span>{{ $t("edit") }}</span>
            </RouterLink>
            <template v-else>
              <button
                class="button"
                :data-is-following="isFollowing()"
                @click.prevent="toggleFollow"
              >
                <span v-if="isFollowing()">{{ $t("following") }}</span>
                <span v-else>{{ $t("follow") }}</span>
              </button>
              <div
                v-if="isFollowed()"
                class="followed"
              >{{ $t("followed") }}</div>
            </template>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div
          class="description"
          v-html="mainState.currentProfile?.__descriptionHtml ?? '&nbsp;'"
        />
        <div class="statistics">
          <dl class="posts-count">
            <dt>{{ $t("postsCount") }}</dt>
            <dd>{{ mainState.currentProfile?.postsCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="follows-count">
            <dt>{{ $t("followingCount") }}</dt>
            <dd>{{ mainState.currentProfile?.followsCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="followers-count">
            <dt>{{ $t("followersCount") }}</dt>
            <dd>{{ mainState.currentProfile?.followersCount?.toLocaleString() }}</dd>
          </dl>
          <dl class="indexed-at">
            <dt>{{ $t("startedAt") }}</dt>
            <dd>{{ getIndexedAt(mainState.currentProfile?.indexedAt) }}</dd>
          </dl>
          <button
            class="menu-button"
            @click.stop="openPostMenu"
          >
            <SVGIcon name="menu" />
            <PostAndProfileMenuTicker
              v-if="state.profileMenuDisplay"
              :translateText="mainState.currentProfile?.description"
              :copyText="mainState.currentProfile?.description"
              :openSource="mainState.currentProfile"
              @close="closePostMenu"
            />
          </button>
        </div>
      </div>
    </div>
    <div class="tab">
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'profile-post'"
        @click.prevent="openChildPage('profile-post')"
      >{{ $t("post") }}</button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'profile-following'"
        @click.prevent="openChildPage('profile-following')"
      >{{ $t("following") }}</button>
      <button
        class="tab-button"
        :data-selected="router.currentRoute.value.name === 'profile-follower'"
        @click.prevent="openChildPage('profile-follower')"
      >{{ $t("follower") }}</button>
    </div>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
}

.banner {
  display: block;
  &[data-has-banner="false"] {
    background-image:
      linear-gradient(45deg, rgba(var(--fg-color), 0.1) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(var(--fg-color), 0.1) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(var(--fg-color), 0.1) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(var(--fg-color), 0.1) 75%);
    background-position: 0 0, 0 1rem, 1rem -1rem, -1rem 0;
    background-size: 2rem 2rem;
  }

  & > img {
    aspect-ratio: 3/1;
    object-fit: cover;
    width: 100%;
  }
}

.details {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  padding: 1rem;
}

.top {
  display: flex;
  grid-gap: 1rem;
}

.avatar {
  @include avatar-link(6rem);
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.display-name {
  font-size: 2rem;
  line-height: 1.25;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.handle {
  color: rgba(var(--fg-color), 0.75);
  line-height: 1.25;
  margin-bottom: 0.75rem;
  word-break: break-all;
}

.right-bottom {
  display: flex;
  align-items: center;
  grid-gap: 0.5rem;
  margin-top: auto;

  .button {
    font-size: 0.875rem;
  }
}

.followed {
  color: rgb(var(--pink));
  font-size: 0.875rem;
  line-height: 1.25;
  word-break: break-all;
}

.bottom {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
}

.description {
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.statistics {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem 1rem;
  padding-right: 2rem;
  position: relative;

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

.menu-button {
  cursor: pointer;
  margin: -1rem;
  padding: 1rem;
  position: absolute;
  bottom: 0rem;
  right: 0;

  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.5);
  }
  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }

  .menu-ticker:deep() {
    .menu-ticker--inner {
      top: 0;
      right: 3em;
    }
  }
}

.feed-list,
.user-list {
  flex-grow: 1;
}
</style>
