<script lang="ts" setup>
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import LABELS from "@/consts/labels.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  state: any
  property: string
}>()

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  data: [
    {
      state: props.state,
      model: props.property,
      type: "checkbox",
      classes: "checkboxes-is-wide",
      options: LABELS.POST_LABELS,
      onUpdate () {
        emit("change")
      },
    },
  ],
}

function close () {
  emit("close")
}
</script>

<template>
  <div>
    <Popup
      class="select-labels-popup"
      :hasCloseButton="true"
      @close="close"
    >
      <template #header>
        <h2>
          <SVGIcon name="contentFiltering" />
          <span>{{ $t("selectLabels") }}</span>
        </h2>
      </template>
      <template #body>
        <EasyForm v-bind="easyFormProps" />
      </template>
    </Popup>
  </div>
</template>

<style lang="scss" scoped>
.select-labels-popup:deep() {
  .popup {
    width: calc($router-view-width - 4rem);
  }

  .popup-header > h2 {
    color: rgb(var(--notice-color));

    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }

  .popup-body {
    padding: 0;
  }

  .checkbox:first-child {
    border-top-style: none;
  }
  .checkbox:last-child {
    border-bottom-style: none;
  }
}
</style>
