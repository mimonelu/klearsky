<script lang="ts" setup>
import type { AppBskyDraftDefs } from "@atproto/api"
import HtmlText from "@/components/labels/HtmlText.vue"
import LabelTags from "@/components/buttons/LabelTags.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{
  (event: "close"): void
}>()

defineProps<{
  draftPost: AppBskyDraftDefs.DraftPost
}>()

function close () {
  emit("close")
}
</script>

<template>
  <div class="post-draft-item-post">
    <div
      v-if="draftPost.embedRecords != null"
      class="tag post-draft-item-post__quote-repost"
    >
      <SVGIcon name="quoteRepost" />
      <span>{{ $t("quoteRepost") }}</span>
    </div>
    <HtmlText
      dir="auto"
      :text="draftPost.text"
      :hasTranslateLink="false"
      @onActivateHashTag="close"
      @onActivateMention="close"
    />
    <div
      v-if="draftPost.embedExternals?.[0]?.uri != null"
      class="post-draft-item-post__tag-wrapper"
    >
      <div class="tag--link">
        <SVGIcon name="link" />
        <span>{{ draftPost.embedExternals[0].uri }}</span>
      </div>
    </div>
    <div
      v-if="draftPost.embedImages != null"
    >
      <div
        v-for="image, imageIndex of draftPost.embedImages"
        :key="imageIndex"
      >{{ image.localRef?.path }}</div>
    </div>
    <div
      v-if="draftPost.embedVideos?.[0]?.localRef != null"
    >{{ draftPost.embedVideos[0].localRef }}</div>
    <LabelTags
      v-if="(draftPost.labels as any)?.values != null"
      :labels="(draftPost.labels as any).values as TTLabel[]"
      :labelerDisplay="false"
      :unauthenticatedDisplay="false"
      :harmfulDisplay="true"
      :customDisplay="true"
    />
  </div>
</template>

<style lang="scss" scoped>
.post-draft-item-post {
  border: 1px solid rgb(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;
  &:first-child {
    border-top-left-radius: var(--border-radius-middle);
    border-top-right-radius: var(--border-radius-middle);
  }
  &:last-child {
    border-bottom-left-radius: var(--border-radius-middle);
    border-bottom-right-radius: var(--border-radius-middle);
  }
  &:not(:last-child) {
    border-bottom-style: none;
  }

  &__quote-repost {
    --color: var(--share-color);
    font-size: 0.875em;
  }

  .html-text {
    line-height: var(--line-height-middle);
  }

  &__tag-wrapper {
    display: flex;
  }

  .tag--link {
    --color: var(--accent-color);
    font-size: 0.875em;
  }

  .label-tags {
    font-size: 0.875em;
  }
}
</style>
