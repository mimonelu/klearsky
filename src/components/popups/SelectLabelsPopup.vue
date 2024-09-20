<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import LABEL_BEHAVIORS from "@/consts/label-behaviors.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  state: any
}>()

const options = Object.keys(LABEL_BEHAVIORS)
  .filter((key: string) => {
    return LABEL_BEHAVIORS[key].selectable
  })
  .map((key: string) => {
    return {
      label: key,
      value: key,
    }
  })

const $t = inject("$t") as Function

const state = reactive<{
  customLabels: string
}>({
  customLabels: ((): string => {
    return props.state.labels.filter((label: string) => {
      return !options.find((option: TTOption) => option.value === label)
    }).join(", ")
  })()
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  data: [
    {
      state: props.state,
      model: "labels",
      type: "checkbox",
      options,
      onUpdate () {
        emit("change")
      },
    },
    {
      state,
      model: "customLabels",
      type: "text",
      placeholder: `${$t("customLabels")}, ...`,
      onInput () {
        const customLabels = state.customLabels
          .split(",")
          .map((label: string) => label.trim())
          .filter(Boolean)
        props.state.labels = props.state.labels
          .filter((label: string) => {
            return options.find((option: TTOption) => option.value === label)
          })
          .concat(...customLabels)
      },
    },
  ],
}

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="select-labels-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="label" />
        <span>{{ $t("selectLabels") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.select-labels-popup:deep() {
  .popup-header > h2 > .svg-icon {
    fill: rgb(var(--label-color));
  }

  .popup-body {
    padding: 1rem;
  }
}
</style>
