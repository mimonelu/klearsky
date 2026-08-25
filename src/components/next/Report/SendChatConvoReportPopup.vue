<script lang="ts" setup>
import { computed, inject, reactive, ref } from "vue"
import ChatConvoCard from "@/components/next/Chat/ChatConvoCard.vue"
import Popup from "@/components/popups/Popup.vue"
import ReportForm, { type TTReportFormState } from "@/components/next/Report/ReportForm.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  myConvo?: TIMyConvo
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

const repMember = computed((): undefined | TTUser => {
  const members = props.myConvo?.data?.members ?? []
  if (props.myConvo?.data?.kind.$type === "chat.bsky.convo.defs#directConvo") {
    return members.find((member) => member.did !== mainState.atp.data.did)
  } else if (props.myConvo?.data?.kind.$type === "chat.bsky.convo.defs#groupConvo") {
    return members[0]
  }
  return undefined
})

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
    did: repMember.value?.did,
    convoId: props.myConvo?.data?.id,
  })
  state.popupLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "SendChatConvoReportPopup/createReport")
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
    class="send-chat-convo-report-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="contentFiltering" />
        <span>{{ $t("reportSendChatConvo") }}</span>
      </h2>
    </template>
    <template #header-after>
      <ChatConvoCard
        v-if="myConvo != null"
        :myConvo="myConvo"
        :repMember="repMember"
        :menuDisplay="false"
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
.send-chat-convo-report-popup {
  &:deep() {
    .popup-header > h2 > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }

  .convo-card {
    --fg-color: var(--notice-color);
    padding-right: 1rem;
    pointer-events: none;
  }
}
</style>
