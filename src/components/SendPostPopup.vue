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
  data: (() => {
    const result: Array<TTEasyFormItem> = [
      {
        state,
        model: "text",
        label: $t("text"),
        type: "textarea",
        rows: 4,
        focus: true,
      },
    ]
    if (props.type !== "quoteRepost") {
      result.push({
        state,
        model: "url",
        label: $t("linkBox"),
        type: "url",
        autocomplete: "url",
        inputmode: "url",
      })
      result.push({
        state,
        model: "images",
        label: $t("imageBoxes"),
        type: "file",
        isMultipleFile: true,
        maxNumberOfFile: 4,
      })
    }
    return result
  })(),
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
        type="post"
        mode="preview"
        :post="post as TTPost"
      />
      <EasyForm v-bind="easyFormProps">
        <template v-slot:after>
          <dl v-if="state.images.length > 0">
            <dt>{{ $t("alts") }}</dt>
            <dd>
              <input
                v-for="_, index of state.images"
                v-model="state.alts[index]"
                type="text"
                autocapitalize="off"
                autocomplete="off"
                spellcheck="false"
                class="textbox"
              />
            </dd>
          </dl>
          <p
            v-if="props.type !== 'quoteRepost'"
            class="note"
          >{{ $t("sendPostNote") }}</p>
        </template>
      </EasyForm>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-post-popup:deep() {
  .popup {
    width: $router-view-width;
  }
}
</style>
