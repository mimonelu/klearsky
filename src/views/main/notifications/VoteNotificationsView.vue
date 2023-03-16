<script lang="ts" setup>
import NotificationList from "@/components/NotificationList.vue"
</script>

<template>
  <div class="vote-notifications-view">
    <NotificationList reason="vote" />
  </div>
</template>

<style lang="scss" scoped>
.vote-notifications-view {
  padding: 0.5rem 0;
}
</style>
