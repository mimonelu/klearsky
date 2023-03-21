<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import { useRouter } from "vue-router"
import EasyForm from "@/components/EasyForm.vue"
import PageHeader from "@/components/PageHeader.vue"
import { blurElement } from "@/composables/misc"
import waitProp from "@/composables/wait-prop"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  displayName: string,
  description: string,
  avatar: null | File
  banner: null | File
  processing: boolean;
}>({
  displayName: "",
  description: "",
  avatar: null,
  banner: null,
  processing: false,
})

const router = useRouter()

const easyFormProps: KEasyForm = {
  submitButtonLabel: $t("apply"),
  submitCallback: submit,
  data: [
    {
      state,
      model: "displayName",
      label: $t("displayName"),
      type: "text",
      autocomplete: "name",
      focus: true,
    },
    {
      state,
      model: "description",
      label: $t("description"),
      type: "textarea",
      rows: 8,
    },
    {
      state,
      model: "avatar",
      label: $t("avatar"),
      type: "file",
      accept: "image/png, image/jpeg",
      isMultipleFile: false,
      maxNumberOfFile: 1,
    },
    {
      state,
      model: "banner",
      label: $t("banner"),
      type: "file",
      accept: "image/png, image/jpeg",
      isMultipleFile: false,
      maxNumberOfFile: 1,
    }
  ],
}

onMounted(async () => {
  state.processing = true
  if (!mainState.mounted) await waitProp(() => mainState.mounted, true)
  state.displayName = mainState.userProfile?.displayName ?? ""
  state.description = mainState.userProfile?.description ?? ""
  state.processing = false
})

async function submit () {
  blurElement()
  if (state.processing) return
  state.processing = true
  try {
    await mainState.updateUserProfile(state)
    await router.push({
      name: "profile-post",
      query: { handle: mainState.atp.session?.handle }
    })
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <div class="edit-profile-view">
    <PageHeader :title="$t('editProfile')" />
    <EasyForm v-bind="easyFormProps" />
  </div>
</template>

<style lang="scss" scoped>
.easy-form {
  padding: 2rem;
}
</style>
