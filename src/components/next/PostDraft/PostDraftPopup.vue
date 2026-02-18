<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import type { AppBskyDraftDefs } from "@atproto/api"
import PostDraftItem from "@/components/next/PostDraft/PostDraftItem.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  drafts: Array<AppBskyDraftDefs.DraftView>
  loading: boolean
  cursor?: string
}>({
  drafts: [],
  loading: false,
  cursor: undefined,
})

let mounted = false

onMounted(fetchDrafts)

function close () {
  emit("close")
}

async function fetchDrafts () {
  if (state.loading) {
    return
  }
  state.loading = true
  const response = await mainState.atp.fetchDrafts(25, state.cursor)
  state.loading = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "PostDraftPopup/fetchDrafts")
    return
  }
  const existingIds = new Set(state.drafts.map((d) => d.id))
  for (const draft of response.drafts) {
    if (!existingIds.has(draft.id)) {
      state.drafts.push(draft)
    }
  }
  state.cursor = response.cursor || undefined
  mounted = true
}

async function deleteDraft (id: string) {
  state.drafts = state.drafts.filter((d) => d.id !== id)
}

function scrolledToBottom () {
  if (state.cursor != null) {
    fetchDrafts()
  }
}
</script>

<template>
  <Popup
    class="post-draft-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="postDraft" />
        <span>{{ $t("postDraft") }}</span>
      </h2>
    </template>
    <template #body>
      <Loader v-if="!mounted && state.loading" />

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
      <PostDraftItem
        v-for="draftView of state.drafts"
        :key="draftView.id"
        :draftView="draftView"
        @close="close"
        @deleteDraft="deleteDraft"
      />
    </template>
    <template #footer>
      <LoadButton
        v-if="mounted"
        direction="old"
        :processing="state.loading"
        :disabled="state.cursor == null"
        @activate="fetchDrafts"
      />
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

    .popup-body {
      padding: 1rem 0;
    }
  }

  .loader {
    background-color: unset;
    position: unset;
  }
}
</style>
