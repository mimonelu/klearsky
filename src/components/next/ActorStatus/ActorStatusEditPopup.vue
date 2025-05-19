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

const isActive = ref(false)

const expiredAt = ref("")

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
      required: true,
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
  // 現在のアクターステータスを再取得
  popupLoaderDisplay.value = true
  const currentStatus = await mainState.atp.fetchActorStatus(mainState.atp.session!.did)
  popupLoaderDisplay.value = false

  // 現在のアクターステータスが存在しない場合
  if (currentStatus instanceof Error) {
    isExisting.value = false
    isActive.value = false
    expiredAt.value = ""
    formState.uri = undefined
    formState.durationMinutes = undefined
  }

  // 現在のアクターステータスが存在する場合
  else {
    isExisting.value = true
    isActive.value = new Date() < new Date(currentStatus.__expiredAt)
    expiredAt.value = currentStatus.__expiredAt
    formState.uri = currentStatus.embed?.external?.uri
    formState.durationMinutes = currentStatus.durationMinutes != null
      ? String(currentStatus.durationMinutes)
      : undefined

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
  if (uri == null || durationMinutes == null) {
    return
  }
  popupLoaderDisplay.value = true

  // OGP情報の取得
  const external = await Util.parseOgp(
    mainState.atp,
    uri,
    true // 本番用に付き画像をアップロードする
  )
  if (external instanceof Error) {
    popupLoaderDisplay.value = false
    mainState.openErrorPopup(external, "ActorStatusEditPopup/createActorStatus")
    return
  }

  // アクターステータスが存在する場合は削除
  if (isExisting.value) {
    const response = await mainState.atp.deleteActorStatus(mainState.atp.session!.did)
    if (response instanceof Error) {
      popupLoaderDisplay.value = false
      mainState.openErrorPopup(response, "ActorStatusEditPopup/createActorStatus")
      return
    }
  }

  // アクターステータスの作成
  const response = await mainState.atp.createActorStatus("live", durationMinutes, external)
  if (response instanceof Error) {
    popupLoaderDisplay.value = false
    mainState.openErrorPopup(response, "ActorStatusEditPopup/createActorStatus")
    return
  }

  // 現在のアクターステータスを再取得
  await updateProfileStatus()

  popupLoaderDisplay.value = false
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
  isActive.value = false
  formState.uri = undefined
  formState.durationMinutes = undefined
  linkCardProps.value = undefined
  await updateProfileStatus()
  close()
}

async function updateLinkCard () {
  if (!formState.uri) {
    linkCardProps.value = undefined
    return
  }

  // TODO: threashold

  // OGP情報の取得
  const external = await Util.parseOgp(
    mainState.atp,
    formState.uri,
    false // プレビュー用に付き画像はアップロードしない
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

async function updateProfileStatus () {
  const did = mainState.atp.session!.did
  const profile = await mainState.atp.fetchProfile(did)
  if (!(profile instanceof Error)) {
    if (mainState.userProfile != null) {
      mainState.userProfile.status = profile.status
    }
    if (mainState.currentProfile?.did === did) {
      mainState.currentProfile.status = profile.status
    }
  }
}
</script>

<template>
  <Popup
    class="actor-status-edit-popup"
    :hasCloseButton="true"
    :loaderDisplay="popupLoaderDisplay"
    :data-is-existing="isExisting"
    :data-is-active="isActive"
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
          <dl
            v-if="isExisting"
            class="expired-at"
          >
            <dt>{{ $t("actorStatusLiveExpiredAt") }}</dt>
            <dd>{{ mainState.formatDate(expiredAt, true) }}</dd>
          </dl>
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
  &[data-is-existing="false"] .easy-form {
    grid-template-areas:
      "b b"
      "l l"
      "s s";
  }
  &[data-is-existing="true"] .easy-form {
    grid-template-areas:
      "b b"
      "e e"
      "l l"
      "d s";
  }
}
.easy-form:deep() {
  display: grid;

  .easy-form__body {
    grid-area: b;
  }

  .expired-at {
    grid-area: e;

    dd {
      padding: 0.5rem 1rem;
      [data-is-active="false"] & {
        color: rgb(var(--notice-color));
      }
    }
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
