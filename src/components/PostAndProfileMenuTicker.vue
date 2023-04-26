<script lang="ts" setup>
import { inject } from "vue"
import { AtUri } from "@atproto/uri"
import MenuTicker from "@/components/MenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"
import otherApps from "@/consts/other-apps.json"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  type: "post" | "profile";
  handle?: string;
  uri?: string;
  display: boolean;
  translateText?: string;
  copyText?: string;
  mentionTo?: string;
  deletePostUri?: string;
  openSource?: any;
}>()

const mainState = inject("state") as MainState

async function copyText () {
  Util.blurElement()
  if (props.copyText == null) return
  emit("close")
  await navigator.clipboard.writeText(props.copyText)
}

function translateText () {
  Util.blurElement()
  if (props.translateText == null) return
  emit("close")
  const language = window.navigator.language
  window.open(`https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(props.translateText)}&op=translate`)
}

async function sendMention () {
  Util.blurElement()
  emit("close")
  if (props.mentionTo == null) return
  await mainState.openSendPostPopup("post", undefined, `@${props.mentionTo} `)
}

async function deletePost () {
  Util.blurElement()
  if (props.deletePostUri == null) return
  emit("removeThisPost", props.deletePostUri)
}

function openOtherApp (app: any) {
  let uri = ""
  if (props.type === "profile") {
    uri = app.profileUri.replace("{handle}", props.handle)
  } else if (props.type === "post") {
    const aturi = new AtUri(props.uri as string)
    uri = app.postUri
      .replace("{handle}", props.handle)
      .replace("{rkey}", aturi.rkey)
  }
  window.open(uri)
  emit("close")
}

function openSource () {
  if (props.openSource == null) return
  Util.displayJson(props.openSource)
  emit("close")
}
</script>

<template>
  <MenuTicker :display="display">
    <slot name="before" />

    <!-- テキストをコピーする -->
    <button
      v-if="copyText != null"
      @click.stop="copyText"
    >
      <SVGIcon name="clipboard" />
      <span>{{ $t("copyPostText") }}</span>
    </button>

    <!-- 翻訳する -->
    <button
      v-if="translateText != null"
      @click.stop="translateText"
    >
      <SVGIcon name="translate" />
      <span>{{ $t("translate") }}</span>
    </button>

    <!-- メンションを送る -->
    <button
      v-if="mentionTo != null"
      @click.stop="sendMention"
    >
      <SVGIcon name="at" />
      <span>{{ $t("sendMention") }}</span>
    </button>

    <!-- ポストの削除 -->
    <button
      v-if="deletePostUri != null"
      @click.stop="deletePost"
    >
      <SVGIcon name="remove" />
      <span>{{ $t("deletePost") }}</span>
    </button>

    <!-- 他のアプリで開く -->
    <button
      class="other-app-button"
      @click.stop
    >
      <SVGIcon name="cursorLeft" />
      <span>{{ $t("openOtherApp") }}</span>

      <!-- 他のアプリで開くメニュー -->
      <MenuTicker
        :display="true"
        class="other-app-menu"
      >
        <button
          v-for="app of otherApps"
          :key="app.name"
          @click.stop="openOtherApp(app)"
        >
          <SVGIcon name="shimmer" />
          <span>{{ $t(app.name) }}</span>
        </button>
      </MenuTicker>
    </button>

    <hr />

    <!-- ソースを表示する -->
    <button
      v-if="openSource != null"
      @click.stop="openSource"
    >
      <SVGIcon name="json" />
      <span>{{ $t("showSource") }}</span>
    </button>
    <slot name="after" />
  </MenuTicker>
</template>

<style lang="scss" scoped>
.other-app-button {
  .other-app-menu {
    display: none;

    &:deep() {
      .menu-ticker--overlay {
        display: none;
      }

      .menu-ticker--inner {
        right: calc(100% - 2rem) !important; // TODO:
      }
    }
  }
  &:hover .other-app-menu {
    display: contents;
  }
}
</style>
