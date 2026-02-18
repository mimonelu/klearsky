<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import PostDraftItem from "@/components/next/PostDraft/PostDraftItem.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  loading: boolean
}>({
  loading: false,
})

let mounted = mainState.currentPostDrafts.length > 0

onBeforeMount(async () => {
  if (mainState.currentPostDrafts.length === 0) {
    await fetchContinuousResults("new")
  }
})

function close () {
  emit("close")
}

async function fetchContinuousResults (direction: "new" | "old") {
  if (state.loading) {
    return
  }
  state.loading = true
  const cursor = direction === "old" ? mainState.currentPostDraftsCursor : undefined
  const response = await mainState.atp.fetchDrafts(25, cursor)
  state.loading = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "PostDraftPopup/fetchContinuousResults")
    return
  }
  const existingIds = new Set(mainState.currentPostDrafts.map((d) => d.id))
  if (direction === "old") {
    for (const draft of response.drafts) {
      if (!existingIds.has(draft.id)) {
        mainState.currentPostDrafts.push(draft)
      }
    }
  } else {
    const newDrafts = response.drafts.filter((d) => !existingIds.has(d.id))
    mainState.currentPostDrafts.unshift(...newDrafts)
  }
  const newCursor = response.cursor || undefined
  if (direction === "old" || !mounted) {
    mainState.currentPostDraftsCursor = newCursor
  }
  mounted = true
}

async function deleteDraft (id: string) {
  mainState.currentPostDrafts = mainState.currentPostDrafts.filter((d) => d.id !== id)
}

function scrolledToBottom () {
  if (mainState.currentPostDraftsCursor != null) {
    fetchContinuousResults("old")
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
    <template #header-after>
      <LoadButton
        direction="new"
        :processing="state.loading"
        @activate="fetchContinuousResults('new')"
      />
    </template>
    <template #body>
      <!-- 下書きがない場合 -->
      <div
        v-if="!state.loading && mainState.currentPostDrafts.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noContent") }}
        </div>
      </div>

      <!-- 下書き一覧 -->
      <PostDraftItem
        v-for="draftView of mainState.currentPostDrafts"
        :key="draftView.id"
        :draftView="draftView"
        @close="close"
        @deleteDraft="deleteDraft"
      />
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.loading"
        :disabled="mainState.currentPostDraftsCursor == null"
        @activate="fetchContinuousResults('old')"
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

  .textlabel {
    margin: 0 1rem;
  }
}
</style>
