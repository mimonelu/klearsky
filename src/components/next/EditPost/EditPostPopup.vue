<script lang="ts" setup>
import type { AppBskyFeedPost } from "@atproto/api"
import { RichText } from "@atproto/api"
import { computed, inject, onBeforeUnmount, reactive, ref } from "vue"
import { differenceInSeconds } from "date-fns"
import EasyForm from "@/components/forms/EasyForm.vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { useEditPost } from "@/components/next/EditPost/useEditPost"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
}>({
  loaderDisplay: false,
})

const easyFormState = reactive<{
  text: string
}>({
  text: mainState.editPostPopupProps.post?.record.text ?? "",
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state: easyFormState,
      model: "text",
      type: "textarea",
      required: true,
      rows: 10,
      maxlength: 300,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      autoResizeTextarea: true,
    },
  ],
}

const { canEditPost } = useEditPost(
  mainState.editPostPopupProps.post,
  mainState.atp.session?.did
)

const timeRemainingNow = ref(new Date())

const timeRemaining = computed((): string => {
  const post = mainState.editPostPopupProps.post
  if (post == null) {
    return "00:00"
  }
  const dateA = new Date(post.record.createdAt)
  dateA.setMinutes(dateA.getMinutes() + CONSTS.EDIT_POST_TIME_LIMIT_MINUTES)
  const remainingSeconds = differenceInSeconds(dateA, timeRemainingNow.value)
  if (remainingSeconds <= 0) {
    return "00:00"
  }
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
})

const timeRemainingIntervalId = setInterval(() => {
  timeRemainingNow.value = new Date()
}, 1000)

onBeforeUnmount(() => {
  clearInterval(timeRemainingIntervalId)
})

function close () {
  emit("close")
}

async function submitCallback () {
  Util.blurElement()

  // 必須プロパティの存在チェック
  if (
    mainState.editPostPopupProps.post == null ||
    mainState.atp.agent == null ||
    mainState.atp.session?.did == null
  ) {
    mainState.openErrorPopup("Required property is missing.", "EditPostPopup/submitCallback")
    return
  }

  // ポスト編集が許可されている状態かチェック
  if (!canEditPost()) {
    mainState.openErrorPopup("Post editing is not allowed.", "EditPostPopup/submitCallback")
    return
  }

  state.loaderDisplay = true

  // オリジナルポストの取得
  const originalPostsResponse = await mainState.atp.fetchPosts(
    [mainState.editPostPopupProps.post.uri],
    true
  )
  if (
    originalPostsResponse instanceof Error ||
    originalPostsResponse[0] == null
  ) {
    state.loaderDisplay = false
    mainState.openErrorPopup(originalPostsResponse, "EditPostPopup/submitCallback")
    return
  }
  const post = originalPostsResponse[0]

  // 新テキスト
  let text = easyFormState.text

  // テキスト編集 - カスタムリンクの作成
  const customLinks = Util.makeCustomLinks(text)
  text = customLinks.text

  // facets
  const richText = new RichText({ text })
  await richText.detectFacets(mainState.atp.agent)
  if (richText.facets != null) {
    richText.facets.push(...customLinks.facets)
  } else {
    richText.facets = customLinks.facets
  }

  // facets - URL文字列の省略表記
  // TODO: カスタムリンクと共存できるようにすること
  // Util.shortenLinks(richText)

  text = richText.text

  // facets - 既存 facets とのマージが困難であるため、ポスト編集時は facets を上書きする
  // これにより少なくともZapリンクとリストメンションは無効化されるが許容するものとする
  post.record.facets = richText.facets

  // ダミーポストの作成
  // 添付ファイルの参照カウントを 0 にして blob が削除されないようにする施策
  let createDummyPostResponse: undefined | Error | TTCidUri = undefined
  if (post.record.embed != null) {
    const dummyPostRecord: AppBskyFeedPost.Record = {
      $type: "app.bsky.feed.post",
      text: "",

      // TLに表示され得ない過去の日時に指定
      createdAt: new Date("1000-01-01T00:00:00Z").toISOString(),

      embed: post.record.embed,
    }
    createDummyPostResponse =
      await mainState.atp.agent.app.bsky.feed.post.create(
        { repo: mainState.atp.session.did },
        dummyPostRecord
      )
        .then((value) => value)
        .catch((error) => error)
    if (createDummyPostResponse instanceof Error) {
      state.loaderDisplay = false
      mainState.openErrorPopup(createDummyPostResponse, "EditPostPopup/submitCallback")
      return
    }
  }

  // 旧ポストの削除
  const deletePostResponse = await mainState.atp.deletePost(post.uri)
  if (deletePostResponse instanceof Error) {
    state.loaderDisplay = false
    mainState.openErrorPopup(deletePostResponse, "EditPostPopup/submitCallback")
    return
  }

  // 新ポストの作成
  const record: AppBskyFeedPost.Record = {
    ...post.record as AppBskyFeedPost.Record,
    createdAt: new Date(post.record.createdAt).toISOString(),
    text,

    // 編集済みカスタムフィールドの追加
    [CONSTS.THIRD_PARTY_DOMAIN_POST_UPDATEDAT]: new Date().toISOString(),
  }
  const createPostResponse: Error | TTCidUri =
    await mainState.atp.agent.app.bsky.feed.post.create(
      {
        repo: mainState.atp.session.did,

        // 旧ポストと同じ rkey を指定すること
        rkey: Util.getRkey(post.uri),
      },
      record
    )
      .then((value) => value)
      .catch((error) => error)
  if (createPostResponse instanceof Error) {
    state.loaderDisplay = false
    mainState.openErrorPopup(createPostResponse, "EditPostPopup/submitCallback")
    return
  }

  // ダミーポストの削除
  if (createDummyPostResponse != null) {
    const deleteDummyPostResponse = await mainState.atp.deletePost(createDummyPostResponse.uri)
    if (deleteDummyPostResponse instanceof Error) {
      state.loaderDisplay = false
      mainState.openErrorPopup(deleteDummyPostResponse, "EditPostPopup/submitCallback")
      return
    }
  }

  state.loaderDisplay = false
  close()
  mainState.postPopoverCallback?.("updatePost")
}
</script>

<template>
  <Popup
    :hasCloseButton="true"
    class="edit-post-popup"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="edit" />
        <span>{{ $t("editPost") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- メッセージ -->
      <ul class="bullet-points">
        <li>{{ $t("editPostDescription1") }}: {{ timeRemaining }}</li>
        <li>{{ $t("editPostDescription2") }}</li>
        <li>{{ $t("editPostDescription3") }}</li>
      </ul>

      <!-- フォーム -->
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      />

      <!-- ローダー -->
      <Loader v-if="state.loaderDisplay" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.edit-post-popup:deep() {
  textarea {
    border-top-color: transparent;
    border-bottom-color: transparent;
    border-left-style: none;
    border-right-style: none;
    border-radius: 0;
    margin: 0 -1.5rem;
  }
}

.bullet-points {
  --fg-color: var(--notice-color);
  color: rgb(var(--notice-color));
  font-size: 0.875rem;
}
</style>
