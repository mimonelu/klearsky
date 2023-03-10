<script lang="ts" setup>
import { onMounted, reactive } from "vue"
import FileBox from "@/components/FileBox.vue"
import Loader from "@/components/Loader.vue"

const props = defineProps<{
  id?: string
  data: Array<{ [k: string]: any }>
  submitButtonLabel?: string
  submitCallback?: Function
}>()

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

const emit = defineEmits<{(event: string): void}>()

const submit = async () => {
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

const makeItemId = (index: number) => `easy-form--${props.id ?? 'default'}__${index}`

const inputList = [ "password", "text", "url" ]
const isInput = (type?: string): boolean => type != null ? inputList.includes(type) : true

function onChangeFile (files: Array<File>, data: { [k: string]: any }) {
  data.state[data.model] = files
}

onMounted(() => {
  props.data.forEach((prop: any, index: number) => {
    if (prop.focus) {
      const itemId: string = makeItemId(index)
      const itemElement: null | HTMLElement = document.getElementById(itemId)
      if (itemElement == null) return
      itemElement.focus()
    }
  })
})
</script>

<template>
  <form
    class="easy-form"
    @submit.prevent="submit"
  >
    <dl v-for="data, index of props.data">
      <dt>{{ data.label }}</dt>
      <dd>
        <input
          v-if="isInput(data.type)"
          v-model="data.state[data.model]"
          :id="makeItemId(index)"
          :type="data.type ?? 'text'"
          :required="data.required ?? false"
          :placeholder="data.placeholder ?? ''"
          :autocomplete="data.autocomplete ?? ''"
          class="textbox"
        >
        <FileBox
          v-else-if="data.type === 'file'"
          :accept="data.accept"
          :multiple="data.isMultipleFile"
          :maxNumber="data.maxNumberOfFile"
          @change="(files: Array<File>) => { onChangeFile(files, data) }"
        />
        <textarea
          v-else-if="data.type === 'textarea'"
          v-model="data.state[data.model]"
          :id="makeItemId(index)"
          :required="data.required ?? false"
          :placeholder="data.placeholder ?? ''"
          class="textarea"
          rows="8"
        />
      </dd>
    </dl>
    <button class="button">{{ props.submitButtonLabel ?? $t("submit") }}</button>
    <Loader v-if="state.processing" />
  </form>
</template>

<style lang="scss" scoped>
.easy-form {
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
}
</style>
