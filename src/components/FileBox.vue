<script lang="ts" setup>
import { reactive } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

const props = defineProps<{
  accept?: string
  multiple?: boolean
  maxNumber?: number
}>()

const emit = defineEmits<{(event: "change", value: Array<File>): void}>()

const state = reactive<{
  previews: Array<string>
}>({
  previews: [],
})

const onChange = (event: Event) => {
  const files: null | Array<File> = getFiles(event)
  if (files == null) return
  setPreviews(files)
  emit("change", files)
}

const getFiles = (event: Event): null | Array<File> => {
  const fileList: null | FileList = (event.target as HTMLInputElement)?.files ?? null
  if (fileList == null) return null
  const files: Array<File> = Array.from(fileList)
  if (props.maxNumber != null) files.splice(props.maxNumber)
  return files
}

const setPreviews = (files: Array<File>) => {
  if (files.length === 0) return
  state.previews.splice(0, state.previews.length, ...files.map((file: File) => {
    return window.URL.createObjectURL(file)
  }))
}
</script>

<template>
  <div class="filebox">
    <label
      class="button"
      tabindex="0"
    >
      <input
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="onChange"
      />
      <SVGIcon name="plus" />
    </label>
    <div
      v-for="preview of state.previews"
      class="image-box"
      :data-has-image="preview != null"
      :style="{ 'background-image': `url(${preview})` }"
    />
  </div>
</template>

<style lang="scss" scoped>
.filebox {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem;

  input {
    display: none;
  }

  .button {
    width: 5rem;
    height: 5rem;

    .svg-icon:deep() {
      fill: rgb(var(--bg-color));
      opacity: 0.5;
      min-width: 1rem;
      height: 1rem;
    }
  }

  .image-box {
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    border: 1px solid rgb(var(--fg-color));
    border-radius: 1px;
    min-width: 5rem;
    height: 5rem;
    &[data-has-image="false"] {
      display: none;
    }
  }
}
</style>
