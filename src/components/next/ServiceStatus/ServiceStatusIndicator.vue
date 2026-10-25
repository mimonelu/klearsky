<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <button
    v-if="mainState.myServiceStatus?.indicatorDisplay"
    type="button"
    class="service-status-indicator"
    :data-status="mainState.myServiceStatus.summary?.page?.status"
    @click.prevent="mainState.openServiceStatusPopup"
  >
    <div class="service-status-indicator__icon">
      <SVGIcon name="alert" />
    </div>
    <div
      v-if="mainState.myServiceStatus.messageDisplay"
      class="service-status-indicator__message"
    >{{ $t("serviceStatusIssue") }}</div>
  </button>
</template>

<style lang="scss" scoped>
// 画面の左端。SP ではグローバルフッターの上に置く
.service-status-indicator {
  --indicator-color: var(--notice-color);
  --indicator-size: 2.125rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  grid-gap: 0.5rem;
  position: fixed;
  left: 0.5rem;
  bottom: 0.5rem;
  z-index: 2;
  max-width: calc(100% - 1rem);

  // SPレイアウト
  @include media-sp-layout() {
    bottom: calc(var(--sp-menu-height) + 0.5rem);
  }

  &[data-status="UNDERMAINTENANCE"] {
    --indicator-color: var(--accent-color);
  }

  &__icon {
    background-color: rgb(var(--indicator-color));
    border: 1px solid rgb(var(--bg-color));
    border-radius: var(--border-radius-large);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--indicator-size);
    height: var(--indicator-size);

    .svg-icon {
      fill: white;
      font-size: 1.25rem;
    }
  }

  &__message {
    background-color: rgb(var(--indicator-color));
    border: 1px solid rgb(var(--bg-color));
    border-radius: var(--border-radius-large);
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: var(--line-height-low);
    overflow: hidden;
    padding: 0.5rem 0.75rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:focus, &:hover {
    filter: brightness(1.125);
  }
}
</style>
