<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
import ListCard from "@/components/cards/ListCard.vue"
import Popup from "@/components/popups/Popup.vue"
import ReportForm, { type TTReportFormState } from "@/components/next/Report/ReportForm.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  list: TTList
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
    cid: props.list.cid,
    uri: props.list.uri,
    type: "list",
  })
  state.popupLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "SendListReportPopup/createReport")
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
    class="send-list-report-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="contentFiltering" />
        <span>{{ $t("reportSendList") }}</span>
      </h2>
    </template>
    <template #header-after>
      <ListCard
        :list="list"
        :menuDisplay="false"
        :detailDisplay="false"
        :orderButtonDisplay="false"
        @keydown.prevent.stop
        @keyup.prevent.stop
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
.send-list-report-popup {
  &:deep() {
    .popup-header > h2 > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }

  .list-card {
    --fg-color: var(--notice-color);
    --accent-color: var(--notice-color);
    pointer-events: none;
  }
}
</style>
