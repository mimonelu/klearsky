<script lang="ts" setup>
import { inject } from "vue"
import languages from "@/consts/languages.json"
import PageHeader from "@/components/PageHeader.vue"

const mainState = inject("state") as MainState

function changeLanguage () {
  mainState.saveSettings()
  mainState.updateSettings()
}
</script>

<template>
  <div class="settings-view">
    <PageHeader :title="`${$t('settings')} - ${mainState.atp.session?.handle ?? ''}`" />
    <div class="section-container">
      <div class="section">
        <div class="section__header">言語</div>
        <div class="section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.language"
              @change="changeLanguage"
            >
              <option
                v-for="language in languages"
                :value="language.value"
                :selected="language.value === mainState.currentSetting.language"
              >{{ $t(language.label) }}</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.section-container {
  display: flex;
  flex-direction: column;
  grid-gap: 2rem;
  padding: 2rem;
}

.section {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
}

.section__header {
  font-size: 1.25rem;
}

.section__body {}
</style>
