<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  source?: any;
}>()

function openSource () {
  if (props.source == null) return
  Util.displayJson(props.source)
  emit("close")
}
</script>

<template>
  <button @click.stop="openSource">
    <SVGIcon name="json" />
    <span>{{ $t("showSource") }}</span>
  </button>
</template>
