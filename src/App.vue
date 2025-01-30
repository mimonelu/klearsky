<script setup lang="ts">
import { RouterView } from "vue-router"
import GlobalError from "@/components/next/GlobalError/Main.vue"
import MemoryInfo from "@/components/next/MemoryInfo/Main.vue"

const isDevelopment = import.meta.env.MODE === "development"
const useMemoryInfo = import.meta.env.VITE_MEMORY_INFO === "1"
</script>

<template>
  <RouterView />
  <GlobalError v-if="isDevelopment" />
  <MemoryInfo v-if="isDevelopment && useMemoryInfo" />
</template>
