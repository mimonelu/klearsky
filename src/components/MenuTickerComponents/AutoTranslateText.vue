<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string): void}>()

function translate () {
  Util.blurElement()
  emit("close")
}
</script>

<template>
  <button @click.prevent.stop="translate">
    <SVGIcon name="translate" />
    <span>{{ $t("autoTranslate") }}</span>
  </button>
</template>
