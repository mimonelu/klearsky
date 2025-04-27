<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  did?: string
  displayName?: string
  verification?: TIVerification
}>()

const mainState = inject("state") as MainState

async function onActivate () {
  emit("close")
  if (props.did == null) {
    return
  }
  mainState.openVerifiersPopup({
    displayName: props.displayName,
    verification: props.verification,
  })
}
</script>

<template>
  <button
    v-if="verification?.verifiedStatus === 'valid'"
    @click.prevent.stop="onActivate"
  >
    <SVGIcon name="verifier" />
    <span>{{ $t("verifiers") }}</span>
  </button>
</template>
