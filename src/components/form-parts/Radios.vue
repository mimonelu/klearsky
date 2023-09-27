<script lang="ts" setup>
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  state: any
  model: string
  options: Array<TTOption>
  required?: boolean
  layout?: "horizontal" | "vertical" | "vertical-2columns"
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
        :name="model"
        :value="option.value"
        :required="required ?? false"
        @change="onChange"
      >
      <SVGIcon :name="state[model] === option.value ? 'radioOn' : 'radioOff'" />
      <span>{{ $t(option.label) }}</span>
    </label>
  </div>
</template>
