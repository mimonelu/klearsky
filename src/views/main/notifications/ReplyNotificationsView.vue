<script lang="ts" setup>
import NotificationList from "@/components/NotificationList.vue"
</script>

<template>
  <div class="reply-notifications-view">
    <NotificationList reason="reply" />
  </div>
</template>

<style lang="scss" scoped>
.reply-notifications-view {
  padding: 0.5rem 0;
}
</style>
