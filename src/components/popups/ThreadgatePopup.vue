<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  postThreadgate?: TTThreadgate
  postUri?: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
}>({
  loaderDisplay: false,
})

const easyFormState = reactive<{
  allows: Array<string>
  listUris: string
}>({
  allows: props.postThreadgate?.record?.allow
    ?.map((allow: TTThreadgateAllow) => {
      if (allow.$type.startsWith("app.bsky.feed.threadgate#mentionRule")) return "allowMention"
      else if (allow.$type.startsWith("app.bsky.feed.threadgate#followingRule")) return "allowFollowing"
      else if (allow.$type.startsWith("app.bsky.feed.threadgate#listRule")) return "allowList"
      return ""
    }) ?? [],
  listUris: props.postThreadgate?.lists
    ?.map((list: TTThreadgateList) => list.uri).join(", ") ?? "",
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

function close () {
  emit("close")
}

async function reset () {
  Util.blurElement()
  if (state.loaderDisplay || props.postUri == null) return
  state.loaderDisplay = true
  const response = await mainState.atp.deleteThreadgate(props.postUri)
  state.loaderDisplay = false
  if (!response || response instanceof Error) {
    mainState.openErrorPopup("errorApiFailed", response)
  } else {
    close()
  }
}

async function update () {
  Util.blurElement()
  if (state.loaderDisplay || props.postUri == null) return
  const allowMention = easyFormState.allows.includes("allowMention")
  const allowFollowing = easyFormState.allows.includes("allowFollowing")
  let listUris: undefined | Array<string> = easyFormState.allows.includes("allowList")
    ? easyFormState.listUris.split(",").map((uri: string) => uri.trim()).filter(Boolean)
    : []
  if (listUris.length === 0) listUris = undefined
  console.log(listUris)
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
    close()
  }
}
</script>

<template>
  <Popup
    class="threadgate-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    :data-has-threadgate="postThreadgate != null"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="reply" />
        <span>{{ $t("threadgate") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="easyFormProps" />
      <div class="button-container">
        <!-- 解除ボタン -->
        <button
          v-if="postThreadgate != null"
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

      <!-- 注意文 -->
      <div class="textlabel--alert">
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("threadgateNotification") }}
        </div>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
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
