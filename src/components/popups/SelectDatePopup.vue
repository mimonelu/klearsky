<script lang="ts" setup>
import { inject, reactive } from "vue"
import format from "date-fns/format"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string, params: any): void}>()

const props = defineProps<{
  date?: string
  textTitle?: string
  textDescription?: string
  textReset?: string
  textResetDescription?: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  date?: string
}>({
  date: props.date != null
    ? format(new Date(props.date), "yyyy-MM-dd HH:mm:ss")
    : props.date,
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  data: [
    {
      state: state,
      model: "date",
      type: "datetime-local",
      onInput () {
        emit("onChange", state.date)
      },
    },
  ],
}

function close () {
  emit("close", undefined)
}

async function reset () {
  if (!await mainState.openConfirmationPopup(
    $t(props.textReset),
    $t(props.textResetDescription)
  )) return
  state.date = undefined
  emit("onChange", state.date)
}
</script>

<template>
  <Popup
    class="select-date-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="history" />
        <span>{{ $t(textTitle) }}</span>
      </h2>
    </template>
    <template #body>
      <p>{{ $t(textDescription) }}</p>
      <EasyForm v-bind="easyFormProps" />
      <button
        class="button--bordered"
        :disabled="state.date == null"
        @click.prevent="reset"
      >
        <span>{{ $t(textReset) }}</span>
      </button>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.select-date-popup {
  .button--bordered {
    margin: 0 auto;
    width: max-content;
  }
}
</style>
