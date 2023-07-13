<script lang="ts" setup>
import { inject, reactive } from "vue"
import Checkboxes from "@/components/Checkboxes.vue"
import ColorTheme from "@/components/ColorTheme.vue"
import HtmlPopup from "@/components/HtmlPopup.vue"
import Popup from "@/components/Popup.vue"
import Radios from "@/components/Radios.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"
import languages from "@/consts/ui-languages.json"
import settings from "@/consts/settings.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  htmlPopupDisplay: boolean
  htmlPopupType?: string
}>({
  htmlPopupDisplay: false,
  htmlPopupType: undefined,
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

function showDescription (type: string) {
  state.htmlPopupType = type
  state.htmlPopupDisplay = true
}

function closeHtmlPopupDisplay () {
  state.htmlPopupDisplay = false
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
        <h2>
          <SVGIcon name="setting" />
          <span>{{ $t("settings") }}</span>
        </h2>
      </template>
      <template #body>
        <div class="settings-section-container">
          <!-- 各種機能設定 -->
          <div class="settings-section">
            <div class="list-menu">
              <!-- コンテンツ言語選択ポップアップトリガー -->
              <button @click.prevent="mainState.openContentLanguagesPopup">
                <SVGIcon name="translate" />
                <span>{{ $t("contentLanguagesEdit") }}</span>
                <SVGIcon name="cursorRight" />
              </button>

              <!-- ポスト言語選択ポップアップトリガー -->
              <button @click.prevent="mainState.openPostLanguagesPopup">
                <SVGIcon name="translate" />
                <span>{{ $t("postLanguagesEdit") }}</span>
                <SVGIcon name="cursorRight" />
              </button>

              <!-- マイフィードポップアップトリガー -->
              <button @click.prevent="mainState.openMyFeedsPopup">
                <SVGIcon name="feed" />
                <span>{{ $t("myFeedsEdit") }}</span>
                <SVGIcon name="cursorRight" />
              </button>

              <!-- ワードミュートポップアップトリガー -->
              <button @click.prevent="mainState.openWordMutePopup">
                <SVGIcon name="alphabeticalOff" />
                <span>{{ $t("wordMuteEdit") }}</span>
                <SVGIcon name="cursorRight" />
              </button>

              <!-- コンテンツ言語選択ポップアップトリガー -->
              <button @click.prevent="mainState.openContentFilteringPopup">
                <SVGIcon name="alert" />
                <span>{{ $t("modifyContentFiltering") }}</span>
                <SVGIcon name="cursorRight" />
              </button>

              <!-- ミュートユーザーリストポップアップトリガー -->
              <button @click.prevent="mainState.openMutingUsersPopup">
                <SVGIcon name="volumeOff" />
                <span>{{ $t("checkMutingUsers") }}</span>
                <SVGIcon name="cursorRight" />
              </button>

              <!-- ブロックユーザーリストポップアップトリガー -->
              <button @click.prevent="mainState.openBlockingUsersPopup">
                <SVGIcon name="personOff" />
                <span>{{ $t("checkBlockingUsers") }}</span>
                <SVGIcon name="cursorRight" />
              </button>

              <!-- 招待コード確認ポップアップトリガー -->
              <button @click.prevent="mainState.openInviteCodesPopup">
                <SVGIcon name="inviteCode" />
                <span>{{ $t("confirmInviteCodes") }} ({{ mainState.numberOfAvailableInviteCodes }} / {{ mainState.numberOfInviteCodes }})</span>
                <SVGIcon name="cursorRight" />
              </button>
            </div>
          </div>

          <!-- UI言語 -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("uiLanguage") }}</span>
            </div>
            <div class="settings-section__body">
              <label class="selectbox selectbox-is-wide">
                <select
                  v-model="mainState.currentSetting.uiLanguage"
                  @change="changeSetting"
                >
                  <option
                    v-for="language, languageIndex in languages"
                    :key="languageIndex"
                    :value="language.value"
                    :selected="language.value === mainState.currentSetting.uiLanguage"
                  >{{ $t(language.label) }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- 自動翻訳 -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("autoTranslation") }}</span>
              <button
                class="description-button"
                @click.prevent="showDescription('autoTranslation')"
              >
                <SVGIcon name="help" />
              </button>
            </div>
            <div class="settings-section__body">
              <Radios
                class="radios-is-wide"
                :state="mainState.currentSetting"
                model="autoTranslation"
                :options="settings.autoTranslations"
                layout="horizontal"
                @update="saveSetting"
              />

              <!-- 自動翻訳 - 除外する言語 -->
              <div class="settings-section__sub-header">
                <span>{{ $t("autoTranslationIgnoreLanguage") }}</span>
                <button
                  class="description-button"
                  @click.prevent="showDescription('autoTranslationIgnoreLanguage')"
                >
                  <SVGIcon name="help" />
                </button>
              </div>
              <input
                class="textbox textbox-is-wide"
                v-model="mainState.currentSetting.autoTranslationIgnoreLanguage"
                type="text"
                placeholder="en, zh, es, ..."
                @change="changeSetting"
              >
            </div>
          </div>

          <!-- フォントサイズ -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("fontSize") }}</span>
            </div>
            <div class="settings-section__body">
              <Radios
                class="radios-is-wide"
                :state="mainState.currentSetting"
                model="fontSize"
                :options="settings.fontSizes"
                layout="horizontal"
                @update="changeSetting"
              />
            </div>
          </div>

          <!-- 時間表記 -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("timeControl") }}</span>
            </div>
            <div class="settings-section__body">
              <Radios
                class="radios-is-wide"
                :state="mainState.currentSetting"
                model="timeControl"
                :options="settings.timeControls"
                layout="horizontal"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- タイムラインの制御 -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("timeline") }}</span>
              <button
                class="description-button"
                @click.prevent="showDescription('timelineControl')"
              >
                <SVGIcon name="help" />
              </button>
            </div>
            <div class="settings-section__body">
              <!-- タイムラインの制御 - リプライ -->
              <div class="settings-section__sub-header">
                <span>{{ $t("replyControl") }}</span>
              </div>
              <Checkboxes
                class="checkboxes-is-wide"
                :state="mainState.currentSetting"
                model="replyControl"
                :options="settings.replyControls"
                @update="saveSetting"
              />

              <!-- タイムラインの制御 - リポスト -->
              <div class="settings-section__sub-header">
                <span>{{ $t("repostControl") }}</span>
              </div>
              <Checkboxes
                class="checkboxes-is-wide"
                :state="mainState.currentSetting"
                model="repostControl"
                :options="settings.repostControls"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- 画像 -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("image") }}</span>
            </div>
            <div class="settings-section__body">
              <!-- 画像の制御 -->
              <div class="settings-section__sub-header">
                <span>{{ $t("imageControl") }}</span>
              </div>
              <Radios
                class="radios-is-wide"
                :state="mainState.currentSetting"
                model="imageControl"
                :options="settings.imageControls"
                @update="saveSetting"
              />

              <!-- 画像サイズの比率 -->
              <div class="settings-section__sub-header">
                <span>{{ $t("imageAspectRatio") }}</span>
              </div>
              <Radios
                class="radios-is-wide"
                :state="mainState.currentSetting"
                model="imageAspectRatio"
                :options="settings.imageAspectRatio"
                layout="horizontal"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- リンクカード -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("linkcard") }}</span>
            </div>
            <div class="settings-section__body">
              <!-- リンクカードの埋込コンテンツ制御 -->
              <div class="settings-section__sub-header">
                <span>{{ $t("linkcardEmbeddedControl") }}</span>
              </div>
              <Checkboxes
                class="checkboxes-is-wide"
                :state="mainState.currentSetting"
                model="linkcardEmbeddedControl"
                :options="settings.linkcardEmbeddedControl"
                layout="vertical"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- レイアウト -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("layout") }}</span>
            </div>
            <div class="settings-section__body">
              <label class="selectbox selectbox-is-wide">
                <select
                  v-model="mainState.currentSetting.layout"
                  @change="changeSetting"
                >
                  <option
                    v-for="layout, layoutIndex in settings.layouts"
                    :key="layoutIndex"
                    :value="layout.value"
                    :selected="layout.value === mainState.currentSetting.layout"
                  >{{ $t(layout.label) }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- カラーテーマ -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("colorTheme") }}</span>
            </div>
            <div class="settings-section__body">
              <ColorTheme />
            </div>
          </div>

          <!-- メインエリアの不透明度 -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("mainAreaOpacity") }}</span>
            </div>
            <div class="settings-section__body">
              <label class="selectbox selectbox-is-wide">
                <select
                  v-model="mainState.currentSetting.mainAreaOpacity"
                  @change="changeSetting"
                >
                  <option
                    v-for="mainAreaOpacity, mainAreaOpacityIndex in settings.mainAreaOpacities"
                    :key="mainAreaOpacityIndex"
                    :value="mainAreaOpacity.value"
                    :selected="mainAreaOpacity.value === mainState.currentSetting.mainAreaOpacity"
                  >{{ $t(mainAreaOpacity.label) }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- 背景画像 -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>{{ $t("background") }}</span>
            </div>
            <div class="settings-section__body">
              <!-- 背景画像 - URL -->
              <div class="settings-section__sub-header">
                <span>{{ $t("backgroundImage") }}</span>
              </div>
              <input
                class="textbox textbox-is-wide"
                v-model="mainState.currentSetting.backgroundImage"
                type="url"
                @change="changeSetting"
              >

              <!-- 背景画像 - 不透明度 -->
              <div class="settings-section__sub-header">
                <span>{{ $t("backgroundOpacity") }}</span>
              </div>
              <label class="selectbox selectbox-is-wide">
                <select
                  v-model="mainState.currentSetting.backgroundOpacity"
                  @change="changeSetting"
                >
                  <option
                    v-for="backgroundOpacity, backgroundOpacityIndex in settings.backgroundOpacities"
                    :key="backgroundOpacityIndex"
                    :value="backgroundOpacity.value"
                    :selected="backgroundOpacity.value === mainState.currentSetting.backgroundOpacity"
                  >{{ $t(backgroundOpacity.label) }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- 心理的安全性 -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>💚 {{ $t("psySafety") }}</span>
            </div>
            <div class="settings-section__body">
              <!-- 心理的安全性 - リアクション数の非表示 -->
              <div class="settings-section__sub-header">
                <span>{{ $t("hideNumberOfReaction") }}</span>
              </div>
              <Radios
                class="radios-is-wide"
                :state="mainState.currentSetting"
                model="hideNumberOfReaction"
                :options="settings.hideNumberOfReaction"
                layout="horizontal"
                @update="saveSetting"
              />

              <!-- 心理的安全性 - ポストの匿名化 -->
              <div class="settings-section__sub-header">
                <span>{{ $t("postAnonymization") }}</span>
              </div>
              <Radios
                class="radios-is-wide"
                :state="mainState.currentSetting"
                model="postAnonymization"
                :options="settings.postAnonymization"
                layout="horizontal"
                @update="saveSetting"
              />
            </div>
          </div>

          <!-- Lightning -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>⚡ {{ $t("lightning") }}</span>
              <button
                class="description-button"
                @click.prevent="showDescription('lightning')"
              >
                <SVGIcon name="help" />
              </button>
            </div>
            <div class="settings-section__body">
              <input
                class="textbox textbox-is-wide"
                v-model="mainState.currentSetting.lightning"
                type="url"
                placeholder="sample@wallet.com, lnurlxxx, lnbcxxx, ..."
                @change="changeSetting"
              >
            </div>
          </div>

          <!-- 設定のリセット -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span>🔧 {{ $t("development") }}</span>
            </div>
            <div class="settings-section__body">
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
  </div>
</template>

<style lang="scss" scoped>
.settings-popup:deep() {
  .popup-body {
    padding: 0 0 2rem;
  }
}

.description-button {
  --alpha: 0.75;
  cursor: pointer;
  margin: -0.5em;
  padding: 0.5em;
  &:focus, &:hover {
    --alpha: 1.0;
  }

  & > .svg-icon {
    fill: rgba(var(--accent-color), var(--alpha));
  }
}

.color-theme {
  padding: 0.5rem;
}

.list-menu {
  .svg-icon--feed {
    --icon-color: var(--post-color);
  }
  .svg-icon--alphabeticalOff,
  .svg-icon--alert,
  .svg-icon--volumeOff,
  .svg-icon--personOff {
    --icon-color: var(--notice-color);
  }
}

.button--important {
  margin: 0 1.5rem;
}
</style>
