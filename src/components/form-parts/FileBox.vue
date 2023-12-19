<script lang="ts" setup>
import { onMounted, reactive, watch } from "vue"
import LazyImage from "@/components/common/LazyImage.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: "change", value: Array<File>): void}>()

const props = defineProps<{
  files?: Array<File>
  disabled?: boolean
  accept?: string
  multiple?: boolean
  maxNumber?: number
  quadLayout?: boolean
}>()

const state = reactive<{
  files: Array<File>
  previews: Array<string>
}>({
  files: props.files != null ? props.files : [],
  previews: [],
})

// D&D用処置
watch(() => props.files, (value?: Array<File>) => {
  state.files = value ?? []
  resetFiles()
})

// D&D用処置
onMounted(() => {
  resetFiles()
})

// input[type="file"] で同一ファイルを選択すると change が発火しない仕様への対策
function onClick (event: Event) {
  if (event.target != null) (event.target as HTMLInputElement).value = ""
}

function onChange (event: Event) {
  const newFiles = getFiles(event)
  if (newFiles == null) return
  // WANT: 同一ファイルを追加できないようにしたい
  if (props.maxNumber === 1) state.files.unshift(...newFiles)
  else state.files.push(...newFiles)
  resetFiles()
  emit("change", state.files)
}

function resetFiles () {
  if (props.maxNumber != null) state.files.splice(props.maxNumber)
  setPreviews(state.files)
}

function getFiles (event: Event): null | Array<File> {
  const fileList = (event.target as HTMLInputElement)?.files ?? null
  if (fileList == null) return null
  return Array.from(fileList)
}

function setPreviews (files: Array<File>) {
  if (files.length === 0) {
    state.previews.splice(0)
    return
  }
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
  <div
    class="filebox"
    :data-disabled="disabled"
  >
    <label
      class="button--bordered add-button"
      tabindex="0"
    >
      <input
        type="file"
        :disabled="disabled"
        :accept="accept"
        :multiple="multiple"
        @click="onClick"
        @change="onChange"
      />
      <SVGIcon name="image" />
    </label>

    <!-- 通常レイアウト -->
    <template v-if="!quadLayout">
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
    </template>

    <!-- 4分割レイアウト -->
    <template v-else>
      <div
        v-if="state.previews.length > 0"
        class="quad-images"
        :data-number-of-images="state.previews.length"
      >
        <div
          v-for="preview, index of state.previews"
          :key="index"
          class="quad-image"
        >
          <div class="thumbnail">
            <LazyImage
              :src="preview"
              @click.prevent.stop
            />
            <button
              class="delete-button"
              @click.prevent="deleteFile(index)"
            >
              <SVGIcon name="cross" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.filebox {
  display: flex;
  grid-gap: 1rem;

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    flex-wrap: wrap;
  }
}

.add-button {
  min-width: 5rem;
  max-width: 5rem;
  min-height: 5rem;
  max-height: 5rem;
  [data-disabled="true"] & {
    opacity: 0.5;
  }

  & > input {
    display: none;
  }

  & > .svg-icon {
    font-size: 16px;
  }
}

.preview-container {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem;
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

.thumbnail {
  cursor: unset !important;
  overflow: hidden;
}

.delete-button {
  background-color: rgb(var(--bg-color));
  border-radius: var(--border-radius);
  padding: 0.5rem;
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;

  & > .svg-icon {
    fill: var(--notice-color-075);
  }

  &:focus, &:hover {
    cursor: pointer;

    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
