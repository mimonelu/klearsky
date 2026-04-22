<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
import ChatPost from "@/components/next/Chat/ChatPost.vue"
import Popup from "@/components/popups/Popup.vue"
import ReportForm, { type TTReportFormState } from "@/components/next/Report/ReportForm.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  myConvo?: TIMyConvo
  message?: TIChatMessage
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  popupLoaderDisplay: boolean
}>({
  popupLoaderDisplay: false,
})

const formState = reactive<TTReportFormState>({
  reasonType: undefined,
  reasonItem: undefined,
  reason: undefined,
  atprotoLabeler: undefined,
  customAtprotoLabeler: undefined,
})

const reportForm = ref<InstanceType<typeof ReportForm>>()

function close () {
  emit("close")
}

async function submitCallback () {
  Util.blurElement()

  // 送信確認
  const result = await mainState.openConfirmationPopup({
    title: $t("reportSendConfirmation"),
    text: $t("reportSendConfirmationMessage"),
  })
  if (!result) {
    return
  }

  if (
    state.popupLoaderDisplay ||
    reportForm.value == null
  ) {
    return
  }
  state.popupLoaderDisplay = true
  const response = await reportForm.value.createReport({
    did: props.message?.sender.did,
    convoId: props.myConvo?.data?.id,
    messageId: props.message?.id,
  })
  state.popupLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "SendChatMessageReportPopup/createReport")
    return
  }

  // 送信完了
  mainState.openMessagePopup({
    title: $t("success"),
    text: $t("successMessage"),
  })

  close()
}
</script>

<template>
  <Popup
    class="send-chat-message-report-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="contentFiltering" />
        <span>{{ $t("reportSendChatMessage") }}</span>
      </h2>
    </template>
    <template #header-after>
      <ChatPost
        v-if="myConvo != null && message != null"
        position="preview"
        :myConvo="myConvo"
        :message="message"
        :isMine="false"
      />
    </template>
    <template #body>
      <ReportForm
        ref="reportForm"
        :formState="formState"
        @submit="submitCallback"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-chat-message-report-popup {
  &:deep() {
    .popup-header > h2 > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }

  .chat-post {
    --fg-color: var(--notice-color);
    padding: 1rem;
    pointer-events: none;
  }
}
</style>
