<script setup lang="ts">
import {
  onErrorCaptured,
  reactive
} from "vue"
import { RouterView } from "vue-router"
import ErrorPopup from "@/components/ErrorPopup.vue"

const state = reactive<{
  error: unknown;
}>({
  error: null
})

onErrorCaptured((error: any) => {
  state.error = error
})

function closeErrorPopup () {
  state.error = null
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
