<script lang="ts" setup>
import { ref } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{
  (event: "toggleDisplay", display: boolean): void
}>()

const props = defineProps<{
  buttonClass?: string
  defaultDisplay?: boolean
  icon?: string
  label: string
}>()

const display = ref(props.defaultDisplay ?? false)

function toggleDisplay () {
  display.value = !display.value
  emit("toggleDisplay", display.value)
}
</script>

<template>
  <div
    class="accordion"
    :data-display="display"
  >
    <button
      type="button"
      class="accordion__button"
      :class="buttonClass ?? 'button'"
      @click.stop="toggleDisplay"
    >
      <SVGIcon
        v-if="icon != null"
        :name="icon"
      />
      <span>{{ label }}</span>
      <SVGIcon :name="display ? 'cursorUp' : 'cursorDown'" />
    </button>
    <div class="accordion__content">
      <slot v-if="display" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.accordion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  & > button > span {
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
