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

// HLS をサポートしない環境と、playlist が存在しない場合の動画の URL
let mediaUrl: undefined | string

// 再生器には画面内にある間だけつなぐ
// 動画要素は再生器につなぐとデータの読み込み前でも 1 本あたり数 MB を使うため、画面外の動画は外す
let isInView = false
let isAttached = false
let isLoadStarted = false

// 再生器から外した時の再生位置。つなぎ直した時にここから再開する
let resumeTime = 0

onMounted(async () => {
  if (video.value == null) {
    return
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
        hls = createHls()
        hls.loadSource(props.playlist)
        prepare()
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
      mediaUrl = props.playlist
      prepare()
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
      mediaUrl = `${host}/xrpc/com.atproto.sync.getBlob?did=${props.did}&cid=${props.cid}`
      prepare()
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
    video.value.removeAttribute("src")
    video.value.load()
  }
})

function createHls (): HLS {
  // SEE: https://www.npmjs.com/package/hls.js
  // 自動読み込みは再生器につないだ時点でセグメントをバッファリングするため無効化し、画面内に入った時に読み込む
  // 再生前のバッファリングは先頭のセグメント程度に抑える
  // バッファ長の上限はビットレートと `maxBufferSize` からも算出されるため、`maxMaxBufferLength` でも制限する
  // CEA-608 字幕のパーサーはセグメントの読み込み時に数万個のオブジェクトを確保する。Bluesky の字幕は WebVTT のため無効化する
  // 再生済みのバッファは既定では無制限に残るため、長い動画をループ再生すると全体が残る
  // 3 分以下の動画はループ時に読み直さないよう、3 分を超えた分だけ破棄する
  const instance = new HLS({
    autoStartLoad: false,
    maxBufferLength: 1,
    maxMaxBufferLength: 1,
    backBufferLength: 180,
    enableCEA708Captions: false,
  })

  // 画質優先の場合、再生開始時は最高画質を選択させる
  // デフォルトでは初期帯域推定値に基づくため、最初のセグメントが低画質で読み込まれてしまう
  // 以降は ABR により回線状況に応じて画質が切り替わる
  if (props.quality !== "auto") {
    instance.on(HLS.Events.MANIFEST_PARSED, (_, data) => {
      instance.startLevel = data.levels.length - 1
    })
  }

  return instance
}

// 再生方法が決まった時点で画面内にあれば、すぐに再生器につなぐ
function prepare () {
  if (isInView) {
    attach()
  }
}

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

function attach () {
  const element = video.value as undefined | HTMLVideoElement
  if (element == null || isAttached) {
    return
  }
  if (hls != null) {
    hls.attachMedia(element)
  } else if (mediaUrl != null) {
    element.src = mediaUrl

    // メタデータの読み込み前に代入した値は再生開始位置になる
    if (resumeTime > 0) {
      element.currentTime = resumeTime
    }
  } else {
    return
  }
  isAttached = true
  startLoad()
}

function detach () {
  const element = video.value as undefined | HTMLVideoElement
  if (element == null || !isAttached) {
    return
  }

  // フルスクリーンとピクチャーインピクチャーの間は外さない
  if (document.fullscreenElement === element ||
      document.pictureInPictureElement === element
  ) {
    return
  }

  // メタデータの読み込み前は `currentTime` が再生位置を表さないため、前回の値を残す
  if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
    resumeTime = element.currentTime
  }

  // `detachMedia()` は動画要素の `src` を外して `load()` を呼ぶため、再生器が解放される
  if (hls != null) {
    hls.stopLoad()
    hls.detachMedia()
  } else {
    element.removeAttribute("src")
    element.load()
  }
  isAttached = false
  isLoadStarted = false
}

function startLoad () {
  if (hls == null || !isInView || !isAttached || isLoadStarted) {
    return
  }
  isLoadStarted = true
  hls.startLoad(resumeTime > 0 ? resumeTime : -1)
}

function onInbound () {
  isInView = true
  attach()
}

function onOutbound () {
  isInView = false
  pause()
  detach()
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
  <!-- 交差オブザーバーで画面内に入ったら再生器につないで読み込みを開始し、画面外への移動を検出したら一時停止して再生器から外す -->
  <video
    v-intersection-observer="{ inboundHandler: onInbound, outboundHandler: onOutbound }"
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
