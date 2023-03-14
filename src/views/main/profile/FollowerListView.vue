<script lang="ts" setup>
import { inject } from "vue"

const mainState: MainState = inject("state") as MainState
</script>

<template>
  <div class="follower-list">
    <div
      v-for="follower of mainState.currentFollowers"
      class="follower"
    >{{ follower }}</div>
  </div>
</template>
