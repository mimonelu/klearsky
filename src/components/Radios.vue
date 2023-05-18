<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  state: any
  model: string
  options: Array<TTOption>
  layout?: "horizontal" | "vertical"
}>()

function onChange () {
  emit("update")
}
</script>

<template>
  <div
    class="radios"
    :data-layout="layout ?? 'vertical'"
  >
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
