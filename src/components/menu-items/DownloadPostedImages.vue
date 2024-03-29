<script lang="ts" setup>
import { inject } from "vue"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import SVGIcon from "@/components/common/SVGIcon.vue"
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
  if (!await mainState.openConfirmationPopup(
      $t("confirmation"),
      $t("donwloadPostedImagesOnConfirmation")
  )) {
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

  // 画像 blob の取得
  const blobs: Blob[] = []
  const urls = refs.map((ref: string) => {
    return `https://cdn.bsky.app/img/feed_thumbnail/plain/${props.user.did}/${ref}@jpeg`
  })
  mainState.loaderDisplay = true
  for (let i = 0; i < urls.length; i ++) {
    const url = urls[i]
    const response =
      await fetch(`https://mimonelu.net:4649/${url}`, {
        headers: { "user-agent": "Klearsky" },
      })
        .then((response: any) => response)
        .catch((error: any) => error)
    if (response instanceof Error || !response.ok) {
      numberOfFailed ++
      continue
    }
    const blob = await response.blob()
    blobs.push(blob)
    numberOfSucceed ++
  }
  mainState.loaderDisplay = false

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
  blobs.forEach((blob, index) => {
    zip.file(`${index + 1}.jpg`, blob)
  })
  const zipBlob = await zip.generateAsync({ type: "blob" })
  const zipName = `bluesky-medias-${props.user.handle}.zip`
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
