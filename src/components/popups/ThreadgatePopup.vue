<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params: any): void}>()

const props = defineProps<{
  display: boolean
  mode?: "send" | "post"
  draftThreadgate?: TTDraftThreadgate
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
  applied: props.draftThreadgate?.applied ?? props.postThreadgate != null,
})

const easyFormState = reactive<{
  allows: Array<string>
  listUris: string
}>({
  allows: (() => {
    // 送信ポスト用
    if (props.mode === "send") {
      const allows: Array<string> = []
      if (props.draftThreadgate?.allowMention) allows.push("allowMention")
      if (props.draftThreadgate?.allowFollowing) allows.push("allowFollowing")
      if ((props.draftThreadgate?.listUris?.length ?? 0) > 0) allows.push("allowList")
      return allows
    }

    // 既存ポスト用
    if (props.mode === "post") {
      return props.postThreadgate?.record?.allow
        ?.map((allow: TTThreadgateAllow) => {
          if (allow.$type.startsWith("app.bsky.feed.threadgate#mentionRule")) return "allowMention"
          else if (allow.$type.startsWith("app.bsky.feed.threadgate#followingRule")) return "allowFollowing"
          else if (allow.$type.startsWith("app.bsky.feed.threadgate#listRule")) return "allowList"
          return ""
        }) ?? []
    }

    return []
  })(),
  listUris: (() => {
    // 送信ポスト用
    if (props.mode === "send") {
      return props.draftThreadgate?.listUris?.join(", ") ?? ""
    }

    // 既存ポスト用
    if (props.mode === "post") {
      return props.postThreadgate?.lists
        ?.map((list: TTThreadgateList) => list.uri).join(", ") ?? ""
    }

    return ""
  })(),
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  data: [
    {
      state: easyFormState,
      model: "allows",
      type: "checkbox",
      options: [
        { label: $t("threadgateAllowMention"), value: "allowMention" },
        { label: $t("threadgateAllowFollowing"), value: "allowFollowing" },
        { label: $t("threadgateAllowList"), value: "allowList" },
      ],
    },
    {
      state: easyFormState,
      model: "listUris",
      type: "textarea",
      rows: 3,
      placeholder: $t("threadgateAllowListSample"),
    },
  ],
}

function close (params: any) {
  emit("close", params)
}

async function reset () {
  Util.blurElement()

  // 送信ポスト用
  if (props.mode === "send") {
    close({
      updated: true,
      reset: true,
    })
    return
  }

  if (state.loaderDisplay || props.postUri == null) return
  state.loaderDisplay = true
  const response = await mainState.atp.deleteThreadgate(props.postUri)
  state.loaderDisplay = false
  if (!response || response instanceof Error) {
    mainState.openErrorPopup("errorApiFailed", response)
  } else {
    close({ updated: true })
  }
}

async function update () {
  Util.blurElement()
  const allowMention = easyFormState.allows.includes("allowMention")
  const allowFollowing = easyFormState.allows.includes("allowFollowing")
  let listUris: undefined | Array<string> = easyFormState.allows.includes("allowList")
    ? easyFormState.listUris.split(",").map((uri: string) => uri.trim()).filter(Boolean)
    : []
  if (listUris.length === 0) listUris = undefined

  // 送信ポスト用
  if (props.mode === "send") {
    close({
      updated: true,
      allowMention,
      allowFollowing,
      listUris,
    })
    return
  }

  if (state.loaderDisplay || props.postUri == null) return
  state.loaderDisplay = true

  // Threadgate が設定済みの場合は削除
  if (props.postThreadgate != null) {
    const responseOfDelete = await mainState.atp.deleteThreadgate(props.postUri)
    if (!responseOfDelete || responseOfDelete instanceof Error) {
      state.loaderDisplay = false
      mainState.openErrorPopup("errorApiFailed", responseOfDelete)
      return
    }
  }

  const responseOfUpdate = await mainState.atp.updateThreadgate(props.postUri, allowMention, allowFollowing, listUris)
  state.loaderDisplay = false
  if (!responseOfUpdate || responseOfUpdate instanceof Error) {
    mainState.openErrorPopup("errorApiFailed", responseOfUpdate)
  } else {
    close({ updated: true })
  }
}
</script>

<template>
  <Popup
    class="threadgate-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    :data-has-threadgate="state.applied"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="lock" />
        <span>{{ $t("threadgate") }}</span>
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
      <EasyForm v-bind="easyFormProps" />

      <!-- 注意文 -->
      <div class="textlabel--alert">
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("threadgateNotification") }}
        </div>
      </div>

      <div class="button-container">
        <!-- 解除ボタン -->
        <button
          v-if="state.applied"
          class="button"
          @click.stop="reset"
        >
          <SVGIcon name="unlock" />
          <span>{{ $t("release") }}</span>
        </button>

        <!-- 適用ボタン -->
        <button
          class="button--important"
          @click.stop="update"
        >
          <SVGIcon name="lock" />
          <span>{{ $t("apply") }}</span>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.threadgate-popup {
  &__state--on,
  &__state--off {
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    padding: 0.125rem 0.5rem;
  }
  &__state--on {
    background-color: rgb(var(--notice-color), 0.125);
    color: rgb(var(--notice-color));
  }
  &__state--off {
    background-color: var(--fg-color-0125);
    color: var(--fg-color-075);
  }
}

.button-container {
  display: flex;
  grid-gap: 1rem;

  [data-has-threadgate="true"] & > * {
    flex-basis: 50%;
  }
  [data-has-threadgate="false"] & > * {
    flex-grow: 1;
  }
}
</style>
