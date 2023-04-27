<script lang="ts" setup>
import { computed, reactive, type ComputedRef } from "vue"
import type { Entity, Facet, RichTextProps } from "@atproto/api"
import { RichText } from "@atproto/api"

const props = defineProps<{
  text: string;
  facets?: Facet[];
  entities?: Entity[];
}>()

const state = reactive<{
  richText: ComputedRef<RichText>;
}>({
  richText: computed(() => {
    const options: RichTextProps = { text: props.text }
    if (props.facets != null) options.facets = props.facets
    if (props.entities != null) options.entities = props.entities
    const richText = new RichText(options)
    if (props.facets == null) richText.detectFacetsWithoutResolution()
    return richText
  }),
})
</script>

<template>
  <div class="html-text">
    <template v-for="segment of state.richText.segments()">
      <template v-if="segment.isLink()">
        <a
          class="textlink"
          :href="segment.link?.uri ?? ''"
          rel="noreferrer"
          target="_blank"
          @click.stop
        >{{ segment.text }}</a>
      </template>
      <template v-else-if="segment.isMention()">
        <RouterLink
          class="textlink"
          :to="`/profile/post?handle=${segment.mention?.did ?? ''}`"
          @click.stop
        >{{ segment.text }}</RouterLink>
      </template>
      <template v-else>{{ segment.text }}</template>
    </template>
  </div>
</template>
