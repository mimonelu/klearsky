<script lang="ts" setup>
import { inject, onMounted, reactive, watch } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import HtmlPopup from "@/components/HtmlPopup.vue"
import Popup from "@/components/Popup.vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, done: boolean, empty: boolean): void}>()

const props = defineProps<{
  type: TTPostType;
  post?: TTPost;
  text?: string;
  fileList?: FileList;
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  labels: Array<string>
  htmlPopupDisplay: boolean
}>({
  labels: [],
  htmlPopupDisplay: false,
})

const easyFormState = reactive<{
  text: string
  url: string
  images: Array<File>
  alts: Array<string>
}>({
  text: props.text ?? "",
  url: "",
  images: [],
  alts: [],
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback,
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
      hasAccountSuggest: true,
      focus: true,
    },
    {
      state: easyFormState,
      model: "url",
      type: "text",
      placeholder: $t("linkBox"),
      autocomplete: "url",
      inputmode: "url",
      clearButton: true,
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

// D&D用処置
watch(() => props.fileList, (value?: FileList) => {
  const files = value != null ? Array.from(value) : []
  files.unshift(...easyFormState.images)
  easyFormState.images = files
  onChangeImage()
})

onMounted(() => {
  if (props.fileList != null) easyFormState.images = Array.from(props.fileList)
  onChangeImage()
})

function close () {
  emit("closeSnedPostPopup", false, isEmpty())
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

  if (mainState.processing) return
  mainState.processing = true
  try {
    const result = await mainState.atp.createPost({
      ...easyFormState,
      type: props.type,
      post: props.post,
      languages: mainState.currentSetting.postLanguages,
      labels: state.labels,

      // Lightning
      lightning: mainState.currentSetting.lightning,
    })
    if (result) emit("closeSnedPostPopup", true, true)
  } finally {
    mainState.processing = false
  }
}

function onChangeImage () {
  // ファイルがひとつ以上選択されているか否かでリンクカード／フィードカードの表示状態を切り替える
  const urlItem = easyFormProps.data.find((item: TTEasyFormItem) => item.model === "url")
  if (urlItem == null) return
  urlItem.disabled = easyFormState.images.length > 0

  // TODO: 意図しない alt が削除される不具合を修正すること
  easyFormState.alts.splice(easyFormState.images.length)
}
</script>

<template>
  <div>
    <Popup
      class="send-post-popup"
      :hasCloseButton="true"
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
        />
        <EasyForm v-bind="easyFormProps">
          <template v-slot:free-2>
            <div class="button-container">
              <!-- ポスト言語選択ポップアップトリガー -->
              <button
                class="button--bordered"
                @click.prevent="mainState.openPostLanguagesPopup()"
              >
                <SVGIcon name="translate" />
                <span>{{
                  mainState.currentSetting.postLanguages?.length === 0
                  ? "---"
                  : mainState.currentSetting.postLanguages?.join(", ")
                }}</span>
              </button>

              <!-- ラベル選択ポップアップトリガー -->
              <button
                class="button--bordered"
                @click.prevent="mainState.openSelectLabelsPopup(state)"
              >
                <SVGIcon name="alert" />
                <span>{{
                  state.labels.length === 0
                  ? "---"
                  : state.labels.map((label: string) => $t(label)).join(", ")
                }}</span>
              </button>
            </div>
          </template>

          <!-- alt -->
          <template #after>
            <dl v-if="easyFormState.images.length > 0">
              <dd
                v-for="_, altIndex of easyFormState.images"
                :key="altIndex"
              >
                <input
                  v-model="easyFormState.alts[altIndex]"
                  type="text"
                  autocapitalize="off"
                  autocomplete="off"
                  :placeholder="`${$t('alts')} ${altIndex + 1}`"
                  spellcheck="false"
                  class="textbox"
                />
              </dd>
            </dl>
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
    grid-gap: 1rem;

    .button--bordered {
      min-height: 3rem;
      &:first-child {
        white-space: nowrap;
      }
      &:last-child {
        --fg-color: var(--notice-color);
      }

      & > .svg-icon {
        font-size: 1rem;
      }

      & > span {
        text-transform: uppercase;
        word-break: break-all;
      }
    }
  }
}
</style>
