<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"
import Loader from "@/components/shells/Loader.vue"

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
        name="arrowUp"
      />
      <SVGIcon
        v-else
        name="arrowDown"
      />
    </template>
    <Loader v-else />
  </button>
</template>

<style lang="scss" scoped>
.load-button {
  --fill-color: rgb(var(--fg-color), 0.5);
  background-clip: content-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 3rem;

  // 抜け漏れ取得ボタン
  &[data-direction="middle"] {
    background-color: rgb(var(--fg-color), 0.125);
  }

  & > .svg-icon {
    font-size: 1.5rem;
    fill: var(--fill-color);
  }

  &:focus, &:hover {
    --fill-color: rgb(var(--fg-color));
  }

  & > .loader {
    background-color: unset;
    font-size: 0.75rem;
    z-index: 1;
  }
}
</style>
