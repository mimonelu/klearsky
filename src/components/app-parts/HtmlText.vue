<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import type { Entity, Facet, RichTextOpts, RichTextProps } from "@atproto/api"
import { RichText } from "@atproto/api"

type RichParam = {
  type: "externalLink" | "internalLink" | "mention" | "tag" | "text",
  text: string,
  param: string,
}

const TAG_REGEXP_STRING = "#[^#\\s\\(\\)\\[\\]{}<>\"'`:;,.!?/\\\\|　]+"
const TAG_REGEXP_SINGLE = new RegExp(TAG_REGEXP_STRING)
const TAG_REGEXP_ALL = new RegExp(`(?=^|\\W)(${TAG_REGEXP_STRING})`, "g")
const INTERNAL_LINK_ITEMS = [
  // カスタムフィードページ
  {
    src: new RegExp("^https:\/\/bsky\.app\/profile\/did:plc:([^\/]+)\/feed\/([^\/]+)"),
    dst: "/home/feeds?feed=at://did:plc:[1]/app.bsky.feed.generator/[2]",
  },

  // ポストスレッドページ
  {
    src: new RegExp("^https:\/\/bsky\.app\/profile\/([^\/]+)\/post\/([^\/]+)"),
    dst: "/post?handle=[1]&rkey=[2]",
  },

  // プロフィールページ
  {
    src: new RegExp("^https:\/\/bsky\.app\/profile\/([^\/]+)$"),
    dst: "/profile/feeds?account=[1]",
  },

  // フォロイー一覧ページ
  {
    src: new RegExp("^https:\/\/bsky\.app\/profile\/([^\/]+)\/follows$"),
    dst: "/profile/following?account=[1]",
  },

  // フォロワー一覧ページ
  {
    src: new RegExp("^https:\/\/bsky\.app\/profile\/([^\/]+)\/followers$"),
    dst: "/profile/follower?account=[1]",
  },

  // ポスト検索ページ
  {
    src: new RegExp("^https:\/\/bsky\.app\/search\\?q=([^&]+)$"),
    dst: "/search/post?text=[1]",
  },

  // フィード検索ページ
  {
    src: new RegExp("^https:\/\/bsky\.app\/search\/feeds$"),
    dst: "/search/feed",
  },
]

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
      if (segment.isLink() && segment.link?.uri) {
        const uri = transformInternalLink(segment.link.uri)
        // 外部リンク
        if (uri == null)
          results.push({
            type: "externalLink",
            text: segment.text,
            param: segment.link.uri,
          })

        // 内部リンク
        else
          results.push({
            type: "internalLink",
            text: segment.text.startsWith("http") ? uri : segment.text,
            param: uri,
          })

      // メンション
      } else if (segment.isMention())
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

function transformInternalLink (uri: string): undefined | string {
  for (const item of INTERNAL_LINK_ITEMS) {
    const matches = uri.match(item.src)
    if (matches == null) continue
    return item.dst
      .replace("[1]", matches[1])
      .replace("[2]", matches[2])
  }
}
</script>

<template>
  <div class="html-text">
    <template v-for="segment of state.segments">
      <!-- 外部リンク -->
      <template v-if="segment.type === 'externalLink'">
        <a
          class="textlink external-link"
          :href="segment.param"
          rel="noreferrer"
          :target="segment.param.startsWith('lightning:') ? '' : '_blank'"
          @click.stop
        >{{ segment.text }}</a>
      </template>

      <!-- 内部リンク -->
      <template v-else-if="segment.type === 'internalLink'">
        <RouterLink
          class="textlink internal-link"
          :to="segment.param"
          @click.stop
        >{{ segment.text }}</RouterLink>
      </template>

      <!-- メンション -->
      <template v-else-if="segment.type === 'mention'">
        <RouterLink
          class="textlink mention"
          :to="`/profile/feeds?account=${segment.param}`"
          @click.stop="$emit('onActivateMention')"
        >{{ segment.text }}</RouterLink>
      </template>

      <!-- ハッシュタグ -->
      <template v-else-if="segment.type === 'tag'">
        <RouterLink
          class="textlink hash-tag"
          :to="`/search/post?text=${segment.param}`"
          @click.stop="emit('onActivateHashTag', segment.param)"
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
.external-link,
.internal-link {
  word-break: break-all;
}

.translate-link {
  --accent-color: var(--fg-color);
  --opacity: 0.5;
  border-radius: 0.25em;
  color: rgb(var(--accent-color), var(--opacity));
  font-size: 0.875em;
  padding: 0 0.25em;
  &:focus, &:hover {
    --opacity: 0.75;
    background-color: var(--accent-color-0125);
  }
}
</style>
