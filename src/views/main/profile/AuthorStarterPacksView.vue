<script lang="ts" setup>
import { computed, inject, reactive, watch, type ComputedRef } from "vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
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

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchStarterPacks("old")
})
</script>

<template>
  <div class="author-starter-packs">
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
        <div
          v-for="starterPack of mainState.currentAuthorStarterPacks"
          :key="starterPack.cid"
        >
          <div>{{ starterPack.record?.name }}</div>
          <HtmlText
            v-if="starterPack.record?.description"
            dir="auto"
            :text="starterPack.record.description"
            :facets="starterPack.record?.descriptionFacets"
            :processHashTag="true"
            @onActivateMention="$emit('onActivateMention')"
            @onActivateHashTag="$emit('onActivateHashTag')"
          />
          <div>{{ starterPack.record?.$type }}</div>
          <div>{{ starterPack.record?.list }}</div>
          <div>{{ starterPack.record?.feeds?.length }}</div>
        </div>
      </template>
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchStarterPacks('old')"
    />
</div>
</template>

<style lang="scss" scoped>
.author-starter-packs {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.starter-pack-card__container {
  flex-grow: 1;
}
</style>
