<script lang="ts" setup>
// SEE: https://pictogrammers.com/library/mdi/
import cross from "@/svg/cross.svg?raw"
import cursorDown from "@/svg/cursor-down.svg?raw"
import cursorLeft from "@/svg/cursor-left.svg?raw"
import cursorRight from "@/svg/cursor-right.svg?raw"
import cursorUp from "@/svg/cursor-up.svg?raw"
import edit from "@/svg/edit.svg?raw"
import heart from "@/svg/heart.svg?raw"
import heartBroken from "@/svg/heart-broken.svg?raw"
import json from "@/svg/json.svg?raw"
import plus from "@/svg/plus.svg?raw"
import post from "@/svg/post.svg?raw"
import repost from "@/svg/repost.svg?raw"
import shimmer from "@/svg/shimmer.svg?raw"
import setting from "@/svg/setting.svg?raw"
import timeline from "@/svg/timeline.svg?raw"

const icons: { [key: string]: string } = {
  cross,
  cursorDown,
  cursorLeft,
  cursorRight,
  cursorUp,
  edit,
  heart,
  heartBroken,
  json,
  plus,
  post,
  repost,
  setting,
  shimmer,
  timeline,
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
  min-width: 1em;
  height: 1em;

  &:deep(svg) {
    height: 100%;
  }
}
</style>
