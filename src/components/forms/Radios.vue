<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  state: any
  model: number | string
  options: Array<TTOption>
  required?: boolean
  disabled?: boolean
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
      :data-disabled="disabled ?? false"
    >
      <input
        v-model="state[model]"
        type="radio"
        :name="model.toString()"
        :value="option.value"
        :required="required ?? false"
        :disabled="disabled ?? false"
        @change="onChange"
      >
      <SVGIcon :name="state[model] === option.value ? 'radioOn' : 'radioOff'" />
      <SVGIcon
        v-if="option.icon != null"
        :name="option.icon"
      />
      <span>{{ $t(option.label) }}</span>
    </label>
  </div>
</template>
