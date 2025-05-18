<script lang="ts" setup>
import { inject, onMounted, reactive, ref, type Ref } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import LinkCard from "@/components/cards/LinkCard.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const isExisting = ref(false)

const popupLoaderDisplay = ref(false)

const formState = reactive<{
  uri?: string
  durationMinutes?: string
}>({
  uri: undefined,
  durationMinutes: undefined,
})

const easyFormProps: TTEasyForm = {
  blurOnSubmit: true,
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback,
  data: [
    {
      state: formState,
      model: "uri",
      label: $t("actorStatusLiveUri"),
      type: "text",
      required: true,
      async onInput () {
        await updateLinkCard()
      },
    },
    {
      state: formState,
      model: "durationMinutes",
      label: $t("actorStatusLiveDurationMinutes"),
      type: "text",
      inputmode: "numeric",
      pattern: "\\d*",
    },
  ],
}

const linkCardProps: Ref<undefined | {
  external: TTExternal
  layout?: "none" | "horizontal" | "vertical"
  displayImage?: boolean
  noLink?: boolean
  noEmbedded?: boolean
}> = ref(undefined)

onMounted(async () => {
  // 現在のアクターステータスを取得
  popupLoaderDisplay.value = true
  const currentStatus = await mainState.atp.fetchActorStatus(mainState.atp.session!.did)
  popupLoaderDisplay.value = false

  // 現在のアクターステータスが存在しない場合
  if (currentStatus instanceof Error) {
    isExisting.value = false
    formState.uri = undefined
    formState.durationMinutes = undefined
  }

  // 現在のアクターステータスが存在する場合
  else {
    isExisting.value = true
    formState.uri = currentStatus.embed?.external?.uri
    formState.durationMinutes = currentStatus.durationMinutes

    // リンクカードを更新
    await updateLinkCard()
  }
})

function close () {
  emit("close")
}

async function submitCallback () {
  Util.blurElement()
  await createActorStatus()
}

async function createActorStatus () {
  const uri = formState.uri
  const durationMinutes = isNumeric(formState.durationMinutes)
    ? Number(formState.durationMinutes)
    : undefined
  popupLoaderDisplay.value = true

  // アクターステータスが存在する場合はいったん削除
  if (isExisting.value) {
    await mainState.atp.deleteActorStatus(mainState.atp.session!.did)
  }

  const response = await mainState.atp.createActorStatus("live", durationMinutes, {
    uri: uri ?? "",
    title: linkCardProps.value?.external?.title ?? "",
    description: linkCardProps.value?.external?.description ?? "",
    // TODO:
    // thumb: linkCardProps.value?.external?.thumb,
  })
  popupLoaderDisplay.value = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "ActorStatusEditPopup/createActorStatus")
    return
  }

  // TODO: 現在のプロフィールデータ内にあるアクターステータスの更新

  close()
}

function isNumeric (str?: number | string): boolean {
  if (typeof str === "number") {
    return true
  }
  return str != null && str.trim() !== "" && !isNaN(Number(str))
}

async function deleteActorStatus () {
  popupLoaderDisplay.value = true
  const result = await mainState.atp.deleteActorStatus(mainState.atp.session!.did)
  popupLoaderDisplay.value = false
  if (result instanceof Error) {
    close()
    return
  }
  isExisting.value = false
  formState.uri = undefined
  formState.durationMinutes = undefined
  linkCardProps.value = undefined

  // TODO: 現在のプロフィールデータ内にあるアクターステータスの更新

  close()
}

async function updateLinkCard () {
  if (!formState.uri) {
    linkCardProps.value = undefined
    return
  }
  // TODO: threashold
  const external = await Util.parseOgp(
    mainState.atp,
    formState.uri,
    false
  )
  if (external instanceof Error) {
    linkCardProps.value = undefined
    return
  }
  if (external.preview) {
    external.thumb = external.preview
  }
  linkCardProps.value = {
    external,
    layout: "vertical",
    displayImage: true,
    noLink: true,
    noEmbedded: true,
  }
}
</script>

<template>
  <Popup
    class="actor-status-edit-popup"
    :hasCloseButton="true"
    :loaderDisplay="popupLoaderDisplay"
    :data-is-active="isExisting"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="video" />
        <span>{{ $t("actorStatusLiveEdit") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="easyFormProps">
        <template #beforeButton>
          <LinkCard
            v-if="linkCardProps != null"
            v-bind="linkCardProps"
          />
          <button
            v-if="isExisting"
            type="button"
            class="button--important delete-button"
            @click="deleteActorStatus"
          >
            <span>{{ $t("delete") }}</span>
          </button>
        </template>
      </EasyForm>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.actor-status-edit-popup {
  &[data-is-active="false"] .easy-form {
    grid-template-areas:
      "b b"
      "l l"
      "s s";
  }
  &[data-is-active="true"] .easy-form {
    grid-template-areas:
      "b b"
      "l l"
      "d s";
  }
}
.easy-form:deep() {
  display: grid;

  .easy-form__body {
    grid-area: b;
  }

  .external {
    grid-area: l;
  }

  .delete-button {
    grid-area: d;
  }

  .submit-button {
    grid-area: s;
  }
}
</style>
