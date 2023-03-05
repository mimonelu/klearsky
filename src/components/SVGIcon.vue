<script lang="ts" setup>
import plus from "@/svg/plus.svg?raw"

const icons: { [key: string]: string } = {
  plus,
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
  width: 1em;
  height: 1em;
}
</style>
