<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import type { AppBskyDraftDefs } from "@atproto/api"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  drafts: Array<AppBskyDraftDefs.DraftView>
  loading: boolean
}>({
  drafts: [],
  loading: false,
})

onMounted(fetchDrafts)

async function fetchDrafts () {
  state.loading = true
  const response = await mainState.atp.fetchDrafts()
  state.loading = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "DraftPopup/fetchDrafts")
    return
  }
  state.drafts = response.drafts
}

async function deleteDraft (id: string) {
  const response = await mainState.atp.deleteDraft(id)
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "DraftPopup/deleteDraft")
    return
  }
  state.drafts = state.drafts.filter((d) => d.id !== id)
}

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="post-draft-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="postDraft" />
        <span>{{ $t("postDraft") }}</span>
      </h2>
    </template>
    <template #body>
      <Loader v-if="state.loading" />

      <!-- 下書きがない場合 -->
      <div
        v-if="!state.loading && state.drafts.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noContent") }}
        </div>
      </div>

      <!-- 下書き一覧 -->
      <div
        v-for="draftView of state.drafts"
        :key="draftView.id"
        class="post-draft-popup__item"
      >
        <div class="post-draft-popup__item__body">
          <div class="post-draft-popup__item__text">{{ draftView.draft.posts[0]?.text }}</div>
          <div class="post-draft-popup__item__meta">
            <span>{{ mainState.formatDate(draftView.updatedAt) }}</span>
            <span v-if="draftView.draft.langs?.length">{{ draftView.draft.langs.join(", ") }}</span>
          </div>
        </div>
        <button
          type="button"
          class="post-draft-popup__item__delete"
          @click.stop="deleteDraft(draftView.id)"
        >
          <SVGIcon name="remove" />
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.post-draft-popup {
  &:deep(.popup) {
    .popup-header {
      .svg-icon--postDraft {
        --fg-color: var(--share-color);
      }
    }
  }

  &__item {
    display: flex;
    align-items: flex-start;
    grid-gap: 0.5rem;
    padding: 0.75rem;
    border-radius: var(--border-radius-middle);
    &:hover {
      background-color: rgb(var(--fg-color), 0.0625);
    }

    &__body {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      grid-gap: 0.25rem;
      overflow: hidden;
    }

    &__text {
      line-height: var(--line-height-high);
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }

    &__meta {
      color: rgb(var(--fg-color), 0.5);
      display: flex;
      flex-wrap: wrap;
      grid-gap: 0.5rem;
      font-size: 0.875rem;
    }

    &__delete {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      min-height: 2rem;
      & > .svg-icon {
        fill: rgb(var(--notice-color), 0.75);
      }
      &:focus, &:hover {
        & > .svg-icon {
          fill: rgb(var(--notice-color));
        }
      }
    }
  }

  .loader {
    padding: 0.5rem;
    position: unset;
  }
}
</style>
