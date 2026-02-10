<script lang="ts" setup>
import AvatarThumbnail from "@/components/next/Avatar/AvatarThumbnail.vue"

defineProps<{
  did?: string
  image?: string
  blur?: boolean
  isLabeler?: boolean
  actorStatus?: TIActorStatus
  noLink?: boolean
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
      :blur="blur"
      :isLabeler="isLabeler"
      :actorStatus="actorStatus"
    />
    <slot name="after" />
  </Component>
</template>
