<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

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
  <button @click.prevent.stop="openSource">
    <SVGIcon name="json" />
    <span>{{ $t("showSource") }}</span>
  </button>
</template>
