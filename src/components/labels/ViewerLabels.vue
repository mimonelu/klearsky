<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  viewer?: TTUserViewer
}>()
</script>

<template>
  <div class="viewer-labels">
    <!-- 個別ミュートのみしている -->
    <div
      v-if="viewer?.muted && viewer?.mutedByList == null"
      class="viewer-labels__label"
    >
      <SVGIcon name="volumeOff" />
      <span>{{ $t("muting") }}</span>
    </div>

    <!-- 個別・リストミュートしている -->
    <div
      v-if="viewer?.mutedByList != null"
      class="viewer-labels__label"
    >
      <SVGIcon name="volumeOff" />
      <span>{{ $t("listMuting") }}</span>
      <span>"{{ viewer.mutedByList.name }}"</span>
    </div>

    <!-- 個別ブロックのみしている -->
    <!-- NOTICE: リストブロックは `blocked` -->
    <div
      v-if="(viewer?.blocking != null || viewer?.blocked != null) && viewer?.blockingByList == null"
      class="viewer-labels__label"
    >
      <SVGIcon name="personOff" />
      <span>{{ $t("blocking") }}</span>
    </div>

    <!-- 個別・リストブロックしている -->
    <div
      v-if="viewer?.blockingByList != null"
      class="viewer-labels__label"
    >
      <SVGIcon name="personOff" />
      <span>{{ $t("listBlocking") }}</span>
      <span>"{{ viewer.blockingByList.name }}"</span>
    </div>

    <!-- ブロックされている -->
    <div
      v-if="viewer?.blockedBy"
      class="viewer-labels__label"
    >
      <SVGIcon name="personOff" />
      <span>{{ $t("blocked") }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.viewer-labels {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  grid-gap: 0.5em;

  &__label {
    background-color: rgb(var(--notice-color));
    border-radius: var(--border-radius-small);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    grid-gap: 0.25em;
    padding: 0.25em 0.5em;

    & > .svg-icon {
      fill: rgb(var(--notice-fg-color));
    }

    & > span {
      color: rgb(var(--notice-fg-color));
      font-weight: bold;
      line-height: var(--line-height-high);
      word-break: break-all;
    }
  }
}
</style>
