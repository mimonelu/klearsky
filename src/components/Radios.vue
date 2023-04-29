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
  <div class="radios">
    <label
      v-for="option of options"
      :key="option.value"
      class="radio"
      :data-checked="state[model] === option.value"
    >
      <input
        v-model="state[model]"
        type="radio"
        :value="option.value"
        @change="onChange"
      >
      <SVGIcon :name="state[model] === option.value ? 'radioOn' : 'radioOff'" />
      <span>{{ $t(option.label) }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.radios {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;

  & > .radio {
    cursor: pointer;
    display: flex;

    & > .svg-icon {
      fill: rgba(var(--accent-color), 0.25);
      margin-top: 0.25rem;
      margin-right: 0.5rem;
    }
    &[data-checked="true"] > .svg-icon {
      fill: rgb(var(--accent-color));
    }

    & > span {
      color: rgba(var(--fg-color), 0.875);
      line-height: 1.5;
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
}
</style>
