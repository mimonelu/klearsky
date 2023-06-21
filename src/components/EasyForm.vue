<script lang="ts" setup>
import { onMounted, reactive } from "vue"
import Checkboxes from "@/components/Checkboxes.vue"
import FileBox from "@/components/FileBox.vue"
import Radios from "@/components/Radios.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

defineExpose({
  forceUpdate,
})

const props = defineProps<{
  id?: string
  gridColumns?: string
  hasSubmitButton?: boolean
  submitButtonLabel?: string
  submitCallback?: Function
  data: Array<TTEasyFormItem>
}>()

const state = reactive<{
  processing: boolean
  updateKey: number
}>({
  processing: false,
  updateKey: 0,
})

onMounted(() => {
  props.data.forEach((prop: TTEasyFormItem, index: number) => {
    if (prop.focus) {
      const itemId: string = makeItemId(index)
      const itemElement: null | HTMLElement = document.getElementById(itemId)
      if (itemElement == null) return
      itemElement.focus()
    }
  })
})

function forceUpdate () {
  state.updateKey = new Date().getTime()
}

function makeItemId (index: number) {
  return `easy-form--${props.id ?? 'default'}__${index}`
}

const inputList = [ "password", "text", "url" ]
function isInput (type?: string): boolean {
  return type != null ? inputList.includes(type) : true
}

function getCharacterLength (item: TTEasyFormItem): number {
  if (item.model == null) return 0
  const text = item.state[item.model]
  if (item.maxLengthWithSegmenter) {
    const segmenter = (Intl as any).Segmenter
    return segmenter != null
      ? [...new segmenter().segment(text)].length
      : text.length
  } else {
    return text.length
  }
}

async function onSubmit () {
  Util.blurElement()
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
}

function onChangeFile (files: Array<File>, item: TTEasyFormItem) {
  if (item.model == null) return
  item.state[item.model] = files
  if (item.onChange != null) item.onChange(item, props)
}

function onInputTextarea (item: TTEasyFormItem) {
  if (item.onInput != null) item.onInput(item, props)
}

function onEnterKeyDown (event: KeyboardEvent) {
  if (!event.isComposing && (event.ctrlKey || event.metaKey)) onSubmit()
}
</script>

<template>
  <form
    :key="state.updateKey"
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
      <dl
        v-for="item, index of data"
        :key="index"
        v-show="item.display !== false"
      >
        <dt v-if="item.label != null">{{ item.label }}</dt>
        <dd>
          <template v-if="item.model != null">
            <!-- 各種 input 要素 -->
            <input
              v-if="isInput(item.type)"
              v-model="item.state[item.model]"
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
              @keydown.enter="onEnterKeyDown"
            >

            <!-- チェックボックス -->
            <Checkboxes
              v-if="item.type === 'checkbox'"
              :state="item.state"
              :model="item.model"
              :required="item.required ?? false"
              :options="item.options as Array<TTOption>"
              :layout="item.layout"
              :class="item.classes"
              @update="onChange(item)"
            />

            <!-- ラジオボタン -->
            <Radios
              v-if="item.type === 'radio'"
              :state="item.state"
              :model="item.model"
              :required="item.required ?? false"
              :options="item.options as Array<TTOption>"
              :layout="item.layout"
              :class="item.classes"
              @update="onChange(item)"
            />

            <!-- セレクトボックス -->
            <label
              v-if="item.type === 'select'"
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
              :files="item.state[item.model]"
              :disabled="item.disabled"
              :accept="item.accept"
              :multiple="item.isMultipleFile"
              :maxNumber="item.maxNumberOfFile"
              :quadLayout="item.quadLayout"
              :class="item.classes"
              @change="(files: Array<File>) => { onChangeFile(files, item) }"
            />

            <!-- テキストエリア -->
            <textarea
              v-else-if="item.type === 'textarea'"
              v-model="item.state[item.model]"
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
              @input="onInputTextarea(item)"
              @keydown.enter="onEnterKeyDown"
            />
          </template>

          <!-- ボタン -->
          <button
            v-if="item.type === 'button'"
            type="button"
            class="button--bordered"
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
        </dd>

        <!-- 脚注 -->
        <dd
          v-if="item.footnote != null"
          class="footnote"
        >{{ item.footnote }}</dd>
      </dl>
    </div>
    <slot name="after" />
    <button
      v-if="hasSubmitButton ?? true"
      class="button submit-button"
    >
      <span>{{ submitButtonLabel ?? $t("submit") }}</span>
    </button>
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
        line-height: 1.25;
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

        & > .button--bordered,
        & > input,
        & > .checkboxes,
        & > .checkboxes > .checkbox {
          min-height: 3rem;
        }
      }
    }
  }
}

.clear-button {
  background-color: rgb(var(--bg-color));
  border-radius: var(--border-radius);
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
    fill: rgba(var(--fg-color), 0.75);
    font-size: 0.75rem;
  }
  &:focus > .svg-icon,
  &:hover > .svg-icon {
    fill: rgb(var(--fg-color));
  }
}

.footnote {
  color: rgba(var(--fg-color), 0.75);
  font-size: 0.875rem;
  line-height: 1.25;
  text-align: right;
  word-wrap: break-word;
}

.max-length-indicator {
  color: rgb(var(--fg-color));
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: right;
  &[data-over-maxlength="true"] {
    color: rgb(var(--notice-color));
  }
}
</style>
