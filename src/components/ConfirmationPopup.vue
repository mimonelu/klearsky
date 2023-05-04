<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popup from "@/components/Popup.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  title?: string;
  text?: string;
}>()

const mainState = inject("state") as MainState

const cancelButton = ref()

onMounted(() => {
  cancelButton.value.focus()
})

function close () {
  emit("close")
}

function apply () {
  emit("apply")
}
</script>

<template>
  <Popup
    class="confirmation-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <span>{{ mainState.confirmationPopupTitle }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <div class="text">{{ mainState.confirmationPopupText }}</div>
    </template>
    <template v-slot:footer>
      <div class="button-container">
        <button
          class="button--bordered"
          ref="cancelButton"
          @click="close"
        >{{ $t("no") }}</button>
        <button
          class="button"
          @click="apply"
        >{{ $t("yes") }}</button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.confirmation-popup {
  .text {
    line-height: 1.5;
    user-select: text;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .button-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem;
    margin: 0 1rem 1rem 1rem;
  }
}
</style>
