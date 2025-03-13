<script lang="ts" setup>
import { useRouter, type LocationQueryRaw } from "vue-router"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  label: string
  query: TIPostSearch
}>()

const router = useRouter()

async function moveToPostSearch () {
  Util.blurElement()
  emit("close")
  router.push({
    name: "post-search",
    query: props.query as never as LocationQueryRaw,
  })
}
</script>

<template>
  <button @click.prevent.stop="moveToPostSearch">
    <SVGIcon name="search" />
    <span>{{ $t(label) }}</span>
  </button>
</template>
