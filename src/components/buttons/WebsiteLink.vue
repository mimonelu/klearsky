<script lang="ts" setup>
import { computed } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { useSafeExternalUrl } from "@/composables/util/use-safe-external-url"

const props = defineProps<{
  url: string
}>()

const { onClickExternalLink } = useSafeExternalUrl()

const safeHref = computed((): undefined | string => {
  return Util.safeExternalUrl(props.url)
})
</script>

<template>
  <div class="website-link">
    <a
      class="textlink--icon"
      :href="safeHref"
      rel="noreferrer"
      target="_blank"
      @click="onClickExternalLink($event, url)"
    >
      <SVGIcon name="earth" />
      <span>{{ url }}</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
.website-link {
  display: flex;
}

.textlink--icon {
  overflow: hidden;

  & > span {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
