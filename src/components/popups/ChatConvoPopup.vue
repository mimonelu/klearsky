<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import ChatPost from "@/components/app-parts/ChatPost.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  myConvo?: TIMyConvo
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormState = reactive<{
  text: string
}>({
  text: "",
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
      placeholder: $t("text"),
      maxlength: 300,
      maxLengthIndicator: false,
      maxLengthIndicatorByGrapheme: false,
      rows: 2,
      hasMentionSuggestion: true,
      focus: false,
    },
  ],
}

const popup = ref(null)

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

function close () {
  emit("close")
}

function updateTimer () {
  if (unmounted) {
    return
  }
  timer = setTimeout(async () => {
    await updateMessagesOnTick()
    updateTimer()
  }, 10000)
}

async function updateMessagesOnMounted () {
  if (props.myConvo == null) {
    return
  }
  await props.myConvo.updateMessages(100)
  ;(popup.value as any)?.scrollToBottom("smooth")
  await updateRead()
}

async function updateMessagesOnTick () {
  if (props.myConvo == null) {
    return
  }
  const diff = (popup.value as any).diffScrollBottom()

  // 通信量削減のため、通常は1つのみ取得し、段階的に取得数を増やしている
  const numberOfNewMessages = await props.myConvo.updateMessages(1)
  if (numberOfNewMessages >= 1) {
    const numberOfNewMessages = await props.myConvo.updateMessages(10)
    if (numberOfNewMessages >= 10) {
      await props.myConvo.updateMessages(100)
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
  const lastMessageId = props.myConvo.messages.at(- 1)?.id
  await props.myConvo.updateRead(lastMessageId)
}

async function submitCallback () {
  if (!await props.myConvo?.createMessage({
    text: easyFormState.text,
  })) {
    return
  }
  easyFormState.text = ""
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
        <EasyForm v-bind="easyFormProps" />
        <button
          type="button"
          class="button--plane"
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
    display: flex;
    padding: 1rem 0 1rem 1rem;

    .easy-form {
      flex-grow: 1;
    }

    .button--plane {
      .svg-icon--chat {
        font-size: 2rem;
      }
    }
  }
}
</style>
