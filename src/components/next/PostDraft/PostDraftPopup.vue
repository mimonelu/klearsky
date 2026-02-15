<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import type { AppBskyDraftDefs } from "@atproto/api"
import PostDraftItem from "@/components/next/PostDraft/PostDraftItem.vue"
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
      <PostDraftItem
        v-for="draftView of state.drafts"
        :key="draftView.id"
        :draftView="draftView"
        @close="close"
        @deleteDraft="deleteDraft"
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
      grid-gap: 0;
      padding: 0;
    }
  }

  .post-draft-item {
    padding: 1em;
  }

  .loader {
    padding: 1rem;
    position: unset;
  }
}
</style>
