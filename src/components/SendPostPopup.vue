<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Loader from "@/components/Loader.vue"
import Popup from "@/components/Popup.vue"
import { blurElement } from "@/composables/misc"
import type { MainState } from "@/@types/main-state.d"

const emit = defineEmits<{(event: string): void}>()

const mainState: MainState = inject("state") as MainState

const state = reactive<{
  text: string;
  url: string;
  images: Array<File>;
  alts: Array<string>;
  processing: boolean;
}>({
  text: "",
  url: "",
  images: [],
  alts: [],
  processing: false,
})

const $t = inject("$t") as Function

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
  if (state.processing) return
  state.processing = true
  try {
    await mainState.atp.postRecord(state)
  } finally {
    state.processing = false
    emit("close")
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
    <template v-slot:footer>
      <Loader v-if="state.processing" />
    </template>
  </Popup>
</template>
