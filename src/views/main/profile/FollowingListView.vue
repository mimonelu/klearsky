<script lang="ts" setup>
import { inject } from "vue"
import UserList from "@/components/list/UserList.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

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

    <UserList type="following" />
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

  .user-list {
    flex-grow: 1;
  }
}
</style>
