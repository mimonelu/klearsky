<script lang="ts" setup>
import { inject, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import LANGUAGES from "@/consts/languages"

const emit = defineEmits<{(event: string): void}>()

const easyForm = ref()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const router = useRouter()

const easyFormState = reactive<TIPostSearch & {
  noLang: Array<boolean>
  me: Array<string>
}>({
  sort: "latest",
  lang: Util.getUserLanguage() ?? "",
  noLang: [true],
  author: "",
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
      label: $t("searchAuthor"),
      type: "checkbox",
      layout: "horizontal",
      options: [
        { label: $t("me"), value: mainState.userProfile?.handle || "" },
      ],
      onUpdate: updateAuthorData,
    },
    {
      state: easyFormState,
      model: "author",
      type: "text",
      placeholder: "@handle.bsky.social",
      autocomplete: "off",
      hasMentionSuggestion: true,
    },
    {
      state: easyFormState,
      model: "to",
      label: $t("searchTo"),
      type: "text",
      placeholder: "@handle.bsky.social",
      autocomplete: "off",
      hasMentionSuggestion: true,
    },
    {
      state: easyFormState,
      model: "mentions",
      label: $t("searchMentions"),
      type: "text",
      placeholder: "@handle.bsky.social",
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
      type: "date",
    },
    {
      state: easyFormState,
      model: "until",
      label: $t("searchUntil"),
      type: "date",
    },
  ],
}

onMounted(() => {
  updateLangData()
  updateAuthorData()
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

function updateAuthorData () {
  const authorData = easyFormProps.data.find((prop) => {
    return prop.model === "author"
  })
  if (authorData != null) {
    authorData.disabled = easyFormState.me.length > 0
    easyForm.value?.forceUpdate()
  }
}

async function submitCallback () {
  Util.blurElement()
  mainState.currentSearchPostFormState.sort = easyFormState.sort
  mainState.currentSearchPostFormState.lang = easyFormState.noLang.length > 0 ? "" : easyFormState.lang
  mainState.currentSearchPostFormState.author = easyFormState.me.length > 0 ? "me" : easyFormState.author
  mainState.currentSearchPostFormState.to = easyFormState.to
  mainState.currentSearchPostFormState.mentions = easyFormState.mentions
  mainState.currentSearchPostFormState.domain = easyFormState.domain
  mainState.currentSearchPostFormState.since = easyFormState.since
  mainState.currentSearchPostFormState.until = easyFormState.until
  const query = {
    text: mainState.currentSearchTerm || undefined,
    sort: easyFormState.sort || undefined,
    lang: easyFormState.noLang.length > 0 ? undefined : easyFormState.lang || undefined,
    author: easyFormState.me.length > 0 ? easyFormState.me[0] : easyFormState.author || undefined,
    to: easyFormState.to || undefined,
    mentions: easyFormState.mentions || undefined,
    domain: easyFormState.domain || undefined,
    since: easyFormState.since || undefined,
    until: easyFormState.until || undefined,
  }
  router.push({ name: "post-search", query })
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
  // author フォームの上部マージンを詰める
  .easy-form:deep() {
    dl[data-name="lang"],
    dl[data-name="author"] {
      margin-top: -0.5rem;
    }
  }
}

.button-container {
  display: grid;
  padding: 1rem;
}
</style>
