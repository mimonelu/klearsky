<script lang="ts" setup>
import { inject } from "vue"
import Lists from "@/components/list/Lists.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <Lists :lists="mainState.currentAuthorLists" />
</template>

<style lang="scss" scoped>
.lists {
  flex-grow: 1;
}
</style>
