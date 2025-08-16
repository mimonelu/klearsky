<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  state: any
  model: number | string
  label?: string
  required?: boolean
  disabled?: boolean
  booleanboxLabel?: string
}>()

function onChange () {
  emit("update")
}
</script>

<template>
  <div
    class="checkboxes booleanbox"
    data-layout="horizontal"
  >
    <label
      class="checkbox"
      :data-checked="state[model]"
      :data-disabled="disabled ?? false"
    >
      <input
        v-model="
          // eslint-disable-next-line
          state[model]
        "
        type="checkbox"
        :name="model.toString()"
        :value="true"
        :required="required ?? false"
        :disabled="disabled ?? false"
        @change="onChange"
      >
      <SVGIcon :name="state[model] ? 'checkboxOn' : 'checkboxOff'" />
      <div v-if="booleanboxLabel">
        <span class="label">{{ $t(booleanboxLabel) }}</span>
      </div>
    </label>
  </div>
</template>
