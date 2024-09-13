<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

function openMyFeedsPopup () {
  Util.blurElement()
  mainState.openMyFeedsPopup()
}

function openMyListPopup () {
  Util.blurElement()
  mainState.openMyListPopup()
}

function openLabelerListPopup () {
  Util.blurElement()
  mainState.openLabelerListPopup("myLabeler", mainState.myLabeler!.labelers)
}
</script>

<template>
  <div class="page-header-buttons">
    <!-- マイフィードポップアップトリガー -->
    <button
      type="button"
      @click.stop="openMyFeedsPopup"
    >
      <SVGIcon name="feed" />
    </button>

    <!-- マイリストポップアップトリガー -->
    <button
      type="button"
      @click.stop="openMyListPopup"
    >
      <SVGIcon name="list" />
    </button>

    <!-- ラベラー一覧ポップアップトリガー -->
    <button
      type="button"
      @click.stop="openLabelerListPopup"
    >
      <SVGIcon name="labeler" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.page-header-buttons {
  display: flex;
  align-items: center;
}
</style>
