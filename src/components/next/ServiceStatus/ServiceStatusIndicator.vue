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
    :title="$t('serviceStatus')"
    :data-severe="mainState.myServiceStatus.severe"
    @click.prevent="mainState.openServiceStatusPopup"
  >
    <div class="service-status-indicator__icon">
      <SVGIcon name="pulse" />
    </div>
    <div
      v-if="mainState.myServiceStatus.messageDisplay"
      class="service-status-indicator__message"
    >{{ $t("serviceStatusIssue") }}</div>
  </button>
</template>

<style lang="scss" scoped>
.service-status-indicator {
  --indicator-color: var(--orange-color);
  --indicator-size: 2rem;

  background-color: rgb(var(--indicator-color), 0.875);
  border-radius: var(--indicator-size);
  cursor: pointer;
  display: flex;
  align-items: center;
  grid-gap: 0.25rem;
  padding: 0.5rem;
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  // NOTICE: `main-view__main` 内のポップアップ（`z-index: 2`、ルータービュー内で開くもの）より下にする
  z-index: 1;
  max-width: calc(100% - 1rem);

  // SPレイアウト
  @include media-sp-layout() {
    left: 0.5rem;
    bottom: calc(var(--sp-menu-height) + 0.5rem);
  }

  &[data-severe="true"] {
    --indicator-color: var(--notice-color);
  }

  &__icon {
    .svg-icon {
      fill: rgb(var(--white-color));
    }
  }

  &__message {
    color: rgb(var(--white-color));
    font-size: 0.875rem;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @include media-sp-layout() {
      font-size: 0.75rem;
    }
  }

  &:focus, &:hover {
    background-color: rgb(var(--indicator-color));
  }
}
</style>
