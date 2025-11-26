<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <button
    class="icon-button official-bookmark-button"
    :data-bookmarked="!!post.viewer?.bookmarked"
    :data-has-bookmark="!!post.bookmarkCount"
  >
    <div class="icon-container">
      <SVGIcon name="bookmark" />
    </div>
    <span v-if="
      !mainState.currentSetting.hideNumberOfReaction &&
      post.bookmarkCount
    ">{{ post.bookmarkCount }}</span>
  </button>
</template>

<style lang="scss" scoped>
.official-bookmark-button {
  &[data-has-bookmark="false"] {
    grid-template-columns: auto;
  }
  &[data-bookmarked="true"] {
    & > .icon-container {
      & > .svg-icon {
        fill: rgb(var(--bookmark-color));
      }
    }

    & > span {
      color: rgb(var(--bookmark-color));
    }
  }

  & > .icon-container {
    position: relative;

    & > .svg-icon {
      position: relative;
    }
  }
}
</style>
