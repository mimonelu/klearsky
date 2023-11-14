<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <button
    class="icon-button like-count"
    :data-has="post.likeCount > 0"
    :data-liked="!!post.viewer?.like"
  >
    <div class="splash-container">
      <SVGIcon name="like" />

      <!-- Sass の `$number` とそろえること -->
      <div
        v-for="_i in 8"
        class="splash"
      />
    </div>
    <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.likeCount > 0 ? post.likeCount : "" }}</span>
  </button>
</template>

<style lang="scss" scoped>
.like-count {
  .splash-container {
    position: relative;
  }

  .splash {
    $w: 0.5em;
    background-color: transparent;
    border-radius: $w;
    margin: math.div($w, - 2) 0 0 math.div($w, - 2);
    position: absolute;
    left: 50%;
    top: 50%;
    width: $w;
    height: $w;
    visibility: hidden;
  }

  &[data-liked="true"] {
    .svg-icon {
      fill: rgb(var(--like-color));
    }

    .splash {
      background-color: rgb(var(--like-color));
      transition: all 500ms ease-out;
      visibility: visible;
      $number: 8;
      @for $i from 1 through $number + 1 {
        &:nth-child(#{$i}) {
          $x: math.sin(math.div($i, $number) * math.$pi * 2) * 1.5;
          $y: math.cos(math.div($i, $number) * math.$pi * 2) * 1.5;
          transform: translate(#{$x}em, #{$y}em) scale(0);
        }
      }
    }

    span {
      color: rgb(var(--like-color));
    }
  }
}
</style>
