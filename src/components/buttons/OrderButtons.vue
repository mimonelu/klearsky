<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"
</script>

<template>
  <div class="order-buttons group-buttons">
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
}
</style>
