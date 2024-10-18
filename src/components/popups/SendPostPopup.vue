<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, reactive, ref, watch, type ComputedRef, type Ref } from "vue"
import format from "date-fns/format"
import EasyForm from "@/components/forms/EasyForm.vue"
import LabelButton from "@/components/buttons/LabelButton.vue"
import LinkCard from "@/components/cards/LinkCard.vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, done: boolean, hidden: boolean): void}>()

const props = defineProps<{
  type: TTPostType
  post?: TTPost
  text?: string
  url?: string
  fileList?: FileList
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  labels: Array<string>
  draftReactionControl: TTDraftReactionControl
  isDraftReactionControlOn: ComputedRef<boolean>
  postDatePopupDate: ComputedRef<undefined | string>
  videoLimits?: TIVideoLimits
}>({
  labels: [],
  draftReactionControl: {
    postgateAllow: true,
    threadgateAction: "none",
    allowMention: false,
    allowFollowing: false,
    listUris: [],
  },
  isDraftReactionControlOn: computed((): boolean => {
    return (
      !state.draftReactionControl.postgateAllow ||
      state.draftReactionControl.threadgateAction !== "none"
    )
  }),
  postDatePopupDate: computed((): undefined | string => {
    if (mainState.postDatePopupDate == null) return
    const date = new Date(mainState.postDatePopupDate)
    if (Number.isNaN(date.getTime())) return
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  }),
  videoLimits: undefined,
})

const easyFormState = reactive<{
  text: string
  url: string
  urlHasImage: Array<boolean>
  medias: Array<File>
  alts: Array<string>
}>({
  text: props.text ?? "",
  url: props.url ?? "",
  urlHasImage: [true],
  medias: [],
  alts: [],
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state: easyFormState,
      model: "text",
      type: "textarea",
      placeholder: $t("text"),
      maxlength: 300,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      rows: 6,
      hasMentionSuggestion: true,
      focus: true,
      onBlur: onBlurOrInputText,
      onInput: onBlurOrInputText,
    },
    {
      state: easyFormState,
      model: "url",
      type: "text",
      placeholder: $t("LinkCardPlaceHolder"),
      autocomplete: "url",
      inputmode: "url",
      clearButton: true,
      onInput: onInputUrl,
    },
    {
      state: easyFormState,
      model: "urlHasImage",
      type: "checkbox",
      options: [{ label: $t("urlHasImage"), value: true }],
      display: false,
    },
    {
      state: easyFormState,
      model: "medias",
      type: "file",
      placeholder: $t("imageBoxes"),
      // accept: "image/bmp, image/gif, image/jpeg, image/png, image/svg+xml, image/webp",
      isMultipleFile: true,
      maxNumberOfFile: 4,
      quadLayout: true,
      onChange: onChangeImage,
    },
  ],
}

const popup = ref()

const easyForm = ref()

// ポップアップを開いた際のUX改善処置
watch(() => mainState.sendPostPopupProps.visibility, (value?: boolean) => {
  if (!value) return
  setTimeout(() => {
    // 「メンションを送る」使用時の対策
    if (props.text) easyFormState.text = `${props.text} ${easyFormState.text}`

    // 「リンクカードにする」使用時の対策
    if (props.url) easyFormState.url = props.url

    // プレビューリンクカード
    PreviewLinkCardFeature.execute()

    popup.value?.scrollToTop()
    easyForm.value?.setFocus()
  }, 0)
})

// D&D用処置
watch(() => props.fileList, (value?: FileList) => {
  const files = value != null ? Array.from(value) : []
  files.unshift(...easyFormState.medias)
  easyFormState.medias = files
  onInputUrl()
  onChangeImage()
})

onMounted(async () => {
  if (props.fileList != null) {
    easyFormState.medias = Array.from(props.fileList)
  }
  onInputUrl()
  onChangeImage()

  // 動画ファイルのアップロード権限と各種リミットの取得
  const videoLimits = await mainState.atp.fetchVideoLimits()
  if (videoLimits instanceof Error) {
    state.videoLimits = undefined
  } else {
    state.videoLimits = videoLimits
  }
})

async function close () {
  emit("closeSendPostPopup", false, true)
}

async function reset () {
  const result = await mainState.openConfirmationPopup({
    title: $t("sendPostReset"),
    text: $t("sendPostResetMessage"),
  })
  if (!result) {
    return
  }
  emit("closeSendPostPopup", false, false)
  await nextTick()
  mainState.openSendPostPopup({
    type: "post",
    post: props.post,
  })
}

async function submitCallback () {
  Util.blurElement()

  // 空ポストの確認ポップアップを表示
  if (easyFormState.text.trim() === "" &&
      easyFormState.medias.length === 0 &&
      easyFormState.url.trim() === ""
  ) {
    const result = await mainState.openConfirmationPopup({
      title: $t("emptyPostConfirmation"),
      text: $t("emptyPostConfirmationMessage"),
    })
    if (!result) {
      return
    }
  }

  // 送信中であれば中断
  if (mainState.sendPostPopupProcessing) {
    return
  }

  // 動画の aspectRatio 対応
  // WANT: `_videoAspectRatio` の注入なしで換装したい
  const videoSizes = (easyForm.value?.getVideoSizes() ?? [[]])[0]
  easyFormState.medias.forEach((media, index) => {
    (media as any)._videoAspectRatio = videoSizes[index]
  })

  // ポップアップを閉じる
  close()

  mainState.sendPostPopupProcessing = true
  try {
    const result = await mainState.atp.createPost({
      ...easyFormState,
      type: props.type,
      post: props.post,
      createdAt: state.postDatePopupDate,
      languages: mainState.currentSetting.postLanguages,
      labels: state.labels,
      lightning: mainState.currentSetting.lightning,
      listMentionDids: mainState.listMentionPopupProps.dids,
    })
    if (result instanceof Error) {
      mainState.openSendPostPopup()
      mainState.openErrorPopup($t(result.message), "SendPostPopup/submitCallback")
    } else {
      // Postgate の適用
      if (!state.draftReactionControl.postgateAllow) {
        const responseOfPostgate = await mainState.atp.updatePostgate(
          result.uri,
          state.draftReactionControl.postgateAllow
        )
        if (responseOfPostgate instanceof Error) {
          mainState.openErrorPopup(responseOfPostgate, "SendPostPopup/submitCallback")
          return
        }
      }

      // Threadgate の適用
      if (state.draftReactionControl.threadgateAction !== "none") {
        const responseOfThreadgate = await mainState.atp.updateThreadgate(
          result.uri,
          state.draftReactionControl.allowMention,
          state.draftReactionControl.allowFollowing,
          state.draftReactionControl.listUris
        )
        if (responseOfThreadgate instanceof Error) {
          mainState.openErrorPopup(responseOfThreadgate, "SendPostPopup/submitCallback")
          return
        }
      }

      emit("closeSendPostPopup", true, false)
    }
  } finally {
    mainState.sendPostPopupProcessing = false
  }
}

function onInputUrl () {
  // プレビューリンクカード
  PreviewLinkCardFeature.threshold()

  // リンクカードの画像添付チェックボックスの出し分け
  const urlHasImageItem = easyFormProps.data.find((item: TTEasyFormItem) => {
    return item.model === "urlHasImage"
  })
  if (urlHasImageItem == null) return
  urlHasImageItem.display = !!easyFormState.url && easyFormState.medias.length === 0

  // TODO: 要修正
  easyForm.value?.forceUpdate()
}

function onClickClearButton () {
  onInputUrl()
}

function onChangeImage () {
  // ファイルがひとつ以上選択されているか否かでリンクカード／フィードカードの表示状態を切り替える
  const urlItem = easyFormProps.data.find((item: TTEasyFormItem) => {
    return item.model === "url"
  })
  if (urlItem == null) return
  urlItem.display = easyFormState.medias.length === 0

  // alt の更新
  // TODO: 意図しない alt が削除される不具合を修正すること
  easyFormState.alts.splice(easyFormState.medias.length)
  easyFormProps.data.splice(
    0,
    easyFormProps.data.length,
    ...easyFormProps.data.filter((data: TTEasyFormItem) => data.name !== "alt")
  )
  easyFormState.medias.forEach((_: File, index: number) => {
    if (easyFormState.alts[index] == null) easyFormState.alts[index] = ""
    easyFormProps.data.push({
      name: "alt",
      state: easyFormState.alts,
      model: index,
      type: "textarea",
      placeholder: `${$t('alts')} ${index + 1}`,
      maxlength: 5000,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      rows: 3,
    })
  })

  onInputUrl()
}

function openReactionControlPopup () {
  mainState.openReactionControlPopup({
    mode: "send",
    isReply: false,
    draftReactionControl: state.draftReactionControl,
    onClosed (params?: TICloseReactionControlPopupProps) {
      if (params == null) {
        return
      }
      state.draftReactionControl.postgateAllow = params.postgateAllow
      state.draftReactionControl.threadgateAction = params.threadgateAction
      switch (state.draftReactionControl.threadgateAction) {
        case "none": {
          state.draftReactionControl.allowMention = false
          state.draftReactionControl.allowFollowing = false
          state.draftReactionControl.listUris.splice(0)
          break
        }
        case "custom": {
          state.draftReactionControl.allowMention = params.allowMention ?? false
          state.draftReactionControl.allowFollowing = params.allowFollowing ?? false
          state.draftReactionControl.listUris.splice(
            0,
            state.draftReactionControl.listUris.length,
            ...(params.listUris ?? [])
          )
          break
        }
      }
    },
  })
}

function openListMentionPopup () {
  mainState.openListMentionPopup()
}

// マイワード

let textareaSelectionStart = 0

mainState.myWordPopupCallback = (myWord: string) => {
  const textarea = getTextarea()
  if (textarea != null) {
    const before = easyFormState.text.substring(0, textareaSelectionStart)
    const after = easyFormState.text.substring(textareaSelectionStart)
    if (before !== "" && !before.match(/[\s\r\n]$/)) {
      myWord = " " + myWord
    }
    if (after !== "" && !after.match(/^[\s\r\n]/)) {
      myWord += " "
    }
    easyFormState.text = before + myWord + after
    textareaSelectionStart += myWord.length
  }
}

function onBlurOrInputText () {
  const textarea = getTextarea()
  if (textarea != null) {
    textareaSelectionStart = textarea.selectionStart
  }
}

function getTextarea (): null | HTMLTextAreaElement {
  return document.querySelector("#easy-form--default__0")
}

// プレビューリンクカード
const PreviewLinkCardFeature: {
  timer?: any
  loading: Ref<boolean>
  external: TTExternal
  threshold: () => void
  execute: () => Promise<void>
} = {
  timer: undefined,

  loading: ref(false),

  external: reactive({
    uri: "",
    title: undefined,
    description: undefined,
    thumb: undefined,
  }),

  threshold () {
    if (this.timer != null) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.timer = undefined
      this.execute()
    }, 1000)
  },

  async execute () {
    if (this.external.uri === easyFormState.url) {
      return
    }

    // `http` or `https` から始まるURLライクな文字列のみ処理
    if (!easyFormState.url.match(/https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/)) {
      this.external.uri = ""
      return
    }

    this.external.uri = easyFormState.url
    this.external.title = undefined
    this.external.description = undefined
    this.external.thumb = undefined
    this.loading.value = true
    const external = await Util.parseOgp(
      mainState.atp,
      easyFormState.url,
      false
    )
    this.loading.value = false
    if (external instanceof Error) {
      this.external.uri = ""
      return
    }
    this.external.uri = external.uri
    this.external.title = external.title
    this.external.description = external.description

    // プロキシサーバから送られたプレビュー用イメージを設定
    this.external.thumb = external.preview
  },
}
</script>

<template>
  <Popup
    class="send-post-popup"
    ref="popup"
    :hasCloseButton="true"
    :loaderDisplay="mainState.sendPostPopupProcessing"
    :data-type="type"
    @close="close"
  >
    <template #header>
      <!-- ヘルプボタン -->
      <button
        type="button"
        @click.stop="mainState.openHtmlPopup('post')"
      >
        <SVGIcon name="help" />
      </button>

      <!-- リセットボタン -->
      <button
        type="button"
        class="reset-button"
        @click.stop="reset"
      >
        <SVGIcon name="remove" />
      </button>

      <h2>
        <SVGIcon :name="type" />
        <span>{{ $t(type) }}</span>
      </h2>
    </template>
    <template #body>
      <Post
        v-if="type === 'reply' || type === 'quoteRepost'"
        position="preview"
        :post="post as TTPost"
        :noLink="true"
        @keydown.prevent.stop
        @keyup.prevent.stop
      />
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
        @clickClearButton="onClickClearButton"
      >
        <template #free-3>
          <!-- プレビューリンクカード -->
          <LinkCard
            v-if="
              !!PreviewLinkCardFeature.external.uri &&
              easyFormState.url !== '' &&
              !easyFormState.medias.length
            "
            :external="PreviewLinkCardFeature.external"
            layout="vertical"
            :displayImage="
              !!PreviewLinkCardFeature.external.thumb &&
              !!easyFormState.urlHasImage.length
            "
            :noLink="true"
            :noEmbedded="true"
          >
            <template #after>
              <Loader
                v-if="PreviewLinkCardFeature.loading.value"
                class="link-card-loader"
              />
            </template>
          </LinkCard>

          <div class="button-container">
            <!-- ポスト言語選択ポップアップトリガー -->
            <button
              class="button--bordered post-language-button"
              @click.prevent="mainState.openPostLanguagesPopup()"
            >
              <SVGIcon name="translate" />
              <span>{{ $t("languages") }}</span>
              <b
                v-if="mainState.currentSetting.postLanguages?.length"
                class="post-language-button__set"
              >{{ mainState.currentSetting.postLanguages?.join(", ") }}</b>
              <b
                v-else
                class="post-language-button__not-set"
              >{{ $t("notSet") }}</b>
            </button>

            <!-- ポストラベル選択ポップアップトリガー -->
            <LabelButton
              type="post"
              :parentState="state"
            />

            <!-- Threadgate ポップアップトリガー -->
            <button
              class="button--bordered on-off-button"
              :disabled="type === 'reply'"
              @click.prevent="openReactionControlPopup"
            >
              <SVGIcon :name="state.isDraftReactionControlOn ? 'lock' : 'unlock'" />
              <span>{{ $t("reactionControl") }}</span>
              <b v-if="state.isDraftReactionControlOn">ON</b>
            </button>

            <!-- リストメンションポップアップトリガー -->
            <button
              class="button--bordered on-off-button"
              @click.prevent="openListMentionPopup"
            >
              <SVGIcon name="list" />
              <span>{{ $t("listMention") }}</span>
              <b v-if="mainState.listMentionPopupProps.list != null">ON</b>
            </button>

            <!-- マイワードポップアップトリガー -->
            <button
              class="button--bordered my-word-button"
              @click.prevent="mainState.openMyWordPopup('select')"
            >
              <SVGIcon name="alphaA" />
              <span>{{ $t("myWord") }}</span>
            </button>

            <!-- ポスト日時選択ポップアップトリガー -->
            <button
              class="button--bordered post-date-button"
              @click.prevent="mainState.openPostDatePopup"
            >
              <SVGIcon name="history" />
              <span>{{ $t("date") }}</span>
              <b v-if="mainState.postDatePopupDate != null">{{ state.postDatePopupDate }}</b>
            </button>
          </div>
        </template>
        <template #beforeButton>
          <!-- 動画アップロード情報 -->
          <div class="video-upload-info">
            <div
              v-if="state.videoLimits != null && !state.videoLimits.canUpload"
              class="textlabel"
            >
              <div class="textlabel__text--alert">
                <SVGIcon name="alert" />{{ $t("videoCanNotUpload") }}
              </div>
            </div>
            <div
              v-else-if="state.videoLimits?.canUpload"
              class="textlabel"
            >
              <dl class="textlabel__text">
                <dt>{{ $t("videoRemainingDailyNumber") }}</dt>
                <dd>{{ (state.videoLimits.remainingDailyVideos ?? 0).toLocaleString() }}</dd>
              </dl>
              <dl class="textlabel__text">
                <dt>{{ $t("videoRemainingDailyBytes") }}</dt>
                <dd>{{ (((state.videoLimits.remainingDailyBytes ?? 0) / 1000 / 1000 / 1000).toFixed(2)).toLocaleString() }} GB</dd>
              </dl>
            </div>
            <div
              v-else
              class="textlabel"
            >
              <dl class="textlabel__text">
                <dt>&emsp;</dt>
                <dd>&emsp;</dd>
              </dl>
            </div>
          </div>
        </template>
      </EasyForm>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-post-popup {
  // ポスト種別に応じて配色を変更
  --type-color: var(--fg-color);
  &[data-type="reply"] {
    --type-color: var(--post-color);
  }
  &[data-type="quoteRepost"] {
    --type-color: var(--share-color);
  }

  &:deep() {
    // ポップアップとテキストエリアを縦に最大化
    .popup,
    .popup-body,
    .easy-form,
    .easy-form__body,
    .easy-form__body > dl:first-child,
    .easy-form__body > dl:first-child > dd {
      flex-grow: 1;
    }

    .popup {
      max-height: $router-view-width;
    }

    .popup-header {
      & > h2 {
        margin-right: 3rem;

        & > .svg-icon {
          fill: rgb(var(--type-color));
        }
      }
    }

    .popup-body {
      padding-top: 0;
    }

    // プレビューポスト
    .post[data-position="preview"] {
      margin-top: 1rem;

      .text {
        pointer-events: fill;
        user-select: text;
      }

      .textlink {
        pointer-events: none;
      }

      .html-text {
        white-space: wrap;
      }
    }

    .easy-form__body {
      grid-gap: 0.5rem;
    }

    .textarea {
      // BORDERED_DESIGN: border-left-style: none;
      // BORDERED_DESIGN: border-right-style: none;
      border-style: none;
      border-radius: 0;
      margin: 0 -1.5rem;
    }
    .easy-form:first-child #easy-form--default__0 {
      // BORDERED_DESIGN: border-top-style: none;
    }

    // 送信ボタン
    .submit-button {
      --fg-color: var(--type-color);
    }
  }

  // ヘルプボタン
  .svg-icon--help {
    font-size: 1.25rem;
  }

  // リセットボタン
  .reset-button > .svg-icon {
    --fg-color: var(--notice-color);
  }

  .link-card-loader {
    font-size: 0.75rem;
  }

  // 動画アップロード情報
  .video-upload-info {
    display: flex;
    flex-direction: column;
    grid-gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: bold;

    dl {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      grid-gap: 0.5rem;

      & > dt {
        color: rgb(var(--fg-color), 0.5);
      }
    }
  }

  .button-container {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 0.5rem;

    .button--bordered:deep() {
      font-size: 0.875rem;
      overflow: hidden;
      min-height: 2.625rem;

      & > .svg-icon {
        font-size: 0.875rem;
      }

      & > span,
      & > b {
        text-overflow: ellipsis;
      }
      & > span {
        white-space: nowrap;
      }
      & > b {
        font-weight: bold;
        line-height: var(--line-height-high);
        word-break: break-all;
      }
    }
    .post-language-button {
      &__set {
        color: rgb(var(--fg-color));
        text-transform: uppercase;
      }

      &__not-set {
        color: rgb(var(--notice-color));
      }
    }

    .on-off-button > b {
      color: rgb(var(--notice-color));
    }
    .post-date-button > b {
      color: rgb(var(--fg-color));
    }
  }
}
</style>
