<script lang="ts" setup>
import { inject, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import EasyForm from "@/components/forms/EasyForm.vue"
import LabelButton from "@/components/buttons/LabelButton.vue"
import PageHeader from "@/components/shells/PageHeader.vue"
import ProfileLinkEditPopup from "@/components/next/ProfileLink/ProfileLinkEditPopup.vue"
import ProfileLinkList from "@/components/next/ProfileLink/ProfileLinkList.vue"
import Generations from "@/composables/main-state/generations"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  displayName: string,
  description: string,
  pronouns: string,
  links?: Array<TTProfileLinkDraft>,
  labels: Array<string>,
  avatar: null | File
  detachAvatar: Array<boolean>,
  banner: null | File
  detachBanner: Array<boolean>,
  processing: boolean;
}>({
  displayName: "",
  description: "",
  pronouns: "",
  links: undefined,
  labels: [],
  avatar: null,
  detachAvatar: [],
  banner: null,
  detachBanner: [],
  processing: false,
})

const easyForm = ref()

const router = useRouter()

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("apply"),
  submitCallback: submit,
  blurOnSubmit: true,
  data: [
    {
      state,
      model: "displayName",
      label: $t("displayName"),
      type: "text",
      autocomplete: "name",
      maxlength: 64,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      focus: true,
    },
    {
      state,
      model: "description",
      label: $t("description"),
      type: "textarea",
      maxlength: 256,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      rows: 8,
      autoResizeTextarea: true,
    },
    {
      state,
      model: "pronouns",
      label: $t("pronouns"),
      type: "text",
      maxlength: 20,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
    },
    {
      state,
      model: "avatar",
      label: $t("avatar"),
      type: "file",
      isMultipleFile: false,
      maxNumberOfFile: 1,
    },
    {
      state,
      model: "detachAvatar",
      type: "checkbox",
      options: [{ label: $t("detachAvatar"), value: true }],
      // 画像取り外しチェックボックスの処理
      onUpdate (_: TTEasyFormItem, form: TTEasyForm) {
        const item = form.data.find((item: TTEasyFormItem) => {
          return item.model === "avatar"
        })
        if (item == null) return
        item.display = !state.detachAvatar.includes(true)
        state.avatar = null
        easyForm.value.forceUpdate()
      },
    },
    {
      state,
      model: "banner",
      label: $t("banner"),
      type: "file",
      isMultipleFile: false,
      maxNumberOfFile: 1,
    },
    {
      state,
      model: "detachBanner",
      type: "checkbox",
      options: [{ label: $t("detachBanner"), value: true }],
      // 画像取り外しチェックボックスの処理
      onUpdate (_: TTEasyFormItem, form: TTEasyForm) {
        const item = form.data.find((item: TTEasyFormItem) => {
          return item.model === "banner"
        })
        if (item == null) return
        item.display = !state.detachBanner.includes(true)
        state.banner = null
        easyForm.value.forceUpdate()
      },
    },
  ],
}

// プロフィールリンクの変更の有無
// 読み込み時の代入では立てず、以降の追加・編集・削除・並べ替えで立てる
let linksModified = false
watch(() => state.links, (_, oldValue) => {
  if (oldValue != null) {
    linksModified = true
  }
}, { deep: true })

onMounted(setDefaultValues)

async function setDefaultValues () {
  state.processing = true
  state.displayName = mainState.userProfile?.displayName ?? ""
  state.description = mainState.userProfile?.description ?? ""
  state.pronouns = mainState.userProfile?.pronouns ?? ""
  state.labels = mainState.userProfile?.labels
    ?.filter((label) => {
      return !label.ver
    })
    .map((label) => {
      return label.val
    }) ?? []

  // プロフィールリンク
  // NOTICE: 読み込みに失敗した場合はリンクを編集不可とし、保存時にもリンクを更新しない
  const links = await mainState.atp.fetchMyProfileLinks()
  if (links instanceof Error) {
    mainState.openErrorPopup(links, "EditProfileView/fetchMyProfileLinks")
  } else {
    state.links = links
  }

  state.processing = false
}

// プロフィールリンク編集ポップアップ
// `index` が -1 の場合は新規追加
const linkEditPopupState = reactive<{
  display: boolean
  index: number
}>({
  display: false,
  index: - 1,
})

function addLink () {
  linkEditPopupState.index = - 1
  linkEditPopupState.display = true
}

function editLink (index: number) {
  linkEditPopupState.index = index
  linkEditPopupState.display = true
}

function closeLinkEditPopup () {
  linkEditPopupState.display = false
}

function submitLink (link: TTProfileLinkDraft) {
  if (state.links == null) {
    return
  }
  if (linkEditPopupState.index === - 1) {
    state.links.push(link)
  } else {
    state.links.splice(linkEditPopupState.index, 1, link)
  }
  closeLinkEditPopup()
}

function deleteLink () {
  if (state.links == null || linkEditPopupState.index === - 1) {
    return
  }
  state.links.splice(linkEditPopupState.index, 1)
  closeLinkEditPopup()
}

async function submit () {
  Util.blurElement()
  if (state.processing) return
  state.processing = true

  // 待機中に別のプロフィールへ遷移した場合に備え、世代番号を先に控えておく
  const generation = Generations.profile.current()

  try {
    await mainState.updateUserProfile({
      ...state as TTUpdateProfileParams,

      // 変更時のみプロフィールリンクを更新する
      links: linksModified ? state.links : undefined,
    })
    const did = mainState.atp.session?.did
    if (did != null) {
      await Util.wait(500)
      await mainState.fetchCurrentProfile(did, generation)
    }
    await router.push({ name: "profile-feeds", query: { account: did } })
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <div class="edit-profile-view">
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('editProfile')"
        :subTitle="mainState.atp.session?.handle ?? ''"
      />
    </Portal>
    <EasyForm
      v-bind="easyFormProps"
      ref="easyForm"
    >
      <template #free-3>
        <!-- プロフィールリンク -->
        <dl>
          <dt>{{ $t("profileLinks") }}</dt>
          <dd>
            <ProfileLinkList
              v-if="state.links != null"
              :drafts="state.links"
              @add="addLink"
              @edit="editLink"
            />
          </dd>
        </dl>

        <!-- アカウントラベル選択ポップアップトリガー -->
        <dl>
          <dt>{{ $t("accountLabels") }}</dt>
          <dd>
            <LabelButton
              type="account"
              :parentState="state"
            >
              <span>{{ $t("labels") }}</span>
            </LabelButton>
          </dd>
        </dl>
      </template>
    </EasyForm>

    <!-- プロフィールリンク編集ポップアップ -->
    <Transition>
      <ProfileLinkEditPopup
        v-if="linkEditPopupState.display"
        :link="state.links?.[linkEditPopupState.index]"
        @close="closeLinkEditPopup"
        @delete="deleteLink"
        @submit="submitLink"
      />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.edit-profile-view {
  padding-bottom: var(--sp-menu-height);

  &__header {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  &:deep() {
    .label-button {
      width: fit-content;
    }
  }
}

.easy-form {
  padding: 1rem;
}
</style>
