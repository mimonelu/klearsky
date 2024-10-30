<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref } from "vue"
import Checkboxes from "@/components/forms/Checkboxes.vue"
import FileBox from "@/components/forms/FileBox.vue"
import MentionSuggestionList from "@/components/lists/MentionSuggestionList.vue"
import Radios from "@/components/forms/Radios.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

defineExpose({
  forceUpdate,
  setFocus,
  getVideoSizes,
})

const props = defineProps<{
  id?: string
  gridColumns?: string
  hasSubmitButton?: boolean
  submitButtonLabel?: string
  submitCallback?: Function
  blurOnSubmit?: boolean
  data: Array<TTEasyFormItem>
}>()

const state = reactive<{
  processing: boolean
  updateKey: number
}>({
  processing: false,
  updateKey: 0,
})

const easyForm = ref(null)

const fileBox = ref()

onMounted(setFocus)

function forceUpdate () {
  state.updateKey = new Date().getTime()
}

function setFocus () {
  props.data.forEach((prop: TTEasyFormItem, index: number) => {
    if (!prop.focus) return
    const itemId: string = makeItemId(index)
    const itemElement: null | HTMLElement = document.getElementById(itemId)
    if (itemElement == null) return
    itemElement.focus()
  })
}

function makeItemId (index: number) {
  return `easy-form--${props.id ?? 'default'}__${index}`
}

const inputList = [ "datetime-local", "password", "text", "url" ]
function isInput (type?: string): boolean {
  return type != null ? inputList.includes(type) : true
}

function getCharacterLength (item: TTEasyFormItem): number {
  if (item.model == null) return 0
  const text = item.state[item.model]
  if (item.maxLengthIndicatorByGrapheme) {
    return Util.getGraphemeLength(text ?? "")
  } else {
    return new Blob([text]).size
  }
}

async function onSubmit () {
  if (props.blurOnSubmit) Util.blurElement()
  if (state.processing) return
  if (props.submitCallback == null) {
    emit("submit")
    return
  }
  state.processing = true
  try {
    await props.submitCallback()
  } finally {
    state.processing = false
  }
}

function onClick (item: TTEasyFormItem) {
  Util.blurElement()
  if (item.onClick != null) item.onClick(item, props)
}

function onChange (item: TTEasyFormItem) {
  if (item.onUpdate != null) item.onUpdate(item, props)
}

function onClickClearButton (item: TTEasyFormItem) {
  Util.blurElement()
  if (item.model == null) return
  item.state[item.model] = ""
  emit("clickClearButton")
}

function onChangeFile (files: Array<File>, item: TTEasyFormItem) {
  if (item.model == null) return
  item.state[item.model] = files
  if (item.onChange != null) item.onChange(item, props)
}

function onFocus (item: TTEasyFormItem) {
  if (item.onFocus != null) item.onFocus(item, props)
}

function onBlur (item: TTEasyFormItem) {
  if (item.onBlur != null) item.onBlur(item, props)
}

function onInput (item: TTEasyFormItem) {
  if (item.onInput != null) item.onInput(item, props)
}

function onEnterKeyDownOnInput (event: KeyboardEvent, item: TTEasyFormItem) {
  if (item.submitWhenEnter ||
      (!event.isComposing && (event.ctrlKey || event.metaKey))
  ) {
    const formElement = easyForm.value as unknown as HTMLFormElement
    if (formElement?.reportValidity()) {
      onSubmit()
    }
  } else {
    event.preventDefault()
  }
}

function onEnterKeyDownOnTextarea (event: KeyboardEvent) {
  if (!event.isComposing && (event.ctrlKey || event.metaKey)) onSubmit()
}

function onUpdateText (item: TTEasyFormItem, itemIndex: number, params: any) {
  if (item.model == null) return
  const id = makeItemId(itemIndex)
  const target: null | HTMLInputElement =
    (easyForm.value as null | HTMLInputElement)?.querySelector(`#${id}`) ?? null
  item.state[item.model] = params.text
  nextTick(() => {
    if (target == null) return
    target.setSelectionRange(params.endIndex, params.endIndex)
  })
}

// 動画の aspectRatio 対応
// SendPostPopup から呼び出し
function getVideoSizes (): Array<Array<undefined | {
  width: number
  height: number
}>> {
  return fileBox.value?.map((value: any) => {
    return value?.getVideoSizes() ?? []
  }) ?? []
}
</script>

<template>
  <form
    ref="easyForm"
    class="easy-form"
    :data-grid-columns="gridColumns != null"
    :style="gridColumns != null ? `--grid-columns: ${gridColumns};` : ''"
    @submit.prevent.stop="onSubmit"
  >
    <slot name="before" />
    <div
      v-if="data.length > 0"
      class="easy-form__body"
    >
      <template
        v-for="item, index of data"
        :key="index"
      >
        <slot :name="`free-${index}`" />
        <dl
          v-show="item.display !== false"
          :data-name="item.name ?? item.model"
        >
          <dt v-if="item.label != null">{{ item.label }}</dt>
          <dd>
            <template v-if="item.model != null">
              <!-- 各種 input 要素 -->
              <input
                v-if="isInput(item.type)"
                v-model="item.state[item.model]"
                v-bind="item.attrs"
                :id="makeItemId(index)"
                :type="item.type ?? 'text'"
                :disabled="item.disabled ?? false"
                :required="item.required ?? false"
                :pattern="item.pattern"
                :placeholder="item.placeholder ?? ''"
                autocapitalize="off"
                autocorrect="off"
                :autocomplete="item.autocomplete ?? ''"
                :inputmode="item.inputmode ?? undefined"
                spellcheck="false"
                class="textbox"
                :class="item.classes"
                @input="onInput(item)"
                @keydown.enter="onEnterKeyDownOnInput($event, item)"
              >

              <!-- テキストエリア -->
              <textarea
                v-else-if="item.type === 'textarea'"
                v-model="item.state[item.model]"
                v-bind="item.attrs"
                :id="makeItemId(index)"
                :disabled="item.disabled ?? false"
                :required="item.required ?? false"
                :pattern="item.pattern"
                :rows="item.rows ?? ''"
                :placeholder="item.placeholder ?? ''"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                class="textarea"
                :class="item.classes"
                @focus="onFocus(item)"
                @blur="onBlur(item)"
                @input="onInput(item)"
                @keydown.enter="onEnterKeyDownOnTextarea"
              />

              <!-- チェックボックス -->
              <Checkboxes
                v-else-if="item.type === 'checkbox'"
                v-bind="item.attrs"
                :state="item.state"
                :model="item.model"
                :disabled="item.disabled"
                :required="item.required ?? false"
                :options="item.options as Array<TTOption>"
                :limit="item.limit"
                :layout="item.layout"
                :class="item.classes"
                @update="onChange(item)"
              />

              <!-- ラジオボタン -->
              <Radios
                v-else-if="item.type === 'radio'"
                v-bind="item.attrs"
                :state="item.state"
                :model="item.model"
                :disabled="item.disabled"
                :required="item.required ?? false"
                :options="item.options as Array<TTOption>"
                :layout="item.layout"
                :class="item.classes"
                @update="onChange(item)"
              />

              <!-- セレクトボックス -->
              <label
                v-else-if="item.type === 'select'"
                v-bind="item.attrs"
                class="selectbox"
                :class="item.classes"
              >
                <select
                  v-model="item.state[item.model]"
                  @change="onChange(item)"
                >
                  <option
                    v-for="option, index in item.options"
                    :key="index"
                    :value="option.value"
                    :selected="option.value === item.state[item.model]"
                  >{{ $t(option.label) }}</option>
                </select>
              </label>

              <!-- ファイル選択ボックス -->
              <FileBox
                v-else-if="item.type === 'file'"
                v-bind="item.attrs"
                ref="fileBox"
                :files="item.state[item.model]"
                :disabled="item.disabled"
                :accept="item.accept"
                :multiple="item.isMultipleFile"
                :maxNumber="item.maxNumberOfFile"
                :quadLayout="item.quadLayout"
                :class="item.classes"
                @change="(files: Array<File>) => { onChangeFile(files, item) }"
              />
            </template>

            <!-- ボタン -->
            <button
              v-if="item.type === 'button'"
              v-bind="item.attrs"
              type="button"
              :class="item.classes"
              @click.prevent="onClick(item)"
            >
              <SVGIcon
                v-if="item.icon != null"
                :name="item.icon"
              />
              <span v-if="item.buttonLabel != null">{{ item.buttonLabel }}</span>
            </button>

            <!-- クリアボタン -->
            <button
              v-if="item.clearButton"
              class="clear-button"
              :class="item.classes"
              @click.prevent="onClickClearButton(item)"
            >
              <SVGIcon name="cross" />
            </button>

            <!-- 最大文字数インジケータ -->
            <div
              v-if="item.maxLengthIndicator"
              class="max-length-indicator"
              :class="item.classes"
              :data-over-maxlength="item.maxlength != null
                ? getCharacterLength(item) > item.maxlength
                : false
              "
            >{{ getCharacterLength(item) }} / {{ item.maxlength }}</div>

            <!-- メンションサジェスト -->
            <MentionSuggestionList
              v-if="item.model != null && item.hasMentionSuggestion"
              :text="item.state[item.model]"
              @select="(params: any) => { onUpdateText(item, index, params) }"
            />
          </dd>

          <!-- 脚注 -->
          <dd
            v-if="item.footnote != null"
            class="footnote"
          >{{ item.footnote }}</dd>
        </dl>
      </template>
    </div>
    <slot name="beforeButton" />
    <button
      v-if="hasSubmitButton ?? true"
      class="button submit-button"
    >
      <span>{{ submitButtonLabel ?? $t("submit") }}</span>
    </button>
    <slot name="after" />
    <div class="update-key">{{ state.updateKey }}</div>
  </form>
</template>

<style lang="scss" scoped>
.easy-form {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;

  &__body {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem 0.5rem;
  }
  &[data-grid-columns="true"] &__body {
    display: grid;
    grid-template-columns: var(--grid-columns);
    align-items: center;
  }

  &:deep() {
    dl {
      display: flex;
      flex-direction: column;
      grid-gap: 0.5rem;

      & > dt {
        font-weight: bold;
        line-height: var(--line-height-middle);
        word-wrap: break-word;
      }

      & > dd  {
        display: flex;
        flex-direction: column;
        position: relative;

        & > input {
          width: 100%;
        }

        & > textarea {
          display: block;
          flex-grow: 1;
        }

        & > .button,
        & > .button--invert,
        & > .button--bordered,
        & > .button--important,
        & > .button--bordered--important,
        & > .button--plane,
        & > input {
          min-height: 3rem;
        }
      }
    }
  }
}

.clear-button {
  background-color: rgb(var(--bg-color));
  border-radius: var(--border-radius-middle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -1rem;
  position: absolute;
  top: 50%;
  right: 0.375rem;
  width: 2rem;
  height: 2rem;

  & > .svg-icon {
    fill: rgb(var(--fg-color), 0.75);
    font-size: 0.75rem;
  }
  &:focus > .svg-icon,
  &:hover > .svg-icon {
    fill: rgb(var(--fg-color));
  }
}

.footnote {
  color: rgb(var(--fg-color), 0.75);
  font-size: 0.875rem;
  line-height: var(--line-height-middle);
  text-align: right;
  word-wrap: break-word;
}

.max-length-indicator {
  color: rgb(var(--fg-color));
  font-size: 0.875rem;
  margin: 0.5rem 0 0 auto;
  word-break: break-all;
  &[data-over-maxlength="true"] {
    color: rgb(var(--notice-color));
  }
}

.mention-suggestion-list:deep() {
  .mention-suggestion-list__suggestion {
    margin-top: 1rem;
    z-index: 1;
    width: 100%;
  }
}

.update-key {
  display: none;
}
</style>
