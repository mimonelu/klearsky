<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, reactive } from "vue"
import Overlay from "@/components/next/GlobalError/Overlay.vue"

const $t = inject("$t") as Function

const state = reactive<{
  error?: any
}>({
  error: undefined,
})

onMounted(() => {
  window.addEventListener("error", onError)
  window.addEventListener("unhandledrejection", onUnhandledrejection)
  window.addEventListener("rejectionhandled", onRejectionhandled)
})

onBeforeUnmount(() => {
  window.removeEventListener("error", onError)
  window.removeEventListener("unhandledrejection", onUnhandledrejection)
  window.removeEventListener("rejectionhandled", onRejectionhandled)
})

function onError (event: ErrorEvent) {
  state.error = ("" + event.error) || $t("globalError")
}

function onUnhandledrejection (event: PromiseRejectionEvent) {
  state.error = ("" + event.reason) || $t("unhandledRejectionError")
}

function onRejectionhandled (event: PromiseRejectionEvent) {
  state.error = ("" + event.reason) || $t("rejectionHandledError")
}

function closeOverlay () {
  state.error = undefined
}
</script>

<template>
  <Overlay
    v-if="state.error != null"
    :error="state.error"
    @close="closeOverlay"
  />
</template>
