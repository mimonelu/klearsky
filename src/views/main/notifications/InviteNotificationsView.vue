<script lang="ts" setup>
import NotificationList from "@/components/NotificationList.vue"
</script>

<template>
  <div class="invite-notifications-view">
    <NotificationList reason="invite" />
  </div>
</template>

<style lang="scss" scoped>
.invite-notifications-view {
  padding: 0.5rem 0;
}
</style>
