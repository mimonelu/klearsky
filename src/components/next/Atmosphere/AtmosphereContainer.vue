<script lang="ts" setup>
import { computed, inject, onMounted, reactive, type ComputedRef } from "vue"
import AtmosphereHelper from "@/components/next/Atmosphere/script"
import Frontpage from "@/components/next/Atmosphere/Frontpage.vue"
import Linkat from "@/components/next/Atmosphere/Linkat.vue"
import SmokeSignal from "@/components/next/Atmosphere/SmokeSignal.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import WhiteWind from "@/components/next/Atmosphere/WhiteWind.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  hasItem: ComputedRef<boolean>,
  display: boolean
}>({
  hasItem: computed((): boolean => {
    return AtmosphereHelper.some(mainState.currentProfile)
  }),
  display: true,
})

onMounted(() => {
  state.display = mainState.currentSetting?.atmosphereDisplay ?? true
})

function toggle () {
  state.display = !state.display
  if (mainState.currentSetting != null) {
    mainState.currentSetting.atmosphereDisplay = state.display
    mainState.saveSettings()
  }
}
</script>

<template>
  <div
    v-if="state.hasItem"
    class="atmosphere-container"
  >
    <button
      type="button"
      class="button--plane atmosphere-container__button"
      :disabled="!state.hasItem"
      @click.prevent="toggle"
    >
      <SVGIcon name="at" />
      <span>{{ $t("atmosphere") }}</span>
      <SVGIcon :name="state.display ? 'cursorUp' : 'cursorDown'" />
    </button>
    <div
      v-if="state.display"
      class="atmosphere-container__content"
    >
      <!-- SmokeSignal -->
      <SmokeSignal :profile="mainState.currentProfile ?? undefined" />

      <!-- Linkat -->
      <Linkat :profile="mainState.currentProfile ?? undefined" />

      <!-- Frontpage -->
      <Frontpage :profile="mainState.currentProfile ?? undefined" />

      <!-- WhiteWind -->
      <WhiteWind :profile="mainState.currentProfile ?? undefined" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.atmosphere-container {
  background-image: linear-gradient(
    135deg,
    rgb(var(--blue-color), 0.375),
    rgb(var(--blue-color), 0.625)
  );
  border-radius: var(--border-radius-middle);
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
  padding: 0 0.5rem;

  &__button {
    --fg-color: var(--white-color);
    margin: 0 -0.5rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
    padding-bottom: 0.5rem;

    // TODO: Atmosphere コンテンツのコレクションはあるが、コンテンツ自体はない場合（削除した場合など）の対応をすること
    &:empty {
      margin-top: -0.5rem;
      padding-bottom: 0;
    }
  }
}
</style>
