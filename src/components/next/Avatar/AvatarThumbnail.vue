<script lang="ts" setup>
import { inject, computed } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"

const props = defineProps<{
  image?: string
  blur?: boolean
  isLabeler?: boolean
  actorStatus?: TIActorStatus
}>()

const mainState = inject("state") as MainState

// アクターステータス - LIVE
const hasLive = computed((): boolean => {
  return props.actorStatus?.isActive == true && props.actorStatus.status === "app.bsky.actor.status#live"
})
</script>

<template>
  <div
    class="avatar-thumbnail"
    :data-blur="blur"
    :data-is-labeler="!!isLabeler"
    :data-has-live="hasLive"
  >
    <div class="avatar-thumbnail__inner">
      <LazyImage :src="mainState.currentSetting.postAnonymization ? undefined : image" />
    </div>

    <!-- アクターステータス - LIVE -->
    <div
      v-if="hasLive"
      class="avatar-thumbnail__kanban"
    >{{ $t("live") }}</div>
  </div>
</template>

<style lang="scss" scoped>
.avatar-thumbnail {
  position: relative;

  &__inner {
    cursor: pointer;
    display: block;
    overflow: hidden;
    transition: border-radius 125ms ease-out;
  }

  // ぼかし
  &[data-blur="true"] &__inner {
    // `filter: blur` で背景が透けて見える現象対策
    background-color: rgb(var(--bg-color));

    .lazy-image {
      filter: blur(0.125em);
    }
  }

  // アクターステータス - LIVE
  &[data-has-live="true"] &__inner {
    border: 0.05em solid rgb(var(--red-color));

    .lazy-image {
      min-width: calc(1em - 0.1em);
      max-width: calc(1em - 0.1em);
      min-height: calc(1em - 0.1em);
      max-height: calc(1em - 0.1em);
    }
  }

  // ラベラー
  &[data-is-labeler="false"] &__inner {
    border-radius: var(--border-radius-large);
  }
  &[data-is-labeler="true"] &__inner {
    border-radius: var(--border-radius-small);
  }

  &:hover &__inner {
    border-radius: 1px;
  }

  .lazy-image {
    display: block;
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
  }

  // アクターステータス - LIVE
  &__kanban {
    background-color: rgb(var(--red-color));
    border-radius: 0.25em;
    color: rgb(var(--white-color));
    font-size: 0.25em;
    font-weight: bold;
    line-height: var(--line-height-low);
    padding: 0 0.25em;
    pointer-events: none;
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    white-space: nowrap;
  }
}
</style>
