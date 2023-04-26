<script setup lang="ts">
import {
  onErrorCaptured,
  onBeforeMount,
  onUnmounted,
  reactive
} from "vue"
import { RouterView } from "vue-router"
import IgnoreErrors from "@/consts/ignore-errors.json"
import ErrorPopup from "@/components/ErrorPopup.vue"
import Util from "@/composables/util/index"

const state = reactive<{
  error?: unknown;
}>({
  error: undefined
})

onBeforeMount(() => {
  window.addEventListener("unhandledrejection", processUnhandledError)
})

onUnmounted(() => {
  window.removeEventListener("unhandledrejection", processUnhandledError)
})

onErrorCaptured(processError)

function processUnhandledError (error: PromiseRejectionEvent) {
  processError(error.reason)
}

function processError (error: any) {
  if (IgnoreErrors.includes(error.error)) return
  Util.blurElement()
  state.error = error
}

function closeErrorPopup () {
  state.error = undefined
}
</script>

<template>
  <RouterView @error="processError" />
  <ErrorPopup
    v-if="state.error != null"
    :error="state.error"
    @close="closeErrorPopup"
  />
</template>
