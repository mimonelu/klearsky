<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import HLS from "hls.js"
import Util from "@/composables/util"

const emit = defineEmits<{(name: string, params?: any): void}>()

const mainState = inject("state") as MainState

const props = defineProps<{
  playlist?: string
  did?: string
  cid?: string
  poster?: string
  preload?: string
}>()

const video = ref()

onMounted(async () => {
  if (video.value == null) {
    return
  }

  // SEE: https://www.npmjs.com/package/hls.js
  const hls = new HLS()

  // playlist の存在フラグ
  let isPlaylistExisting: undefined | boolean

  // HLS をサポートする環境
  if (props.playlist != null &&
      HLS.isSupported()
  ) {
    isPlaylistExisting = await isUriExisting(props.playlist)
    if (isPlaylistExisting) {
      if (video.value != null) {
        hls.loadSource(props.playlist)
        hls.attachMedia(video.value)
      }
      emit("updateVideoType", "hls")
      return
    }
  }

  // HLS をサポートしない環境
  if (props.playlist != null &&
      isPlaylistExisting !== false &&
      video.value.canPlayType("application/vnd.apple.mpegurl")
  ) {
    if (isPlaylistExisting == null) {
      isPlaylistExisting = await isUriExisting(props.playlist)
    }
    if (isPlaylistExisting) {
      if (video.value != null) {
        video.value.src = props.playlist
        video.value.load()
      }
      emit("updateVideoType", "browser")
      return
    }
  }

  // playlist が存在しない
  if (props.did != null && props.cid != null) {
    const logJson = await mainState.atp.fetchLogAudit(props.did)
    if (!(logJson instanceof Error) && logJson != null) {
      const host = Array.isArray(logJson)
        // did:plc:
        ? logJson[0]?.operation?.services?.atproto_pds?.endpoint

        // did:plc: 以外
        : logJson?.didDocument?.service?.[0]?.serviceEndpoint
      if (video.value != null) {
        video.value.src = `${host}/xrpc/com.atproto.sync.getBlob?did=${props.did}&cid=${props.cid}`
        // video.value.load()
      }
      emit("updateVideoType", "blob")
      return
    }
  }

  emit("updateVideoType", "none")
})

async function isUriExisting (url: string): Promise<boolean> {
  const response = await Util.fetchWithTimeout(url, {
    method: "GET",
    headers: { range: "bytes=0-0" },
  })
    .then((value) => value)
    .catch((error) => error)
  if (response instanceof Error) {
    return false
  }
  return response.ok
}

function pause () {
  if (video.value == null) {
    return
  }
  ;(video.value as HTMLVideoElement).pause()
}
</script>

<template>
  <!-- 交差オブザーバーで画面外への移動を検出したら一時停止する -->
  <video
    v-intersection-observer="{ outboundHandler: pause }"
    class="video-player"
    ref="video"
    controls
    loading="lazy"
    loop
    :poster="poster"
    :preload="preload ?? 'metadata'"
    width="100%"
  />
</template>
