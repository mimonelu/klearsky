<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/Popup.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState: MainState = inject("state") as MainState

const close = () => {
  emit("close")
}
</script>

<template>
  <Popup
    class="error-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>{{ $t("error") }}</h2>
    </template>
    <template v-slot:body>
      <pre class="message">{{ mainState.error }}</pre>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.error-popup:deep() {
  .popup {
    border-color: rgba(var(--notice-color), 0.5);
    width: 320px;
  }

  .popup-header {
    color: rgb(var(--notice-color));
  }
}

.message {
  background-color: rgba(var(--notice-color), 0.125);
  color: rgb(var(--notice-color));
  line-height: 1.5;
  padding: 1rem 2rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
