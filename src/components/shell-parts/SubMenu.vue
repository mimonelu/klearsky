<script lang="ts" setup>
import { inject, reactive } from "vue"
import { useRouter } from "vue-router"
import CopyRight from "@/components/shell-parts/Copyright.vue"
import Logo from "@/components/shell-parts/Logo.vue"
import MyFeedList from "@/components/list/MyFeedList.vue"

const $t = inject("$t") as Function

const state = reactive<{
  text: string,
}>({
  text: "",
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

// マイフィードリスト
.my-feed {
  flex-grow: 1;
  margin-bottom: 2rem;
}

// コピーライト
.copyright {
  font-size: 0.875rem;
}
</style>
