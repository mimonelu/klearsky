<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import type { Entity, Facet, RichTextOpts, RichTextProps } from "@atproto/api"
import { RichText } from "@atproto/api"

type RichParam = {
  type: "link" | "mention" | "tag" | "text",
  text: string,
  param: string,
}

const emit = defineEmits<{(name: string): void}>()

const props = defineProps<{
  text?: string;
  facets?: Facet[];
  entities?: Entity[];
}>()

const mainState = inject("state") as MainState

const tagRegExpString = "#[^\\s\\(\\)\\[\\]]+"
const tagRegExp = new RegExp(tagRegExpString)
const regexp = new RegExp(`(?<=^|\\s)(${tagRegExpString})`, "g")

const state = reactive<{
  segments: ComputedRef<Array<RichParam>>;
}>({
  segments: computed(() => {
    const rtProps: RichTextProps = { text: props.text ?? "" }
    if (props.facets != null) rtProps.facets = props.facets
    if (props.entities != null) rtProps.entities = props.entities
    const rtOptions: RichTextOpts = { cleanNewlines: true }
    const richText = new RichText(rtProps, rtOptions)
    if (props.facets == null) richText.detectFacetsWithoutResolution()
    const results: Array<RichParam> = []
    for (const segment of richText.segments()) {
      if (segment.isLink())
        results.push({
          type: "link",
          text: segment.text,
          param: segment.link?.uri ?? '',
        })
      else if (segment.isMention())
        results.push({
          type: "mention",
          text: segment.text,
          param: segment.mention?.did ?? '',
        })
      else {
        const matches = segment.text.split(regexp)
        for (const match of matches) {
          if (tagRegExp.test(match))
            results.push({
              type: "tag",
              text: match,
              param: match.substring(1),
            })
          else
            results.push({
              type: "text",
              text: match,
              param: "",
            })
        }
      }
    }
    return results
  }),
})

function onActivateHashTag (text: string) {
  mainState.currentSearchKeywordTerm = text
  emit("onActivateHashTag")
}
</script>

<template>
  <div class="html-text">
    <template v-for="segment of state.segments">
      <template v-if="segment.type === 'link'">
        <a
          class="textlink"
          :href="segment.param"
          rel="noreferrer"
          target="_blank"
          @click.stop
        >{{ segment.text }}</a>
      </template>
      <template v-else-if="segment.type === 'mention'">
        <RouterLink
          class="textlink"
          :to="`/profile/post?handle=${segment.param}`"
          @click.stop
        >{{ segment.text }}</RouterLink>
      </template>
      <template v-else-if="segment.type === 'tag'">
        <RouterLink
          class="textlink"
          :to="`/search/keyword?text=${segment.param}`"
          @click.stop="onActivateHashTag(segment.param)"
        >{{ segment.text }}</RouterLink>
      </template>
      <template v-else>{{ segment.text }}</template>
    </template>
  </div>
</template>
