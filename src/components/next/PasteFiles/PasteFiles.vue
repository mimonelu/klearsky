<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted } from "vue"

const mainState = inject("state") as MainState

onMounted(() => {
  window.addEventListener("paste", onPaste)
})

onBeforeUnmount(() => {
  window.removeEventListener("paste", onPaste)
})

function onPaste (event: ClipboardEvent) {
  if (!mainState.atp.hasLogin() ||
      event.clipboardData?.items == null
  ) {
    return
  }
  if (mainState.attachFilesToPost(event.clipboardData.items)) {
    // ファイル名がテキストエリアにペーストされる現象を回避
    event.preventDefault()
  }
}
</script>

<template />
