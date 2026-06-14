<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import ChatPost from "@/components/next/Chat/ChatPost.vue"
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
      autoResizeTextarea: false,
      onFocus (item: TTEasyFormItem) {
        item.rows = 3

        // TODO: 要修正
        easyForm.value?.forceUpdate()
        scrollToBottom()
      },
      onBlur (item: TTEasyFormItem) {
        // ラグを挟むことで送信ボタンを押し損ねる事態を防ぐ
        setTimeout(() => {
          item.rows = 1

          // TODO: 要修正
          easyForm.value?.forceUpdate()
        }, 250)
      },
    },
    {
      state: easyFormState,
      model: "url",
      type: "text",
      parentClasses: "group-parts",
      placeholder: $t("chatUrlPlaceholder"),
      autocomplete: "url",
      inputmode: "url",
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

const headerLabel = computed((): string => {
  const result = props.myConvo?.data?.kind.$type === "chat.bsky.convo.defs#directConvo"
    ? props.myConvo?.getMemberNames().join(", ")
    : props.myConvo?.data?.kind.$type === "chat.bsky.convo.defs#groupConvo"
      ? props.myConvo?.data?.kind.name
      : $t("chat")
  return result || $t("chat")
})

const memberDisplayNameByDid = computed((): (did: string | undefined) => string => {
  return (did: undefined | string): string => {
    if (did == null) {
      return ""
    }
    return props.myConvo?.findMember(did)?.displayName || did || ""
  }
})

const popup = ref<InstanceType<typeof Popup>>()

const easyForm = ref<InstanceType<typeof EasyForm>>()

let timer: undefined | number

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
  easyForm.value?.forceUpdate()
}

function onClickClearButton () {
  Util.blurElement()
  easyFormState.url = ""
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
  const hasNew = await props.myConvo.checkNewMessages()
  if (!hasNew) {
    return
  }
  const diff = popup.value?.scrollObserver?.diffScrollBottom()

  // TODO:
  // 通信量削減のため、通常は1つのみ取得し、段階的に取得数を増やしている
  const numberOfNewMessages = await props.myConvo.updateMessages(3)
  if (numberOfNewMessages >= 3) {
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
  if (popup.value == null) {
    return
  }
  await nextTick()
  popup.value?.scrollToBottom("smooth")
}

function isMine (message: TIChatMessage): boolean {
  return message.sender?.did === mainState.atp.data.did
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
        <span translate="no">{{ headerLabel }}</span>
      </h2>
    </template>
    <template
      v-if="myConvo != null"
      #body
    >
      <div class="chat-convo-popup__messages">
        <template
          v-for="message, messageIndex of myConvo.messages"
          :key="messageIndex"
        >
          <!-- ポストメッセージ -->
          <div
            v-if="
              message.$type === 'chat.bsky.convo.defs#messageView' || (
                // 送信直後のポストメッセージが不完全な形式で渡ってくる対策
                message.text != null && message.data == null
              )
            "
            class="chat-convo-popup__chat-message"
            :data-is-mine="isMine(message)"
          >
            <ChatPost
              position="chatMessage"
              :myConvo="myConvo"
              :message="message"
              :isMine="isMine(message)"
            />
          </div>

          <!-- システムメッセージ -->
          <template v-else-if="message.data != null">
            <!-- システムメッセージ - グループの設定変更 - 名称変更 -->
            <div
              v-if="
                message.data.$type === 'chat.bsky.convo.defs#systemMessageDataEditGroup' &&
                message.data.newName != null
              "
              class="chat-convo-popup__system-message"
            >
              <span>{{ $t("chatSystemMessageGroupNameChanged") }}</span>
              <span>{{ message.data.newName }}</span>
            </div>

            <!-- システムメッセージ - メンバーの入室 -->
            <div
              v-else-if="message.data.$type === 'chat.bsky.convo.defs#systemMessageDataAddMember'"
              class="chat-convo-popup__system-message--positive"
            >
              <span>{{ $t("chatSystemMessageMemberJoined") }}</span>
              <span>{{ memberDisplayNameByDid(message.data.member?.did) }}</span>
            </div>

            <!-- システムメッセージ - メンバーの退室 -->
            <div
              v-else-if="message.data.$type === 'chat.bsky.convo.defs#systemMessageDataMemberLeave'"
              class="chat-convo-popup__system-message"
            >
              <span>{{ $t("chatSystemMessageMemberLeft") }}</span>
              <span>{{ memberDisplayNameByDid(message.data.member?.did) }}</span>
            </div>

            <!-- システムメッセージ - チャットのロック -->
            <div
              v-else-if="message.data.$type === 'chat.bsky.convo.defs#systemMessageDataLockConvo'"
              class="chat-convo-popup__system-message--important"
            >
              <span>{{ $t("chatSystemMessageLocked") }}</span>
            </div>

            <!-- システムメッセージ - チャットの永続ロック -->
            <div
              v-else-if="message.data.$type === 'chat.bsky.convo.defs#systemMessageDataLockConvoPermanently'"
              class="chat-convo-popup__system-message--important"
            >
              <span>{{ $t("chatSystemMessageLockedPermanently") }}</span>
            </div>

            <!-- システムメッセージ - チャットのアンロック -->
            <div
              v-else-if="message.data.$type === 'chat.bsky.convo.defs#systemMessageDataUnlockConvo'"
              class="chat-convo-popup__system-message--important"
            >
              <span>{{ $t("chatSystemMessageUnlocked") }}</span>
            </div>

            <!-- システムメッセージ - 不明なシステムメッセージ -->
            <div
              v-else
              class="chat-convo-popup__system-message"
            >
              <span>{{ $t("chatSystemMessageUnknownSystem") }}</span>
            </div>
          </template>

          <!-- 不明なメッセージ -->
          <div
            v-else
            class="chat-convo-popup__system-message"
          >
            <span>{{ $t("chatSystemMessageUnknown") }}</span>
          </div>
        </template>
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
          <template #item-content-after-1>
            <!-- クリアボタン -->
            <button
              type="button"
              class="button--bordered"
              @click.prevent="onClickClearButton"
            >
              <SVGIcon name="cross" />
            </button>
          </template>
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
      margin-right: -0.5rem;

      &__body {
        display: contents;

        // メッセージテキストエリアを最大幅にする
        & > dl:nth-child(1) {
          grid-column: 2 span;
        }
      }

      // クリアボタン
      dl[data-name="url"] dd {
        display: flex;
        flex-direction: row;
      }
    }

    .mention-suggestion-list__suggestion {
      margin-top: 0.5rem;
    }
  }

  &__messages {
    display: grid;
    grid-gap: 1rem;
  }

  &__chat-message {
    max-width: 87.5%;
    &[data-is-mine="true"] {
      margin-left: auto;
    }
    &[data-is-mine="false"] {
      margin-right: auto;
    }
  }

  &__system-message,
  &__system-message--positive,
  &__system-message--important {
    --alpha: 0.5;
    display: flex;
    flex-wrap: wrap;
    grid-gap: 0.25rem;
    justify-content: center;
    overflow: hidden;
    padding: 0 1rem;

    & > span {
      color: rgb(var(--fg-color), var(--alpha));
      font-size: 0.875rem;
      line-height: var(--line-height-middle);
      word-break: break-word;
    }
  }
  &__system-message--positive {
    --fg-color: var(--green-color);
    --alpha: 1.0;
  }
  &__system-message--important {
    --alpha: 1.0;
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
