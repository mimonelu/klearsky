<script lang="ts" setup>
import { inject, reactive } from "vue"
import languages from "@/consts/languages.json"
import PageHeader from "@/components/PageHeader.vue"

const $setI18n = inject("$setI18n") as Function
const $getI18n = inject("$getI18n") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  language: string;
}>({
  language: $getI18n(),
})

function changeLanguage () {
  $setI18n(state.language)
  mainState.forceUpdate()
}
</script>

<template>
  <div class="settings-view">
    <PageHeader :title="`${$t('settings')} - ${mainState.atp.session?.handle ?? ''}`" />
    <div class="section-container">
      <div class="section">
        <div class="section__header">言語</div>
        <div class="section__body">
          <select
            v-model="state.language"
            @change="changeLanguage"
          >
            <option
              v-for="language in languages"
              :value="language.value"
              :selected="language.value === state.language"
            >{{ $t(language.label) }}</option>
          </select>
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
