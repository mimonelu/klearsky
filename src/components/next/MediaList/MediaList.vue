<script lang="ts" setup>
import { inject } from "vue"
import MediaListItem from "@/components/next/MediaList/MediaListItem.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const props = defineProps<{
  did?: string
  medias: Array<TTMedia>
}>()

const mainState = inject("state") as MainState

function onClickItem (mediaIndex: number) {
  if (props.did == null) {
    return
  }
  mainState.imagePopupProps.did = props.did
  mainState.imagePopupProps.images.splice(
    0,
    mainState.imagePopupProps.images.length,
    ...props.medias.map((media) => ({
      largeUri: media.largeUri,
      smallUri: media.smallUri,
    }))
  )
  mainState.imagePopupProps.alts.splice(
    0,
    mainState.imagePopupProps.alts.length,
    ...props.medias.map((media) => media.alt ?? "")
  )
  mainState.imagePopupProps.index = mediaIndex
  mainState.imagePopupProps.display = true
}
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
        @clickItem="onClickItem(mediaIndex)"
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
