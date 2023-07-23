<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"
import Loader from "@/components/Loader.vue"

const emit = defineEmits<(name: string, direction: "old" | "middle" | "new") => void>()

const props = defineProps<{
  direction: "old" | "middle" | "new"
  processing: boolean
}>()

function onActivate () {
  if (props.processing) return
  emit("activate", props.direction)
}
</script>

<template>
  <button
    class="load-button"
    :data-direction="direction"
    @click.prevent="onActivate"
  >
    <template v-if="!processing">
      <SVGIcon
        v-if="direction === 'new'"
        name="cursorUp"
      />
      <SVGIcon
        v-else
        name="cursorDown"
      />
    </template>
    <Loader v-else />
  </button>
</template>

<style lang="scss" scoped>
.load-button {
  background-clip: content-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 3rem;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  }
  &:last-child {
    border-top: 1px solid rgba(var(--fg-color), 0.25);
  }

  // 抜け漏れ取得ボタン
  &[data-direction="middle"] {
    background-color: rgba(var(--accent-color), 0.25);
  }

  & > .svg-icon {
    font-size: 1.5rem;
    fill: rgba(var(--fg-color), 0.25);
  }

  &:focus, &:hover {
    & > .svg-icon {
      fill: rgba(var(--fg-color), 0.75);
    }
  }

  & > .loader {
    font-size: 0.75rem;
    z-index: 1;
  }
}
</style>
