<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import SETTINGS from "@/consts/settings.json"

const mainState = inject("state") as MainState

function onActivate (colorValue: string) {
  mainState.currentSetting.colorTheme = colorValue
  mainState.saveSettings()
  mainState.updateSettings()
}
</script>

<template>
  <div class="color-theme-list">
    <div
      v-for="colorTheme, colorThemeIndex in SETTINGS.COLOR_THEMES"
      :key="colorThemeIndex"
      class="color-theme-list__box"
      :data-color-theme="colorTheme.value"
      :data-selected="colorTheme.value === mainState.currentSetting.colorTheme"
      @click="onActivate(colorTheme.value)"
    >
      <SVGIcon name="shimmer" />
      <div class="color-theme-list__box__label">{{ $t(colorTheme.label) }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-theme-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;

  &__box {
    background-color: rgb(var(--bg-color));
    border: 1px solid var(--fg-color-025);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    grid-gap: 0.25rem;
    line-height: 1.25;
    padding: 0.5rem;
    &:first-child {
      grid-column: 1 / 3;
    }
    &[data-selected="true"] {
      box-shadow: 0 0 0 2px rgb(var(--accent-color));
    }
    &:focus, &:hover {
      cursor: pointer;
    }

    & > .svg-icon {
      fill: rgb(var(--accent-color));
    }

    &__label {
      color: rgb(var(--fg-color));
    }
    &:focus > &__label,
    &:hover > &__label {
      color: rgb(var(--accent-color));
    }
  }
}
</style>
