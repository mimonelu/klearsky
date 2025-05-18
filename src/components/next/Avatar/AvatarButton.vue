<script lang="ts" setup>
import { inject } from "vue"
import AvatarThumbnail from "@/components/next/Avatar/AvatarThumbnail.vue"

const props = defineProps<{
  image?: string
  isLabeler?: boolean
  actorStatus?: TIActorStatus
}>()

const mainState = inject("state") as MainState

function openImagePopup () {
  if (!props.image) return
  mainState.imagePopupProps.images = [{
    largeUri: props.image,
    smallUri: "",
  }]
  mainState.imagePopupProps.alts = [""]
  mainState.imagePopupProps.index = 0
  mainState.imagePopupProps.display = true
}
</script>

<template>
  <button
    type="button"
    class="avatar-button"
    @click.stop="openImagePopup"
  >
    <AvatarThumbnail
      :image="image"
      :isLabeler="isLabeler"
      :actorStatus="actorStatus"
    />
  </button>
</template>

<style lang="scss" scoped>
.avatar-thumbnail:deep(.avatar-thumbnail__inner) {
  box-shadow: 0 0 0 4px rgb(var(--bg-color));
  min-width: 1em;
  max-width: 1em;
  min-height: 1em;
  max-height: 1em;
}
</style>
