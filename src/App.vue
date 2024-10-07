<script setup lang="ts">
import { RouterView } from "vue-router"
import GlobalError from "@/components/next/GlobalError/Main.vue"

const isDevelopment = import.meta.env.MODE === "development"
</script>

<template>
  <RouterView />
  <GlobalError v-if="isDevelopment" />
</template>
