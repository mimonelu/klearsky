<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popup from "@/components/popups/Popup.vue"

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
    <template #header>
      <h2>
        <span>{{ mainState.confirmationPopupTitle }}</span>
      </h2>
    </template>
    <template #body>
      <div class="text">{{ mainState.confirmationPopupText }}</div>
      <div
        v-if="mainState.confirmationPopupDetail != null"
        class="detail"
      >{{ mainState.confirmationPopupDetail }}</div>
    </template>
    <template #footer>
      <div class="button-container">
        <button
          class="button--bordered"
          ref="cancelButton"
          @click="close"
        >
          <span>{{ $t("no") }}</span>
        </button>
        <button
          class="button"
          @click="apply"
        >
          <span>{{ $t("yes") }}</span>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.confirmation-popup {
  .text,
  .detail {
    line-height: var(--line-height-high);
    user-select: text;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .detail {
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius);
    color: var(--fg-color-075);
    padding: 0.5rem 1rem;
  }

  .button-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem;
    margin: 0 1rem 1rem 1rem;
  }
}
</style>
