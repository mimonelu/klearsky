<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  easyFormProps: ComputedRef<TTEasyForm>
}>({
  easyFormProps: computed((): TTEasyForm => {
    const result: TTEasyForm = {
      gridColumns: "auto 1fr auto",
      hasSubmitButton: true,
      submitButtonLabel: $t("save"),
      submitCallback: onSubmit,
      data: [],
    }
    result.data = mainState.currentSetting.wordMute?.map((wordMute: TTWordMute, index: number) => {
      return [
        {
          state: wordMute,
          model: "enabled",
          type: "checkbox",
          options: [{ label: $t("wordMuteEnabled"), value: true }],
        },
        {
          state: wordMute,
          model: "keyword",
          type: "text",
          placeholder: $t("wordMutePlaceholder"),
        },
        {
          type: "button",
          icon: "cross",
          index,
          onClick (item: TTEasyFormItem) {
            if (item.index != null) mainState.currentSetting.wordMute?.splice(item.index, 1)
          },
        },
      ]
    }).flat() ?? []
    return result
  }),
})

function close () {
  emit("close")
}

function add () {
  Util.blurElement()
  if (mainState.currentSetting.wordMute == null) return
  mainState.currentSetting.wordMute.push({
    enabled: [true],
    keyword: "",
  })
}

function onSubmit () {
  mainState.saveSettings()
  close()
}
</script>

<template>
  <Popup
    class="word-mute-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="alphabeticalOff" />
        <span>{{ $t("wordMute") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <slot name="header" />
      <button
        class="button--bordered"
        @click.stop="add"
      >
        <span>{{ $t("wordMuteAdd") }}</span>
      </button>
      <EasyForm v-bind="state.easyFormProps" />
    </template>
  </Popup>
</template>
