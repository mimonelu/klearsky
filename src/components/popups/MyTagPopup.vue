<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  mode: "edit" | "select"
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const formState = reactive<{
  text: string
}>({
  text: "",
})

const state = reactive<{
  mode: "edit" | "select"
  easyFormProps: TTEasyForm
}>({
  mode: props.mode,
  easyFormProps: {
    gridColumns: "1fr auto",
    hasSubmitButton: false,
    submitCallback () {
      addTag(formState.text)
    },
    blurOnSubmit: false,
    data: [
      {
        state: formState,
        model: "text",
        type: "text",
        maxlength: 64,
        maxLengthIndicator: true,
        maxLengthIndicatorByGrapheme: true,
        placeholder: $t("newTag"),
      },
      {
        type: "button",
        icon: "plus",
        onClick () {
          addTag(formState.text)
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

function addTag (text: string) {
  if (!text) return
  if (mainState.currentSetting.tags == null) return
  if (mainState.currentSetting.tags.some((tag: TTMyTag) => tag.text === text)) return
  mainState.currentSetting.tags.push({ text })
  mainState.saveSettings()
  formState.text = ""
}

async function removeTag (index: number) {
  if (mainState.currentSetting.tags == null) return
  const result = await mainState.openConfirmationPopup(
    $t("deleteTag"),
    `${$t("deleteTagMessage")}: "${mainState.currentSetting.tags[index].text}"`
  )
  if (!result) return

  // マイタグ削除時は選択済みのポストタグも削除
  const selectedIndex = findTagSelected(mainState.currentSetting.tags[index])
  if (selectedIndex !== - 1) removeCurrentPostTag(selectedIndex)

  mainState.currentSetting.tags.splice(index, 1)
  mainState.saveSettings()
}

function findTagSelected (tag: TTMyTag): number {
  if (mainState.currentPostTags == null) return - 1
  return mainState.currentPostTags.findIndex((currentTag: TTMyTag) => {
    return currentTag.text === tag.text
  })
}

function toggleCurrentPostTag (tag: TTMyTag) {
  if (state.mode !== "select") return
  const index = findTagSelected(tag)
  if (index === - 1) addCurrentPostTag(tag)
  else removeCurrentPostTag(index)
}

function addCurrentPostTag (tag: TTMyTag) {
  if (state.mode !== "select") return
  if (mainState.currentPostTags == null) return

  // ポストタグの登録上限数チェック
  if (mainState.currentPostTags.length >= 8) return

  mainState.currentPostTags.push(tag)
}

function removeCurrentPostTag (index: number) {
  if (mainState.currentPostTags == null) return
  mainState.currentPostTags.splice(index, 1)
}
</script>

<template>
  <Popup
    class="my-tag-popup"
    :hasCloseButton="true"
    :data-mode="state.mode"
    @close="close"
  >
    <template #header>
      <h2>
        <!-- モード切替ボタン -->
        <button
          v-if="mode === 'select'"
          class="button--bordered my-tag-popup__mode-switch-button"
          @click.prevent="toggleMode"
        >
          <SVGIcon :name="state.mode === 'select' ? 'edit' : 'plus'" />
          <span>{{ $t(state.mode === 'select' ? 'edit' : 'select') }}</span>
        </button>

        <SVGIcon name="tag" />
        <span>{{ $t("myTag") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- 追加フォーム -->
      <EasyForm
        v-if="state.mode === 'edit'"
        v-bind="state.easyFormProps"
      />

      <!-- タグ未登録メッセージ -->
      <div
        v-if="mainState.currentSetting.tags?.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">{{ $t("noTag") }}</div>
      </div>

      <div
        v-else
        class="tag-list"
      >
        <!-- タグ -->
        <div
          v-for="tag, index of mainState.currentSetting.tags"
          :key="index"
          class="tag"
          :data-selected="findTagSelected(tag) !== - 1"
          @click.prevent="toggleCurrentPostTag(tag)"
        >
          <SVGIcon
            v-if="state.mode === 'select'"
            :name="findTagSelected(tag) !== - 1 ? 'checkboxOn' : 'checkboxOff'"
          />
          <div class="tag__text">{{ tag.text }}</div>
          <button
            v-if="state.mode === 'edit'"
            class="button--plane tag__remove-button"
            @click.prevent="removeTag(index)"
          >
            <SVGIcon name="cross" />
          </button>
        </div>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-tag-popup {
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
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem;
}

// タグ
.tag {
  border: 2px solid var(--fg-color-0125);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  padding-left: 0.5rem;

  & > .svg-icon {
    fill: rgb(var(--fg-color));
  }

  & > button {
    padding: 0.5rem;
  }
  &__remove-button {
    --fg-color: var(--notice-color);
  }

  &__text {
    font-weight: bold;
    line-height: 1.25;
    padding: 0.5rem 0.25rem;
    word-break: break-all;
  }

  // タグ - 選択時
  [data-mode="select"] .tag-list & {
    cursor: pointer;
    &:focus, &:hover {
      background-color: rgb(var(--accent-color), 0.25);
    }
    &[data-selected="true"] {
      border-color: rgb(var(--accent-color));
    }

    & > .svg-icon {
      fill: var(--fg-color-05);
    }

    &__text {
      padding: 0.5rem;
    }
  }
}
</style>
