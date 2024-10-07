<script setup lang="ts">
import { inject, reactive } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

defineExpose({
  onDragEnter,
})

const mainState = inject("state") as MainState

const state = reactive<{
  isDragEnter: boolean
}>({
  isDragEnter: false,
})

function onDragEnter (event: DragEvent) {
  if (!event.dataTransfer?.types?.includes("Files")) {
    return
  }
  state.isDragEnter = true
}

function onDragLeave () {
  state.isDragEnter = false
}

function onDrop (event: DragEvent) {
  state.isDragEnter = false
  if (!mainState.atp.hasLogin() ||
      event.dataTransfer?.items == null
  ) {
    return
  }
  mainState.attachFilesToPost(event.dataTransfer.items)
}
</script>

<template>
  <div
    v-if="state.isDragEnter"
    class="drop-files"
    @click="onDragLeave"
    @dragenter.prevent
    @dragover.prevent
    @dragleave.prevent="onDragLeave"
    @drop.prevent.stop="onDrop"
  >
    <SVGIcon name="image" />
  </div>
</template>

<style lang="scss" scoped>
.drop-files {
  background-color: rgb(var(--bg-color), 0.5);
  border: 0.5rem  solid rgb(var(--accent-color));
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 100%;

  & > .svg-icon {
    fill: rgb(var(--accent-color));
    font-size: 4rem;
    pointer-events: none;
  }
}
</style>
