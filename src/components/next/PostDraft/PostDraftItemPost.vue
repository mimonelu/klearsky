<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue"
import type { AppBskyDraftDefs } from "@atproto/api"
import { loadMedia } from "@/components/next/PostDraft/post-draft-media-store"
import HtmlText from "@/components/labels/HtmlText.vue"
import LabelTags from "@/components/buttons/LabelTags.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{
  (event: "close"): void
}>()

const props = defineProps<{
  draftPost: AppBskyDraftDefs.DraftPost
}>()

const imageUrls = ref<Array<string>>([])
const videoUrls = ref<Array<string>>([])

const mediaNotFound = ref(false)

onMounted(async () => {
  const imgs: Array<string> = []
  const vids: Array<string> = []

  for (const image of props.draftPost.embedImages ?? []) {
    if (image.localRef?.path == null) {
      continue
    }
    const entry = await loadMedia(image.localRef.path)
    if (entry instanceof Error || entry == null) {
      mediaNotFound.value = true
      imgs.forEach((url) => URL.revokeObjectURL(url))
      return
    }
    imgs.push(URL.createObjectURL(entry.blob))
  }

  for (const video of props.draftPost.embedVideos ?? []) {
    if (video.localRef?.path == null) {
      continue
    }
    const entry = await loadMedia(video.localRef.path)
    if (entry instanceof Error || entry == null) {
      mediaNotFound.value = true
      imgs.forEach((url) => URL.revokeObjectURL(url))
      vids.forEach((url) => URL.revokeObjectURL(url))
      return
    }
    vids.push(URL.createObjectURL(entry.blob))
  }

  imageUrls.value = imgs
  videoUrls.value = vids
})

onBeforeUnmount(() => {
  imageUrls.value.forEach((url) => URL.revokeObjectURL(url))
  videoUrls.value.forEach((url) => URL.revokeObjectURL(url))
})

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
      :text="draftPost.text || '&nbsp;'"
      :hasTranslateLink="false"
      @onActivateHashTag="close"
      @onActivateMention="close"
    />
    <div
      v-if="draftPost.embedExternals?.[0]?.uri != null"
      class="post-draft-item-post__tag-wrapper"
    >
      <a
        class="tag--link"
        :href="draftPost.embedExternals[0].uri"
        ref="norefferer"
        target="_blank"
      >
        <SVGIcon name="link" />
        <span>{{ draftPost.embedExternals[0].uri }}</span>
      </a>
    </div>

    <!-- メディアが存在しないメッセージ -->
    <div
      v-if="mediaNotFound"
      class="tag post-draft-item-post__media-not-found"
    >
      <SVGIcon name="alert" />
      <span>{{ $t("postDraftMediaNotFoundOnDevice") }}</span>
    </div>

    <!-- 画像 -->
    <div
      v-else-if="imageUrls.length > 0"
      class="post-draft-item-post__image-container"
    >
      <img
        class="post-draft-item-post__image"
        v-for="url, urlIndex of imageUrls"
        :key="urlIndex"
        :src="url"
        :alt="draftPost.embedImages?.[urlIndex]?.alt ?? ''"
      />
    </div>

    <!-- 動画 -->
    <div
      v-else-if="videoUrls.length > 0"
      class="post-draft-item-post__video-container"
    >
      <video
        v-for="url, urlIndex of videoUrls"
        :key="urlIndex"
        class="post-draft-item-post__video"
        :src="url"
        :aria-label="draftPost.embedVideos?.[urlIndex]?.alt ?? ''"
        controls
        loading="lazy"
        loop
        muted
        preload="metadata"
      />
    </div>

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
  background-color: rgb(var(--fg-color), 0.0625);
  border-top: 1px solid rgb(var(--fg-color), 0.125);
  border-bottom: 1px solid rgb(var(--fg-color), 0.125);
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;
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

  &__media-not-found {
    --color: var(--fg-color);
    font-size: 0.875em;
    opacity: 0.5;
  }

  &__image-container {
    display: grid;
    grid-gap: 1px;
    grid-template-columns: repeat(4, 1fr);
  }

  &__image {
    aspect-ratio: 1 / 1;
    background-color: rgb(var(--fg-color), 0.125);
    display: block;
    object-fit: contain;
  }

  &__video-container {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5em;
  }

  &__video {
    background-color: rgb(var(--fg-color), 0.125);
    display: block;
    width: 100%;
  }

  &__tag-wrapper {
    display: flex;
  }

  .tag--link {
    --color: var(--accent-color);
    font-size: 0.875em;
    overflow: hidden;

    & > span {
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .label-tags {
    font-size: 0.875em;
  }
}
</style>
