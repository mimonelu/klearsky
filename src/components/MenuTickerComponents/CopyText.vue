<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  label: string;
  text?: string;
}>()

async function copy () {
  Util.blurElement()
  if (props.text == null) return
  await navigator.clipboard.writeText(props.text)
  emit("close")
}
</script>

<template>
  <button @click.stop="copy">
    <SVGIcon name="clipboard" />
    <span>{{ $t(label) }}</span>
  </button>
</template>
