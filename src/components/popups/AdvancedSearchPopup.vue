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

// 期間のプリセット。どれも「N 前の今日」を基準に同じ幅の範囲を設定する
const DATE_PRESETS: Array<{
  label: string
  years: number
  months: number
  days: number
}> = [
  { label: "searchPresetWeek", years: 0, months: 0, days: 7 },
  { label: "searchPresetMonth", years: 0, months: 1, days: 0 },
  { label: "searchPresetYear", years: 1, months: 0, days: 0 },
]

const easyFormState = reactive<TIPostSearch & {
  noLang: Array<boolean>
  authorIsMe: Array<string>
  mentionsIsMe: Array<string>
}>((() => {
  const authorIsMe =
    mainState.currentSearchPostFormState.author && (
      mainState.currentSearchPostFormState.author === "me" ||
      mainState.currentSearchPostFormState.author === mainState.userProfile?.handle
    )
  const mentionsIsMe =
    mainState.currentSearchPostFormState.mentions && (
      mainState.currentSearchPostFormState.mentions === "me" ||
      mainState.currentSearchPostFormState.mentions === mainState.userProfile?.handle
    )
  return {
    text: mainState.currentSearchTerm || "",
    sort: mainState.currentSearchPostFormState.sort || "latest",
    noLang: mainState.currentSearchPostFormState.lang ? [] : [true],
    lang: mainState.currentSearchPostFormState.lang || (Util.getUserLanguage() ?? ""),
    authorIsMe: authorIsMe ? [mainState.userProfile?.handle || ""] : [],
    author: authorIsMe ? "" : mainState.currentSearchPostFormState.author || "",

    // TODO: `mentions` と同等の挙動となるためコメントアウト。修正され次第復帰すること
    // to: "",

    mentionsIsMe: mentionsIsMe ? [mainState.userProfile?.handle || ""] : [],
    mentions: mentionsIsMe ? "" : mainState.currentSearchPostFormState.mentions || "",
    domain: mainState.currentSearchPostFormState.domain || "",
    since: mainState.currentSearchPostFormState.since || "",
    until: mainState.currentSearchPostFormState.until || "",
  }
})())

const easyFormProps: TTEasyForm = {
  submitCallback,
  data: [
    {
      state: easyFormState,
      model: "text",
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
  const query = {
    text: easyFormState.text || undefined,
    sort: easyFormState.sort,
    lang: easyFormState.noLang.length > 0 ? undefined : easyFormState.lang || undefined,
    author: easyFormState.authorIsMe.length > 0 ? easyFormState.authorIsMe[0] || undefined : modifyHandle(easyFormState.author),

    // TODO: `mentions` と同等の挙動となるためコメントアウト。修正され次第復帰すること
    // to: modifyHandle(easyFormState.to),

    mentions: easyFormState.mentionsIsMe.length > 0 ? easyFormState.mentionsIsMe[0] || undefined : modifyHandle(easyFormState.mentions),
    domain: easyFormState.domain || undefined,
    since: easyFormState.since || undefined,
    until: easyFormState.until || undefined,
  }
  router.push({ name: "post-search", query })
  close()
}

// 検索開始日に「基準日 - 2 日」、検索終了日に「基準日 + 1 日」を設定する
// 検索終了日は検索結果に含まれないため、実際の範囲は「基準日 - 2 日」から「基準日」までの 3 日間
function setDatePreset (preset: typeof DATE_PRESETS[number]) {
  const today = new Date()

  // 月末を超える日はその月の末日に丸める（例: 3/31 の 1ヶ月前は 2/28）
  const base = new Date(today.getFullYear() - preset.years, today.getMonth() - preset.months, 1)
  const lastDate = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
  base.setDate(Math.min(today.getDate(), lastDate) - preset.days)

  easyFormState.since = formatLocalDate(base, -2)
  easyFormState.until = formatLocalDate(base, 1)
}

// `toISOString()` は UTC のため使わず、ローカルの日付から `YYYY-MM-DD` を組み立てる
function formatLocalDate (base: Date, offsetDays: number): string {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offsetDays)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function modifyHandle (handle?: string): undefined | string {
  if (handle == null) {
    return
  }
  return handle.replace(/^@/, "").trim() || undefined
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
      >
        <template #beforeButton>
          <!-- 期間のプリセット -->
          <div class="group-parts date-preset-container">
            <button
              v-for="preset of DATE_PRESETS"
              :key="preset.label"
              type="button"
              class="button--bordered"
              @click.prevent="setDatePreset(preset)"
            >
              <span>{{ $t(preset.label) }}</span>
            </button>
          </div>
        </template>
      </EasyForm>
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

.date-preset-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.button-container {
  display: grid;
  padding: 1rem;
}
</style>
