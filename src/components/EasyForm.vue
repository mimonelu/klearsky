<script lang="ts" setup>
import { onMounted, reactive } from "vue"
import FileBox from "@/components/FileBox.vue"
import { blurElement } from "@/composables/misc"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  id?: string
  data: Array<KEasyFormItem>
  submitButtonLabel?: string
  submitCallback?: Function
}>()

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

onMounted(() => {
  props.data.forEach((prop: KEasyFormItem, index: number) => {
    if (prop.focus) {
      const itemId: string = makeItemId(index)
      const itemElement: null | HTMLElement = document.getElementById(itemId)
      if (itemElement == null) return
      itemElement.focus()
    }
  })
})

async function submit () {
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

function makeItemId (index: number) {
  return `easy-form--${props.id ?? 'default'}__${index}`
}

const inputList = [ "password", "text", "url" ]
function isInput (type?: string): boolean {
  return type != null ? inputList.includes(type) : true
}

function onChangeFile (files: Array<File>, data: { [k: string]: any }) {
  data.state[data.model] = files
}
</script>

<template>
  <form
    class="easy-form"
    @submit.prevent="submit"
  >
    <dl v-for="item, index of data">
      <dt>{{ item.label }}</dt>
      <dd>
        <input
          v-if="isInput(item.type)"
          v-model="item.state[item.model]"
          :id="makeItemId(index)"
          :type="item.type ?? 'text'"
          :required="item.required ?? false"
          :placeholder="item.placeholder ?? ''"
          :autocomplete="item.autocomplete ?? ''"
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
          :required="item.required ?? false"
          :placeholder="item.placeholder ?? ''"
          :rows="item.rows ?? ''"
          class="textarea"
        />
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
      align-items: center;

      & > input,
      & > textarea {
        display: block;
        flex-grow: 1;
      }
    }
  }

  .note {
    font-size: 0.875rem;
    line-height: 1.375;
  }
}
</style>
