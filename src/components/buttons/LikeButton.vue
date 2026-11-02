<script lang="ts" setup>
import { inject, ref, watch } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

// Sass の `$number` とそろえること
const NUMBER_OF_SPLASHES = 8

// スプラッシュは絶対配置のため要素ごとに描画レイヤーが作られる。いいねした時だけ描画し、アニメーション後に取り除く
// 非表示になるとアニメーションが中断されて `animationend` が届かないため、`animationcancel` でも取り除く
const isSplashing = ref(false)

watch(() => !!props.post.viewer?.like, (liked: boolean) => {
  isSplashing.value = liked
})

function onSplashEnd (index: number) {
  if (index === NUMBER_OF_SPLASHES) {
    isSplashing.value = false
  }
}
</script>

<template>
  <button
    class="icon-button like-button"
    :data-liked="!!post.viewer?.like"
  >
    <div
      class="icon-container"
      :data-splashing="isSplashing"
    >
      <template v-if="isSplashing">
        <div
          v-for="i in NUMBER_OF_SPLASHES"
          :key="i"
          class="splash"
          @animationend="onSplashEnd(i)"
          @animationcancel="onSplashEnd(i)"
        />
      </template>

      <SVGIcon name="like" />
    </div>
    <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.likeCount > 0 ? post.likeCount : "" }}</span>
  </button>
</template>

<style lang="scss" scoped>
.like-button {
  & > .icon-container {
    &[data-splashing="true"] {
      position: relative;

      & > .svg-icon {
        position: relative;
      }
    }

    & > .splash {
      $w: 0.5em;
      animation: splash 500ms ease-out both;
      background-color: rgb(var(--like-color));
      border-radius: $w;
      margin: math.div($w, - 2) 0 0 math.div($w, - 2);
      position: absolute;
      left: 50%;
      top: 50%;
      width: $w;
      height: $w;
      $number: 8;
      @for $i from 1 through $number {
        &:nth-child(#{$i}) {
          --x: #{math.sin(math.div($i, $number) * math.$pi * 2) * 1.5}em;
          --y: #{math.cos(math.div($i, $number) * math.$pi * 2) * 1.5}em;
        }
      }
    }
  }

  &[data-liked="true"] {
    & > .icon-container {
      & > .svg-icon {
        fill: rgb(var(--like-color));
      }
    }

    & > span {
      color: rgb(var(--like-color));
    }
  }
}

@keyframes splash {
  to {
    transform: translate(var(--x), var(--y)) scale(0);
  }
}
</style>
