<script lang="ts" setup>
import { computed, inject, onMounted, reactive } from "vue"
import AtmosphereHelper from "@/components/next/Atmosphere/script"
import Frontpage from "@/components/next/Atmosphere/Frontpage.vue"
import Linkat from "@/components/next/Atmosphere/Linkat.vue"
import SkyBeMoreBlue from "@/components/next/Atmosphere/SkyBeMoreBlue.vue"
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

const displayOfSkyBeMoreBlue = computed((): boolean => {
  return AtmosphereHelper.includes("skybemoreblue", mainState.currentProfile)
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
    :data-has-item="hasItem"
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

      <!-- SkyBeMoreBlue Favicon -->
      <img
        v-if="displayOfSkyBeMoreBlue"
        :src="ATMOSPHERE_SERVICE_FAVICONS.skybemoreblue"
        :alt="$t('pnSkyBeMoreBlue')"
      >

      <!-- WhiteWind Favicon -->
      <img
        v-if="displayOfWhiteWind"
        :src="ATMOSPHERE_SERVICE_FAVICONS.whtwnd"
        :alt="$t('pnWhiteWind')"
      >

      <SVGIcon
        v-if="hasItem"
        :name="state.display ? 'cursorUp' : 'cursorDown'"
      />
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

      <!-- SkyBeMoreBlue コンテンツ -->
      <SkyBeMoreBlue
        v-if="displayOfSkyBeMoreBlue"
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
  border-radius: var(--border-radius-middle);
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem;
  &[data-has-item="true"] {
    background-image: linear-gradient(
      135deg,
      rgb(var(--blue-color)),
      rgb(var(--blue-color), 0.75)
    );
  }
  &[data-has-item="false"] {
    background-color: rgb(var(--fg-color), 0.0625);
  }

  &__button {
    margin: 0 -0.5rem;
    [data-has-item="true"] & {
      --fg-color: var(--white-color);
    }

    // Favicon
    & > img {
      width: 1rem;
      min-width: 1rem;
      max-width: 1rem;
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
