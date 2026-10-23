<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { useSafeExternalUrl } from "@/composables/util/use-safe-external-url"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  actorStatus?: TIActorStatus
}>()

const { openInvalidUrlPopup } = useSafeExternalUrl()

async function onActivate () {
  emit("close")
  const uri = props.actorStatus?.embed?.external?.uri
  if (!uri) {
    return
  }
  const safeUri = Util.safeExternalUrl(uri)
  if (safeUri == null) {
    openInvalidUrlPopup(uri)
    return
  }
  window.open(safeUri, "_blank")
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
