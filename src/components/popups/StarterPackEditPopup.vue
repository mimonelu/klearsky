<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
import { RichText } from "@atproto/api"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  mode?: "create" | "edit"
  starterPack?: TIStarterPack
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
  name: string
  description: string
}>({
  name: props.starterPack?.record.name ?? "",
  description: props.starterPack?.record.description ?? "",
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t(props.mode === "create" ? "create" : "save"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state: easyFormState,
      model: "name",
      label: $t("starterPackName"),
      type: "text",
      required: true,
      maxlength: 50,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      autocomplete: "off",
    },
    {
      state: easyFormState,
      model: "description",
      label: $t("starterPackDescription"),
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
  if (props.mode === "edit" && props.starterPack == null) {
    return
  }
  state.loaderDisplay = true
  const query = { ...props.starterPack } as TIStarterPack
  query.record.name = easyFormState.name
  query.record.description = easyFormState.description

  const richText = new RichText({ text: easyFormState.description })
  await richText.detectFacets(mainState.atp.agent)
  query.record.descriptionFacets = richText.facets
  console.log(richText.facets)

  const result: undefined | Error = await mainState.atp.updateStarterPack(query)
  if (result instanceof Error) {
    state.loaderDisplay = false
    mainState.openErrorPopup("errorApiFailed", "StarterPackEditPopup/updateStarterPack")
    return
  }

  // 更新成功時
  if (props.mode === "edit") {
    // ユーザーのスターターパックを上書き
    mainState.currentAuthorStarterPacks.some((starterPack) => {
      if (props.starterPack == null) {
        return true
      }
      if (props.starterPack.uri !== starterPack.uri) {
        return false
      }
      starterPack.record.name = props.starterPack.record.name
      starterPack.record.description = props.starterPack.record.description
      return true
    })
  }

  close()
}
</script>

<template>
  <Popup
    class="starter-pack-edit-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="cards" />
        <span>{{ $t(mode === "create" ? "starterPackCreate" : "starterPackEdit") }}</span>
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
.starter-pack-edit-popup {
  &:deep() {
    .popup-header > h2 > .svg-icon--cards {
      fill: rgb(var(--like-color));
    }
  }
}
</style>

