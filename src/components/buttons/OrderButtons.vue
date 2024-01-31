<script lang="ts" setup>
import SVGIcon from "@/components/common/SVGIcon.vue"
</script>

<template>
  <div class="order-buttons">
    <button
      class="button--bordered"
      @click.prevent.stop="$emit('moveTop')"
    >
      <SVGIcon name="arrowTop" />
    </button>
    <button
      class="button--bordered"
      @click.prevent.stop="$emit('moveUp')"
    >
      <SVGIcon name="arrowUp" />
    </button>
    <button
      class="button--bordered"
      @click.prevent.stop="$emit('moveDown')"
    >
      <SVGIcon name="arrowDown" />
    </button>
    <button
      class="button--bordered"
      @click.prevent.stop="$emit('moveBottom')"
    >
      <SVGIcon name="arrowBottom" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.order-buttons {
  color: rgb(var(--fg-color));
  display: flex;

  & > button {
    &:not(:last-child) {
      border-right-style: none;
    }
    &:first-child {
      border-top-right-radius: unset;
      border-bottom-right-radius: unset;
    }
    &:last-child {
      border-top-left-radius: unset;
      border-bottom-left-radius: unset;
    }
    &:not(:first-child):not(:last-child) {
      border-radius: unset;
    }
    &:focus, &:hover {
      border-color: var(--fg-color-025);
    }
  }
}
</style>
