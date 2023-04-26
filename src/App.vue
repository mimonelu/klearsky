<script setup lang="ts">
import {
  onErrorCaptured,
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

onErrorCaptured((error: any) => {
  if (IgnoreErrors.includes(error.error)) return
  Util.blurElement()
  state.error = error
})

function onError (error: any) {
  state.error = error
}

function closeErrorPopup () {
  state.error = undefined
}
</script>

<template>
  <RouterView @error="onError" />
  <ErrorPopup
    v-if="state.error != null"
    :error="state.error"
    @close="closeErrorPopup"
  />
</template>
