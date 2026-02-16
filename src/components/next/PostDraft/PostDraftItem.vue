<script lang="ts" setup>
import { inject } from "vue"
import type { AppBskyDraftDefs } from "@atproto/api"
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
  const post = draft.posts[0]

  // TODO: 連投機能実装後に連投下書きにも対応すること
  if (post == null || draft.posts.length >= 2) {
    return
  }

  const params: TTSendPostPopupParams = {
    action: "reuse",
    type: "post",
    text: post.text,
    url: post.embedExternals?.[0]?.uri,
    langs: draft.langs ?? mainState.currentSetting.postLanguages,
    labels: (post.labels as any)?.values?.map((l: any) => l.val),
  }

  // 引用リポスト
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

  // 反応制限
  const draftReactionControl: TTDraftReactionControl = {
    postgateAllow: true,
    threadgateAction: "none",
    allowMention: false,
    allowFollower: false,
    allowFollowing: false,
    listUris: [],
  }
  if (draft.threadgateAllow != null) {
    draftReactionControl.threadgateAction = "custom"
    for (const allow of draft.threadgateAllow) {
      if (allow.$type.includes("mentionRule")) {
        draftReactionControl.allowMention = true
      } else if (allow.$type.includes("followerRule")) {
        draftReactionControl.allowFollower = true
      } else if (allow.$type.includes("followingRule")) {
        draftReactionControl.allowFollowing = true
      } else if (allow.$type.includes("listRule") && (allow as any).list != null) {
        draftReactionControl.listUris.push((allow as any).list)
      }
    }
  }
  if (draft.postgateEmbeddingRules?.some((rule) => {
    return rule.$type === "app.bsky.feed.postgate#disableRule"
  })) {
    draftReactionControl.postgateAllow = false
  }
  params.draftReactionControl = draftReactionControl

  // TODO: 画像・動画の適用

  emit("close")
  await mainState.openSendPostPopup(params)
}

async function deleteDraft () {
  const text = props.draftView.draft.posts?.[0]?.text?.replace(/\n/g, " ") ?? ""
  const detail = text.length > 48 ? `${text.substring(0, 48)}...` : text
  if (!(await mainState.openConfirmationPopup({
    title: $t("confirmation"),
    text: $t("postDraftDeleteConfirmation"),
    detail,
  }))) {
    return
  }
  mainState.loaderDisplay = true
  const response = await mainState.atp.deleteDraft(props.draftView.id)
  mainState.loaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "PostDraftItem/deleteDraft")
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
