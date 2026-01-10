<script lang="ts" setup>
import { reactive, computed, type ComputedRef, inject } from "vue"
import AvatarLink from "@/components/next/Avatar/AvatarLink.vue"
import { hasUserBlurLabel } from "@/composables/util/use-content-labels"

const props = defineProps<{
  followers: Array<TTUser>
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  followers: ComputedRef<Array<TTUser>>
}>({
  followers: computed((): Array<TTUser> => {
    return [...props.followers].splice(0, 5).reverse()
  }),
})

function hasBlurLabel (follower: TTUser): boolean {
  return hasUserBlurLabel(mainState, follower.labels)
}
</script>

<template>
  <div class="known-followers">
    <AvatarLink
      v-for="follower, index of state.followers"
      :key="index"
      :did="follower.did"
      :image="follower.avatar"
      :blur="hasBlurLabel(follower)"
      :isLabeler="follower.associated?.labeler"
      :actorStatus="follower.status"
      :noLink="false"
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
