<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
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
      hasSubmitButton: false,
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
          autocomplete: "off",
        },
        {
          type: "button",
          attrs: { "data-enabled": true },
          classes: "button--bordered--important",
          icon: "cross",
          index,
          async onClick (item: TTEasyFormItem) {
            if (item.index == null) return
            if (wordMute.keyword && !await mainState.openConfirmationPopup(
              $t("wordMuteRemoveConfirmation"),
              `${$t("wordMuteRemoveConfirmationMessage")}\n"${wordMute.keyword}"`
            )) return
            mainState.currentSetting.wordMute?.splice(item.index, 1)
          },
        },
      ]
    }).flat() ?? []
    return result
  }),
})

function close () {
  mainState.saveSettings()
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
</script>

<template>
  <Popup
    class="word-mute-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="wordMute" />
        <span>{{ $t("wordMute") }}</span>
      </h2>
    </template>
    <template #body>
      <slot name="header" />

      <!-- ワードミュート追加ボタン -->
      <button
        class="button--bordered"
        @click.stop="add"
      >
        <SVGIcon name="plus" />
        <span>{{ $t("wordMuteAdd") }}</span>
      </button>

      <!-- ワードミュートがないメッセージ -->
      <div
        v-if="!mainState.currentSetting.wordMute?.length"
        class="textlabel"
      >
        <div class="textlabel__text">{{ $t("wordMuteEmpty") }}</div>
      </div>

      <EasyForm
        v-else
        v-bind="state.easyFormProps"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.word-mute-popup {
  .popup-header > h2 {
    color: rgb(var(--notice-color));

    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
