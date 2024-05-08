<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import LABEL_BEHAVIORS from "@/consts/label-behaviors.json"
import OPTIONS from "@/consts/options.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

type TTLabelVisiblity = "hide" | "show" | "warn"

const state = reactive<{
  popupLoaderDisplay: boolean
}>({
  popupLoaderDisplay: false,
})

const formState = reactive<{
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
  blurOnSubmit: true,
  data: (() => {
    // コンテンツフィルタのラベルグループを作成
    const results: { [k: string]: any } = {}
    Object.keys(LABEL_BEHAVIORS).forEach((key: string) => {
      const oldGroup = LABEL_BEHAVIORS[key].oldGroup
      if (!oldGroup) return
      results[oldGroup] = true
    })

    return Object.keys(results).map((label: string) => ({
      state: formState,
      model: label,
      label: $t(label),
      type: "radio",
      options: OPTIONS.LABEL_VISIBILITY,
      layout: "horizontal",
      classes: "radios-is-wide",
    }))
  })(),
}

onMounted(async () => {
  state.popupLoaderDisplay = true
  if (!await mainState.fetchPreferences())
    mainState.openErrorPopup("errorApiFailed", "ContentFilteringPopup/fetchPreferences")
  else resetState()
  state.popupLoaderDisplay = false
})

function resetState () {
  formState.nsfw = getLabelVisibility("nsfw")
  formState.nudity = getLabelVisibility("nudity")
  formState.suggestive = getLabelVisibility("suggestive")
  formState.gore = getLabelVisibility("gore")
  formState.hate = getLabelVisibility("hate")
  formState.spam = getLabelVisibility("spam")
  formState.impersonation = getLabelVisibility("impersonation")
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
  if (state.popupLoaderDisplay) return
  Object.keys(formState).forEach((label: string) => {
    const preference = getLabelPrefernce(label)
    if (preference == null) {
      mainState.currentPreferences.push({
        $type: "app.bsky.actor.defs#contentLabelPref",
        label,
        visibility: (formState as any)[label],
      })
    } else {
      preference.visibility = (formState as any)[label]
    }
  })
  state.popupLoaderDisplay = true
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  state.popupLoaderDisplay = false
  if (!result) {
    mainState.openErrorPopup("errorApiFailed", "ContentFilteringPopup/updatePreferences")
  }

  // セッションキャッシュの更新
  if (result) {
    mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
    mainState.myWorker.setSessionCache("myFeeds.items", mainState.myFeeds.items)
  }

  close()
}
</script>

<template>
  <Popup
    class="content-filtering-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="contentFiltering" />
        <span>{{ $t("contentFiltering") }}</span>
      </h2>
    </template>
    <template #body>
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

  .popup-body {
    grid-gap: 1.5rem;
    padding: 1.5rem 0;

    & > p {
      margin: 0 1.5rem;
    }
  }

  .easy-form {
    grid-gap: 1.5rem;

    dt {
      margin: 0 1.5rem;
    }

    .submit-button {
      margin: 0 1.5rem;
    }
  }

  .radios .svg-icon {
    display: none;
  }
}
</style>
