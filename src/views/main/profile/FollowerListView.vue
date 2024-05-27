<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBoxList from "@/components/lists/UserBoxList.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="follower-list">
    <!-- 空メッセージ -->
    <div
      v-if="!mainState.listLoaderDisplay && mainState.currentFollowers.length === 0"
      class="textlabel follower-list__no-followers"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noFollowers") }}
      </div>
    </div>

    <UserBoxList type="follower" />
  </div>
</template>

<style lang="scss" scoped>
.follower-list {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__no-followers {
    margin: 1rem;
  }

  .user-box-list {
    flex-grow: 1;
  }
}
</style>
