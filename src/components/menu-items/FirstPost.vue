<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  did: string;
}>()

const mainState = inject("state") as MainState

const router = useRouter()

async function moveToFirstPost (event: Event) {
  Util.blurElement()
  emit("close")
  if (props.did == null) return
  if (mainState.processing) return
  mainState.processing = true
  try {
    const uri = await mainState.atp.fetchFirstPost(props.did)
    if (uri == null) return
    const postUrl = { name: "post", query: { uri } }
    if ((event as any).metaKey || (event as any).ctrlKey) {
      const resolvedRoute = router.resolve(postUrl)
      window.open(resolvedRoute.href, "_blank")
      return
    }
    await router.push(postUrl)
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <button @click.prevent.stop="moveToFirstPost">
    <SVGIcon name="post" />
    <span>{{ $t("firstPost") }}</span>
  </button>
</template>
