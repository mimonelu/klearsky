<script lang="ts" setup>
import Popup from "@/components/Popup.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  error?: unknown;
}>()

function close () {
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
      <h2>
        <span>{{ $t("error") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <pre class="message">{{ error }}
{{ JSON.stringify(error) }}</pre>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.error-popup:deep() {
  .popup {
    border-color: rgba(var(--notice-color), 0.5);
    width: calc($router-view-width - 4rem);
  }

  .popup-header {
    color: rgb(var(--notice-color));
  }
}

.message {
  background-color: rgba(var(--notice-color), 0.125);
  color: rgb(var(--notice-color));
  line-height: 1.5;
  padding: 1rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
