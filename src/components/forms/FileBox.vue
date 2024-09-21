<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: "change", value: Array<File>): void}>()

defineExpose({
  getVideoSizes,
})

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

const media = ref()

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
  // ファイル配列を最大数まで切り詰め
  if (props.maxNumber != null) {
    state.files.splice(props.maxNumber)
  }

  // ファイル配列に動画が含まれる場合は最初の動画以外削除
  const firstVideo = state.files.find((file) => {
    return file.type?.startsWith("video/")
  })
  if (firstVideo != null) {
    state.files.splice(0, state.files.length, firstVideo)
  }

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

// 動画の aspectRatio 対応
// EasyForm から呼び出し
function getVideoSizes (): Array<undefined | {
  width: number
  height: number
}> {
  return media.value?.map((value: any) => {
    if (value?.videoWidth == null ||
        value?.videoHeight == null
    ) {
      return
    }
    return {
      width: value.videoWidth,
      height: value.videoHeight,
    }
  }) ?? []
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
            <!-- 動画プレビュー -->
            <div v-if="files != null && files[index]?.type?.startsWith('video/')">
              <video
                ref="media"
                controls
                loading="lazy"
                loop
                muted
                preload="metadata"
                width="100%"
                height="100%"
              >
                <source :src="preview" />
              </video>
            </div>

            <!-- 画像プレビュー -->
            <LazyImage
              v-else
              ref="media"
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
  grid-gap: 0.5rem;

  // SPレイアウト
  @include media-sp-layout() {
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
  border-radius: var(--border-radius-middle);
  position: relative;
  min-width: 5rem;
  height: 5rem;
  &[data-has-image="false"] {
    display: none;
  }
}

.thumbnail {
  background-color: rgb(var(--fg-color), 0.125);
  border: 1px solid rgb(var(--fg-color), 0.25);
  border-radius: var(--border-radius-middle);
  cursor: unset !important;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  & > .lazy-image {
    display: block;
    object-fit: cover;
    min-height: calc(2em + 4px); // NOTICE: ALTボタンを考慮

    // TODO: 暫定対応
    max-height: 100vh;
  }
}

.delete-button {
  background-color: rgb(var(--bg-color));
  border-radius: var(--border-radius-middle);
  padding: 0.5rem;
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;

  & > .svg-icon {
    fill: rgb(var(--notice-color), 0.75);
  }

  &:focus, &:hover {
    cursor: pointer;

    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
