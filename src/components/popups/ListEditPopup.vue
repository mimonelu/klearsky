<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
import { BlobRef } from "@atproto/api"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  mode?: "create" | "edit"
  list?: TTList
  callback?: (list: TTList) => void
}>()

const easyForm = ref()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
}>({
  loaderDisplay: false,
})

const easyFormState = reactive<{
  avatar: null | Array<File>
  detachAvatar: Array<boolean>,
  purpose: string,
  name: string
  description: string
}>({
  avatar: null,
  detachAvatar: [],
  purpose: props.list != null
    ? mainState.myLists!.getShortPurpose(props.list?.purpose)
    : "curatelist",
  name: props.list?.name ?? "",
  description: props.list?.description ?? "",
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t(props.mode === "create" ? "create" : "save"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state: easyFormState,
      model: "purpose",
      label: $t("listPurpose"),
      type: "radio",
      required: true,
      options: [
        // 大文字・小文字注意
        {
          label: $t("curatelist"),
          value: "curatelist",
          icon: "person",
        },
        {
          label: $t("modlist"),
          value: "modlist",
          icon: "personOff",
        },
        {
          label: $t("referencelist"),
          value: "referencelist",
          icon: "cards",
        },
      ],
    },
    {
      state: easyFormState,
      model: "avatar",
      label: $t("listAvatar"),
      type: "file",
      isMultipleFile: false,
      maxNumberOfFile: 1,
    },
    {
      state: easyFormState,
      model: "detachAvatar",
      type: "checkbox",
      display: props.list?.avatar != null,
      options: [{ label: $t("detachAvatar"), value: true }],
      // 画像取り外しチェックボックスの処理
      onUpdate (_: TTEasyFormItem, form: TTEasyForm) {
        const item = form.data.find((item: TTEasyFormItem) => {
          return item.model === "avatar"
        })
        if (item == null) return
        item.display = !easyFormState.detachAvatar.includes(true)
        easyFormState.avatar = null
        easyForm.value.forceUpdate()
      },
    },
    {
      state: easyFormState,
      model: "name",
      label: $t("listName"),
      type: "text",
      required: true,
      maxlength: 64,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: false,
      autocomplete: "off",
    },
    {
      state: easyFormState,
      model: "description",
      label: $t("listDescription"),
      type: "textarea",
      rows: 6,
      maxlength: 300,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
    },
  ],
}

function close () {
  emit("close")
}

async function submitCallback () {
  Util.blurElement()
  if (props.mode !== "create" && props.list == null) return
  state.loaderDisplay = true
  const avatarBlobRef = await makeAvatarBlobRef()
  if (avatarBlobRef instanceof Error) {
    state.loaderDisplay = false
    mainState.openErrorPopup(avatarBlobRef, "ListEditPopup/makeAvatarBlobRef")
    return
  }
  const result: Error | undefined | string = props.mode === "create"
    ? await mainState.atp.createList(
      easyFormState.purpose,
      easyFormState.name,
      easyFormState.description,
      avatarBlobRef
    )
    : await mainState.atp.updateList({
      ...props.list as TTList,
      name: easyFormState.name,
      description: easyFormState.description,
      purpose: mainState.myLists!.getLongPurpose(easyFormState.purpose),
    }, avatarBlobRef)
  if (result instanceof Error) {
    state.loaderDisplay = false
    mainState.openErrorPopup(result, "ListEditPopup/updateList")
    return
  }

  // リスト作成直後に取得を試みると稀にエラーが発生する、その対策
  // TODO: 要検討
  await Util.wait(500)

  // 作成データの取得
  // WANT: avatar を手動で構築してAPIをコールしないようにしたい
  const response = await mainState.atp.fetchList(props.list?.uri ?? result as string)
  state.loaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "ListEditPopup/fetchList")
    return
  }

  // マイリストに items を追加
  if (response.items == null) {
    response.items = []
  }

  // コールバック
  if (props.callback != null) {
    props.callback(response)
  }

  close()
}

async function makeAvatarBlobRef (): Promise<Error | undefined | BlobRef> {
  // サムネイルの取り外しが指定されている場合はスキップ
  if (easyFormState.detachAvatar.includes(true)) {
    return
  }

  // サムネイルが指定されている場合は作成
  if (easyFormState.avatar != null && easyFormState.avatar[0] != null) {
    const blobRef = await mainState.atp.createFileBlobRef({
      file: easyFormState.avatar[0],
      // TODO: 以下要確認
      maxWidth: 2000,
      maxHeight: 2000,
      maxSize: 0.953671875,
    })
    if (blobRef instanceof Error) {
      return Error("makeAvatarBlobRefError")
    }
    return blobRef
  }

  // サムネイルが指定されていない場合、かつ既存のサムネイルが存在する場合は再取得
  if (props.list?.avatar != null) {
    const uri = props.list.avatar
    const blocks = uri.match(/\/([^\/]+?)@/)
    if (blocks == null || blocks[1] == null) {
      return Error("makeAvatarBlobRefError")
    }
    const cid = blocks[1]
    const blob = await mainState.atp.fetchBlob(cid)
    if (blob instanceof Error) {
      return blob
    }
    const blobRef = new BlobRef({ $link: cid } as any, blob.type, blob.size)
    if (blobRef == null) {
      return Error("makeAvatarBlobRefError")
    }
    return blobRef
  }
}
</script>

<template>
  <Popup
    class="list-edit-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="list" />
        <span>{{ $t(mode === "create" ? "listAdd" : "listEdit") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.list-edit-popup {
  &:deep() {
    .popup-header > h2 > .svg-icon--list {
      fill: rgb(var(--list-color));
    }

    // リストアイコン
    .easy-form .radios {
      @include list-icon-styles;
    }
  }
}
</style>

