<script lang="ts" setup>
import { ref } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  buttonClass?: string
  icon?: string
  label: string
}>()

const display = ref(false)
</script>

<template>
  <div class="accordion">
    <button
      type="button"
      :class="buttonClass ?? 'button'"
      @click.stop="() => (display = !display)"
    >
      <SVGIcon
        v-if="icon != null"
        :name="icon"
      />
      <span>{{ label }}</span>
      <SVGIcon :name="display ? 'cursorUp' : 'cursorDown'" />
    </button>
    <slot v-if="display" />
  </div>
</template>

<style lang="scss" scoped>
.accordion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
