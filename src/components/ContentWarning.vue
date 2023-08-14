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
  visibility: ComputedRef<TTContentVisibility>
  authorConcernedPreferences: ComputedRef<Array<TTPreference>>
  postConcernedPreferences: ComputedRef<Array<TTPreference>>
}>({
  visibility: computed((): TTContentVisibility => {
    return mainState.getContentWarningVisibility(
      props.authorLabels,
      props.postLabels
    )
  }),
  authorConcernedPreferences: computed((): Array<TTPreference> => {
    return mainState.getConcernedPreferences(props.authorLabels)
  }),
  postConcernedPreferences: computed((): Array<TTPreference> => {
    return mainState.getConcernedPreferences(props.postLabels)
  }),
})

const messageMap: { [k: string]: string } = {
  "always-hide": "contentWarningAlwaysHide",
  hide: "contentWarningHide",
  "always-warn": "contentWarningAlwaysWarn",
  warn: "contentWarningWarn",
}

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
      <div class="header">
        <SVGIcon name="alert" />
        <span>{{ $t(messageMap[state.visibility]) }}</span>
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
            :key="preference?.$type"
          >{{ $t(preference?.label) }}</dd>
        </dl>

        <!-- ポストラベル -->
        <dl
          v-if="state.postConcernedPreferences.length > 0"
          class="label-container"
        >
          <dt>{{ $t("contentWarningPostMessage") }}</dt>
          <dd
            v-for="preference of state.postConcernedPreferences"
            :key="preference?.$type"
          >{{ $t(preference?.label) }}</dd>
        </dl>
      </div>
      <template v-if="state.visibility === 'always-warn' || state.visibility === 'warn'">
        <button
          v-if="!display"
          class="button--important"
          @click.prevent.stop="show"
        >
          <span>{{ $t("show") }}</span>
        </button>
        <button
          v-else
          class="button--important"
          @click.prevent.stop="hide"
        >
          <span>{{ $t("hide") }}</span>
        </button>
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
  padding: 1em;
  position: relative;
  height: 100%;
  &[data-visibility="always-hide"],
  &[data-visibility="hide"] {
    background-color: rgb(var(--fg-color), 0.125);
  }
  &[data-visibility="always-hide"] {
    background-image: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 0.5em,
      rgb(var(--fg-color), 0.0625) 0.5em,
      rgb(var(--fg-color), 0.0625) 1em
    );
  }
  &[data-visibility="always-warn"],
  &[data-visibility="warn"] {
    background-color: rgb(var(--notice-color), 0.25);
  }
  &[data-visibility="always-warn"] {
    background-image: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 0.5em,
      rgb(var(--notice-color), 0.0625) 0.5em,
      rgb(var(--notice-color), 0.0625) 1em
    );
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
.content-warning[data-visibility="always-hide"],
.content-warning[data-visibility="hide"] {
  .header {
    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }

    & > span {
      color: rgb(var(--fg-color));
    }
  }
}
.content-warning[data-visibility="always-warn"],
.content-warning[data-visibility="warn"] {
  .header {
    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }

    & > span {
      color: rgb(var(--notice-color));
    }
  }
}

.body {
  display: flex;
  flex-direction: column;
  grid-gap: 0.25em 0.5em;
}

.label-container {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  grid-gap: 0.25em 0.5em;

  & > dt {
    line-height: 1.25;
  }

  & > dd {
    color: rgb(var(--notice-color));
    line-height: 1.25;
  }
}

.button--important {
  padding: 0.125em 2em;
}
</style>
