<script lang="ts" setup>
import { computed, inject, onMounted, reactive } from "vue"
import AtmosphereHelper from "@/components/next/Atmosphere/script"
import Frontpage from "@/components/next/Atmosphere/Frontpage.vue"
import Linkat from "@/components/next/Atmosphere/Linkat.vue"
import SmokeSignal from "@/components/next/Atmosphere/SmokeSignal.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import WhiteWind from "@/components/next/Atmosphere/WhiteWind.vue"
import { ATMOSPHERE_SERVICE_FAVICONS } from "@/consts/consts.json"

const mainState = inject("state") as MainState

const state = reactive<{
  display: boolean
}>({
  display: true,
})

const hasItem = computed((): boolean => {
  return AtmosphereHelper.some(mainState.currentProfile)
})

const displayOfSmokeSignal = computed((): boolean => {
  return AtmosphereHelper.includes("smokesignal", mainState.currentProfile)
})

const displayOfLinkat = computed((): boolean => {
  return AtmosphereHelper.includes("linkat", mainState.currentProfile)
})

const displayOfFrontpage = computed((): boolean => {
  return AtmosphereHelper.includes("frontpage", mainState.currentProfile)
})

const displayOfWhiteWind = computed((): boolean => {
  return AtmosphereHelper.includes("whitewind", mainState.currentProfile)
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
    v-if="hasItem"
    class="atmosphere-container"
  >
    <button
      type="button"
      class="button--plane atmosphere-container__button"
      :disabled="!hasItem"
      @click.prevent="toggle"
    >
      <SVGIcon name="at" />
      <span>{{ $t("atmosphere") }}</span>

      <!-- SmokeSignal Favicon -->
      <img
        v-if="displayOfSmokeSignal"
        :src="ATMOSPHERE_SERVICE_FAVICONS.smokesignal"
        :alt="$t('pnSmokeSignal')"
      >

      <!-- Linkat Favicon -->
      <img
        v-if="displayOfLinkat"
        :src="ATMOSPHERE_SERVICE_FAVICONS.linkat"
        :alt="$t('pnLinkat')"
      >

      <!-- Frontpage Favicon -->
      <img
        v-if="displayOfFrontpage"
        :src="ATMOSPHERE_SERVICE_FAVICONS.frontpage"
        :alt="$t('pnFrontpage')"
      >

      <!-- WhiteWind Favicon -->
      <img
        v-if="displayOfWhiteWind"
        :src="ATMOSPHERE_SERVICE_FAVICONS.whtwnd"
        :alt="$t('pnWhiteWind')"
      >

      <SVGIcon :name="state.display ? 'cursorUp' : 'cursorDown'" />
    </button>
    <div
      v-if="state.display"
      class="atmosphere-container__content"
    >
      <!-- SmokeSignal コンテンツ -->
      <SmokeSignal
        v-if="displayOfSmokeSignal"
        :profile="mainState.currentProfile ?? undefined"
      />

      <!-- Linkat コンテンツ -->
      <Linkat
        v-if="displayOfLinkat"
        :profile="mainState.currentProfile ?? undefined"
      />

      <!-- Frontpage コンテンツ -->
      <Frontpage
        v-if="displayOfFrontpage"
        :profile="mainState.currentProfile ?? undefined"
      />

      <!-- WhiteWind コンテンツ -->
      <WhiteWind
        v-if="displayOfWhiteWind"
        :profile="mainState.currentProfile ?? undefined"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.atmosphere-container {
  background-image: linear-gradient(
    135deg,
    rgb(var(--blue-color)),
    rgb(var(--blue-color), 0.75)
  );
  border-radius: var(--border-radius-middle);
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem;

  &__button {
    --fg-color: var(--white-color);
    margin: 0 -0.5rem;

    // Favicon
    & > img {
      height: 1rem;
      min-height: 1rem;
      max-height: 1rem;
    }
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
