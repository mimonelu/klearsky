<script lang="ts" setup>
import { inject } from "vue"
import MediaListItem from "@/components/lists/MediaListItem.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  medias: Array<TTMedia>
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <div class="media-list">
    <!-- 空のコンテンツメッセージ -->
    <div
      v-if="!mainState.listLoaderDisplay && medias?.length === 0"
      class="textlabel margin1"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noPostsInFeed") }}
      </div>
    </div>

    <div class="media-list__item-container">
      <MediaListItem
        v-for="media, mediaIndex of medias"
        :key="mediaIndex"
        :media="media"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.media-list__item-container {
  display: grid;
  grid-gap: 1px;
  grid-template-columns: repeat(2, 1fr);
  padding: 1px;
}
</style>
