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
  draftThreadgate: TTDraftThreadgate
  postDatePopupDate: ComputedRef<undefined | string>
}>({
  labels: [],
  draftThreadgate: {
    applied: false,
    allowMention: false,
    allowFollowing: false,
    listUris: [],
  },
  postDatePopupDate: computed((): undefined | string => {
    if (mainState.postDatePopupDate == null) return
    const date = new Date(mainState.postDatePopupDate)
    if (Number.isNaN(date.getTime())) return
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  }),
})

const easyFormState = reactive<{
  text: string
  url: string
  urlHasImage: Array<boolean>
  images: Array<File>
  alts: Array<string>
}>({
  text: props.text ?? "",
  url: props.url ?? "",
  urlHasImage: [true],
  images: [],
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
      model: "images",
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

const popup = ref(null)

const easyForm = ref(null)

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

    ;(popup.value as any)?.scrollToTop()
    ;(easyForm.value as any)?.setFocus()
  }, 0)
})

// D&D用処置
watch(() => props.fileList, (value?: FileList) => {
  const files = value != null ? Array.from(value) : []
  files.unshift(...easyFormState.images)
  easyFormState.images = files
  onInputUrl()
  onChangeImage()
})

onMounted(() => {
  if (props.fileList != null) easyFormState.images = Array.from(props.fileList)
  onInputUrl()
  onChangeImage()
})

async function close () {
  emit("closeSendPostPopup", false, true)
}

async function reset () {
  const result = await mainState.openConfirmationPopup(
    $t("sendPostReset"),
    $t("sendPostResetMessage")
  )
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
      easyFormState.images.length === 0 &&
      easyFormState.url.trim() === ""
  ) {
    const result = await mainState.openConfirmationPopup(
      $t("emptyPostConfirmation"),
      $t("emptyPostConfirmationMessage")
    )
    if (!result) {
      return
    }
  }

  // 送信中であれば中断
  if (mainState.sendPostPopupProcessing) {
    return
  }

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
      tags: mainState.currentPostTags,

      // Lightning
      lightning: mainState.currentSetting.lightning,
    })
    if (result instanceof Error) {
      mainState.openSendPostPopup()
      mainState.openErrorPopup($t(result.message), "SendPostPopup/submitCallback")
    } else {
      // Threadgate の適用
      if (state.draftThreadgate.applied) {
        const responseOfUpdate = await mainState.atp.updateThreadgate(
          result.uri,
          state.draftThreadgate.allowMention,
          state.draftThreadgate.allowFollowing,
          state.draftThreadgate.listUris
        )
        if (!responseOfUpdate || responseOfUpdate instanceof Error) {
          mainState.openErrorPopup(responseOfUpdate, "SendPostPopup/updateThreadgate")
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
  urlHasImageItem.display = !!easyFormState.url && easyFormState.images.length === 0

  // TODO: 要修正
  ;(easyForm.value as any)?.forceUpdate()
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
  urlItem.display = easyFormState.images.length === 0

  // alt の更新
  // TODO: 意図しない alt が削除される不具合を修正すること
  easyFormState.alts.splice(easyFormState.images.length)
  easyFormProps.data.splice(
    0,
    easyFormProps.data.length,
    ...easyFormProps.data.filter((data: TTEasyFormItem) => data.name !== "alt")
  )
  easyFormState.images.forEach((_: File, index: number) => {
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

function openThreadgatePopup () {
  mainState.openThreadgatePopup({
    mode: "send",
    draftThreadgate: state.draftThreadgate,
    onClosed (params: any) {
      if (params == null) return
      state.draftThreadgate.applied = !params.reset
      if (state.draftThreadgate.applied) {
        state.draftThreadgate.allowMention = params.allowMention
        state.draftThreadgate.allowFollowing = params.allowFollowing
        state.draftThreadgate.listUris.splice(0, state.draftThreadgate.listUris.length, ...(params.listUris ?? []))
      } else {
        state.draftThreadgate.allowMention = false
        state.draftThreadgate.allowFollowing = false
        state.draftThreadgate.listUris.splice(0)
      }
    },
  })
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
              !easyFormState.images.length
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
              <b v-if="mainState.currentSetting.postLanguages?.length">{{ mainState.currentSetting.postLanguages?.join(", ") }}</b>
            </button>

            <!-- マイタグポップアップトリガー -->
            <button
              class="button--bordered post-tag-button"
              @click.prevent="mainState.openMyTagPopup('select')"
            >
              <SVGIcon name="tag" />
              <span>{{ $t("tags") }}</span>
              <div
                v-if="mainState.currentPostTags?.length"
                class="post-tag-container"
              >
                <div
                  v-for="tag, index of mainState.currentPostTags"
                  :key="index"
                  class="post-tag"
                >
                  <span>{{ tag.text }}</span>
                </div>
              </div>
            </button>

            <!-- ポストラベル選択ポップアップトリガー -->
            <LabelButton
              type="post"
              :parentState="state"
            />

            <!-- Threadgate ポップアップトリガー -->
            <button
              class="button--bordered threadgate-button"
              :disabled="type === 'reply'"
              @click.prevent="openThreadgatePopup"
            >
              <SVGIcon :name="state.draftThreadgate.applied ? 'lock' : 'unlock'" />
              <span>{{ $t("threadgate") }}</span>
              <b v-if="state.draftThreadgate.applied">ON</b>
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
      </EasyForm>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-post-popup {
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
      border-bottom-style: none;

      & > h2 {
        margin-right: 3rem;
      }
    }

    .popup-body {
      padding-top: 0;
    }

    .textlabel {
      margin: 0 -0.5rem;
    }

    // プレビューポストのテキスト選択
    .post {
      .text {
        pointer-events: fill;
        user-select: text;
      }

      .textlink {
        pointer-events: none;
      }
    }

    .textarea {
      border-left-style: none;
      border-right-style: none;
      border-radius: 0;
      margin: 0 -1.5rem;
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

  .button-container {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 1rem 0.5rem;

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
    .post-language-button > b {
      color: rgb(var(--fg-color));
      text-transform: uppercase;
    }
    .post-tag-button {
      .post-tag-container {
        display: flex;
        flex-wrap: wrap;
        grid-gap: 0.25rem;
      }

      .post-tag {
        --alpha: 1;
        font-size: 0.75rem;
      }
    }
    .threadgate-button > b {
      color: rgb(var(--notice-color));
    }
    .post-date-button > b {
      color: rgb(var(--fg-color));
    }
  }
}
</style>
