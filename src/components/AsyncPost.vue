<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import LinkBox from "@/components/LinkBox.vue"
import Loader from "@/components/Loader.vue"
import Thumbnail from "@/components/Thumbnail.vue"

const props = defineProps<{
  uri: string;
  handle?: string;
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  post?: TTPost;
}>({
  post: undefined,
})

onBeforeMount(async () => {
  if (state.post != null) return
  try {
    const post = await mainState.atp.fetchPost(props.uri, props.handle)
    if (post != null) state.post = post
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div class="async-post">
    <template v-if="state.post != null">
      <!-- 本文 -->
      <div
        v-if="state.post.__textHtml"
        v-html="state.post.__textHtml"
        class="text"
      />

      <!-- リンクボックス -->
      <LinkBox
        :external="state.post.embed?.external"
        :displayImage="false"
      />

      <!-- イメージボックス -->
      <div
        v-if="mainState.currentSetting.imageControl !== 'none' &&
          state.post.embed?.images?.length"
        class="images"
      >
        <Thumbnail
          v-for="image of state.post.embed.images"
          :image="image"
        />
      </div>

    </template>
    <Loader v-if="state.post == null" />
  </div>
</template>

<style lang="scss" scoped>
.async-post {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
  position: relative;
}

// 本文
.text {
  line-height: 1.5;
  word-break: break-word;
}

// リンクボックス
.external {
  background-color: rgba(var(--fg-color), 0.125);
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);
  cursor: pointer;
  overflow: hidden;
  &:focus, &:hover {
    border-color: rgba(var(--fg-color), 0.5);
  }

  &__meta {
    display: grid;
    grid-template-rows: auto auto auto;
    padding: 0.5em;
  }
  &__title,
  &__uri,
  &__description {
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__title {
    font-weight: bold;
  }
  &__uri {
    color: rgba(var(--fg-color), 0.5);
    font-size: 0.875em;
  }
  &__description {
    font-size: 0.875em;
  }
}

// イメージボックス
.images {
  display: flex;
  grid-gap: 0.5rem;

  & > .thumbnail:deep() {
    border-radius: var(--border-radius);
    cursor: pointer;
    overflow: hidden;

    & > img {
      aspect-ratio: 16 / 9;
      object-fit: cover;
      height: 4rem;
    }
  }
}

.loader {
  font-size: 0.75rem;
  position: relative;
  z-index: unset;
}
</style>
