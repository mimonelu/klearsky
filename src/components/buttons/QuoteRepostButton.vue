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
    class="icon-button quote-repost-button"
    :disabled="post.viewer?.embeddingDisabled"
  >
    <SVGIcon
      v-if="post.viewer?.embeddingDisabled"
      name="lock"
    />
    <div class="icon-container">
      <SVGIcon name="quoteRepost" />
    </div>
    <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.quoteCount ? post.quoteCount : "" }}</span>
  </button>
</template>

<style lang="scss" scoped>
.quote-repost-button {
  &[disabled] {
    grid-template-columns: auto auto 1fr;
  }

  & > .svg-icon--lock {
    fill: rgb(var(--fg-color), 0.25);
  }

  & > .icon-container {
    position: relative;

    & > .svg-icon {
      position: relative;
    }
  }
}
</style>
