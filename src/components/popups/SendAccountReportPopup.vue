<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"
import OPTIONS from "@/consts/options.json"

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
  reason?: string
}>({
  reasonType: undefined,
  reason: undefined,
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state: formState,
      model: "reasonType",
      label: $t("reportReasonType"),
      type: "radio",
      required: true,
      options: OPTIONS.ACCOUNT_REPORT_REASON,
      layout: "vertical",
    },
    {
      state: formState,
      model: "reason",
      label: $t("reportReason"),
      type: "textarea",
      placeholder: $t("reportReasonDescription"),
      rows: 6,
      maxlength: 300,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
    },
  ],
}

function close () {
  emit("close")
}

async function submitCallback () {
  Util.blurElement()

  // 送信確認
  const result = await mainState.openConfirmationPopup(
    $t("reportSendConfirmation"),
    $t("reportSendConfirmationMessage")
  )
  if (!result) return

  if (state.popupLoaderDisplay) return
  state.popupLoaderDisplay = true
  const response = await mainState.atp.createReport(
    formState.reasonType as string,
    formState.reason as string,
    props.user.did
  )
  state.popupLoaderDisplay = false
  if (response) {
    mainState.openMessagePopup({
      title: $t("success"),
      text: $t("successMessage"),
    })
    close()
  } else {
    mainState.openErrorPopup("errorApiFailed", "SendAccountReportPopup/createReport")
  }
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
    <template #body>
      <UserBox
        :user="user"
        :menuDisplay="false"
        :contentWarningDisabled="true"
        :viewerDisplay="true"
        @keydown.prevent.stop
        @keyup.prevent.stop
      />
      <EasyForm v-bind="easyFormProps">
        <template #free-1>
          <div class="send-account-report-popup__link-container">
            <a
              class="textlink--icon"
              href="https://bsky.social/about/support/copyright"
              rel="noreferrer"
              target="_blank"
            >
              <SVGIcon name="cursorRight" />
              <span>{{ $t("reportCopyrightViolation") }}</span>
            </a>
          </div>
        </template>
      </EasyForm>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-account-report-popup {
  &:deep() {
    .popup-header > h2 {
      color: rgb(var(--notice-color));

      & > .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }

  .user-box {
    --fg-color: var(--notice-color);
    background-color: rgb(var(--notice-color), 0.125);
    font-size: 0.875rem;
    opacity: 0.875;
    padding: 1rem;
    pointer-events: none;
  }

  &__link-container {
    text-align: right;
  }
}
</style>
