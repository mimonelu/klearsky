<script lang="ts" setup>
import { nextTick } from "vue"
import html2canvas from "html2canvas"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  element?: HTMLElement;
}>()

function screenshot () {
  emit("close")
  nextTick(async () => {
    if (props.element == null) return
    const canvas = await html2canvas(props.element, {
      allowTaint: false,
      backgroundColor: "#202020",
      foreignObjectRendering: false,
      logging: false,
      useCORS: true,
    })
    canvas.toBlob((blob) => {
      if (blob == null) return
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "image.jpg"
      a.click()
      URL.revokeObjectURL(a.href)
    })
  })
}
</script>

<template>
  <button @click.prevent.stop="screenshot">
    <SVGIcon name="clipboard" />
    <span>{{ $t("screenshotPost") }}</span>
  </button>
</template>
