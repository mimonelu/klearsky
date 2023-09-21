<script lang="ts" setup>
import Popup from "@/components/popups/Popup.vue"

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
    class="global-error-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <span>{{ $t("error") }}</span>
      </h2>
    </template>
    <template #body>
      <pre class="message-string">{{ error }}</pre>
      <pre
        v-if="typeof error !== 'string'"
        class="message-object"
      >{{ JSON.stringify(error) }}</pre>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.global-error-popup:deep() {
  .popup {
    --fg-color: var(--notice-color);
    width: calc($router-view-width - 4rem);
  }
}

.message-string {
  background-color: var(--notice-color-0125);
  line-height: var(--line-height);
  padding: 1rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-all;
}

.message-object {
  color: var(--fg-color);
  font-size: 0.875rem;
  line-height: var(--line-height);
  padding: 0 1rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
