<script lang="ts" setup>
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  state: any
  model: string
  options: Array<TTOption>
  required?: boolean
  limit?: number
  layout?: "horizontal" | "vertical" | "vertical-2columns"
}>()

function onChange () {
  // 最大選択可能数の処理
  if (props.limit != null && props.limit <= props.state[props.model].length) {
    props.state[props.model].splice(props.limit)
    return
  }

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
