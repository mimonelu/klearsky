<script lang="ts" setup>
import type { AppBskyFeedPost } from "@atproto/api"
import { RichText } from "@atproto/api"
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { useEditPost } from "@/components/next/EditPost/useEditPost"
import Util from "@/composables/util"
import Consts from "@/consts/consts.json"

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
    // TODO: エラーメッセージ
    return
  }

  // ポスト編集が許可されている状態かチェック
  if (!canEditPost()) {
    // TODO: エラーメッセージ
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
    // TODO: エラーメッセージ
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
      // TODO: エラーメッセージ
      return
    }
  }

  // 旧ポストの削除
  const deletePostResponse = await mainState.atp.deletePost(post.uri)
  if (deletePostResponse instanceof Error) {
    state.loaderDisplay = false
    // TODO: エラーメッセージ
    return
  }

  // 新ポストの作成
  const record: AppBskyFeedPost.Record = {
    ...post.record as AppBskyFeedPost.Record,
    createdAt: new Date(post.record.createdAt).toISOString(),
    text,

    // 編集済みカスタムフィールドの追加
    [Consts.THIRD_PARTY_DOMAIN_POST_UPDATEDAT]: new Date().toISOString(),
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
    // TODO: エラーメッセージ
    return
  }

  // ダミーポストの削除
  if (createDummyPostResponse != null) {
    const deleteDummyPostResponse = await mainState.atp.deletePost(createDummyPostResponse.uri)
    if (deleteDummyPostResponse instanceof Error) {
      state.loaderDisplay = false
      // TODO: エラーメッセージ
      return
    }
  }

  state.loaderDisplay = false
  close()
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
</style>
