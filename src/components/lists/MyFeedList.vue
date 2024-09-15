<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import DraggableList from "@/components/lists/DraggableList.vue"
import LazyImage from "@/components/images/LazyImage.vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  editMode: boolean,
  backupMyFeedsItems: Array<TTMyFeedsItem>,
  backupPinned: string[],
  pinnedMyFeedsItems: ComputedRef<Array<TTMyFeedsItem>>,
  processing: boolean,
}>({
  editMode: false,
  backupMyFeedsItems: [],
  backupPinned: [],
  pinnedMyFeedsItems: computed((): Array<TTMyFeedsItem> => {
    return mainState.myFeeds!.pinnedItems
  }),
  processing: false,
})

function startEdit () {
  state.backupMyFeedsItems = Util.cloneJson(mainState.myFeeds!.items) ?? []
  state.backupPinned = Util.cloneJson(mainState.currentFeedPreference?.pinned ?? []) ?? []
  state.editMode = true
}

function cancelEdit () {
  mainState.myFeeds!.items = state.backupMyFeedsItems
  if (mainState.currentFeedPreference?.pinned != null) {
    mainState.currentFeedPreference.pinned = state.backupPinned
  }
  state.editMode = false
}

async function saveMyFeed () {
  if (state.processing) {
    return
  }
  if (mainState.currentFeedPreference == null) {
    return
  }
  state.processing = true
  mainState.sortFeedPreferencesSavedAndPinned()
  mainState.myFeeds!.saveCustomItemSettings()
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  state.processing = false
  if (result instanceof Error) {
    mainState.openErrorPopup(result, "MyFeedList/saveMyFeed")
    return
  }
  state.editMode = false

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("currentPreferences", mainState.currentPreferences)
  mainState.myWorker!.setSessionCache("myFeedsItems", mainState.myFeeds!.items)
}

function isPinned (uri: string): boolean {
  return mainState.currentFeedPreference?.pinned?.includes(uri) ?? false
}

function togglePinned (uri: string) {
  if (mainState.currentFeedPreference == null) return
  if (mainState.currentFeedPreference.pinned == null) mainState.currentFeedPreference.pinned = [] // pinned の作成
  const index = mainState.currentFeedPreference.pinned.indexOf(uri)
  if (index === - 1) mainState.currentFeedPreference.pinned.push(uri)
  else mainState.currentFeedPreference.pinned.splice(index, 1)
}

function removeMyFeed (uri: string) {
  if (mainState.currentFeedPreference?.saved != null) {
    const index = mainState.currentFeedPreference.saved.indexOf(uri)
    if (index !== - 1) mainState.currentFeedPreference.saved.splice(index, 1)
  }
  if (mainState.currentFeedPreference?.pinned != null) {
    const index = mainState.currentFeedPreference.pinned.indexOf(uri)
    if (index !== - 1) mainState.currentFeedPreference.pinned.splice(index, 1)
  }
  mainState.myFeeds!.removeItem(uri)
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
        <template v-if="state.editMode">
          <SVGIcon name="feed" />
          <span>{{ $t("feedsAll") }}</span>
        </template>
        <template v-else>
          <SVGIcon name="pin" />
          <span>{{ $t("feedsPinned") }}</span>
        </template>
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
        v-for="item of state.pinnedMyFeedsItems"
        :key="item.value.uri"
        class="my-feed-list__item"
      >
        <!-- フォロー中フィード -->
        <RouterLink
          v-if="item.kind === 'followings'"
          to="/home/timeline"
          class="my-feed-list__content"
          :data-is-selected="true"
        >
          <SVGIcon name="shimmer" />
          <span>{{ $t(item.value.displayName) }}</span>
        </RouterLink>

        <!-- グローバルフィード -->
        <RouterLink
          v-else-if="item.kind === 'globalline'"
          to="/home/globalline"
          class="my-feed-list__content"
          :data-is-selected="true"
        >
          <SVGIcon name="shimmer" />
          <span>{{ $t(item.value.displayName) }}</span>
        </RouterLink>

        <!-- カスタムフィード -->
        <RouterLink
          v-else-if="item.kind === 'feed' && !!item.value.cid"
          :to="{
            path: '/home/feeds',
            query: {
              feed: item.value.uri,
              displayName: item.value.displayName,
            },
          }"
          class="my-feed-list__content"
          :data-is-selected="mainState.currentQuery.feed === item.value.uri"
        >
          <LazyImage :src="item.value.avatar" />
          <span>{{ item.value.displayName }}</span>
        </RouterLink>

        <!-- リストフィード -->
        <RouterLink
          v-else-if="item.kind === 'list' && !!item.value.cid"
          :to="{
            path: '/home/list-feeds',
            query: {
              list: item.value.uri,
              displayName: item.value.name,
            },
          }"
          class="my-feed-list__content"
          :data-is-selected="mainState.currentQuery.list === item.value.uri"
        >
          <LazyImage :src="item.value.avatar" />
          <span>{{ item.value.name }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- マイフィード - 編集時 -->
    <DraggableList
      v-else
      v-slot="{ item, focused }"
      class="my-feed-list__body"
      :items="mainState.myFeeds!.items"
    >
      <div
        class="my-feed-list__item"
        :data-focused="focused"
        :data-is-pinned="isPinned(item.value.uri)"
      >
        <div class="my-feed-list__icon">
          <SVGIcon name="drag" />
        </div>

        <!-- ピンボタン -->
        <template v-if="item.kind === 'feed' || item.kind === 'list'">
          <button
            v-if="isPinned(item.value.uri)"
            class="my-feed-list__icon"
            @click.prevent="togglePinned(item.value.uri)"
          >
            <SVGIcon name="pin" />
          </button>
          <button
            v-else
            class="my-feed-list__icon"
            @click.prevent="togglePinned(item.value.uri)"
          >
            <SVGIcon name="pinOutline" />
          </button>
        </template>

        <!-- フィードリンク -->
        <div
          v-if="item.kind === 'feed' || item.kind === 'list'"
          class="my-feed-list__content"
        >
          <LazyImage :src="item.value.avatar" />
          <span>{{ item.value.displayName ?? item.value.name }}</span>
        </div>
        <div
          v-else
          class="my-feed-list__content"
        >
          <SVGIcon name="shimmer" />
          <span>{{ $t(item.value.displayName) }}</span>
        </div>

        <!-- フィード削除ボタン -->
        <button
          v-if="item.kind === 'feed' || item.kind === 'list'"
          class="my-feed-list__icon"
          @click.prevent="removeMyFeed(item.value.uri)"
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
    margin-bottom: 0.5rem;

    & > .textlink--icon {
      --alpha: 0.5;
      font-size: 0.875rem;
      overflow: hidden;
      &:focus, &:hover {
        --alpha: 1.0;
      }

      & > .svg-icon {
        fill: rgb(var(--fg-color), var(--alpha));
      }

      & > span {
        color: rgb(var(--fg-color), var(--alpha));
        white-space: nowrap;
      }
    }

    & > button {
      font-size: 0.5rem;
      &:nth-child(2) {
        margin-left: auto;
      }

      & > span {
        white-space: nowrap;
      }
    }
  }

  &__body {
    @include scroll-bar("transparent");
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
    &:focus, &:hover {
      .my-feed-list__content {
        & > span {
          color: rgb(var(--fg-color));
        }
        &.router-link-active[data-is-selected="true"] > span {
          color: rgb(var(--accent-color));
        }
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
      fill: rgb(var(--fg-color), 0.5);
    }
    .svg-icon--pin {
      fill: rgb(var(--accent-color), 0.75);
    }
    .svg-icon--pinOutline {
      fill: rgb(var(--fg-color), 0.25);
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
        fill: rgb(var(--fg-color), 0.5);
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

    .svg-icon--shimmer,
    .lazy-image {
      border-radius: 1px;
      overflow: hidden;
      min-width: 1.5em;
      max-width: 1.5em;
      min-height: 1.5em;
      max-height: 1.5em;
    }

    .svg-icon--shimmer {
      fill: rgb(var(--fg-color), 0.5);
    }

    span {
      color: rgb(var(--fg-color), 0.5);
      line-height: var(--line-height-high);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.router-link-active[data-is-selected="true"] {
      .svg-icon--shimmer {
        fill: rgb(var(--accent-color));
      }

      .lazy-image {
        box-shadow: 0 0 0 2px rgb(var(--accent-color));
      }

      & > span {
        color: rgb(var(--accent-color));
        font-weight: bold;
      }
    }
  }
  &[data-edit-mode="false"] &__content {
    border-top: 2px solid transparent;
    padding: calc(0.25rem - 2px) 0 0.25rem 2px;
  }
}
</style>
