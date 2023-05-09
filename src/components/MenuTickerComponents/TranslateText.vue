<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  text?: string;
}>()

function translate () {
  Util.blurElement()
  if (props.text == null) return
  emit("close")
  const language = window.navigator.language
  window.open(`https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(props.text)}&op=translate`)
}
</script>

<template>
  <button @click.prevent.stop="translate">
    <SVGIcon name="translate" />
    <span>{{ $t("translate") }}</span>
  </button>
</template>
