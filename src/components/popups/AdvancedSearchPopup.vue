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
  authorIsMe: Array<string>
  mentionsIsMe: Array<string>
}>((() => {
  const authorIsMe =
    mainState.currentSearchPostFormState.author != null &&
    mainState.currentSearchPostFormState.author === mainState.userProfile?.handle
  const mentionsIsMe =
    mainState.currentSearchPostFormState.mentions != null &&
    mainState.currentSearchPostFormState.mentions === mainState.userProfile?.handle
  return {
    sort: mainState.currentSearchPostFormState.sort ?? "latest",
    noLang: mainState.currentSearchPostFormState.lang != null ? [] : [true],
    lang: mainState.currentSearchPostFormState.lang ?? Util.getUserLanguage() ?? "",
    authorIsMe: authorIsMe ? [mainState.currentSearchPostFormState.author as string] : [],
    author: authorIsMe ? "" : mainState.currentSearchPostFormState.author ?? "",

    // TODO: `mentions` と同等の挙動となるためコメントアウト。修正され次第復帰すること
    // to: "",

    mentionsIsMe: mentionsIsMe ? [mainState.currentSearchPostFormState.mentions as string] : [],
    mentions: mentionsIsMe ? "" : mainState.currentSearchPostFormState.mentions ?? "",
    domain: mainState.currentSearchPostFormState.domain ?? "",
    since: mainState.currentSearchPostFormState.since ?? "",
    until: mainState.currentSearchPostFormState.until ?? "",
  }
})())

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
        { label: $t("searchNoLang"), value: true },
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
      model: "authorIsMe",
      label: $t("searchAuthor"),
      type: "checkbox",
      layout: "horizontal",
      options: [
        { label: $t("searchMyPosts"), value: mainState.userProfile?.handle || "" },
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

    /*
    // TODO: `mentions` と同等の挙動となるためコメントアウト。修正され次第復帰すること
    {
      state: easyFormState,
      model: "to",
      label: $t("searchTo"),
      type: "text",
      placeholder: "@handle.bsky.social",
      autocomplete: "off",
      hasMentionSuggestion: true,
    },
    */

    {
      state: easyFormState,
      model: "mentionsIsMe",
      label: $t("searchMentions"),
      type: "checkbox",
      layout: "horizontal",
      options: [
        { label: $t("searchMentionsToMe"), value: mainState.userProfile?.handle || "" },
      ],
      onUpdate: updateMentionsData,
    },
    {
      state: easyFormState,
      model: "mentions",
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
  updateMentionsData()
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
    authorData.disabled = easyFormState.authorIsMe.length > 0
    easyForm.value?.forceUpdate()
  }
}

function updateMentionsData () {
  const mentionsData = easyFormProps.data.find((prop) => {
    return prop.model === "mentions"
  })
  if (mentionsData != null) {
    mentionsData.disabled = easyFormState.mentionsIsMe.length > 0
    easyForm.value?.forceUpdate()
  }
}

async function submitCallback () {
  Util.blurElement()
  mainState.currentSearchPostFormState.sort = easyFormState.sort
  mainState.currentSearchPostFormState.lang = easyFormState.noLang.length > 0 ? "" : easyFormState.lang
  mainState.currentSearchPostFormState.author = easyFormState.authorIsMe.length > 0 ? "me" : modifyHandle(easyFormState.author)

  // TODO: `mentions` と同等の挙動となるためコメントアウト。修正され次第復帰すること
  // mainState.currentSearchPostFormState.to = modifyHandle(easyFormState.to)

  mainState.currentSearchPostFormState.mentions = easyFormState.mentionsIsMe.length > 0 ? easyFormState.mentionsIsMe[0] : modifyHandle(easyFormState.mentions)
  mainState.currentSearchPostFormState.domain = easyFormState.domain?.trim()
  mainState.currentSearchPostFormState.since = easyFormState.since
  mainState.currentSearchPostFormState.until = easyFormState.until
  const query = {
    text: mainState.currentSearchTerm || undefined,
    sort: easyFormState.sort,
    lang: easyFormState.noLang.length > 0 ? undefined : easyFormState.lang,
    author: easyFormState.authorIsMe.length > 0 ? easyFormState.authorIsMe[0] : modifyHandle(easyFormState.author) || undefined,

    // TODO: `mentions` と同等の挙動となるためコメントアウト。修正され次第復帰すること
    // to: modifyHandle(easyFormState.to),

    mentions: easyFormState.mentionsIsMe.length > 0 ? easyFormState.mentionsIsMe[0] : modifyHandle(easyFormState.mentions) || undefined,
    domain: easyFormState.domain || undefined,
    since: easyFormState.since,
    until: easyFormState.until,
  }
  router.push({ name: "post-search", query })
  close()
}

function modifyHandle (handle?: string): undefined | string {
  if (handle == null) {
    return
  }
  return handle.replace(/^@/, "").trim()
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
  // lang, author, mentions フォームの上部マージンを詰める
  .easy-form:deep() {
    dl[data-name="lang"],
    dl[data-name="author"],
    dl[data-name="mentions"] {
      margin-top: -0.5rem;
    }
  }
}

.button-container {
  display: grid;
  padding: 1rem;
}
</style>
