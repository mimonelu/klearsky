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
  text: string
  url: string
  images: Array<File>
  alts: Array<string>
  htmlPopupDisplay: boolean
}>({
  text: props.text ?? "",
  url: "",
  images: [],
  alts: [],
  htmlPopupDisplay: false,
})

// D&D用処置
watch(() => props.fileList, (value?: FileList) => {
  state.images = value != null ? Array.from(value) : []
  onChangeImage()
})

onMounted(() => {
  if (props.fileList != null) state.images = Array.from(props.fileList)
  onChangeImage()
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback,
  data: [
    {
      state,
      model: "text",
      type: "textarea",
      placeholder: $t("text"),
      maxlength: 300,
      maxLengthIndicator: true,
      maxLengthWithSegmenter: true,
      rows: 6,
      hasPostLanguages: true,
      hasAccountSuggest: true,
      focus: true,
    },
    {
      state,
      model: "url",
      type: "text",
      placeholder: $t("linkBox"),
      autocomplete: "url",
      inputmode: "url",
      clearButton: true,
    },
    {
      state,
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

function close () {
  emit("closeSnedPostPopup", false, isEmpty())
}

function isEmpty (): boolean {
  return !state.text &&
    !state.url &&
    state.images.length === 0 &&
    state.alts.length === 0
}

async function submitCallback () {
  Util.blurElement()
  if (mainState.processing) return
  mainState.processing = true
  try {
    const result = await mainState.atp.createPost({
      ...state,
      type: props.type,
      post: props.post,
      languages: mainState.currentSetting.postLanguages,

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
  urlItem.disabled = state.images.length > 0

  // TODO: 意図しない alt が削除される不具合を修正すること
  state.alts.splice(state.images.length)
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
          <template #after>
            <dl v-if="state.images.length > 0">
              <dd
                v-for="_, altIndex of state.images"
                :key="altIndex"
              >
                <input
                  v-model="state.alts[altIndex]"
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
}
</style>
