<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, ref } from "vue"
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
  quality?: string
}>()

const video = ref()
let hls: HLS | null = null

// `loadSource()` は内部で `stopLoad()` を呼ぶため、それより前に画面内に入った場合は読み込み開始を保留する
let isSourceLoaded = false
let isLoadRequested = false
let isLoadStarted = false

onMounted(async () => {
  if (video.value == null) {
    return
  }

  // SEE: https://www.npmjs.com/package/hls.js
  // 自動読み込みはマウント時から全動画のセグメントをバッファリングするため無効化し、画面内に入った時に読み込む
  // 再生前のバッファリングは先頭のセグメント程度に抑える
  // バッファ長の上限はビットレートと `maxBufferSize` からも算出されるため、`maxMaxBufferLength` でも制限する
  hls = new HLS({
    autoStartLoad: false,
    maxBufferLength: 1,
    maxMaxBufferLength: 1,
  })

  // 画質優先の場合、再生開始時は最高画質を選択させる
  // デフォルトでは初期帯域推定値に基づくため、最初のセグメントが低画質で読み込まれてしまう
  // 以降は ABR により回線状況に応じて画質が切り替わる
  if (props.quality !== "auto") {
    hls.on(HLS.Events.MANIFEST_PARSED, (_, data) => {
      if (hls != null) {
        hls.startLevel = data.levels.length - 1
      }
    })
  }

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
        isSourceLoaded = true
        if (isLoadRequested) {
          startLoad()
        }
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

onBeforeUnmount(() => {
  // HLS インスタンスの解放
  if (hls) {
    hls.destroy()
    hls = null
  }

  // video 要素のリソース解放
  if (video.value) {
    video.value.pause()
    video.value.src = ""
    video.value.load()
  }
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

function startLoad () {
  isLoadRequested = true
  if (hls == null || !isSourceLoaded || isLoadStarted) {
    return
  }
  isLoadStarted = true
  hls.startLoad()
}

// 初回の再生開始後は通常のバッファリングに戻す
// 以降は hls.js がバッファ超過時に `maxMaxBufferLength` を縮めるため、再設定しない
function onPlay () {
  if (hls == null) {
    return
  }
  hls.config.maxBufferLength = HLS.DefaultConfig.maxBufferLength
  hls.config.maxMaxBufferLength = HLS.DefaultConfig.maxMaxBufferLength
  startLoad()
}

function pause () {
  if (video.value == null) {
    return
  }
  (video.value as HTMLVideoElement).pause()
}
</script>

<template>
  <!-- 交差オブザーバーで画面内に入ったら読み込みを開始し、画面外への移動を検出したら一時停止する -->
  <video
    v-intersection-observer="{ inboundHandler: startLoad, outboundHandler: pause }"
    class="video-player"
    ref="video"
    controls
    loop
    :poster="poster"
    :preload="preload ?? 'metadata'"
    width="100%"
    @play.once="onPlay"
  />
</template>
