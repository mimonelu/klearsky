<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import ChatPost from "@/components/app-parts/ChatPost.vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  myConvo?: TIMyConvo
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormState = reactive<{
  text: string
  /* // TODO: 一時退避
  url: string
  urlHasImage: Array<boolean>
  images: Array<File>
  alts: Array<string>
  */
}>({
  text: "",
  /* // TODO: 一時退避
  url: "",
  urlHasImage: [true],
  images: [],
  alts: [],
  */
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  submitCallback,
  blurOnSubmit: false,
  data: [
    {
      state: easyFormState,
      model: "text",
      type: "textarea",
      placeholder: $t("chatMessagePlaceholder"),
      maxlength: 300,
      maxLengthIndicator: false,
      maxLengthIndicatorByGrapheme: false,
      rows: 1,
      hasMentionSuggestion: true,
      focus: false,
      onFocus (item: TTEasyFormItem) {
        item.rows = 3

        // TODO: 要修正
        ;(easyForm.value as any)?.forceUpdate()
      },
      onBlur (item: TTEasyFormItem) {
        // ラグを挟むことで送信ボタンを押し損ねる事態を防ぐ
        setTimeout(() => {
          item.rows = 1

          // TODO: 要修正
          ;(easyForm.value as any)?.forceUpdate()
        }, 250)
      },
    },
    /* // TODO: 一時退避
    {
      state: easyFormState,
      model: "url",
      type: "text",
      placeholder: "URL",
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
      // onChange: onChangeImage,
    },
    */
  ],
}

const popup = ref(null)

const easyForm = ref(null)

let timer: undefined | any

let unmounted = false

onMounted(async () => {
  await updateMessagesOnMounted()
  updateTimer()
})

onBeforeUnmount(() => {
  unmounted = true
  if (timer != null) {
    clearTimeout(timer)
    timer = undefined
  }
})

/* // TODO: 一時退避
function onInputUrl () {
  // リンクカードの画像添付チェックボックスの出し分け
  const urlHasImageItem = easyFormProps.data.find((item: TTEasyFormItem) => {
    return item.model === "urlHasImage"
  })
  if (urlHasImageItem == null) {
    return
  }
  urlHasImageItem.display = !!easyFormState.url // TODO: && easyFormState.images.length === 0

  // TODO: 要修正
  ;(easyForm.value as any)?.forceUpdate()
}
*/

function close () {
  emit("close")
}

function updateTimer () {
  if (unmounted) {
    return
  }
  // TODO:
  timer = setTimeout(async () => {
    await updateMessagesOnTick()
    updateTimer()
  }, 10000)
}

async function updateMessagesOnMounted () {
  if (props.myConvo == null) {
    return
  }
  // TODO:
  await props.myConvo.updateMessages(100)
  ;(popup.value as any)?.scrollToBottom("smooth")
  await updateRead()
}

async function updateMessagesOnTick () {
  if (props.myConvo == null) {
    return
  }
  const diff = (popup.value as any).diffScrollBottom()

  // TODO:
  // 通信量削減のため、通常は1つのみ取得し、段階的に取得数を増やしている
  const numberOfNewMessages = await props.myConvo.updateMessages(1)
  if (numberOfNewMessages >= 1) {
    const numberOfNewMessages = await props.myConvo.updateMessages(10)
    if (numberOfNewMessages >= 10) {
      await props.myConvo.updateMessages(30)
    }
  }

  if (diff >= - 8) {
    ;(popup.value as any)?.scrollToBottom("smooth")
  }
  if (numberOfNewMessages >= 1) {
    await updateRead()
  }
}

async function updateRead () {
  if (props.myConvo == null) {
    return
  }

  // messageId は指定しない
  await props.myConvo.updateRead()
}

async function submitCallback () {
  if (easyFormState.text === "") {
    return
  }
  const text = easyFormState.text
  easyFormState.text = ""
  if (!await props.myConvo?.createMessage({
    type: "post",
    text,
    /* // TODO: 一時退避
    url: easyFormState.url,
    urlHasImage: easyFormState.urlHasImage,
    images: easyFormState.images,
    */
  })) {
    easyFormState.text = text
    return
  }
  // TODO: 一時退避
  // easyFormState.url = ""
  ;(popup.value as any)?.scrollToBottom("smooth")
}

function isMine (message: TIChatMessage): boolean {
  return message.sender.did === mainState.atp.data.did
}
</script>

<template>
  <Popup
    ref="popup"
    class="chat-convo-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="chat" />
        <span>{{ myConvo != null ? myConvo.getMemberNames().join(", ") : $t("chat") }}</span>
      </h2>
    </template>
    <template
      v-if="myConvo != null"
      #body
    >
      <div class="chat-convo-popup__messages">
        <div
          v-for="message, messageIndex of myConvo.messages"
          :key="messageIndex"
          class="chat-convo-popup__message"
          :data-is-mine="isMine(message)"
        >
          <ChatPost
            position="chatMessage"
            :myConvo="myConvo"
            :message="message"
            :isMine="isMine(message)"
          />
        </div>
      </div>
    </template>
    <template
      v-if="myConvo != null"
      #footer
    >
      <div class="chat-convo-popup__form-container">
        <EasyForm
          v-bind="easyFormProps"
          ref="easyForm"
        />
        <button
          type="button"
          class="button--important chat-convo-popup__submit-button"
          @click="submitCallback"
        >
          <SVGIcon name="chat" />
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.chat-convo-popup {
  &:deep() {
    .popup {
      flex-grow: 1;

      &-body {
        flex-grow: 1;
        grid-gap: 1px;
        padding: unset;
      }
    }
  }

  &__messages {
    display: grid;
  }

  &__message {
    max-width: 87.5%;
    &[data-is-mine="true"] {
      margin-left: auto;
    }
    &[data-is-mine="false"] {
      margin-right: auto;
    }
  }

  &__form-container {
    display: grid;
    grid-gap: 0.5rem;
    grid-template-columns: 1fr auto;
    padding: 1rem;
  }

  &__submit-button {
    --bg-color: 255, 255, 255;
    --notice-color: var(--accent-color);
    .svg-icon--chat {
      font-size: 1.5rem;
    }
  }
}
</style>
