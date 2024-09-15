<script lang="ts" setup>
import Popup from "@/components/popups/Popup.vue"

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
    <template #header>
      <h2>
        <span>{{ $t("error") }}</span>
      </h2>
    </template>
    <template #body>
      <pre class="message">{{ $t(error) }}
* {{ description }}
* {{ url }}</pre>
      <pre class="help">{{ $t("errorNotification") }} <a
        class="textlink"
        href="https://bsky.app/profile/mimonelu.net"
        rel="noreferrer"
        target="_blank"
      ><span>@mimonelu.net</span></a> </pre>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.error-popup:deep() {
  // Loader より上に配置
  z-index: 4;

  .popup {
    --fg-color: var(--notice-color);
  }
}

.message {
  background-color: rgb(var(--fg-color), 0.125);
  line-height: var(--line-height-high);
  padding: 1rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-all;
}

.help {
  font-size: 0.875rem;
  line-height: var(--line-height-high);
  padding: 0 1rem;
  user-select: text;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
