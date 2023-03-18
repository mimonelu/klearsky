<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Popup from "@/components/Popup.vue"
import Post from "@/components/Post.vue"
import { blurElement } from "@/composables/misc"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  type: "post" | "reply" | "repost";
  post?: any;
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

const easyFormProps = {
  submitButtonLabel: $t("submit"),
  submitCallback,
  data: [
    {
      state,
      model: "text",
      label: $t("text"),
      type: "textarea",
      rows: 4,
      focus: true,
    },
    {
      state,
      model: "url",
      label: $t("linkBox"),
      type: "text",
    },
    {
      state,
      model: "images",
      label: $t("imageBoxes"),
      type: "file",
      isMultipleFile: true,
      maxNumberOfFile: 4,
    },
  ],
}

function close () {
  emit("close")
}

async function submitCallback () {
  blurElement()
  if (mainState.processing) return
  mainState.processing = true
  try {
    await mainState.atp.createPost({
      ...state,
      type: props.type,
      post: props.post,
    })
    emit("close")
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
      <h2>{{ $t("post") }}</h2>
    </template>
    <template v-slot:body>
      <Post
        v-if="type === 'reply' || type === 'repost'"
        type="post"
        mode="preview"
        :post="post"
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
    width: $router-view-width;
  }
}
</style>
