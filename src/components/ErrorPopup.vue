<script lang="ts" setup>
import Popup from "@/components/Popup.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  error?: unknown
  description?: unknown
}>()

const url = window.location.href

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
      <pre class="message">{{ $t(error) }}
* {{ description }}
* {{ url }}</pre>
      <pre class="help">{{ $t("errorNotification") }} <a
        class="textlink"
        href="https://bsky.app/profile/mimonelu.net"
        rel="noreferrer"
        target="_blank"
      >@mimonelu.net</a> </pre>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.error-popup:deep() {
  .popup {
    --fg-color: var(--notice-color);
    width: calc($router-view-width - 4rem);
  }
}

.message {
  background-color: rgba(var(--fg-color), 0.125);
  line-height: var(--line-height);
  padding: 1rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-all;
}

.help {
  font-size: 0.875rem;
  line-height: var(--line-height);
  padding: 0 1rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
