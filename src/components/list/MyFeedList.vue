<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import DraggableList from "@/components/list/DraggableList.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import Loader from "@/components/common/Loader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  editMode: boolean,
  backupGenerators: TTFeedGenerator[],
  backupPinned: string[],
  pinnedGenerators: ComputedRef<Array<TTFeedGenerator>>,
  processing: boolean,
}>({
  editMode: false,
  backupGenerators: [],
  backupPinned: [],
  pinnedGenerators: computed((): Array<TTFeedGenerator> => {
    const pinned = mainState.feedPreferences?.pinned
    if (pinned == null) return []
    return mainState.currentMyFeedGenerators.filter((generator: TTFeedGenerator) => {
      return pinned.includes(generator.uri)
    })
  }),
  processing: false,
})

function startEdit () {
  state.backupGenerators = JSON.parse(JSON.stringify(mainState.currentMyFeedGenerators))
  state.backupPinned = JSON.parse(JSON.stringify(mainState.feedPreferences?.pinned ?? []))
  state.editMode = true
}

function cancelEdit () {
  mainState.currentMyFeedGenerators = state.backupGenerators
  if (mainState.feedPreferences?.pinned != null) mainState.feedPreferences.pinned = state.backupPinned
  state.editMode = false
}

async function saveMyFeed () {
  if (state.processing) return
  if (mainState.feedPreferences == null) return
  state.processing = true
  mainState.sortMyFeedGenerators()
  mainState.sortFeedPreferencesSavedAndPinned()
  if (!await mainState.atp.updatePreferences(mainState.currentPreferences))
    mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/updatePreferences")
  state.processing = false
  state.editMode = false
}

function isPinned (uri: string): boolean {
  return mainState.feedPreferences?.pinned?.includes(uri) ?? false
}

function togglePinned (uri: string) {
  if (mainState.feedPreferences == null) return
  if (mainState.feedPreferences.pinned == null) mainState.feedPreferences.pinned = [] // pinned の作成
  const index = mainState.feedPreferences.pinned.indexOf(uri)
  if (index === - 1) mainState.feedPreferences.pinned.push(uri)
  else mainState.feedPreferences.pinned.splice(index, 1)
}

function removeMyFeed (uri: string) {
  if (mainState.feedPreferences?.saved != null) {
    const index = mainState.feedPreferences.saved.indexOf(uri)
    if (index !== - 1) mainState.feedPreferences.saved.splice(index, 1)
  }
  if (mainState.feedPreferences?.pinned != null) {
    const index = mainState.feedPreferences.pinned.indexOf(uri)
    if (index !== - 1) mainState.feedPreferences.pinned.splice(index, 1)
  }
  const index = mainState.currentMyFeedGenerators
    .findIndex((generator: TTFeedGenerator) => {
      return generator.uri === uri
    })
  if (index !== - 1) mainState.currentMyFeedGenerators.splice(index, 1)
}
</script>

<template>
  <div
    class="my-feed-list"
    :data-edit-mode="state.editMode"
  >
    <div class="my-feed-list__header">
      <a
        class="textlink--icon"
        @click="mainState.openMyFeedsPopup"
      >
        <SVGIcon name="feed" />
        <span>{{ $t("myFeeds") }}</span>
      </a>

      <!-- 編集ボタン -->
      <button
        v-if="!state.editMode"
        class="button--bordered"
        @click.prevent="startEdit"
      >
        <span>{{ $t("edit") }}</span>
      </button>

      <template v-else>
        <!-- キャンセルボタン -->
        <button
          class="button--bordered"
          @click.prevent="cancelEdit"
        >
          <span>{{ $t("cancel") }}</span>
        </button>

        <!-- 保存ボタン -->
        <button
          class="button--important"
          @click.prevent="saveMyFeed"
        >
          <span>{{ $t("save") }}</span>
        </button>
      </template>
    </div>

    <!-- マイフィード - 通常時 -->
    <div
      v-if="!state.editMode"
      class="my-feed-list__body"
    >
      <div
        v-for="generator of state.pinnedGenerators"
        :key="generator.uri"
        class="my-feed-list__item"
      >
        <RouterLink
          :to="{
            path: '/home/feeds',
            query: {
              feed: generator.uri,
              displayName: generator.displayName,
            },
          }"
          class="my-feed-list__content"
        >
          <LazyImage :src="generator.avatar" />
          <span>{{ generator.displayName }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- マイフィード - 編集時 -->
    <DraggableList
      v-else
      v-slot="{ item, focused }"
      class="my-feed-list__body"
      :items="mainState.currentMyFeedGenerators"
    >
      <div
        class="my-feed-list__item"
        :data-focused="focused"
        :data-is-pinned="isPinned(item.uri)"
      >
        <div class="my-feed-list__icon">
          <SVGIcon name="drag" />
        </div>

        <!-- ピンボタン -->
        <button
          v-if="isPinned(item.uri)"
          class="my-feed-list__icon"
          @click.prevent="togglePinned(item.uri)"
        >
          <SVGIcon name="pin" />
        </button>
        <button
          v-else
          class="my-feed-list__icon"
          @click.prevent="togglePinned(item.uri)"
        >
          <SVGIcon name="pinOutline" />
        </button>

        <!-- フィードリンク -->
        <div class="my-feed-list__content">
          <LazyImage :src="item.avatar" />
          <span>{{ item.displayName }}</span>
        </div>

        <!-- フィード削除ボタン -->
        <button
          class="my-feed-list__icon"
          @click.prevent="removeMyFeed(item.uri)"
        >
          <SVGIcon name="cross" />
        </button>
      </div>
    </DraggableList>

    <Loader v-if="state.processing" />
  </div>
</template>

<style lang="scss" scoped>
.my-feed-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  &__header {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;
    margin-bottom: 1rem;

    .textlink--icon {
      font-size: 0.875rem;
    }

    button {
      font-size: 0.5rem;
      &:nth-child(2) {
        margin-left: auto;
      }
    }
  }

  &__body {
    @include scroll-bar;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    overscroll-behavior: none;
  }

  &__item {
    display: flex;
    align-items: center;
    grid-gap: 0.25rem;
    &:hover, &:focus {
      .my-feed-list__content > span {
        color: rgb(var(--fg-color));
      }
    }
  }
  &[data-edit-mode="true"] &__item {
    border-top: 2px solid transparent;
    cursor: grab;
    padding: calc(0.25rem - 2px) 0 0.25rem;
    &[data-focused="true"] {
      border-top-color: rgb(var(--accent-color));
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5em;
    max-width: 1.5em;
    min-height: 1.5em;
    max-height: 1.5em;

    .svg-icon--drag {
      fill: var(--fg-color-05);
    }
    .svg-icon--pin {
      fill: rgb(var(--accent-color), 0.75);
    }
    .svg-icon--pinOutline {
      fill: var(--fg-color-025);
    }
    .svg-icon--cross {
      fill: rgb(var(--notice-color), 0.75);
      font-size: 0.75rem;
    }
    &:focus, &:hover {
      .svg-icon--pin {
        fill: rgb(var(--accent-color));
      }
      .svg-icon--pinOutline {
        fill: var(--fg-color-05);
      }
      .svg-icon--cross {
        fill: rgb(var(--notice-color));
      }
    }
  }
  button.my-feed-list__icon {
    cursor: pointer;
  }

  &__content {
    display: flex;
    flex-grow: 1;
    align-items: center;
    grid-gap: 0.5rem;
    overflow: hidden;

    .lazy-image {
      border-radius: 1px;
      overflow: hidden;
      min-width: 1.5em;
      max-width: 1.5em;
      min-height: 1.5em;
      max-height: 1.5em;
    }

    span {
      color: var(--fg-color-05);
      line-height: var(--line-height);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &[data-edit-mode="false"] &__content {
    border-top: 2px solid transparent;
    padding: calc(0.25rem - 2px) 0 0.25rem;
  }
}
</style>
