<script lang="ts" setup>
import { inject, ref, watch } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

// Sass の `$number` とそろえること
const NUMBER_OF_SPLASHES = 3

// スプラッシュは絶対配置のため要素ごとに描画レイヤーが作られる。リポストした時だけ描画し、アニメーション後に取り除く
// 非表示になるとアニメーションが中断されて `animationend` が届かないため、`animationcancel` でも取り除く
const isSplashing = ref(false)

watch(() => !!props.post.viewer?.repost, (reposted: boolean) => {
  isSplashing.value = reposted
})

function onSplashEnd (index: number) {
  if (index === NUMBER_OF_SPLASHES) {
    isSplashing.value = false
  }
}
</script>

<template>
  <button
    class="icon-button repost-button"
    :data-reposted="!!post.viewer?.repost"
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

      <SVGIcon name="repost" />
    </div>
    <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.repostCount ? post.repostCount : "" }}</span>
  </button>
</template>

<style lang="scss" scoped>
.repost-button {
  & > .icon-container {
    &[data-splashing="true"] {
      position: relative;

      & > .svg-icon {
        position: relative;
      }
    }

    & > .splash {
      $w: 1em;
      animation: splash 500ms ease-out both;
      border: 1px solid rgb(var(--share-color), 0.5);
      border-radius: $w;
      margin: math.div($w, - 2) 0 0 math.div($w, - 2);
      position: absolute;
      left: 50%;
      top: 50%;
      width: $w;
      height: $w;
      $number: 3;
      @for $i from 1 through $number {
        &:nth-child(#{$i}) {
          animation-delay: ($i - 1) * 250ms;
        }
      }
    }
  }

  &[data-reposted="true"] {
    & > .icon-container {
      & > .svg-icon {
        fill: rgb(var(--share-color));
      }
    }

    & > span {
      color: rgb(var(--share-color));
    }
  }
}

@keyframes splash {
  from {
    opacity: 1.0;
    transform: scale(1.0);
  }
  to {
    opacity: 0;
    transform: scale(4.0);
  }
}
</style>
