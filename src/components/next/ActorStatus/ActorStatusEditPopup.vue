<script lang="ts" setup>
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, watch, type Ref } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import LinkCard from "@/components/cards/LinkCard.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyForm = ref()

const isExisting = ref(false)

const expiredAt = computed((): string => {
  return formState.durationMinutes != null
    ? new Date(Date.now() + Number(formState.durationMinutes) * 60 * 1000).toISOString()
    : ""
})

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
  hasSubmitButton: false,
  submitCallback: submit,
  data: [
    {
      state: formState,
      model: "uri",
      label: $t("actorStatusLiveUri"),
      type: "text",
      required: true,
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

const debouncedUpdateLinkCard = Util.debounce(updateLinkCard, 1000)

watch(() => formState.uri, () => {
  debouncedUpdateLinkCard()
})

onMounted(async () => {
  // 現在のアクターステータスを再取得
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
    formState.durationMinutes = currentStatus.durationMinutes != null
      ? String(currentStatus.durationMinutes)
      : undefined

    // リンクカードを更新
    await updateLinkCard()
  }
})

onBeforeUnmount(() => {
  debouncedUpdateLinkCard.cancel()
})

function close () {
  emit("close")
}

async function submit () {
  Util.blurElement()
  if (easyForm.value?.validate()) {
    await createActorStatus()
  }
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

  // アクターステータスが存在する場合は削除
  if (isExisting.value) {
    const response = await mainState.atp.deleteActorStatus(mainState.atp.session!.did)
    if (response instanceof Error) {
      popupLoaderDisplay.value = false
      mainState.openErrorPopup(response, "ActorStatusEditPopup/createActorStatus/deleteActorStatus")
      return
    }
  }

  // OGP情報の取得
  const external = await Util.parseOgp(
    mainState.atp,
    uri,
    true // 本番用に付き画像をアップロードする
  )
  if (external instanceof Error) {
    popupLoaderDisplay.value = false
    mainState.openErrorPopup(external, "ActorStatusEditPopup/createActorStatus/parseOgp")
    return
  }

  // アクターステータスの作成
  const response = await mainState.atp.createActorStatus("live", durationMinutes, external)
  if (response instanceof Error) {
    popupLoaderDisplay.value = false
    mainState.openErrorPopup(response, "ActorStatusEditPopup/createActorStatus/createActorStatus")
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
  formState.uri = undefined
  formState.durationMinutes = undefined
  linkCardProps.value = undefined

  // 現在のアクターステータスを再取得
  await updateProfileStatus()

  close()
}

async function updateLinkCard () {
  if (!formState.uri) {
    linkCardProps.value = undefined
    return
  }

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

  // サーバデータの反映遅延対策
  await Util.wait(1000)

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
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="video" />
        <span>{{ $t("actorStatusLiveEdit") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      >
        <template #beforeButton>
          <dl class="expired-at">
            <dt>{{ $t("actorStatusLiveExpiredAt") }}</dt>
            <dd>{{ expiredAt ? mainState.formatDate(expiredAt, true) : "-" }}</dd>
          </dl>
          <LinkCard
            v-if="linkCardProps != null"
            v-bind="linkCardProps"
          />
        </template>
      </EasyForm>
    </template>
    <template #footer>
      <div class="actor-status-edit-popup__footer">
        <button
          v-if="isExisting"
          type="button"
          class="button--important delete-button"
          @click.stop="deleteActorStatus"
        >
          <span>{{ $t("delete") }}</span>
        </button>
        <button
          type="button"
          class="button"
          @click.stop="submit"
        >
          <span>{{ $t("submit") }}</span>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.actor-status-edit-popup {
  &[data-is-existing="false"] .easy-form {
    grid-template-areas:
      "b b"
      "e e"
      "l l";
  }
  &[data-is-existing="true"] .easy-form {
    grid-template-areas:
      "b b"
      "e e"
      "l l";
  }

  &__footer {
    display: flex;
    grid-gap: 0.5rem;
    padding: 1rem;

    & > * {
      flex-grow: 1;
    }
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
    }
  }

  .external {
    grid-area: l;
  }
}
</style>
