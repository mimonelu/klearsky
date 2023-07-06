<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import type { Entity, Facet, RichTextOpts, RichTextProps } from "@atproto/api"
import { RichText } from "@atproto/api"

type RichParam = {
  type: "link" | "mention" | "tag" | "text",
  text: string,
  param: string,
}

const TAG_REGEXP_STRING = "#[^#\\s\\(\\)\\[\\]{}<>\"'`:;,.!?/\\\\|　]+"
const TAG_REGEXP_SINGLE = new RegExp(TAG_REGEXP_STRING)
const TAG_REGEXP_ALL = new RegExp(`(?=^|\\W)(${TAG_REGEXP_STRING})`, "g")

const emit = defineEmits<{(name: string, text: string): void}>()

const props = defineProps<{
  text?: string;
  facets?: Facet[];
  entities?: Entity[];
  hasTranslateLink?: boolean;
}>()

const mainState = inject("state") as MainState

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
      // リンク
      if (segment.isLink())
        results.push({
          type: "link",
          text: segment.text,
          param: segment.link?.uri ?? '',
        })

      // メンション
      else if (segment.isMention())
        results.push({
          type: "mention",
          text: segment.text,
          param: segment.mention?.did ?? '',
        })

      else {
        const matches = segment.text.split(TAG_REGEXP_ALL)
        for (const match of matches) {
          // ハッシュタグ
          if (TAG_REGEXP_SINGLE.test(match))
            results.push({
              type: "tag",
              text: match,
              param: match.substring(1),
            })

          // テキスト
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
  if (mainState.currentSearchKeywordTerm === text) return
  emit("onActivateHashTag", text)
}
</script>

<template>
  <div class="html-text">
    <template v-for="segment of state.segments">
      <!-- リンク -->
      <template v-if="segment.type === 'link'">
        <a
          class="textlink"
          :href="segment.param"
          rel="noreferrer"
          :target="segment.param.startsWith('lightning:') ? '' : '_blank'"
          @click.stop
        >{{ segment.text }}</a>
      </template>

      <!-- メンション -->
      <template v-else-if="segment.type === 'mention'">
        <RouterLink
          class="textlink"
          :to="`/profile/post?account=${segment.param}`"
          @click.stop="$emit('onActivateMention')"
        >{{ segment.text }}</RouterLink>
      </template>

      <!-- ハッシュタグ -->
      <template v-else-if="segment.type === 'tag'">
        <RouterLink
          class="textlink"
          :to="`/search/keyword?text=${segment.param}`"
          @click.stop="onActivateHashTag(segment.param)"
        >{{ segment.text }}</RouterLink>
      </template>

      <!-- テキスト -->
      <template v-else>{{ segment.text }}</template>
    </template>

    <!-- 翻訳リンク -->
    <template v-if="hasTranslateLink">
      &#160;<a
        v-if="hasTranslateLink"
        class="textlink translate-link"
        @click.prevent.stop="$emit('translate')"
      >{{ $t("translate") }}</a>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.translate-link {
  --accent-color: var(--fg-color);
  --opacity: 0.5;
  border-radius: 0.25em;
  color: rgba(var(--accent-color), var(--opacity));
  font-size: 0.875em;
  padding: 0 0.25em;
  &:focus, &:hover {
    --opacity: 0.75;
    background-color: rgba(var(--accent-color), 0.125);
  }
}
</style>
