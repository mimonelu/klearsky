<script lang="ts" setup>
import { reactive } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import HtmlPopup from "@/components/popups/HtmlPopup.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import LANGUAGES from "@/consts/languages"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  state: any
  property: string
  title: string
  limit?: number
}>()

const state = reactive<{
  htmlPopupDisplay: boolean
}>({
  htmlPopupDisplay: false,
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  data: [
    {
      state: props.state,
      model: props.property,
      type: "checkbox",
      classes: "checkboxes-is-wide",
      options: LANGUAGES,
      limit: props.limit,
      layout: "vertical-2columns",
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
      class="select-languages-popup"
      :hasCloseButton="true"
      @close="close"
    >
      <template #header>
        <button @click.stop="state.htmlPopupDisplay = true">
          <SVGIcon name="help" />
        </button>
        <h2>
          <SVGIcon name="translate" />
          <span>{{ $t(title) }}</span>
        </h2>
      </template>
      <template #body>
        <EasyForm v-bind="easyFormProps" />
      </template>
    </Popup>

    <!-- 説明用HTMLポップアップ -->
    <HtmlPopup
      v-if="state.htmlPopupDisplay"
      :title="`${$t('help')} - ${$t(title)}`"
      @close="state.htmlPopupDisplay = false"
    >
      <slot name="html-popup-content" />
    </HtmlPopup>
  </div>
</template>

<style lang="scss" scoped>
.select-languages-popup:deep() {
  .popup-body {
    grid-gap: 1.5rem;
    padding: 0;

    p {
      font-size: 0.875rem;
      margin: 0 1.5rem;
    }
  }

  .checkbox {
    min-height: unset !important;

    &:first-child,
    &:nth-child(2) {
      border-top-style: none;
    }
  }

  .svg-icon--help {
    font-size: 1.25rem;
  }
}
</style>
