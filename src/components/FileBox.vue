<script lang="ts" setup>
import { reactive } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

defineProps<{
  accept?: string
}>()

const state = reactive<{
  image: null | string
}>({
  image: null,
})

const onChange = (event: Event) => {
  setImage(event)
  emit("change", event)
}

const setImage = (event: Event) => {
  const files: null | FileList = (event.target as HTMLInputElement)?.files ?? null
  if (files == null || files.length === 0) return
  console.log(files[0])
  state.image = window.URL.createObjectURL(files[0])
}

const emit = defineEmits<{(event: "change", value: Event): void}>()
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
        @change="onChange"
      />
      <SVGIcon name="plus" />
    </label>
    <div
      class="image-box"
      :data-has-image="state.image != null"
      :style="{ 'background-image': `url(${state.image})` }"
    />
  </div>
</template>

<style lang="scss" scoped>
.filebox {
  display: flex;
  grid-gap: 0.5rem;

  input {
    display: none;
  }

  .button {
    width: 5rem;
    height: 5rem;

    .svg-icon:deep() {
      fill: black;
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
    width: 5rem;
    &[data-has-image="false"] {
      display: none;
    }
  }
}
</style>
