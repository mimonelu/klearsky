<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  label: string;
  text?: string;
}>()

async function copy () {
  emit("close")
  if (props.text == null) return
  await Util.writeTextToClipboard(props.text)
}
</script>

<template>
  <button @click.prevent.stop="copy">
    <SVGIcon name="clipboard" />
    <span>{{ $t(label) }}</span>
  </button>
</template>
