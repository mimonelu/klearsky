<script lang="ts" setup>
// import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  verification?: TIVerification
}>()

// const mainState = inject("state") as MainState

async function onActivate () {
  emit("close")
  if (props.verification == null) {
    return
  }
  // mainState.openVerifierPopup(props.verification)
}
</script>

<template>
  <button
    v-if="verification?.trustedVerifierStatus === 'valid'"
    @click.prevent.stop="onActivate"
  >
    <SVGIcon name="verified" />
    <span>{{ $t("verifiedAccounts") }}</span>
  </button>
</template>
