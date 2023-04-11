<script lang="ts" setup>
import { onMounted, reactive } from "vue"
import FileBox from "@/components/FileBox.vue"
import { blurElement } from "@/composables/misc"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  id?: string
  data: Array<TTEasyFormItem>
  submitButtonLabel?: string
  submitCallback?: Function
}>()

const state = reactive<{
  processing: boolean
}>({
  processing: false,
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
  blurElement()
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

function onChangeFile (files: Array<File>, item: TTEasyFormItem) {
  item.state[item.model] = files
  if (item.onChange != null) item.onChange(item, props)
}

function onInputTextarea (item: TTEasyFormItem) {
  if (item.onInput != null) item.onInput(item, props)
}

function onSubmitTextarea (event: KeyboardEvent) {
  if (!event.isComposing && (event.ctrlKey || event.metaKey)) onSubmit()
}
</script>

<template>
  <form
    class="easy-form"
    @submit.prevent="onSubmit"
  >
    <dl
      v-for="item, index of data"
      :key="index"
      v-show="item.display !== false"
    >
      <dt v-if="item.label != null">{{ item.label }}</dt>
      <dd>
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
        >
        <FileBox
          v-else-if="item.type === 'file'"
          :accept="item.accept"
          :multiple="item.isMultipleFile"
          :maxNumber="item.maxNumberOfFile"
          @change="(files: Array<File>) => { onChangeFile(files, item) }"
        />
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
          @keydown.enter.meta.exact="onSubmitTextarea"
        />
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
    <button class="button">{{ submitButtonLabel ?? $t("submit") }}</button>
  </form>
</template>

<style lang="scss" scoped>
// `slot` 用に `:deep()` を付与している
.easy-form:deep() {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;

  & > dl {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;

    & > dd  {
      display: flex;
      flex-direction: column;
      // align-items: center;
      position: relative;

      & > input,
      & > textarea {
        display: block;
        flex-grow: 1;
      }
    }
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
