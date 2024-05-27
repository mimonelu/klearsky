<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  text?: string;
  title?: string;
  url?: string;
}>()

const isSupported = navigator.share != null

async function share () {
  emit("close")

  // 未対応ブラウザ対策
  if (!isSupported) return

  const data: ShareData = {}
  if (props.text != null) data.text = props.text
  if (props.title != null) data.title = props.title
  if (props.url != null) data.url = props.url
  try {
    await navigator.share(data)
  } catch (error) {
    console.warn("[klearsky/WebShare]", error)
  }
}
</script>

<template>
  <button
    v-if="isSupported"
    @click.prevent.stop="share"
  >
    <SVGIcon name="share" />
    <span>{{ $t("share") }}</span>
  </button>
</template>
