<script lang="ts" setup>
import { reactive } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: "change", value: Array<File>): void}>()

const props = defineProps<{
  accept?: string
  multiple?: boolean
  maxNumber?: number
}>()

const state = reactive<{
  files: Array<File>
  previews: Array<string>
}>({
  files: [],
  previews: [],
})

function onChange (event: Event) {
  const newFiles = getFiles(event)
  if (newFiles == null) return
  // WANT: 同一ファイルを追加できないようにしたい
  state.files.push(...newFiles)
  if (props.maxNumber != null) state.files.splice(props.maxNumber)
  setPreviews(state.files)
  emit("change", state.files)
}

function getFiles (event: Event): null | Array<File> {
  const fileList = (event.target as HTMLInputElement)?.files ?? null
  if (fileList == null) return null
  return Array.from(fileList)
}

function setPreviews (files: Array<File>) {
  if (files.length === 0) return
  const objectUrls = files.map((file: File) => window.URL.createObjectURL(file))
  state.previews.splice(0, state.previews.length, ...objectUrls)
}

function deleteFile (index: number) {
  state.files.splice(index, 1)
  state.previews.splice(index, 1)
  emit("change", state.files)
}
</script>

<template>
  <div class="filebox">
    <label
      class="button add-button"
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
      v-for="preview, index of state.previews"
      :key="index"
      class="preview-box"
      :data-has-image="preview != null"
      :style="{ 'background-image': `url(${preview})` }"
    >
      <button
        class="delete-button"
        @click.prevent="deleteFile(index)"
      >
        <SVGIcon name="cross" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filebox {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem;
}

.add-button {
  width: 5rem;
  height: 5rem;

  & > input {
    display: none;
  }

  & > .svg-icon {
    fill: rgb(var(--bg-color));
    min-width: 1rem;
    height: 1rem;
  }
}

.preview-box {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid rgb(var(--fg-color));
  border-radius: var(--border-radius);
  position: relative;
  min-width: 5rem;
  height: 5rem;
  &[data-has-image="false"] {
    display: none;
  }
}

.delete-button {
  background-color: rgb(var(--fg-color));
  border-radius: 0 0 0 var(--border-radius);
  padding: 0.5rem;
  position: absolute;
  top: 0;
  right: 0;

  & > .svg-icon {
    fill: rgba(var(--bg-color), 0.75);
  }

  &:focus, &:hover {
    cursor: pointer;

    & > .svg-icon {
      fill: rgb(var(--bg-color));
    }
  }
}
</style>
