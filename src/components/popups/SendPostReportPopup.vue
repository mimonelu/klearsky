<script lang="ts" setup>
import { inject, reactive } from "vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/compositions/Post.vue"
import ReportForm, { type TTReportFormState } from "@/components/forms/ReportForm.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

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

const formState = reactive<TTReportFormState>({
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
    did: props.post.author?.did,
    cid: props.post.cid,
    uri: props.post.uri,
  })
  state.popupLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "SendPostReportPopup/createReport")
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
    <template #header-after>
      <Post
        position="preview"
        :post="post"
        :noLink="true"
        :forceHideQuoteRepost="true"
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
.send-post-report-popup {
  &:deep() {
    .popup-header > h2 > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }

  .post {
    --fg-color: var(--notice-color);
    padding: 1rem;
    pointer-events: none;

    &:deep() {
      .html-text {
        @include line-clamp(3);
        white-space: wrap;
      }
    }
  }
}
</style>
