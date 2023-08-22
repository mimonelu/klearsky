<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  text?: string
  langs?: string[]
}>()

function translate () {
  Util.blurElement()
  if (props.text == null) return
  emit("close")
  const language = Util.getUserLanguage()
  window.open(`https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(props.text)}&op=translate`)
}
</script>

<template>
  <button @click.prevent.stop="translate">
    <SVGIcon name="translate" />
    <span>{{ $t("translate") }}</span>
    <span v-if="langs != null">({{ langs?.join("/").toUpperCase() }})</span>
  </button>
</template>
