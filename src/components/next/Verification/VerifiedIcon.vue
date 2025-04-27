<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  verification?: TIVerification
}>()
</script>

<template>
  <SVGIcon
    v-if="verification?.verifiedStatus === 'valid'"
    name="verified"
    class="verified-icon"
    :title="$t('verified')"
  />
</template>

<style lang="scss" scoped>
.verified-icon {
  fill: rgb(var(--accent-color));
}
</style>
