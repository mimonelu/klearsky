<script lang="ts" setup>
import { inject } from "vue"
import { saveAs } from "file-saver"

// 本番ビルド時に不明なエラーが発生するためビルド済みファイルを使用
import JSZip from "jszip"

import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const props = defineProps<{
  user: TTUser
}>()

async function donwloadPostedImages () {
  Util.blurElement()
  emit("close")

  // 確認
  if (!await mainState.openConfirmationPopup({
    title: $t("confirmation"),
    text: $t("donwloadPostedImagesOnConfirmation"),
  })) {
    return
  }

  // 画像 ref の取得
  mainState.loaderDisplay = true
  const refs = await mainState.atp.fetchPostedImageRefs(props.user.did)
  mainState.loaderDisplay = false
  if (refs instanceof Error) {
    return
  }

  // 成功数・失敗数
  let numberOfSucceed = 0
  let numberOfFailed = 0

  // 進捗ポップアップを開く
  mainState.openProgressPopup(0, $t("donwloadPostedImagesOnProgress"))

  // 画像 blob の取得
  const blobs: Blob[] = []
  const urls = refs.map((ref: string) => {
    return `https://cdn.bsky.app/img/feed_thumbnail/plain/${props.user.did}/${ref}@jpeg`
  })
  for (let i = 0; i < urls.length; i ++) {
    const url = urls[i]
    const response: Error | Response =
      await Util.fetchWithTimeout(`https://mimonelu.net:4649/${url}`, {
        headers: { "user-agent": "Klearsky" },
      })
        .then((value) => value)
        .catch((error) => error)

    // 進捗ポップアップのインクリメント
    mainState.progressPopupProps.value = (i / urls.length) * 100

    if (response instanceof Error || !response.ok) {
      numberOfFailed ++
      continue
    }
    const blob = await response.blob()
    blobs.push(blob)
    numberOfSucceed ++
  }

  // 進捗ポップアップを閉じる
  mainState.closeProgressPopup()

  // 画像がない場合
  if (blobs.length === 0) {
    mainState.openMessagePopup({
      title: $t("donwloadPostedImages"),
      text: $t("donwloadPostedImagesOnCancel"),
    })
    return
  }

  // .zip ファイルの作成
  const zip = new JSZip()
  const userName = props.user.handle === "handle.invalid"
    ? props.user.did
    : props.user.handle
  blobs.forEach((blob, index) => {
    zip.file(`${userName}-${("000" + (index + 1)).slice(- 3)}.jpg`, blob)
  })
  const zipBlob = await zip.generateAsync({ type: "blob" })
  const zipName = `bluesky-images-${userName}.zip`
  saveAs(zipBlob, zipName)

  // 完了
  mainState.openMessagePopup({
    title: $t("donwloadPostedImages"),
    text: $t("donwloadPostedImagesOnComplete") + `\n\nSucceed: ${numberOfSucceed}\nFailed: ${numberOfFailed}`,
  })
}
</script>

<template>
  <button @click.prevent.stop="donwloadPostedImages">
    <SVGIcon name="image" />
    <span>{{ $t("donwloadPostedImages") }}</span>
  </button>
</template>
