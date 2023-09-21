<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import CopyRight from "@/components/shell-parts/Copyright.vue"
import Logo from "@/components/shell-parts/Logo.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  text: string,
  pinned: ComputedRef<Array<TTFeedGenerator>>,
}>({
  text: "",
  pinned: computed((): Array<TTFeedGenerator> => {
    return mainState.currentMyFeedGenerators.filter((generator: TTFeedGenerator) => {
      return mainState.feedPreferences?.pinned?.includes(generator.uri)
    })
  }),
})

const router = useRouter()

function searchPost () {
  router.push({ name: "post-search", query: { text: state.text } })
}
</script>

<template>
  <div class="sub-menu">
    <!-- ロゴ -->
    <Logo />

    <!-- ポスト検索ボックス -->
    <form @submit.prevent="searchPost">
      <input
        v-model="state.text"
        type="search"
        :placeholder="$t('searchWord')"
        autocapitalize="off"
        autocomplete="off"
        inputmode="search"
        spellcheck="false"
        class="textbox"
      >
    </form>

    <!-- マイフィード -->
    <div class="my-feed">
      <div class="my-feed__header">
        <a
          class="textlink--icon"
          @click="mainState.openMyFeedsPopup"
        >
          <SVGIcon name="feed" />
          <span>{{ $t("myFeeds") }}</span>
        </a>
      </div>
      <div class="my-feed__inner">
        <RouterLink
          v-for="generator of state.pinned"
          :key="generator.cid"
          :to="{
            path: '/home/feeds',
            query: {
              feed: generator.uri,
              displayName: generator.displayName,
            },
          }"
          class="my-feed__button"
        >
          <img
            loading="lazy"
            decoding="async"
            :src="generator.avatar ?? '/img/void-avatar.png'"
            alt=""
          >
          <span>{{ generator.displayName }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- コピーライト -->
    <CopyRight />
  </div>
</template>

<style lang="scss" scoped>
.sub-menu {
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem 1rem;
  position: relative;
  height: 100vh;
}

// ロゴ
.logo {
  font-size: 2rem;
  margin-bottom: 2rem;
}

// ポスト検索ボックス
.textbox {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  width: 100%;
}

// マイフィード
.my-feed {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-bottom: 2rem;
  overflow: hidden;

  &__header .textlink--icon {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  &__inner {
    @include scroll-bar;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    grid-gap: 0.5rem;
    overflow-y: auto;
    overscroll-behavior: none;
  }

  &__button {
    border-radius: 1px;
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;

    & > img {
      border-radius: 1px;
      display: block;
      overflow: hidden;
      min-width: 1.5em;
      max-width: 1.5em;
      min-height: 1.5em;
      max-height: 1.5em;
    }

    & > span {
      color: var(--fg-color-05);
      line-height: var(--line-height);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &:hover, &:focus {
      & > span {
        color: rgb(var(--fg-color));
      }
    }
  }
}

// コピーライト
.copyright {
  font-size: 0.875rem;
}
</style>
