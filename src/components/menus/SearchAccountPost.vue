<script lang="ts" setup>
import { useRouter } from "vue-router"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser
}>()

const router = useRouter()

async function moveToPostSearch () {
  Util.blurElement()
  emit("close")
  router.push({ name: "post-search", query: { text: `from:${props.user.handle} ` } })
}
</script>

<template>
  <button @click.prevent.stop="moveToPostSearch">
    <SVGIcon name="search" />
    <span>{{ $t("searchAccountPost") }}</span>
  </button>
</template>
