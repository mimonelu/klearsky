<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  state: any
  model: string
  options: Array<TTOption>
}>()

function onChange () {
  emit("update")
}
</script>

<template>
  <div class="checkboxes">
    <label
      v-for="option of options"
      :key="option.value"
      class="checkbox"
      :data-checked="state[model].includes(option.value)"
    >
      <input
        v-model="state[model]"
        type="checkbox"
        :value="option.value"
        @change="onChange"
      >
      <SVGIcon name="check" />
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.checkbox {
  cursor: pointer;
  display: flex;
  align-items: center;

  & > .svg-icon {
    fill: rgba(var(--accent-color), 0.25);
    margin-right: 0.5rem;
  }
  &[data-checked="true"] > .svg-icon {
    fill: rgb(var(--accent-color));
  }

  & > span {
    color: rgba(var(--fg-color), 0.875);
    line-height: 1.375;
  }
  &:focus > span,
  &:hover > span {
    color: rgb(var(--fg-color));
  }
  &[data-checked="true"] > span {
    color: rgba(var(--accent-color), 0.875);
  }
  &[data-checked="true"]:focus > span,
  &[data-checked="true"]:hover > span {
    color: rgb(var(--accent-color));
  }
}
</style>
