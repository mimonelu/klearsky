<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  authorLabels?: Array<TTLabel>
  postLabels?: Array<TTLabel>
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  visibility: ComputedRef<"hide" | "show" | "warn">
  authorConcernedPreferences: ComputedRef<Array<TTPreference>>
  postConcernedPreferences: ComputedRef<Array<TTPreference>>
}>({
  visibility: computed((): "hide" | "show" | "warn" => {
    return mainState.getContentWarningVisibility(
      props.authorLabels,
      props.postLabels,
      true,
      true
    )
  }),
  authorConcernedPreferences: computed((): Array<TTPreference> => {
    return mainState.getConcernedPreferences(props.authorLabels)
  }),
  postConcernedPreferences: computed((): Array<TTPreference> => {
    return mainState.getConcernedPreferences(props.postLabels)
  }),
})

function show () {
  emit("show")
}

function hide () {
  emit("hide")
}
</script>

<template>
  <template v-if="state.visibility !== 'show'">
    <div
      class="content-warning"
      :data-visibility="state.visibility"
    >
      <!-- 非表示ラベルが含まれている -->
      <template v-if="state.visibility === 'hide'">
        <div class="header">
          <SVGIcon name="alert" />
          <span>{{ $t("contentWarningHideMessage") }}</span>
        </div>
      </template>

      <!-- 警告ラベルが含まれている -->
      <template v-else>
        <div class="header">
          <SVGIcon name="alert" />
          <span>{{ $t("contentWarning") }}</span>
        </div>
        <div class="body">
          <!-- ユーザーラベル -->
          <dl
            v-if="state.authorConcernedPreferences.length > 0"
            class="label-container"
          >
            <dt>{{ $t("contentWarningAuthorMessage") }}</dt>
            <dd
              v-for="preference of state.authorConcernedPreferences"
              :key="preference.$type"
            >{{ preference.label }}</dd>
          </dl>

          <!-- ポストラベル -->
          <dl
            v-if="state.postConcernedPreferences.length > 0"
            class="label-container"
          >
            <dt>{{ $t("contentWarningPostMessage") }}</dt>
            <dd
              v-for="preference of state.postConcernedPreferences"
              :key="preference.$type"
            >{{ preference.label }}</dd>
          </dl>
        </div>
        <button
          v-if="!display"
          class="button--important"
          @click.stop="show"
        >{{ $t("show") }}</button>
        <button
          v-else
          class="button--important"
          @click.stop="hide"
        >{{ $t("hide") }}</button>
      </template>
    </div>
  </template>
</template>

<style lang="scss" scoped>
.content-warning {
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-gap: 0.5em;
  position: relative;
  height: 100%;
  &[data-visibility="warn"] {
    background-color: rgba(var(--notice-color), 0.25);
    // border: 1px solid rgba(var(--notice-color), 0.25);
    padding: 1em;
  }
  &[data-visibility="hide"] {
    background-color: rgba(var(--fg-color), 0.125);
    padding: 0.5em 1em;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-gap: 0.5em;

  & > span {
    font-weight: bold;
    line-height: 1.25;
  }
}
.content-warning[data-visibility="warn"] .header {
  & > .svg-icon {
    fill: rgb(var(--notice-color));
  }

  & > span {
    color: rgb(var(--notice-color));
  }
}
.content-warning[data-visibility="hide"] .header {
  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.5);
  }

  & > span {
    color: rgba(var(--fg-color), 0.5);
  }
}

.body {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
}

.label-container {
  display: inline-flex;
  flex-wrap: wrap;
  grid-gap: 0.5em;

  & > dt {
    line-height: 1.25;
  }

  & > dd {
    color: rgb(var(--notice-color));
    line-height: 1.25;
    text-transform: capitalize;
  }
}

.button--important {
  padding: 0.125em 2em;
}
</style>
