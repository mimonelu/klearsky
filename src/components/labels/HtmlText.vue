<script lang="ts" setup>
import { computed, inject } from "vue"
import { useRouter } from "vue-router"
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

const richTextSegments = computed(() => {
  if (props.richText != null) {
    return props.richText.segments()
  }
  const rt = new RichText(
    {
      text: props.text ?? "",
      facets: props.facets,
    }, {
      cleanNewlines: true,
    }
  )
  if (props.facets == null) {
    rt.detectFacetsWithoutResolution()
  }
  return rt.segments()
})

const segments = computed((): Array<RichParam> => {
  const results: Array<RichParam> = []
  for (const segment of richTextSegments.value) {
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
})

const router = useRouter()

function transformInternalLink (uri: string): undefined | string {
  return Util.officialUrl.parseToInternalPath(uri)
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

async function openInternalLink (uri: string) {
  // uri にハンドルが含まれる場合は DID を取得して置換
  const handle = uri.match(/\{\{(.+?)\}\}/)?.[1]
  if (handle != null) {
    mainState.loaderDisplay = true
    const did = await mainState.atp.fetchDid(handle)
    mainState.loaderDisplay = false
    if (did instanceof Error) {
      mainState.openErrorPopup(did, "HtmlText/openInternalLink")
      return
    }
    uri = uri.replace(/\{\{.+?\}\}/, did)
  }

  router.push(uri)
}

function validateUrl (urlObject: URL, text: string): boolean {
  return (
    urlObject.origin !== "null" &&
    urlObject.host !== "" &&
    (
      text.startsWith(urlObject.origin) ||
      text.startsWith(urlObject.host)
    )
  )
}
</script>

<template>
  <div class="html-text">
    <template v-for="segment, segmentIndex of segments">
      <!-- 外部リンク -->
      <a
        v-if="segment.type === 'externalLink'"
        :key="`externalLink-${segmentIndex}`"
        class="textlink external-link"
        @click.prevent.stop="openWindowIfCan(segment)"
      >
        <span>{{ segment.text }}</span>
      </a>

      <!-- 内部リンク -->
      <a
        v-else-if="segment.type === 'internalLink'"
        :key="`internalLink-${segmentIndex}`"
        class="textlink internal-link"
        :href="segment.param"
        @click.prevent.stop="openInternalLink(segment.param)"
      >
        <span>{{ segment.text }}</span>
      </a>

      <!-- メンション -->
      <RouterLink
        v-else-if="segment.type === 'mention'"
        :key="`mention-${segmentIndex}`"
        class="textlink mention"
        :to="`/profile/feeds?account=${segment.param}`"
        @click.stop="$emit('onActivateMention')"
      >
        <span>{{ segment.text }}</span>
      </RouterLink>

      <!-- ハッシュタグ -->
      <RouterLink
        v-else-if="segment.type === 'tag'"
        :key="`tag-${segmentIndex}`"
        class="textlink hash-tag"
        :to="`/search/post?text=%23${segment.param}`"
        @click.stop="emit('onActivateHashTag', segment.param)"
      >
        <span>{{ segment.text }}</span>
      </RouterLink>

      <!-- テキスト -->
      <template v-else>{{ segment.text }}</template>
    </template>

    <!-- 翻訳リンク -->
    <template v-if="hasTranslateLink">&nbsp;<a
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
