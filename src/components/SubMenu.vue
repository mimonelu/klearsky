<script lang="ts" setup>
import CopyRight from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
import SVGIcon from "@/components/SVGIcon.vue"

function moveToTop () {
  window.scrollTo({
    left: 0,
    top: 0,
    behavior: "smooth",
  })
}

function moveToBottom () {
  window.scrollTo({
    left: 0,
    top: document.body.clientHeight,
    behavior: "smooth",
  })
}
</script>

<template>
  <div class="sub-menu">
    <button
      class="move-button"
      @click.prevent="moveToTop"
    >
      <SVGIcon name="cursorUp" />
    </button>
    <Logo />
    <CopyRight />
    <button
      class="move-button"
      @click.prevent="moveToBottom"
    >
      <SVGIcon name="cursorDown" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.sub-menu {
  display: flex;
  flex-direction: column;
  grid-gap: 3rem;
  padding-top: 6rem;
  position: relative;
}

.move-button {
  backdrop-filter: blur(8px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  padding: 0.75rem;
  position: fixed;
  width: calc($menu-max-width - 1px);
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
.move-button:first-child {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  top: 0;
}
.move-button:last-child {
  border-top: 1px solid rgba(var(--fg-color), 0.25);
  bottom: 0;
}

.logo {
  font-size: 2rem;
}

.copyright {
  font-size: 0.875rem;
  padding: 0 1rem;
}
</style>
