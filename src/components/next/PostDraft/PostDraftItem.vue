<script lang="ts" setup>
import { inject } from "vue"
import type { AppBskyDraftDefs } from "@atproto/api"
import { deleteDraftMedia, draftHasMedia, draftMediaExistsInStore, extractSendPostPopupParams } from "@/components/next/PostDraft/post-draft-utils"
import SVGIcon from "@/components/images/SVGIcon.vue"
import PostDraftItemPost from "@/components/next/PostDraft/PostDraftItemPost.vue"

const emit = defineEmits<{
  (event: "close"): void
  (event: "deleteDraft", id: string): void
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const props = defineProps<{
  draftView: AppBskyDraftDefs.DraftView
}>()

function close () {
  emit("close")
}

async function applyDraft () {
  const draft = props.draftView.draft

  // メディアの存在チェック
  if (draftHasMedia(draft) && !(await draftMediaExistsInStore(draft))) {
    if (!(await mainState.openConfirmationPopup({
      title: $t("confirmation"),
      text: $t("postDraftMediaNotFound"),
    }))) {
      return
    }
  }

  const params = await extractSendPostPopupParams(draft, mainState.currentSetting.postLanguages)
  if (params == null) {
    return
  }

  // 引用リポスト
  const post = draft.posts[0]
  if (post.embedRecords?.[0]?.record?.uri != null) {
    const uri = post.embedRecords[0].record.uri
    mainState.loaderDisplay = true
    const response = await mainState.atp.fetchPosts([uri])
    mainState.loaderDisplay = false
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "PostDraftItem/applyDraft")
      return
    }
    params.type = "quoteRepost"
    params.post = response[0]
  }

  emit("close")
  await mainState.openSendPostPopup(params)
}

async function deleteDraft () {
  const draft = props.draftView.draft
  const text = draft.posts?.[0]?.text?.replace(/\n/g, " ") ?? ""
  const detail = text.length > 48 ? `${text.substring(0, 48)}...` : text

  // 通常確認
  if (!(await mainState.openConfirmationPopup({
    title: $t("confirmation"),
    text: $t("postDraftDeleteConfirmation"),
    detail,
  }))) {
    return
  }

  // メディアが存在しない場合の追加確認
  if (draftHasMedia(draft) && !(await draftMediaExistsInStore(draft))) {
    if (!(await mainState.openConfirmationPopup({
      title: $t("confirmation"),
      text: $t("postDraftDeleteWithOrphanedMedia"),
    }))) {
      return
    }
  }

  mainState.loaderDisplay = true
  const response = await mainState.atp.deleteDraft(props.draftView.id)
  mainState.loaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "PostDraftItem/deleteDraft")
    return
  }

  // IndexedDB から画像を削除
  const mediaResult = await deleteDraftMedia(props.draftView.draft)
  if (mediaResult instanceof Error) {
    mainState.openErrorPopup(mediaResult, "PostDraftItem/deleteDraftMedia")
    return
  }

  emit("deleteDraft", props.draftView.id)
}
</script>

<template>
  <div class="post-draft-item">
    <div class="post-draft-item__prop-container">
      <div
        v-if="draftView.updatedAt != null"
        class="tag post-draft-item__prop post-draft-item__updated-at-prop"
      >
        <span>{{ mainState.formatDate(draftView.updatedAt) }}</span>
      </div>
      <div
        v-if="draftView.draft.deviceName != null"
        class="tag post-draft-item__prop post-draft-item__device-name-prop"
      >
        <span>{{ draftView.draft.deviceName }}</span>
      </div>
      <div
        v-if="draftView.draft.langs != null"
        class="tag post-draft-item__prop post-draft-item__lang-prop"
      >
        <SVGIcon name="translate" />
        <span>{{ draftView.draft.langs.join(", ") }}</span>
      </div>
      <div
        v-if="draftView.draft.threadgateAllow != null"
        class="tag post-draft-item__prop post-draft-item__reaction-control-prop"
      >
        <SVGIcon name="lock" />
        <span>{{ $t("threadgate") }}</span>
      </div>
      <div
        v-if="draftView.draft.postgateEmbeddingRules?.[0].$type === 'app.bsky.feed.postgate#disableRule'"
        class="tag post-draft-item__prop post-draft-item__reaction-control-prop"
      >
        <SVGIcon name="lock" />
        <span>{{ $t("postgateNotAllow") }}</span>
      </div>
    </div>
    <div class="post-draft-item__post-container">
      <PostDraftItemPost
        v-for="post, postIndex of draftView.draft.posts"
        :key="postIndex"
        :draftPost="post"
        @close="close"
      />
    </div>
    <div class="group-parts">
      <button
        type="button"
        class="button--bordered button--small"
        @click.stop="deleteDraft"
      >
        <SVGIcon name="remove" />
        <span>{{ $t("delete") }}</span>
      </button>
      <button
        type="button"
        class="button button--small"
        :disabled="draftView.draft.posts.length >= 2"
        @click.stop="applyDraft"
      >
        <SVGIcon name="check" />
        <span>{{ $t("apply") }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.post-draft-item {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;

  &__prop-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    grid-gap: 0.5em;
  }

  .tag {
    font-size: 0.875em;
  }

  &__updated-at-prop {
    --color: var(--fg-color);
    opacity: 0.75;
  }

  &__device-name-prop {
    --color: var(--fg-color);
    opacity: 0.75;
  }

  &__lang-prop {
    --color: var(--fg-color);
  }

  &__reaction-control-prop {
    --color: var(--notice-color);
  }

  .group-parts {
    margin-left: auto;
  }
}
</style>
