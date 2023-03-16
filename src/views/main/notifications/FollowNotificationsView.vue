<script lang="ts" setup>
import NotificationList from "@/components/NotificationList.vue"
</script>

<template>
  <div class="follow-notifications-view">
    <NotificationList reason="follow" />
  </div>
</template>

<style lang="scss" scoped>
.follow-notifications-view {
  padding: 0.5rem 0;
}
</style>
