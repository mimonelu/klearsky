<script lang="ts" setup>
import { inject, reactive } from "vue"
import Popup from "@/components/popups/Popup.vue"
import ReportForm from "@/components/forms/ReportForm.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  popupLoaderDisplay: boolean
}>({
  popupLoaderDisplay: false,
})

const formState = reactive<{
  reasonType?: string
  reasonItem?: string
  reason?: string
  atprotoLabeler?: string
  customAtprotoLabeler?: string
}>({
  reasonType: undefined,
  reasonItem: undefined,
  reason: undefined,
  atprotoLabeler: undefined,
  customAtprotoLabeler: undefined,
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
  if (!result) return

  if (state.popupLoaderDisplay) return
  state.popupLoaderDisplay = true
  const atprotoLabeler = formState.atprotoLabeler === "customAtprotoLabeler"
    ? formState.customAtprotoLabeler
    : formState.atprotoLabeler
  const response = await mainState.atp.createReport({
    reasonType: formState.reasonItem as string,
    reason: formState.reason as string,
    atprotoLabeler,
    did: props.user.did,
  })
  state.popupLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "SendAccountReportPopup/createReport")
    return
  }
  mainState.openMessagePopup({
    title: $t("success"),
    text: $t("successMessage"),
  })
  close()
}
</script>

<template>
  <Popup
    class="send-account-report-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="contentFiltering" />
        <span>{{ $t("reportSendAccount") }}</span>
      </h2>
    </template>
    <template #header-after>
      <UserBox
        :user="user"
        :menuDisplay="false"
        :contentWarningDisabled="true"
        :viewerDisplay="true"
        @keydown.prevent.stop
        @keyup.prevent.stop
      />
    </template>
    <template #body>
      <ReportForm
        :formState="formState"
        @submit="submitCallback"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-account-report-popup {
  &:deep() {
    .popup-header > h2 > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }

  .user-box {
    --fg-color: var(--notice-color);
    padding: 1rem;
    pointer-events: none;
  }
}
</style>
