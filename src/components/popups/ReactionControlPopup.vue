<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { LIMIT_OF_THREADGATE_ITEMS } from "@/consts/consts.json"
import DESIGN_CONSTS from "@/consts/design-consts.json"

const emit = defineEmits<{(
  event: string,
  params: TICloseReactionControlPopupProps
): void}>()

const props = defineProps<{
  display: boolean
  mode?: "send" | "post"
  isReply: boolean
  draftReactionControl?: TTDraftReactionControl
  postThreadgate?: TTThreadgate
  postUri?: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
  applied: ComputedRef<boolean>
  existingPostgate?: TIPostgate
  existingPostgateAllow: ComputedRef<boolean>
}>({
  loaderDisplay: false,
  applied: computed((): boolean => {
    return props.draftReactionControl != null
      ? (
        !props.draftReactionControl.postgateAllow ||
        props.draftReactionControl.threadgateAction !== "none"
      )
      : (
        !state.existingPostgateAllow ||
        props.postThreadgate != null
      )
  }),
  existingPostgate: undefined,
  existingPostgateAllow: computed((): boolean => {
    return state.existingPostgate?.embeddingRules?.find((rule) => {
      return rule.$type === "app.bsky.feed.postgate#disableRule"
    }) == null
  }),
})

const easyFormState = reactive<{
  postgateAllow: boolean
  postgateAllowOptions: Array<TTOption>
  threadgateAction: TTThreadgateAction
  threadgateActionOptions: Array<TTOption>
  threadgateAllows: Array<string>
  threadgateAllowOptions: Array<TTOption>
}>({
  postgateAllow: props.draftReactionControl?.postgateAllow ?? true,
  postgateAllowOptions: [
    { label: $t("postgateAllow"), value: true },
    { label: $t("postgateNotAllow"), value: false },
  ],
  threadgateAction: props.draftReactionControl?.threadgateAction ?? (props.postThreadgate != null ? "custom" : "none"),
  threadgateActionOptions: [
  {
      label: "threadgateNoAction",
      value: "none",
    },
    {
      label: "threadgateCustomAction",
      value: "custom",
    },
  ],
  threadgateAllows: (() => {
    // 送信ポスト用
    if (props.mode === "send") {
      const allows: Array<string> = []
      if (props.draftReactionControl?.allowMention) {
        allows.push("allowMention")
      }
      if (props.draftReactionControl?.allowFollowing) {
        allows.push("allowFollowing")
      }
      props.draftReactionControl?.listUris
        .forEach((listUri: string) => {
          allows.push(listUri)
        })
      return allows
    }

    // 既存ポスト用
    if (props.mode === "post") {
      return props.postThreadgate?.record?.allow
        ?.map((allow: TTThreadgateAllow) => {
          if (allow.$type.startsWith("app.bsky.feed.threadgate#mentionRule")) {
            return "allowMention"
          } else if (allow.$type.startsWith("app.bsky.feed.threadgate#followingRule")) {
            return "allowFollowing"
          } else if (allow.$type.startsWith("app.bsky.feed.threadgate#listRule")) {
            // TODO: `allow.list` は `string[]` と定義されているが、実際は `string` 。要調査
            return (allow.list as undefined | string) ?? ""
          }
          return ""
        }) ?? []
    }

    return []
  })(),
  threadgateAllowOptions: (() => {
    const results: Array<TTOption> = [
      { label: $t("threadgateAllowMention"), value: "allowMention" },
      { label: $t("threadgateAllowFollowing"), value: "allowFollowing" },
    ]

    // マイリストを選択肢に追加
    Array.from(mainState.myLists!.items)
      .sort((a: TTList, b: TTList): number => {
        const aTerm = a.name || a.indexedAt
        const bTerm = b.name || b.indexedAt
        return aTerm < bTerm ? - 1 : aTerm > bTerm ? 1 : 0
      })
      .forEach((myList: TTList) => {
        results.push({
          label: `${myList.name} (${myList.listItemCount ?? myList.items?.length ?? "-"})`,
          value: myList.uri,
          icon: DESIGN_CONSTS.LIST_PURPOSE_ICON_MAP[myList.purpose] ?? "help",
        })
      })

    return results
  })(),
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  data: [
    {
      state: easyFormState,
      model: "postgateAllow",
      type: "radio",
      options: easyFormState.postgateAllowOptions,
    },
    {
      state: easyFormState,
      model: "threadgateAction",
      display: !props.isReply,
      type: "radio",
      options: easyFormState.threadgateActionOptions,
      onUpdate () {
        // 許可リストの無効化処理
        easyFormProps.data[2].disabled = easyFormState.threadgateAction === "none"

        // 許可リストの初期化
        if (easyFormState.threadgateAction === "none") {
          easyFormState.threadgateAllows.splice(0)
        }

        if (easyForm.value != null) {
          easyForm.value.forceUpdate()
        }
      },
    },
    {
      state: easyFormState,
      model: "threadgateAllows",
      display: !props.isReply,
      type: "checkbox",
      options: easyFormState.threadgateAllowOptions,
      limit: LIMIT_OF_THREADGATE_ITEMS,
      disabled: props.draftReactionControl != null
        ? props.draftReactionControl.threadgateAction === "none"
        : props.postThreadgate == null,
    },
  ],
}

const easyForm = ref()

onMounted(async () => {
  await fetchPostgate()
})

function close (params: TICloseReactionControlPopupProps) {
  emit("close", params)
}

async function update () {
  Util.blurElement()
  const allowMention = easyFormState.threadgateAllows.includes("allowMention")
  const allowFollowing = easyFormState.threadgateAllows.includes("allowFollowing")

  // 許可リスト
  let listUris: undefined | Array<string> = easyFormState.threadgateAllows
    .filter((allow: string) => {
      return allow.startsWith("at://")
    })
  if (listUris.length === 0) {
    listUris = undefined
  }

  // ポスト送信ポップアップ上での対応はここまで
  if (props.mode === "send") {
    close({
      updated: true,
      postgateAllow: easyFormState.postgateAllow,
      threadgateAction: easyFormState.threadgateAction,
      allowMention,
      allowFollowing,
      listUris,
    })
    return
  }

  // ここからポストコンポーネント上での対応
  if (state.loaderDisplay || props.postUri == null) {
    return
  }
  state.loaderDisplay = true
  let updated = false

  // Postgate の更新
  if (state.existingPostgateAllow !== easyFormState.postgateAllow) {
    const responseOfPostgate = await mainState.atp.updatePostgate(
      props.postUri,
      easyFormState.postgateAllow,
      state.existingPostgate?.detachedEmbeddingUris
    )
    if (responseOfPostgate instanceof Error) {
      mainState.openErrorPopup(responseOfPostgate, "ReactionControlPopup/update")
      return
    }
    updated = true
  }

  // Threadgate の削除／設定済みの場合も削除
  if (!props.isReply && props.postThreadgate != null) {
    const responseOfDelete = await mainState.atp.deleteThreadgate(props.postUri)
    if (responseOfDelete instanceof Error) {
      state.loaderDisplay = false
      mainState.openErrorPopup(responseOfDelete, "ReactionControlPopup/update")
      return
    }
    updated = true
  }

  // Threadgate の更新
  if (!props.isReply && easyFormState.threadgateAction !== "none") {
    const responseOfUpdate = await mainState.atp.updateThreadgate(
      props.postUri,
      allowMention,
      allowFollowing,
      listUris
    )
    if (responseOfUpdate instanceof Error) {
      mainState.openErrorPopup(responseOfUpdate, "ReactionControlPopup/update")
      return
    }
    updated = true
  }

  state.loaderDisplay = false

  close({
    updated,
    postgateAllow: easyFormState.postgateAllow,
    threadgateAction: easyFormState.threadgateAction,
  })
}

// 既存ポストの Postgate の取得
async function fetchPostgate () {
  if (props.mode !== "post" || props.postUri == null) {
    return
  }
  state.loaderDisplay = true
  const response = await mainState.atp.fetchPostgate(props.postUri)
  state.loaderDisplay = false
  if (response instanceof Error) {
    // NOTICE: Postgate レコードが存在しない場合はエラーを表示しない
    // mainState.openErrorPopup(response, "ReactionControlPopup/onMounted")
    return
  }
  state.existingPostgate = response.value
  easyFormState.postgateAllow = state.existingPostgateAllow
}
</script>

<template>
  <Popup
    class="reaction-control-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="lock" />
        <span>{{ $t("reactionControl") }}</span>

        <!-- ON/OFFアイコン -->
        <span
          v-if="state.applied"
          class="reaction-control-popup__state--on"
        >ON</span>
        <span
          v-else
          class="reaction-control-popup__state--off"
        >OFF</span>
      </h2>
    </template>
    <template #body>
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      >
        <template #free-0>
          <h3>{{ $t("postgate") }}</h3>
        </template>
        <template
          v-if="!props.isReply"
          #free-1
        >
          <h3>{{ $t("threadgate") }}</h3>
        </template>
        <template
          v-if="!props.isReply"
          #free-2
        >
          <!-- 注意文 -->
          <div class="textlabel">
            <div class="textlabel__text">
              <SVGIcon name="point" />{{ $t("threadgateNotification1") }}
            </div>
            <div class="textlabel__text--alert">
              <SVGIcon name="point" />{{ $t("threadgateNotification2") }}
            </div>
          </div>
        </template>
      </EasyForm>
    </template>
    <template #footer>
      <!-- 適用ボタン -->
      <button
        class="button--important reaction-control-popup__submit-button"
        @click.stop="update"
      >
        <SVGIcon name="lock" />
        <span>{{ $t("apply") }}</span>
      </button>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.reaction-control-popup {
  &__state--on,
  &__state--off {
    border-radius: var(--border-radius-middle);
    font-size: 0.875rem;
    padding: 0.125rem 0.5rem;
  }
  &__state--on {
    background-color: rgb(var(--notice-color), 0.125);
    color: rgb(var(--notice-color));
  }
  &__state--off {
    background-color: rgb(var(--fg-color), 0.125);
    color: rgb(var(--fg-color), 0.75);
  }

  // 適用ボタン
  &__submit-button {
    margin: 1rem;
  }

  &:deep() {
    .popup-header > h2 > .svg-icon {
      fill: rgb(var(--notice-color));
    }

    h3 {
      font-size: 1.125rem;
      font-weight: bold;
    }

    // リストアイコン
    .easy-form .checkboxes {
      @include list-icon-styles;
    }
  }
}
</style>
