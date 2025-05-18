<script lang="ts" setup>
import AvatarThumbnail from "@/components/next/Avatar/AvatarThumbnail.vue"

defineProps<{
  did?: string
  image?: string
  isLabeler?: boolean
  noLink?: boolean
  actorStatus?: TIActorStatus
}>()
</script>

<template>
  <Component
    :is="noLink ? 'div' : 'RouterLink'"
    :to="{ name: 'profile-feeds', query: { account: did } }"
    class="avatar-link"
  >
    <AvatarThumbnail
      :image="image"
      :isLabeler="isLabeler"
      :actorStatus="actorStatus"
    />
  </Component>
</template>
