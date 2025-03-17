<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  isWindow?: boolean
}>()

const selfElement = ref()

let target: undefined | Window | HTMLElement

defineExpose({
  diffScrollBottom,
})

onMounted(() => {
  if (props.isWindow) {
    target = window
  } else {
    target = selfElement?.value?.parentNode
  }

  target?.addEventListener("scroll", onScroll)
})

onBeforeUnmount(() => {
  target?.removeEventListener("scroll", onScroll)
})

function diffScrollBottom (): undefined | number {
  if (target == null) {
    return
  }

  if (props.isWindow) {
    return Math.abs(window.scrollY - (
      window.document.documentElement.scrollHeight -
      window.document.documentElement.clientHeight
    ))
  }

  return Math.abs((target as HTMLElement).scrollTop - (
    (target as HTMLElement).scrollHeight -
    (target as HTMLElement).clientHeight
  ))
}

let isEnter = false

function onScroll () {
  if (target == null) {
    return
  }
  const threshold = 64
  const diff = diffScrollBottom()
  if (diff != null && diff < threshold) {
    if (!isEnter) {
      emit("scrolledToBottom")
    }
    isEnter = true
  } else {
    isEnter = false
  }
}
</script>

<template>
  <div
    class="scroll-observer"
    ref="selfElement"
  />
</template>

<style lang="scss" scoped>
.scroll-observer {
  display: contents;
}
</style>
