<script lang="ts" setup>
import { inject, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import ChatPost from "@/components/compositions/ChatPost.vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  myConvo?: TIMyConvo
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormState = reactive<{
  text: string
  url: string
  /* // TODO: 一時退避
  urlHasImage: Array<boolean>
  medias: Array<File>
  alts: Array<string>
  */
}>({
  text: "",
  url: "",
  /* // TODO: 一時退避
  urlHasImage: [true],
  medias: [],
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
        scrollToBottom()
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
    {
      state: easyFormState,
      model: "url",
      type: "text",
      placeholder: $t("chatUrlPlaceholder"),
      autocomplete: "url",
      inputmode: "url",
      clearButton: true,
      onInput: onInputUrl,
    },
    /* // TODO: 一時退避
    {
      state: easyFormState,
      model: "urlHasImage",
      type: "checkbox",
      options: [{ label: $t("urlHasImage"), value: true }],
      display: false,
    },
    {
      state: easyFormState,
      model: "medias",
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

function onInputUrl () {
  /* // TODO: 一時退避
  // リンクカードの画像添付チェックボックスの出し分け
  const urlHasImageItem = easyFormProps.data.find((item: TTEasyFormItem) => {
    return item.model === "urlHasImage"
  })
  if (urlHasImageItem == null) {
    return
  }
  urlHasImageItem.display = !!easyFormState.url // TODO: && easyFormState.medias.length === 0
  */

  // TODO: 要修正
  ;(easyForm.value as any)?.forceUpdate()
}

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
  }, 5000)
}

async function updateMessagesOnMounted () {
  if (props.myConvo == null) {
    return
  }
  // TODO:
  await props.myConvo.updateMessages(100)
  scrollToBottom()
  await updateRead()
}

async function updateMessagesOnTick () {
  if (props.myConvo == null) {
    return
  }
  const diff = (popup as any)?.value?.scrollObserver?.diffScrollBottom()

  // TODO:
  // 通信量削減のため、通常は1つのみ取得し、段階的に取得数を増やしている
  const numberOfNewMessages = await props.myConvo.updateMessages(1)
  if (numberOfNewMessages >= 1) {
    const numberOfNewMessages = await props.myConvo.updateMessages(10)
    if (numberOfNewMessages >= 10) {
      await props.myConvo.updateMessages(30)
    }
  }

  if (diff <= 8) {
    scrollToBottom()
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
  // メッセージが空でURLも空であればキャンセル
  if (easyFormState.text === "" &&
      easyFormState.url === ""
  ) {
    return
  }

  // URL がポストの AT URI でなければキャンセル
  if (easyFormState.url !== "" && !Util.isPostAtUri(easyFormState.url)) {
    mainState.openMessagePopup({
      title: $t("error"),
      text: $t("chatUrlNotification"),
    })
    return
  }

  const text = easyFormState.text
  const url = easyFormState.url
  easyFormState.text = ""
  easyFormState.url = ""
  if (!await props.myConvo?.createMessage({
    type: "post",
    text,
    url,

    // TODO: 一時退避
    // urlHasImage: easyFormState.urlHasImage,
    // medias: easyFormState.medias,

    lightning: mainState.currentSetting.lightning,
  })) {
    easyFormState.text = text
    easyFormState.url = url
    mainState.openErrorPopup(
      "errorApiFailed",
      "ChatCOnvoPopup/submitCallback"
    )
    return
  }
  easyFormState.url = ""
  scrollToBottom()
}

async function scrollToBottom () {
  const value = popup.value as any
  if (value == null) {
    return
  }
  await nextTick()
  value?.scrollToBottom("smooth")
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
        >
          <template #after>
            <button
              type="button"
              class="button chat-convo-popup__submit-button"
              @click="submitCallback"
            >
              <SVGIcon name="chat" />
            </button>
          </template>
        </EasyForm>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.chat-convo-popup {
  &:deep() {
    .popup {
      flex-grow: 1;

      &-header > h2 > .svg-icon {
        fill: rgb(var(--post-color));
      }

      &-body {
        flex-grow: 1;
        grid-gap: 1px;
        padding: 1rem 0;
      }
    }

    .easy-form {
      display: grid;
      grid-gap: 0.5rem;
      grid-template-columns: 1fr auto;

      &__body {
        display: contents;

        // メッセージテキストエリアを最大幅にする
        & > dl:nth-child(1) {
          grid-column: 2 span;
        }
      }
    }

    .mention-suggestion-list__suggestion {
      margin-top: 0.5rem;
    }
  }

  &__messages {
    display: grid;
    grid-gap: 0.5rem;
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
    --fg-color: var(--accent-color);
    .svg-icon--chat {
      font-size: 1.5rem;
    }
  }
}
</style>
