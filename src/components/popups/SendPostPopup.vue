<script lang="ts" setup>
import { inject, onMounted, reactive, ref, watch } from "vue"
import format from "date-fns/format"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import HtmlPopup from "@/components/popups/HtmlPopup.vue"
import LabelButton from "@/components/buttons/LabelButton.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/app-parts/Post.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, done: boolean): void}>()

const props = defineProps<{
  type: TTPostType
  post?: TTPost
  text?: string
  url?: string
  fileList?: FileList
  createdAt?: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  labels: Array<string>
  htmlPopupDisplay: boolean
  popupLoaderDisplay: boolean
  draftThreadgate: TTDraftThreadgate
}>({
  labels: [],
  htmlPopupDisplay: false,
  popupLoaderDisplay: false,
  draftThreadgate: {
    applied: false,
    allowMention: false,
    allowFollowing: false,
    listUris: [],
  },
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
      hasAccountSuggestion: true,
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

const easyForm = ref(null)

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

  mainState.postDatePopupDate = props.createdAt
})

async function close () {
  if (!isEmpty() && !state.popupLoaderDisplay) {
    const result = await mainState.openConfirmationPopup($t("cancelPost"), $t("cancelPostMessage"))
    if (!result) return
  }
  emit("closeSendPostPopup", false)
}

function isEmpty (): boolean {
  return !easyFormState.text &&
    !easyFormState.url &&
    easyFormState.images.length === 0 &&
    easyFormState.alts.length === 0
}

async function submitCallback () {
  Util.blurElement()

  // 空ポストの確認
  if (easyFormState.text.trim() === "" &&
      easyFormState.images.length === 0 &&
      easyFormState.url.trim() === "") {
    const result = await mainState.openConfirmationPopup(
      $t("emptyPostConfirmation"),
      $t("emptyPostConfirmationMessage")
    )
    if (!result) return
  }

  if (state.popupLoaderDisplay) return
  state.popupLoaderDisplay = true
  try {
    const result = await mainState.atp.createPost({
      ...easyFormState,
      type: props.type,
      post: props.post,
      createdAt: mainState.postDatePopupDate,
      languages: mainState.currentSetting.postLanguages,
      labels: state.labels,
      tags: mainState.currentPostTags,

      // Lightning
      lightning: mainState.currentSetting.lightning,
    })
    if (result instanceof Error) {
      mainState.openErrorPopup(result, "SendPostPopup/submitCallback")
    } else {
      // Threadgate の適用
      if (state.draftThreadgate.applied) {
        const responseOfUpdate = await mainState.atp.updateThreadgate(
          result.uri,
          state.draftThreadgate.allowMention,
          state.draftThreadgate.allowFollowing,
          state.draftThreadgate.listUris
        )
        if (!responseOfUpdate || responseOfUpdate instanceof Error)
          mainState.openErrorPopup(responseOfUpdate, "SendPostPopup/updateThreadgate")
      }

      emit("closeSendPostPopup", true)
    }
  } finally {
    state.popupLoaderDisplay = false
  }
}

function onInputUrl () {
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
      maxlength: 1000,
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
</script>

<template>
  <div>
    <Popup
      class="send-post-popup"
      :hasCloseButton="true"
      :loaderDisplay="state.popupLoaderDisplay"
      @close="close"
    >
      <template #header>
        <button @click.stop="state.htmlPopupDisplay = true">
          <SVGIcon name="help" />
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
                <b v-if="mainState.postDatePopupDate != null">{{ format(new Date(mainState.postDatePopupDate), "yyyy/MM/dd HH:mm:ss") }}</b>
              </button>
            </div>
          </template>
        </EasyForm>
      </template>
    </Popup>

    <!-- 説明用HTMLポップアップ -->
    <HtmlPopup
      v-if="state.htmlPopupDisplay"
      :title="`${$t('help')} - ${$t('post')}`"
      @close="state.htmlPopupDisplay = false"
    >
      <ul class="bullet-points">
        <li>{{ $t("sendPostNotification1") }}</li>
        <li>{{ $t("sendPostNotification2") }}</li>
        <li>{{ $t("sendPostNotification3") }}</li>
        <li>{{ $t("sendPostNotification4") }}</li>
      </ul>
    </HtmlPopup>
  </div>
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

  .svg-icon--help {
    font-size: 1.25rem;
  }

  .button-container {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 1rem 0.5rem;

    .button--bordered {
      min-height: 2.625rem;
      font-size: 0.875rem;

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
        line-height: var(--line-height);
        word-break: break-word;
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
