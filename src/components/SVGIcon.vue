<script lang="ts" setup>
// SEE: https://pictogrammers.com/library/mdi/
import cross from "@/svg/cross.svg?raw"
import hand from "@/svg/hand.svg?raw"
import plus from "@/svg/plus.svg?raw"
import post from "@/svg/post.svg?raw"
import repost from "@/svg/repost.svg?raw"
import shimmer from "@/svg/shimmer.svg?raw"
import thumbUp from "@/svg/thumb-up.svg?raw"
import thumbDown from "@/svg/thumb-down.svg?raw"

const icons: { [key: string]: string } = {
  cross,
  hand,
  plus,
  post,
  repost,
  shimmer,
  thumbUp,
  thumbDown,
}

defineProps<{
  name: string
}>()
</script>

<template>
  <div
    v-html="icons[name]"
    class="svg-icon"
  />
</template>

<style lang="scss" scoped>
.svg-icon {
  position: relative;
  width: 1em;
  height: 1em;

  &:deep(svg) {
    height: 100%;
  }
}
</style>
