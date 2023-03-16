<script lang="ts" setup>
import NotificationList from "@/components/NotificationList.vue"
</script>

<template>
  <div class="repost-notifications-view">
    <NotificationList reason="repost" />
  </div>
</template>

<style lang="scss" scoped>
.repost-notifications-view {
  padding: 0.5rem 0;
}
</style>
