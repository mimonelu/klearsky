<script setup lang="ts">
import {
  onErrorCaptured,
  reactive
} from "vue"
import { RouterView } from "vue-router"
import IgnoreErrors from "@/consts/ignore-errors.json"
import ErrorPopup from "@/components/ErrorPopup.vue"

const state = reactive<{
  error?: unknown;
}>({
  error: undefined
})

onErrorCaptured((error: any) => {
  if (IgnoreErrors.includes(error.error)) return
  state.error = error
})

function closeErrorPopup () {
  state.error = undefined
}
</script>

<template>
  <RouterView />
  <ErrorPopup
    v-if="state.error != null"
    :error="state.error"
    @close="closeErrorPopup"
  />
</template>
