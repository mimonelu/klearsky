<script setup lang="ts">
import { inject } from "vue"
import Accordion from "@/components/next/Accordion/Accordion.vue"
import LinkCard from "@/components/cards/LinkCard.vue"

defineProps<{
  status?: TIActorStatus
}>()

const mainState = inject("state") as MainState

function toggleDisplay (accordionDisplay: boolean) {
  mainState.currentSetting.actorStatusLiveDisplay = accordionDisplay
  mainState.saveSettings()
}
</script>

<template>
  <Accordion
    v-if="status != null"
    class="actor-status-live-panel"
    buttonClass="button"
    :defaultDisplay="mainState.currentSetting?.actorStatusLiveDisplay ?? true"
    icon="video"
    :label="`${$t('actorStatusLiveUntil')} ${mainState.formatDate(status.expiresAt, true)}`"
    @toggleDisplay="toggleDisplay"
  >
    <LinkCard
      v-if="status.embed?.external != null"
      :external="status.embed.external"
      layout="vertical"
      :displayImage="true"
      :noLink="false"
      :noEmbedded="false"
    />
  </Accordion>
</template>

<style lang="scss" scoped>
.actor-status-live-panel {
  background-image: linear-gradient(
    135deg,
    rgb(var(--red-color)),
    rgb(var(--red-color), 0.75)
  );
  border-radius: var(--border-radius-middle);
  gap: 0;

  &:deep(.accordion__button) {
    --bg-color: var(--white-color);
    background-color: unset;
  }

  &:deep(.accordion__content:not(:empty)) {
    background-color: rgb(var(--bg-color));
    border-radius: var(--border-radius-middle);
    margin: 0 0.5rem 0.5rem;
    overflow: hidden;

    .external--embedded iframe {
      border-radius: 0;
    }
  }
}
</style>
