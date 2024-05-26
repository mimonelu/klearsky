<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  text?: string
  langs?: string[]
}>()

function translate () {
  Util.blurElement()
  Util.translateInExternalService(props.text)
  emit("close")
}
</script>

<template>
  <button @click.prevent.stop="translate">
    <SVGIcon name="translate" />
    <span>{{ $t("translate") }}</span>
    <span v-if="langs != null && langs.length > 0">({{ langs.join("/").toUpperCase() }})</span>
  </button>
</template>
