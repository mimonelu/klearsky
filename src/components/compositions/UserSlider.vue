<script lang="ts" setup>
import { inject } from "vue"
import { type RouteLocationRaw } from "vue-router"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { hasUserBlurLabel } from "@/composables/util/use-content-labels"

const mainState = inject("state") as MainState

defineProps<{
  users?: Array<TTUser>
  showMoreButton?: boolean
  moreLocation?: RouteLocationRaw
}>()
</script>

<template>
  <div class="user-slider">
    <!-- ユーザー -->
    <div
      v-for="user of users"
      :key="user.did"
      class="user-slider__user"
      :data-blur="hasUserBlurLabel(mainState, user.labels)"
    >
      <!-- プロフィールリンク -->
      <RouterLink
        :to="{ path: '/profile/feeds', query: { account: user.did } }"
        class="user-slider__user__link"
      >
        <!-- アバター画像 -->
        <div
          class="user-slider__user__link__avatar"
          :style="{ 'background-image': `url(${user.avatar})` }"
        />

        <!-- ユーザー名 -->
        <div
          class="user-slider__user__link__name"
          translate="no"
        >{{ user.displayName || user.handle }}</div>
      </RouterLink>
    </div>

    <!-- もっと見るボタン -->
    <RouterLink
      v-if="showMoreButton && moreLocation != null"
      :to="moreLocation"
      class="user-slider__more-button"
    >
      <SVGIcon name="list" />
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.user-slider {
  display: flex;
  grid-gap: 0.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  @include scroll-bar("transparent");

  // ユーザー
  &__user {
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    width: 7rem;
    min-width: 7rem;
    max-width: 7rem;
    height: 9rem;

    // プロフィールリンク
    &__link {
      display: flex;
      align-items: flex-end;
      flex-grow: 1;
      overflow: hidden;
      height: 100%;

      // アバター画像
      &__avatar {
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        transition: background-position-y 250ms ease-out;
      }

      // ユーザー名
      &__name {
        background-color: rgb(255, 0, 0);
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
        line-height: var(--line-height-low);
        overflow: hidden;
        padding: 0.25rem 0.5rem;
        pointer-events: none;
        position: relative;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }
    }
    &[data-blur="true"] &__link__avatar {
      filter: blur(0.75rem);
    }
    &:hover &__link__avatar {
      background-position-y: -1rem;
    }
  }

  // もっと見るボタン
  &__more-button {
    --color-1: rgb(var(--fg-color), 0.125);
    --color-2: rgb(var(--fg-color), 0.5);
    background-color: var(--color-1);
    border-radius: var(--border-radius-middle);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    width: 7rem;
    min-width: 7rem;
    max-width: 7rem;
    height: 9rem;
    &:focus, &:hover {
      --color-1: rgb(var(--fg-color), 0.25);
      --color-2: rgb(var(--fg-color));
    }

    & > .svg-icon {
      fill: var(--color-2);
      font-size: 2rem;
    }
  }
}
</style>
