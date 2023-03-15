<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

const router = useRouter()

async function logout () {
  blurElement()
  mainState.atp.logout()
  mainState.timelineFeeds?.splice(0)
  await router.push({ name: "timeline" })
  router.go(0)
}
</script>

<template>
  <div class="settings-view">
    <PageHeader :title="$t('settings')" />
    <div class="body">
      <div class="body__section">
        <button
          class="button"
          @click.prevent="logout"
        >{{ $t("logout") }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.body {
  display: flex;
  flex-direction: column;
  grid-gap: 2rem;
  padding: 2rem;

  &__section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    grid-gap: 1rem;
  }
}
</style>
