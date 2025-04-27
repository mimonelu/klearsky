<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const props = defineProps<{
  did?: string
  displayName?: string
  verification?: TIVerification
}>()

async function onActivate () {
  Util.blurElement()
  if (props.did == null) {
    return
  }
  mainState.openVerifiedAccountsPopup({
    did: props.did,
    displayName: props.displayName,
  })
}
</script>

<template>
  <button
    v-if="verification?.trustedVerifierStatus === 'valid'"
    type="button"
    class="verifier-icon"
    :title="$t('verifier')"
    @click.prevent.stop="onActivate"
  >
    <SVGIcon name="verifier" />
  </button>
</template>

<style lang="scss" scoped>
.verifier-icon {
  cursor: pointer;

  .svg-icon {
    fill: rgb(var(--accent-color), 0.875);
  }
  &:focus,
  &:hover {
    .svg-icon {
      fill: rgb(var(--accent-color));
    }
  }
}
</style>
