<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { inject, ref } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import CONSTS from "@/consts/consts.json"
import OPTIONS from "@/consts/options.json"

const props = defineProps<{
  formState: {
    reasonType?: string
    reasonItem?: string
    reason?: string
    atprotoLabeler?: string
    customAtprotoLabeler?: string
  }
}>()

const emit = defineEmits<{
  submit: []
}>()

const easyForm = ref()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback: () => emit("submit"),
  blurOnSubmit: true,
  data: [
    {
      state: props.formState,
      model: "reasonType",
      label: $t("reportReasonType"),
      type: "radio",
      required: true,
      options: OPTIONS.REPORT_REASON_TYPES,
      layout: "vertical",

      // レポートタイプ選択時にレポートアイテムの選択肢を変更
      onUpdate (_, form) {
        const items = OPTIONS.REPORT_REASON_ITEMS.filter((item) => {
          return item.type === props.formState.reasonType
        })
        form.data[1].options?.splice(0, form.data[1].options.length, ...items)
        form.data[1].display = true
        props.formState.reasonItem = items.length === 1
          ? items[0].value
          : undefined
        easyForm.value.forceUpdate()
      },
    },
    {
      state: props.formState,
      model: "reasonItem",
      label: $t("reportReasonItem"),
      type: "radio",
      required: true,
      options: [],
      display: false,
      layout: "vertical",
    },
    {
      state: props.formState,
      model: "atprotoLabeler",
      label: $t("labeler"),
      type: "radio",
      required: true,
      options: [
        ...mainState.myLabeler?.labelers?.map((labeler): TTOption => {
          return {
            label: labeler.creator.displayName || labeler.creator.handle,
            value: labeler.creator.did === CONSTS.OFFICIAL_LABELER_DID
              ? undefined
              : labeler.creator.did,
          }
        }) ?? [],
        {
          label: $t("reportCustomAtprotoLabeler"),
          value: "customAtprotoLabeler",
        },
      ],
      layout: "vertical",

      // カスタムラベラー選択時にカスタムラベラー入力欄の表示状態を設定
      onUpdate (_, form) {
        form.data[3].display = props.formState.atprotoLabeler === "customAtprotoLabeler"
        if (!form.data[3].display) {
          props.formState.customAtprotoLabeler = undefined
        }
        easyForm.value.forceUpdate()
      },
    },
    {
      state: props.formState,
      model: "customAtprotoLabeler",
      label: $t("reportCustomAtprotoLabeler"),
      type: "text",
      placeholder: $t("reportCustomAtprotoLabelerPlaceholder"),
      display: false,
    },
    {
      state: props.formState,
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

defineExpose({
  easyForm,
})
</script>

<template>
  <EasyForm
    v-bind="easyFormProps"
    ref="easyForm"
  >
    <template #free-2>
      <div class="report-form__link-container">
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

<style lang="scss" scoped>
.report-form {
  &__link-container {
    text-align: right;
  }
}
</style>
