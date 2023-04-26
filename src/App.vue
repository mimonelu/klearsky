<script setup lang="ts">
import {
  inject,
  onErrorCaptured,
  onBeforeMount,
  onUnmounted,
  reactive
} from "vue"
import { RouterView } from "vue-router"
import ErrorPopup from "@/components/ErrorPopup.vue"
import Util from "@/composables/util/index"
import IgnoreErrors from "@/consts/ignore-errors.json"
import ReplaceErrors from "@/consts/replace-errors.json"

const $t = inject("$t") as Function

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
  Util.blurElement()
  if (IgnoreErrors.includes(error.error)) return
  if (ReplaceErrors.includes(error.error)) {
    state.error = $t(error.error)
    return
  }
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
