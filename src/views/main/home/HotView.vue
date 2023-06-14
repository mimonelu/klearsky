<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import FeedList from "@/components/FeedList.vue"
import SelectLanguagesPopup from "@/components/SelectLanguagesPopup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  filteredFeeds: ComputedRef<Array<TTFeed>>
  selectLanguagesPopupDisplay: boolean
}>({
  filteredFeeds: computed((): Array<TTFeed> => {
    if (!mainState.currentSetting?.contentLanguages?.length) return mainState.currentHotFeeds
    return mainState.currentHotFeeds.filter((feed: TTFeed) => {
      if (feed.post.__custom.detectedLanguages == null) return false
      return feed.post.__custom.detectedLanguages.some((language: any) =>
        mainState.currentSetting?.contentLanguages?.includes(language.lang))
    }) ?? []
  }),
  selectLanguagesPopupDisplay: false,
})

function openSelectLanguagesPopup () {
  Util.blurElement()
  state.selectLanguagesPopupDisplay = true
}

function closeSelectLanguagesPopup () {
  state.selectLanguagesPopupDisplay = false
}

function saveSettings () {
  mainState.saveSettings()
}
</script>

<template>
  <div class="hot-view">
    <FeedList
      type="hot"
      :feeds="state.filteredFeeds"
      :hasLoadButton="true"
    />

    <!-- HOTヘッダー -->
    <Portal to="home-view-header-portal">
      <div class="hot-header">
        <!-- 情報 -->
        <div class="info">
          <SVGIcon name="post" />
          <span>{{ state.filteredFeeds.length.toLocaleString() }} / {{ mainState.currentHotFeeds.length.toLocaleString() }}</span>
        </div>

        <!-- 言語選択 -->
        <button
          class="button--bordered"
          @click.stop="openSelectLanguagesPopup"
        >
          <SVGIcon name="translate" />
        </button>
      </div>
    </Portal>

    <!-- 言語選択ポップアップ -->
    <SelectLanguagesPopup
      v-if="state.selectLanguagesPopupDisplay"
      :state="mainState.currentSetting"
      property="contentLanguages"
      @close="closeSelectLanguagesPopup"
      @change="saveSettings"
    >
      <template #header>
        <p>{{ $t("selectLanguagesDetail") }}</p>
      </template>
    </SelectLanguagesPopup>
  </div>
</template>

<style lang="scss" scoped>
.hot-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed-list {
  flex-grow: 1;

  &:deep() {
    // HOTアイコン
    .feeds > .feed > .post[data-position="post"] > .body {
      & > .avatar-link[data-has-label="false"] {
        &::before {
          content: "";
          display: block;
          background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="4.987743377685547 3 14.0025634765625 17.999486923217773"><path fill="white" d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z" /></svg>') no-repeat center center;
          background-color: rgb(var(--hot-color));
          background-size: 50%;
          border-radius: 2.5rem;
          overflow: hidden;
          position: absolute;
          top: -0.375rem;
          left: -0.375rem;
          width: 1.25rem;
          height: 1.25rem;
        }

        & > img {
          border: 2px solid rgb(var(--hot-color));
        }
      }
    }
  }
}

// HOTヘッダー
.hot-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  grid-gap: 1rem;

  // 情報
  & > .info {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    grid-gap: 0.5rem;

    & > .svg-icon {
      fill: rgba(var(--fg-color), 0.5);
      font-size: 0.875rem;
    }

    & > span {
      color: rgba(var(--fg-color), 0.75);
      font-family: monospace;
      line-height: 1.25;
      white-space: nowrap;
    }
  }

  // 言語選択
  & > button {
    margin: -1rem 0 -1rem auto;
  }
}
</style>
