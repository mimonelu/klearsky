<script lang="ts" setup>
import { onMounted, reactive } from "vue"
import Checkboxes from "@/components/Checkboxes.vue"
import FileBox from "@/components/FileBox.vue"
import Radios from "@/components/Radios.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string): void}>()

defineExpose({
  forceUpdate,
})

const props = defineProps<{
  id?: string
  data: Array<TTEasyFormItem>
  hasSubmitButton?: boolean
  submitButtonLabel?: string
  submitCallback?: Function
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

function onChange (item: TTEasyFormItem) {
  if (item.onUpdate != null) item.onUpdate(item, props)
}

function onActivateClearButton (item: TTEasyFormItem) {
  item.state[item.model] = ""
}

function onChangeFile (files: Array<File>, item: TTEasyFormItem) {
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
    @submit.stop="onSubmit"
  >
    <slot name="before" />
    <dl
      v-for="item, index of data"
      :key="index"
      v-show="item.display !== false"
    >
      <dt v-if="item.label != null">{{ item.label }}</dt>
      <dd>
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
          @keydown.enter="onEnterKeyDown"
        >

        <!-- チェックボックス -->
        <Checkboxes
          v-if="item.type === 'checkbox'"
          :state="item.state"
          :model="item.model"
          :options="item.options as Array<TTOption>"
          :layout="item.layout"
          @update="onChange(item)"
        />

        <!-- ラジオボタン -->
        <Radios
          v-if="item.type === 'radio'"
          :state="item.state"
          :model="item.model"
          :options="item.options as Array<TTOption>"
          :layout="item.layout"
          @update="onChange(item)"
        />

        <!-- セレクトボックス -->
        <label
          v-if="item.type === 'select'"
          class="selectbox"
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

        <!-- クリアボタン -->
        <button
          v-if="item.clearButton"
          class="clear-button"
          @click.prevent="onActivateClearButton(item)"
        >
          <SVGIcon name="cross" />
        </button>

        <!-- ファイル選択ボックス -->
        <FileBox
          v-else-if="item.type === 'file'"
          :disabled="item.disabled"
          :accept="item.accept"
          :multiple="item.isMultipleFile"
          :maxNumber="item.maxNumberOfFile"
          :quadLayout="item.quadLayout"
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
          @input="onInputTextarea(item)"
          @keydown.enter="onEnterKeyDown"
        />

        <!-- 最大文字数インジケータ -->
        <div
          v-if="item.maxLengthIndicator"
          class="max-length-indicator"
          :data-over-maxlength="item.maxlength != null
            ? getCharacterLength(item) > item.maxlength
            : false
          "
        >{{ getCharacterLength(item) }} / {{ item.maxlength }}</div>
      </dd>
    </dl>
    <slot name="after" />
    <button
      v-if="hasSubmitButton ?? true"
      class="button"
    >{{ submitButtonLabel ?? $t("submit") }}</button>
  </form>
</template>

<style lang="scss" scoped>
// `slot` 用に `:deep()` を付与している
.easy-form:deep() {
  display: flex;
  flex-direction: column;
  grid-gap: 1.5rem;

  & > dl {
    display: flex;
    flex-direction: column;
    grid-gap: 0.75rem;

    & > dt {
      font-weight: bold;
    }

    & > dd  {
      display: flex;
      flex-direction: column;
      position: relative;

      & > input,
      & > textarea {
        display: block;
        flex-grow: 1;
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
