<script lang="ts" setup>
import { computed, reactive, type ComputedRef } from "vue"
import type { Entity, Facet, RichTextOpts, RichTextProps } from "@atproto/api"
import { RichText } from "@atproto/api"

const props = defineProps<{
  text?: string;
  facets?: Facet[];
  entities?: Entity[];
}>()

const state = reactive<{
  richText: ComputedRef<RichText>;
}>({
  richText: computed(() => {
    const rtProps: RichTextProps = { text: props.text ?? "" }
    if (props.facets != null) rtProps.facets = props.facets
    if (props.entities != null) rtProps.entities = props.entities
    const rtOptions: RichTextOpts = { cleanNewlines: true }
    const richText = new RichText(rtProps, rtOptions)
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
