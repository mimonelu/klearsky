<script lang="ts" setup>
import { reactive } from "vue"

const props = defineProps<{
  items: any[]
}>()

const state = reactive<{
  focusedIndex: number
}>({
  focusedIndex: - 1,
})

function onMouseEnter () {
  state.focusedIndex = - 1
}

function onDragStart (event: DragEvent, index: number) {
  state.focusedIndex = - 1
  if (event.dataTransfer == null) return
  event.dataTransfer.dropEffect = "move"
  // event.dataTransfer.effectAllowed = "move"
  event.dataTransfer.setData("text/plain", index.toString())
}

function onDragEnter (index: number) {
  state.focusedIndex = index
}

function onDrop (event: DragEvent) {
  state.focusedIndex = - 1
  const item = (event.target as Element)?.closest(".draggable-list__item")
  if (item == null) return
  const srcIndex = parseInt(event.dataTransfer?.getData("text/plain") ?? "", 10)
  let dstIndex = parseInt(item.getAttribute("data-index") as string, 10)
  if (srcIndex < dstIndex && dstIndex > 0) dstIndex --
  moveElement(props.items, srcIndex, dstIndex)
}

function moveElement (array: Array<any>, fromIndex: number, toIndex: number) {
  if (fromIndex < 0 || fromIndex >= array.length) return
  if (toIndex < 0 || toIndex >= array.length) return
  const elementToMove = array.splice(fromIndex, 1)[0]
  array.splice(toIndex, 0, elementToMove)
  return array
}
</script>

<template>
  <div
    class="draggable-list"
    @dragover.prevent
    @drop="onDrop"
    @mouseenter="onMouseEnter"
  >
    <div
      v-for="item, index of items"
      :key="index"
      class="draggable-list__item"
      draggable="true"
      :data-index="index"
      @dragstart="onDragStart($event, index)"
      @dragenter="onDragEnter(index)"
    >
      <slot
        :item="item"
        :focused="index === state.focusedIndex"
      />
    </div>
  </div>
</template>
