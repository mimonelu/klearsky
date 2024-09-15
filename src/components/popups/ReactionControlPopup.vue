<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
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
  draftReactionControl?: TTDraftReactionControl
  postThreadgate?: TTThreadgate
  postUri?: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
  applied: boolean
}>({
  loaderDisplay: false,
  applied: props.draftReactionControl != null
    ? props.draftReactionControl.threadgateAction !== "none"
    : props.postThreadgate != null,
})

const easyFormState = reactive<{
  threadgateAction: TTThreadgateAction
  threadgateActionOptions: Array<TTOption>
  allows: Array<string>
  allowOptions: Array<TTOption>
}>({
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
  allows: (() => {
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
  allowOptions: (() => {
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
      model: "threadgateAction",
      type: "radio",
      options: easyFormState.threadgateActionOptions,

      onUpdate () {
        // 許可リストの無効化処理
        easyFormProps.data[1].disabled = easyFormState.threadgateAction === "none"

        // 許可リストの初期化
        if (easyFormState.threadgateAction === "none") {
          easyFormState.allows.splice(0)
        }

        if (easyForm.value != null) {
          easyForm.value.forceUpdate()
        }
      },
    },
    {
      state: easyFormState,
      model: "allows",
      type: "checkbox",
      options: easyFormState.allowOptions,
      limit: LIMIT_OF_THREADGATE_ITEMS,
      disabled: props.draftReactionControl != null
        ? props.draftReactionControl.threadgateAction === "none"
        : props.postThreadgate == null,
    },
  ],
}

const easyForm = ref()

function close (params: TICloseReactionControlPopupProps) {
  emit("close", params)
}

async function update () {
  Util.blurElement()
  const allowMention = easyFormState.allows.includes("allowMention")
  const allowFollowing = easyFormState.allows.includes("allowFollowing")

  // 許可リスト
  let listUris: undefined | Array<string> = easyFormState.allows
    .filter((allow: string) => {
      return allow.startsWith("at://")
    })
  if (listUris.length === 0) {
    listUris = undefined
  }

  if (props.mode === "send") {
    close({
      threadgateAction: easyFormState.threadgateAction,
      updated: true,
      allowMention,
      allowFollowing,
      listUris,
    })
    return
  }

  // ポスト送信ポップアップの対応はここまで
  // ポストコンポーネントの対応は最後まで

  if (state.loaderDisplay || props.postUri == null) {
    return
  }
  state.loaderDisplay = true

  // Threadgate が設定済みの場合は削除
  if (props.postThreadgate != null) {
    const responseOfDelete = await mainState.atp.deleteThreadgate(props.postUri)
    if (responseOfDelete instanceof Error) {
      state.loaderDisplay = false
      mainState.openErrorPopup(responseOfDelete, "ReactionControlPopup/update")
      return
    }
  }

  // Threadgate の削除はここまで
  if (easyFormState.threadgateAction === "none") {
    state.loaderDisplay = false
    close({
      threadgateAction: easyFormState.threadgateAction,
      updated: props.postThreadgate != null,
    })
    return
  }

  // Threadgate の設定
  const responseOfUpdate = await mainState.atp.updateThreadgate(
    props.postUri,
    allowMention,
    allowFollowing,
    listUris
  )
  state.loaderDisplay = false
  if (responseOfUpdate instanceof Error) {
    mainState.openErrorPopup(responseOfUpdate, "ReactionControlPopup/update")
    return
  }

  close({
    threadgateAction: easyFormState.threadgateAction,
    updated: true,
  })
}
</script>

<template>
  <Popup
    class="threadgate-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="lock" />
        <span>{{ $t("threadgate") }}</span>

        <!-- ON/OFFアイコン -->
        <span
          v-if="state.applied"
          class="threadgate-popup__state--on"
        >ON</span>
        <span
          v-else
          class="threadgate-popup__state--off"
        >OFF</span>
      </h2>
    </template>
    <template #body>
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      >
        <template #free-1>
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

      <!-- 適用ボタン -->
      <button
        class="button--important"
        @click.stop="update"
      >
        <SVGIcon name="lock" />
        <span>{{ $t("apply") }}</span>
      </button>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.threadgate-popup {
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

  &:deep() {
    // リストアイコン
    .easy-form .checkboxes {
      @include list-icon-styles;
    }
  }
}
</style>
