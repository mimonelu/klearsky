<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Checkboxes from "@/components/form-parts/Checkboxes.vue"
import ColorThemeList from "@/components/list/ColorThemeList.vue"
import HtmlPopup from "@/components/popups/HtmlPopup.vue"
import Popup from "@/components/popups/Popup.vue"
import Radios from "@/components/form-parts/Radios.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"
import LANGUAGES from "@/consts/languages"
import UI_LANGUAGES from "@/consts/ui-languages.json"
import SETTINGS from "@/consts/settings.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  page: "top" | "language" | "post" | "design" | "psySafety" | "etc"
  pageTitle?: string
  contentLanguages: ComputedRef<string[]>
  postLanguages: ComputedRef<string[]>
}>({
  page: "top",
  pageTitle: undefined,
  contentLanguages: computed((): string[] => {
    return mainState.currentSetting.contentLanguages?.map((contentLanguage: string) => {
      return LANGUAGES.find((language: TTOption) => {
        return contentLanguage === language.value
      })?.label ?? ""
    }) ?? []
  }),
  postLanguages: computed((): string[] => {
    return mainState.currentSetting.postLanguages?.map((postLanguage: string) => {
      return LANGUAGES.find((language: TTOption) => {
        return postLanguage === language.value
      })?.label ?? ""
    }) ?? []
  }),
})

async function close () {
  emit("close")
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

function moveToTopPage () {
  Util.blurElement()
  state.page = "top"
  state.pageTitle = undefined
}

function moveToLanguagePage () {
  Util.blurElement()
  state.page = "language"
  state.pageTitle = "language"
}

function moveToPostPage () {
  Util.blurElement()
  state.page = "post"
  state.pageTitle = "post"
}

function moveToDesignPage () {
  Util.blurElement()
  state.page = "design"
  state.pageTitle = "design"
}

function moveToPsySafetyPage () {
  Util.blurElement()
  state.page = "psySafety"
  state.pageTitle = "psySafety"
}

function moveToEtcPage () {
  Util.blurElement()
  state.page = "etc"
  state.pageTitle = "etc"
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
  mainState.openMyTagPopup()
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
</script>

<template>
  <div>
    <Popup
      class="settings-popup"
      :hasCloseButton="true"
      @close="close"
    >
      <template #header>
        <!-- トップ設定ページ遷移ボタン -->
        <button
          v-if="state.page !== 'top'"
          class="settings-popup__back-button"
          @click.prevent.stop="moveToTopPage"
        >
          <SVGIcon name="cursorLeft" />
        </button>

        <h2>
          <SVGIcon name="setting" />
          <span>{{ $t("settings") }}</span>
          <template v-if="state.pageTitle != null">
            <span>-</span>
            <span>{{ $t(state.pageTitle) }}</span>
          </template>
        </h2>
      </template>
      <template #body>
        <!-- 設定ページ - トップ設定ページ -->
        <div
          v-if="state.page === 'top'"
          class="settings-popup__button-page"
        >
          <div class="settings-popup__menu-button-container">
            <!-- 設定メニューボタン - 言語設定ページ遷移ボタン -->
            <button
              class="settings-popup__menu-button"
              @click="moveToLanguagePage"
            >
              <SVGIcon name="translate" />
              <span>{{ $t("language") }}</span>
            </button>

            <!-- 設定メニューボタン - マイフィードポップアップトリガー -->
            <button
              class="settings-popup__menu-button--accent"
              @click="openMyFeedsPopup"
            >
              <SVGIcon name="feed" />
              <span>{{ $t("myFeeds") }}</span>
            </button>

            <!-- 設定メニューボタン - マイリストポップアップトリガー -->
            <button
              class="settings-popup__menu-button--accent"
              @click="openMyListPopup"
            >
              <SVGIcon name="list" />
              <span>{{ $t("myList") }}</span>
            </button>

            <!-- 設定メニューボタン - マイタグポップアップトリガー -->
            <button
              class="settings-popup__menu-button--accent"
              @click="openMyTagPopup"
            >
              <SVGIcon name="tag" />
              <span>{{ $t("myTag") }}</span>
            </button>

            <!-- 設定メニューボタン - コンテンツフィルタリングポップアップトリガー -->
            <button
              class="settings-popup__menu-button--notice"
              @click="openContentFilteringPopup"
            >
              <SVGIcon name="contentFiltering" />
              <span>{{ $t("contentFiltering") }}</span>
            </button>

            <!-- 設定メニューボタン - ミュートポップアップトリガー -->
            <button
              class="settings-popup__menu-button--notice"
              @click="openMutingUsersPopup"
            >
              <SVGIcon name="volumeOff" />
              <span>{{ $t("mutingUsers") }}</span>
            </button>

            <!-- 設定メニューボタン - ブロックポップアップトリガー -->
            <button
              class="settings-popup__menu-button--notice"
              @click="openBlockingUsersPopup"
            >
              <SVGIcon name="personOff" />
              <span>{{ $t("blockingUsers") }}</span>
            </button>

            <!-- 設定メニューボタン - ワードミュートポップアップトリガー -->
            <button
              class="settings-popup__menu-button--notice"
              @click="openWordMutePopup"
            >
              <SVGIcon name="wordMute" />
              <span>{{ $t("wordMute") }}</span>
            </button>

            <!-- 設定メニューボタン - ポスト設定ページ遷移ボタン -->
            <button
              class="settings-popup__menu-button"
              @click="moveToPostPage"
            >
              <SVGIcon name="post" />
              <span>{{ $t("post") }}</span>
            </button>

            <!-- 設定メニューボタン - デザイン設定ページ遷移ボタン -->
            <button
              class="settings-popup__menu-button"
              @click="moveToDesignPage"
            >
              <SVGIcon name="palette" />
              <span>{{ $t("design") }}</span>
            </button>

            <!-- 設定メニューボタン - 心理的安全性設定ページ遷移ボタン -->
            <button
              class="settings-popup__menu-button"
              @click="moveToPsySafetyPage"
            >
              <SVGIcon name="like" />
              <span>{{ $t("psySafety") }}</span>
            </button>

            <!-- 設定メニューボタン - その他設定ページ遷移ボタン -->
            <button
              class="settings-popup__menu-button"
              @click="moveToEtcPage"
            >
              <SVGIcon name="shimmer" />
              <span>{{ $t("etc") }}</span>
            </button>

            <!-- 設定メニューボタン - 招待コードポップアップトリガー -->
            <button
              class="settings-popup__menu-button"
              @click="openInviteCodesPopup"
            >
              <SVGIcon name="inviteCode" />
              <span>{{ $t("inviteCodes") }}</span>
            </button>
          </div>
        </div>

        <!-- 設定ページ - 言語設定ページ -->
        <div
          v-else-if="state.page === 'language'"
          class="settings-popup__form-page"
        >
          <!-- 設定ページ - 言語設定ページ - UI言語 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("uiLanguage") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <label class="selectbox">
                <select
                  v-model="mainState.currentSetting.uiLanguage"
                  name="uiLanguage"
                  @change="changeSetting"
                >
                  <option
                    v-for="language, languageIndex in UI_LANGUAGES"
                    :key="languageIndex"
                    :value="language.value"
                    :selected="language.value === mainState.currentSetting.uiLanguage"
                  >{{ $t(language.label) }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- 設定ページ - 言語設定ページ - コンテンツ言語ポップアップトリガー -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("contentLanguages") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <button
                class="button--bordered settings-popup__button-has-multi-labels"
                @click="openContentLanguagesPopup"
              >
                <span v-if="state.contentLanguages.length === 0">{{ $t("notSelected") }}</span>
                <span v-else>{{ state.contentLanguages.join(", ") }}</span>
              </button>
            </div>
          </div>

          <!-- 設定ページ - 言語設定ページ - ポスト言語ポップアップトリガー -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("postLanguages") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <button
                class="button--bordered settings-popup__button-has-multi-labels"
                @click="openPostLanguagesPopup"
              >
                <span v-if="state.postLanguages.length === 0">{{ $t("notSelected") }}</span>
                <span v-else>{{ state.postLanguages.join(", ") }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 設定ページ - ポスト設定ページ -->
        <div
          v-else-if="state.page === 'post'"
          class="settings-popup__form-page"
        >
          <!-- 設定ページ - ポスト設定ページ - 自動翻訳 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("autoTranslation") }}</span>
              <button
                class="description-button"
                @click.prevent
              >
                <SVGIcon name="help" />
              </button>
            </div>
            <div class="settings-popup__form__body">
              <Radios
                :state="mainState.currentSetting"
                model="autoTranslation"
                :options="SETTINGS.AUTO_TRANSLATIONS"
                layout="horizontal"
                @update="saveSetting"
              />

              <!-- 設定ページ - ポスト設定ページ - 自動翻訳 - 除外する言語 -->
              <div class="settings-popup__form__header">
                <span>{{ $t("autoTranslationIgnoreLanguage") }}</span>
                <button
                  class="description-button"
                  @click.prevent
                >
                  <SVGIcon name="help" />
                </button>
              </div>
              <input
                class="textbox"
                v-model="mainState.currentSetting.autoTranslationIgnoreLanguage"
                type="text"
                name="autoTranslationIgnoreLanguage"
                placeholder="en, zh, es, ..."
                @change="changeSetting"
              >
            </div>
          </div>

          <!-- 設定ページ - ポスト設定ページ - タイムラインの制御 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("timelineControl") }}</span>
              <button
                class="description-button"
                @click.prevent
              >
                <SVGIcon name="help" />
              </button>
            </div>
            <div class="settings-popup__form__body">
              <!-- 設定ページ - ポスト設定ページ - タイムラインの制御 - リプライ -->
              <div class="settings-popup__form__header">
                <span>{{ $t("replyControl") }}</span>
              </div>
              <Checkboxes
                :state="mainState.currentSetting"
                model="replyControl"
                :options="SETTINGS.REPLY_CONTROLS"
                @update="saveSetting"
              />

              <!-- 設定ページ - ポスト設定ページ - タイムラインの制御 - リポスト -->
              <div class="settings-popup__form__header">
                <span>{{ $t("repostControl") }}</span>
              </div>
              <Checkboxes
                :state="mainState.currentSetting"
                model="repostControl"
                :options="SETTINGS.REPOST_CONTROLS"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- 設定ページ - ポスト設定ページ - 画像 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("image") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <!-- 設定ページ - ポスト設定ページ - 画像 - 画像の制御 -->
              <div class="settings-popup__form__header">
                <span>{{ $t("imageControl") }}</span>
              </div>
              <Radios
                :state="mainState.currentSetting"
                model="imageControl"
                :options="SETTINGS.IMAGE_CONTROLS"
                @update="saveSetting"
              />

              <!-- 設定ページ - ポスト設定ページ - 画像 - 画像サイズの比率 -->
              <div class="settings-popup__form__header">
                <span>{{ $t("imageAspectRatio") }}</span>
              </div>
              <Radios
                :state="mainState.currentSetting"
                model="imageAspectRatio"
                :options="SETTINGS.IMAGE_ASPECT_RATIO"
                layout="horizontal"
                @update="saveSetting"
              />

              <!-- 設定ページ - ポスト設定ページ - 画像 - 画像オプション -->
              <Checkboxes
                :state="mainState.currentSetting"
                model="imageOption"
                :options="SETTINGS.IMAGE_OPTION"
                layout="vertical"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- 設定ページ - ポスト設定ページ - リンクカード -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("linkcardEmbeddedControl") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Checkboxes
                :state="mainState.currentSetting"
                model="linkcardEmbeddedControl"
                :options="SETTINGS.LINKCARD_EMBEDDED_CONTROL"
                layout="vertical"
                @update="saveSetting"
              />
            </div>
          </div>
        </div>

        <!-- 設定ページ - デザイン設定ページ -->
        <div
          v-else-if="state.page === 'design'"
          class="settings-popup__form-page"
        >
          <!-- 設定ページ - デザイン設定ページ - カラーテーマ -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("colorTheme") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <ColorThemeList />
            </div>
          </div>

          <!-- 設定ページ - デザイン設定ページ - フォントサイズ -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("fontSize") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Radios
                :state="mainState.currentSetting"
                model="fontSize"
                :options="SETTINGS.FONT_SIZES"
                layout="horizontal"
                @update="changeSetting"
              />
            </div>
          </div>

          <!-- 設定ページ - デザイン設定ページ - レイアウト -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("layout") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <label class="selectbox">
                <select
                  v-model="mainState.currentSetting.layout"
                  name="layout"
                  @change="changeSetting"
                >
                  <option
                    v-for="layout, layoutIndex in SETTINGS.LAYOUTS"
                    :key="layoutIndex"
                    :value="layout.value"
                    :selected="layout.value === mainState.currentSetting.layout"
                  >{{ $t(layout.label) }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- 設定ページ - デザイン設定ページ - メインエリアの不透明度 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("mainAreaOpacity") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <label class="selectbox">
                <select
                  v-model="mainState.currentSetting.mainAreaOpacity"
                  name="mainAreaOpacity"
                  @change="changeSetting"
                >
                  <option
                    v-for="mainAreaOpacity, mainAreaOpacityIndex in SETTINGS.MAIN_AREA_OPACITIES"
                    :key="mainAreaOpacityIndex"
                    :value="mainAreaOpacity.value"
                    :selected="mainAreaOpacity.value === mainState.currentSetting.mainAreaOpacity"
                  >{{ $t(mainAreaOpacity.label) }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- 設定ページ - デザイン設定ページ - 背景画像 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("background") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <!-- 設定ページ - デザイン設定ページ - 背景画像 - URL -->
              <div class="settings-popup__form__header">
                <span>{{ $t("backgroundImage") }}</span>
              </div>
              <input
                class="textbox"
                v-model="mainState.currentSetting.backgroundImage"
                type="url"
                name="backgroundImage"
                @change="changeSetting"
              >

              <!-- 設定ページ - デザイン設定ページ - 背景画像 - 不透明度 -->
              <div class="settings-popup__form__header">
                <span>{{ $t("backgroundOpacity") }}</span>
              </div>
              <label class="selectbox">
                <select
                  v-model="mainState.currentSetting.backgroundOpacity"
                  name="backgroundOpacity"
                  @change="changeSetting"
                >
                  <option
                    v-for="backgroundOpacity, backgroundOpacityIndex in SETTINGS.BACKGROUND_OPACITIES"
                    :key="backgroundOpacityIndex"
                    :value="backgroundOpacity.value"
                    :selected="backgroundOpacity.value === mainState.currentSetting.backgroundOpacity"
                  >{{ $t(backgroundOpacity.label) }}</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <!-- 設定ページ - 心理的安全性設定ページ -->
        <div
          v-else-if="state.page === 'psySafety'"
          class="settings-popup__form-page"
        >
          <!-- 設定ページ - 心理的安全性設定ページ - 通知取得間隔 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("notificationFetchInterval") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <label class="selectbox">
                <select
                  v-model="mainState.currentSetting.notificationFetchInterval"
                  name="notificationFetchInterval"
                  @change="changeSetting"
                >
                  <option
                    v-for="interval, intervalIndex in SETTINGS.NOTIFICATION_FETCH_INTERVAL"
                    :key="intervalIndex"
                    :value="interval.value"
                    :selected="interval.value === mainState.currentSetting.notificationFetchInterval"
                  >{{ $t(interval.label) }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- 設定ページ - 心理的安全性設定ページ - 通知バッジの非表示 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("hideNotificationBadge") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Radios
                :state="mainState.currentSetting"
                model="hideNotificationBadge"
                :options="SETTINGS.HIDE_NOTIFICATION_BADGE"
                layout="horizontal"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- 設定ページ - 心理的安全性設定ページ - リアクション数の非表示 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("hideNumberOfReaction") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Radios
                :state="mainState.currentSetting"
                model="hideNumberOfReaction"
                :options="SETTINGS.HIDE_NUMBER_OF_REACTION"
                layout="horizontal"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- 設定ページ - 心理的安全性設定ページ - ポストの匿名化 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("postAnonymization") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Radios
                :state="mainState.currentSetting"
                model="postAnonymization"
                :options="SETTINGS.POST_ANONYMIZATION"
                layout="horizontal"
                @update="saveSetting"
              />
            </div>
          </div>
        </div>

        <!-- 設定ページ - その他設定ページ -->
        <div
          v-else-if="state.page === 'etc'"
          class="settings-popup__form-page"
        >
          <!-- 設定ページ - その他設定ページ - 時間表記 -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("timeControl") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Radios
                :state="mainState.currentSetting"
                model="timeControl"
                :options="SETTINGS.TIME_CONTROLS"
                layout="horizontal"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- 設定ページ - その他設定ページ - Lightning -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("lightning") }}</span>
              <button
                class="description-button"
                @click.prevent
              >
                <SVGIcon name="help" />
              </button>
            </div>
            <div class="settings-popup__form__body">
              <input
                class="textbox"
                v-model="mainState.currentSetting.lightning"
                type="url"
                name="lightning"
                placeholder="sample@wallet.com, lnurlxxx, lnbcxxx, ..."
                @change="changeSetting"
              >
            </div>
          </div>

          <!-- 設定ページ - その他設定ページ - 設定のリセット -->
          <div class="settings-popup__form">
            <div class="settings-popup__form__header">
              <span>{{ $t("development") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <button
                class="button--important"
                @click.stop="resetSettings"
              >
                <span>{{ $t("resetSettings") }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </Popup>
  </div>
</template>

<style lang="scss" scoped>
.settings-popup {
  &:deep() {
    .popup-body {
      padding: 1rem;
    }
  }

  // ボタン設定ページ
  &__button-page {
    display: flex;
    justify-content: center;
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

  // フォーム設定ページ
  &__form-page {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
  }

  // 設定フォーム
  &__form {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;

    &__header {
      display: flex;
      align-items: center;
      grid-gap: 1rem;
      font-size: 1.125rem;
      font-weight: bold;

      & > span {
        line-height: 1.25;
        overflow: hidden;
        word-wrap: break-word;
      }
    }
    &__body > &__header {
      font-size: 1rem;
    }

    &__body {
      display: flex;
      flex-direction: column;
      grid-gap: 0.5rem;

      input[type="text"],
      input[type="url"] {
        width: 100%;
      }
    }
  }

  &__button-has-multi-labels {
    flex-flow: wrap;
    justify-content: flex-start;
  }
}
</style>
