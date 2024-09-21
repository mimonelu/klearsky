<script lang="ts" setup>
import { inject, reactive } from "vue"
import { useRouter } from "vue-router"
import CopyRight from "@/components/labels/Copyright.vue"
import Logo from "@/components/images/Logo.vue"
import MyFeedList from "@/components/lists/MyFeedList.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const $t = inject("$t") as Function

const state = reactive<{
  text: string,
}>({
  text: "",
})

const mainState = inject("state") as MainState

const router = useRouter()

function searchPost () {
  const query = state.text !== ""
    ? { text: state.text }
    : undefined
  router.push({ name: "post-search", query })
}

function openKeywordHistoryPopover ($event: Event) {
  mainState.openKeywordHistoryPopover(
    $event.target,
    mainState.currentSetting.postSearchKeywordHistory,
    (keyword: string) => {
      state.text = keyword
      searchPost()
    }
  )
}
</script>

<template>
  <div class="sub-menu">
    <!-- ロゴ -->
    <Logo />

    <!-- ポスト検索フォーム -->
    <div class="search-post-form">
      <!-- キーワードボックス -->
      <form @submit.prevent="searchPost">
        <input
          v-model="state.text"
          type="search"
          name="searchPost"
          :placeholder="$t('postSearch')"
          autocapitalize="off"
          autocomplete="off"
          inputmode="search"
          spellcheck="false"
          class="textbox"
        >
      </form>

      <!-- キーワード履歴ポップオーバートリガー -->
      <button
        class="button--bordered"
        type="button"
        @click.prevent="openKeywordHistoryPopover"
      >
        <SVGIcon name="history" />
      </button>
    </div>

    <!-- マイフィードリスト -->
    <MyFeedList />

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
}

// ロゴ
.logo {
  font-size: 2rem;
  margin-bottom: 2rem;

  &:deep() {
    .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
}

// ポスト検索フォーム
.search-post-form {
  display: flex;
  grid-gap: 0.5rem;
  margin-bottom: 1rem;

  // キーワードボックス
  & > form {
    flex-grow: 1;

    .textbox {
      font-size: 0.875rem;
      width: 100%;
    }
  }

  // キーワード履歴ポップオーバートリガー
  .button--bordered > .svg-icon {
    font-size: 1.125rem;
  }
}

// マイフィードリスト
.my-feed-list {
  flex-grow: 1;
  margin-bottom: 1rem;
  overflow: hidden;
}

// コピーライト
.copyright {
  font-size: 0.75rem;
}
</style>
