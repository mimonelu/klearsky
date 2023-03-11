<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import { useRouter } from "vue-router"
import EasyForm from "@/components/EasyForm.vue"
import { blurElement, waitProp } from "@/composables/misc"
import type { MainState } from "@/@types/app.d"

const router = useRouter()

const mainState: MainState = inject("state") as MainState

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

const $t = inject("$t") as Function

const easyFormProps = {
  submitButtonLabel: $t("apply"),
  submitCallback: submit,
  data: [
    {
      state,
      model: "displayName",
      label: $t("displayName"),
      type: "text",
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
    await mainState.updateProfile(state)
    await router.push({ name: "profile", query: { did: mainState.atp.session?.did } })
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <div class="edit-profile-view">
    <header class="header">
      <h1>{{ $t("editProfile") }}</h1>
    </header>
    <EasyForm v-bind="easyFormProps" />
  </div>
</template>

<style lang="scss" scoped>
.header {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  padding: 1rem;
}

.easy-form {
  padding: 2rem;
}
</style>
