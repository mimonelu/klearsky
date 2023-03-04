<script lang="ts" setup>
import { reactive } from "vue"
import FileBox from "@/components/FileBox.vue"
import Loader from "@/components/Loader.vue"
import AtpClass from "@/composables/atp"

const state = reactive<{
  service: string
  email: string
  password: string
  avatar: null | File
  banner: null | File
  step: "" | "wait" | "error" | "success"
}>({
  service: "https://bsky.social",
  email: "",
  password: "",
  avatar: null,
  banner: null,
  step: ""
})

const atp = new AtpClass()

const submit = async () => {
  state.step = "wait"
  state.step = await atp.updateProfile(state) ? "success" : "error"
}

const changeImage = (event: Event, type: "avatar" | "banner") => {
  const files: null | FileList = (event.target as HTMLInputElement)?.files ?? null
  if (files == null || files.length === 0) return
  if (type === "avatar") state.avatar = files[0]
  else if (type === "banner") state.banner = files[0]
}
</script>

<template>
  <div class="page">
    <h1>Bluesky Profile Images Uploader</h1>
    <p>
      {{ $t("bpiu-description") }}<br>
      <a
        class="textlink"
        href="https://github.com/mimonelu/klear-sky"
        rel="noreferrer"
        target="_blank"
      >GitHub</a>
    </p>
    <form @submit.prevent="submit">
      <dl>
        <dt>{{ $t("bpiu-server") }}</dt>
        <input
          v-model="state.service"
          class="textbox"
          type="url"
          required="true"
          placeholder="https://bsky.social"
        />
      </dl>
      <dl>
        <dt>{{ $t("bpiu-email") }}</dt>
        <input
          v-model="state.email"
          class="textbox"
          type="email"
          required="true"
          placeholder="your@email.address"
          autocomplete="email"
        />
      </dl>
      <dl>
        <dt>{{ $t("bpiu-password") }}</dt>
        <input
          v-model="state.password"
          class="textbox"
          type="password"
          required="true"
          autocomplete="current-password"
        />
      </dl>
      <dl>
        <dt>{{ $t("bpiu-thumbnail") }}<small>{{ $t("bpiu-thumbnail-description") }}</small></dt>
        <FileBox
          accept="image/png, image/jpeg"
          @change="changeImage($event, 'avatar')"
        />
      </dl>
      <dl>
        <dt>{{ $t("bpiu-banner") }}<small>{{ $t("bpiu-banner-description") }}</small></dt>
        <FileBox
          accept="image/png, image/jpeg"
          @change="changeImage($event, 'banner')"
        />
      </dl>
      <div
        v-if="state.step === 'wait'"
        class="wait"
      >{{ $t("bpiu-wait") }}</div>
      <div
        v-else-if="state.step === 'error'"
        class="error"
      >{{ $t("bpiu-error") }}</div>
      <div
        v-else-if="state.step === 'success'"
        class="success"
      >{{ $t("bpiu-success") }}</div>
      <button class="button">{{ $t("bpiu-submit") }}</button>
      <Loader v-if="state.step === 'wait'" />
    </form>
    <footer>
      <small>&copy; 2023 mimonelu</small>
      <a
        class="textlink"
        href="https://blue.amazingca.dev/?username=mimonelu.bsky.social"
        rel="noreferrer"
        target="_blank"
      >Bluesky@mimonelu.bsky.social</a>
      <a
        class="textlink"
        href="https://iris.to/mimonelu@mimonelu.github.io"
        rel="noreferrer"
        target="_blank"
      >Nostr@mimonelu</a>
      <a
        class="textlink"
        href="https://twitter.com/mimonelu"
        rel="noreferrer"
        target="_blank"
      >Twitter@mimonelu</a>
    </footer>
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
  text-align: center;
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

footer {
  display: flex;
  align-items: center;
  flex-direction: column;
  grid-gap: 1rem;
}
</style>
