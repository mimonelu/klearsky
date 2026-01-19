<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBoxList from "@/components/lists/UserBoxList.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="author-following-list">
    <!-- 空メッセージ -->
    <div
      v-if="!mainState.listLoaderDisplay && mainState.currentFollowings.length === 0"
      class="textlabel author-following-list__no-followings"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noFollowings") }}
      </div>
    </div>

    <UserBoxList type="following" />
  </div>
</template>

<style lang="scss" scoped>
.author-following-list {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__no-followings {
    margin: 1rem;
  }

  .user-box-list {
    flex-grow: 1;
  }
}
</style>
