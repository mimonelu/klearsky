<script lang="ts" setup>
import { inject, reactive } from "vue"
import LabelerCard from "@/components/cards/LabelerCard.vue"
import Popup from "@/components/popups/Popup.vue"
import Radios from "@/components/form-parts/Radios.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
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

const mainState = inject("state") as MainState

const myLabelers = mainState.myLabeler.getMyLabelerPreferences()

const isMyLabeler = myLabelers.findIndex((myLabeler) => myLabeler.did === props.labeler?.creator.did) !== - 1

const state = reactive<{
  pseudoDefinitions: Array<TIPseudoLabelerDefinition>
}>({
  pseudoDefinitions: props.labeler?.policies.labelValueDefinitions?.map((definition) => {
    const locale = mainState.myLabeler.getProperLocale(definition.locales)
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
  const labelPreference = mainState.myLabeler.getLabelPreference(
    props.labeler.creator.did,
    definition.identifier
  )
  return labelPreference?.visibility ?? definition.defaultSetting
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
    mainState.myLabeler.addLabelPreference(
      props.labeler.creator.did,
      pseudoDefinition.identifier,
      pseudoDefinition.setting
    )
  })
  mainState.myLabeler.cleanLabelPreferences()
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  if (!result) {
    mainState.openErrorPopup("errorApiFailed", "LabelerSettingsPopup/close")
  }

  // labelMap の更新も同時に行う
  mainState.myLabeler.updateLabelMap()
}

let updated = false

function update () {
  updated = true
}

function toggleDetailDisplay (pseudoDefinition: TIPseudoLabelerDefinition) {
  Util.blurElement()
  pseudoDefinition.detailDisplay = !pseudoDefinition.detailDisplay
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
      #body
    >
      <!-- ラベラーカード -->
      <LabelerCard
        :labeler="labeler"
        :menuDisplay="false"
        :detailDisplay="false"
        @close="close"
        @onActivateMention="close"
        @onActivateHashTag="close"
      />

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
              <span>{{ pseudoDefinition.locale?.name ?? pseudoDefinition.identifier }}</span>
              <SVGIcon :name="pseudoDefinition.detailDisplay ? 'cursorDown' : 'cursorUp'" />
            </button>
          </div>

          <!-- ラベル説明 -->
          <div
            v-if="pseudoDefinition.detailDisplay"
            class="labeler-settings-popup__label-description"
          >{{ pseudoDefinition.locale?.description }}</div>

          <!-- 設定ラジオボタン -->
          <Radios
            :state="pseudoDefinition"
            model="setting"
            :options="pseudoDefinition.options"
            :disabled="!isMyLabeler"
            layout="horizontal"
            @update="update"
          />
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
        fill: rgb(var(--share-color));
      }

      &-body {
        padding: unset;
      }
    }
  }

  // ラベラーカード
  .labeler-card {
    background-color: var(--fg-color-00625);
  }

  // メインコンテンツ
  &__content {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
    padding: 0 1rem 1rem;
  }

  // ポリシー説明
  &__policy-description {
    color: var(--fg-color-075);
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
        fill: var(--fg-color-05);
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
    }
  }

  // ラベル説明
  &__label-description {
    color: var(--fg-color-075);
    line-height: var(--line-height-middle);
    word-break: break-word;
  }
}
</style>
