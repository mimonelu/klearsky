<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/app-parts/Post.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import data from "@/consts/label-behaviors.json"
import DisplayName from "../app-parts/DisplayName.vue"

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
  await updateMessages()
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
    await updateMessages()
    updateTimer()
  }, 5000)
}

async function updateMessages () {
  if (props.myConvo == null) {
    return
  }

  // TODO: カーソルを指定すること
  await props.myConvo.updateMessages(30)

  ;(popup.value as any)?.scrollToBottom()

  // TODO: messageId を渡すこと
  await props.myConvo.updateRead()
}

async function submitCallback () {
  if (!await props.myConvo?.createMessage(easyFormState.text)) {
    return
  }
  easyFormState.text = ""
  ;(popup.value as any)?.scrollToBottom()
}

function makePost (myConvo: TIMyConvo, message: TIChatMessage): TTPost {
  const author = myConvo.findMember(message.sender.did) ?? {
    did: "",
    displayName: "",
    handle: "",
    viewer: { muted: false },
  }
  return {
    __custom: { unmask: false },
    author,
    cid: "",
    indexedAt: message.sentAt,
    record: {
      $type: "",
      createdAt: message.sentAt,
      embed: message.embed,
      facets: message.facets,
      text: message.text,
    },
    likeCount: 0,
    replyCount: 0,
    repostCount: 0,
    uri: "",
  }
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
          :data-is-mine="message.sender.did === mainState.atp.data.did"
        >
          <Post
            position="postInPost"
            :post="makePost(myConvo, message)"
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
    grid-gap: 0.5rem;
    padding: 1rem 1rem 0;
  }

  &__message {
    border-radius: var(--border-radius-large);
    position: relative;
    max-width: 87.5%;
    &[data-is-mine="true"] {
      background-color: var(--fg-color-0125);
      margin-left: auto;

      &::after {
        content: "";
        display: block;
        position: absolute;
        top: calc(50% - 0.5rem);
        right: calc(-1.5rem);
        @include triangle("right", 1rem, 1rem, var(--fg-color-0125));
      }
    }
    &[data-is-mine="false"] {
      background-color: var(--accent-color-025);
      margin-right: auto;

      &::after {
        content: "";
        display: block;
        position: absolute;
        top: calc(50% - 0.5rem);
        left: calc(-1.5rem);
        @include triangle("left", 1rem, 1rem, var(--accent-color-025));
      }
    }

    // TODO:
    pointer-events: none;
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
