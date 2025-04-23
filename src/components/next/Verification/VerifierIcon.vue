<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  verification?: TIVerification
}>()
</script>

<template>
  <SVGIcon
    v-if="verification?.trustedVerifierStatus === 'valid'"
    name="verifier"
    class="verifier-icon"
  />
</template>

<style lang="scss" scoped>
.verifier-icon {
  fill: rgb(var(--accent-color));
}
</style>
