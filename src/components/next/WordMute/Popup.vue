<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import format from "date-fns/format"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import WordMuteScript from "@/components/next/WordMute/script"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const expiresAtOptions = ((): Array<TTOption> => {
  const options: Array<TTOption> = [{
    label: $t("wordMuteNoTerm"),
    value: undefined,
  }]
  for (let i = 0; i < 30; i ++) {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    const value = format(date, "yyyy-MM-dd HH:mm:ss")
    options.push({
      label: `${$t("wordMuteTerm")}: ${value}`,
      value,
    })
  }
  return options
})()

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
      if (wordMute.expiresAt == null) {
        wordMute.expiresAt = undefined
      }

      // 期限切れかどうか
      const expired = WordMuteScript.expired(new Date(), wordMute.expiresAt)

      return [
        {
          state: wordMute,
          model: "keyword",
          type: "text",
          label: `${$t("wordMute")} ${index + 1}`,
          placeholder: $t("wordMutePlaceholder"),
          autocomplete: "off",
        },
        {
          state: wordMute,
          model: "targets",
          type: "checkbox",
          layout: "horizontal",
          options: [
            { label: $t("wordMuteContent"), value: "content" },
            { label: $t("wordMuteTag"), value: "tag" },
            { label: $t("wordMuteUrl"), value: "url" },
          ],
        },
        {
          state: wordMute,
          model: "actorTarget",
          type: "checkbox",
          options: [
            { label: $t("wordMuteExcludeFollowing"), value: "exclude-following" },
          ],
        },
        {
          state: wordMute,
          model: "expiresAt",
          type: "select",
          options: ((): Array<TTOption> => {
            const options: Array<TTOption> = []
            options.push({
              label: `${$t("wordMuteCurrentTerm")}: ${wordMute.expiresAt == null ? $t("wordMuteNoTerm") : wordMute.expiresAt}`,
              value: wordMute.expiresAt,
            })
            options.push(...expiresAtOptions)
            return options
          })(),
          attrs: { 'data-expired': expired },
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
          classes: "button--important",
          icon: "remove",
          index,
          async onClick (item: TTEasyFormItem) {
            if (item.index == null) {
              return
            }
            if (wordMute.keyword && !await mainState.openConfirmationPopup({
              title: $t("wordMuteRemoveConfirmation"),
              text: `${$t("wordMuteRemoveConfirmationMessage")}\n"${wordMute.keyword}"`,
            })) {
              return
            }
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
  if (mainState.currentSetting.wordMute == null) {
    return
  }
  mainState.currentSetting.wordMute.unshift({
    enabled: [true],
    keyword: "",
    targets: ["content", "tag"],
    actorTarget: ["exclude-following"],
    expiresAt: undefined,
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

      // 削除ボタンの高さを他フォームパーツに合わせる
      .button--important {
        padding: 0.75rem 1.5rem;
        min-height: unset;
      }

      // グリッドのセル結合
      dl[data-name="keyword"],
      dl[data-name="targets"],
      dl[data-name="actorTarget"],
      dl[data-name="expiresAt"] {
        grid-column-end: span 3;
      }

      // セパレータ
      dl[data-name="keyword"]:not(:first-child) {
        border-top: 1px solid rgb(var(--fg-color), 0.125);
        margin-top: 1rem;
        padding-top: 1rem;
      }

      // 期限切れ
      [data-expired="true"] {
        --fg-color: var(--notice-color);
      }
    }
  }
}
</style>
