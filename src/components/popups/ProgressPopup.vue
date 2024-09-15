<script lang="ts" setup>
import Popup from "@/components/popups/Popup.vue"

defineProps<{
  value: number
  message?: string
}>()
</script>

<template>
  <Popup
    class="progress-popup"
    :hasCloseButton="false"
    :loaderDisplay="false"
  >
    <template #body>
      <div
        v-if="message"
        class="progress-popup__message"
      >{{ message }}</div>
      <div class="progress-popup__bar">
        <div
          class="progress-popup__bar__inner"
          :style="{ width: `${value}%` }"
        />
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.progress-popup {
  &:deep() {
    .popup {
      width: auto;
    }
  }

  &__message {
    text-align: center;
  }

  &__bar {
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: 1rem;
    overflow: hidden;
    width: 240px;
    height: 0.5rem;

    &__inner {
      background-color: rgb(var(--accent-color));
      border-radius: 1rem;
      transition: width 250ms linear;
      height: 100%;
    }
  }
}
</style>
