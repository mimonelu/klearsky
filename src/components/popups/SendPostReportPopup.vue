<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/app-parts/Post.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"
import OPTIONS from "@/consts/options.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
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
  data: [
    {
      state: formState,
      model: "reasonType",
      label: $t("reportReasonType"),
      type: "radio",
      required: true,
      options: OPTIONS.POST_REPORT_REASON,
      layout: "vertical",
    },
    {
      state: formState,
      model: "reason",
      label: $t("reportReason"),
      type: "textarea",
      placeholder: $t("reportReasonDescription"),
      rows: 6,
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
    props.post.author?.did,
    props.post.cid,
    props.post.uri
  )
  state.popupLoaderDisplay = false
  if (response) {
    mainState.openMessagePopup($t("success"), $t("successMessage"))
    close()
  } else {
    mainState.openErrorPopup("errorApiFailed", "SendPostReportPopup/createReport")
  }
}
</script>

<template>
  <Popup
    class="send-post-report-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="contentFiltering" />
        <span>{{ $t("reportSendPost") }}</span>
      </h2>
    </template>
    <template #body>
      <Post
        position="preview"
        :post="post"
        :noLink="true"
        @keydown.prevent.stop
        @keyup.prevent.stop
      />
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-post-report-popup {
  &:deep() {
    .popup-header > h2 {
      color: rgb(var(--notice-color));

      & > .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }

  .post {
    --fg-color: var(--notice-color);
    background-color: rgb(var(--notice-color), 0.125);
    font-size: 0.875rem;
    opacity: 0.875;
    padding: 1rem;
    pointer-events: none;
  }
}
</style>
