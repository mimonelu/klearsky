<script lang="ts" setup>
import { reactive, computed, type ComputedRef } from "vue"
import AvatarLink from "@/components/next/Avatar/AvatarLink.vue"

const props = defineProps<{
  followers: Array<TTUser>
}>()

const state = reactive<{
  followers: ComputedRef<Array<TTUser>>
}>({
  followers: computed((): Array<TTUser> => {
    return [...props.followers].splice(0, 5).reverse()
  }),
})
</script>

<template>
  <div class="known-followers">
    <AvatarLink
      v-for="follower, index of state.followers"
      :key="index"
      :did="follower.did"
      :image="follower.avatar"
      :isLabeler="follower.associated?.labeler"
      :noLink="false"
      :actorStatus="follower.status"
    />
  </div>
</template>

<style lang="scss" scoped>
.known-followers {
  display: flex;
  align-items: flex-end;
  flex-direction: row-reverse;
}

.avatar-link {
  position: relative;
  &:not(:last-child) {
    margin-left: -0.125em;
  }

  &:deep(.avatar-thumbnail__inner) {
    box-shadow: 0 0 0 2px rgb(var(--bg-color));
  }
}
</style>
