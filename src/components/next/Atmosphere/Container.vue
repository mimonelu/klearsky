<script lang="ts" setup>
import { inject } from "vue"
import Frontpage from "@/components/next/Frontpage/Main.vue"
import Linkat from "@/components/next/Linkat/Main.vue"
import SmokeSignal from "@/components/next/SmokeSignal/Main.vue"
import WhiteWind from "@/components/next/WhiteWind/Main.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div
    v-if="mainState.currentProfile != null"
    class="atmosphere-container"
  >
    <!-- SmokeSignal -->
    <SmokeSignal :profile="mainState.currentProfile" />

    <!-- Linkat -->
    <Linkat :profile="mainState.currentProfile" />

    <!-- Frontpage -->
    <Frontpage :profile="mainState.currentProfile" />

    <!-- WhiteWind -->
    <WhiteWind :profile="mainState.currentProfile" />
  </div>
</template>

<style lang="scss" scoped>
.atmosphere-container {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
}
</style>
