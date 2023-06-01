<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import LABELS from "@/consts/labels.json"
import OPTIONS from "@/consts/options.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

type TTLabelVisiblity = "hide" | "show" | "warn"

const state = reactive<{
  nsfw: TTLabelVisiblity
  nudity: TTLabelVisiblity
  suggestive: TTLabelVisiblity
  gore: TTLabelVisiblity
  hate: TTLabelVisiblity
  spam: TTLabelVisiblity
  impersonation: TTLabelVisiblity
}>({
  nsfw: "hide",
  nudity: "hide",
  suggestive: "hide",
  gore: "hide",
  hate: "hide",
  spam: "hide",
  impersonation: "hide",
})

resetState()

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("apply"),
  submitCallback: apply,
  data: (() => Object.keys(LABELS.DEFAULTS).map((label: string) => ({
    state,
    model: label,
    label: $t(label),
    type: "radio",
    options: OPTIONS.labelVisibility,
    layout: "horizontal",
  })))(),
}

onMounted(async () => {
  mainState.processing = true
  if (!await mainState.fetchPreferences())
    mainState.openErrorPopup("errorApiFailed", "ContentFilteringPopup/fetchPreferences")
  else resetState()
  mainState.processing = false
})

function resetState () {
  state.nsfw = getLabelVisibility("nsfw")
  state.nudity = getLabelVisibility("nudity")
  state.suggestive = getLabelVisibility("suggestive")
  state.gore = getLabelVisibility("gore")
  state.hate = getLabelVisibility("hate")
  state.spam = getLabelVisibility("spam")
  state.impersonation = getLabelVisibility("impersonation")
}

function getLabelPrefernce (label: string): undefined | TTPreference {
  return mainState.currentPreferences.find((preference: TTPreference) => {
    return preference.$type === "app.bsky.actor.defs#contentLabelPref" && 
           preference.label === label
  })
}

function getLabelVisibility (label: string): TTLabelVisiblity {
  const preference = getLabelPrefernce(label)
  return (preference?.visibility as TTLabelVisiblity) ?? "warn"
}

function close () {
  emit("close")
}

async function apply () {
  if (mainState.processing) return
  Object.keys(state).forEach((label: string) => {
    const preference = getLabelPrefernce(label)
    if (preference == null) {
      mainState.currentPreferences.push({
        $type: "app.bsky.actor.defs#contentLabelPref",
        label,
        visibility: (state as any)[label],
      })
    } else {
      preference.visibility = (state as any)[label]
    }
  })
  mainState.processing = true
  if (!await mainState.atp.updatePreferences(mainState.currentPreferences))
    mainState.openErrorPopup("errorApiFailed", "ContentFilteringPopup/updatePreferences")
  mainState.processing = false
  close()
}
</script>

<template>
  <Popup
    class="content-filtering-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="alert" />
        <span>{{ $t("contentFiltering") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <p>{{ $t("contentFilteringDescription") }}</p>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.content-filtering-popup:deep() {
  .popup-header > h2 {
    color: rgb(var(--notice-color));

    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }

  .radios .svg-icon {
    display: none;
  }
}
</style>
