<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  url: string
}>()
</script>

<template>
  <div class="website-link">
    <a
      class="textlink--icon"
      :href="url"
      ref="norefferer"
      target="_blank"
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
