<script setup lang="ts">
import { inject, onErrorCaptured, reactive } from "vue"
import { RouterView } from "vue-router"
import GlobalErrorPopup from "@/components/popups/GlobalErrorPopup.vue"
import Util from "@/composables/util"
import IGNORE_ERRORS from "@/consts/ignore-errors.json"
import REPLACE_ERRORS from "@/consts/replace-errors.json"

const $t = inject("$t") as Function

const state = reactive<{
  error?: unknown;
}>({
  error: undefined
})

onErrorCaptured(processError)

function processError (error: any) {
  Util.blurElement()
  if (IGNORE_ERRORS.includes(error.error)) return
  if (REPLACE_ERRORS.includes(error.error)) {
    state.error = $t(error.error)
    return
  }
  state.error = error
}

function closeGlobalErrorPopup () {
  state.error = undefined
}
</script>

<template>
  <RouterView @error="processError" />
  <GlobalErrorPopup
    v-if="state.error != null"
    :error="state.error"
    @close="closeGlobalErrorPopup"
  />
</template>
