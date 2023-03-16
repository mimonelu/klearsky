<script lang="ts" setup>
import NotificationList from "@/components/NotificationList.vue"
</script>

<template>
  <div class="mention-notifications-view">
    <NotificationList reason="mention" />
  </div>
</template>

<style lang="scss" scoped>
.mention-notifications-view {
  padding: 0.5rem 0;
}
</style>
