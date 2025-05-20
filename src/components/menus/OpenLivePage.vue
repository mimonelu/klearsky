<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  actorStatus?: TIActorStatus
}>()

async function onActivate () {
  emit("close")
  if (!props.actorStatus?.embed?.external?.uri) {
    return
  }
  window.open(props.actorStatus.embed.external.uri, "_blank")
}
</script>

<template>
  <button
    v-if="actorStatus?.isActive && actorStatus?.embed?.external?.uri"
    @click.prevent.stop="onActivate"
  >
    <SVGIcon name="video" />
    <span>{{ $t("actorStatusOpenLivePage") }}</span>
  </button>
</template>
