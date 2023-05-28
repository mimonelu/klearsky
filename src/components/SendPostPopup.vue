<script lang="ts" setup>
import { inject, reactive, watch } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Popup from "@/components/Popup.vue"
import Post from "@/components/Post.vue"
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
  text: string;
  url: string;
  images: Array<File>;
  alts: Array<string>;
}>({
  text: props.text ?? "",
  url: "",
  images: props.fileList != null ? Array.from(props.fileList) : [],
  alts: [],
})

// D&D用処置
watch(() => props.fileList, (value?: FileList) => {
  state.images = value != null ? Array.from(value) : []
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
      focus: true,
    },
    {
      state,
      model: "url",
      type: "url",
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
      onChange (_: TTEasyFormItem, form: TTEasyForm) {
        // ファイルがひとつ以上選択されているか否かでリンクボックスの表示状態を切り替える
        const urlItem = form.data.find((item: TTEasyFormItem) => item.model === "url")
        if (urlItem == null) return
        urlItem.display = state.images.length === 0

        // WANT: 意図しない alt が削除される不具合を修正したい
        state.alts.splice(state.images.length)
      },
    },
  ],
}

function close () {
  emit("closeSnedPostPopup", false, isEmpty())
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

      // Lightning
      lightning: mainState.currentSetting.lightning,
    })
    if (result) emit("closeSnedPostPopup", true, true)
  } finally {
    mainState.processing = false
  }
}

function isEmpty (): boolean {
  return !state.text &&
    !state.url &&
    state.images.length === 0 &&
    state.alts.length === 0
}
</script>

<template>
  <Popup
    class="send-post-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <span>{{ $t(type) }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <Post
        v-if="type === 'reply' || type === 'quoteRepost'"
        position="preview"
        :post="post as TTPost"
      />
      <EasyForm v-bind="easyFormProps">
        <template v-slot:after>
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
</template>

<style lang="scss" scoped>
.send-post-popup:deep() {
  .textarea {
    border-left-style: none;
    border-right-style: none;
    border-radius: 0;
    margin: 0 -2rem;
  }
}
</style>
