<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import StarterPackCard from "@/components/cards/StarterPackCard.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  numberOfStarterPacks: ComputedRef<number>
}>({
  numberOfStarterPacks: computed((): number => {
    return mainState.currentProfile?.associated?.starterPacks ?? 0
  }),
})

async function fetchStarterPacks (direction: "new" | "old") {
  Util.blurElement()
  mainState.listLoaderDisplay = true
  await mainState.fetchAuthorStarterPacks(direction)
  mainState.listLoaderDisplay = false
}

function openStarterPackEditPopup () {
  Util.blurElement()
  mainState.openStarterPackEditPopup({
    display: true,
    mode: "create",
  })
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !mainState.listLoaderDisplay
  ) {
    fetchStarterPacks("old")
  }
}
</script>

<template>
  <div class="author-starter-packs">
    <header v-if="mainState.isMyProfile()">
      <!-- スターターパック作成ボタン -->
      <button
        class="button"
        @click.prevent="openStarterPackEditPopup"
      >
        <SVGIcon name="plus" />
        <span>{{ $t("starterPackCreate") }}</span>
      </button>
    </header>

    <LoadButton
      direction="new"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchStarterPacks('new')"
    />
    <div class="starter-pack-card__container">
      <!-- 空のコンテンツメッセージ -->
      <div
        v-if="state.numberOfStarterPacks === 0"
        class="textlabel margin1"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noStarterPacks") }}
        </div>
      </div>

      <template v-else>
        <StarterPackCard
          v-for="starterPack of mainState.currentAuthorStarterPacks"
          :key="starterPack.uri"
          :starterPack="starterPack"
          :menuDisplay="true"
          :detailDisplay="true"
          :creatorDisplay="false"
          :unclickable="false"
        />
      </template>
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchStarterPacks('old')"
    />

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.author-starter-packs {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  & > header {
    display: flex;
    justify-content: flex-end;
    padding: 0.25rem;

    // スターターパック作成ボタン
    & > button {
      font-size: 0.875rem;
    }
  }
}

.starter-pack-card__container {
  flex-grow: 1;
}
</style>
