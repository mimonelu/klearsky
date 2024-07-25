<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import FeedCard from "@/components/cards/FeedCard.vue"
import StarterPackCard from "@/components/cards/StarterPackCard.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  starterPack: Ref<undefined | TIStarterPack>
}>({
  starterPack: computedAsync(async () => {
    const uri = mainState.currentQuery.uri
    if (uri == null) {
      return
    }

    // 指定されたスターターパックを現在のプロフィールユーザーのスターターパックリストから検索
    let starterPack: undefined | Error | TIStarterPack =
      // WANT: 後日再検証
      // getStarterPack と getActorStarterPacks のレスポンスの乖離が激しいため
      // 一時的かつ強制的に getStarterPack を走らせている
      undefined
      /*
      mainState.currentAuthorStarterPacks.find((starterPack: TIStarterPack) => {
        return starterPack.uri === uri
      })
      */

    // 上記になければ取得（ページ更新時は取得確定）
    if (starterPack == null) {
      starterPack = await mainState.atp.fetchStarterPack(uri)
      if (starterPack instanceof Error) {
        mainState.openErrorPopup("errorApiFailed", "StarterPackView/fetchStarterPack")
        return
      }
    }

    return starterPack
  }),
})
</script>

<template>
  <div class="starter-pack-view">
    <StarterPackCard
      :starterPack="state.starterPack"
      :menuDisplay="true"
      :detailDisplay="true"
      :creatorDisplay="true"
      :unclickable="false"
    />
    <FeedCard
      v-for="generator of state.starterPack?.feeds"
      :generator="generator"
      :menuDisplay="true"
      :detailDisplay="false"
      :orderButtonDisplay="false"
      :creatorDisplay="true"
      :unclickable="false"
    />
  </div>
</template>

<style lang="scss" scoped>
.starter-pack-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
