<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  mode: "edit" | "select"
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const formState = reactive<{
  newMyWord: string
}>({
  newMyWord: "",
})

const state = reactive<{
  mode: "edit" | "select"
  easyFormProps: TTEasyForm
}>({
  mode: props.mode,
  easyFormProps: {
    gridColumns: "auto 1fr auto",
    hasSubmitButton: false,
    submitCallback () {
      addNewMyWord(formState.newMyWord)
    },
    blurOnSubmit: false,
    data: [
      {
        state: formState,
        model: "newMyWord",
        type: "textarea",
        maxlength: 300,
        maxLengthIndicator: true,
        maxLengthIndicatorByGrapheme: true,
        placeholder: $t("newMyWord"),
        autocomplete: "off",
      },
      {
        type: "button",
        classes: "button--important",
        icon: "remove",
        buttonLabel: $t("reset"),
        onClick () {
          resetNewMyWord()
        },
      },
      {
        type: "space",
      },
      {
        type: "button",
        classes: "button",
        icon: "plus",
        buttonLabel: $t("add"),
        onClick () {
          addNewMyWord(formState.newMyWord)
        },
      },
    ],
  },
})

function close () {
  emit("close")
}

function toggleMode () {
  state.mode = state.mode === 'edit' ? 'select' : 'edit'
}

async function resetNewMyWord () {
  if (formState.newMyWord === "") {
    return
  }
  if (await mainState.openConfirmationPopup({
    text: $t("resetTextarea"),
  })) {
    formState.newMyWord = ""
  }
}

function addNewMyWord (newMyWord: string) {
  if (!newMyWord) {
    return
  }
  if (mainState.currentSetting.myWords == null) {
    return
  }
  if (mainState.currentSetting.myWords?.some((myWord) => {
    return myWord === newMyWord
  })) {
    return
  }
  mainState.currentSetting.myWords.push(newMyWord)
  mainState.saveSettings()
  formState.newMyWord = ""
}

async function removeMyWord (index: number) {
  if (mainState.currentSetting.myWords == null) {
    return
  }
  const result = await mainState.openConfirmationPopup({
    title: $t("deleteMyWord"),
    text: `${$t("deleteMyWordMessage")}: "${mainState.currentSetting.myWords[index]}"`,
  })
  if (!result) {
    return
  }
  mainState.currentSetting.myWords.splice(index, 1)
  mainState.saveSettings()
}

function insertMyWord (myWord: string) {
  if (state.mode === "edit") {
    formState.newMyWord = myWord
  } else if (state.mode === "select") {
    mainState.myWordPopupCallback?.(myWord)
  }
}
</script>
<template>
  <Popup
    class="my-word-popup"
    :hasCloseButton="true"
    :data-mode="state.mode"
    @close="close"
  >
    <template #header>
      <h2>
        <!-- モード切替ボタン -->
        <button
          v-if="mode === 'select'"
          class="button--bordered my-word-popup__mode-switch-button"
          @click.prevent="toggleMode"
        >
          <SVGIcon :name="state.mode === 'select' ? 'edit' : 'plus'" />
          <span>{{ $t(state.mode === 'select' ? 'edit' : 'select') }}</span>
        </button>
        <SVGIcon name="alphaA" />
        <span>{{ $t("myWord") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- 追加フォーム -->
      <EasyForm
        v-if="state.mode === 'edit'"
        v-bind="state.easyFormProps"
      />

      <!-- ワード未登録メッセージ -->
      <div
        v-if="mainState.currentSetting.myWords?.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noMyWord") }}
        </div>
      </div>
      <div
        v-else
        class="my-word-list"
      >
        <!-- マイワード -->
        <button
          v-for="myWord, index of mainState.currentSetting.myWords"
          :key="index"
          type="button"
          class="my-word"
          @click.prevent="insertMyWord(myWord)"
        >
          <div class="my-word__text">{{ myWord }}</div>
          <button
            v-if="state.mode === 'edit'"
            type="button"
            class="button--plane my-word__remove-button"
            @click.prevent="removeMyWord(index)"
          >
            <SVGIcon name="cross" />
          </button>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-word-popup {
  // モード切替ボタン
  &__mode-switch-button {
    font-size: 0.75rem;
    position: absolute;
    left: 0.5rem;
  }

  // 追加フォーム
  .easy-form:deep() {
    .easy-form__body {
      align-items: flex-start;
    }
  }

  &:deep() {
    dl:first-child {
      grid-column-end: span 3;
    }
  }
}

.my-word-list {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem;
}

// マイワード
.my-word {
  border: 2px solid rgb(var(--fg-color), 0.125);
  border-radius: var(--border-radius-middle);
  cursor: pointer;
  display: flex;

  & > .svg-icon {
    fill: rgb(var(--fg-color));
  }

  & > button {
    padding: 0.5rem;
  }

  &__search-button {
    font-size: 1.25rem;

    & > .svg-icon {
      opacity: 0.5;
    }
  }

  &__remove-button {
    --fg-color: var(--notice-color);
  }

  &__text {
    font-weight: bold;
    line-height: 1.25;
    padding: 0.5rem 0.25rem;
    word-break: break-all;
    &:first-child {
      padding-left: 1rem;
    }
  }

  // ワード - 選択時
  [data-mode="select"] .my-word-list & {
    align-items: center;
    cursor: pointer;
    &:focus, &:hover {
      background-color: rgb(var(--accent-color), 0.25);
    }
    &[data-selected="true"] {
      border-color: rgb(var(--accent-color));
    }

    &__text {
      padding-right: 1rem;
    }
  }
}
</style>
