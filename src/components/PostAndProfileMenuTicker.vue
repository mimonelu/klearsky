<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import displayJson from "@/composables/display-json"
import { blurElement } from "@/composables/misc"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  display: boolean;
  translateText?: string;
  copyText?: string;
  mentionTo?: string;
  deletePostUri?: string;
  openSource?: any;
}>()

const mainState = inject("state") as MainState

function translateText () {
  if (props.translateText == null) return
  const language = window.navigator.language
  window.open(`https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(props.translateText)}&op=translate`)
  emit("close")
}

async function copyText () {
  if (props.copyText == null) return
  await navigator.clipboard.writeText(props.copyText)
  emit("close")
}

async function sendMention () {
  blurElement()
  if (props.mentionTo == null) return
  await mainState.openSendPostPopup("post", undefined, `@${props.mentionTo} `)
  emit("close")
}

async function deletePost () {
  blurElement()
  if (props.deletePostUri == null) return
  mainState.processing = true
  try {
    await mainState.atp.deletePost(props.deletePostUri)
    emit("removeThisPost", props.deletePostUri)
  } finally {
    mainState.processing = false
    emit("close")
  }
}

function openSource () {
  if (props.openSource == null) return
  displayJson(props.openSource)
  emit("close")
}
</script>

<template>
  <MenuTicker :display="display">
    <button
      v-if="translateText != null"
      @click.stop="translateText"
    >
      <SVGIcon name="translate" />
      <span>{{ $t("translate") }}</span>
    </button>
    <button
      v-if="copyText != null"
      @click.stop="copyText"
    >
      <SVGIcon name="clipboard" />
      <span>{{ $t("copyPostText") }}</span>
    </button>
    <button
      v-if="mentionTo != null"
      @click.stop="sendMention"
    >
      <SVGIcon name="at" />
      <span>{{ $t("sendMention") }}</span>
    </button>
    <button
      v-if="deletePostUri != null"
      @click.stop="deletePost"
    >
      <SVGIcon name="remove" />
      <span>{{ $t("deletePost") }}</span>
    </button>
    <button
      v-if="openSource != null"
      @click.stop="openSource"
    >
      <SVGIcon name="json" />
      <span>{{ $t("showSource") }}</span>
    </button>
  </MenuTicker>
</template>
