<script lang="ts" setup>
import { inject } from "vue"
import { blurElement } from "@/composables/misc"

const props = defineProps<{
  viewer: TTUserViewer
  did: string
  declarationDid: string
}>()

const mainState = inject("state") as MainState

async function toggleFollow () {
  blurElement()
  mainState.processing = true
  try {
    if (props.viewer.following != null) {
      await mainState.atp.deleteFollow(props.viewer.following)
      props.viewer.following = undefined
    } else {
      const uri = await mainState.atp.createFollow(props.declarationDid)
      if (uri != null) props.viewer.following = uri
    }
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <button
    class="button follow-button"
    :data-is-following="viewer.following != null"
    @click.prevent="toggleFollow"
  >
    <span v-if="viewer.following != null">{{ $t("following") }}</span>
    <span v-else>{{ $t("follow") }}</span>
  </button>
</template>

<style lang="scss" scoped>
.follow-button {
  &[data-is-following="true"] {
    background-color: rgba(var(--like-color), 0.875);
    &:focus, &:hover {
      background-color: rgb(var(--like-color));
    }
  }
}
</style>
