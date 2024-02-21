<script lang="ts" setup>
import { inject, reactive } from "vue"
import DesignSettingsPopup from "@/components/popups/settings-popups/DesignSettingsPopup.vue"
import HtmlPopup from "@/components/popups/HtmlPopup.vue"
import LanguageSettingsPopup from "@/components/popups/settings-popups/LanguageSettingsPopup.vue"
import OtherSettingsPopup from "@/components/popups/settings-popups/OtherSettingsPopup.vue"
import Popup from "@/components/popups/Popup.vue"
import PostSettingsPopup from "@/components/popups/settings-popups/PostSettingsPopup.vue"
import PsySafetySettingsPopup from "@/components/popups/settings-popups/PsySafetySettingsPopup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits(["closeSettingsPopup"])

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  languageSettingsPopupDisplay: boolean
  designSettingsPopupDisplay: boolean
  postSettingsPopupDisplay: boolean
  psySafetySettingsPopupDisplay: boolean
  otherSettingsPopupDisplay: boolean
  htmlPopupDisplay: boolean
  htmlPopupType?: string
}>({
  languageSettingsPopupDisplay: false,
  designSettingsPopupDisplay: false,
  postSettingsPopupDisplay: false,
  psySafetySettingsPopupDisplay: false,
  otherSettingsPopupDisplay: false,
  htmlPopupDisplay: false,
  htmlPopupType: undefined,
})

function closeSettingsPopup () {
  emit("closeSettingsPopup")
}

function saveSetting () {
  mainState.saveSettings()
}

function changeSetting () {
  mainState.saveSettings()
  mainState.updateSettings()
}

async function resetSettings () {
  Util.blurElement()
  const result = await mainState.openConfirmationPopup($t("resetSettings"), $t("resetSettingsDetail"))
  if (!result) return
  mainState.resetSettings()
  location.reload()
}

function openLanguageSettingsPopup () {
  state.languageSettingsPopupDisplay = true
}

function closeLanguageSettingsPopup () {
  state.languageSettingsPopupDisplay = false
}

function openDesignSettingsPopup () {
  state.designSettingsPopupDisplay = true
}

function closeDesignSettingsPopup () {
  state.designSettingsPopupDisplay = false
}

function openPostSettingsPopup () {
  state.postSettingsPopupDisplay = true
}

function closePostSettingsPopup () {
  state.postSettingsPopupDisplay = false
}

function openPsySafetySettingsPopup () {
  state.psySafetySettingsPopupDisplay = true
}

function closePsySafetySettingsPopup () {
  state.psySafetySettingsPopupDisplay = false
}

function openOtherSettingsPopup () {
  state.otherSettingsPopupDisplay = true
}

function closeOtherSettingsPopup () {
  state.otherSettingsPopupDisplay = false
}

function openContentLanguagesPopup () {
  Util.blurElement()
  mainState.openContentLanguagesPopup()
}

function openPostLanguagesPopup () {
  Util.blurElement()
  mainState.openPostLanguagesPopup()
}

function openMyFeedsPopup () {
  Util.blurElement()
  mainState.openMyFeedsPopup()
}

function openMyListPopup () {
  Util.blurElement()
  mainState.openMyListPopup()
}

function openMyTagPopup () {
  Util.blurElement()
  mainState.openMyTagPopup({ mode: "edit" })
}

function openContentFilteringPopup () {
  Util.blurElement()
  mainState.openContentFilteringPopup()
}

function openMutingUsersPopup () {
  Util.blurElement()
  mainState.openMutingUsersPopup()
}

function openBlockingUsersPopup () {
  Util.blurElement()
  mainState.openBlockingUsersPopup()
}

function openWordMutePopup () {
  Util.blurElement()
  mainState.openWordMutePopup()
}

function openInviteCodesPopup () {
  Util.blurElement()
  mainState.openInviteCodesPopup()
}

function showDescription (type: string) {
  state.htmlPopupType = type
  state.htmlPopupDisplay = true
}

function closeHtmlPopupDisplay () {
  state.htmlPopupDisplay = false
}
</script>

<template>
  <Popup
    class="parent-settings-popup"
    :hasCloseButton="true"
    @close="closeSettingsPopup"
  >
    <template #header>
      <h2>
        <SVGIcon name="setting" />
        <span>{{ $t("settings") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="parent-settings-popup__menu-button-container">
        <!-- 言語設定ポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button"
          @click="openLanguageSettingsPopup"
        >
          <SVGIcon name="translate" />
          <span>{{ $t("language") }}</span>
        </button>

        <!-- マイフィードポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button--accent"
          @click="openMyFeedsPopup"
        >
          <SVGIcon name="feed" />
          <span>{{ $t("myFeeds") }}</span>
        </button>

        <!-- マイリストポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button--accent"
          @click="openMyListPopup"
        >
          <SVGIcon name="list" />
          <span>{{ $t("myList") }}</span>
        </button>

        <!-- マイタグポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button--accent"
          @click="openMyTagPopup"
        >
          <SVGIcon name="tag" />
          <span>{{ $t("myTag") }}</span>
        </button>

        <!-- コンテンツフィルタリングポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button--notice"
          @click="openContentFilteringPopup"
        >
          <SVGIcon name="contentFiltering" />
          <span>{{ $t("contentFiltering") }}</span>
        </button>

        <!-- ミュートポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button--notice"
          @click="openMutingUsersPopup"
        >
          <SVGIcon name="volumeOff" />
          <span>{{ $t("mutingUsers") }}</span>
        </button>

        <!-- ブロックポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button--notice"
          @click="openBlockingUsersPopup"
        >
          <SVGIcon name="personOff" />
          <span>{{ $t("blockingUsers") }}</span>
        </button>

        <!-- ワードミュートポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button--notice"
          @click="openWordMutePopup"
        >
          <SVGIcon name="wordMute" />
          <span>{{ $t("wordMute") }}</span>
        </button>

        <!-- デザイン設定ポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button"
          @click="openDesignSettingsPopup"
        >
          <SVGIcon name="palette" />
          <span>{{ $t("design") }}</span>
        </button>

        <!-- ポスト設定ポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button"
          @click="openPostSettingsPopup"
        >
          <SVGIcon name="post" />
          <span>{{ $t("post") }}</span>
        </button>

        <!-- 心理的安全性設定ポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button"
          @click="openPsySafetySettingsPopup"
        >
          <SVGIcon name="like" />
          <span>{{ $t("psySafety") }}</span>
        </button>

        <!-- その他設定ポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button"
          @click="openOtherSettingsPopup"
        >
          <SVGIcon name="shimmer" />
          <span>{{ $t("etc") }}</span>
        </button>

        <!-- 招待コードポップアップトリガー -->
        <button
          class="parent-settings-popup__menu-button"
          @click="openInviteCodesPopup"
        >
          <SVGIcon name="inviteCode" />
          <span>{{ $t("inviteCodes") }}</span>
        </button>
      </div>
    </template>
  </Popup>

  <!-- 言語設定ポップアップ -->
  <LanguageSettingsPopup
    v-if="state.languageSettingsPopupDisplay"
    @close="closeLanguageSettingsPopup"
    @changeSetting="changeSetting"
    @openContentLanguagesPopup="openContentLanguagesPopup"
    @openPostLanguagesPopup="openPostLanguagesPopup"
  />

  <!-- デザイン設定ポップアップ -->
  <DesignSettingsPopup
    v-if="state.designSettingsPopupDisplay"
    @close="closeDesignSettingsPopup"
    @saveSetting="saveSetting"
    @changeSetting="changeSetting"
  />

  <!-- ポスト設定ポップアップ -->
  <PostSettingsPopup
    v-if="state.postSettingsPopupDisplay"
    @close="closePostSettingsPopup"
    @saveSetting="saveSetting"
    @changeSetting="changeSetting"
    @showDescription="(name: string) => { showDescription(name) }"
  />

  <!-- 心理的安全性設定ポップアップ -->
  <PsySafetySettingsPopup
    v-if="state.psySafetySettingsPopupDisplay"
    @close="closePsySafetySettingsPopup"
    @saveSetting="saveSetting"
    @changeSetting="changeSetting"
  />

  <!-- その他設定ポップアップ -->
  <OtherSettingsPopup
    v-if="state.otherSettingsPopupDisplay"
    @close="closeOtherSettingsPopup"
    @saveSetting="saveSetting"
    @changeSetting="changeSetting"
    @resetSettings="resetSettings"
    @showDescription="(name: string) => { showDescription(name) }"
  />

  <!-- 説明用HTMLポップアップ -->
  <HtmlPopup
    v-if="state.htmlPopupDisplay"
    :title="`${$t('help')} - ${$t(state.htmlPopupType)}`"
    @close="closeHtmlPopupDisplay"
  >
    <template v-if="state.htmlPopupType === 'autoTranslation'">
      <ul class="bullet-points">
        <li>{{ $t("autoTranslationRemarks1") }}</li>
        <li>{{ $t("autoTranslationRemarks2") }}</li>
        <li>{{ $t("autoTranslationRemarks3") }}</li>
        <li><a class="textlink" href="https://mymemory.translated.net/" rel="noreferrer" target="_blank">{{ $t("autoTranslationRemarks4") }}</a></li>
      </ul>
    </template>
    <template v-else-if="state.htmlPopupType === 'autoTranslationIgnoreLanguage'">
      <ul class="bullet-points">
        <li><a class="textlink" href="https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes" rel="noreferrer" target="_blank">List of ISO 639-1 codes</a></li>
      </ul>
    </template>
    <template v-else-if="state.htmlPopupType === 'timelineControl'">
      <ul class="bullet-points">
        <li>{{ $t("timelineControlDescription") }}</li>
      </ul>
    </template>
    <template v-else-if="state.htmlPopupType === 'lightning'">
      <ul class="bullet-points">
        <li>{{ $t("lightningDescription") }}</li>
      </ul>
    </template>
  </HtmlPopup>
</template>

<style lang="scss" scoped>
.parent-settings-popup {
  &:deep(.popup-body) {
    padding: 1rem;
  }

  // 設定メニューボタンコンテナ
  &__menu-button-container {
    display: grid;
  }

  // 設定メニューボタンコンテナ - タブレット幅以上
  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    &__menu-button-container {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  // 設定メニューボタンコンテナ - タブレット幅未満
  @media not all and (min-width: 1024px) {
    &__menu-button-container {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  // 設定メニューボタンコンテナ - SP幅未満
  @media not all and (min-width: $sp-width) {
    &__menu-button-container {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  // 設定メニューボタン
  &__menu-button,
  &__menu-button--accent,
  &__menu-button--notice {
    border-radius: var(--border-radius);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    grid-gap: 1rem;
    padding: 1rem 0.5rem;
    &:focus, &:hover {
      background-color: var(--accent-color-025);
    }

    & > .svg-icon {
      fill: rgb(var(--fg-color));
      font-size: 2rem;
    }

    & > span {
      color: rgb(var(--fg-color));
      font-size: 0.875rem;
      font-weight: bold;
      line-height: var(--line-height);
      text-align: center;
      white-space: pre-line;
      word-break: break-word;
    }
  }
  &__menu-button--accent {
    & > .svg-icon {
      fill: rgb(var(--accent-color));
    }
  }
  &__menu-button--notice {
    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
