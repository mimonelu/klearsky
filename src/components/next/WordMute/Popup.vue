<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
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
    result.data = mainState.currentSetting.wordMute?.map((wordMute, index): Array<TTEasyFormItem> => {
      // 新規追加プロパティの初期化
      if (wordMute.targets == null) {
        wordMute.targets = ["content", "tag"]
      }
      if (wordMute.actorTarget == null) {
        wordMute.actorTarget = ["exclude-following"]
      }

      return [
        {
          state: wordMute,
          model: "keyword",
          type: "text",
          placeholder: $t("wordMutePlaceholder"),
          autocomplete: "off",
        },
        {
          state: wordMute,
          model: "enabled",
          type: "checkbox",
          options: [{ label: $t("wordMuteEnabled"), value: true }],
        },
        {
          type: "space",
        },
        {
          type: "button",
          name: "deleteButton",
          attrs: { "data-enabled": true },
          classes: "button--important",
          icon: "cross",
          buttonLabel: $t("delete"),
          index,
          async onClick (item: TTEasyFormItem) {
            if (item.index == null) return
            if (wordMute.keyword && !await mainState.openConfirmationPopup({
              title: $t("wordMuteRemoveConfirmation"),
              text: `${$t("wordMuteRemoveConfirmationMessage")}\n"${wordMute.keyword}"`,
            })) return
            mainState.currentSetting.wordMute?.splice(item.index, 1)
          },
        },
        {
          state: wordMute,
          model: "targets",
          type: "checkbox",
          layout: "horizontal",
          options: [
            { label: $t("本文"), value: "content" },
            { label: $t("タグ"), value: "tag" },
            { label: $t("URL"), value: "url" },
          ],
        },
        {
          state: wordMute,
          model: "actorTarget",
          type: "checkbox",
          options: [
            { label: $t("フォロー中のユーザーを除く"), value: "exclude-following" },
          ],
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
  if (mainState.currentSetting.wordMute == null) {
    return
  }
  mainState.currentSetting.wordMute.unshift({
    enabled: [true],
    keyword: "",
    targets: ["content", "tag"],
    actorTarget: ["exclude-following"],
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
      <!-- ワードミュート追加ボタン -->
      <button @click.stop="add">
        <SVGIcon name="plus" />
      </button>

      <h2>
        <SVGIcon name="wordMute" />
        <span>{{ $t("wordMute") }}</span>
      </h2>
    </template>
    <template #body>
      <slot name="header" />

      <!-- ワードミュートがないメッセージ -->
      <div
        v-if="!mainState.currentSetting.wordMute?.length"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("wordMuteEmpty") }}
        </div>
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
  .popup-header > h2 > .svg-icon {
    fill: rgb(var(--notice-color));
  }

  &:deep() {
    .easy-form {
      &__body {
        grid-gap: 0.5rem;
      }

      .button--important {
        border-style: none;
        min-height: unset;
      }

      dl[data-name="keyword"],
      dl[data-name="targets"],
      dl[data-name="actorTarget"] {
        grid-column-end: span 3;
      }

      dl[data-name="actorTarget"]:not(:last-child) {
        margin-bottom: 0.5rem;
      }
    }
  }
}
</style>
