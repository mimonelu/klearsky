<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post?: TTPost
}>()

const mainState = inject("state") as MainState

const $t = inject("$t") as Function

const state = reactive<{
  loaderDisplay: boolean
  customBookmarkTags: Array<string>
  addingCustomBookmarkTag?: string
  optionsOfCustomBookmarkTags: Array<TTOption>
}>({
  loaderDisplay: false,
  customBookmarkTags: ((): Array<string> => {
    const tags: Array<string> = []

    // 対象ポストのカスタムブックマークパックを取得
    const pack = mainState.currentCustomBookmarkPacks.find((pack) => {
      return pack.bookmark.uri === props.post?.uri
    })

    // 対象ポストのカスタムブックマークタグを選択肢に追加
    if (pack?.bookmark.tags != null) {
      tags.push(...pack?.bookmark.tags)
    }

    return tags
  })(),
  addingCustomBookmarkTag: undefined,
  optionsOfCustomBookmarkTags: ((): Array<TTOption> => {
    const tags: Set<undefined | string> = new Set()
    mainState.currentCustomBookmarkPacks.forEach((pack) => {
      if (pack.bookmark.tags == null) {
        return
      }
      pack.bookmark.tags.forEach((tag) => {
        tags.add(tag)
      })
    })
    const options = [...tags]
      .map((tag) => {
        return {
          label: tag,
          value: tag,
        }
      }) as Array<TTOption>
    return options
  })(),
})

const easyFormProps1: TTEasyForm = {
  hasSubmitButton: false,
  submitCallback: addCustomBookmarkTag,
  data: [
    {
      state,
      model: "addingCustomBookmarkTag",
      type: "text",
      placeholder: $t("addingCustomBookmarkTag"),
    },
  ],
}

const easyFormProps2: TTEasyForm = {
  hasSubmitButton: false,
  submitCallback: submit,
  data: [
    {
      state,
      model: "customBookmarkTags",
      type: "checkbox",
      options: state.optionsOfCustomBookmarkTags,
    },
  ],
}

function close () {
  emit("close")
}

function addCustomBookmarkTag () {
  if (!state.addingCustomBookmarkTag) {
    return
  }
  if (state.optionsOfCustomBookmarkTags.some((option) => {
    return option.value === state.addingCustomBookmarkTag
  })) {
    return
  }
  state.customBookmarkTags.unshift(state.addingCustomBookmarkTag)
  state.optionsOfCustomBookmarkTags.unshift({
    label: state.addingCustomBookmarkTag,
    value: state.addingCustomBookmarkTag,
  })
  state.addingCustomBookmarkTag = undefined
}

async function submit () {
  if (state.loaderDisplay ||
      props.post == null
  ) {
    return
  }

  // カスタムブックマークの作成 or 更新
  state.loaderDisplay = true
  const response = await mainState.atp.updateCustomBookmarks(
    props.post.uri,
    props.post.cid,
    state.customBookmarkTags
  )
  state.loaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "CustomBookmarkManagementPopup/submit")
    return
  }

  // 既存のカスタムブックマークパックの取得
  const pack = mainState.currentCustomBookmarkPacks.find((pack) => {
    return pack.bookmark.uri === props.post?.uri
  })

  // カスタムブックマークパック配列に追加
  if (pack == null) {
    mainState.currentCustomBookmarkPacks.unshift({
      bookmark: {
        createdAt: new Date().toISOString(),
        uri: props.post.uri,
        cid: props.post.cid,
        tags: state.customBookmarkTags,
      },
      post: props.post,
    })
  }

  // 既存のカスタムブックマークパックを更新
  else {
    pack.bookmark.cid ??= props.post.cid
    pack.bookmark.tags?.splice(0, pack.bookmark.tags.length, ...state.customBookmarkTags)
  }

  // セッションキャッシュの設定
  mainState.myWorker!.setSessionCache("customBookmarkPacks", mainState.currentCustomBookmarkPacks)

  close()
}
</script>

<template>
  <Popup
    class="custom-bookmark-management-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="bookmark" />
        <span>{{ $t("customBookmarkManagementDetail") }}</span>
      </h2>
    </template>
    <template #header-after>
      <!-- 対象ポスト -->
      <Post
        v-if="post != null"
        position="preview"
        :post="post"
        :noLink="true"
        :forceHideQuoteRepost="true"
        @keydown.prevent.stop
        @keyup.prevent.stop
      />
    </template>
    <template #body>
      <EasyForm v-bind="easyFormProps1">
        <template #after>
          <button
            type="submit"
            class="button"
            @click.stop
          >
            <SVGIcon name="plus" />
          </button>
        </template>
      </EasyForm>
      <EasyForm v-bind="easyFormProps2" />
    </template>
    <template #footer>
      <!-- 適用ボタン -->
      <button
        type="button"
        class="button submit-button"
        @click.stop="submit"
      >
        <span>{{ $t("apply") }}</span>
      </button>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.custom-bookmark-management-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--post-color));
      }
    }

    .post {
      padding: 1rem;
      pointer-events: none;

      .html-text {
        @include line-clamp(3);
        white-space: wrap;
      }
    }

    .easy-form:first-child {
      display: grid;
      grid-gap: 0.5rem;
      grid-template-columns: 1fr auto;
    }
  }
}

.submit-button {
  margin: 1rem;
}
</style>
