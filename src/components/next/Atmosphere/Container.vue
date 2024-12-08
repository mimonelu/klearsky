<script lang="ts" setup>
import { computed, inject, onMounted, reactive, type ComputedRef } from "vue"
import AtmosphereHelper from "@/components/next/Atmosphere/script"
import Frontpage from "@/components/next/Frontpage/Main.vue"
import Linkat from "@/components/next/Linkat/Main.vue"
import SmokeSignal from "@/components/next/SmokeSignal/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import WhiteWind from "@/components/next/WhiteWind/Main.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  hasItem: ComputedRef<boolean>,
  visibility: boolean
}>({
  hasItem: computed((): boolean => {
    return AtmosphereHelper.some(mainState.currentProfile)
  }),
  visibility: true,
})

onMounted(() => {
  state.visibility = true
})

function toggle () {
  state.visibility = !state.visibility
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
      <SVGIcon :name="state.visibility ? 'cursorDown' : 'cursorUp'" />
    </button>
    <div
      v-if="state.visibility"
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
  // background-color: rgb(var(--blue-color), 0.25);
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
  }
}
</style>
