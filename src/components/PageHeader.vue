<script lang="ts" setup>
import { useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

defineProps<{
  hasBackButton?: boolean;
  title?: string;
  subTitle?: string;
}>()

const router = useRouter()

function onActivateHeader () {
  Util.blurElement()
  window.scrollTo({
    left: 0,
    top: 0,
    behavior: "smooth",
  })
}

function onActivateBackButton () {
  Util.blurElement()
  if (history.state.back != null) router.back()
}
</script>

<template>
  <header
    class="page-header"
    :data-has-back-button="hasBackButton"
    @click.stop="onActivateHeader"
  >
    <button
      v-if="hasBackButton"
      class="back-button"
      @click.prevent.stop="onActivateBackButton"
    >
      <SVGIcon name="cursorLeft" />
    </button>
    <h1 v-if="title">{{ title }}</h1>
    <div
      v-if="subTitle"
      class="separator"
    />
    <h2 v-if="subTitle">{{ subTitle }}</h2>
    <div
      v-if="$slots.right != null"
      class="right"
    >
      <slot name="right" />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.page-header {
  background-color: rgba(var(--bg-color), var(--main-area-opacity));
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  grid-gap: 0.5rem;
  padding: 0.75rem;
  position: sticky;
  top: 0;
  min-height: 3rem;
  max-width: 100vw;
  z-index: 1;

  & > h1,
  & > h2 {
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > h1 {
    font-weight: bold;
  }
}

.back-button {
  cursor: pointer;
  margin: -1rem -0.25rem -1rem -0.75rem;
  padding: 1rem 1.25rem;
  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }

  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.5);
  }
}

.separator {
  background-color: rgb(var(--fg-color));
  width: 1rem;
  height: 1px;
}

.right {
  display: flex;
  align-items: center;
  grid-gap: 0.75rem;
  margin-left: auto;
}
</style>
