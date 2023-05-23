<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/Loader.vue"
import Util from "@/composables/util"

const props = defineProps<{
  viewer: TTUserViewer
  did: string
  declarationDid: string
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean;
}>({
  processing: false,
})

async function toggleFollow () {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  try {
    if (props.viewer.following != null) {
      await mainState.atp.deleteFollow(props.viewer.following)
      props.viewer.following = undefined
    } else {
      const uri = await mainState.atp.createFollow(props.declarationDid)
      if (uri != null) props.viewer.following = uri
    }
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <button
    class="button follow-button"
    :data-is-following="viewer.following != null"
    :data-is-processing="state.processing"
    @click.prevent="toggleFollow"
  >
    <span v-if="viewer.following != null">{{ $t("following") }}</span>
    <span v-else>{{ $t("follow") }}</span>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.follow-button {
  position: relative;
  &[data-is-following="true"] {
    background-color: rgba(var(--like-color), 0.875);
    &:focus, &:hover {
      background-color: rgb(var(--like-color));
    }
  }
  &[data-is-processing="true"] {
    pointer-events: none;
  }

  & > .loader {
    font-size: 0.5rem;
    position: absolute;
  }
}
</style>
