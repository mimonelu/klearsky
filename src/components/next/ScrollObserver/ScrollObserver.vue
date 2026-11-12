<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  isWindow?: boolean
}>()

const selfElement = ref()

let target: undefined | Window | HTMLElement

let isEnter = false

defineExpose({
  diffScrollBottom,
})

onMounted(() => {
  if (props.isWindow) {
    target = window
  } else {
    target = selfElement?.value?.parentNode
  }

  // MEMO: デバウンスで間引かないこと
  // スクロール中に判定が走らず、最下部から出たことを記録し損ねて発火しなくなる
  // スクロールイベントは 1 フレームに 1 回しか来ないため、判定の回数は増えすぎない
  target?.addEventListener("scroll", onScroll, { passive: true })
})

onBeforeUnmount(() => {
  target?.removeEventListener("scroll", onScroll)
})

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

function diffScrollBottom (): undefined | number {
  if (target == null) {
    return
  }
  if (props.isWindow) {
    // MEMO: 表示領域の高さに `documentElement.clientHeight` を使わないこと
    // スマホではアドレスバーなどが隠れても変わらず、計算上の最下部まで実際にはスクロールできなくなる
    return Math.abs(window.scrollY - (
      window.document.documentElement.scrollHeight -
      window.innerHeight
    ))
  }
  return Math.abs((target as HTMLElement).scrollTop - (
    (target as HTMLElement).scrollHeight -
    (target as HTMLElement).clientHeight
  ))
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
