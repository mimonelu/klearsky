<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import type { Facet } from "@atproto/api"
import { RichText } from "@atproto/api"
import Util from "@/composables/util"

type RichParam = {
  type: "externalLink" | "internalLink" | "mention" | "tag" | "text"
  text: string
  param: string
}

const emit = defineEmits<{(name: string, text: string): void}>()

const props = defineProps<{
  richText?: RichText
  text?: string
  facets?: Facet[]
  hasTranslateLink?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  segments: ComputedRef<Array<RichParam>>;
}>({
  segments: computed((): Array<RichParam> => {
    let richText: undefined | RichText
    if (props.richText != null) {
      richText = props.richText
    } else {
      richText = new RichText(
        {
          text: props.text ?? "",
          facets: props.facets,
        }, {
          cleanNewlines: true,
        }
      )
      if (props.facets == null) {
        richText.detectFacetsWithoutResolution()
      }
    }

    const results: Array<RichParam> = []
    for (const segment of richText.segments()) {
      // リンク
      if (segment.isLink()) {
        const uri = transformInternalLink(segment.link?.uri ?? "")

        // 外部リンク
        if (uri == null)
          results.push({
            type: "externalLink",
            text: segment.text,
            param: segment.link?.uri ?? "",
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
          param: segment.mention?.did ?? "",
        })

      // ハッシュタグ
      else if (segment.isTag())
        results.push({
          type: "tag",
          text: segment.text,
          param: encodeURIComponent(segment.tag?.tag ?? ""),
        })

      else
        results.push({
          type: "text",
          text: segment.text,
          param: "",
        })
    }
    return results
  }),
})

function transformInternalLink (uri: string): undefined | string {
  const url: undefined | URL = Util.safeUrl(uri)
  if (url == null) {
    console.warn(`[klearsky/transformInternalLink/${uri}]`, uri)
    return
  }
  switch (url.hostname) {
    // 公式URL
    case "bsky.app": {
      const paths = url.pathname.split("/")
      switch (paths[1]) {
        // プロフィール関連
        case "profile": {
          if (paths[2] == null) {
            return
          }

          // プロフィールページ
          if (paths[3] == null) {
            return `/profile/feeds?account=${paths[2]}`
          }

          // プロフィールページ以外
          switch (paths[3]) {
            // カスタムフィードページ
            case "feed": {
              if (!paths[4]) {
                return
              }
              if (!paths[2].startsWith("did:")) {
                // TODO: ハンドルの場合は DID を取得すること
                return
              }
              return `/home/feeds?feed=at://${paths[2]}/app.bsky.feed.generator/${paths[4]}`
            }

            // リストフィードページ
            case "lists": {
              if (!paths[4]) {
                return
              }
              if (!paths[2].startsWith("did:")) {
                // TODO: ハンドルの場合は DID を取得すること
                return
              }
              return `/home/list-feeds?list=at://${paths[2]}/app.bsky.graph.list/${paths[4]}`
            }

            // フォロイー一覧ページ
            case "follows": {
              return `/profile/following?account=${paths[2]}`
            }

            // フォロワー一覧ページ
            case "followers": {
              return `/profile/follower?account=${paths[2]}`
            }

            // ポストスレッドページ
            case "post": {
              if (!paths[4]) {
                return
              }
              return `/post?handle=${paths[2]}&rkey=${paths[4]}`
            }
          }
          break
        }

        // 検索関連
        case "search": {
          const q = url.searchParams.get("q")
          if (!q) {
            return
          }
          return `/search/post?text=${q}`
        }

        // スターターパック
        case "starter-pack": {
          if (!paths[2] || !paths[3]) {
            return
          }
          return `/home/starter-pack?uri=at://${paths[2]}/app.bsky.graph.starterpack/${paths[3]}`
        }
      }
      break
    }
  }
}

async function openWindowIfCan (segment: RichParam) {
  const urlObject: undefined | URL = Util.safeUrl(segment.param ?? "")
  if (urlObject == null) return
  const valid = validateUrl(urlObject, segment.text)
  if (valid || await mainState.openConfirmationPopup({
    title: $t("confirmUrl"),
    text: $t("confirmUrlNotification"),
    detail: segment.param,
  })) {
    if (segment.param.startsWith("lightning:"))
      location.href = segment.param
    else
      window.open(segment.param, "_blank")
  }
}

function validateUrl (urlObject: URL, text: string): boolean {
  // 末尾のスラッシュを削除して照合
  const pathname = urlObject.pathname.replace(/\/$/, "")

  return (
    urlObject.origin !== "null" &&
    urlObject.host !== "" &&
    (
      text.startsWith(urlObject.origin + pathname) ||
      text.startsWith(urlObject.host + pathname)
    )
  )
}
</script>

<template>
  <div class="html-text">
    <template v-for="segment of state.segments">
      <!-- 外部リンク -->
      <template v-if="segment.type === 'externalLink'">
        <a
          class="textlink external-link"
          @click.prevent.stop="openWindowIfCan(segment)"
        >
          <span>{{ segment.text }}</span>
        </a>
      </template>

      <!-- 内部リンク -->
      <template v-else-if="segment.type === 'internalLink'">
        <RouterLink
          class="textlink internal-link"
          :to="segment.param"
          @click.stop
        >
          <span>{{ segment.text }}</span>
        </RouterLink>
      </template>

      <!-- メンション -->
      <template v-else-if="segment.type === 'mention'">
        <RouterLink
          class="textlink mention"
          :to="`/profile/feeds?account=${segment.param}`"
          @click.stop="$emit('onActivateMention')"
        >
          <span>{{ segment.text }}</span>
        </RouterLink>
      </template>

      <!-- ハッシュタグ -->
      <template v-else-if="segment.type === 'tag'">
        <RouterLink
          class="textlink hash-tag"
          :to="`/search/post?text=%23${segment.param}`"
          @click.stop="emit('onActivateHashTag', segment.param)"
        >
          <span>{{ segment.text }}</span>
        </RouterLink>
      </template>

      <!-- テキスト -->
      <template v-else>{{ segment.text }}</template>
    </template>

    <!-- 翻訳リンク -->
    <template v-if="hasTranslateLink">
      &nbsp;<a
        v-if="hasTranslateLink"
        class="textlink translate-link"
        @click.prevent.stop="$emit('translate')"
      >
        <span>{{ $t("translate") }}</span>
      </a>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.external-link,
.internal-link {
  word-break: break-all;
}

.translate-link {
  font-size: min(0.875em, 0.875rem);
  padding: 0.125em 0.25em;
  & > span {
    --opacity: 0.5;
    color: rgb(var(--fg-color), var(--opacity));
  }
  &:focus, &:hover {
    & > span {
      --opacity: 1.0;
    }
  }
}
</style>
