<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  list?: TTList
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
}>({
  loaderDisplay: false,
})

const easyFormState = reactive<{
  avatar: null | File
  name: string
  description: string
}>({
  avatar: null,
  name: props.list?.name ?? "",
  description: props.list?.description ?? "",
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("save"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state,
      model: "avatar",
      label: $t("listAvatar"),
      type: "file",
      // accept: "image/png, image/jpeg",
      isMultipleFile: false,
      maxNumberOfFile: 1,
    },
    {
      state: easyFormState,
      model: "name",
      label: $t("listName"),
      type: "text",
      required: true,
      maxlength: 64,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: false,
      autocomplete: "off",
    },
    {
      state: easyFormState,
      model: "description",
      label: $t("listDescription"),
      type: "textarea",
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
  if (props.list == null) return
  state.loaderDisplay = true
  const result = await mainState.atp.updateList({
    ...props.list,
    name: easyFormState.name,
    description: easyFormState.description,
  })
  state.loaderDisplay = false
  if (result instanceof Error) {
    mainState.openErrorPopup("errorApiFailed", "ListEditPopup/updateList")
  } else {
    props.list.name = easyFormState.name
    props.list.description = easyFormState.description
    close()
  }
}
</script>

<template>
  <Popup
    class="list-edit-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="list" />
        <span>{{ $t("listEdit") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.list-edit-popup {
  //
}
</style>
