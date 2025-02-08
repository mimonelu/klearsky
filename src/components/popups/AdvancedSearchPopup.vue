<script lang="ts" setup>
import { inject, onMounted, reactive, ref } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import LANGUAGES from "@/consts/languages"

const emit = defineEmits<{(event: string): void}>()

const easyForm = ref()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormState = reactive<{
  keyword: string
  sort: string
  lang: string
  noLang: Array<boolean>
  from: string
  me: Array<boolean>
  to: string
  mentions: string
  domain: string
  since: string
  until: string
}>({
  keyword: "",
  sort: "latest",
  lang: Util.getUserLanguage() ?? "",
  noLang: [true],
  from: "",
  me: [],
  to: "",
  mentions: "",
  domain: "",
  since: "",
  until: "",
})

const easyFormProps: TTEasyForm = {
  submitCallback,
  data: [
    {
      state: mainState,
      model: "currentSearchTerm",
      label: $t("searchKeyword"),
      type: "text",
      required: true,
      autocomplete: "off",
      inputmode: "search",
      focus: true,
    },
    {
      state: easyFormState,
      model: "sort",
      label: $t("searchSort"),
      type: "radio",
      layout: "horizontal",
      options: [
        { label: $t("postSearchLatest"), value: "latest" },
        { label: $t("postSearchTop"), value: "top" },
      ],
    },
    {
      state: easyFormState,
      model: "noLang",
      label: $t("searchLang"),
      type: "checkbox",
      layout: "horizontal",
      options: [
        { label: $t("noLang"), value: true },
      ],
      onUpdate: updateLangData,
    },
    {
      state: easyFormState,
      model: "lang",
      type: "select",
      options: [
        { label: $t("notSelected"), value: "" },
        ...LANGUAGES,
      ],
    },
    {
      state: easyFormState,
      model: "me",
      label: $t("searchFrom"),
      type: "checkbox",
      layout: "horizontal",
      options: [
        { label: $t("me"), value: true },
      ],
      onUpdate: updateFromData,
    },
    {
      state: easyFormState,
      model: "from",
      type: "text",
      placeholder: "handle.bsky.social",
      autocomplete: "off",
      hasMentionSuggestion: true,
    },
    {
      state: easyFormState,
      model: "to",
      label: $t("searchTo"),
      type: "text",
      placeholder: "handle.bsky.social",
      autocomplete: "off",
      hasMentionSuggestion: true,
    },
    {
      state: easyFormState,
      model: "mentions",
      label: $t("searchMentions"),
      type: "text",
      placeholder: "handle.bsky.social",
      autocomplete: "off",
      hasMentionSuggestion: true,
    },
    {
      state: easyFormState,
      model: "domain",
      label: $t("searchDomain"),
      type: "text",
      placeholder: "domain.com",
      autocomplete: "off",
    },
    {
      state: easyFormState,
      model: "since",
      label: $t("searchSince"),
      type: "datetime-local",
    },
    {
      state: easyFormState,
      model: "until",
      label: $t("searchUntil"),
      type: "datetime-local",
    },
  ],
}

onMounted(() => {
  updateLangData()
  updateFromData()
})

function close () {
  emit("close")
}

function updateLangData () {
  const langData = easyFormProps.data.find((prop) => {
    return prop.model === "lang"
  })
  if (langData != null) {
    langData.disabled = easyFormState.noLang.length > 0
    easyForm.value?.forceUpdate()
  }
}

function updateFromData () {
  const fromData = easyFormProps.data.find((prop) => {
    return prop.model === "from"
  })
  if (fromData != null) {
    fromData.disabled = easyFormState.me.length > 0
    easyForm.value?.forceUpdate()
  }
}

async function submitCallback () {
  Util.blurElement()
  close()
}
</script>

<template>
  <Popup
    class="advanced-search-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="search" />
        <span>{{ $t("advancedSearch") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      />
    </template>
    <template #footer>
      <div class="button-container">
        <button
          type="button"
          class="button"
          @click="submitCallback"
        >
          <span>{{ $t("search") }}</span>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.advanced-search-popup {
  // from フォームの上部マージンを詰める
  .easy-form:deep() {
    dl[data-name="lang"],
    dl[data-name="from"] {
      margin-top: -0.5rem;
    }
  }
}

.button-container {
  display: grid;
  padding: 1rem;
}
</style>
