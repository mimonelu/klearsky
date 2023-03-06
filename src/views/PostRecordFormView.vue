<script lang="ts" setup>
import { reactive } from "vue"
import Copyright from "@/components/Copyright.vue"
import FileBox from "@/components/FileBox.vue"
import Loader from "@/components/Loader.vue"
import Atp from "@/composables/atp"

const state = reactive<{
  service: string
  identifier: string
  password: string
  text: string
  images: Array<File>
  alts: Array<string>
  step: "" | "wait" | "error" | "success"
  error: any
}>({
  service: "https://bsky.social",
  identifier: "",
  password: "",
  text: "",
  images: [],
  alts: [],
  step: "",
  error: null
})

const atp = new Atp()

const submit = async () => {
  state.step = "wait"
  try {
    state.step = await atp.postRecord(state) ? "success" : "error"
  } catch (error: any) {
    state.step = "error"
    state.error = error
  }
}

const changeImage = (files: Array<File>) => {
  state.images.splice(0, state.images.length, ...files)
}
</script>

<template>
  <div class="page">
    <h1>Post Record Form for Bluesky</h1>
    <p>
      {{ $t("prf-description") }}<br>
      <a
        class="textlink"
        href="https://github.com/mimonelu/klearsky"
        rel="noreferrer"
        target="_blank"
      >GitHub</a>
    </p>
    <form
      @submit.prevent="submit"
      spellcheck="false"
    >
      <dl>
        <dt>{{ $t("prf-service") }}</dt>
        <input
          v-model="state.service"
          class="textbox"
          type="url"
          required="true"
          placeholder="https://bsky.social"
        />
      </dl>
      <dl>
        <dt>{{ $t("prf-identifier") }}</dt>
        <input
          v-model="state.identifier"
          class="textbox"
          type="text"
          required="true"
          placeholder="you.bsky.social, your@email.address, did:plc:xxx..."
          autocomplete="username"
        />
      </dl>
      <dl>
        <dt>{{ $t("prf-password") }}</dt>
        <input
          v-model="state.password"
          class="textbox"
          type="password"
          required="true"
          autocomplete="current-password"
        />
      </dl>
      <dl>
        <dt>{{ $t("prf-text") }}<small>{{ $t("prf-text-description") }}</small></dt>
        <textarea
          v-model="state.text"
          class="textarea"
          placeholder="Waht's up?"
        />
      </dl>
      <dl>
        <dt>{{ $t("prf-images") }}<small>{{ $t("prf-images-description") }}</small></dt>
        <FileBox
          :multiple="true"
          :maxNumber="4"
          @change="changeImage"
        />
      </dl>
      <dl v-if="state.images.length > 0">
        <dt>{{ $t("prf-alts") }}</dt>
        <input
          v-for="_, index of state.images"
          v-model="state.alts[index]"
          class="textbox"
          type="text"
          :placeholder="`ALT text ${index + 1}`"
        />
      </dl>
      <div
        v-if="state.step === 'wait'"
        class="wait"
      >{{ $t("prf-wait") }}</div>
      <div
        v-else-if="state.step === 'error'"
        class="error"
      >{{ $t("prf-error") }}<br>{{ state.error }}</div>
      <div
        v-else-if="state.step === 'success'"
        class="success"
      >{{ $t("prf-success") }}</div>
      <button class="button">{{ $t("prf-submit") }}</button>
      <Loader v-if="state.step === 'wait'" />
    </form>
    <Copyright />
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  grid-gap: 2rem;
  margin: auto;
  padding: 2rem 2rem 4rem 2rem;
  max-width: 640px;
}

h1 {
  font-size: 2rem;
  line-height: 1.5;
}

form {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  position: relative;

  dl {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;

    dt {
      display: flex;
      align-items: flex-end;
      grid-gap: 0.5rem;

      small {
        font-size: 0.75rem;
      }
    }
  }
}

.wait,
.error,
.success {
  border-radius: 1px;
  line-height: 1.5;
  padding: 1rem;
  white-space: pre-wrap;
}
.wait {
  border: 1px solid rgb(var(--fg-color));
  color: rgb(var(--fg-color));
}
.error {
  border: 1px solid rgb(var(--notice-color));
  color: rgb(var(--notice-color));
}
.success {
  border: 1px solid rgb(var(--accent-color));
  color: rgb(var(--accent-color));
}

p {
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
