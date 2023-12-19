<script lang="ts" setup>
import { inject, reactive } from "vue"
import { BlobRef } from "@atproto/api"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  list?: TTList
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
}>({
  loaderDisplay: false,
})

const easyFormState = reactive<{
  avatar: null | Array<File>
  name: string
  description: string
}>({
  avatar: null,
  name: props.list?.name ?? "",
  description: props.list?.description ?? "",
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("save"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state: easyFormState,
      model: "avatar",
      label: $t("listAvatar"),
      type: "file",
      // accept: "image/png, image/jpeg",
      isMultipleFile: false,
      maxNumberOfFile: 1,
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
  if (props.list == null) return
  state.loaderDisplay = true
  const avatarBlobRef: undefined | Error | BlobRef = await makeAvatarBlobRef()
  if (avatarBlobRef instanceof Error) {
    state.loaderDisplay = false
    mainState.openErrorPopup(avatarBlobRef, "ListEditPopup/makeAvatarBlobRef")
    return
  }
  const result = await mainState.atp.updateList({
    ...props.list,
    name: easyFormState.name,
    description: easyFormState.description,
  }, avatarBlobRef)
  state.loaderDisplay = false
  if (result instanceof Error) {
    mainState.openErrorPopup("errorApiFailed", "ListEditPopup/updateList")
    return
  }
  props.list.name = easyFormState.name
  props.list.description = easyFormState.description
  close()
}

async function makeAvatarBlobRef (): Promise<undefined | Error | BlobRef> {
  if (easyFormState.avatar != null && easyFormState.avatar[0] != null) {
    // サムネイルが指定されている場合は作成
    const blobRef = await mainState.atp.createFileBlobRef({
      file: easyFormState.avatar[0],
      // TODO: 以下要確認
      maxWidth: 2000,
      maxHeight: 2000,
      maxSize: 0.953671875,
    })
    if (blobRef == null) return Error("Failed createFileBlobRef")
    return blobRef
  } else if (props.list?.avatar != null) {
    // サムネイルが指定されていない場合、かつ既存のサムネイルが存在する場合は再取得
    const uri = props.list.avatar
    const blocks = uri.match(/\/([^\/]+?)@/)
    if (blocks == null || blocks[1] == null) return Error("Failed uri.match")
    const cid = blocks[1]
    const blob = await mainState.atp.fetchBlob(cid)
    if (blob == null) return Error("Failed fetchBlob")
    const blobRef = new BlobRef({ $link: cid } as any, blob.type, blob.size)
    if (blobRef == null) return Error("Failed BlobRef")
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
        <span>{{ $t("listEdit") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>
