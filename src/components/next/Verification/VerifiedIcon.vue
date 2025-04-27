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
  mainState.openVerifiersPopup({
    displayName: props.displayName,
    verification: props.verification,
  })
}
</script>

<template>
  <button
    v-if="verification?.verifiedStatus === 'valid'"
    type="button"
    class="verified-icon"
    :title="$t('verified')"
    @click.prevent.stop="onActivate"
  >
    <SVGIcon name="verified" />
  </button>
</template>

<style lang="scss" scoped>
.verified-icon {
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
