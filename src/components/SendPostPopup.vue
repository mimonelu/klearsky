<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Popup from "@/components/Popup.vue"
import Post from "@/components/Post.vue"
import { blurElement } from "@/composables/misc"

const emit = defineEmits<{(event: string, done: boolean): void}>()

const props = defineProps<{
  type: TTPostType;
  post?: TTPost;
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  text: string;
  url: string;
  images: Array<File>;
  alts: Array<string>;
}>({
  text: "",
  url: "",
  images: [],
  alts: [],
})

const easyFormProps: TTEasyForm = {
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
      rows: 4,
      focus: true,
    }, {
      state,
      model: "url",
      type: "url",
      placeholder: $t("linkBox"),
      autocomplete: "url",
      inputmode: "url",
    }, {
      state,
      model: "images",
      type: "file",
      placeholder: $t("imageBoxes"),
      // accept: "image/bmp, image/gif, image/jpeg, image/png, image/svg+xml, image/webp",
      isMultipleFile: true,
      maxNumberOfFile: 4,
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
  emit("close", false)
}

async function submitCallback () {
  blurElement()
  if (mainState.processing) return
  mainState.processing = true
  try {
    const result = await mainState.atp.createPost({
      ...state,
      type: props.type,
      post: props.post,
    })
    if (result) emit("close", true)
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <Popup
    class="send-post-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>{{ $t(type) }}</h2>
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
            <dd v-for="_, index of state.images">
              <input
                v-model="state.alts[index]"
                type="text"
                autocapitalize="off"
                autocomplete="off"
                :placeholder="`${$t('alts')} ${index + 1}`"
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
  .popup {
    width: calc($router-view-width - 2rem);

    &-header {
      font-weight: bold;
    }
  }
}
</style>
