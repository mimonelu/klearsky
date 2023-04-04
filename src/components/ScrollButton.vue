<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

function moveToTop () {
  blurElement()
  window.scrollTo({
    left: 0,
    top: 0,
    behavior: "smooth",
  })
}

function moveToBottom () {
  blurElement()
  window.scrollTo({
    left: 0,
    top: document.body.clientHeight,
    behavior: "smooth",
  })
}
</script>

<template>
  <button
    class="scroll-button scroll-button--up"
    @click.prevent="moveToTop"
  >
    <SVGIcon name="cursorUp" />
  </button>
  <button
    class="scroll-button scroll-button--down"
    @click.prevent="moveToBottom"
  >
    <SVGIcon name="cursorDown" />
  </button>
</template>

<style lang="scss" scoped>
.scroll-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  padding: 0.75rem;
  position: fixed;
  right: 0;
  min-width: 3rem;
  min-height: 3rem;
  z-index: 1;

  .svg-icon {
    fill: transparent;
    stroke: rgba(var(--fg-color), 0.25);
    stroke-width: 2px;
  }
  &:focus , &:hover {
    .svg-icon {
      stroke: rgb(var(--fg-color));
    }
  }
}
.scroll-button--up {
  top: 0;
}
.scroll-button--down {
  bottom: 0;
}
</style>
