<script lang="ts" setup>
import { inject } from "vue"
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
      <div
        v-if="colorTheme.value !== 'auto'"
        class="color-theme-list__box__label"
      >Aa</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-theme-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 0.5rem;

  &__box {
    background-color: rgb(var(--bg-color));
    border: 1px solid transparent;
    border-radius: var(--border-radius-middle);
    display: flex;
    align-items: center;
    justify-content: center;
    grid-gap: 0.25rem;
    line-height: 1.25;
    overflow: hidden;
    min-height: 3rem;
    &[data-selected="true"] {
      box-shadow: 0 0 0 2px rgb(var(--accent-color));
    }
    &:focus, &:hover {
      cursor: pointer;
    }
    &[data-color-theme="auto"] {
      // 自動配色の背景色は厳密にカラーテーマに沿わなくとも良い
      background-image: linear-gradient(
        to bottom right,
        rgb(255, 255, 255) 49.5%,
        rgb(0, 0, 0) 50.5%
      );

      border-color: rgb(var(--fg-color));
    }

    &__label {
      color: rgb(var(--fg-color));
      font-weight: bold;
    }
  }
}
</style>
