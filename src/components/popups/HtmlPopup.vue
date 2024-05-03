<script lang="ts" setup>
import Popup from "@/components/popups/Popup.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  title?: string;
}>()

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="html-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <span>{{ title }}</span>
      </h2>
    </template>
    <template #body>
      <div class="html">
        <slot />
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.html-popup {
  .html {
    line-height: var(--line-height-high);
    user-select: text;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
