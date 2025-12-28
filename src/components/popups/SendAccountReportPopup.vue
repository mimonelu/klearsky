<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"
import OPTIONS from "@/consts/options.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser
}>()

const easyForm = ref()

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
}>({
  reasonType: undefined,
  reasonItem: undefined,
  reason: undefined,
  atprotoLabeler: undefined,
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
      options: OPTIONS.REPORT_REASON_TYPES,
      layout: "vertical",

      // レポートタイプ選択時にレポートアイテムの選択肢を変更
      onUpdate (_, form) {
        const items = OPTIONS.REPORT_REASON_ITEMS.filter((item) => {
          return item.type === formState.reasonType
        })
        form.data[1].options?.splice(0, form.data[1].options.length, ...items)
        form.data[1].display = true
        formState.reasonItem = items.length === 1
          ? items[0].value
          : undefined
        easyForm.value.forceUpdate()
      },
    },
    {
      state: formState,
      model: "reasonItem",
      label: $t("reportReasonItem"),
      type: "radio",
      required: true,
      options: [],
      display: false,
      layout: "vertical",
    },
    {
      state: formState,
      model: "atprotoLabeler",
      label: $t("labeler"),
      type: "radio",
      required: true,
      options: mainState.myLabeler?.labelers?.map((labeler): TTOption => {
        return {
          label: labeler.creator.displayName || labeler.creator.handle,
          value: labeler.creator.did === CONSTS.OFFICIAL_LABELER_DID
            ? undefined
            : labeler.creator.did,
        }
      }) ?? [],
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
      autoResizeTextarea: true,
    },
  ],
}

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
  const response = await mainState.atp.createReport({
    reasonType: formState.reasonItem as string,
    reason: formState.reason as string,
    atprotoLabeler: formState.atprotoLabeler,
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
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      >
        <template #free-2>
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
    .popup-header > h2 > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }

  .user-box {
    --fg-color: var(--notice-color);
    padding: 1rem;
    pointer-events: none;
  }

  &__link-container {
    text-align: right;
  }
}
</style>
