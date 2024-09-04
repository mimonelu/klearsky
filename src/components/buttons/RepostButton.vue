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
    class="icon-button repost-button"
    :data-reposted="!!post.viewer?.repost"
  >
    <div class="icon-container">
      <!-- Sass の `$number` とそろえること -->
      <div
        v-for="_i in 3"
        class="splash"
      />

      <SVGIcon name="repost" />
    </div>
    <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.repostCount ? post.repostCount : "" }}</span>
  </button>
</template>

<style lang="scss" scoped>
.repost-button {
  & > .icon-container {
    position: relative;

    & > .splash {
      $w: 1em;
      border: 1px solid rgb(var(--share-color), 0.5);
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

  &[data-reposted="true"] {
    & > .icon-container {
      & > .svg-icon {
        fill: rgb(var(--share-color));
      }

      & > .splash {
        opacity: 1.0;
        transition: all 500ms ease-out;
        visibility: visible;
        $number: 3;
        @for $i from 1 through $number + 1 {
          &:nth-child(#{$i}) {
            opacity: 0;
            transform: scale(4.0);
            transition-delay: ($i - 1) * 250ms;
          }
        }
      }
    }

    & > span {
      color: rgb(var(--share-color));
    }
  }
}
</style>
