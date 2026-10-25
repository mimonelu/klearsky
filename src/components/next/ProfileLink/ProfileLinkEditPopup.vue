<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const props = defineProps<{
  // 編集対象のリンク。未指定時は新規追加
  link?: TTProfileLinkDraft
}>()

const emit = defineEmits<{
  (event: "close"): void
  (event: "delete"): void
  (event: "submit", link: TTProfileLinkDraft): void
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyForm = ref()

const popupLoaderDisplay = ref(false)

const formState = reactive<{
  url: string
  title: string
}>({
  url: props.link?.url ?? "",
  title: props.link?.title ?? "",
})

// NOTICE: 背後のプロフィール編集画面のフォームと入力欄の ID が重複しないよう `id` を指定する
const easyFormProps: TTEasyForm = {
  id: "profile-link-edit-popup",
  blurOnSubmit: true,
  hasSubmitButton: false,
  submitCallback: submit,
  data: [
    {
      state: formState,
      model: "url",
      label: $t("profileLinkUrl"),
      type: "text",
      inputmode: "url",
      autocapitalize: "off",
      autocomplete: "url",
      spellcheck: false,
      placeholder: "https://",
      required: true,
      focus: true,
      onBlur: fetchLinkInfo,
    },
    {
      state: formState,
      model: "title",
      label: $t("profileLinkTitle"),
      type: "text",
      maxlength: 40,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
    },
  ],
}

// リンク先の情報（favicon とタイトルの候補）
// URL が変わった場合のみ取得し直す
let fetchedUrl: undefined | string = props.link?.url
let fetching: undefined | Promise<void>
let linkIcon: Pick<TTProfileLinkDraft, "icon" | "iconFile" | "iconUrl"> = {
  icon: props.link?.icon,
  iconFile: props.link?.iconFile,
  iconUrl: props.link?.iconUrl,
}

// 自動入力したタイトル。ユーザーが書き換えていなければ、URL の変更時に差し替える
let suggestedTitle = ""

// スキームがなければ `https://` を補い、https の URL のみ受け付ける
// SEE: https://github.com/bluesky-social/bsky/blob/main/lexicons/app/bsky/actor/link.json
function normalizeUrl (text: string): undefined | string {
  let url = text.trim()
  if (!url) {
    return
  }
  if (!/^[a-z][a-z\d+\-.]*:/i.test(url)) {
    url = `https://${url}`
  }
  const urlObject = Util.safeUrl(url)
  if (urlObject?.protocol !== "https:" || !urlObject.hostname.includes(".")) {
    return
  }

  // NOTICE: `href` は末尾に `/` を補うなど元の URL から変わるため、入力値をそのまま返す
  return url
}

// 取得中はローダーで入力を止め、取得後のタイトルの自動入力とユーザーの入力が競合しないようにする
function fetchLinkInfo (): undefined | Promise<void> {
  const url = normalizeUrl(formState.url)
  if (url == null || url === fetchedUrl) {
    return fetching
  }
  fetchedUrl = url
  fetching = (async () => {
    popupLoaderDisplay.value = true
    const [icon, ogp] = await Promise.all([
      Util.fetchProfileLinkIcon(url),
      Util.parseOgp(mainState.atp, url, false),
    ])
    popupLoaderDisplay.value = false
    linkIcon = {
      icon: undefined,
      iconFile: icon?.file,
      iconUrl: icon?.dataUrl,
    }

    // タイトルが空か自動入力のままの場合のみ、候補を入れる
    const title = formState.title.trim()
    if (title === "" || title === suggestedTitle) {
      suggestedTitle = ogp instanceof Error ? "" : makeSuggestedTitle(ogp.title)
      formState.title = suggestedTitle
    }
  })()
  return fetching
}

// ページタイトルから区切り文字より前の部分を取り出し、ボタンに収まる長さにする
// SEE: https://github.com/bluesky-social/social-app/blob/main/src/features/profileLinks/components/LinkFormDialog.tsx
function makeSuggestedTitle (pageTitle?: string): string {
  const title = (pageTitle ?? "").split(/\s+[|\-\u2013\u2014\u00b7]\s+|:\s+/)[0]?.trim() ?? ""
  const maxLength = CONSTS.MAX_PROFILE_LINK_SUGGESTED_TITLE_LENGTH
  if (Util.getGraphemeLength(title) <= maxLength) {
    return title
  }
  return Util.unicodeSubstring(title, 0, maxLength).trim()
}

function close () {
  emit("close")
}

async function submit () {
  Util.blurElement()
  if (!easyForm.value?.validate()) {
    return
  }
  const url = normalizeUrl(formState.url)
  if (url == null) {
    mainState.openErrorPopup("invalidUrlError", formState.url)
    return
  }

  // 取得中または未取得の場合は待つ
  await fetchLinkInfo()

  emit("submit", {
    ...props.link,
    ...linkIcon,
    url,
    title: formState.title.trim() || undefined,
  })
}
</script>

<template>
  <Popup
    class="profile-link-edit-popup"
    :hasCloseButton="true"
    :loaderDisplay="popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="link" />
        <span>{{ $t("profileLinks") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      />
    </template>
    <template #footer>
      <div class="profile-link-edit-popup__footer">
        <button
          v-if="link != null"
          type="button"
          class="button--important"
          @click.stop="emit('delete')"
        >
          <span>{{ $t("delete") }}</span>
        </button>
        <button
          type="button"
          class="button"
          @click.stop="submit"
        >
          <span>{{ $t("apply") }}</span>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.profile-link-edit-popup {
  &__footer {
    display: flex;
    grid-gap: 0.5rem;
    padding: 1rem;

    & > * {
      flex-grow: 1;
    }
  }
}
</style>
