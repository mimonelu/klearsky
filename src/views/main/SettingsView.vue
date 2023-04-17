<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="settings-view">
    <PageHeader :title="`${$t('settings')} - ${mainState.atp.session?.handle ?? ''}`" />
    <div class="tab">
      <RouterLink
        class="tab__button"
        to="/settings/klearsky"
      >{{ $t("klearskySettings") }}</RouterLink>
      <RouterLink
        class="tab__button"
        to="/settings/bluesky"
      >{{ $t("blueskySettings") }}</RouterLink>
    </div>
    <RouterView />
  </div>
</template>
