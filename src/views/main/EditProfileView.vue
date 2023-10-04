<script lang="ts" setup>
import { inject, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import PageHeader from "@/components/shell-parts/PageHeader.vue"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  displayName: string,
  description: string,
  avatar: null | File
  detachAvatar: Array<boolean>,
  banner: null | File
  detachBanner: Array<boolean>,
  processing: boolean;
}>({
  displayName: "",
  description: "",
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
      focus: true,
    },
    {
      state,
      model: "description",
      label: $t("description"),
      type: "textarea",
      maxlength: 255,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: false,
      rows: 8,
    },
    {
      state,
      model: "avatar",
      label: $t("avatar"),
      type: "file",
      // accept: "image/png, image/jpeg",
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
        const item = form.data
          .find((item: TTEasyFormItem) => item.model === "avatar")
        if (item == null) return
        item.disabled = state.detachAvatar.includes(true)
        state.avatar = null
        easyForm.value.forceUpdate()
      },
    },
    {
      state,
      model: "banner",
      label: $t("banner"),
      type: "file",
      // accept: "image/png, image/jpeg",
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
        const item = form.data
          .find((item: TTEasyFormItem) => item.model === "banner")
        if (item == null) return
        item.disabled = state.detachBanner.includes(true)
        state.banner = null
        easyForm.value.forceUpdate()
      },
    },
  ],
}

onMounted(setDefaultValues)

async function setDefaultValues () {
  state.processing = true
  state.displayName = mainState.userProfile?.displayName ?? ""
  state.description = mainState.userProfile?.description ?? ""
  state.processing = false
}

async function submit () {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  try {
    await mainState.updateUserProfile(state as TTUpdateProfileParams)
    const did = mainState.atp.session?.did
    await mainState.fetchCurrentProfile(did as string)
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
    />
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
}

.easy-form {
  padding: 2rem;
}
</style>
