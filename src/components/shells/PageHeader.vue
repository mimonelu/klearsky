<script lang="ts" setup>
import { useRouter } from "vue-router"
import SVGIcon from "@/components/images/SVGIcon.vue"
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
      class="page-header__back-button"
      @click.prevent.stop="onActivateBackButton"
    >
      <SVGIcon name="arrowLeft" />
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
  cursor: pointer;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0.75rem 0;
  min-height: 3rem;

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

  & > h2:last-child {
    margin-right: 1rem;
  }

  &:deep() {
    .page-header__back-button {
      min-width: 4rem;
    }

    button {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: -1rem 0;
      min-width: 3rem;
      max-width: 3rem;
      min-height: 3rem;
      max-height: 3rem;
      &:focus, &:hover {
        & > .svg-icon {
          fill: rgb(var(--fg-color));
        }
      }

      & > .svg-icon {
        fill: rgb(var(--fg-color), 0.5);
        font-size: 1.25rem;
      }
    }
  }
}

.separator {
  background-color: rgb(var(--fg-color));
  margin: 0 0.5rem;
  width: 1rem;
  height: 1px;
}

.right {
  display: flex;
  align-items: center;
  margin-left: auto;
}
</style>
