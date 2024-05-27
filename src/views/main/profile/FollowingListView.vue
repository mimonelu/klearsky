<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBoxList from "@/components/lists/UserBoxList.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="following-list">
    <!-- 空メッセージ -->
    <div
      v-if="!mainState.listLoaderDisplay && mainState.currentFollowings.length === 0"
      class="textlabel following-list__no-followings"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noFollowings") }}
      </div>
    </div>

    <UserBoxList type="following" />
  </div>
</template>

<style lang="scss" scoped>
.following-list {
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
