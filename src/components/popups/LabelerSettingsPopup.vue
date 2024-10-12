<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import LabelerCard from "@/components/cards/LabelerCard.vue"
import Popup from "@/components/popups/Popup.vue"
import Radios from "@/components/forms/Radios.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

interface TIPseudoLabelerDefinition extends TILabelerDefinition {
  locale?: TILabelerDefinitionLocale
  setting: TTContentVisibility
  options: Array<TTOption>
  detailDisplay: boolean
}

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  labeler?: TILabeler
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  isMyLabeler: ComputedRef<boolean>
  pseudoDefinitions: Array<TIPseudoLabelerDefinition>
}>({
  isMyLabeler: computed((): boolean => {
    const myLabelers = mainState.myLabeler!.getMyLabelerPreferences()
    return myLabelers.findIndex((myLabeler) => {
      return myLabeler!.did === props.labeler?.creator.did
    }) !== - 1
  }),
  pseudoDefinitions: props.labeler?.policies.labelValueDefinitions?.map((definition) => {
    const locale = mainState.myLabeler!.getProperLocale(definition.locales)
    const setting = getLabelPreferenceVisibility(definition)
    const options: Array<TTOption> = makeOptions(definition)
    return {
      ...definition,
      locale,
      setting,
      options,
      detailDisplay: false,
    }
  }) ?? [],
})

function close () {
  updateLabelPreferences()
  emit("close")
}

function getLabelPreferenceVisibility (definition: TILabelerDefinition): TTContentVisibility {
  if (props.labeler == null) {
    return definition.defaultSetting
  }
  const labelPreference = mainState.myLabeler!.getLabelPreference(
    props.labeler.creator.did,
    definition.identifier
  )
  return labelPreference?.visibility ?? (
    definition.defaultSetting === "inform" ? "warn" : definition.defaultSetting
  ) ?? "ignore"
}

// 選択肢の作成
// SEE: https://github.com/bluesky-social/social-app/blob/main/src/lib/moderation/useLabelBehaviorDescription.ts
function makeOptions (definition: TILabelerDefinition): Array<TTOption> {
  const options: Array<TTOption> = []
  options.push({ "label": "off", "value": "ignore" })
  if (definition.blurs === "content" ||
      definition.blurs === "media" ||
      definition.severity === "alert"
  ) {
    options.push({ "label": "warn", "value": "warn" })
  } else if (definition.severity === "inform") {
    options.push({ "label": "showBadge", "value": "warn" })
  }
  options.push({ "label": "hide", "value": "hide" })
  return options
}

async function updateLabelPreferences () {
  if (!updated) {
    return
  }
  state.pseudoDefinitions.forEach((pseudoDefinition) => {
    if (props.labeler == null) {
      return
    }
    mainState.myLabeler!.addLabelPreference(
      props.labeler.creator.did,
      pseudoDefinition.identifier,
      pseudoDefinition.setting
    )
  })
  mainState.myLabeler!.cleanLabelPreferences()
  const result = await mainState.updatePreferences()
  if (!result) {
    return
  }

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("currentPreferences", mainState.currentPreferences)
  mainState.myWorker!.setSessionCache("myLabeler", mainState.myLabeler!.labelers)

  // labelMap の更新も同時に行う
  mainState.myLabeler!.updateLabelMap()
}

let updated = false

function update () {
  updated = true
}

function toggleDetailDisplay (pseudoDefinition: TIPseudoLabelerDefinition) {
  Util.blurElement()
  pseudoDefinition.detailDisplay = !pseudoDefinition.detailDisplay
}

async function resetAfterConfirmation () {
  Util.blurElement()
  const result = await mainState.openConfirmationPopup({
    title: $t("labelerReset"),
    text: $t("labelerResetMessage"),
  })
  if (!result) {
    return
  }
  reset()
  update()
}

function reset () {
  state.pseudoDefinitions.forEach((pseudoDefinition) => {
    pseudoDefinition.setting = pseudoDefinition.defaultSetting === "inform"
      ? "warn"
      : pseudoDefinition.defaultSetting
  })
}

function getDescription (pseudoDefinition: TIPseudoLabelerDefinition): string {
  return pseudoDefinition.locale?.description || $t(`label-description-${pseudoDefinition.identifier}`)
}

function translate (text: string) {
  Util.translateInExternalService(text)
}
</script>

<template>
  <Popup
    class="labeler-settings-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="labeler" />
        <span>{{ $t("labelerSettings") }}</span>
      </h2>
    </template>
    <template
      v-if="labeler != null"
      #header-after
    >
      <!-- ラベラーカード -->
      <LabelerCard
        :labeler="labeler"
        :menuDisplay="true"
        :detailDisplay="false"
        :subscribeButtonDisplay="true"
        :settingsButtonDisplay="false"
        @unsubscribed="reset"
        @close="close"
        @onActivateMention="close"
        @onActivateHashTag="close"
      />
    </template>
    <template
      v-if="labeler != null"
      #body
    >
      <!-- メインコンテンツ -->
      <div class="labeler-settings-popup__content">
        <!-- ポリシー説明 -->
        <div
          v-if="labeler.policies.description"
          class="labeler-settings-popup__policy-description"
        >{{ labeler.policies.description }}</div>

        <!-- ラベル設定 -->
        <div
          v-for="pseudoDefinition of state.pseudoDefinitions"
          :key="pseudoDefinition.identifier"
          class="labeler-settings-popup__label-setting"
        >
          <!-- ラベル名（ラベル説明トグル） -->
          <div class="labeler-settings-popup__label-name">
            <button
              type="button"
              @click.prevent.stop="toggleDetailDisplay(pseudoDefinition)"
            >
              <span>{{ pseudoDefinition.locale?.name || $t(`label-name-${pseudoDefinition.identifier}`) }}</span>
              <i>{{ pseudoDefinition.blurs }}</i>
              <SVGIcon :name="pseudoDefinition.detailDisplay ? 'cursorDown' : 'cursorUp'" />
            </button>
          </div>

          <!-- ラベル説明 -->
          <HtmlText
            v-if="pseudoDefinition.detailDisplay"
            class="labeler-settings-popup__label-description"
            :text="getDescription(pseudoDefinition)"
            :hasTranslateLink="pseudoDefinition.locale?.lang !== mainState.currentSetting.uiLanguage"
            @translate="translate(getDescription(pseudoDefinition))"
          />

          <!-- 設定ラジオボタン -->
          <Radios
            :state="pseudoDefinition"
            model="setting"
            :options="pseudoDefinition.options"
            :disabled="!state.isMyLabeler"
            layout="horizontal"
            @update="update"
          />
        </div>

        <!-- リセットボタン -->
        <div v-if="state.isMyLabeler">
          <div
            class="textlink--icon"
            @click="resetAfterConfirmation"
          >
            <SVGIcon name="alert"/>
            <span>{{ $t("labelerReset") }}</span>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.labeler-settings-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--label-color));
      }
    }
  }

  // メインコンテンツ
  &__content {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
  }

  // ポリシー説明
  &__policy-description {
    color: rgb(var(--fg-color), 0.75);
    line-height: var(--line-height-middle);
    font-style: italic;
    word-break: break-word;
  }

  // ラベル設定
  &__label-setting {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
  }

  // ラベル名（ラベル説明トグル）
  &__label-name {
    & > button {
      cursor: pointer;
      display: flex;
      align-items: center;
      grid-gap: 0.5rem;
      margin: -0.5rem;
      padding: 0.5rem;

      & > .svg-icon {
        fill: rgb(var(--fg-color), 0.5);
        font-size: 0.875rem;
      }

      & > span {
        font-size: 1.125rem;
        font-weight: bold;
        line-height: var(--line-height-high);
        word-break: break-word;
      }
      &:focus, &:hover {
        & > span {
          text-decoration: underline;
          text-underline-offset: 0.25rem;
        }
      }

      // Blurs
      & > i {
        background-color: rgb(var(--fg-color), 0.125);
        border-radius: var(--border-radius-small);
        color: rgb(var(--fg-color), 0.75);
        font-size: 0.75rem;
        padding: 0.25rem;
        white-space: nowrap;
      }
    }
  }

  // ラベル説明
  &__label-description {
    color: rgb(var(--fg-color), 0.75);
    line-height: var(--line-height-middle);
    word-break: break-word;
  }
}
</style>
