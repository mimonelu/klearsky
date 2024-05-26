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
    class="icon-button like-button"
    :data-liked="!!post.viewer?.like"
  >
    <div class="icon-container">
      <!-- Sass の `$number` とそろえること -->
      <div
        v-for="_i in 8"
        class="splash"
      />

      <SVGIcon name="like" />
    </div>
    <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.likeCount > 0 ? post.likeCount : "" }}</span>
  </button>
</template>

<style lang="scss" scoped>
.like-button {
  & > .icon-container {
    position: relative;

    & > .splash {
      $w: 0.5em;
      background-color: rgb(var(--like-color));
      border-radius: $w;
      margin: math.div($w, - 2) 0 0 math.div($w, - 2);
      position: absolute;
      left: 50%;
      top: 50%;
      width: $w;
      height: $w;
      visibility: hidden;
    }

    & > .svg-icon {
      position: relative;
    }
  }

  &[data-liked="true"] {
    & > .icon-container {
      & > .svg-icon {
        fill: rgb(var(--like-color));
      }

      & > .splash {
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
    }

    & > span {
      color: rgb(var(--like-color));
    }
  }
}
</style>
