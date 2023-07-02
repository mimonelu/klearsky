<script lang="ts" setup>
import { inject, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string, text: string): void}>()

const props = defineProps<{
  text: string
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  display: boolean
  users?: Array<TTUser>
  text?: string
  timer?: any
  index: number
}>({
  display: false,
  users: undefined,
  text: undefined,
  timer: undefined,
  index: 0,
})

const suggestButtons = ref(null)

let textarea: null | HTMLTextAreaElement = null
let startIndex = - 1
let endIndex = - 1

watch(() => props.text, (value: string) => {
  textarea = document.activeElement as null | HTMLTextAreaElement
  if (textarea == null) {
    resetState()
    return
  }
  const index = textarea.selectionEnd ?? - 1
  if (index === - 1) {
    resetState()
    return
  }
  const frontText = value.substring(0, index)
  const backText = value.substring(index)
  const frontMatch = frontText.match(/(?:^|\s)@([^\s]*)$/)
  const backMatch = backText.match(/^([\w.]*)/)
  if (frontMatch == null || backMatch == null) {
    resetState()
    return
  }
  state.text = frontMatch[1] + backMatch[1]
  if (state.text === "") {
    resetState()
    return
  }
  startIndex = frontMatch.index ?? - 1
  endIndex = startIndex + state.text.length
  state.display = true
  window.addEventListener("click", resetState)
  window.addEventListener("keydown", onKeyDown)
  window.addEventListener("keyup", onKeyUp)

  if (state.timer != null) {
    clearTimeout(state.timer)
    state.timer = undefined
  }
  state.timer = setTimeout(async () => {
    if (!state.display || !state.text) return
    const results = await mainState.atp.fetchActorsTypeahead(state.text, CONSTS.limitOfFetchActorsTypeahead)
    if (results instanceof Error) return
    state.users = results
      .filter((user: TTUser) => {
        return user.viewer.brocking == null && !user.viewer.blockedBy
      })
      .sort((a: TTUser, b: TTUser) => {
        const aWeight =
          a.viewer.following != null
            ? 3
            : a.viewer.followedBy != null
              ? 2
              : a.viewer.muted
                ? - 1
                : 0
        const bWeight =
          b.viewer.following != null
            ? 3
            : b.viewer.followedBy != null
              ? 2
              : b.viewer.muted
                ? - 1
                : 0
      return aWeight < bWeight ? 1 : aWeight > bWeight ? - 1 : 0
    })
    state.timer = undefined
  }, 500)
})

onBeforeUnmount(resetState)

function resetState () {
  state.display = false
  state.users?.splice(0)
  state.text = undefined
  state.index = 0
  window.removeEventListener("click", resetState)
  window.removeEventListener("keydown", onKeyDown)
  window.removeEventListener("keyup", onKeyUp)
  if (textarea != null) textarea.focus()
}

function onKeyDown (event: KeyboardEvent) {
  switch (event.code) {
    case "Escape": {
      event.preventDefault()
      event.stopPropagation()
      resetState()
      return
    }
    case "Enter": {
      if (state.users == null) break
      event.preventDefault()
      event.stopPropagation()
      selectUser(state.users[state.index])
      return
    }
    case "ArrowUp": {
      event.preventDefault()
      moveSuggestButtonFocus("up")
      return
    }
    case "ArrowDown": {
      event.preventDefault()
      moveSuggestButtonFocus("down")
      return
    }
    default: break
  }
}

function onKeyUp () {
  const element = document.activeElement as null | HTMLTextAreaElement
  if (element == null) {
    resetState()
    return
  }
  if (element.id !== textarea?.id && element.className !== "account-suggest__suggest__item") resetState()
}

function moveSuggestButtonFocus (direction: "up" | "down") {
  if (state.users == null) return
  if (direction === "up") {
    if (-- state.index < 0) state.index = state.users.length - 1
  } else {
    if (++ state.index >= state.users.length) state.index = 0
  }

  /*
  nextTick(() => {
    const focusElement = document.querySelector(".account-suggest__suggest__item[data-focus='true']")
    if (focusElement == null) return
    focusElement.scrollIntoView({
      // behavior: "smooth",
      block: "center",
    })
  })
  */
}

function selectUser (user?: TTUser) {
  if (user == null) return
  if (startIndex !== - 1) {
    const currentStartIndex = startIndex + (startIndex === 0 ? 1 : 2)
    const currentEndIndex = endIndex + (startIndex === 0 ? 1 : 2)
    const text =
      props.text.substring(0, currentStartIndex) +
      user.handle +
      (props.text.charAt(currentEndIndex) === " " ? "" : " ") +
      props.text.substring(currentEndIndex)
    emit("select", text)
  }
  if (textarea != null) textarea.focus()
  nextTick(resetState)
}
</script>

<template>
  <div class="account-suggest">
    <div
      v-if="state.display"
      class="account-suggest__suggest"
    >
      <div
        v-for="user, index of state.users"
        :key="user.did"
        ref="suggestButtons"
        class="account-suggest__suggest__item"
        :data-focus="state.index === index"
        @click.prevent="selectUser(user)"
      >
        <img
          class="account-suggest__suggest__item__avatar"
          alt=""
          loading="lazy"
          :src="user.avatar ?? '/img/void-avatar.png'"
        >
        <div class="account-suggest__suggest__item__display-name">{{ user.displayName }}</div>
        <div class="account-suggest__suggest__item__handle">{{ user.handle }}</div>
        <div
          v-if="user.viewer.following != null"
          class="account-suggest__suggest__item__following"
        >{{ $t("following") }}</div>
        <div
          v-if="user.viewer.followedBy != null"
          class="account-suggest__suggest__item__followed-by"
        >{{ $t("followed") }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-suggest {
  &__suggest {
    background-color: rgb(var(--fg-color));
    border: 1px solid rgba(var(--bg-color), 0.25);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    position: absolute;
    &:empty {
      display: none;
    }

    &__item {
      background-clip: padding-box;
      color: rgb(var(--bg-color));
      cursor: pointer;
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      grid-template-areas:
        "a d d d"
        "a h g b";
      grid-gap: 0 0.5em;
      align-items: center;
      padding: 0.375em 0.75em;
      white-space: nowrap;
      &:not(:last-child) {
        border-bottom: 1px solid rgba(var(--bg-color), 0.25);
      }
      &[data-focus="true"], &:hover {
        background-color: rgba(var(--accent-color), 0.25);
      }

      &__avatar {
        grid-area: a;
        border-radius: var(--border-radius);
        font-size: 2em;
        object-fit: cover;
        min-width: 2rem;
        max-width: 2rem;
        min-height: 2rem;
        max-height: 2rem;
      }

      &__display-name,
      &__handle,
      &__following,
      &__followed-by {
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &__display-name {
        grid-area: d;
        font-size: 0.875em;
        font-weight: bold;
      }

      &__handle {
        grid-area: h;
        color: rgba(var(--bg-color), 0.75);
        font-size: 0.75em;
      }

      &__following,
      &__followed-by {
        color: rgb(var(--accent-color));
        font-size: 0.75em;
      }

      &__following {
        grid-area: g;
      }

      &__followed-by {
        grid-area: b;
      }
    }
  }
}
</style>
