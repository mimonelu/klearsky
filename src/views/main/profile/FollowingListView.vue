<script lang="ts" setup>
import { inject } from "vue"

const mainState: MainState = inject("state") as MainState
</script>

<template>
  <div class="following-list">
    <div
      v-for="following of mainState.currentFollowings"
      class="following"
    >{{ following }}</div>
  </div>
</template>
