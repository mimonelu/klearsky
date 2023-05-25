<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  state: any
  model: string
  options: Array<TTOption>
  required?: boolean
  layout?: "horizontal" | "vertical"
}>()

function onChange () {
  emit("update")
}
</script>

<template>
  <div
    class="checkboxes"
    :data-layout="layout ?? 'vertical'"
  >
    <label
      v-for="option of options"
      :key="option.value"
      class="checkbox"
      :data-checked="state[model]?.includes(option.value)"
    >
      <input
        v-model="state[model]"
        type="checkbox"
        :name="model"
        :value="option.value"
        :required="required ?? false"
        @change="onChange"
      >
      <SVGIcon :name="state[model]?.includes(option.value) ? 'checkboxOn' : 'checkboxOff'" />
      <span>{{ $t(option.label) }}</span>
    </label>
  </div>
</template>
